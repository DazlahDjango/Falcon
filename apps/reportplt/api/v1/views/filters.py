# apps/reportplt/api/v1/views/filters.py
from django.db import transaction
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from apps.reportplt.models import ReportFilter
from apps.reportplt.api.v1.serializers import (
    FilterListSerializer, FilterDetailSerializer,
    FilterCreateSerializer, FilterUpdateSerializer,
    FilterApplySerializer
)
from apps.reportplt.api.v1.permissions import ReportViewPermission
from apps.reportplt.api.v1.decorators import audit_log
from apps.reportplt.services.filters.saved_filter import SavedFilterManager
from apps.reportplt.services.filters.filter_engine import FilterEngine
from apps.reportplt.constants import AuditAction
from rest_framework.permissions import IsAuthenticated
from apps.reportplt.api.v1.permissions import TenantIsolationPermission
from .base import BaseModelViewSet

class FilterViewSet(BaseModelViewSet):
    queryset = ReportFilter.objects.all()
    search_fields = ['name', 'display_label']
    ordering_fields = ['name', 'created_at', 'updated_at']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = super().get_queryset().filter(is_deleted=False)
        if not self.request.user.is_superuser and self.request.user.role != 'super_admin':
            queryset = queryset.filter(
                models.Q(owner=self.request.user) |
                models.Q(is_global=True)
            )
        return queryset

    def get_serializer_class(self):
        if self.action == 'list':
            return FilterListSerializer
        elif self.action == 'create':
            return FilterCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return FilterUpdateSerializer
        elif self.action == 'retrieve':
            return FilterDetailSerializer
        elif self.action == 'apply':
            return FilterApplySerializer
        return FilterDetailSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'apply']:
            permission_classes = [IsAuthenticated, TenantIsolationPermission, ReportViewPermission]
        else:
            permission_classes = [IsAuthenticated, TenantIsolationPermission]
        return [permission() for permission in permission_classes]

    @action(detail=True, methods=['post'], url_path='apply')
    def apply(self, request, pk=None):
        filter_obj = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        manager = SavedFilterManager(request.user)
        queryset = manager.apply_saved_filter(
            str(filter_obj.id),
            serializer.validated_data.get('values')
        )
        return Response({'status': 'success', 'filtered': True})

    @action(detail=True, methods=['post'], url_path='set-default')
    @audit_log(action=AuditAction.EDIT)
    def set_default(self, request, pk=None):
        filter_obj = self.get_object()
        manager = SavedFilterManager(request.user)
        manager.set_default_filter(str(filter_obj.id))
        return Response({'status': 'success'})

    @action(detail=True, methods=['post'], url_path='duplicate')
    @audit_log(action=AuditAction.CREATE)
    def duplicate(self, request, pk=None):
        filter_obj = self.get_object()
        new_name = request.data.get('new_name')
        manager = SavedFilterManager(request.user)
        new_filter = manager.duplicate_filter(str(filter_obj.id), new_name)
        serializer = self.get_serializer(new_filter)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'], url_path='global')
    def global_filters(self, request):
        manager = SavedFilterManager(request.user)
        filters = manager.get_global_filters()
        serializer = self.get_serializer(filters, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='my')
    def my_filters(self, request):
        manager = SavedFilterManager(request.user)
        filters = manager.get_user_filters()
        serializer = self.get_serializer(filters, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='types')
    def filter_types(self, request):
        from apps.reportplt.constants import FilterType
        return Response([{'value': t[0], 'label': t[1]} for t in FilterType.CHOICES])