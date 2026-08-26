from rest_framework import status, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from django.db import models
from apps.structure.models.unit import Unit
from apps.structure.api.v1.serializers.unit import UnitSerializer, UnitDetailSerializer
from apps.structure.api.v1.filters.org_filter import UnitFilter
from apps.structure.api.v1.throttles.structure_limits import OrgUnitRateThrottle, HierarchyReadThrottle, HierarchyWriteThrottle
from apps.structure.api.v1.permissions.org_permissions import IsTenantMember, CanManageUnit, CanViewOrgChart
from .base import BaseStructureViewSet


class UnitViewSet(BaseStructureViewSet):
    queryset = Unit.objects.select_related('parent').all()
    filterset_class = UnitFilter
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['code', 'name', 'description']
    ordering_fields = ['code', 'name', 'depth', 'created_at']
    ordering = ['code']
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return UnitDetailSerializer
        return UnitSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            self.permission_classes = [IsTenantMember, CanManageUnit]
        else:
            self.permission_classes = [IsTenantMember, CanViewOrgChart]
        return super().get_permissions()
    
    def get_throttles(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            self.throttle_classes = [OrgUnitRateThrottle, HierarchyWriteThrottle]
        else:
            self.throttle_classes = [HierarchyReadThrottle]
        return super().get_throttles()
    
    @action(detail=True, methods=['get'], url_path='employments')
    def get_employments(self, request, pk=None):
        unit = self.get_object()
        from apps.structure.models.employment import Employment
        from apps.structure.api.v1.serializers.employment import EmploymentListSerializer
        employments = Employment.objects.filter(
            unit_id=unit.id,
            is_current=True,
            is_deleted=False,
            is_active=True
        ).select_related('position')
        serializer = EmploymentListSerializer(employments, many=True, context={'request': request})
        return Response({
            'unit_id': str(unit.id),
            'unit_code': unit.code,
            'employments': serializer.data,
            'count': employments.count(),
            'headcount_limit': unit.headcount_limit
        })
    
    @action(detail=False, methods=['get'], url_path='by-code/(?P<code>[^/.]+)')
    def get_by_code(self, request, code=None):
        from .base import get_request_tenant_id
        tenant_id = get_request_tenant_id(request)
        queryset = Unit.objects.filter(code=code, is_deleted=False)
        if tenant_id:
            queryset = queryset.filter(tenant_id=tenant_id)
        unit = queryset.first()
        if not unit:
            return Response({'error': 'Unit not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = UnitDetailSerializer(unit, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path='stats')
    def get_stats(self, request):
        from .base import get_request_tenant_id
        tenant_id = get_request_tenant_id(request)
        from apps.structure.models.employment import Employment
        queryset = Unit.objects.filter(is_deleted=False, is_active=True)
        if tenant_id:
            queryset = queryset.filter(tenant_id=tenant_id)
        total = queryset.count()
        with_employments = queryset.filter(
            positions__employments__is_current=True,
            positions__employments__is_deleted=False,
            positions__employments__is_active=True
        ).distinct().count()
        emp_qs = Employment.objects.filter(
            position__unit__is_deleted=False,
            position__unit__is_active=True,
            is_current=True,
            is_deleted=False,
            is_active=True
        )
        if tenant_id:
            emp_qs = emp_qs.filter(position__unit__tenant_id=tenant_id)
        total_headcount = emp_qs.count()
        return Response({
            'total_units': total,
            'units_with_employments': with_employments,
            'empty_units': total - with_employments,
            'total_headcount': total_headcount
        })