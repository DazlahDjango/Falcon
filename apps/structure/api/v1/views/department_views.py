from rest_framework import status, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from django.db import transaction
from django.core.cache import cache
from uuid import UUID
from django.db import models
from django.utils import timezone
from apps.structure.models.department import Department
from apps.structure.api.v1.serializers.department import DepartmentSerializer, DepartmentTreeSerializer, DepartmentDetailSerializer, DepartmentCreateUpdateSerializer
from apps.structure.api.v1.filters.org_filter import DepartmentFilter
from apps.structure.api.v1.throttles.structure_limits import OrgUnitRateThrottle, HierarchyReadThrottle, HierarchyWriteThrottle
from apps.structure.api.v1.permissions.org_permissions import IsTenantMember, CanManageDepartment, CanViewOrgChart
from .base import BaseStructureViewSet, BaseStructureReadOnlyViewSet

class DepartmentViewSet(BaseStructureViewSet):
    queryset = Department.objects.select_related('parent').all()
    filterset_class = DepartmentFilter
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['code', 'name', 'description']
    ordering_fields = ['code', 'name', 'depth', 'created_at', 'updated_at']
    ordering = ['code']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        if hasattr(self.request, 'user') and hasattr(self.request.user, 'tenant_id'):
            tenant_id = self.request.user.tenant_id
            if tenant_id:
                queryset = queryset.filter(tenant_id=tenant_id)
        return queryset.filter(is_deleted=False)
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return DepartmentDetailSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return DepartmentCreateUpdateSerializer
        return DepartmentSerializer
    
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
    
    @action(detail=True, methods=['get'], url_path='children')
    def get_children(self, request, pk=None):
        department = self.get_object()
        children = department.children.filter(is_deleted=False, is_active=True)
        serializer = DepartmentSerializer(children, many=True, context={'request': request})
        return Response({
            'parent_id': str(department.id),
            'parent_name': department.name,
            'children': serializer.data,
            'count': children.count()
        })
    
    @action(detail=True, methods=['get'], url_path='sections')
    def get_sections(self, request, pk=None):
        department = self.get_object()
        sections = department.children.filter(is_deleted=False, is_active=True)
        from apps.structure.api.v1.serializers.section import SectionSerializer
        serializer = SectionSerializer(sections, many=True, context={'request': request})
        return Response({
            'department_id': str(department.id),
            'department_code': department.code,
            'sections': serializer.data,
            'count': sections.count()
        })
    
    @action(detail=True, methods=['get'], url_path='ancestors')
    def get_ancestors(self, request, pk=None):
        department = self.get_object()
        ancestors = department.get_ancestors()
        serializer = DepartmentSerializer(ancestors, many=True, context={'request': request})
        return Response({
            'department_id': str(department.id),
            'ancestors': serializer.data,
            'depth': len(ancestors)
        })
    
    @action(detail=True, methods=['get'], url_path='employments')
    def get_employments(self, request, pk=None):
        department = self.get_object()
        from apps.structure.models.employment import Employment
        from apps.structure.api.v1.serializers.employment import EmploymentListSerializer
        employments = Employment.objects.filter(
            department_id=department.id,
            is_current=True,
            is_deleted=False,
            is_active=True
        ).select_related('position', 'unit', 'section')
        serializer = EmploymentListSerializer(employments, many=True, context={'request': request})
        return Response({
            'department_id': str(department.id),
            'department_code': department.code,
            'employments': serializer.data,
            'count': employments.count()
        })
    
    @action(detail=True, methods=['post'], url_path='move')
    @transaction.atomic
    def move_department(self, request, pk=None):
        department = self.get_object()
        new_parent_id = request.data.get('parent_id')
        from apps.structure.services.hierarchy.cycle_detector import CycleDetector
        from apps.structure.exceptions import HierarchyCycleError
        try:
            CycleDetector.validate_assignment(new_parent_id, department.id, department.tenant_id)
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
    
    @action(detail=False, methods=['get'], url_path='root')
    def get_root_departments(self, request):
        tenant_id = request.user.tenant_id
        departments = Department.objects.filter(
            tenant_id=tenant_id,
            parent__isnull=True,
            is_deleted=False,
            is_active=True
        ).select_related('parent')
        serializer = DepartmentSerializer(departments, many=True, context={'request': request})
        return Response({
            'root_departments': serializer.data,
            'count': departments.count()
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
        root = Department.objects.filter(tenant_id=tenant_id, parent__isnull=True, is_deleted=False, is_active=True).count()
        max_depth = Department.objects.filter(tenant_id=tenant_id, is_deleted=False).aggregate(max=models.Max('depth'))['max']
        return Response({
            'total_departments': total,
            'active_departments': active,
            'inactive_departments': total - active,
            'root_departments': root,
            'max_depth': max_depth or 0
        })

class DepartmentTreeViewSet(BaseStructureReadOnlyViewSet):
    permission_classes = [IsTenantMember, CanViewOrgChart]
    throttle_classes = [HierarchyReadThrottle]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        if hasattr(self.request, 'user') and hasattr(self.request.user, 'tenant_id'):
            tenant_id = self.request.user.tenant_id
            if tenant_id:
                queryset = queryset.filter(tenant_id=tenant_id)
        return queryset.filter(is_deleted=False)
    
    def get_throttles(self):
        self.throttle_classes = [HierarchyReadThrottle]
        return super().get_throttles()
    
    @action(detail=False, methods=['get'], url_path='full')
    def get_full_tree(self, request):
        from apps.structure.services.hierarchy.tree_builder import TreeBuilder
        from .base import get_request_tenant_id
        tenant_id = get_request_tenant_id(request)
        tree_builder = TreeBuilder()
        tree = tree_builder.build_full_tree(tenant_id)
        return Response({
            'tenant_id': str(tenant_id),
            'tree': tree,
            'generated_at': timezone.now().isoformat()
        })
    
    @action(detail=False, methods=['get'], url_path='branch/(?P<department_id>[0-9a-f-]+)')
    def get_branch(self, request, department_id=None):
        from apps.structure.services.hierarchy.tree_builder import TreeBuilder
        from .base import get_request_tenant_id
        tenant_id = get_request_tenant_id(request)
        tree_builder = TreeBuilder()
        branch = tree_builder.get_branch(UUID(department_id), tenant_id, 'department')
        if not branch:
            return Response({'error': 'Department not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response({
            'department_id': department_id,
            'branch': branch
        })
    
    @action(detail=False, methods=['get'], url_path='path/(?P<department_id>[0-9a-f-]+)')
    def get_path(self, request, department_id=None):
        from apps.structure.models.department import Department
        from .base import get_request_tenant_id
        tenant_id = get_request_tenant_id(request)
        department = Department.objects.filter(id=department_id, tenant_id=tenant_id, is_deleted=False).first()
        if not department:
            return Response({'error': 'Department not found'}, status=status.HTTP_404_NOT_FOUND)
        path = department.get_full_path()
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
        from apps.structure.services.hierarchy.lca_finder import LCAByIdFinder
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
    
    @action(detail=False, methods=['get'], url_path='subtree/(?P<department_id>[0-9a-f-]+)')
    def get_subtree(self, request, department_id=None):
        from apps.structure.services.hierarchy.subtree_extractor import SubtreeExtractor
        tenant_id = request.user.tenant_id
        departments = SubtreeExtractor.extract_department_subtree(UUID(department_id), tenant_id)
        if not departments:
            return Response({'error': 'Department not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = DepartmentSerializer(departments, many=True, context={'request': request})
        return Response({
            'root_department_id': department_id,
            'departments': serializer.data,
            'count': len(departments)
        })