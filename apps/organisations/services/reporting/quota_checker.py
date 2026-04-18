"""
Quota Checker Service - Enforces organisation quotas
"""

import logging

logger = logging.getLogger(__name__)


class QuotaCheckerService:
    """
    Service for checking organisation quotas
    """
    
    @classmethod
    def check_user_limit(cls, organisation):
        """Check if organisation has reached user limit"""
        if not hasattr(organisation, 'subscription') or not organisation.subscription.plan:
            return True
        
        plan = organisation.subscription.plan
        current_users = organisation.get_active_users_count()
        return current_users < plan.max_users 