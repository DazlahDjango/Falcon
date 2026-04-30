from rest_framework import status, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from django.db import transaction
from django.core.cache import cache
from uuid import UUID
from django.db import models
from ....models import Department
from ..serializers.department import (
    DepartmentSerializer, DepartmentTreeSerializer, 
    DepartmentDetailSerializer, DepartmentCreateUpdateSerializer
)
from ..filters.department_filter import DepartmentFilter, DepartmentTreeFilter
from ..throttles.structure_limits import DepartmentRateThrottle, HierarchyReadThrottle, HierarchyWriteThrottle
from ..permissions.structure_permissions import (
    CanViewDepartment, CanEditDepartment, CanDeleteDepartment
)
from .base import BaseStructureViewSet, BaseStructureReadOnlyViewSet

class DepartmentViewSet(BaseStructureViewSet):
    queryset = Department.objects.select_related('parent').all()
    filterset_class = DepartmentFilter
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['code', 'name', 'description']
    ordering_fields = ['code', 'name', 'depth', 'created_at', 'updated_at']
    ordering = ['code']
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return DepartmentDetailSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return DepartmentCreateUpdateSerializer
        return DepartmentSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update']:
            self.permission_classes = [CanEditDepartment]
        elif self.action == 'destroy':
            self.permission_classes = [CanDeleteDepartment]
        else:
            self.permission_classes = [CanViewDepartment]
        return super().get_permissions()
    
    def get_throttles(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            self.throttle_classes = [DepartmentRateThrottle, HierarchyWriteThrottle]
        else:
            self.throttle_classes = [HierarchyReadThrottle]
        return super().get_throttles()
    
    @action(detail=True, methods=['get'], url_path='children')
    def get_children(self, request, pk=None):
        department = self.get_object()
        children = department.children.filter(is_deleted=False)
        serializer = DepartmentSerializer(children, many=True, context={'request': request})
        return Response({
            'parent_id': str(department.id),
            'parent_name': department.name,
            'children': serializer.data,
            'count': children.count()
        })
    
    @action(detail=True, methods=['get'], url_path='ancestors')
    def get_ancestors(self, request, pk=None):
        department = self.get_object()
        from ....services.hierarchy.path_resolver import PathResolver
        ancestors = PathResolver.get_department_ancestors(department.id, department.tenant_id, include_self=False)
        serializer = DepartmentSerializer(ancestors, many=True, context={'request': request})
        return Response({
            'department_id': str(department.id),
            'ancestors': serializer.data,
            'depth': len(ancestors)
        })
    
    @action(detail=True, methods=['post'], url_path='move')
    @transaction.atomic
    def move_department(self, request, pk=None):
        department = self.get_object()
        new_parent_id = request.data.get('parent_id')
        from ....services.hierarchy.cycle_detector import CycleDetector
        from ....exceptions import HierarchyCycleError
        try:
            CycleDetector.validate_assignment(new_parent_id, department.id, department.tenant_id, 'department')
        except HierarchyCycleError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        old_parent_id = department.parent_id
        department.parent_id = new_parent_id
        department.save()
        self._invalidate_cache()
        return Response({
            'message': 'Department moved successfully',
            'department_id': str(department.id),
            'old_parent_id': str(old_parent_id) if old_parent_id else None,
            'new_parent_id': str(new_parent_id) if new_parent_id else None
        })
    
    @action(detail=False, methods=['get'], url_path='by-code/(?P<code>[^/.]+)')
    def get_by_code(self, request, code=None):
        tenant_id = request.user.tenant_id
        department = Department.objects.filter(code=code, tenant_id=tenant_id, is_deleted=False).first()
        if not department:
            return Response({'error': 'Department not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = DepartmentDetailSerializer(department, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path='stats')
    def get_stats(self, request):
        tenant_id = request.user.tenant_id
        total = Department.objects.filter(tenant_id=tenant_id, is_deleted=False).count()
        active = Department.objects.filter(tenant_id=tenant_id, is_deleted=False, is_active=True).count()
        root = Department.objects.filter(tenant_id=tenant_id, parent__isnull=True, is_deleted=False).count()
        max_depth = Department.objects.filter(tenant_id=tenant_id, is_deleted=False).aggregate(max=models.Max('depth'))['max']
        return Response({
            'total_departments': total,
            'active_departments': active,
            'inactive_departments': total - active,
            'root_departments': root,
            'max_depth': max_depth or 0
        })

class DepartmentTreeViewSet(BaseStructureReadOnlyViewSet):
    queryset = Department.objects.select_related('parent').all()
    serializer_class = DepartmentTreeSerializer
    filterset_class = DepartmentTreeFilter
    permission_classes = [CanViewDepartment]
    throttle_classes = [HierarchyReadThrottle]
    
    def get_queryset(self):
        return super().get_queryset().filter(parent__isnull=True)
    
    @action(detail=False, methods=['get'], url_path='full')
    def get_full_tree(self, request):
        from ....services.hierarchy.tree_builder import TreeBuilder
        tenant_id = request.user.tenant_id
        include_inactive = request.query_params.get('include_inactive', 'false').lower() == 'true'
        tree_builder = TreeBuilder()
        tree = tree_builder.build_department_tree(tenant_id, include_inactive)
        return Response({
            'tenant_id': str(tenant_id),
            'departments': tree,
            'include_inactive': include_inactive
        })
    
    @action(detail=False, methods=['get'], url_path='branch/(?P<department_id>[0-9a-f-]+)')
    def get_branch(self, request, department_id=None):
        from ....services.hierarchy.subtree_extractor import SubtreeExtractor
        tenant_id = request.user.tenant_id
        subtree = SubtreeExtractor.extract_department_subtree(UUID(department_id), tenant_id)
        if not subtree:
            return Response({'error': 'Department not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = DepartmentSerializer(subtree, many=True, context={'request': request})
        return Response({
            'root_department_id': department_id,
            'departments': serializer.data,
            'count': len(subtree)
        })
    
    @action(detail=False, methods=['get'], url_path='path/(?P<department_id>[0-9a-f-]+)')
    def get_path(self, request, department_id=None):
        from ....services.hierarchy.path_resolver import PathResolver
        tenant_id = request.user.tenant_id
        path = PathResolver.resolve_department_path(UUID(department_id), tenant_id)
        return Response({
            'department_id': department_id,
            'path': path,
            'segments': path.split(' / ') if path else []
        })
    
    @action(detail=False, methods=['get'], url_path='lca')
    def get_lca(self, request):
        dept_a_id = request.query_params.get('dept_a')
        dept_b_id = request.query_params.get('dept_b')
        if not dept_a_id or not dept_b_id:
            return Response({'error': 'Both dept_a and dept_b parameters are required'}, status=status.HTTP_400_BAD_REQUEST)
        from ....services.hierarchy.lca_finder import LCAByIdFinder
        tenant_id = request.user.tenant_id
        lca = LCAByIdFinder.find_department_lca(UUID(dept_a_id), UUID(dept_b_id), tenant_id)
        if lca:
            serializer = DepartmentSerializer(lca, context={'request': request})
            return Response({
                'department_a': dept_a_id,
                'department_b': dept_b_id,
                'lca': serializer.data
            })
        return Response({'message': 'No common ancestor found'}, status=status.HTTP_404_NOT_FOUND)