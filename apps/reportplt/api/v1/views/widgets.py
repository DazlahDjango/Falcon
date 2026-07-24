# apps/reportplt/api/v1/views/widgets.py
from django.db import transaction
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from apps.reportplt.models import ReportWidget
from apps.reportplt.api.v1.serializers import (
    WidgetListSerializer, WidgetDetailSerializer,
    WidgetCreateSerializer, WidgetUpdateSerializer,
    WidgetDataSerializer, WidgetActionSerializer
)
from apps.reportplt.api.v1.permissions import DashboardViewPermission, DashboardEditPermission
from apps.reportplt.api.v1.decorators import audit_log
from apps.reportplt.services.dashboard.widget_engine import WidgetEngine
from apps.reportplt.services.dashboard.widget_data_fetcher import WidgetDataFetcher
from apps.reportplt.services.dashboard.realtime_dashboard import RealtimeDashboard
from apps.reportplt.constants import AuditAction
from rest_framework.permissions import IsAuthenticated
from apps.reportplt.api.v1.permissions import TenantIsolationPermission
from .base import BaseModelViewSet

class WidgetViewSet(BaseModelViewSet):
    queryset = ReportWidget.objects.all()
    search_fields = ['name', 'title']
    ordering_fields = ['name', 'created_at', 'updated_at']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = super().get_queryset().filter(is_deleted=False)
        return queryset

    def get_serializer_class(self):
        if self.action == 'list':
            return WidgetListSerializer
        elif self.action == 'create':
            return WidgetCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return WidgetUpdateSerializer
        elif self.action == 'retrieve':
            return WidgetDetailSerializer
        elif self.action == 'data':
            return WidgetDataSerializer
        elif self.action == 'trigger_action':
            return WidgetActionSerializer
        return WidgetDetailSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'data']:
            permission_classes = [IsAuthenticated, TenantIsolationPermission, DashboardViewPermission]
        else:
            permission_classes = [IsAuthenticated, TenantIsolationPermission, DashboardEditPermission]
        return [permission() for permission in permission_classes]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        realtime = RealtimeDashboard()
        realtime.broadcast_dashboard_update(str(serializer.instance.dashboard_id))
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        realtime = RealtimeDashboard()
        realtime.broadcast_widget_update(str(instance.id))
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        dashboard_id = instance.dashboard_id
        self.perform_destroy(instance)
        realtime = RealtimeDashboard()
        realtime.broadcast_dashboard_update(str(dashboard_id))
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['get'], url_path='data')
    def data(self, request, pk=None):
        widget = self.get_object()
        fetcher = WidgetDataFetcher()
        engine = WidgetEngine()
        data = fetcher.fetch_widget_data(widget)
        rendered = engine.render_widget(widget)
        return Response({
            'widget_id': str(widget.id),
            'widget_type': widget.widget_type,
            'title': widget.title or widget.name,
            'data': rendered
        })

    @action(detail=True, methods=['post'], url_path='action')
    @audit_log(action=AuditAction.EDIT)
    def trigger_action(self, request, pk=None):
        widget = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        action = serializer.validated_data['action']
        if action == 'activate':
            widget.is_active = True
        elif action == 'deactivate':
            widget.is_active = False
        elif action == 'show':
            widget.is_visible = True
        elif action == 'hide':
            widget.is_visible = False
        elif action == 'refresh':
            pass
        widget.save(update_fields=['is_active', 'is_visible'])
        realtime = RealtimeDashboard()
        realtime.broadcast_widget_update(str(widget.id))
        return Response({'status': 'success', 'action': action})

    @action(detail=True, methods=['post'], url_path='refresh')
    @audit_log(action=AuditAction.REFRESH)
    def refresh(self, request, pk=None):
        widget = self.get_object()
        realtime = RealtimeDashboard()
        realtime.broadcast_widget_update(str(widget.id))
        return Response({'status': 'success', 'refreshed_at': timezone.now().isoformat()})

    @action(detail=False, methods=['get'], url_path='types')
    def widget_types(self, request):
        from apps.reportplt.constants import WidgetType
        return Response([{'value': t[0], 'label': t[1]} for t in WidgetType.CHOICES])

    @action(detail=False, methods=['get'], url_path='dashboard/(?P<dashboard_id>[^/.]+)')
    def by_dashboard(self, request, dashboard_id=None):
        queryset = self.get_queryset().filter(dashboard_id=dashboard_id, is_active=True)
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)