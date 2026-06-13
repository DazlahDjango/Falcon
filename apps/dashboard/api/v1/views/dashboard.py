from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
import logging

from apps.dashboard.services import (
    ExecutiveDashboardService, ClientAdminDashboardService,
    SuperAdminDashboardService, DashboardCacheService
)
from apps.dashboard.api.v1.serializers import (
    ExecutiveDashboardDataSerializer,
    ClientAdminDashboardDataSerializer, SuperAdminDashboardDataSerializer,
    DepartmentPerformanceSerializer, KPITrendSerializer
)
from apps.accounts.api.v1.permissions import IsAuthenticated, IsTenantMember, IsSuperAdmin, IsExecutive, IsClientAdmin
from apps.dashboard.api.v1.throttles import (
    ExecutiveDashboardThrottle, ClientAdminDashboardThrottle,
    SuperAdminDashboardThrottle,
    DashboardRefreshThrottle, BurstDashboardThrottle
)
from apps.dashboard.exceptions import DashboardAccessError

logger = logging.getLogger(__name__)

class ExecutiveDashboardViewSet(viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated, IsTenantMember, IsExecutive]
    throttle_classes = [BurstDashboardThrottle, ExecutiveDashboardThrottle]
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.service = None
    
    def get_service(self):
        if not self.service:
            self.service = ExecutiveDashboardService(
                self.request.user,
                getattr(self.request.user, 'tenant_id', None)
            )
        return self.service
    
    @swagger_auto_schema(
        operation_description="Get executive dashboard overview data",
        responses={200: ExecutiveDashboardDataSerializer()}
    )
    @action(detail=False, methods=['get'], url_path='data')
    def get_dashboard_data(self, request):
        try:
            service = self.get_service()
            user_id = request.query_params.get('user_id', str(request.user.id))
            
            filters = {
                'period': request.query_params.get('period', 'monthly'),
                'department_id': request.query_params.get('department_id'),
                'kpi_status': request.query_params.get('kpi_status'),
                'date_from': request.query_params.get('date_from'),
                'date_to': request.query_params.get('date_to')
            }
            filters = {k: v for k, v in filters.items() if v}
            
            data = service.get_dashboard_data(user_id, filters if filters else None)
            
            serializer = ExecutiveDashboardDataSerializer(data)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except DashboardAccessError as e:
            return Response({'error': str(e)}, status=status.HTTP_403_FORBIDDEN)
        except Exception as e:
            logger.error(f"Executive dashboard error: {e}")
            return Response({'error': 'Internal server error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @swagger_auto_schema(
        operation_description="Get department performance details",
        responses={200: DepartmentPerformanceSerializer(many=True)}
    )
    @action(detail=False, methods=['get'], url_path='departments')
    def get_departments(self, request):
        try:
            service = self.get_service()
            data = service.get_dashboard_data(str(request.user.id))
            departments = data.get('department_performance', [])
            
            serializer = DepartmentPerformanceSerializer(departments, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error fetching departments: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @swagger_auto_schema(
        operation_description="Get KPI trends",
        responses={200: KPITrendSerializer(many=True)}
    )
    @action(detail=False, methods=['get'], url_path='trends')
    def get_trends(self, request):
        try:
            service = self.get_service()
            data = service.get_dashboard_data(str(request.user.id))
            trends = data.get('kpi_trends', [])
            
            serializer = KPITrendSerializer(trends, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error fetching trends: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @swagger_auto_schema(
        operation_description="Get top issues/alerts",
        responses={200: openapi.Response('List of issues')}
    )
    @action(detail=False, methods=['get'], url_path='issues')
    def get_top_issues(self, request):
        try:
            service = self.get_service()
            data = service.get_dashboard_data(str(request.user.id))
            issues = data.get('top_issues', [])
            
            return Response(issues, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error fetching issues: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @swagger_auto_schema(
        operation_description="Refresh dashboard cache",
        responses={200: openapi.Response('Cache refreshed')}
    )
    @action(detail=False, methods=['post'], url_path='refresh', throttle_classes=[DashboardRefreshThrottle])
    def refresh_dashboard(self, request):
        try:
            cache_service = DashboardCacheService(
                request.user,
                getattr(request.user, 'tenant_id', None)
            )
            cache_service.invalidate_user_dashboards(str(request.user.id))
            
            return Response({'message': 'Dashboard cache refreshed successfully'}, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error refreshing cache: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ClientAdminDashboardViewSet(viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated, IsTenantMember, IsClientAdmin]
    throttle_classes = [BurstDashboardThrottle, ClientAdminDashboardThrottle]
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.service = None
    
    def get_service(self):
        if not self.service:
            self.service = ClientAdminDashboardService(
                self.request.user,
                getattr(self.request.user, 'tenant_id', None)
            )
        return self.service
    
    @swagger_auto_schema(
        operation_description="Get client admin dashboard overview data",
        responses={200: ClientAdminDashboardDataSerializer()}
    )
    @action(detail=False, methods=['get'], url_path='data')
    def get_dashboard_data(self, request):
        try:
            service = self.get_service()
            data = service.get_dashboard_data()
            
            serializer = ClientAdminDashboardDataSerializer(data)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except DashboardAccessError as e:
            return Response({'error': str(e)}, status=status.HTTP_403_FORBIDDEN)
        except Exception as e:
            logger.error(f"Client admin dashboard error: {e}")
            return Response({'error': 'Internal server error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @swagger_auto_schema(
        operation_description="Get compliance status",
        responses={200: openapi.Response('Compliance data')}
    )
    @action(detail=False, methods=['get'], url_path='compliance')
    def get_compliance(self, request):
        try:
            service = self.get_service()
            data = service.get_dashboard_data()
            compliance = data.get('compliance_status', {})
            
            return Response(compliance, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error fetching compliance: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @swagger_auto_schema(
        operation_description="Get pending approvals",
        responses={200: openapi.Response('List of pending approvals')}
    )
    @action(detail=False, methods=['get'], url_path='pending-approvals')
    def get_pending_approvals(self, request):
        try:
            service = self.get_service()
            data = service.get_dashboard_data()
            approvals = data.get('pending_approvals', [])
            
            return Response(approvals, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error fetching pending approvals: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @swagger_auto_schema(
        operation_description="Get missing data alerts",
        responses={200: openapi.Response('List of missing data alerts')}
    )
    @action(detail=False, methods=['get'], url_path='missing-data')
    def get_missing_data(self, request):
        try:
            service = self.get_service()
            data = service.get_dashboard_data()
            missing = data.get('missing_data_alerts', [])
            
            return Response(missing, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error fetching missing data: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @swagger_auto_schema(
        operation_description="Get user activity report",
        responses={200: openapi.Response('User activity data')}
    )
    @action(detail=False, methods=['get'], url_path='user-activity')
    def get_user_activity(self, request):
        try:
            service = self.get_service()
            data = service.get_dashboard_data()
            activity = data.get('user_activity', {})
            
            return Response(activity, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error fetching user activity: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @swagger_auto_schema(
        operation_description="Refresh dashboard cache",
        responses={200: openapi.Response('Cache refreshed')}
    )
    @action(detail=False, methods=['post'], url_path='refresh', throttle_classes=[DashboardRefreshThrottle])
    def refresh_dashboard(self, request):
        try:
            cache_service = DashboardCacheService(
                request.user,
                getattr(request.user, 'tenant_id', None)
            )
            cache_service.invalidate_tenant_dashboards()
            
            return Response({'message': 'Dashboard cache refreshed successfully'}, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error refreshing cache: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SuperAdminDashboardViewSet(viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated, IsSuperAdmin]
    throttle_classes = [BurstDashboardThrottle, SuperAdminDashboardThrottle]
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.service = None
    
    def get_service(self):
        if not self.service:
            self.service = SuperAdminDashboardService(
                self.request.user,
                getattr(self.request.user, 'tenant_id', None)
            )
        return self.service
    
    @swagger_auto_schema(
        operation_description="Get super admin dashboard overview data",
        responses={200: SuperAdminDashboardDataSerializer()}
    )
    @action(detail=False, methods=['get'], url_path='data')
    def get_dashboard_data(self, request):
        try:
            service = self.get_service()
            data = service.get_dashboard_data()
            
            serializer = SuperAdminDashboardDataSerializer(data)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except DashboardAccessError as e:
            return Response({'error': str(e)}, status=status.HTTP_403_FORBIDDEN)
        except Exception as e:
            logger.error(f"Super admin dashboard error: {e}")
            return Response({'error': 'Internal server error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @swagger_auto_schema(
        operation_description="Get tenant details",
        responses={200: openapi.Response('Tenant details')}
    )
    @action(detail=True, methods=['get'], url_path='tenant/(?P<client_id>[^/.]+)')
    def get_tenant_details(self, request, client_id=None):
        try:
            service = self.get_service()
            data = service.get_tenant_details(client_id)
            
            return Response(data, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error fetching tenant details: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @swagger_auto_schema(
        operation_description="Refresh tenant snapshot",
        responses={200: openapi.Response('Snapshot refreshed')}
    )
    @action(detail=True, methods=['post'], url_path='tenant/(?P<client_id>[^/.]+)/refresh')
    def refresh_tenant_snapshot(self, request, client_id=None):
        try:
            service = self.get_service()
            data = service.refresh_tenant_snapshot(client_id)
            
            return Response(data, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error refreshing tenant snapshot: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @swagger_auto_schema(
        operation_description="Get system health status",
        responses={200: openapi.Response('System health')}
    )
    @action(detail=False, methods=['get'], url_path='system-health')
    def get_system_health(self, request):
        try:
            service = self.get_service()
            data = service.get_dashboard_data()
            health = data.get('system_health', {})
            
            return Response(health, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error fetching system health: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @swagger_auto_schema(
        operation_description="Get subscription alerts",
        responses={200: openapi.Response('Subscription alerts')}
    )
    @action(detail=False, methods=['get'], url_path='subscription-alerts')
    def get_subscription_alerts(self, request):
        try:
            service = self.get_service()
            data = service.get_dashboard_data()
            alerts = data.get('subscription_alerts', [])
            
            return Response(alerts, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error fetching subscription alerts: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
