from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from .base import BaseBillingModel
from ..managers import TransactionManager

class Transaction(BaseBillingModel):
    objects = TransactionManager()
    STATUS_PENDING = 'pending'
    STATUS_SUCCESS = 'success'
    STATUS_FAILED = 'failed'
    STATUS_REFUNDED = 'refunded'
    STATUS_DISPUTED = 'disputed'
    STATUS_CHOICES = [
        (STATUS_PENDING, 'Pending'),
        (STATUS_SUCCESS, 'Success'),
        (STATUS_FAILED, 'Failed'),
        (STATUS_REFUNDED, 'Refunded'),
        (STATUS_DISPUTED, 'Disputed'),
    ]
    TYPE_SUBSCRIPTION = 'subscription'
    TYPE_RENEWAL = 'renewal'
    TYPE_UPGRADE = 'upgrade'
    TYPE_REFUND = 'refund'
    TYPE_ONE_TIME = 'one_time'
    TYPE_CHOICES = [
        (TYPE_SUBSCRIPTION, 'Subscription Creation'),
        (TYPE_RENEWAL, 'Renewal'),
        (TYPE_UPGRADE, 'Upgrade'),
        (TYPE_REFUND, 'Refund'),
        (TYPE_ONE_TIME, 'One Time Payment'),
    ]
    tenant_id = models.UUIDField(_('tenant ID'), db_index=True)
    subscription = models.ForeignKey(
        'billing.Subscription',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='transactions',
        verbose_name=_('subscription')
    )
    invoice = models.OneToOneField(
        'billing.Invoice',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='transaction',
        verbose_name=_('invoice')
    )
    reference = models.CharField(_('reference'), max_length=100, unique=True, db_index=True, help_text="Unique transaction reference")
    paystack_reference = models.CharField(_('PayStack reference'), max_length=100, blank=True, db_index=True)
    paystack_access_code = models.CharField(_('PayStack access code'), max_length=100, blank=True)
    transaction_type = models.CharField(_('transaction type'), max_length=20, choices=TYPE_CHOICES, default=TYPE_SUBSCRIPTION)
    amount = models.PositiveIntegerField(_('amount'), help_text="Amount in smallest currency unit")
    currency = models.CharField(_('currency'), max_length=3, default='KES')
    tax_amount = models.PositiveIntegerField(_('tax amount'), default=0, help_text="Tax amount in smallest currency unit")
    total_amount = models.PositiveIntegerField(_('total amount'), help_text="Amount + tax")
    status = models.CharField(_('status'), max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING, db_index=True)
    payment_method = models.CharField(_('payment method'), max_length=50, blank=True, help_text="card, bank_transfer, etc.")
    card_last4 = models.CharField(_('card last 4'), max_length=4, blank=True)
    card_brand = models.CharField(_('card brand'), max_length=20, blank=True)
    payment_date = models.DateTimeField(_('payment date'), null=True, blank=True, db_index=True)
    paystack_response = models.JSONField(_('PayStack response'), default=dict, blank=True)
    webhook_payload = models.JSONField(_('webhook payload'), default=dict, blank=True)
    error_message = models.TextField(_('error message'), blank=True)
    retry_count = models.PositiveSmallIntegerField(_('retry count'), default=0)
    metadata = models.JSONField(_('metadata'), default=dict, blank=True)
    class Meta:
        db_table = 'billing_transaction'
        verbose_name = _('transaction')
        verbose_name_plural = _('transactions')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['reference']),
            models.Index(fields=['paystack_reference']),
            models.Index(fields=['tenant_id', 'status']),
            models.Index(fields=['payment_date']),
            models.Index(fields=['subscription', 'status']),
        ]

    def __str__(self):
        return f"Transaction {self.reference} - {self.status}"

    @property
    def is_successful(self):
        return self.status == self.STATUS_SUCCESS

    @property
    def amount_display(self):
        return f"{self.currency} {self.amount / 100:.2f}"

    @property
    def total_display(self):
        return f"{self.currency} {self.total_amount / 100:.2f}"

    def mark_success(self, paystack_reference=None, payment_date=None):
        """Mark transaction as successful."""
        self.status = self.STATUS_SUCCESS
        if paystack_reference:
            self.paystack_reference = paystack_reference
        self.payment_date = payment_date or timezone.now()
        self.save(update_fields=['status', 'paystack_reference', 'payment_date', 'updated_at'])

    def mark_failed(self, error_message=None):
        """Mark transaction as failed."""
        self.status = self.STATUS_FAILED
        if error_message:
            self.error_message = error_message
        self.save(update_fields=['status', 'error_message', 'updated_at'])

    def mark_refunded(self):
        """Mark transaction as refunded."""
        self.status = self.STATUS_REFUNDED
        self.save(update_fields=['status', 'updated_at'])