from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator
from decimal import Decimal
from .base import BillingBaseModel
from .subscription import Subscription
from apps.tenant.models.base import BaseModel

class Invoice(BaseModel):
    STATUS_DRAFT = 'draft'
    STATUS_OPEN = 'open'
    STATUS_PAID = 'paid'
    STATUS_UNCOLLECTIBLE = 'uncollectible'
    STATUS_VOID = 'void'
    STATUS_CHOICES = [
        (STATUS_DRAFT, 'Draft'),
        (STATUS_OPEN, 'Open'),
        (STATUS_PAID, 'Paid'),
        (STATUS_UNCOLLECTIBLE, 'Uncollectible'),
        (STATUS_VOID, 'Void'),
    ]
    subscription = models.ForeignKey(Subscription, on_delete=models.CASCADE, related_name='invoices')
    tenant = models.ForeignKey('tenant.Client', on_delete=models.CASCADE, related_name='invoices')
    stripe_invoice_id = models.CharField(_('Stripe invoice ID'), max_length=100, unique=True, db_index=True)
    stripe_payment_intent_id = models.CharField(_('Stripe payment intent ID'), max_length=100, blank=True)
    invoice_number = models.CharField(_('invoice number'), max_length=50, db_index=True)
    status = models.CharField(_('status'), max_length=20, choices=STATUS_CHOICES, default=STATUS_OPEN, db_index=True)
    amount_due = models.DecimalField(_('amount due'), max_digits=10, decimal_places=2)
    amount_paid = models.DecimalField(_('amount paid'), max_digits=10, decimal_places=2, default=0)
    amount_remaining = models.DecimalField(_('amount remaining'), max_digits=10, decimal_places=2)
    currency = models.CharField(_('currency'), max_length=3, default='KES')
    invoice_date = models.DateTimeField(_('invoice date'), db_index=True)
    due_date = models.DateTimeField(_('due date'), null=True, blank=True)
    period_start = models.DateTimeField(_('period start'))
    period_end = models.DateTimeField(_('period end'))
    invoice_pdf_url = models.URLField(_('invoice PDF URL'), max_length=500, blank=True)
    metadata = models.JSONField(_('metadata'), default=dict, blank=True)
    class Meta:
        db_table = 'billing_invoice'
        verbose_name = _('invoice')
        verbose_name_plural = _('invoices')
        ordering = ['-invoice_date']
        indexes = [
            models.Index(fields=['tenant', 'status']),
            models.Index(fields=['invoice_number']),
            models.Index(fields=['invoice_date']),
            models.Index(fields=['due_date']),
        ]
    def __str__(self):
        return f"Invoice {self.invoice_number} - {self.tenant.name} ({self.status})"

    @property
    def is_paid(self) -> bool:
        return self.status == self.STATUS_PAID

    @property
    def is_overdue(self) -> bool:
        if self.due_date and self.status != self.STATUS_PAID:
            return timezone.now() > self.due_date
        return False

class InvoiceLineItem(BillingBaseModel):
    LINE_TYPE_SUBSCRIPTION = 'subscription'
    LINE_TYPE_TAX = 'tax'
    LINE_TYPE_DISCOUNT = 'discount'
    LINE_TYPE_ADJUSTMENT = 'adjustment'
    LINE_TYPE_ONE_TIME = 'one_time'
    LINE_TYPE_CHOICES = [
        (LINE_TYPE_SUBSCRIPTION, 'Subscription'),
        (LINE_TYPE_TAX, 'Tax'),
        (LINE_TYPE_DISCOUNT, 'Discount'),
        (LINE_TYPE_ADJUSTMENT, 'Adjustment'),
        (LINE_TYPE_ONE_TIME, 'One Time'),
    ]
    invoice = models.ForeignKey('billing.Invoice', on_delete=models.CASCADE, related_name='line_items', verbose_name=_('invoice'))
    line_type = models.CharField(_('line type'), max_length=20, choices=LINE_TYPE_CHOICES, default=LINE_TYPE_SUBSCRIPTION)
    description = models.CharField(_('description'), max_length=500)
    quantity = models.DecimalField(_('quantity'), max_digits=10, decimal_places=2, default=1, validators=[MinValueValidator(Decimal('0'))])
    unit_amount = models.DecimalField(_('unit amount'), max_digits=10, decimal_places=2, validators=[MinValueValidator(Decimal('0'))])
    amount = models.DecimalField(_('amount'), max_digits=10, decimal_places=2)
    tax_rate = models.DecimalField(_('tax rate'), max_digits=5, decimal_places=2, default=Decimal('0.00'))
    tax_amount = models.DecimalField(_('tax amount'), max_digits=10, decimal_places=2, default=Decimal('0.00'))
    discount_rate = models.DecimalField(_('discount rate'), max_digits=5, decimal_places=2, default=Decimal('0.00'))
    discount_amount = models.DecimalField(_('discount amount'), max_digits=10, decimal_places=2, default=Decimal('0.00'))
    stripe_price_id = models.CharField(_('Stripe price ID'), max_length=100, blank=True)
    stripe_line_item_id = models.CharField(_('Stripe line item ID'),max_length=100,blank=True,db_index=True)
    period_start = models.DateTimeField(_('period start'), null=True, blank=True)
    period_end = models.DateTimeField(_('period end'), null=True, blank=True)
    metadata = models.JSONField(_('metadata'), default=dict, blank=True)
    
    class Meta:
        db_table = 'billing_invoice_line_item'
        verbose_name = _('invoice line item')
        verbose_name_plural = _('invoice line items')
        ordering = ['id']
        indexes = [
            models.Index(fields=['invoice']),
            models.Index(fields=['line_type']),
            models.Index(fields=['stripe_line_item_id']),
        ]
    
    def __str__(self):
        return f"{self.description} - {self.amount}"
    
    @property
    def subtotal(self) -> Decimal:
        return self.unit_amount * self.quantity
    
    @property
    def total(self) -> Decimal:
        total = self.amount
        if self.discount_amount:
            total -= self.discount_amount
        if self.tax_amount:
            total += self.tax_amount
        return total
    
    @property
    def formatted_unit_amount(self) -> str:
        from billing.utils.formatters import format_currency
        return format_currency(self.unit_amount, self.invoice.currency if self.invoice else 'KES')