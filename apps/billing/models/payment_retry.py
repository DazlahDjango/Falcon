from django.db import models
from django.utils.translation import gettext_lazy as _
from .base import BaseBillingModel

class FailedPaymentRetry(BaseBillingModel):
    RETRY_STATUS_PENDING = 'pending'
    RETRY_STATUS_PROCESSING = 'processing'
    RETRY_STATUS_SUCCESS = 'success'
    RETRY_STATUS_FAILED = 'failed'
    RETRY_STATUS_SKIPPED = 'skipped'
    RETRY_STATUS_CHOICES = [
        (RETRY_STATUS_PENDING, 'Pending'),
        (RETRY_STATUS_PROCESSING, 'Processing'),
        (RETRY_STATUS_SUCCESS, 'Success'),
        (RETRY_STATUS_FAILED, 'Failed'),
        (RETRY_STATUS_SKIPPED, 'Skipped'),
    ]

    tenant_id = models.UUIDField(_('tenant ID'), db_index=True)
    subscription = models.ForeignKey('billing.Subscription', on_delete=models.CASCADE, related_name='payment_retries', verbose_name=_('subscription'))
    transaction = models.ForeignKey('billing.Transaction', on_delete=models.SET_NULL, null=True, blank=True, related_name='payment_retries')
    invoice = models.ForeignKey('billing.Invoice', on_delete=models.SET_NULL, null=True, blank=True, related_name='payment_retries')
    retry_number = models.PositiveSmallIntegerField(_('retry number'))
    scheduled_at = models.DateTimeField(_('scheduled at'), db_index=True)
    attempted_at = models.DateTimeField(_('attempted at'), null=True, blank=True)
    status = models.CharField(_('status'), max_length=20, choices=RETRY_STATUS_CHOICES, default=RETRY_STATUS_PENDING, db_index=True)
    error_message = models.TextField(_('error message'), blank=True)
    paystack_response = models.JSONField(_('PayStack response'), default=dict, blank=True)
    base_delay_hours = models.PositiveSmallIntegerField(_('base delay hours'), default=24)
    current_backoff_hours = models.PositiveSmallIntegerField(_('current backoff hours'), null=True)

    class Meta:
        db_table = 'billing_failed_payment_retry'
        verbose_name = _('failed payment retry')
        verbose_name_plural = _('failed payment retries')
        ordering = ['scheduled_at']
        indexes = [
            models.Index(fields=['subscription', 'status']),
            models.Index(fields=['scheduled_at', 'status']),
        ]

    def __str__(self):
        return f"Retry #{self.retry_number} for {self.subscription.subscription_code}"