# apps/reportplt/api/v1/views/executions.py
from django.db import transaction, models
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from apps.reportplt.models import ReportExecution
from apps.reportplt.api.v1.serializers import (
    ExecutionListSerializer, ExecutionDetailSerializer
)
from apps.reportplt.api.v1.permissions import ReportViewPermission
from apps.reportplt.api.v1.decorators import audit_log
from apps.reportplt.constants import AuditAction
from rest_framework.permissions import IsAuthenticated
from apps.reportplt.api.v1.permissions import TenantIsolationPermission
from .base import BaseReadOnlyViewSet

class ExecutionViewSet(BaseReadOnlyViewSet):
    queryset = ReportExecution.objects.all()
    search_fields = ['report__name']
    ordering_fields = ['created_at', 'started_at', 'completed_at', 'duration']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = super().get_queryset().filter(is_deleted=False)
        if not self.request.user.is_superuser and self.request.user.role != 'super_admin':
            if self.request.user.role not in ['client_admin', 'executive']:
                queryset = queryset.filter(
                    models.Q(triggered_by=self.request.user) |
                    models.Q(report__owner=self.request.user)
                )
        return queryset

    def get_serializer_class(self):
        if self.action == 'list':
            return ExecutionListSerializer
        return ExecutionDetailSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [IsAuthenticated, TenantIsolationPermission, ReportViewPermission]
        else:
            permission_classes = [IsAuthenticated, TenantIsolationPermission]
        return [permission() for permission in permission_classes]

    @action(detail=True, methods=['get'], url_path='logs')
    def logs(self, request, pk=None):
        execution = self.get_object()
        return Response(execution.execution_log)

    @action(detail=False, methods=['get'], url_path='report/(?P<report_id>[^/.]+)')
    def by_report(self, request, report_id=None):
        queryset = self.get_queryset().filter(report_id=report_id)
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='statuses')
    def statuses(self, request):
        from apps.reportplt.constants import ExecutionStatus
        return Response([{'value': s[0], 'label': s[1]} for s in ExecutionStatus.CHOICES])