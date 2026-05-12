# billing/models/webhook/event.py (Complete)
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from .base import BillingBaseModel

class WebhookEvent(BillingBaseModel):
    EVENT_SUBSCRIPTION_CREATED = 'customer.subscription.created'
    EVENT_SUBSCRIPTION_UPDATED = 'customer.subscription.updated'
    EVENT_SUBSCRIPTION_DELETED = 'customer.subscription.deleted'
    EVENT_SUBSCRIPTION_TRIAL_WILL_END = 'customer.subscription.trial_will_end'
    EVENT_INVOICE_CREATED = 'invoice.created'
    EVENT_INVOICE_PAID = 'invoice.paid'
    EVENT_INVOICE_PAYMENT_FAILED = 'invoice.payment_failed'
    EVENT_INVOICE_PAYMENT_SUCCEEDED = 'invoice.payment_succeeded'
    EVENT_PAYMENT_INTENT_SUCCEEDED = 'payment_intent.succeeded'
    EVENT_PAYMENT_INTENT_PAYMENT_FAILED = 'payment_intent.payment_failed'
    EVENT_CHECKOUT_SESSION_COMPLETED = 'checkout.session.completed'
    EVENT_CUSTOMER_UPDATED = 'customer.updated'
    EVENT_CUSTOMER_DELETED = 'customer.deleted'
    EVENT_CUSTOMER_SUBSCRIPTION_CREATED = 'customer.subscription.created'
    EVENT_CUSTOMER_SUBSCRIPTION_UPDATED = 'customer.subscription.updated'
    EVENT_CUSTOMER_SUBSCRIPTION_DELETED = 'customer.subscription.deleted'
    EVENT_CHOICES = [
        (EVENT_SUBSCRIPTION_CREATED, 'Subscription Created'),
        (EVENT_SUBSCRIPTION_UPDATED, 'Subscription Updated'),
        (EVENT_SUBSCRIPTION_DELETED, 'Subscription Deleted'),
        (EVENT_SUBSCRIPTION_TRIAL_WILL_END, 'Trial Will End'),
        (EVENT_INVOICE_CREATED, 'Invoice Created'),
        (EVENT_INVOICE_PAID, 'Invoice Paid'),
        (EVENT_INVOICE_PAYMENT_FAILED, 'Payment Failed'),
        (EVENT_INVOICE_PAYMENT_SUCCEEDED, 'Payment Succeeded'),
        (EVENT_PAYMENT_INTENT_SUCCEEDED, 'Payment Intent Succeeded'),
        (EVENT_PAYMENT_INTENT_PAYMENT_FAILED, 'Payment Intent Failed'),
        (EVENT_CHECKOUT_SESSION_COMPLETED, 'Checkout Completed'),
        (EVENT_CUSTOMER_UPDATED, 'Customer Updated'),
        (EVENT_CUSTOMER_DELETED, 'Customer Deleted'),
    ]
    stripe_event_id = models.CharField(_('Stripe event ID'), max_length=100, unique=True, db_index=True)
    event_type = models.CharField(_('event type'), max_length=100, db_index=True, choices=EVENT_CHOICES)
    api_version = models.CharField(_('API version'), max_length=20, blank=True)
    payload = models.JSONField(_('payload'))
    is_processed = models.BooleanField(_('processed'), default=False, db_index=True)
    processed_at = models.DateTimeField(_('processed at'), null=True, blank=True)
    processing_error = models.TextField(_('processing error'), blank=True)
    retry_count = models.PositiveSmallIntegerField(_('retry count'), default=0)
    max_retries = models.PositiveSmallIntegerField(_('max retries'), default=3)
    last_retry_at = models.DateTimeField(_('last retry at'), null=True, blank=True)
    next_retry_at = models.DateTimeField(_('next retry at'), null=True, blank=True)
    related_subscription_id = models.CharField(_('related subscription ID'), max_length=100, blank=True, db_index=True)
    related_invoice_id = models.CharField(_('related invoice ID'), max_length=100, blank=True, db_index=True)
    related_customer_id = models.CharField(_('related customer ID'), max_length=100, blank=True, db_index=True)
    class Meta:
        db_table = 'billing_webhook_event'
        verbose_name = _('webhook event')
        verbose_name_plural = _('webhook events')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['event_type', 'is_processed']),
            models.Index(fields=['created_at']),
            models.Index(fields=['is_processed', 'created_at']),
            models.Index(fields=['next_retry_at']),
            models.Index(fields=['related_subscription_id']),
            models.Index(fields=['related_invoice_id']),
        ]
    
    def __str__(self):
        return f"{self.event_type} - {self.stripe_event_id}"
    
    def mark_processed(self, error: str = None):
        self.is_processed = True
        self.processed_at = timezone.now()
        if error:
            self.processing_error = error
        self.save(update_fields=['is_processed', 'processed_at', 'processing_error'])
    
    def mark_failed(self, error: str):
        self.processing_error = error
        self.save(update_fields=['processing_error'])
    
    def increment_retry(self):
        self.retry_count += 1
        self.last_retry_at = timezone.now()
        if self.retry_count < self.max_retries:
            delay = 60 * (3 ** (self.retry_count - 1))
            self.next_retry_at = timezone.now() + timezone.timedelta(seconds=delay)
        else:
            self.next_retry_at = None
            self.processing_error = f"Max retries ({self.max_retries}) exceeded. Last error: {self.processing_error}"
        self.save(update_fields=['retry_count', 'last_retry_at', 'next_retry_at', 'processing_error'])
    
    def should_retry(self) -> bool:
        return (
            not self.is_processed and
            self.retry_count < self.max_retries and
            (self.next_retry_at is None or timezone.now() >= self.next_retry_at)
        )
    
    @property
    def is_high_priority(self) -> bool:
        priority_events = [
            self.EVENT_INVOICE_PAID,
            self.EVENT_INVOICE_PAYMENT_FAILED,
            self.EVENT_SUBSCRIPTION_DELETED,
            self.EVENT_SUBSCRIPTION_UPDATED,
        ]
        return self.event_type in priority_events
    
    def extract_object_id(self, object_type: str) -> str:
        try:
            if 'data' in self.payload and 'object' in self.payload['data']:
                obj = self.payload['data']['object']
                return obj.get(f'{object_type}_id') or obj.get('id', '')
        except (KeyError, TypeError):
            pass
        return ''