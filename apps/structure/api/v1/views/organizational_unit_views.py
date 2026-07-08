from rest_framework import status, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from django.db import models
from apps.structure.models.organizational_unit import OrganizationalUnit
from apps.structure.api.v1.serializers.organizational_unit import OrganizationalUnitSerializer, OrganizationalUnitDetailSerializer
from apps.structure.api.v1.filters.org_filter import OrgUnitFilter
from apps.structure.api.v1.throttles.structure_limits import OrgUnitRateThrottle, HierarchyReadThrottle, HierarchyWriteThrottle
from apps.structure.api.v1.permissions.org_permissions import IsTenantMember, CanManageDepartment, CanViewOrgChart
from .base import BaseStructureViewSet


class OrganizationalUnitViewSet(BaseStructureViewSet):
    queryset = OrganizationalUnit.objects.select_related('parent').all()
    filterset_class = OrgUnitFilter
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['code', 'name', 'description']
    ordering_fields = ['code', 'name', 'level', 'depth', 'created_at']
    ordering = ['level', 'code']
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return OrganizationalUnitDetailSerializer
        return OrganizationalUnitSerializer
    
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
    
    @action(detail=False, methods=['get'], url_path='by-level/(?P<level>[a-z]+)')
    def get_by_level(self, request, level=None):
        tenant_id = request.user.tenant_id
        units = OrganizationalUnit.objects.filter(
            tenant_id=tenant_id,
            level=level,
            is_deleted=False,
            is_active=True
        ).select_related('parent')
        serializer = OrganizationalUnitSerializer(units, many=True, context={'request': request})
        return Response({
            'level': level,
            'units': serializer.data,
            'count': units.count()
        })
    
    @action(detail=False, methods=['get'], url_path='by-path/(?P<path>[^/.]+)')
    def get_by_path(self, request, path=None):
        from apps.structure.services.hierarchy.path_resolver import PathResolver
        tenant_id = request.user.tenant_id
        resolver = PathResolver()
        result = resolver.resolve_path(path, tenant_id)
        if not result:
            return Response({'error': 'Path not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = OrganizationalUnitDetailSerializer(result['node'], context={'request': request})
        return Response({
            'unit': serializer.data,
            'level': result['level'],
            'depth': result['depth'],
            'path': result['path']
        })
    
    @action(detail=True, methods=['get'], url_path='subtree')
    def get_subtree(self, request, pk=None):
        from apps.structure.services.hierarchy.subtree_extractor import SubtreeExtractor
        unit = self.get_object()
        extractor = SubtreeExtractor()
        subtree = extractor.extract_subtree(unit)
        return Response({
            'root_id': str(unit.id),
            'subtree': subtree,
            'node_count': extractor.get_subtree_count(unit)
        })
    
    @action(detail=False, methods=['get'], url_path='root')
    def get_root_units(self, request):
        tenant_id = request.user.tenant_id
        units = OrganizationalUnit.objects.filter(
            tenant_id=tenant_id,
            parent__isnull=True,
            is_deleted=False,
            is_active=True
        ).select_related('parent')
        serializer = OrganizationalUnitSerializer(units, many=True, context={'request': request})
        return Response({
            'root_units': serializer.data,
            'count': units.count()
        })
    
    @action(detail=False, methods=['get'], url_path='stats')
    def get_stats(self, request):
        tenant_id = request.user.tenant_id
        from apps.structure.enums.org_level import OrgLevel
        stats = {}
        for level in [OrgLevel.DIVISION, OrgLevel.DEPARTMENT, OrgLevel.SECTION, OrgLevel.UNIT]:
            count = OrganizationalUnit.objects.filter(
                tenant_id=tenant_id,
                level=level,
                is_deleted=False,
                is_active=True
            ).count()
            stats[level] = count
        total = OrganizationalUnit.objects.filter(tenant_id=tenant_id, is_deleted=False, is_active=True).count()
        return Response({
            'tenant_id': str(tenant_id),
            'total_units': total,
            'by_level': stats
        })