"""
Audit log views for viewing audit logs.
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.permissions import IsAuthenticated
from apps.accounts.models import AuditLog
from apps.accounts.services.audit.reporter import AuditReporterService
from apps.accounts.api.v1.serializers import (
    AuditLogSerializer, AuditLogListSerializer, AuditLogDetailSerializer,
    AuditLogExportSerializer
)
from apps.accounts.api.v1.filters import AuditLogFilter
from apps.accounts.api.v1.permissions import IsSuperAdmin, IsClientAdmin, IsExecutive
from .base import BaseReadOnlyViewset


class AuditLogViewSet(BaseReadOnlyViewset):
    queryset = AuditLog.objects.all()
    filterset_class = AuditLogFilter
    search_fields = ['action', 'ip_address', 'object_repr']
    ordering_fields = ['timestamp', 'created_at']
    ordering = ['-timestamp']
    def get_serializer_class(self):
        if self.action == 'list':
            return AuditLogListSerializer
        elif self.action == 'retrieve':
            return AuditLogDetailSerializer
        return AuditLogSerializer
    
    def get_permissions(self):
        if self.action in ['export', 'user_activity', 'tenant_activity', 'security_events', 'compliance_report']:
            self.permission_classes = [IsAuthenticated, IsClientAdmin]
        else:
            self.permission_classes = [IsAuthenticated, IsExecutive]
        
        return super().get_permissions()
    
    @action(detail=False, methods=['get'], url_path='user/(?P<user_id>[^/.]+)')
    def user_activity(self, request, user_id=None):
        days = int(request.query_params.get('days', 30))
        
        audit_reporter = AuditReporterService()
        activity = audit_reporter.get_user_activity(user_id, days)
        serializer = AuditLogListSerializer(activity, many=True, context={'request': request})
        return Response({
            'user_id': user_id,
            'days': days,
            'count': len(activity),
            'activities': serializer.data
        }, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'], url_path='user-summary')
    def user_summary(self, request):
        days = int(request.query_params.get('days', 30))
        
        audit_reporter = AuditReporterService()
        summary = audit_reporter.get_user_activity_summary(str(request.user.id), days)
        return Response(summary, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'], url_path='tenant-summary')
    def tenant_summary(self, request):
        days = int(request.query_params.get('days', 30))
        audit_reporter = AuditReporterService()
        summary = audit_reporter.get_tenant_activity(str(request.user.tenant_id), days)
        return Response(summary, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'], url_path='security-events')
    def security_events(self, request):
        days = int(request.query_params.get('days', 30))
        audit_reporter = AuditReporterService()
        events = audit_reporter.get_security_events(str(request.user.tenant_id), days)
        serializer = AuditLogListSerializer(events, many=True, context={'request': request})
        return Response({
            'days': days,
            'count': len(events),
            'events': serializer.data
        }, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['post'], url_path='export')
    def export(self, request):
        serializer = AuditLogExportSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        start_date = serializer.validated_data['start_date']
        end_date = serializer.validated_data['end_date']
        export_format = serializer.validated_data.get('format', 'json')
        audit_reporter = AuditReporterService()
        
        if export_format == 'json':
            data = audit_reporter.export_audit_logs(
                tenant_id=str(request.user.tenant_id),
                start_date=start_date,
                end_date=end_date,
                format='json'
            )
            return Response(data, status=status.HTTP_200_OK)
        return Response({'message': f'Export in {export_format} format'}, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'], url_path='compliance-report')
    def compliance_report(self, request):
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        if not start_date or not end_date:
            return Response(
                {'error': 'start_date and end_date are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        from datetime import datetime
        start = datetime.strptime(start_date, '%Y-%m-%d').date()
        end = datetime.strptime(end_date, '%Y-%m-%d').date()
        audit_reporter = AuditReporterService()
        report = audit_reporter.get_compliance_report(
            tenant_id=str(request.user.tenant_id),
            start_date=start,
            end_date=end
        )
        return Response(report, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'], url_path='object-history')
    def object_history(self, request):
        content_type = request.query_params.get('content_type')
        object_id = request.query_params.get('object_id')
        if not content_type or not object_id:
            return Response(
                {'error': 'content_type and object_id are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        audit_reporter = AuditReporterService()
        history = audit_reporter.get_object_history(content_type, object_id)
        serializer = AuditLogDetailSerializer(history, many=True, context={'request': request})
        return Response({
            'content_type': content_type,
            'object_id': object_id,
            'count': len(history),
            'history': serializer.data
        }, status=status.HTTP_200_OK)