# apps/tenant/api/v1/views/health_views.py
"""
Health check views for system monitoring.
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.utils import timezone
from django.db import connection

from apps.tenant.services.monitoring.health_check import HealthCheck


class HealthCheckView(APIView):
    """
    Basic health check endpoint.

    Returns system health status including:
        - Database connectivity
        - Cache status
        - Overall system health
    """

    permission_classes = [AllowAny]

    def get(self, request):
        health = HealthCheck()
        result = health.check_all()

        # Determine status code
        status_code = 200 if result.get('status') == 'healthy' else 503

        return Response({
            'status': result.get('status', 'unknown'),
            'timestamp': timezone.now().isoformat(),
            'version': '1.0.0',
            'checks': result.get('checks', {}),
            'message': result.get('message', 'System is operational')
        }, status=status_code)


class TenantsHealthView(APIView):
    """
    Get health status of all tenants.

    Returns:
        - Total tenants count
        - Healthy/degraded counts
        - List of degraded tenants (for super admins only)
    """

    permission_classes = [AllowAny]

    def get(self, request):
        health = HealthCheck()

        # For super admins, return full details
        if request.user and request.user.is_authenticated and request.user.is_superuser:
            result = health.check_all_tenants()
            return Response({
                'status': result.get('overall_status', 'unknown'),
                'timestamp': timezone.now().isoformat(),
                'total_tenants': result.get('total_tenants', 0),
                'healthy_tenants': result.get('healthy_tenants', 0),
                'degraded_tenants': result.get('degraded_tenants', 0),
                'degraded_tenants_list': [
                    {
                        'tenant_id': t.get('tenant_id'),
                        'tenant_name': t.get('tenant_name'),
                        'status': t.get('status'),
                        'warnings': t.get('warnings', [])
                    }
                    for t in result.get('tenants', [])
                    if t.get('status') != 'healthy'
                ]
            })

        # For non-admin users, return limited info
        return Response({
            'status': 'operational',
            'timestamp': timezone.now().isoformat(),
            'message': 'System is operational'
        })


class DatabaseHealthView(APIView):
    """
    Database health check endpoint.
    """

    permission_classes = [AllowAny]

    def get(self, request):
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
                cursor.fetchone()

            return Response({
                'status': 'healthy',
                'database': 'connected',
                'timestamp': timezone.now().isoformat()
            })
        except Exception as e:
            return Response({
                'status': 'unhealthy',
                'database': 'disconnected',
                'error': str(e),
                'timestamp': timezone.now().isoformat()
            }, status=503)


class CacheHealthView(APIView):
    """
    Cache health check endpoint.
    """

    permission_classes = [AllowAny]

    def get(self, request):
        from django.core.cache import cache

        try:
            test_key = 'health_check_test'
            cache.set(test_key, 'ok', 10)
            value = cache.get(test_key)
            cache.delete(test_key)

            if value == 'ok':
                return Response({
                    'status': 'healthy',
                    'cache': 'connected',
                    'timestamp': timezone.now().isoformat()
                })

            return Response({
                'status': 'unhealthy',
                'cache': 'write/read failed',
                'timestamp': timezone.now().isoformat()
            }, status=503)

        except Exception as e:
            return Response({
                'status': 'unhealthy',
                'cache': 'disconnected',
                'error': str(e),
                'timestamp': timezone.now().isoformat()
            }, status=503)


class SystemHealthView(APIView):
    """
    Complete system health dashboard.
    """

    permission_classes = [AllowAny]

    def get(self, request):
        from apps.tenant.models import Client
        from django.core.cache import cache

        # Database check
        db_status = 'healthy'
        db_error = None
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
        except Exception as e:
            db_status = 'unhealthy'
            db_error = str(e)

        # Cache check
        cache_status = 'healthy'
        cache_error = None
        try:
            cache.set('health_test', 'ok', 5)
            cache.get('health_test')
        except Exception as e:
            cache_status = 'unhealthy'
            cache_error = str(e)

        # Tenant counts
        total_tenants = Client.objects.filter(is_deleted=False).count()
        active_tenants = Client.objects.filter(
            is_active=True, is_deleted=False).count()

        overall_status = 'healthy'
        if db_status == 'unhealthy' or cache_status == 'unhealthy':
            overall_status = 'degraded'

        return Response({
            'status': overall_status,
            'timestamp': timezone.now().isoformat(),
            'components': {
                'database': {'status': db_status, 'error': db_error},
                'cache': {'status': cache_status, 'error': cache_error},
            },
            'metrics': {
                'total_tenants': total_tenants,
                'active_tenants': active_tenants,
            }
        })
