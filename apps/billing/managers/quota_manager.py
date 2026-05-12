# billing/managers/quota_manager.py
from django.db import models
from django.utils import timezone
from datetime import date, timedelta
from .base import BaseBillingManager


class QuotaManager(BaseBillingManager):
    """
    Manager for QuotaLimit and QuotaUsage models.
    """
    
    # ========================================================================
    # QuotaLimit methods
    # ========================================================================
    
    def get_limits_for_subscription(self, subscription):
        """Get or create quota limits for a subscription."""
        from billing.models import QuotaLimit
        
        limits, created = QuotaLimit.objects.get_or_create(
            subscription=subscription,
            defaults=self._get_default_limits_for_plan(subscription.plan)
        )
        return limits
    
    def _get_default_limits_for_plan(self, plan):
        """Get default quota limits based on plan type."""
        limits = {
            'max_users': 10,
            'max_admins': 5,
            'max_kpis': 50,
            'max_kpi_frameworks': 5,
            'max_storage_mb': 10240,
            'max_api_calls_per_day': 10000,
            'allow_custom_branding': False,
            'allow_api_access': False,
            'allow_sso': False,
            'allow_advanced_analytics': False,
            'allow_audit_logs': True,
            'allow_reports': True,
            'allow_export': True,
        }
        
        if plan.plan_type == 'basic':
            limits.update({
                'max_users': 50,
                'max_kpis': 100,
            })
        elif plan.plan_type == 'professional':
            limits.update({
                'max_users': 500,
                'max_kpis': 1000,
                'allow_custom_branding': True,
                'allow_api_access': True,
                'allow_advanced_analytics': True,
            })
        elif plan.plan_type == 'enterprise':
            limits.update({
                'max_users': 10000,
                'max_kpis': 10000,
                'allow_custom_branding': True,
                'allow_api_access': True,
                'allow_sso': True,
                'allow_advanced_analytics': True,
            })
        elif plan.plan_type == 'trial':
            limits.update({
                'max_users': 25,
                'max_kpis': 100,
                'allow_custom_branding': True,
            })
        
        return limits
    
    # ========================================================================
    # QuotaUsage methods
    # ========================================================================
    
    def get_or_create_today_usage(self, tenant):
        """Get or create quota usage record for today."""
        from billing.models import QuotaUsage
        
        today = date.today()
        usage, created = QuotaUsage.objects.get_or_create(
            tenant=tenant,
            snapshot_date=today,
            defaults={
                'current_users': 0,
                'current_admins': 0,
                'current_kpis': 0,
                'current_storage_mb': 0,
                'api_calls_today': 0,
            }
        )
        return usage
    
    def check_quota(self, tenant, resource, requested_amount=1):
        """
        Check if tenant has available quota for a resource.
        
        Args:
            tenant: Client tenant
            resource: 'users', 'admins', 'kpis', 'storage_mb', 'api_calls'
            requested_amount: Amount being requested (default 1)
        
        Returns:
            tuple: (is_available, current_usage, max_limit, message)
        """
        subscription = tenant.subscription if hasattr(tenant, 'subscription') else None
        if not subscription or not subscription.is_active:
            return False, 0, 0, "No active subscription"
        
        limits = self.get_limits_for_subscription(subscription)
        usage = self.get_or_create_today_usage(tenant)
        
        resource_map = {
            'users': ('max_users', 'current_users'),
            'admins': ('max_admins', 'current_admins'),
            'kpis': ('max_kpis', 'current_kpis'),
            'storage_mb': ('max_storage_mb', 'current_storage_mb'),
            'api_calls': ('max_api_calls_per_day', 'api_calls_today'),
        }
        
        if resource not in resource_map:
            return False, 0, 0, f"Unknown resource: {resource}"
        
        limit_field, usage_field = resource_map[resource]
        max_limit = getattr(limits, limit_field)
        current_usage = getattr(usage, usage_field)
        
        is_available = (current_usage + requested_amount) <= max_limit
        
        if not is_available:
            message = f"{resource.replace('_', ' ').title()} limit reached. Maximum: {max_limit}"
        else:
            message = "Quota available"
        
        return is_available, current_usage, max_limit, message
    
    def increment_usage(self, tenant, resource, amount=1):
        """
        Increment quota usage for a tenant.
        
        Returns:
            bool: True if successful, False if quota exceeded
        """
        is_available, current_usage, max_limit, message = self.check_quota(
            tenant, resource, amount
        )
        
        if not is_available:
            return False
        
        usage = self.get_or_create_today_usage(tenant)
        
        resource_field_map = {
            'users': 'current_users',
            'admins': 'current_admins',
            'kpis': 'current_kpis',
            'storage_mb': 'current_storage_mb',
            'api_calls': 'api_calls_today',
        }
        
        if resource in resource_field_map:
            field = resource_field_map[resource]
            current = getattr(usage, field)
            setattr(usage, field, current + amount)
            usage.save(update_fields=[field])
        
        return True
    
    def decrement_usage(self, tenant, resource, amount=1):
        """Decrement quota usage for a tenant."""
        usage = self.get_or_create_today_usage(tenant)
        
        resource_field_map = {
            'users': 'current_users',
            'admins': 'current_admins',
            'kpis': 'current_kpis',
            'storage_mb': 'current_storage_mb',
            'api_calls': 'api_calls_today',
        }
        
        if resource in resource_field_map:
            field = resource_field_map[resource]
            current = getattr(usage, field)
            new_value = max(0, current - amount)
            setattr(usage, field, new_value)
            usage.save(update_fields=[field])
        
        return True
    
    def refresh_usage(self, tenant):
        """Refresh quota usage from actual database counts."""
        from apps.accounts.models import User
        from apps.kpi.models import KPI
        
        usage = self.get_or_create_today_usage(tenant)
        
        # Count users
        usage.current_users = User.objects.filter(
            tenant_id=tenant.id,
            is_deleted=False,
            is_active=True
        ).count()
        
        # Count admins
        usage.current_admins = User.objects.filter(
            tenant_id=tenant.id,
            is_deleted=False,
            is_active=True,
            role__in=['super_admin', 'client_admin']
        ).count()
        
        # Count KPIs
        usage.current_kpis = KPI.objects.filter(
            tenant_id=tenant.id,
            is_deleted=False
        ).count()
        
        # TODO: Calculate storage usage from media files
        # usage.current_storage_mb = calculate_storage_usage(tenant)
        
        usage.save()
        return usage
    
    def get_quota_status(self, tenant):
        """Get complete quota status for a tenant."""
        subscription = tenant.subscription if hasattr(tenant, 'subscription') else None
        if not subscription:
            return None
        
        limits = self.get_limits_for_subscription(subscription)
        usage = self.get_or_create_today_usage(tenant)
        
        return {
            'plan': {
                'name': subscription.plan.name,
                'type': subscription.plan.plan_type,
                'status': subscription.status,
            },
            'users': {
                'current': usage.current_users,
                'max': limits.max_users,
                'percentage': (usage.current_users / limits.max_users * 100) if limits.max_users > 0 else 0,
            },
            'admins': {
                'current': usage.current_admins,
                'max': limits.max_admins,
                'percentage': (usage.current_admins / limits.max_admins * 100) if limits.max_admins > 0 else 0,
            },
            'kpis': {
                'current': usage.current_kpis,
                'max': limits.max_kpis,
                'percentage': (usage.current_kpis / limits.max_kpis * 100) if limits.max_kpis > 0 else 0,
            },
            'storage': {
                'current_mb': usage.current_storage_mb,
                'max_mb': limits.max_storage_mb,
                'percentage': (usage.current_storage_mb / limits.max_storage_mb * 100) if limits.max_storage_mb > 0 else 0,
            },
            'api_calls_today': {
                'current': usage.api_calls_today,
                'max': limits.max_api_calls_per_day,
                'percentage': (usage.api_calls_today / limits.max_api_calls_per_day * 100) if limits.max_api_calls_per_day > 0 else 0,
            },
            'features': {
                'custom_branding': limits.allow_custom_branding,
                'api_access': limits.allow_api_access,
                'sso': limits.allow_sso,
                'advanced_analytics': limits.allow_advanced_analytics,
                'audit_logs': limits.allow_audit_logs,
                'reports': limits.allow_reports,
                'export': limits.allow_export,
            }
        }
    
    def reset_daily_api_usage(self):
        """Reset API call counters for all tenants (called by Celery daily)."""
        from billing.models import QuotaUsage
        
        updated = QuotaUsage.objects.update(api_calls_today=0)
        return updated