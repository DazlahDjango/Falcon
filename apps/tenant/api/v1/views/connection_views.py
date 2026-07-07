from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db.models import Count, Avg, Q
from django.core.cache import cache
from apps.tenant.models import OrganizationConnection, Organization
from apps.tenant.api.v1.serializers import (
    ConnectionSerializer,
    ConnectionDetailSerializer,
    ConnectionCreateSerializer,
    ConnectionUpdateSerializer,
    ConnectionStatusSerializer,
    ConnectionMetricsSerializer,
    ConnectionActionSerializer,
    ConnectionHealthCheckSerializer,
)
from apps.tenant.api.v1.permissions import IsSuperAdmin, CanManageOrganization
from apps.tenant.api.v1.throttles import OrganizationApiThrottle
from apps.tenant.services import ConnectionService


class ConnectionViewSet(viewsets.ModelViewSet):
    queryset = OrganizationConnection.objects.filter(is_deleted=False)
    permission_classes = [IsAuthenticated, CanManageOrganization]
    throttle_classes = [OrganizationApiThrottle]
    ordering_fields = ['status', 'last_used_at', 'created_at']
    ordering = ['-last_used_at']

    def get_serializer_class(self):
        action_serializers = {
            'create': ConnectionCreateSerializer,
            'update': ConnectionUpdateSerializer,
            'partial_update': ConnectionUpdateSerializer,
            'retrieve': ConnectionDetailSerializer,
            'list': ConnectionSerializer,
            'status': ConnectionStatusSerializer,
            'metrics': ConnectionMetricsSerializer,
            'execute_action': ConnectionActionSerializer,
            'health_check': ConnectionHealthCheckSerializer,
        }
        return action_serializers.get(self.action, ConnectionSerializer)

    def get_permissions(self):
        if self.action in ['close', 'execute_action', 'health_check', 'metrics', 'debug']:
            self.permission_classes = [IsAuthenticated, IsSuperAdmin]
        else:
            self.permission_classes = [IsAuthenticated, CanManageOrganization]
        return super().get_permissions()

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.request.query_params.get('organization_id'):
            queryset = queryset.filter(organization_id=self.request.query_params.get('organization_id'))
        if self.request.query_params.get('status'):
            queryset = queryset.filter(status=self.request.query_params.get('status'))
        return queryset

    @action(detail=True, methods=['post'])
    def close(self, request, pk=None):
        connection = self.get_object()
        service = ConnectionService()
        service.close_connection(connection.organization_id)
        self._log_action(request.user, 'close', {'connection_id': str(connection.id)})
        return Response({
            'success': True,
            'message': f'Connection {connection.connection_id} closed',
            'closed_at': timezone.now()
        })

    @action(detail=True, methods=['post'])
    def status(self, request, pk=None):
        connection = self.get_object()
        service = ConnectionService()
        status_data = service.get_status(connection.organization_id)
        return Response({
            'connection': ConnectionDetailSerializer(connection).data,
            'manager_status': status_data
        })

    @action(detail=False, methods=['post'], url_path='action')
    def execute_action(self, request):
        serializer = ConnectionActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        service = ConnectionService()
        action_type = serializer.validated_data['action']
        org_id = serializer.validated_data.get('organization_id')
        idle_minutes = serializer.validated_data.get('idle_minutes', 30)
        if action_type == 'close' and org_id:
            service.close_connection(org_id)
            self._log_action(request.user, 'close', {'organization_id': org_id})
            return Response({'success': True, 'message': f'Connection for {org_id} closed'})
        if action_type == 'close_all_idle':
            count = service.close_idle_connections(idle_minutes)
            self._log_action(request.user, 'close_all_idle', {'idle_minutes': idle_minutes, 'count': count})
            return Response({'success': True, 'message': f'Closed {count} idle connections'})
        if action_type == 'reset' and org_id:
            service.close_connection(org_id)
            service.get_connection(org_id)
            self._log_action(request.user, 'reset', {'organization_id': org_id})
            return Response({'success': True, 'message': f'Connection for {org_id} reset'})
        if action_type == 'recycle':
            count = service.close_all()
            self._log_action(request.user, 'recycle', {'count': count})
            return Response({'success': True, 'message': f'Recycled {count} connections'})
        if action_type == 'pause' and org_id:
            ConnectionService.pause_connection(org_id)
            self._log_action(request.user, 'pause', {'organization_id': org_id})
            return Response({'success': True, 'message': f'Connection for {org_id} paused'})
        if action_type == 'resume' and org_id:
            ConnectionService.resume_connection(org_id)
            self._log_action(request.user, 'resume', {'organization_id': org_id})
            return Response({'success': True, 'message': f'Connection for {org_id} resumed'})
        if action_type == 'prewarm':
            count = service.prewarm_connections()
            self._log_action(request.user, 'prewarm', {'count': count})
            return Response({'success': True, 'message': f'Pre-warmed {count} connections'})
        if action_type == 'drain':
            count = service.drain_connections()
            self._log_action(request.user, 'drain', {'count': count})
            return Response({'success': True, 'message': f'Drained {count} connections'})
        return Response({'error': 'Invalid action'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def metrics(self, request):
        cache_key = f"connection_metrics_{request.user.id}"
        cached_data = cache.get(cache_key)
        if cached_data:
            return Response(cached_data)
        service = ConnectionService()
        organization_id = request.query_params.get('organization_id')
        metrics = service.get_connection_metrics(organization_id=organization_id)
        statuses = service.get_all_statuses()
        data = {
            **metrics,
            'connections': statuses,
        }
        cache.set(cache_key, data, 60)
        return Response(data)

    @action(detail=False, methods=['get'])
    def debug(self, request):
        service = ConnectionService()
        traces = service.get_debug_traces()
        return Response({
            'active_connections_count': len(traces),
            'stack_traces': traces
        })

    @action(detail=False, methods=['post'])
    def health_check(self, request):
        serializer = ConnectionHealthCheckSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        org_id = serializer.validated_data.get('organization_id')
        if not org_id:
            return self._health_check_all()
        return self._check_organization_health(org_id)

    def _health_check_all(self):
        orgs = Organization.objects.filter(is_active=True, is_deleted=False)
        results = []
        for org in orgs:
            result = self._check_organization_health(str(org.id))
            results.append(result)
        return Response({
            'organizations_checked': len(results),
            'healthy': sum(1 for r in results if r['is_healthy']),
            'unhealthy': sum(1 for r in results if not r['is_healthy']),
            'results': results
        })

    def _check_organization_health(self, org_id):
        start = timezone.now()
        is_healthy = False
        error_message = ''
        connection_status = 'UNKNOWN'
        try:
            service = ConnectionService()
            conn = service.get_connection(org_id)
            with conn.cursor() as cursor:
                cursor.execute("SELECT 1")
                cursor.fetchone()
            status_info = service.get_status(org_id)
            connection_status = 'CONNECTED' if status_info.get('is_connected') else 'DISCONNECTED'
            is_healthy = True
        except Exception as e:
            error_message = str(e)
        response_time = (timezone.now() - start).total_seconds() * 1000
        return {
            'organization_id': org_id,
            'is_healthy': is_healthy,
            'response_time_ms': int(response_time),
            'error_message': error_message,
            'last_successful_check': timezone.now(),
            'connection_status': connection_status,
            'checked_at': timezone.now()
        }

    def _log_action(self, user, action, details):
        try:
            from apps.accounts.services.audit.logger import AuditService
            AuditService().log(
                user=user,
                action=f'connection.{action}',
                action_type='management',
                severity='info',
                metadata={'action': action, 'details': details}
            )
        except Exception:
            pass