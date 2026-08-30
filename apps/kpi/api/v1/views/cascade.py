# cascade.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.utils import timezone

from .base import BaseKpiViewset
from ..serializers import CascadeMapSerializer, CascadeRuleSerializer
from ....models import CascadeMap, CascadeRule
from ....services import TargetCascader, CascadeRollback, CascadeMapper
from ..permissions import CanCascadeTargets


class CascadeRuleViewSet(BaseKpiViewset):
    queryset = CascadeRule.objects.filter(is_active=True)
    serializer_class = CascadeRuleSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['rule_type', 'is_default', 'is_active']
    search_fields = ['name', 'description']
    ordering_fields = ['name']
    ordering = ['name']

    def get_queryset(self):
        queryset = super().get_queryset()
        tenant_id = getattr(self.request, 'current_tenant_id', None)
        if tenant_id:
            return queryset.filter(tenant_id=tenant_id)
        return queryset

    @action(detail=True, methods=['post'])
    def set_default(self, request, pk=None):
        rule = self.get_object()
        CascadeRule.objects.filter(tenant_id=getattr(request, 'current_tenant_id', None), is_default=True).update(is_default=False)
        rule.is_default = True
        rule.save(update_fields=['is_default', 'updated_at'])
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

    def get_queryset(self):
        queryset = super().get_queryset()
        return queryset.filter(tenant_id=getattr(self.request, 'current_tenant_id', None))

    def create(self, request, *args, **kwargs):
        cascader = TargetCascader()
        org_target_id = request.data.get('organization_target')
        rule_id = request.data.get('cascade_rule')
        targets = request.data.get('targets', [])
        
        if not org_target_id or not rule_id:
            return Response(
                {'error': 'organization_target and cascade_rule are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
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
        cascader = TargetCascader()
        dept_target_id = request.data.get('department_target')
        rule_id = request.data.get('cascade_rule')
        user_ids = request.data.get('user_ids', [])
        weights = request.data.get('weights', {})
        
        if not dept_target_id or not rule_id:
            return Response(
                {'error': 'department_target and cascade_rule are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
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
        org_target_id = request.query_params.get('organization_target')
        if not org_target_id:
            return Response(
                {'error': 'organization_target parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        cascader = TargetCascader()
        tenant_id = str(getattr(request, 'current_tenant_id', None) or getattr(request.user, 'tenant_id', None))
        tree = cascader.get_cascade_tree(org_target_id, tenant_id)
        return Response(tree)

    @action(detail=False, methods=['post'])
    def repair(self, request):
        kpi_id = request.data.get('kpi_id')
        year = request.data.get('year')
        if not kpi_id or not year:
            return Response(
                {'error': 'kpi_id and year parameters are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        cascader = TargetCascader()
        tenant_id = str(getattr(request, 'current_tenant_id', None) or getattr(request.user, 'tenant_id', None))
        try:
            result = cascader.repair_structural_cascade_maps(tenant_id, str(kpi_id), int(year))
            return Response(result, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def contributors(self, request):
        org_target_id = request.query_params.get('organization_target')
        if not org_target_id:
            return Response(
                {'error': 'organization_target parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        mapper = CascadeMapper()
        tenant_id = str(getattr(request, 'current_tenant_id', None) or getattr(request.user, 'tenant_id', None))
        data = mapper.get_contributors(org_target_id, tenant_id)
        return Response(data)

    @action(detail=False, methods=['get'])
    def user_contributions(self, request):
        user_id = request.query_params.get('user_id') or str(request.user.id)
        year = request.query_params.get('year') or timezone.now().year
        mapper = CascadeMapper()
        tenant_id = str(getattr(request, 'current_tenant_id', None) or getattr(request.user, 'tenant_id', None))
        data = mapper.get_contributions_for_user(str(user_id), int(year), tenant_id)
        return Response(data)

    @action(detail=False, methods=['post'])
    def rollback_organization(self, request):
        org_target_id = request.data.get('organization_target')
        if not org_target_id:
            return Response(
                {'error': 'organization_target is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        rollback_service = CascadeRollback()
        try:
            res = rollback_service.rollback_organization_cascade(str(org_target_id), request.user)
            return Response(res, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def verify_integrity(self, request):
        org_target_id = request.query_params.get('organization_target')
        if not org_target_id:
            return Response(
                {'error': 'organization_target parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        rollback_service = CascadeRollback()
        tenant_id = str(getattr(request, 'current_tenant_id', None) or getattr(request.user, 'tenant_id', None))
        res = rollback_service.verify_cascade_integrity(str(org_target_id), tenant_id)
        return Response(res)