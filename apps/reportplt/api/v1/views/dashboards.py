# apps/reportplt/api/v1/views/dashboards.py
from django.db import transaction
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from apps.reportplt.models import ReportDashboard
from apps.reportplt.api.v1.serializers import (
    DashboardListSerializer, DashboardDetailSerializer,
    DashboardCreateSerializer, DashboardUpdateSerializer,
    DashboardLayoutSerializer, DashboardActionSerializer
)
from apps.reportplt.api.v1.permissions import (
    DashboardViewPermission, DashboardEditPermission,
    DashboardDeletePermission, DashboardSharePermission
)
from apps.reportplt.api.v1.decorators import audit_log
from apps.reportplt.services.dashboard.dashboard_builder import DashboardBuilder
from apps.reportplt.services.dashboard.realtime_dashboard import RealtimeDashboard
from apps.reportplt.constants import AuditAction
from rest_framework.permissions import IsAuthenticated
from apps.reportplt.api.v1.permissions import TenantIsolationPermission
from .base import BaseModelViewSet

class DashboardViewSet(BaseModelViewSet):
    queryset = ReportDashboard.objects.all()
    search_fields = ['name', 'description', 'tags']
    ordering_fields = ['name', 'created_at', 'updated_at', 'view_count']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = super().get_queryset().filter(is_deleted=False)
        if not self.request.user.is_superuser and self.request.user.role != 'super_admin':
            if self.request.user.role not in ['client_admin', 'hr_admin', 'executive']:
                queryset = queryset.filter(
                    models.Q(owner=self.request.user) |
                    models.Q(is_shared=True, allowed_roles__contains=[self.request.user.role]) |
                    models.Q(is_shared=True, allowed_departments__contains=[self.request.user.department])
                )
        return queryset

    def get_serializer_class(self):
        if self.action == 'list':
            return DashboardListSerializer
        elif self.action == 'create':
            return DashboardCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return DashboardUpdateSerializer
        elif self.action == 'retrieve':
            return DashboardDetailSerializer
        elif self.action == 'update_layout':
            return DashboardLayoutSerializer
        elif self.action == 'trigger_action':
            return DashboardActionSerializer
        return DashboardDetailSerializer

    def get_permissions(self):
        if self.action == 'list':
            permission_classes = [IsAuthenticated, TenantIsolationPermission, DashboardViewPermission]
        elif self.action == 'retrieve':
            permission_classes = [IsAuthenticated, TenantIsolationPermission, DashboardViewPermission]
        elif self.action == 'create':
            permission_classes = [IsAuthenticated, TenantIsolationPermission]
        elif self.action in ['update', 'partial_update']:
            permission_classes = [IsAuthenticated, TenantIsolationPermission, DashboardEditPermission]
        elif self.action == 'destroy':
            permission_classes = [IsAuthenticated, TenantIsolationPermission, DashboardDeletePermission]
        elif self.action == 'share':
            permission_classes = [IsAuthenticated, TenantIsolationPermission, DashboardSharePermission]
        else:
            permission_classes = [IsAuthenticated, TenantIsolationPermission]
        return [permission() for permission in permission_classes]

    @action(detail=True, methods=['post'], url_path='action')
    @audit_log(action=AuditAction.EDIT)
    def trigger_action(self, request, pk=None):
        dashboard = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        action = serializer.validated_data['action']
        builder = DashboardBuilder(request.user)
        if action == 'set_default':
            builder.set_default_dashboard(str(dashboard.id))
        elif action == 'publish':
            builder.publish_dashboard(str(dashboard.id))
        elif action == 'unpublish':
            builder.unpublish_dashboard(str(dashboard.id))
        elif action == 'share':
            roles = serializer.validated_data.get('roles', [])
            users = serializer.validated_data.get('users', [])
            departments = serializer.validated_data.get('departments', [])
            builder.share_dashboard(str(dashboard.id), roles, users, departments)
        elif action == 'unshare':
            builder.unshare_dashboard(str(dashboard.id))
        elif action == 'duplicate':
            new_name = serializer.validated_data.get('new_name')
            builder.duplicate_dashboard(str(dashboard.id), new_name)
        return Response({'status': 'success', 'action': action})

    @action(detail=True, methods=['post'], url_path='layout')
    @audit_log(action=AuditAction.EDIT)
    def update_layout(self, request, pk=None):
        dashboard = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        dashboard.layout = serializer.validated_data['layout']
        dashboard.save(update_fields=['layout'])
        realtime = RealtimeDashboard()
        realtime.broadcast_dashboard_update(str(dashboard.id))
        return Response({'status': 'success'})

    @action(detail=True, methods=['post'], url_path='refresh')
    @audit_log(action=AuditAction.REFRESH)
    def refresh(self, request, pk=None):
        dashboard = self.get_object()
        realtime = RealtimeDashboard()
        realtime.broadcast_dashboard_update(str(dashboard.id))
        return Response({'status': 'success', 'refreshed_at': timezone.now().isoformat()})

    @action(detail=True, methods=['post'], url_path='record-view')
    def record_view(self, request, pk=None):
        dashboard = self.get_object()
        dashboard.record_view(request.user)
        return Response({'status': 'success', 'view_count': dashboard.view_count})

    @action(detail=False, methods=['get'], url_path='my')
    def my_dashboards(self, request):
        queryset = self.get_queryset().filter(owner=request.user)
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='default')
    def default_dashboard(self, request):
        builder = DashboardBuilder(request.user)
        dashboard = builder.get_default_dashboard()
        if dashboard:
            serializer = self.get_serializer(dashboard)
            return Response(serializer.data)
        return Response({'error': 'No default dashboard found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['get'], url_path='types')
    def dashboard_types(self, request):
        from apps.reportplt.constants import DashboardType
        return Response([{'value': t[0], 'label': t[1]} for t in DashboardType.CHOICES])