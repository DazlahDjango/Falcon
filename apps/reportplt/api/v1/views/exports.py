# apps/reportplt/api/v1/views/exports.py
from django.db import transaction
from django.http import FileResponse, HttpResponse
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.core.files.storage import default_storage
from apps.reportplt.models import ReportExport
from apps.reportplt.api.v1.serializers import (
    ExportListSerializer, ExportDetailSerializer,
    ExportCreateSerializer, ExportDownloadSerializer
)
from apps.reportplt.api.v1.permissions import ExportViewPermission, ExportCreatePermission, ExportDownloadPermission
from apps.reportplt.api.v1.decorators import audit_log, rate_limit
from apps.reportplt.services.export.export_factory import ExportFactory
from apps.reportplt.services.security.export_security import ExportSecurity
from apps.reportplt.constants import AuditAction
from rest_framework.permissions import IsAuthenticated
from apps.reportplt.api.v1.permissions import TenantIsolationPermission
from .base import BaseModelViewSet

class ExportViewSet(BaseModelViewSet):
    queryset = ReportExport.objects.all()
    search_fields = ['file_name', 'report__name']
    ordering_fields = ['created_at', 'file_size', 'download_count']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = super().get_queryset().filter(is_deleted=False)
        if not self.request.user.is_superuser and self.request.user.role != 'super_admin':
            if self.request.user.role not in ['client_admin', 'executive']:
                queryset = queryset.filter(exported_by=self.request.user)
        return queryset

    def get_serializer_class(self):
        if self.action == 'list':
            return ExportListSerializer
        elif self.action == 'create':
            return ExportCreateSerializer
        elif self.action == 'retrieve':
            return ExportDetailSerializer
        elif self.action == 'download':
            return ExportDownloadSerializer
        return ExportDetailSerializer

    def get_permissions(self):
        if self.action == 'list':
            permission_classes = [IsAuthenticated, TenantIsolationPermission, ExportViewPermission]
        elif self.action == 'retrieve':
            permission_classes = [IsAuthenticated, TenantIsolationPermission, ExportViewPermission]
        elif self.action == 'create':
            permission_classes = [IsAuthenticated, TenantIsolationPermission, ExportCreatePermission]
        elif self.action == 'download':
            permission_classes = [IsAuthenticated, TenantIsolationPermission, ExportDownloadPermission]
        elif self.action == 'destroy':
            permission_classes = [IsAuthenticated, TenantIsolationPermission, ExportViewPermission]
        else:
            permission_classes = [IsAuthenticated, TenantIsolationPermission]
        return [permission() for permission in permission_classes]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        from apps.reportplt.services.generation.report_generator import ReportGenerator
        generator = ReportGenerator(request.user)
        result = generator.generate_and_export(
            report_id=str(serializer.validated_data['report_id']),
            format=serializer.validated_data['format'],
            params=serializer.validated_data.get('params', {})
        )
        if result.get('status') == 'success':
            return Response({
                'status': 'success',
                'export_id': result.get('export_id'),
                'download_url': request.build_absolute_uri(f"/api/v1/exports/{result.get('export_id')}/download/")
            }, status=status.HTTP_201_CREATED)
        return Response(result, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'], url_path='download')
    @audit_log(action=AuditAction.VIEW)
    @rate_limit(rate='20/hour')
    def download(self, request, pk=None):
        export = self.get_object()
        if not export.is_ready():
            return Response({'error': 'Export not ready for download'}, status=status.HTTP_400_BAD_REQUEST)
        if export.is_expired():
            return Response({'error': 'Export has expired'}, status=status.HTTP_410_GONE)
        if not default_storage.exists(export.file_path):
            return Response({'error': 'File not found'}, status=status.HTTP_404_NOT_FOUND)
        export.record_download()
        file = default_storage.open(export.file_path, 'rb')
        response = FileResponse(file, content_type=export.mime_type or 'application/octet-stream')
        response['Content-Disposition'] = f'attachment; filename="{export.file_name}"'
        return response

    @action(detail=True, methods=['post'], url_path='regenerate')
    @audit_log(action=AuditAction.EDIT)
    def regenerate(self, request, pk=None):
        export = self.get_object()
        if export.status == 'processing':
            return Response({'error': 'Export is already being processed'}, status=status.HTTP_400_BAD_REQUEST)
        from apps.reportplt.services.generation.report_generator import ReportGenerator
        generator = ReportGenerator(request.user)
        result = generator.generate_and_export(
            report_id=str(export.report.id),
            format=export.format,
            params=export.export_config.get('params', {})
        )
        if result.get('status') == 'success':
            export.file_path = result.get('export_path')
            export.status = 'completed'
            export.save(update_fields=['file_path', 'status'])
            return Response({'status': 'success', 'export_id': str(export.id)})
        return Response(result, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'], url_path='formats')
    def formats(self, request):
        from apps.reportplt.constants import ReportFormat
        return Response([{'value': f[0], 'label': f[1]} for f in ReportFormat.CHOICES])

    @action(detail=False, methods=['get'], url_path='my')
    def my_exports(self, request):
        queryset = self.get_queryset().filter(exported_by=request.user)
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)