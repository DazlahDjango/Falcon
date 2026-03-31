"""
Renewal Service - Handles subscription renewals
"""

import logging
from django.utils import timezone
from datetime import timedelta

from apps.organisations.models import Subscription
from apps.organisations.constants import SubscriptionStatus

logger = logging.getLogger(__name__)


class RenewalService:
    """
    Service for processing subscription renewals
    """
    
    @classmethod
    def process_auto_renewals(cls):
        """
        Process all subscriptions that are due for auto-renewal today
        
        Returns:
            dict: Summary of processed renewals
        """
        today = timezone.now().date()
        
        renewing_subs = Subscription.objects.filter(
            end_date__date=today,
            auto_renew=True,
            status=SubscriptionStatus.ACTIVE
        )
        
        results = {
            'success': [],
            'failed': [],
            'total': renewing_subs.count()
        }
        
        for subscription in renewing_subs:
            try:
                cls.renew_subscription(subscription)
                results['success'].append(str(subscription.id))
                logger.info(f"Auto-renewed subscription for {subscription.organisation.name}")
            except Exception as e:
                results['failed'].append(str(subscription.id))
                logger.error(f"Failed to renew subscription {subscription.id}: {e}")
        
        return results
    
    @classmethod
    def renew_subscription(cls, subscription):
        """
        Renew a single subscription
        
        Args:
            subscription: Subscription instance
        
        Returns:
            Subscription: Renewed subscription
        """
        # Calculate new end date based on billing cycle
        if subscription.plan and subscription.plan.price_yearly > 0:
            new_end_date = timezone.now() + timedelta(days=365)
        else:
            new_end_date = timezone.now() + timedelta(days=30)
        
        subscription.end_date = new_end_date
        subscription.status = SubscriptionStatus.ACTIVE
        subscription.save()
        
        # TODO: Process payment via Stripe/PayPal
        
        return subscription
    
    @classmethod
    def get_expiring_soon(cls, days=30):
        """
        Get subscriptions expiring in X days
        
        Args:
            days: Number of days threshold
        
        Returns:
            QuerySet: Subscriptions expiring soon
        """
        threshold = timezone.now() + timezone.timedelta(days=days)
        return Subscription.objects.filter(
            end_date__lte=threshold,
            end_date__gt=timezone.now(),
            status=SubscriptionStatus.ACTIVE
        )