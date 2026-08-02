# apps/reportplt/api/v1/views/reports.py
from django.db import transaction
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from apps.reportplt.models import Report
from apps.reportplt.api.v1.serializers import (
    ReportListSerializer, ReportDetailSerializer, ReportCreateSerializer,
    ReportUpdateSerializer, ReportGenerateSerializer, ReportExportSerializer,
    ReportStatusSerializer, ReportActionSerializer
)
from apps.reportplt.api.v1.permissions import (
    ReportViewPermission, ReportCreatePermission, ReportEditPermission,
    ReportDeletePermission, ReportExportPermission, ReportGeneratePermission
)
from apps.reportplt.api.v1.throttles import ReportGenerationThrottle, ReportExportThrottle
from apps.reportplt.api.v1.decorators import audit_log, rate_limit, tenant_isolation
from apps.reportplt.services.generation.report_generator import ReportGenerator
from apps.reportplt.services.security.report_rbac import ReportRBAC
from apps.reportplt.services.export.export_factory import ExportFactory
from apps.reportplt.constants import AuditAction
from rest_framework.permissions import IsAuthenticated
from apps.reportplt.api.v1.permissions import TenantIsolationPermission
from .base import BaseModelViewSet

class ReportViewSet(BaseModelViewSet):
    queryset = Report.objects.all()
    permission_classes = [IsAuthenticated, TenantIsolationPermission]
    search_fields = ['name', 'description', 'tags']
    ordering_fields = ['name', 'created_at', 'updated_at', 'last_generated_at', 'status']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = super().get_queryset().filter(is_deleted=False)
        if not self.request.user.is_superuser and self.request.user.role != 'super_admin':
            rbac = ReportRBAC(self.request.user)
            accessible_ids = []
            for report in queryset:
                if rbac.can_view_report(report):
                    accessible_ids.append(report.id)
            queryset = queryset.filter(id__in=accessible_ids)
        return queryset

    def get_serializer_class(self):
        if self.action == 'list':
            return ReportListSerializer
        elif self.action == 'create':
            return ReportCreateSerializer
        elif self.action == 'update' or self.action == 'partial_update':
            return ReportUpdateSerializer
        elif self.action == 'retrieve':
            return ReportDetailSerializer
        elif self.action == 'generate':
            return ReportGenerateSerializer
        elif self.action == 'export':
            return ReportExportSerializer
        elif self.action == 'update_status':
            return ReportStatusSerializer
        elif self.action == 'trigger_action':
            return ReportActionSerializer
        return ReportDetailSerializer

    def get_permissions(self):
        if self.action == 'list':
            permission_classes = [IsAuthenticated, TenantIsolationPermission, ReportViewPermission]
        elif self.action == 'retrieve':
            permission_classes = [IsAuthenticated, TenantIsolationPermission, ReportViewPermission]
        elif self.action == 'create':
            permission_classes = [IsAuthenticated, TenantIsolationPermission, ReportCreatePermission]
        elif self.action in ['update', 'partial_update']:
            permission_classes = [IsAuthenticated, TenantIsolationPermission, ReportEditPermission]
        elif self.action == 'destroy':
            permission_classes = [IsAuthenticated, TenantIsolationPermission, ReportDeletePermission]
        elif self.action == 'generate':
            permission_classes = [IsAuthenticated, TenantIsolationPermission, ReportGeneratePermission]
        elif self.action == 'export':
            permission_classes = [IsAuthenticated, TenantIsolationPermission, ReportExportPermission]
        else:
            permission_classes = [IsAuthenticated, TenantIsolationPermission]
        return [permission() for permission in permission_classes]

    def get_throttles(self):
        if self.action == 'generate':
            return [ReportGenerationThrottle()]
        elif self.action == 'export':
            return [ReportExportThrottle()]
        return super().get_throttles()

    @action(detail=True, methods=['post'], url_path='generate')
    @audit_log(action=AuditAction.GENERATE)
    @rate_limit(rate='5/hour')
    def generate(self, request, pk=None):
        report = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        generator = ReportGenerator(request.user)
        result = generator.generate_report(
            report_id=str(report.id),
            params=serializer.validated_data.get('params', {}),
            async_mode=serializer.validated_data.get('async_mode', False)
        )
        if result.get('status') in ['success', 'queued']:
            return Response(result, status=status.HTTP_200_OK)
        return Response(result, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], url_path='export')
    @audit_log(action=AuditAction.EXPORT)
    @rate_limit(rate='10/hour')
    def export(self, request, pk=None):
        report = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        generator = ReportGenerator(request.user)
        result = generator.generate_and_export(
            report_id=str(report.id),
            format=serializer.validated_data['format'],
            params=serializer.validated_data.get('params', {})
        )
        if result.get('status') == 'success':
            from apps.reportplt.models import ReportExport
            export = ReportExport.objects.create(
                tenant_id=report.tenant_id,
                report=report,
                format=serializer.validated_data['format'],
                status='completed',
                exported_by=request.user,
                file_path=result.get('export_path'),
                file_name=f"{report.name}_{timezone.now().strftime('%Y%m%d_%H%M%S')}.{serializer.validated_data['format']}"
            )
            return Response({
                'status': 'success',
                'export_id': str(export.id),
                'download_url': request.build_absolute_uri(f"/api/v1/exports/{export.id}/download/")
            }, status=status.HTTP_200_OK)
        return Response(result, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['patch'], url_path='status')
    @audit_log(action=AuditAction.EDIT)
    def update_status(self, request, pk=None):
        report = self.get_object()
        serializer = self.get_serializer(report, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    @action(detail=True, methods=['post'], url_path='action')
    @audit_log(action=AuditAction.EDIT)
    def trigger_action(self, request, pk=None):
        report = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        action = serializer.validated_data['action']
        if action == 'publish':
            report.is_published = True
            report.save(update_fields=['is_published'])
        elif action == 'unpublish':
            report.is_published = False
            report.save(update_fields=['is_published'])
        elif action == 'archive':
            report.is_archived = True
            report.status = 'archived'
            report.save(update_fields=['is_archived', 'status'])
        elif action == 'restore':
            report.is_archived = False
            report.status = 'draft'
            report.save(update_fields=['is_archived', 'status'])
        elif action == 'refresh':
            report.needs_refresh = True
            report.save(update_fields=['needs_refresh'])
            generator = ReportGenerator(request.user)
            generator.regenerate_report(str(report.id))
        return Response({'status': 'success', 'action': action})

    @action(detail=False, methods=['get'], url_path='my')
    def my_reports(self, request):
        queryset = self.get_queryset().filter(owner=request.user)
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='public')
    def public_reports(self, request):
        queryset = self.get_queryset().filter(is_public=True, is_published=True)
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='types')
    def report_types(self, request):
        from apps.reportplt.constants import ReportType
        return Response([{'value': t[0], 'label': t[1]} for t in ReportType.CHOICES])

    @action(detail=False, methods=['get'], url_path='statuses')
    def report_statuses(self, request):
        from apps.reportplt.constants import ReportStatus
        return Response([{'value': s[0], 'label': s[1]} for s in ReportStatus.CHOICES])