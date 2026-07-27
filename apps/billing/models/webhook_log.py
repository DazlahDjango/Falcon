from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from .base import BaseBillingModel

class WebhookEventLog(BaseBillingModel):
    EVENT_CHARGE_SUCCESS = 'charge.success'
    EVENT_SUBSCRIPTION_CREATE = 'subscription.create'
    EVENT_SUBSCRIPTION_DISABLE = 'subscription.disable'
    EVENT_SUBSCRIPTION_ENABLE = 'subscription.enable'
    EVENT_INVOICE_CREATE = 'invoice.create'
    EVENT_INVOICE_UPDATE = 'invoice.update'
    EVENT_INVOICE_PAYMENT_FAILED = 'invoice.payment_failed'
    EVENT_PAYMENTREQUEST_SUCCESS = 'paymentrequest.success'
    EVENT_CHOICES = [
        (EVENT_CHARGE_SUCCESS, 'Charge Success'),
        (EVENT_SUBSCRIPTION_CREATE, 'Subscription Create'),
        (EVENT_SUBSCRIPTION_DISABLE, 'Subscription Disable'),
        (EVENT_SUBSCRIPTION_ENABLE, 'Subscription Enable'),
        (EVENT_INVOICE_CREATE, 'Invoice Create'),
        (EVENT_INVOICE_UPDATE, 'Invoice Update'),
        (EVENT_INVOICE_PAYMENT_FAILED, 'Invoice Payment Failed'),
        (EVENT_PAYMENTREQUEST_SUCCESS, 'Payment Request Success'),
    ]
    PROCESSING_STATUS_PENDING = 'pending'
    PROCESSING_STATUS_PROCESSED = 'processed'
    PROCESSING_STATUS_FAILED = 'failed'
    PROCESSING_STATUS_DUPLICATE = 'duplicate'
    PROCESSING_STATUS_CHOICES = [
        (PROCESSING_STATUS_PENDING, 'Pending'),
        (PROCESSING_STATUS_PROCESSED, 'Processed'),
        (PROCESSING_STATUS_FAILED, 'Failed'),
        (PROCESSING_STATUS_DUPLICATE, 'Duplicate'),
    ]
    tenant_id = models.UUIDField(_('tenant ID'), null=True, blank=True, db_index=True)
    event_type = models.CharField(_('event type'), max_length=100, db_index=True, choices=EVENT_CHOICES)
    event_idempotency_key = models.CharField(_('idempotency key'), max_length=255, unique=True, db_index=True, help_text="Unique key from PayStack for idempotency")
    paystack_event_id = models.CharField(_('PayStack event ID'), max_length=100, db_index=True)
    paystack_data_id = models.CharField(_('PayStack data ID'), max_length=100, blank=True, db_index=True)
    processing_status = models.CharField(_('processing status'), max_length=20, choices=PROCESSING_STATUS_CHOICES, default=PROCESSING_STATUS_PENDING, db_index=True)
    raw_payload = models.JSONField(_('raw payload'), help_text="Original webhook payload")
    processed_at = models.DateTimeField(_('processed at'), null=True, blank=True)
    processing_error = models.TextField(_('processing error'), blank=True)
    retry_count = models.PositiveSmallIntegerField(_('retry count'), default=0)
    last_retry_at = models.DateTimeField(_('last retry at'), null=True, blank=True)
    signature_valid = models.BooleanField(_('signature valid'), default=False)
    signature_error = models.CharField(_('signature error'), max_length=200, blank=True)
    related_transaction = models.ForeignKey(
        'billing.Transaction',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='webhook_events',
        verbose_name=_('related transaction')
    )
    related_subscription = models.ForeignKey(
        'billing.Subscription',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='webhook_events',
        verbose_name=_('related subscription')
    )
    next_retry_at = models.DateTimeField(_('next retry at'), null=True, blank=True)
    max_retries = models.PositiveSmallIntegerField(_('max retries'), default=3)
    retry_delay_minutes = models.PositiveSmallIntegerField(
        _('retry delay minutes'),
        default=5,
        help_text=_('Minutes to wait before retry')
    )
    class Meta:
        db_table = 'billing_webhook_event_log'
        verbose_name = _('webhook event log')
        verbose_name_plural = _('webhook event logs')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['event_type', 'processing_status']),
            models.Index(fields=['event_idempotency_key']),
            models.Index(fields=['paystack_event_id']),
            models.Index(fields=['processed_at']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"Webhook {self.event_type} - {self.processing_status}"

    @property
    def is_processed(self):
        return self.processing_status == self.PROCESSING_STATUS_PROCESSED

    @property
    def is_duplicate(self):
        return self.processing_status == self.PROCESSING_STATUS_DUPLICATE

    def mark_processed(self, related_transaction=None, related_subscription=None):
        """Mark webhook as processed."""
        self.processing_status = self.PROCESSING_STATUS_PROCESSED
        self.processed_at = timezone.now()
        if related_transaction:
            self.related_transaction = related_transaction
        if related_subscription:
            self.related_subscription = related_subscription
        self.save(update_fields=['processing_status', 'processed_at', 'related_transaction', 'related_subscription', 'updated_at'])

    def mark_failed(self, error_message=None):
        """Mark webhook processing as failed."""
        self.processing_status = self.PROCESSING_STATUS_FAILED
        if error_message:
            self.processing_error = error_message
        self.save(update_fields=['processing_status', 'processing_error', 'updated_at'])

    def mark_duplicate(self):
        """Mark webhook as duplicate (idempotency)."""
        self.processing_status = self.PROCESSING_STATUS_DUPLICATE
        self.save(update_fields=['processing_status', 'updated_at'])

    def increment_retry(self):
        """Increment retry count for this webhook."""
        self.retry_count += 1
        self.last_retry_at = timezone.now()
        self.save(update_fields=['retry_count', 'last_retry_at', 'updated_at'])

    def schedule_retry(self, delay_minutes=None):
        """Schedule a retry for failed webhook."""
        from django.utils import timezone
        from datetime import timedelta
        
        if self.retry_count >= self.max_retries:
            self.processing_status = self.PROCESSING_STATUS_FAILED
            self.processing_error = f"Max retries ({self.max_retries}) exceeded"
            self.save()
            return False
        
        self.retry_count += 1
        self.last_retry_at = timezone.now()
        
        delay = delay_minutes or self.retry_delay_minutes * (2 ** (self.retry_count - 1))
        self.next_retry_at = timezone.now() + timedelta(minutes=delay)
        self.processing_status = self.PROCESSING_STATUS_PENDING
        
        self.save()
        return True