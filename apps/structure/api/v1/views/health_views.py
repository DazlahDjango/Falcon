from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db import connection, models
from django.core.cache import cache
from django.conf import settings
from django.utils import timezone
from ..throttles.structure_limits import HierarchyReadThrottle
from ..permissions.structure_permissions import CanViewHierarchy
from ....models import Department, Team, Employment, Position, ReportingLine, CostCenter, Location
from .base import BaseStructureReadOnlyViewSet

class StructureHealthViewSet(BaseStructureReadOnlyViewSet):
    permission_classes = [CanViewHierarchy]
    throttle_classes = [HierarchyReadThrottle]
    @action(detail=False, methods=['get'], url_path='database')
    def database_health(self, request):
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
                cursor.fetchone()
            # Check structure tables exist
            table_check = """
                SELECT COUNT(*) FROM information_schema.tables 
                WHERE table_name LIKE 'structure_%' AND table_schema = 'public'
            """
            with connection.cursor() as cursor:
                cursor.execute(table_check)
                table_count = cursor.fetchone()[0]
            return Response({
                'status': 'healthy',
                'connection': 'connected',
                'structure_tables_count': table_count,
                'database': settings.DATABASES['default']['NAME']
            })
        except Exception as e:
            return Response({
                'status': 'unhealthy',
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'], url_path='cache')
    def cache_health(self, request):
        try:
            test_key = "structure_health_test"
            test_value = "ok"
            cache.set(test_key, test_value, 10)
            retrieved = cache.get(test_key)
            cache.delete(test_key)
            if retrieved == test_value:
                return Response({
                    'status': 'healthy',
                    'cache_backend': settings.CACHES['default']['BACKEND'].split('.')[-1]
                })
            else:
                return Response({
                    'status': 'degraded',
                    'message': 'Cache read/write inconsistent'
                })
        except Exception as e:
            return Response({
                'status': 'unhealthy',
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'], url_path='services')
    def services_health(self, request):
        services_status = {}
        try:
            from ....services.hierarchy.tree_builder import TreeBuilder
            TreeBuilder()
            services_status['hierarchy_service'] = 'healthy'
        except Exception as e:
            services_status['hierarchy_service'] = f'unhealthy: {str(e)}'
        try:
            from ....services.reporting.chain_service import ReportingChainService
            ReportingChainService()
            services_status['reporting_service'] = 'healthy'
        except Exception as e:
            services_status['reporting_service'] = f'unhealthy: {str(e)}'
        try:
            from ....services.security.hierarchy_access import HierarchyAccessEnforcer
            HierarchyAccessEnforcer()
            services_status['security_service'] = 'healthy'
        except Exception as e:
            services_status['security_service'] = f'unhealthy: {str(e)}'
        overall = 'healthy' if all('healthy' in str(v) for v in services_status.values()) else 'degraded'
        return Response({
            'status': overall,
            'services': services_status
        })
    
    @action(detail=False, methods=['get'], url_path='admin')
    def admin_health(self, request):
        tenant_id = getattr(request.user, 'tenant_id', None) if hasattr(request.user, 'tenant_id') else None
        anomalies = []
        depts_no_path = Department.objects.filter(tenant_id=tenant_id, is_deleted=False, path__isnull=True).count()
        if depts_no_path > 0:
            anomalies.append(f"{depts_no_path} departments missing path")
        orphaned_teams = Team.objects.filter(tenant_id=tenant_id, is_deleted=False, department__isnull=True).count()
        if orphaned_teams > 0:
            anomalies.append(f"{orphaned_teams} teams without department")
        dup_employments = Employment.objects.filter(tenant_id=tenant_id, is_current=True, is_deleted=False).values('user_id').annotate(count=models.Count('id')).filter(count__gt=1).count()
        if dup_employments > 0:
            anomalies.append(f"{dup_employments} users have multiple current employments")
        orphaned_reporting = ReportingLine.objects.filter(
            tenant_id=tenant_id, is_deleted=False, is_active=True
        ).filter(
            models.Q(employee__isnull=True) | models.Q(manager__isnull=True)
        ).count()
        if orphaned_reporting > 0:
            anomalies.append(f"{orphaned_reporting} orphaned reporting lines")
        return Response({
            'tenant_id': str(tenant_id) if tenant_id else None,
            'status': 'healthy' if len(anomalies) == 0 else 'has_warnings',
            'anomalies': anomalies,
            'anomaly_count': len(anomalies),
            'recommendations': [
                "Run repair scripts for any anomalies found",
                "Schedule regular integrity checks",
                "Review department hierarchy periodically"
            ] if anomalies else []
        })
    
    @action(detail=False, methods=['get'], url_path='metrics')
    def get_metrics(self, request):
        tenant_id = request.user.tenant_id
        metrics = {
            'tenant_id': str(tenant_id),
            'timestamp': timezone.now().isoformat(),
            'counts': {
                'departments': Department.objects.filter(tenant_id=tenant_id, is_deleted=False).count(),
                'teams': Team.objects.filter(tenant_id=tenant_id, is_deleted=False).count(),
                'employments': Employment.objects.filter(tenant_id=tenant_id, is_deleted=False).count(),
                'current_employments': Employment.objects.filter(tenant_id=tenant_id, is_current=True, is_deleted=False).count(),
                'positions': Position.objects.filter(tenant_id=tenant_id, is_deleted=False).count(),
                'reporting_lines': ReportingLine.objects.filter(tenant_id=tenant_id, is_deleted=False).count(),
                'active_reporting_lines': ReportingLine.objects.filter(tenant_id=tenant_id, is_deleted=False, is_active=True).count(),
                'cost_centers': CostCenter.objects.filter(tenant_id=tenant_id, is_deleted=False).count(),
                'locations': Location.objects.filter(tenant_id=tenant_id, is_deleted=False).count()
            },
            'ratios': {
                'avg_teams_per_department': self._safe_division(
                    Team.objects.filter(tenant_id=tenant_id, is_deleted=False).count(),
                    Department.objects.filter(tenant_id=tenant_id, is_deleted=False).count()
                ),
                'avg_employees_per_team': self._safe_division(
                    Employment.objects.filter(tenant_id=tenant_id, is_current=True, is_deleted=False).count(),
                    Team.objects.filter(tenant_id=tenant_id, is_deleted=False, is_active=True).count()
                ),
                'reporting_line_activation_rate': self._safe_division(
                    ReportingLine.objects.filter(tenant_id=tenant_id, is_deleted=False, is_active=True).count(),
                    ReportingLine.objects.filter(tenant_id=tenant_id, is_deleted=False).count()
                ) * 100
            }
        }
        return Response(metrics)
    
    def _safe_division(self, numerator, denominator):
        if denominator == 0:
            return 0
        return round(numerator / denominator, 2)