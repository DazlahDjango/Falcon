import logging
from typing import Dict, Any
from django.utils import timezone
from django.db import transaction
from datetime import timedelta
from ...models import Subscription, FailedPaymentRetry, BillingAuditLog
from ..payment.retry import PaymentRetryService

logger = logging.getLogger(__name__)

class GracePeriodService:
    def __init__(self):
        self.retry_service = PaymentRetryService()

    @transaction.atomic
    def start_grace_period(self, subscription: Subscription, days: int = 7) -> Subscription:
        subscription.status = Subscription.STATUS_PAST_DUE
        subscription.grace_period_ends_at = timezone.now() + timedelta(days=days)
        subscription.save()
        for i in range(1, 4):
            self.retry_service.schedule_retry(subscription, i)
        BillingAuditLog.log_action(user=None, tenant_id=subscription.tenant_id, action='update', resource_type='subscription', resource_id=subscription.id, after={'status': 'past_due', 'grace_period_ends_at': subscription.grace_period_ends_at.isoformat()}, metadata={'grace_period_days': days})
        logger.info(f"Started {days}-day grace period for subscription {subscription.subscription_code}")
        return subscription

    def check_grace_period_expiry(self) -> Dict[str, int]:
        stats = {'expired': 0, 'suspended': 0, 'reactivated': 0}
        expired_grace = Subscription.objects.filter(status=Subscription.STATUS_PAST_DUE, grace_period_ends_at__lt=timezone.now())
        for subscription in expired_grace:
            stats['expired'] += 1
            pending_retries = FailedPaymentRetry.objects.filter(subscription=subscription, status__in=[FailedPaymentRetry.RETRY_STATUS_PENDING, FailedPaymentRetry.RETRY_STATUS_PROCESSING])
            if pending_retries.exists():
                stats['reactivated'] += 1
                subscription.status = Subscription.STATUS_ACTIVE
                subscription.grace_period_ends_at = None
                subscription.save()
            else:
                stats['suspended'] += 1
                subscription.suspend(reason='payment_failed')
        return stats

    def can_reactivate(self, subscription: Subscription) -> bool:
        if subscription.status != Subscription.STATUS_PAST_DUE:
            return False
        if subscription.grace_period_ends_at and subscription.grace_period_ends_at < timezone.now():
            return False
        return True