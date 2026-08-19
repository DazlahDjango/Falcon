from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from .base import BaseBillingModel
from ..managers import InvoiceManager

class Invoice(BaseBillingModel):
    objects = InvoiceManager()
    STATUS_DRAFT = 'draft'
    STATUS_PENDING = 'pending'
    STATUS_PAID = 'paid'
    STATUS_OVERDUE = 'overdue'
    STATUS_CANCELLED = 'cancelled'
    STATUS_REFUNDED = 'refunded'
    STATUS_CHOICES = [
        (STATUS_DRAFT, 'Draft'),
        (STATUS_PENDING, 'Pending'),
        (STATUS_PAID, 'Paid'),
        (STATUS_OVERDUE, 'Overdue'),
        (STATUS_CANCELLED, 'Cancelled'),
        (STATUS_REFUNDED, 'Refunded'),
    ]
    tenant_id = models.UUIDField(_('tenant ID'), db_index=True)
    subscription = models.ForeignKey(
        'billing.Subscription',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='invoices',
        verbose_name=_('subscription')
    )
    invoice_number = models.CharField(_('invoice number'), max_length=50, unique=True, db_index=True)
    paystack_invoice_id = models.CharField(_('PayStack invoice ID'), max_length=100, blank=True, db_index=True)
    invoice_date = models.DateTimeField(_('invoice date'), default=timezone.now, db_index=True)
    due_date = models.DateTimeField(_('due date'), db_index=True)
    subtotal = models.PositiveIntegerField(_('subtotal'), help_text="Subtotal in smallest currency unit")
    tax_rate = models.DecimalField(_('tax rate'), max_digits=5, decimal_places=2, default=0.16, help_text="VAT rate as percentage")
    tax_amount = models.PositiveIntegerField(_('tax amount'), help_text="Tax amount in smallest currency unit")
    total_amount = models.PositiveIntegerField(_('total amount'), help_text="Total amount (subtotal + tax)")
    currency = models.CharField(_('currency'), max_length=3, default='KES')
    status = models.CharField(_('status'), max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING, db_index=True)
    paid_at = models.DateTimeField(_('paid at'), null=True, blank=True)
    line_items = models.JSONField(_('line items'), default=list, help_text="List of invoice line items")
    pdf_url = models.URLField(_('PDF URL'), blank=True, help_text="URL to generated invoice PDF")
    pdf_generated_at = models.DateTimeField(_('PDF generated at'), null=True, blank=True)
    notes = models.TextField(_('notes'), blank=True)
    metadata = models.JSONField(_('metadata'), default=dict, blank=True)
    class Meta:
        db_table = 'billing_invoice'
        verbose_name = _('invoice')
        verbose_name_plural = _('invoices')
        ordering = ['-invoice_date']
        indexes = [
            models.Index(fields=['invoice_number']),
            models.Index(fields=['tenant_id', 'status']),
            models.Index(fields=['due_date', 'status']),
            models.Index(fields=['invoice_date']),
        ]

    def __str__(self):
        return f"Invoice {self.invoice_number} - {self.status}"

    @property
    def is_paid(self):
        return self.status == self.STATUS_PAID

    @property
    def is_overdue(self):
        return timezone.now() > self.due_date and self.status == self.STATUS_PENDING

    @property
    def total_display(self):
        return f"{self.currency} {self.total_amount / 100:.2f}"

    @property
    def subtotal_display(self):
        return f"{self.currency} {self.subtotal / 100:.2f}"

    def mark_paid(self):
        """Mark invoice as paid."""
        self.status = self.STATUS_PAID
        self.paid_at = timezone.now()
        self.save(update_fields=['status', 'paid_at', 'updated_at'])

    def mark_overdue(self):
        """Mark invoice as overdue."""
        if self.status == self.STATUS_PENDING and timezone.now() > self.due_date:
            self.status = self.STATUS_OVERDUE
            self.save(update_fields=['status', 'updated_at'])

    def generate_pdf(self):
        """Generate PDF for invoice."""
        from django.core.files.base import ContentFile
        from io import BytesIO
        from reportlab.lib.pagesizes import A4
        from reportlab.pdfgen import canvas
        pass

    @classmethod
    def generate_invoice_number(cls, tenant_id):
        """Generate unique invoice number atomically."""
        from django.utils import timezone
        from django.db import transaction
        
        prefix = "FALCON"
        year = timezone.now().strftime("%Y")
        month = timezone.now().strftime("%m")
        prefix_pattern = f"{prefix}-{year}{month}"
        
        with transaction.atomic():
            last_invoice = cls.objects.all_including_deleted().select_for_update().filter(invoice_number__startswith=prefix_pattern).order_by('-invoice_number').first()
            
            new_number = 1
            if last_invoice:
                try:
                    last_number = int(last_invoice.invoice_number.split('-')[-1])
                    new_number = last_number + 1
                except (ValueError, IndexError):
                    new_number = 1
            
            return f"{prefix_pattern}-{new_number:06d}"