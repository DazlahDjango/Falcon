"""
Plan Manager Service - Handles plan upgrades and downgrades
"""

import logging
from django.db import transaction
from django.utils import timezone

from apps.organisations.models import Subscription, Plan
from apps.organisations.constants import SubscriptionStatus

logger = logging.getLogger(__name__)


class PlanManagerService:
    """
    Service for managing subscription plans
    """
    
    @classmethod
    @transaction.atomic
    def upgrade_plan(cls, subscription, new_plan_code):
        """
        Upgrade an organisation's subscription plan
        
        Args:
            subscription: Subscription instance
            new_plan_code: Code of the new plan
        
        Returns:
            Subscription: Updated subscription
        """
        new_plan = Plan.objects.filter(code=new_plan_code, is_active=True).first()
        
        if not new_plan:
            logger.error(f"Plan not found: {new_plan_code}")
            return None
        
        if subscription.plan and subscription.plan.code == new_plan_code:
            logger.warning(f"Already on plan: {new_plan_code}")
            return subscription
        
        old_plan = subscription.plan
        
        # Calculate prorated amount if needed
        prorated_amount = cls._calculate_prorated_amount(subscription, new_plan)
        
        # Update subscription
        subscription.plan = new_plan
        subscription.plan_type = new_plan_code
        
        # If subscription is active, extend end date
        if subscription.status == SubscriptionStatus.ACTIVE:
            # For now, keep the same end date
            pass
        
        subscription.save()
        
        logger.info(f"Upgraded {subscription.organisation.name} from {old_plan} to {new_plan}")
        return subscription
    
    @classmethod
    @transaction.atomic
    def downgrade_plan(cls, subscription, new_plan_code):
        """
        Downgrade an organisation's subscription plan
        
        Args:
            subscription: Subscription instance
            new_plan_code: Code of the new plan
        
        Returns:
            Subscription: Updated subscription
        """
        new_plan = Plan.objects.filter(code=new_plan_code, is_active=True).first()
        
        if not new_plan:
            logger.error(f"Plan not found: {new_plan_code}")
            return None
        
        # Check if organisation can downgrade (e.g., user count within new plan limits)
        if not cls._can_downgrade(subscription.organisation, new_plan):
            logger.warning(f"Organisation cannot downgrade to {new_plan_code}: user count exceeds limit")
            return None
        
        old_plan = subscription.plan
        subscription.plan = new_plan
        subscription.plan_type = new_plan_code
        subscription.save()
        
        logger.info(f"Downgraded {subscription.organisation.name} from {old_plan} to {new_plan}")
        return subscription
    
    @classmethod
    def _calculate_prorated_amount(cls, subscription, new_plan):
        """Calculate prorated amount for plan change"""
        # TODO: Implement proration logic
        return 0
    
    @classmethod
    def _can_downgrade(cls, organisation, new_plan):
        """Check if organisation can downgrade to new plan"""
        current_users = organisation.get_active_users_count()
        return current_users <= new_plan.max_users