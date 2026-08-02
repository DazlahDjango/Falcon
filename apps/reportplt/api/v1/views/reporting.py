# apps/reportplt/api/v1/views/reporting.py
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from apps.reportplt.api.v1.serializers import ReportGenerateSerializer, ReportExportSerializer
from apps.reportplt.api.v1.permissions import ReportGeneratePermission, ReportExportPermission
from apps.reportplt.api.v1.throttles import ReportGenerationThrottle, ReportExportThrottle
from apps.reportplt.api.v1.decorators import audit_log, rate_limit
from apps.reportplt.services.generation.report_generator import ReportGenerator
from apps.reportplt.services.export.export_factory import ExportFactory
from apps.reportplt.constants import AuditAction
from rest_framework.permissions import IsAuthenticated
from apps.reportplt.api.v1.permissions import TenantIsolationPermission
from .base import BaseViewSet

class ReportingViewSet(BaseViewSet):
    permission_classes = [IsAuthenticated, TenantIsolationPermission]

    def get_permissions(self):
        if self.action == 'generate':
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

    @action(detail=False, methods=['post'], url_path='generate')
    @audit_log(action=AuditAction.GENERATE)
    @rate_limit(rate='10/hour')
    def generate(self, request):
        serializer = ReportGenerateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        report_id = serializer.validated_data.get('report_id')
        if not report_id:
            return Response({'report_id': ['This field is required.']}, status=status.HTTP_400_BAD_REQUEST)
        params = serializer.validated_data.get('params', {})
        async_mode = serializer.validated_data.get('async_mode', False)
        generator = ReportGenerator(request.user)
        result = generator.generate_report(
            report_id=report_id,
            params=params,
            async_mode=async_mode
        )
        if result.get('status') in ['success', 'queued']:
            return Response(result, status=status.HTTP_200_OK)
        return Response(result, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], url_path='export')
    @audit_log(action=AuditAction.EXPORT)
    @rate_limit(rate='20/hour')
    def export(self, request):
        serializer = ReportExportSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        report_id = serializer.validated_data.get('report_id')
        if not report_id:
            return Response({'report_id': ['This field is required.']}, status=status.HTTP_400_BAD_REQUEST)
        format = serializer.validated_data['format']
        params = serializer.validated_data.get('params', {})
        generator = ReportGenerator(request.user)
        result = generator.generate_and_export(
            report_id=report_id,
            format=format,
            params=params
        )
        if result.get('status') == 'success':
            from apps.reportplt.models import ReportExport
            from apps.reportplt.models import Report
            try:
                report = Report.objects.get(id=report_id)
                export = ReportExport.objects.create(
                    tenant_id=report.tenant_id,
                    report=report,
                    format=format,
                    status='completed',
                    exported_by=request.user,
                    file_path=result.get('export_path'),
                    file_name=f"{report.name}_{timezone.now().strftime('%Y%m%d_%H%M%S')}.{format}"
                )
                return Response({
                    'status': 'success',
                    'export_id': str(export.id),
                    'download_url': request.build_absolute_uri(f"/api/v1/exports/{export.id}/download/")
                }, status=status.HTTP_200_OK)
            except Report.DoesNotExist:
                pass
            return Response(result, status=status.HTTP_200_OK)
        return Response(result, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], url_path='bulk-export')
    @audit_log(action=AuditAction.EXPORT)
    @rate_limit(rate='5/hour')
    def bulk_export(self, request):
        report_ids = request.data.get('report_ids', [])
        format = request.data.get('format', 'pdf')
        if not report_ids:
            return Response({'error': 'report_ids is required'}, status=status.HTTP_400_BAD_REQUEST)
        results = []
        generator = ReportGenerator(request.user)
        for report_id in report_ids:
            try:
                result = generator.generate_and_export(
                    report_id=report_id,
                    format=format
                )
                results.append({
                    'report_id': report_id,
                    'status': result.get('status', 'failed'),
                    'export_path': result.get('export_path'),
                    'error': result.get('error')
                })
            except Exception as e:
                results.append({
                    'report_id': report_id,
                    'status': 'failed',
                    'error': str(e)
                })
        return Response({
            'status': 'completed',
            'results': results,
            'total': len(results),
            'successful': len([r for r in results if r.get('status') == 'success'])
        })

    @action(detail=False, methods=['get'], url_path='status/(?P<task_id>[^/.]+)')
    def status(self, request, task_id=None):
        from celery.result import AsyncResult
        result = AsyncResult(task_id)
        response = {
            'task_id': task_id,
            'status': result.state,
            'ready': result.ready()
        }
        if result.ready():
            response['result'] = result.result
        return Response(response)