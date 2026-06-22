import logging
from typing import Optional, Dict, Any
from django.utils import timezone
from django.db import transaction
from datetime import timedelta
from ...models import FailedPaymentRetry, Subscription, Transaction, Invoice
from ..decorators import idempotent
from ..circuit_breaker import CircuitBreakerRegistry
from .interface import PaymentProviderInterface
from .paystack_provider import PayStackProvider

logger = logging.getLogger(__name__)

class PaymentRetryService:
    def __init__(self, payment_provider: Optional[PaymentProviderInterface] = None):
        self.payment_provider = payment_provider or PayStackProvider()
        self.circuit_breaker = CircuitBreakerRegistry.get('payment_retry')

    @idempotent('payment_retry')
    def schedule_retry(self, subscription: Subscription, retry_number: int) -> FailedPaymentRetry:
        backoff_hours = self._calculate_backoff(retry_number)
        scheduled_at = timezone.now() + timedelta(hours=backoff_hours)
        retry = FailedPaymentRetry.objects.create(tenant_id=subscription.tenant_id, subscription=subscription, retry_number=retry_number, scheduled_at=scheduled_at, base_delay_hours=24, current_backoff_hours=backoff_hours, status=FailedPaymentRetry.RETRY_STATUS_PENDING)
        logger.info(f"Scheduled retry #{retry_number} for subscription {subscription.subscription_code} at {scheduled_at}")
        return retry

    def _calculate_backoff(self, retry_number: int) -> int:
        return 24 * (2 ** (retry_number - 1))

    def process_pending_retries(self) -> Dict[str, int]:
        stats = {'processed': 0, 'successful': 0, 'failed': 0, 'skipped': 0}
        pending_retries = FailedPaymentRetry.objects.filter(status=FailedPaymentRetry.RETRY_STATUS_PENDING, scheduled_at__lte=timezone.now())
        for retry in pending_retries:
            try:
                with transaction.atomic():
                    result = self.circuit_breaker.call(self._execute_retry, retry)
                    if result:
                        stats['successful'] += 1
                    else:
                        stats['failed'] += 1
                    stats['processed'] += 1
            except Exception as e:
                logger.error(f"Retry execution failed for {retry.id}: {str(e)}")
                retry.status = FailedPaymentRetry.RETRY_STATUS_FAILED
                retry.error_message = str(e)
                retry.save()
                stats['failed'] += 1
        return stats

    def _execute_retry(self, retry: FailedPaymentRetry) -> bool:
        retry.status = FailedPaymentRetry.RETRY_STATUS_PROCESSING
        retry.attempted_at = timezone.now()
        retry.save()
        subscription = retry.subscription
        if not subscription.paystack_authorization_code:
            retry.status = FailedPaymentRetry.RETRY_STATUS_SKIPPED
            retry.error_message = "No authorization code"
            retry.save()
            return False
        try:
            amount = subscription.amount
            result = self.payment_provider.initialize_transaction(email=f"tenant-{subscription.tenant_id}@falconpms.com", amount=amount, reference=f"RETRY_{subscription.subscription_code}_{retry.retry_number}", metadata={'subscription_code': subscription.subscription_code, 'retry_number': retry.retry_number, 'tenant_id': str(subscription.tenant_id)})
            if result.success:
                retry.status = FailedPaymentRetry.RETRY_STATUS_SUCCESS
                retry.save()
                subscription.renew()
                subscription.status = Subscription.STATUS_ACTIVE
                subscription.grace_period_ends_at = None
                subscription.save()
                logger.info(f"Retry #{retry.retry_number} successful for {subscription.subscription_code}")
                return True
            else:
                retry.status = FailedPaymentRetry.RETRY_STATUS_FAILED
                retry.error_message = result.gateway_response.get('message', 'Unknown error')
                retry.save()
                return False
        except Exception as e:
            retry.status = FailedPaymentRetry.RETRY_STATUS_FAILED
            retry.error_message = str(e)
            retry.save()
            raise e