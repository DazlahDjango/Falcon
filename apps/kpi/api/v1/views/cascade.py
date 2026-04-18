from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .base import BaseKpiViewset
from ..serializers import CascadeMapSerializer, CascadeRuleSerializer
from ....models import CascadeMap, CascadeRule
from ....services import TargetCascader, CascadeRollback
from ..permissions import CanCascadeTargets


class CascadeRuleViewSet(BaseKpiViewset):
    queryset = CascadeRule.objects.filter(is_active=True)
    serializer_class = CascadeRuleSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['rule_type', 'is_default', 'is_active']
    search_fields = ['name', 'description']
    ordering_fields = ['name']
    ordering = ['name']
    @action(detail=True, methods=['post'])
    def set_default(self, request, pk=None):
        """Set this rule as default"""
        rule = self.get_object()
        CascadeRule.objects.filter(is_default=True).update(is_default=False)
        rule.is_default = True
        rule.save()
        serializer = self.get_serializer(rule)
        return Response(serializer.data)

class CascadeMapViewSet(BaseKpiViewset):
    queryset = CascadeMap.objects.all()
    serializer_class = CascadeMapSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['organization_target', 'department_target', 'individual_target', 'cascade_rule']
    ordering_fields = ['contribution_percentage', 'created_at']
    ordering = ['-created_at']
    permission_classes = [CanCascadeTargets] + BaseKpiViewset.permission_classes
    def create(self, request, *args, **kwargs):
        """Cascade targets from organization to departments/individuals"""
        cascader = TargetCascader()
        org_target_id = request.data.get('organization_target')
        rule_id = request.data.get('cascade_rule')
        targets = request.data.get('targets', [])
        try:
            cascade_maps = cascader.cascade_from_organization(
                org_target_id=org_target_id,
                rule_id=rule_id,
                targets=targets,
                user=request.user
            )
            serializer = self.get_serializer(cascade_maps, many=True)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    @action(detail=True, methods=['delete'])
    def rollback(self, request, pk=None):
        """Rollback a cascade operation"""
        cascade_map = self.get_object()
        rollback_service = CascadeRollback()
        try:
            success = rollback_service.rollback_cascade(str(cascade_map.id), request.user)
            if success:
                return Response({'message': 'Cascade rolled back successfully'})
            return Response(
                {'error': 'Rollback failed'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    @action(detail=False, methods=['post'])
    def cascade_department(self, request):
        """Cascade department target to individuals"""
        cascader = TargetCascader()  
        dept_target_id = request.data.get('department_target')
        rule_id = request.data.get('cascade_rule')
        user_ids = request.data.get('user_ids', [])
        weights = request.data.get('weights', {})
        try:
            cascade_maps = cascader.cascade_from_department(
                dept_target_id=dept_target_id,
                rule_id=rule_id,
                user_ids=user_ids,
                user=request.user,
                weights=weights
            )
            serializer = self.get_serializer(cascade_maps, many=True)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    @action(detail=False, methods=['get'])
    def tree(self, request):
        """Get cascade tree for an organization target"""
        org_target_id = request.query_params.get('organization_target')
        if not org_target_id:
            return Response(
                {'error': 'organization_target parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        cascader = TargetCascader()
        tree = cascader.get_cascade_tree(org_target_id)
        return Response(tree)