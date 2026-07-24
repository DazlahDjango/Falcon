# apps/reportplt/api/v1/views/shares.py
from django.db import transaction
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from apps.reportplt.models import ReportShare
from apps.reportplt.api.v1.serializers import (
    ShareListSerializer, ShareDetailSerializer,
    ShareCreateSerializer, ShareUpdateSerializer,
    ShareAccessSerializer
)
from apps.reportplt.api.v1.permissions import ShareViewPermission, ShareCreatePermission, ShareAccessPermission
from apps.reportplt.api.v1.decorators import audit_log
from apps.reportplt.services.security.report_rbac import ReportRBAC
from apps.reportplt.constants import AuditAction
from rest_framework.permissions import IsAuthenticated
from apps.reportplt.api.v1.permissions import TenantIsolationPermission
from .base import BaseModelViewSet

class ShareViewSet(BaseModelViewSet):
    queryset = ReportShare.objects.all()
    ordering_fields = ['created_at', 'expires_at', 'access_count']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = super().get_queryset().filter(is_deleted=False)
        if not self.request.user.is_superuser and self.request.user.role != 'super_admin':
            queryset = queryset.filter(
                models.Q(shared_by=self.request.user) |
                models.Q(shared_with=self.request.user)
            )
        return queryset

    def get_serializer_class(self):
        if self.action == 'list':
            return ShareListSerializer
        elif self.action == 'create':
            return ShareCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return ShareUpdateSerializer
        elif self.action == 'retrieve':
            return ShareDetailSerializer
        elif self.action == 'access':
            return ShareAccessSerializer
        return ShareDetailSerializer

    def get_permissions(self):
        if self.action == 'list':
            permission_classes = [IsAuthenticated, TenantIsolationPermission, ShareViewPermission]
        elif self.action == 'retrieve':
            permission_classes = [IsAuthenticated, TenantIsolationPermission, ShareViewPermission]
        elif self.action == 'create':
            permission_classes = [IsAuthenticated, TenantIsolationPermission, ShareCreatePermission]
        elif self.action in ['update', 'partial_update', 'destroy']:
            permission_classes = [IsAuthenticated, TenantIsolationPermission, ShareViewPermission]
        elif self.action == 'access':
            permission_classes = [IsAuthenticated, TenantIsolationPermission, ShareAccessPermission]
        else:
            permission_classes = [IsAuthenticated, TenantIsolationPermission]
        return [permission() for permission in permission_classes]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        from apps.reportplt.tasks import send_report_notification
        if serializer.instance.notify_recipient and serializer.instance.shared_with:
            send_report_notification.delay(
                str(serializer.instance.shared_with.id),
                str(serializer.instance.report.id),
                'shared',
                f"Report '{serializer.instance.report.name}' has been shared with you"
            )
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='access')
    def access(self, request, pk=None):
        share = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        if share.password_protected:
            if serializer.validated_data.get('password') != share.password:
                return Response({'error': 'Invalid password'}, status=status.HTTP_403_FORBIDDEN)
        if not share.is_valid():
            return Response({'error': 'Share link has expired or is inactive'}, status=status.HTTP_410_GONE)
        share.record_access()
        rbac = ReportRBAC(request.user)
        if rbac.can_view_report(share.report):
            from apps.reportplt.api.v1.serializers import ReportDetailSerializer
            report_serializer = ReportDetailSerializer(share.report, context={'request': request})
            return Response({
                'status': 'success',
                'report': report_serializer.data,
                'permission': share.permission
            })
        return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)

    @action(detail=True, methods=['post'], url_path='deactivate')
    @audit_log(action=AuditAction.EDIT)
    def deactivate(self, request, pk=None):
        share = self.get_object()
        share.deactivate()
        return Response({'status': 'success'})

    @action(detail=True, methods=['post'], url_path='activate')
    @audit_log(action=AuditAction.EDIT)
    def activate(self, request, pk=None):
        share = self.get_object()
        share.activate()
        return Response({'status': 'success'})

    @action(detail=False, methods=['get'], url_path='report/(?P<report_id>[^/.]+)')
    def by_report(self, request, report_id=None):
        queryset = self.get_queryset().filter(report_id=report_id)
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='types')
    def share_types(self, request):
        from apps.reportplt.constants import ShareType
        return Response([{'value': t[0], 'label': t[1]} for t in ShareType.CHOICES])

    @action(detail=False, methods=['get'], url_path='permissions')
    def permissions(self, request):
        from apps.reportplt.constants import SharePermission
        return Response([{'value': p[0], 'label': p[1]} for p in SharePermission.CHOICES])