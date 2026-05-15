from django.db import models
from django.utils import timezone
from datetime import timedelta
from .base import BaseBillingManager

class WebhookLogManager(BaseBillingManager):
    def pending(self):
        """Return pending webhook events."""
        return self.get_queryset().filter(processing_status='pending')
    
    def processed(self):
        """Return processed webhook events."""
        return self.get_queryset().filter(processing_status='processed')
    
    def failed(self):
        """Return failed webhook events."""
        return self.get_queryset().filter(processing_status='failed')
    
    def duplicate(self):
        """Return duplicate webhook events."""
        return self.get_queryset().filter(processing_status='duplicate')
    
    def by_event_type(self, event_type):
        """Filter by event type."""
        return self.get_queryset().filter(event_type=event_type)
    
    def get_by_idempotency_key(self, idempotency_key):
        """Get webhook event by idempotency key."""
        return self.get_queryset().filter(event_idempotency_key=idempotency_key).first()
    
    def get_by_paystack_event_id(self, paystack_event_id):
        """Get webhook event by PayStack event ID."""
        return self.get_queryset().filter(paystack_event_id=paystack_event_id).first()
    
    def has_been_processed(self, idempotency_key):
        """Check if webhook with given idempotency key has been processed."""
        return self.get_queryset().filter(
            event_idempotency_key=idempotency_key,
            processing_status__in=['processed', 'duplicate']
        ).exists()
    
    def get_unprocessed_webhooks(self, minutes_old=5):
        """Get unprocessed webhooks older than specified minutes."""
        cutoff_time = timezone.now() - timedelta(minutes=minutes_old)
        return self.get_queryset().filter(
            processing_status='pending',
            created_at__lt=cutoff_time
        )
    
    def get_failed_webhooks_for_retry(self, max_retries=3):
        """Get failed webhooks that can be retried."""
        return self.get_queryset().filter(
            processing_status='failed',
            retry_count__lt=max_retries
        ).order_by('created_at')
    
    def get_webhook_stats(self, days=30):
        """Get webhook processing statistics for last N days."""
        cutoff_date = timezone.now() - timedelta(days=days)
        
        queryset = self.get_queryset().filter(created_at__gte=cutoff_date)
        
        total = queryset.count()
        if total == 0:
            return {
                'total': 0,
                'processed': 0,
                'failed': 0,
                'duplicate': 0,
                'success_rate': 0.0,
                'by_event_type': {}
            }
        
        processed = queryset.filter(processing_status='processed').count()
        failed = queryset.filter(processing_status='failed').count()
        duplicate = queryset.filter(processing_status='duplicate').count()
        
        # Breakdown by event type
        by_event_type = {}
        for event_type in queryset.values_list('event_type', flat=True).distinct():
            event_count = queryset.filter(event_type=event_type).count()
            event_processed = queryset.filter(event_type=event_type, processing_status='processed').count()
            by_event_type[event_type] = {
                'total': event_count,
                'processed': event_processed,
                'success_rate': (event_processed / event_count * 100) if event_count > 0 else 0
            }
        
        return {
            'total': total,
            'processed': processed,
            'failed': failed,
            'duplicate': duplicate,
            'success_rate': (processed / total * 100) if total > 0 else 0,
            'by_event_type': by_event_type
        }
    
    def get_recent_failed_webhooks(self, limit=10):
        """Get recent failed webhooks."""
        return self.get_queryset().filter(
            processing_status='failed'
        ).order_by('-created_at')[:limit]
    
    def get_duplicate_rate(self, days=30):
        """Calculate duplicate webhook rate."""
        cutoff_date = timezone.now() - timedelta(days=days)
        queryset = self.get_queryset().filter(created_at__gte=cutoff_date)
        
        total = queryset.count()
        if total == 0:
            return 0.0
        
        duplicates = queryset.filter(processing_status='duplicate').count()
        return (duplicates / total) * 100
    
    def cleanup_old_webhooks(self, days=90):
        """
        Delete old webhook logs (soft delete).
        Returns number of records archived.
        """
        cutoff_date = timezone.now() - timedelta(days=days)
        old_webhooks = self.get_queryset().filter(created_at__lt=cutoff_date)
        count = old_webhooks.count()
        
        # Soft delete
        old_webhooks.update(is_deleted=True, deleted_at=timezone.now())
        
        return count