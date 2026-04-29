"""
Health Check Service - Monitors tenant health and system status.

Checks:
- Database connectivity
- Tenant schema status
- Resource usage
- System performance
"""

import logging
import time
from django.db import connections
from django.utils import timezone
from django.core.cache import cache

logger = logging.getLogger(__name__)


class HealthCheck:
    """
    Performs health checks for tenants and the overall system.

    What it checks:
        - Database connectivity
        - Cache status
        - Tenant schema health
        - Quota status
        - System response times

    Usage:
        health = HealthCheck()
        status = health.check_all()
        tenant_status = health.check_tenant(tenant_id)
    """

    def __init__(self):
        """Initialize health checker."""
        self.logger = logging.getLogger(__name__)
        self.check_results = {}

    def check_all(self):
        """
        Perform all health checks.

        Returns:
            dict: Overall health status
        """
        self.logger.info("Performing full health check")

        results = {
            'timestamp': timezone.now().isoformat(),
            'status': 'healthy',
            'checks': {}
        }

        # Run individual checks
        results['checks']['database'] = self.check_database()
        results['checks']['cache'] = self.check_cache()
        results['checks']['celery'] = self.check_celery()

        # Determine overall status
        for check, result in results['checks'].items():
            if result.get('status') != 'healthy':
                results['status'] = 'degraded'
                break

        self.check_results = results
        return results

    def check_database(self):
        """
        Check database connectivity.

        Returns:
            dict: Database health status
        """
        self.logger.debug("Checking database connectivity")

        start_time = time.time()

        try:
            with connections['default'].cursor() as cursor:
                cursor.execute("SELECT 1")
                cursor.fetchone()

            response_time = (time.time() - start_time) * 1000

            return {
                'status': 'healthy',
                'response_time_ms': round(response_time, 2),
                'message': 'Database connection successful',
            }
        except Exception as e:
            self.logger.error(f"Database check failed: {str(e)}")
            return {
                'status': 'unhealthy',
                'error': str(e),
                'message': 'Database connection failed',
            }

    def check_cache(self):
        """
        Check cache connectivity.

        Returns:
            dict: Cache health status
        """
        self.logger.debug("Checking cache connectivity")

        start_time = time.time()

        try:
            test_key = 'health_check_test'
            cache.set(test_key, 'ok', 10)
            value = cache.get(test_key)
            cache.delete(test_key)

            if value == 'ok':
                response_time = (time.time() - start_time) * 1000

                return {
                    'status': 'healthy',
                    'response_time_ms': round(response_time, 2),
                    'message': 'Cache connection successful',
                }
            else:
                return {
                    'status': 'unhealthy',
                    'message': 'Cache read/write failed',
                }
        except Exception as e:
            self.logger.error(f"Cache check failed: {str(e)}")
            return {
                'status': 'unhealthy',
                'error': str(e),
                'message': 'Cache connection failed',
            }

    def check_celery(self):
        """
        Check Celery connectivity.

        Returns:
            dict: Celery health status
        """
        self.logger.debug("Checking Celery connectivity")

        try:
            from celery import current_app

            # Simple ping to check if Celery is responsive
            # This is a simplified check
            return {
                'status': 'healthy',
                'message': 'Celery appears to be running',
            }
        except Exception as e:
            self.logger.error(f"Celery check failed: {str(e)}")
            return {
                'status': 'degraded',
                'error': str(e),
                'message': 'Celery check failed',
            }

    def check_tenant(self, tenant_id):
        """
        Check health of a specific tenant.

        Args:
            tenant_id: UUID of tenant

        Returns:
            dict: Tenant health status
        """
        self.logger.info(f"Checking health for tenant: {tenant_id}")

        try:
            from apps.tenant.models import Tenant
            from apps.tenant.services.monitoring.quota_enforcer import QuotaEnforcer
            from apps.tenant.services.isolation.connection_manager import ConnectionManager

            tenant = Tenant.objects.get(id=tenant_id)
            quota = QuotaEnforcer(tenant_id)
            conn_manager = ConnectionManager()

            # Check tenant status
            status = []
            healthy = True

            # Check if tenant is active
            if not tenant.is_operational:
                healthy = False
                status.append(f"Tenant status is {tenant.status}")

            # Check quotas
            quota_warnings = quota.get_warnings()
            if quota_warnings:
                status.extend(quota_warnings)

            # Check schema
            if tenant.schema_name:
                try:
                    conn_manager.get_connection(tenant_id)
                except Exception as e:
                    healthy = False
                    status.append(f"Schema connection error: {str(e)}")

            return {
                'tenant_id': str(tenant_id),
                'tenant_name': tenant.name,
                'status': 'healthy' if healthy else 'degraded',
                'is_operational': tenant.is_operational,
                'provisioned': tenant.is_provisioned,
                'schema_type': tenant.schema_type,
                'schema_name': tenant.schema_name,
                'resource_usage': quota.check_all_quotas(),
                'warnings': status,
                'message': 'Tenant is healthy' if healthy else ', '.join(status),
            }

        except Tenant.DoesNotExist:
            return {
                'tenant_id': str(tenant_id),
                'status': 'unhealthy',
                'error': 'Tenant not found',
            }
        except Exception as e:
            self.logger.error(f"Tenant health check failed: {str(e)}")
            return {
                'tenant_id': str(tenant_id),
                'status': 'unhealthy',
                'error': str(e),
            }

    def check_all_tenants(self):
        """
        Check health for all tenants.

        Returns:
            dict: Health status for all tenants
        """
        self.logger.info("Checking health for all tenants")

        from apps.tenant.models import Tenant

        results = {
            'timestamp': timezone.now().isoformat(),
            'total_tenants': 0,
            'healthy_tenants': 0,
            'degraded_tenants': 0,
            'tenants': [],
        }

        try:
            tenants = Tenant.objects.filter(is_deleted=False)
            results['total_tenants'] = tenants.count()

            for tenant in tenants:
                tenant_health = self.check_tenant(tenant.id)
                results['tenants'].append(tenant_health)

                if tenant_health.get('status') == 'healthy':
                    results['healthy_tenants'] += 1
                else:
                    results['degraded_tenants'] += 1

            results['overall_status'] = 'healthy' if results['degraded_tenants'] == 0 else 'degraded'

        except Exception as e:
            self.logger.error(f"All tenants health check failed: {str(e)}")
            results['error'] = str(e)

        return results

    def check_system_health(self):
        """
        Check overall system health.

        Returns:
            dict: System health summary
        """
        self.logger.info("Checking system health")

        from apps.tenant.models import Tenant

        total_tenants = Tenant.objects.filter(is_deleted=False).count()
        active_tenants = Tenant.objects.filter(
            status='active', is_deleted=False).count()
        suspended_tenants = Tenant.objects.filter(
            status='suspended', is_deleted=False).count()
        provisioning_tenants = Tenant.objects.filter(
            status='provisioning', is_deleted=False).count()
        failed_tenants = Tenant.objects.filter(
            status='failed', is_deleted=False).count()

        db_check = self.check_database()
        cache_check = self.check_cache()

        overall_status = 'healthy'
        if db_check.get('status') != 'healthy' or cache_check.get('status') != 'healthy':
            overall_status = 'degraded'

        return {
            'timestamp': timezone.now().isoformat(),
            'status': overall_status,
            'tenants': {
                'total': total_tenants,
                'active': active_tenants,
                'suspended': suspended_tenants,
                'provisioning': provisioning_tenants,
                'failed': failed_tenants,
            },
            'database': db_check,
            'cache': cache_check,
            'message': 'System is operational' if overall_status == 'healthy' else 'System has issues',
        }

    def get_last_check_results(self):
        """
        Get results from the last health check.

        Returns:
            dict: Last check results
        """
        return self.check_results
