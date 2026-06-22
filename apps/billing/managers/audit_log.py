from django.db import models
from django.utils import timezone
from datetime import timedelta
from .base import BaseBillingManager, TenantAwareManager

class AuditLogManager(TenantAwareManager):
    def by_action(self, action):
        """Filter by action type."""
        return self.get_queryset().filter(action=action)
    
    def by_resource_type(self, resource_type):
        """Filter by resource type."""
        return self.get_queryset().filter(resource_type=resource_type)
    
    def by_user(self, user_id):
        """Filter by user."""
        return self.get_queryset().filter(user_id=user_id)
    
    def by_user_email(self, user_email):
        """Filter by user email."""
        return self.get_queryset().filter(user_email=user_email)
    
    def successful(self):
        """Return successful actions."""
        return self.get_queryset().filter(success=True)
    
    def failed(self):
        """Return failed actions."""
        return self.get_queryset().filter(success=False)
    
    def by_date_range(self, start_date, end_date):
        """Filter by date range."""
        return self.get_queryset().filter(
            created_at__gte=start_date,
            created_at__lte=end_date
        )
    
    def recent(self, days=7):
        """Get audit logs from last N days."""
        cutoff_date = timezone.now() - timedelta(days=days)
        return self.get_queryset().filter(created_at__gte=cutoff_date)
    
    def get_by_resource(self, resource_type, resource_id):
        """Get all audit logs for a specific resource."""
        return self.get_queryset().filter(
            resource_type=resource_type,
            resource_id=str(resource_id)
        ).order_by('-created_at')
    
    def get_by_related_transaction(self, transaction_id):
        """Get audit logs related to a transaction."""
        return self.get_queryset().filter(related_transaction_id=transaction_id)
    
    def get_by_related_subscription(self, subscription_id):
        """Get audit logs related to a subscription."""
        return self.get_queryset().filter(related_subscription_id=subscription_id)
    
    def get_user_activity_summary(self, user_id, days=30):
        """Get activity summary for a specific user."""
        cutoff_date = timezone.now() - timedelta(days=days)
        
        user_logs = self.get_queryset().filter(
            user_id=user_id,
            created_at__gte=cutoff_date
        )
        
        return {
            'total_actions': user_logs.count(),
            'successful': user_logs.filter(success=True).count(),
            'failed': user_logs.filter(success=False).count(),
            'by_action': user_logs.values('action').annotate(count=models.Count('id')),
            'by_resource': user_logs.values('resource_type').annotate(count=models.Count('id')),
            'last_action': user_logs.order_by('-created_at').first(),
        }
    
    def get_tenant_activity_summary(self, tenant_id, days=30):
        """Get activity summary for a tenant."""
        cutoff_date = timezone.now() - timedelta(days=days)
        
        tenant_logs = self.get_queryset().filter(
            tenant_id=tenant_id,
            created_at__gte=cutoff_date
        )
        
        return {
            'total_actions': tenant_logs.count(),
            'successful': tenant_logs.filter(success=True).count(),
            'failed': tenant_logs.filter(success=False).count(),
            'unique_users': tenant_logs.values('user_id').distinct().count(),
            'by_action': tenant_logs.values('action').annotate(count=models.Count('id')),
            'by_resource': tenant_logs.values('resource_type').annotate(count=models.Count('id')),
            'by_user': tenant_logs.values('user_email').annotate(count=models.Count('id')).order_by('-count')[:10],
        }
    
    def get_failed_actions_report(self, days=30):
        """Get report of failed actions."""
        cutoff_date = timezone.now() - timedelta(days=days)
        
        return self.get_queryset().filter(
            success=False,
            created_at__gte=cutoff_date
        ).values(
            'action', 'resource_type', 'error_message'
        ).annotate(
            count=models.Count('id'),
            last_occurrence=models.Max('created_at')
        ).order_by('-count')
    
    def get_changes_for_resource(self, resource_type, resource_id, field_name=None):
        """
        Get change history for a specific resource.
        Optionally filter by specific field.
        """
        logs = self.get_queryset().filter(
            resource_type=resource_type,
            resource_id=str(resource_id)
        ).order_by('created_at')
        
        if field_name:
            # Filter logs where this field changed
            filtered_logs = []
            for log in logs:
                if field_name in log.changes:
                    filtered_logs.append(log)
            return filtered_logs
        
        return logs
    
    def cleanup_old_audit_logs(self, days=365):
        """
        Archive/delete old audit logs (soft delete).
        Returns number of records archived.
        """
        cutoff_date = timezone.now() - timedelta(days=days)
        old_logs = self.get_queryset().filter(created_at__lt=cutoff_date)
        count = old_logs.count()
        
        # Soft delete
        old_logs.update(is_deleted=True, deleted_at=timezone.now())
        
        return count
    
    def get_audit_trail_for_compliance(self, tenant_id, start_date, end_date):
        """
        Get complete audit trail for compliance reporting.
        Includes all actions with before/after states.
        """
        return self.get_queryset().filter(
            tenant_id=tenant_id,
            created_at__gte=start_date,
            created_at__lte=end_date
        ).order_by('created_at').values(
            'created_at', 'user_email', 'action', 'resource_type',
            'resource_id', 'resource_name', 'success', 'error_message',
            'changes', 'reason', 'user_ip', 'user_agent'
        )
    
    def get_suspicious_activities(self, days=7):
        """
        Detect suspicious activities for security review.
        Examples: multiple failed actions, unusual patterns.
        """
        cutoff_date = timezone.now() - timedelta(days=days)
        
        suspicious = []
        
        # Multiple failed actions by same user
        failed_by_user = self.get_queryset().filter(
            success=False,
            created_at__gte=cutoff_date
        ).values('user_id', 'user_email').annotate(
            failed_count=models.Count('id')
        ).filter(failed_count__gte=5)
        
        for item in failed_by_user:
            suspicious.append({
                'type': 'multiple_failures',
                'user_id': item['user_id'],
                'user_email': item['user_email'],
                'failed_count': item['failed_count'],
                'details': f"User had {item['failed_count']} failed actions in {days} days"
            })
        
        # Rapid action sequences (potential automated attack)
        rapid_actions = []
        # This would require more sophisticated analysis
        # Could check for many actions in short time window
        
        return suspicious