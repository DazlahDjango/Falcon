from rest_framework import status, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from django.db import models
from apps.structure.models.section import Section
from apps.structure.api.v1.serializers.section import SectionSerializer, SectionDetailSerializer
from apps.structure.api.v1.filters.org_filter import SectionFilter
from apps.structure.api.v1.throttles.structure_limits import OrgUnitRateThrottle, HierarchyReadThrottle, HierarchyWriteThrottle
from apps.structure.api.v1.permissions.org_permissions import IsTenantMember, CanManageDepartment, CanViewOrgChart
from .base import BaseStructureViewSet


class SectionViewSet(BaseStructureViewSet):
    queryset = Section.objects.select_related('parent').all()
    filterset_class = SectionFilter
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['code', 'name', 'description']
    ordering_fields = ['code', 'name', 'depth', 'created_at']
    ordering = ['code']
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return SectionDetailSerializer
        return SectionSerializer
    
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
    
    @action(detail=True, methods=['get'], url_path='units')
    def get_units(self, request, pk=None):
        section = self.get_object()
        units = section.children.filter(is_deleted=False, is_active=True)
        from apps.structure.api.v1.serializers.unit import UnitSerializer
        serializer = UnitSerializer(units, many=True, context={'request': request})
        return Response({
            'section_id': str(section.id),
            'section_code': section.code,
            'units': serializer.data,
            'count': units.count()
        })
    
    @action(detail=True, methods=['get'], url_path='employments')
    def get_employments(self, request, pk=None):
        section = self.get_object()
        from apps.structure.models.employment import Employment
        from apps.structure.api.v1.serializers.employment import EmploymentListSerializer
        employments = Employment.objects.filter(
            section_id=section.id,
            is_current=True,
            is_deleted=False,
            is_active=True
        ).select_related('position', 'unit')
        serializer = EmploymentListSerializer(employments, many=True, context={'request': request})
        return Response({
            'section_id': str(section.id),
            'section_code': section.code,
            'employments': serializer.data,
            'count': employments.count()
        })
    
    @action(detail=False, methods=['get'], url_path='by-code/(?P<code>[^/.]+)')
    def get_by_code(self, request, code=None):
        from .base import get_request_tenant_id
        tenant_id = get_request_tenant_id(request)
        queryset = Section.objects.filter(code=code, is_deleted=False)
        if tenant_id:
            queryset = queryset.filter(tenant_id=tenant_id)
        section = queryset.first()
        if not section:
            return Response({'error': 'Section not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = SectionDetailSerializer(section, context={'request': request})
        return Response(serializer.data)