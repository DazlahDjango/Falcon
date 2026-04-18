"""
Activity Logs Service - Tracks organisation activities
"""

import logging
from django.utils import timezone
from django.db import transaction

logger = logging.getLogger(__name__)


class ActivityLogsService:
    """
    Service for logging and retrieving organisation activities
    """
    
    @classmethod
    @transaction.atomic
    def log_activity(cls, organisation, action, user=None, details=None, 
                     model_name=None, object_id=None, object_repr=None,
                     ip_address=None, user_agent=None):
        """
        Log an activity for an organisation
        
        Args:
            organisation: Organisation instance
            action: Action type (created, updated, deleted, etc.)
            user: User who performed the action (optional)
            details: Additional details about the action
            model_name: Name of the model affected
            object_id: ID of the object affected
            object_repr: String representation of the object
            ip_address: IP address of the requester
            user_agent: User agent of the requester
        """
        try:
            from apps.organisations.models import OrganisationActivity
            
            activity = OrganisationActivity.objects.create(
                organisation=organisation,
                action=action,
                user_id=str(user.id) if user and hasattr(user, 'id') else None,
                user_email=user.email if user and hasattr(user, 'email') else None,
                model_name=model_name,
                object_id=str(object_id) if object_id else None,
                object_repr=object_repr or '',
                changes=details or {},
                ip_address=ip_address,
                user_agent=user_agent,
            )
            logger.info(f"Activity logged: {action} for {organisation.name}")
            return activity
        except Exception as e:
            logger.error(f"Failed to log activity: {e}")
            return None
    
    @classmethod
    def get_activity_history(cls, organisation, limit=50, action=None, 
                              start_date=None, end_date=None):
        """
        Get activity history for an organisation
        
        Args:
            organisation: Organisation instance
            limit: Maximum number of records to return
            action: Filter by specific action
            start_date: Filter activities after this date
            end_date: Filter activities before this date
        """
        from apps.organisations.models import OrganisationActivity
        
        queryset = OrganisationActivity.objects.filter(
            organisation=organisation
        ).order_by('-created_at')
        
        if action:
            queryset = queryset.filter(action=action)
        
        if start_date:
            queryset = queryset.filter(created_at__gte=start_date)
        
        if end_date:
            queryset = queryset.filter(created_at__lte=end_date)
        
        return queryset[:limit]
    
    @classmethod
    def get_user_activities(cls, user, organisation=None, limit=50):
        """
        Get activities for a specific user
        """
        from apps.organisations.models import OrganisationActivity
        
        queryset = OrganisationActivity.objects.filter(
            user_id=str(user.id)
        ).order_by('-created_at')
        
        if organisation:
            queryset = queryset.filter(organisation=organisation)
        
        return queryset[:limit]
    
    @classmethod
    def get_activity_summary(cls, organisation, days=30):
        """
        Get summary of activities for the last X days
        """
        from django.utils import timezone
        from datetime import timedelta
        from django.db.models import Count
        
        start_date = timezone.now() - timedelta(days=days)
        
        summary = OrganisationActivity.objects.filter(
            organisation=organisation,
            created_at__gte=start_date
        ).values('action').annotate(
            count=Count('id')
        ).order_by('-count')
        
        return {
            'period_days': days,
            'start_date': start_date,
            'end_date': timezone.now(),
            'total_activities': OrganisationActivity.objects.filter(
                organisation=organisation,
                created_at__gte=start_date
            ).count(),
            'by_action': {item['action']: item['count'] for item in summary}
        }
    
    # ============================================================
    # Convenience methods for common actions
    # ============================================================
    
    @classmethod
    def log_organisation_creation(cls, organisation, user=None, request=None):
        """Log organisation creation"""
        return cls.log_activity(
            organisation=organisation,
            action='created',
            user=user,
            details={'name': organisation.name, 'sector': organisation.sector},
            model_name='Organisation',
            object_id=organisation.id,
            object_repr=organisation.name,
            ip_address=cls._get_ip(request),
            user_agent=cls._get_user_agent(request),
        )
    
    @classmethod
    def log_organisation_update(cls, organisation, changes, user=None, request=None):
        """Log organisation update"""
        return cls.log_activity(
            organisation=organisation,
            action='updated',
            user=user,
            details=changes,
            model_name='Organisation',
            object_id=organisation.id,
            object_repr=organisation.name,
            ip_address=cls._get_ip(request),
            user_agent=cls._get_user_agent(request),
        )
    
    @classmethod
    def log_subscription_change(cls, organisation, old_plan, new_plan, user=None, request=None):
        """Log subscription plan change"""
        return cls.log_activity(
            organisation=organisation,
            action='subscription_changed',
            user=user,
            details={'old_plan': old_plan, 'new_plan': new_plan},
            model_name='Subscription',
            object_id=organisation.id,
            object_repr=f"{organisation.name} subscription",
            ip_address=cls._get_ip(request),
            user_agent=cls._get_user_agent(request),
        )
    
    @classmethod
    def log_domain_added(cls, organisation, domain_name, user=None, request=None):
        """Log domain addition"""
        return cls.log_activity(
            organisation=organisation,
            action='domain_added',
            user=user,
            details={'domain_name': domain_name},
            model_name='Domain',
            object_repr=domain_name,
            ip_address=cls._get_ip(request),
            user_agent=cls._get_user_agent(request),
        )
    
    @classmethod
    def log_domain_verified(cls, organisation, domain_name, user=None, request=None):
        """Log domain verification"""
        return cls.log_activity(
            organisation=organisation,
            action='domain_verified',
            user=user,
            details={'domain_name': domain_name},
            model_name='Domain',
            object_repr=domain_name,
            ip_address=cls._get_ip(request),
            user_agent=cls._get_user_agent(request),
        )
    
    @classmethod
    def log_settings_changed(cls, organisation, changes, user=None, request=None):
        """Log settings changes"""
        return cls.log_activity(
            organisation=organisation,
            action='settings_changed',
            user=user,
            details=changes,
            model_name='OrganisationSettings',
            object_id=organisation.id,
            object_repr=f"{organisation.name} settings",
            ip_address=cls._get_ip(request),
            user_agent=cls._get_user_agent(request),
        )
    
    @classmethod
    def log_branding_updated(cls, organisation, changes, user=None, request=None):
        """Log branding updates"""
        return cls.log_activity(
            organisation=organisation,
            action='branding_updated',
            user=user,
            details=changes,
            model_name='Branding',
            object_id=organisation.id,
            object_repr=f"{organisation.name} branding",
            ip_address=cls._get_ip(request),
            user_agent=cls._get_user_agent(request),
        )
    
    @classmethod
    def _get_ip(cls, request):
        """Get IP address from request"""
        if not request:
            return None
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0]
        return request.META.get('REMOTE_ADDR')
    
    @classmethod
    def _get_user_agent(cls, request):
        """Get user agent from request"""
        if not request:
            return ''
        return request.META.get('HTTP_USER_AGENT', '')[:500]