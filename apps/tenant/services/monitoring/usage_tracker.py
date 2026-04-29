"""
Usage Tracker Service - Tracks real-time resource usage for tenants.

Monitors and logs usage metrics for:
- API calls per tenant
- Storage usage
- User activity
- Feature usage
"""

import logging
from django.utils import timezone
from django.db.models import Count, Sum
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)


class UsageTracker:
    """
    Tracks resource usage for tenants in real-time.

    What it does:
        - Records API call metrics
        - Tracks storage usage
        - Monitors user activity
        - Provides usage analytics

    Usage:
        tracker = UsageTracker()
        tracker.track_api_call(tenant_id, endpoint, response_time)
        tracker.update_storage_usage(tenant_id, file_size)
        stats = tracker.get_daily_stats(tenant_id)
    """

    def __init__(self):
        """Initialize usage tracker."""
        self.logger = logging.getLogger(__name__)

    def track_api_call(self, tenant_id, endpoint, response_time_ms, status_code=200):
        """
        Track an API call made by a tenant.

        Args:
            tenant_id: UUID of tenant
            endpoint: API endpoint called
            response_time_ms: Response time in milliseconds
            status_code: HTTP status code
        """
        self.logger.debug(
            f"Tracking API call for tenant {tenant_id}: {endpoint}")

        try:
            # Update tenant's API call counter
            from apps.tenant.models import Tenant

            Tenant.objects.filter(id=tenant_id).update(
                current_api_calls_today=models.F('current_api_calls_today') + 1
            )

            # Record to audit log (if you have audit model)
            # Could be stored in a separate analytics table

        except Exception as e:
            self.logger.error(f"Failed to track API call: {str(e)}")

    def track_storage_usage(self, tenant_id, file_path, file_size_mb):
        """
        Track storage usage for a tenant.

        Args:
            tenant_id: UUID of tenant
            file_path: Path to stored file
            file_size_mb: Size of file in MB
        """
        self.logger.debug(
            f"Tracking storage for tenant {tenant_id}: {file_path}")

        try:
            from apps.tenant.models import Tenant

            Tenant.objects.filter(id=tenant_id).update(
                current_storage_mb=models.F(
                    'current_storage_mb') + file_size_mb
            )

        except Exception as e:
            self.logger.error(f"Failed to track storage: {str(e)}")

    def track_user_activity(self, tenant_id, user_id, action):
        """
        Track user activity.

        Args:
            tenant_id: UUID of tenant
            user_id: UUID of user
            action: Action performed (login, create, update, delete)
        """
        self.logger.debug(f"Tracking user activity: {user_id} did {action}")

        try:
            # Could store in UserActivity model
            pass
        except Exception as e:
            self.logger.error(f"Failed to track user activity: {str(e)}")

    def get_daily_stats(self, tenant_id, date=None):
        """
        Get daily usage statistics for a tenant.

        Args:
            tenant_id: UUID of tenant
            date: Date to get stats for (default: today)

        Returns:
            dict: Daily usage statistics
        """
        if not date:
            date = timezone.now().date()

        try:
            from apps.tenant.models import Tenant

            tenant = Tenant.objects.get(id=tenant_id)

            return {
                'date': date.isoformat(),
                'tenant_id': str(tenant_id),
                'tenant_name': tenant.name,
                'api_calls_today': tenant.current_api_calls_today,
                'api_limit_per_day': tenant.max_api_calls_per_day,
                'api_remaining': tenant.max_api_calls_per_day - tenant.current_api_calls_today,
                'storage_used_mb': tenant.current_storage_mb,
                'storage_limit_mb': tenant.max_storage_mb,
                'users_current': tenant.current_users,
                'users_limit': tenant.max_users,
            }
        except Exception as e:
            self.logger.error(f"Failed to get daily stats: {str(e)}")
            return {}

    def get_weekly_stats(self, tenant_id):
        """
        Get weekly usage statistics.

        Args:
            tenant_id: UUID of tenant

        Returns:
            dict: Weekly usage statistics
        """
        try:
            from apps.tenant.models import Tenant

            tenant = Tenant.objects.get(id=tenant_id)

            # Calculate weekly averages
            # This would be better with historical data

            return {
                'tenant_id': str(tenant_id),
                'tenant_name': tenant.name,
                'api_calls_avg_daily': tenant.current_api_calls_today,  # Simplified
                'storage_used_mb': tenant.current_storage_mb,
                'users_current': tenant.current_users,
            }
        except Exception as e:
            self.logger.error(f"Failed to get weekly stats: {str(e)}")
            return {}

    def get_monthly_stats(self, tenant_id):
        """
        Get monthly usage statistics.

        Args:
            tenant_id: UUID of tenant

        Returns:
            dict: Monthly usage statistics
        """
        try:
            from apps.tenant.models import Tenant

            tenant = Tenant.objects.get(id=tenant_id)

            return {
                'tenant_id': str(tenant_id),
                'tenant_name': tenant.name,
                'storage_used_mb': tenant.current_storage_mb,
                'storage_limit_mb': tenant.max_storage_mb,
                'users_current': tenant.current_users,
                'users_limit': tenant.max_users,
            }
        except Exception as e:
            self.logger.error(f"Failed to get monthly stats: {str(e)}")
            return {}

    def get_tenant_summary(self, tenant_id):
        """
        Get comprehensive usage summary for a tenant.

        Args:
            tenant_id: UUID of tenant

        Returns:
            dict: Complete usage summary
        """
        try:
            from apps.tenant.models import Tenant
            from apps.tenant.constants import ResourceType
            from apps.tenant.models import TenantResource

            tenant = Tenant.objects.get(id=tenant_id)

            resources = TenantResource.objects.filter(tenant_id=tenant_id)
            resource_dict = {r.resource_type: r for r in resources}

            return {
                'tenant_id': str(tenant_id),
                'tenant_name': tenant.name,
                'status': tenant.status,
                'current_usage': {
                    'users': tenant.current_users,
                    'storage_mb': tenant.current_storage_mb,
                    'api_calls_today': tenant.current_api_calls_today,
                    'kpis': tenant.current_kpis,
                    'departments': tenant.current_departments,
                },
                'limits': {
                    'users': tenant.max_users,
                    'storage_mb': tenant.max_storage_mb,
                    'api_calls_per_day': tenant.max_api_calls_per_day,
                    'kpis': tenant.max_kpis,
                    'departments': tenant.max_departments,
                    'concurrent_sessions': tenant.max_concurrent_sessions,
                },
                'resources': {
                    rt: {
                        'current': r.current_value,
                        'limit': r.limit_value,
                        'percentage': (r.current_value / r.limit_value * 100) if r.limit_value > 0 else 0,
                    }
                    for rt, r in resource_dict.items()
                },
            }
        except Exception as e:
            self.logger.error(f"Failed to get tenant summary: {str(e)}")
            return {}

    def reset_daily_api_counts(self):
        """
        Reset daily API call counts for all tenants.

        Returns:
            int: Number of tenants reset
        """
        self.logger.info("Resetting daily API counts for all tenants")

        try:
            from apps.tenant.models import Tenant

            count = Tenant.objects.filter(
                current_api_calls_today__gt=0
            ).update(
                current_api_calls_today=0,
                last_api_reset=timezone.now()
            )

            self.logger.info(f"Reset API counts for {count} tenants")
            return count

        except Exception as e:
            self.logger.error(f"Failed to reset API counts: {str(e)}")
            return 0
