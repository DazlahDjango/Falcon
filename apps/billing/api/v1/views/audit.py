from rest_framework import viewsets, status, permissions
from django.db import models
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta
from ....models import BillingAuditLog
from ..serializers import AuditLogSerializer, AuditLogListSerializer, AuditLogDetailSerializer, AuditLogFilterSerializer
from ..permissions import IsSuperAdmin, IsClientAdmin

class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = BillingAuditLog.objects.filter(is_deleted=False)
    serializer_class = AuditLogSerializer
    permission_classes = [IsSuperAdmin]
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'export']:
            self.permission_classes = [IsClientAdmin]
        else:
            self.permission_classes = [IsSuperAdmin]
        return super().get_permissions()
    
    def get_serializer_class(self):
        if self.action == 'list':
            return AuditLogListSerializer
        if self.action == 'retrieve':
            return AuditLogDetailSerializer
        return AuditLogSerializer
    
    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or user.role == 'super_admin':
            return super().get_queryset()
        tenant_id = self.request.tenant_id if hasattr(self.request, 'tenant_id') else user.tenant_id
        return super().get_queryset().filter(tenant_id=tenant_id)
    
    @action(detail=False, methods=['get'], url_path='filter')
    def filter_logs(self, request):
        serializer = AuditLogFilterSerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)
        queryset = self.get_queryset()
        if serializer.validated_data.get('start_date'):
            queryset = queryset.filter(created_at__date__gte=serializer.validated_data['start_date'])
        if serializer.validated_data.get('end_date'):
            queryset = queryset.filter(created_at__date__lte=serializer.validated_data['end_date'])
        if serializer.validated_data.get('action'):
            queryset = queryset.filter(action=serializer.validated_data['action'])
        if serializer.validated_data.get('resource_type'):
            queryset = queryset.filter(resource_type=serializer.validated_data['resource_type'])
        if serializer.validated_data.get('user_email'):
            queryset = queryset.filter(user_email=serializer.validated_data['user_email'])
        if serializer.validated_data.get('success') is not None:
            queryset = queryset.filter(success=serializer.validated_data['success'])
        
        queryset = queryset.order_by('-created_at')
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = AuditLogListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
            
        serializer = AuditLogListSerializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path='export')
    def export_logs(self, request):
        from django.http import HttpResponse
        import csv
        tenant_id = request.tenant_id if hasattr(request, 'tenant_id') else request.user.tenant_id
        days = request.query_params.get('days', 30)
        cutoff = timezone.now() - timedelta(days=int(days))
        logs = self.get_queryset().filter(created_at__gte=cutoff).order_by('-created_at')
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="audit_logs_{tenant_id}_{timezone.now().date()}.csv"'
        writer = csv.writer(response)
        writer.writerow(['Timestamp', 'User Email', 'Action', 'Resource Type', 'Resource ID', 'Success', 'Error', 'IP Address'])
        for log in logs:
            writer.writerow([log.created_at, log.user_email, log.action, log.resource_type, log.resource_id, log.success, log.error_message, log.user_ip])
        return response
    
    @action(detail=False, methods=['get'], url_path='summary')
    def audit_summary(self, request):
        tenant_id = request.tenant_id if hasattr(request, 'tenant_id') else request.user.tenant_id
        days = request.query_params.get('days', 30)
        cutoff = timezone.now() - timedelta(days=int(days))
        logs = self.get_queryset().filter(created_at__gte=cutoff)
        total = logs.count()
        by_action = logs.values('action').annotate(count=models.Count('id')).order_by('-count')
        by_resource = logs.values('resource_type').annotate(count=models.Count('id')).order_by('-count')
        failed = logs.filter(success=False).count()
        return Response({'total_actions': total, 'failed_actions': failed, 'success_rate': ((total - failed) / total * 100) if total > 0 else 100, 'by_action': list(by_action), 'by_resource': list(by_resource), 'period_days': days})