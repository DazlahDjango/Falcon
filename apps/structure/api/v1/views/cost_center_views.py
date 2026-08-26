from rest_framework import status, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from django.db import models
from apps.structure.models.cost_center import CostCenter
from apps.structure.api.v1.serializers.cost_center import CostCenterSerializer, CostCenterDetailSerializer, CostCenterCreateUpdateSerializer
from apps.structure.api.v1.filters.cost_center_filter import CostCenterFilter
from apps.structure.api.v1.throttles.structure_limits import HierarchyReadThrottle, HierarchyWriteThrottle
from apps.structure.api.v1.permissions.org_permissions import IsTenantMember, CanManageDepartment, CanViewOrgChart
from .base import BaseStructureViewSet


class CostCenterViewSet(BaseStructureViewSet):
    queryset = CostCenter.objects.select_related('manager', 'parent').all()
    filterset_class = CostCenterFilter
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['code', 'name', 'description']
    ordering_fields = ['code', 'name', 'fiscal_year', 'budget_amount']
    ordering = ['code']
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return CostCenterDetailSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return CostCenterCreateUpdateSerializer
        return CostCenterSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            self.permission_classes = [IsTenantMember, CanManageDepartment]
        else:
            self.permission_classes = [IsTenantMember, CanViewOrgChart]
        return super().get_permissions()
    
    def get_throttles(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            self.throttle_classes = [HierarchyWriteThrottle]
        else:
            self.throttle_classes = [HierarchyReadThrottle]
        return super().get_throttles()
    
    @action(detail=False, methods=['get'], url_path='by-code/(?P<code>[^/.]+)')
    def get_by_code(self, request, code=None):
        from .base import get_request_tenant_id
        tenant_id = get_request_tenant_id(request)
        queryset = CostCenter.objects.filter(code=code, is_deleted=False)
        if tenant_id:
            queryset = queryset.filter(tenant_id=tenant_id)
        cost_center = queryset.first()
        if not cost_center:
            return Response({'error': 'Cost center not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = CostCenterDetailSerializer(cost_center, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path='by-fiscal-year/(?P<year>[0-9]+)')
    def get_by_fiscal_year(self, request, year=None):
        from .base import get_request_tenant_id
        tenant_id = get_request_tenant_id(request)
        cost_centers = CostCenter.objects.filter(
            fiscal_year=year,
            is_deleted=False
        )
        if tenant_id:
            cost_centers = cost_centers.filter(tenant_id=tenant_id)
        cost_centers = cost_centers.select_related('manager', 'parent')
        serializer = CostCenterSerializer(cost_centers, many=True, context={'request': request})
        return Response({
            'fiscal_year': int(year),
            'cost_centers': serializer.data,
            'count': cost_centers.count()
        })
    
    @action(detail=False, methods=['get'], url_path='by-org-unit/(?P<org_unit_id>[0-9a-f-]+)')
    def get_by_org_unit(self, request, org_unit_id=None):
        from uuid import UUID
        from .base import get_request_tenant_id
        tenant_id = get_request_tenant_id(request)
        try:
            org_unit_id = UUID(org_unit_id)
        except ValueError:
            return Response({'error': 'Invalid organization unit ID'}, status=status.HTTP_400_BAD_REQUEST)
        cost_centers = CostCenter.objects.filter(
            parent_id=org_unit_id,
            is_deleted=False
        )
        if tenant_id:
            cost_centers = cost_centers.filter(tenant_id=tenant_id)
        cost_centers = cost_centers.select_related('manager', 'parent')
        serializer = CostCenterSerializer(cost_centers, many=True, context={'request': request})
        return Response({
            'organizational_unit_id': str(org_unit_id),
            'cost_centers': serializer.data,
            'count': cost_centers.count()
        })
    
    @action(detail=False, methods=['get'], url_path='by-level/(?P<level>[a-z]+)')
    def get_by_level(self, request, level=None):
        from .base import get_request_tenant_id
        tenant_id = get_request_tenant_id(request)
        from apps.structure.models.organizational_unit import OrganizationalUnit
        units_qs = OrganizationalUnit.objects.filter(
            level=level,
            is_deleted=False,
            is_active=True
        )
        if tenant_id:
            units_qs = units_qs.filter(tenant_id=tenant_id)
        units = units_qs.values_list('id', flat=True)
        cost_centers = CostCenter.objects.filter(is_deleted=False)
        if tenant_id:
            cost_centers = cost_centers.filter(tenant_id=tenant_id)
        cost_centers = cost_centers.select_related('manager', 'parent')
        serializer = CostCenterSerializer(cost_centers, many=True, context={'request': request})
        return Response({
            'level': level,
            'cost_centers': serializer.data,
            'count': cost_centers.count()
        })
    
    @action(detail=False, methods=['get'], url_path='stats')
    def get_stats(self, request):
        from .base import get_request_tenant_id
        tenant_id = get_request_tenant_id(request)
        queryset = CostCenter.objects.filter(is_deleted=False)
        if tenant_id:
            queryset = queryset.filter(tenant_id=tenant_id)
        total = queryset.count()
        active = queryset.filter(is_active=True).count()
        shared = queryset.filter(is_shared=True).count()
        category_distribution = {}
        categories = queryset.values('category').annotate(count=models.Count('id'))
        for cat in categories:
            category_distribution[cat['category']] = cat['count']
        total_budget = queryset.filter(is_active=True).aggregate(total=models.Sum('budget_amount'))['total'] or 0
        level_distribution = {}
        from apps.structure.models.organizational_unit import OrganizationalUnit
        from apps.structure.enums.org_level import OrgLevel
        for level in [OrgLevel.DIVISION, OrgLevel.DEPARTMENT, OrgLevel.SECTION, OrgLevel.UNIT]:
            units_qs = OrganizationalUnit.objects.filter(
                level=level,
                is_deleted=False,
                is_active=True
            )
            if tenant_id:
                units_qs = units_qs.filter(tenant_id=tenant_id)
            units = units_qs.values_list('id', flat=True)
            cc_qs = CostCenter.objects.filter(
                organizational_unit_id__in=units,
                is_deleted=False
            )
            if tenant_id:
                cc_qs = cc_qs.filter(tenant_id=tenant_id)
            level_distribution[level] = cc_qs.count()
        return Response({
            'total_cost_centers': total,
            'active_cost_centers': active,
            'inactive_cost_centers': total - active,
            'shared_cost_centers': shared,
            'category_distribution': category_distribution,
            'level_distribution': level_distribution,
            'total_budget': float(total_budget)
        })
    
    @action(detail=True, methods=['get'], url_path='children')
    def get_children(self, request, pk=None):
        cost_center = self.get_object()
        children = cost_center.children.filter(is_deleted=False, is_active=True)
        serializer = CostCenterSerializer(children, many=True, context={'request': request})
        return Response({
            'parent_id': str(cost_center.id),
            'parent_name': cost_center.name,
            'children': serializer.data,
            'count': children.count()
        })
    
    @action(detail=True, methods=['get'], url_path='utilization')
    def get_utilization(self, request, pk=None):
        cost_center = self.get_object()
        from apps.structure.services.validation.budget_validator import BudgetValidator
        validator = BudgetValidator()
        utilization = validator.get_budget_utilization(cost_center.id)
        return Response({
            'cost_center_id': str(cost_center.id),
            'cost_center_code': cost_center.code,
            'utilization': utilization
        })