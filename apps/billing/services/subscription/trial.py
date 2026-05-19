import logging
from typing import Optional, Dict, Any
from datetime import timedelta
from django.utils import timezone
from django.db import transaction

from ...models import Subscription, SubscriptionPlan
from ...exceptions import SubscriptionError
from ...utils import is_within_trial_period
from ..audit.logger import audit_logger

logger = logging.getLogger(__name__)


class TrialService:
    """
    Manages trial subscriptions:
    - Trial creation
    - Trial extension
    - Trial expiration handling
    - Trial conversion to paid
    """
    
    DEFAULT_TRIAL_DAYS = 14
    
    @transaction.atomic
    def start_trial(self, tenant_id: str, plan: SubscriptionPlan,
                    trial_days: Optional[int] = None) -> Subscription:
        """
        Start a trial subscription.
        
        Args:
            tenant_id: Tenant UUID
            plan: Subscription plan (should be trial plan or any plan)
            trial_days: Number of trial days (default: 14)
        
        Returns:
            Trial subscription
        """
        trial_days = trial_days or self.DEFAULT_TRIAL_DAYS
        
        from .lifecycle import SubscriptionLifecycleService
        lifecycle = SubscriptionLifecycleService()
        
        subscription = lifecycle.create_subscription(
            tenant_id=tenant_id,
            plan=plan,
            trial_days=trial_days
        )
        
        logger.info(f"Started trial for tenant {tenant_id} for {trial_days} days")
        
        return subscription
    
    @transaction.atomic
    def extend_trial(self, subscription: Subscription, extra_days: int = 7) -> Subscription:
        """
        Extend trial period.
        
        Args:
            subscription: Trial subscription
            extra_days: Number of days to extend
        
        Returns:
            Updated subscription
        """
        if subscription.status != Subscription.STATUS_TRIALING:
            raise SubscriptionError(f"Cannot extend trial for subscription with status {subscription.status}")
        
        subscription.extend_trial(extra_days)
        
        audit_logger.log(
            user=None,
            tenant_id=subscription.tenant_id,
            action='update',
            resource_type='subscription',
            resource_id=subscription.id,
            after={'trial_end_date': subscription.trial_end_date.isoformat()},
            metadata={'action': 'extend_trial', 'extra_days': extra_days}
        )
        
        logger.info(f"Extended trial for subscription {subscription.subscription_code} by {extra_days} days")
        
        return subscription
    
    @transaction.atomic
    def convert_trial_to_paid(self, subscription: Subscription) -> Subscription:
        """
        Convert trial subscription to paid subscription.
        """
        if subscription.status != Subscription.STATUS_TRIALING:
            raise SubscriptionError(f"Cannot convert trial to paid: status is {subscription.status}")
        
        from .lifecycle import SubscriptionLifecycleService
        lifecycle = SubscriptionLifecycleService()
        
        subscription = lifecycle.activate_subscription(subscription)
        
        audit_logger.log(
            user=None,
            tenant_id=subscription.tenant_id,
            action='update',
            resource_type='subscription',
            resource_id=subscription.id,
            after={'status': subscription.status},
            metadata={'action': 'convert_trial_to_paid'}
        )
        
        logger.info(f"Converted trial to paid for subscription {subscription.subscription_code}")
        
        return subscription
    
    def check_trial_expiring_soon(self, days_threshold: int = 3) -> list:
        """
        Check for trials expiring soon.
        
        Returns:
            List of subscriptions with trials expiring soon
        """
        return Subscription.objects.trial_ending_soon(days_threshold)
    
    def process_expired_trials(self) -> int:
        """
        Process all expired trials.
        
        Returns:
            Number of trials processed
        """
        from .lifecycle import SubscriptionLifecycleService
        lifecycle = SubscriptionLifecycleService()
        
        expired_trials = Subscription.objects.expired_trials()
        processed_count = 0
        
        for subscription in expired_trials:
            try:
                if subscription.auto_renew:
                    # Auto-convert to paid
                    self.convert_trial_to_paid(subscription)
                else:
                    # Expire the trial
                    lifecycle.expire_subscription(subscription)
                processed_count += 1
            except Exception as e:
                logger.error(f"Failed to process expired trial {subscription.subscription_code}: {str(e)}")
        
        return processed_count
    
    def get_trial_remaining_days(self, subscription: Subscription) -> int:
        """
        Get remaining trial days.
        """
        if subscription.status != Subscription.STATUS_TRIALING:
            return 0
        
        return subscription.trial_days_remaining
    
    def can_extend_trial(self, subscription: Subscription) -> bool:
        """
        Check if trial can be extended.
        """
        if subscription.status != Subscription.STATUS_TRIALING:
            return False
        
        # Only allow extension once
        if subscription.metadata.get('trial_extended', False):
            return False
        
        # Don't extend if trial has already expired
        if subscription.trial_end_date and subscription.trial_end_date < timezone.now():
            return False
        
        return True