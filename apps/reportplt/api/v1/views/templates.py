# apps/reportplt/api/v1/views/templates.py
from django.db import transaction
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from apps.reportplt.models import ReportTemplate
from apps.reportplt.api.v1.serializers import (
    TemplateListSerializer, TemplateDetailSerializer,
    TemplateCreateSerializer, TemplateUpdateSerializer,
    TemplateActionSerializer
)
from apps.reportplt.api.v1.permissions import (
    TemplateViewPermission, TemplateCreatePermission,
    TemplateEditPermission, TemplateDeletePermission
)
from apps.reportplt.api.v1.decorators import audit_log
from apps.reportplt.services.templates.template_manager import TemplateManager
from apps.reportplt.services.templates.prebuilt_templates import PrebuiltTemplates
from apps.reportplt.constants import AuditAction
from rest_framework.permissions import IsAuthenticated
from apps.reportplt.api.v1.permissions import TenantIsolationPermission
from .base import BaseModelViewSet

class TemplateViewSet(BaseModelViewSet):
    queryset = ReportTemplate.objects.all()
    search_fields = ['name', 'description', 'category']
    ordering_fields = ['name', 'created_at', 'updated_at', 'version']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = super().get_queryset().filter(is_deleted=False)
        if not self.request.user.is_superuser and self.request.user.role != 'super_admin':
            queryset = queryset.filter(
                models.Q(is_published=True) |
                models.Q(owner=self.request.user)
            )
        return queryset

    def get_serializer_class(self):
        if self.action == 'list':
            return TemplateListSerializer
        elif self.action == 'create':
            return TemplateCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return TemplateUpdateSerializer
        elif self.action == 'retrieve':
            return TemplateDetailSerializer
        elif self.action == 'trigger_action':
            return TemplateActionSerializer
        return TemplateDetailSerializer

    def get_permissions(self):
        if self.action == 'list':
            permission_classes = [IsAuthenticated, TenantIsolationPermission, TemplateViewPermission]
        elif self.action == 'retrieve':
            permission_classes = [IsAuthenticated, TenantIsolationPermission, TemplateViewPermission]
        elif self.action == 'create':
            permission_classes = [IsAuthenticated, TenantIsolationPermission, TemplateCreatePermission]
        elif self.action in ['update', 'partial_update']:
            permission_classes = [IsAuthenticated, TenantIsolationPermission, TemplateEditPermission]
        elif self.action == 'destroy':
            permission_classes = [IsAuthenticated, TenantIsolationPermission, TemplateDeletePermission]
        else:
            permission_classes = [IsAuthenticated, TenantIsolationPermission]
        return [permission() for permission in permission_classes]

    @action(detail=True, methods=['post'], url_path='action')
    @audit_log(action=AuditAction.EDIT)
    def trigger_action(self, request, pk=None):
        template = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        action = serializer.validated_data['action']
        manager = TemplateManager(request.user)
        if action == 'publish':
            manager.publish_template(str(template.id))
        elif action == 'unpublish':
            manager.unpublish_template(str(template.id))
        elif action == 'set_default':
            manager.set_default_template(str(template.id))
        elif action == 'duplicate':
            new_name = serializer.validated_data.get('new_name')
            manager.duplicate_template(str(template.id), new_name)
        return Response({'status': 'success', 'action': action})

    @action(detail=True, methods=['post'], url_path='apply')
    @audit_log(action=AuditAction.EDIT)
    def apply_to_report(self, request, pk=None):
        template = self.get_object()
        report_id = request.data.get('report_id')
        if not report_id:
            return Response({'error': 'report_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        manager = TemplateManager(request.user)
        result = manager.apply_template_to_report(str(template.id), report_id)
        return Response({'status': 'success', 'report_id': report_id})

    @action(detail=False, methods=['get'], url_path='prebuilt')
    def prebuilt_templates(self, request):
        prebuilt = PrebuiltTemplates()
        templates = prebuilt.get_all_prebuilt_templates()
        return Response(templates)

    @action(detail=False, methods=['get'], url_path='default')
    def default_templates(self, request):
        manager = TemplateManager(request.user)
        templates = manager.get_default_templates()
        serializer = self.get_serializer(templates, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='popular')
    def popular_templates(self, request):
        manager = TemplateManager(request.user)
        templates = manager.get_popular_templates()
        serializer = self.get_serializer(templates, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='sector/(?P<sector>[^/.]+)')
    def by_sector(self, request, sector=None):
        manager = TemplateManager(request.user)
        templates = manager.get_sector_specific_templates(sector)
        serializer = self.get_serializer(templates, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='types')
    def template_types(self, request):
        from apps.reportplt.constants import TemplateType
        return Response([{'value': t[0], 'label': t[1]} for t in TemplateType.CHOICES])