from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from django.utils import timezone
from django.db.models import Count, Avg, Q
from django.core.cache import cache
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django.views.decorators.vary import vary_on_headers
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
import logging
from apps.tenant.models import ConnectionPool, ConnectionStatus, Client
from apps.tenant.api.v1.serializers.connection import (
    ConnectionPoolListSerializer, ConnectionPoolDetailSerializer,
    ConnectionPoolCreateSerializer, ConnectionStatusSerializer,
    ConnectionMetricsSerializer, ConnectionHealthCheckSerializer,
    ConnectionManagerActionSerializer
)
from apps.tenant.services import ConnectionManager
logger = logging.getLogger(__name__)


class ConnectionPoolViewSet(viewsets.ModelViewSet):
    queryset = ConnectionPool.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'list':
            return ConnectionPoolListSerializer
        elif self.action == 'retrieve':
            return ConnectionPoolDetailSerializer
        elif self.action == 'create':
            return ConnectionPoolCreateSerializer
        elif self.action in ['update_status', 'close_connection']:
            return ConnectionStatusSerializer
        elif self.action == 'metrics':
            return ConnectionMetricsSerializer
        elif self.action == 'health_check':
            return ConnectionHealthCheckSerializer
        elif self.action in ['manager_action', 'close_idle_connections']:
            return ConnectionManagerActionSerializer
        return ConnectionPoolListSerializer

    def get_queryset(self):
        user = self.request.user
        queryset = ConnectionPool.objects.select_related('tenant')

        # Super admin sees all
        if user.role == 'super_admin':
            pass  # Return all
        # Client admin sees only their tenant's connections
        elif user.role == 'client_admin':
            queryset = queryset.filter(tenant_id=user.tenant_id)
        else:
            # Regular users see no connections
            queryset = queryset.none()

        # Apply query filters
        tenant_id = self.request.query_params.get('tenant_id')
        if tenant_id:
            queryset = queryset.filter(tenant_id=tenant_id)

        status = self.request.query_params.get('status')
        if status:
            queryset = queryset.filter(status=status)

        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            is_active_bool = is_active.lower() == 'true'
            queryset = queryset.filter(status=ConnectionStatus.ACTIVE if is_active_bool else ~Q(status=ConnectionStatus.ACTIVE))

        # Order by last used (most recent first)
        queryset = queryset.order_by('-last_used_at', '-created_at')

        return queryset

    @swagger_auto_schema(
        operation_description="List all connections with optional filtering",
        manual_parameters=[
            openapi.Parameter('tenant_id', openapi.IN_QUERY, type=openapi.TYPE_STRING, format='uuid'),
            openapi.Parameter('status', openapi.IN_QUERY, type=openapi.TYPE_STRING, enum=['active', 'idle', 'closed', 'error']),
            openapi.Parameter('is_active', openapi.IN_QUERY, type=openapi.TYPE_BOOLEAN),
        ]
    )
    def list(self, request, *args, **kwargs):
        """List connections with filtering"""
        return super().list(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_description="Get detailed information about a specific connection",
        responses={200: ConnectionPoolDetailSerializer()}
    )
    def retrieve(self, request, *args, **kwargs):
        """Retrieve connection details"""
        return super().retrieve(request, *args, **kwargs)

    @action(detail=True, methods=['patch'], url_path='update-status')
    def update_status(self, request, pk=None):
        """
        Update connection status
        
        Allows manual updates to connection status (e.g., mark as error, idle)
        """
        connection = self.get_object()
        
        # Check permissions
        if not self._can_manage_connection(connection):
            raise PermissionDenied("You don't have permission to manage this connection")
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        status = serializer.validated_data['status']
        error_message = serializer.validated_data.get('error_message', '')
        
        # Update connection record
        if status == ConnectionStatus.ACTIVE:
            connection.mark_active()
        elif status == ConnectionStatus.IDLE:
            connection.mark_idle()
        elif status == ConnectionStatus.CLOSED:
            connection.mark_closed()
        elif status == ConnectionStatus.ERROR:
            connection.mark_error(error_message)
        
        # Update actual connection manager if needed
        conn_manager = ConnectionManager()
        if status == ConnectionStatus.CLOSED:
            conn_manager.close_connection(str(connection.tenant_id))
        elif status == ConnectionStatus.ACTIVE:
            conn_manager.get_connection(str(connection.tenant_id))
        
        return Response(
            ConnectionPoolDetailSerializer(connection).data,
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['post'], url_path='close')
    def close_connection(self, request, pk=None):
        """
        Close and terminate a connection immediately
        
        Forces closure of the database connection and marks it as closed.
        """
        connection = self.get_object()
        
        if not self._can_manage_connection(connection):
            raise PermissionDenied("You don't have permission to manage this connection")
        
        # Close in connection manager
        conn_manager = ConnectionManager()
        conn_manager.close_connection(str(connection.tenant_id))
        
        # Mark as closed
        connection.mark_closed()
        
        return Response({
            'message': 'Connection closed successfully',
            'connection_id': str(connection.id),
            'closed_at': connection.closed_at
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='metrics')
    @method_decorator(cache_page(60))  # Cache for 1 minute
    @method_decorator(vary_on_headers('Authorization'))
    def metrics(self, request):
        """
        Get connection pool metrics and statistics
        
        Provides aggregated metrics about all connections for monitoring.
        """
        self._check_super_admin_permission()
        
        queryset = self.get_queryset()
        
        # Basic counts
        total = queryset.count()
        active = queryset.filter(status=ConnectionStatus.ACTIVE).count()
        idle = queryset.filter(status=ConnectionStatus.IDLE).count()
        error = queryset.filter(status=ConnectionStatus.ERROR).count()
        closed = queryset.filter(status=ConnectionStatus.CLOSED).count()
        
        # Calculate average connection duration
        active_connections = queryset.filter(
            status=ConnectionStatus.ACTIVE, connected_at__isnull=False
        )
        avg_duration = active_connections.aggregate(
            avg_duration=Avg('last_used_at')
        )['avg_duration']
        
        # Get max concurrent connections
        max_concurrent = queryset.values('tenant_id').annotate(
            count=Count('id')
        ).aggregate(max=Avg('count'))['max'] or 0
        
        # Connections in last hour and 24 hours
        one_hour_ago = timezone.now() - timezone.timedelta(hours=1)
        twenty_four_hours_ago = timezone.now() - timezone.timedelta(hours=24)
        
        connections_last_hour = queryset.filter(created_at__gte=one_hour_ago).count()
        connections_last_24h = queryset.filter(created_at__gte=twenty_four_hours_ago).count()
        
        metrics = {
            'total_connections': total,
            'active_connections': active,
            'idle_connections': idle,
            'error_connections': error,
            'closed_connections': closed,
            'avg_connection_duration_seconds': float(avg_duration) if avg_duration else None,
            'max_concurrent_connections': int(max_concurrent or 0),
            'connections_last_hour': connections_last_hour,
            'connections_last_24h': connections_last_24h,
        }
        
        serializer = ConnectionMetricsSerializer(metrics)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], url_path='health-check')
    def health_check(self, request):
        """
        Perform health check on tenant connections
        
        Tests database connectivity and reports health status.
        """
        self._check_super_admin_or_client_admin_permission()
        
        tenant_id = request.data.get('tenant_id')
        
        if not tenant_id:
            # Check all for super admin
            if request.user.role == 'super_admin':
                return self._health_check_all_tenants()
            else:
                tenant_id = request.user.tenant_id
        
        # Check single tenant
        result = self._check_tenant_health(str(tenant_id))
        
        serializer = ConnectionHealthCheckSerializer(result)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], url_path='manager-action')
    @method_decorator(cache_page(0))  # No cache for management operations
    def manager_action(self, request):
        """
        Execute connection manager actions
        
        Actions available:
        - close: Close specific tenant connection
        - reset: Reset connection (close and reopen)
        - recycle: Recycle connection pool
        - close_all_idle: Close all idle connections
        """
        self._check_super_admin_permission()
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        action = serializer.validated_data['action']
        tenant_id = serializer.validated_data.get('tenant_id')
        idle_minutes = serializer.validated_data.get('idle_minutes', 30)
        
        conn_manager = ConnectionManager()
        result = {'action': action, 'success': True, 'details': {}}
        
        try:
            if action == 'close':
                if tenant_id:
                    conn_manager.close_connection(tenant_id)
                    result['details'] = {'tenant_id': tenant_id, 'closed': True}
            
            elif action == 'reset':
                if tenant_id:
                    conn_manager.close_connection(tenant_id)
                    # New connection will be created on next use
                    result['details'] = {
                        'tenant_id': tenant_id,
                        'reset': True,
                        'message': 'Connection reset. Next request will create new connection.'
                    }
            
            elif action == 'recycle':
                count = conn_manager.close_all_connections()
                result['details'] = {
                    'connections_closed': count,
                    'message': f'Recycled {count} connections'
                }
            
            elif action == 'close_all_idle':
                count = conn_manager.close_idle_connections(idle_minutes=idle_minutes)
                result['details'] = {
                    'connections_closed': count,
                    'idle_minutes': idle_minutes,
                    'message': f'Closed {count} idle connections'
                }
            
            # Log the action
            self._log_manager_action(request.user, action, result['details'])
            
        except Exception as e:
            result['success'] = False
            result['error'] = str(e)
            logger.error(f"Manager action {action} failed: {str(e)}")
            return Response(result, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response(result, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], url_path='close-idle')
    def close_idle_connections(self, request):
        """
        Close connections idle for specified minutes
        
        Closes all connections idle for more than the specified minutes.
        """
        self._check_super_admin_permission()
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        idle_minutes = serializer.validated_data.get('idle_minutes', 30)
        
        conn_manager = ConnectionManager()
        count = conn_manager.close_idle_connections(idle_minutes=idle_minutes)
        
        return Response({
            'message': f'Successfully closed {count} idle connections',
            'idle_minutes': idle_minutes,
            'connections_closed': count
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'], url_path='status')
    def get_status(self, request, pk=None):
        """
        Get detailed status of a specific connection
        
        Returns real-time status from the connection manager.
        """
        connection = self.get_object()
        
        if not self._can_view_connection(connection):
            raise PermissionDenied("You don't have permission to view this connection")
        
        conn_manager = ConnectionManager()
        manager_status = conn_manager.get_connection_status(str(connection.tenant_id))
        
        return Response({
            'connection': ConnectionPoolDetailSerializer(connection).data,
            'manager_status': manager_status
        }, status=status.HTTP_200_OK)

    # ==================== Helper Methods ====================
    
    def _can_manage_connection(self, connection):
        """Check if user can manage this connection"""
        user = self.request.user
        if user.role == 'super_admin':
            return True
        if user.role == 'client_admin' and connection.tenant_id == user.tenant_id:
            return True
        return False

    def _can_view_connection(self, connection):
        """Check if user can view this connection"""
        return self._can_manage_connection(connection)

    def _check_super_admin_permission(self):
        """Ensure user is super admin"""
        if self.request.user.role != 'super_admin':
            raise PermissionDenied("Super admin access required")

    def _check_super_admin_or_client_admin_permission(self):
        """Ensure user is super admin or client admin"""
        if self.request.user.role not in ['super_admin', 'client_admin']:
            raise PermissionDenied("Admin access required")

    def _health_check_all_tenants(self):
        """Perform health check for all active tenants"""
        tenants = Client.objects.filter(is_active=True)
        results = []
        
        for tenant in tenants:
            result = self._check_tenant_health(str(tenant.id))
            results.append(result)
        
        return Response({
            'tenants_checked': len(results),
            'healthy_tenants': sum(1 for r in results if r['is_healthy']),
            'unhealthy_tenants': sum(1 for r in results if not r['is_healthy']),
            'results': results
        }, status=status.HTTP_200_OK)

    def _check_tenant_health(self, tenant_id):
        """Check health of a specific tenant's database connection"""
        start_time = timezone.now()
        is_healthy = False
        error_message = ""
        connection_status = "unknown"
        
        try:
            conn_manager = ConnectionManager()
            conn = conn_manager.get_connection(tenant_id)
            
            # Test query
            with conn.cursor() as cursor:
                cursor.execute("SELECT 1")
                cursor.fetchone()
            
            response_time = (timezone.now() - start_time).total_seconds() * 1000
            is_healthy = True
            connection_status = "active"
            
        except Exception as e:
            response_time = (timezone.now() - start_time).total_seconds() * 1000
            error_message = str(e)
            connection_status = "error"
            logger.warning(f"Health check failed for tenant {tenant_id}: {error_message}")
        
        # Get last successful connection
        last_successful = ConnectionPool.objects.filter(
            tenant_id=tenant_id,
            status=ConnectionStatus.ACTIVE
        ).order_by('-last_used_at').first()
        
        return {
            'tenant_id': tenant_id,
            'is_healthy': is_healthy,
            'response_time_ms': int(response_time),
            'error_message': error_message,
            'last_successful_check': last_successful.last_used_at if last_successful else None,
            'connection_status': connection_status,
        }

    def _log_manager_action(self, user, action, details):
        """Log manager actions for audit trail"""
        try:
            from apps.accounts.services.audit.logger import AuditService
            audit_service = AuditService()
            audit_service.log(
                user=user,
                action=f'connection_manager.{action}',
                action_type='management',
                severity='info',
                metadata={
                    'action': action,
                    'details': details,
                    'ip_address': getattr(self.request, 'META', {}).get('REMOTE_ADDR', '')
                }
            )
        except Exception as e:
            logger.warning(f"Failed to log manager action: {str(e)}")