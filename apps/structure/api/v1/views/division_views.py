from rest_framework import status, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from django.db import models
from apps.structure.models.division import Division
from apps.structure.api.v1.serializers.division import DivisionSerializer, DivisionDetailSerializer
from apps.structure.api.v1.filters.org_filter import DivisionFilter
from apps.structure.api.v1.throttles.structure_limits import OrgUnitRateThrottle, HierarchyReadThrottle, HierarchyWriteThrottle
from apps.structure.api.v1.permissions.org_permissions import IsTenantMember, CanManageDepartment, CanViewOrgChart
from .base import BaseStructureViewSet


class DivisionViewSet(BaseStructureViewSet):
    queryset = Division.objects.all()
    filterset_class = DivisionFilter
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['code', 'name', 'description']
    ordering_fields = ['code', 'name', 'depth', 'created_at']
    ordering = ['code']
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return DivisionDetailSerializer
        return DivisionSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            self.permission_classes = [IsTenantMember, CanManageDepartment]
        else:
            self.permission_classes = [IsTenantMember, CanViewOrgChart]
        return super().get_permissions()
    
    def get_throttles(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            self.throttle_classes = [OrgUnitRateThrottle, HierarchyWriteThrottle]
        else:
            self.throttle_classes = [HierarchyReadThrottle]
        return super().get_throttles()
    
    @action(detail=True, methods=['get'], url_path='departments')
    def get_departments(self, request, pk=None):
        division = self.get_object()
        departments = division.children.filter(is_deleted=False, is_active=True)
        from apps.structure.api.v1.serializers.department import DepartmentSerializer
        serializer = DepartmentSerializer(departments, many=True, context={'request': request})
        return Response({
            'division_id': str(division.id),
            'division_code': division.code,
            'departments': serializer.data,
            'count': departments.count()
        })
    
    @action(detail=False, methods=['get'], url_path='stats')
    def get_stats(self, request):
        from .base import get_request_tenant_id
        tenant_id = get_request_tenant_id(request)
        queryset = Division.objects.filter(is_deleted=False)
        if tenant_id:
            queryset = queryset.filter(tenant_id=tenant_id)
        total = queryset.count()
        active = queryset.filter(is_active=True).count()
        inactive = queryset.filter(is_active=False).count()
        with_departments = queryset.filter(children__isnull=False, is_active=True).distinct().count()
        with_headcount = queryset.filter(headcount_limit__gt=0).count()
        return Response({
            'total_divisions': total,
            'active_divisions': active,
            'inactive_divisions': inactive,
            'with_departments': with_departments,
            'with_headcount': with_headcount,
            'empty_divisions': total - with_departments
        })