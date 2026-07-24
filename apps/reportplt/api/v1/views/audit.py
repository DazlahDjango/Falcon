# apps/reportplt/api/v1/views/audits.py
from django.db import transaction
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from apps.reportplt.models import ReportAudit
from apps.reportplt.api.v1.serializers import (
    AuditListSerializer, AuditDetailSerializer
)
from apps.reportplt.api.v1.permissions import ReportViewPermission
from apps.reportplt.api.v1.decorators import audit_log
from apps.reportplt.constants import AuditAction
from rest_framework.permissions import IsAuthenticated
from apps.reportplt.api.v1.permissions import TenantIsolationPermission
from .base import BaseReadOnlyViewSet

class AuditViewSet(BaseReadOnlyViewSet):
    queryset = ReportAudit.objects.all()
    search_fields = ['ip_address', 'user__email', 'report__name']
    ordering_fields = ['created_at', 'duration']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = super().get_queryset().filter(is_deleted=False)
        if not self.request.user.is_superuser and self.request.user.role != 'super_admin':
            if self.request.user.role not in ['client_admin', 'executive']:
                queryset = queryset.filter(user=self.request.user)
        return queryset

    def get_serializer_class(self):
        if self.action == 'list':
            return AuditListSerializer
        return AuditDetailSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [IsAuthenticated, TenantIsolationPermission, ReportViewPermission]
        else:
            permission_classes = [IsAuthenticated, TenantIsolationPermission]
        return [permission() for permission in permission_classes]

    @action(detail=False, methods=['get'], url_path='report/(?P<report_id>[^/.]+)')
    def by_report(self, request, report_id=None):
        queryset = self.get_queryset().filter(report_id=report_id)
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='user/(?P<user_id>[^/.]+)')
    def by_user(self, request, user_id=None):
        queryset = self.get_queryset().filter(user_id=user_id)
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='actions')
    def audit_actions(self, request):
        from apps.reportplt.constants import AuditAction
        return Response([{'value': a[0], 'label': a[1]} for a in AuditAction.CHOICES])

    @action(detail=False, methods=['get'], url_path='stats')
    def stats(self, request):
        queryset = self.get_queryset()
        from django.db.models import Count, Avg
        stats = {
            'total': queryset.count(),
            'by_action': queryset.values('action').annotate(count=Count('id')),
            'by_success': queryset.values('success').annotate(count=Count('id')),
            'avg_duration': queryset.aggregate(avg_duration=Avg('duration'))
        }
        return Response(stats)