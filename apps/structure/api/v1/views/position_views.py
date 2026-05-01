from rest_framework import status, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from django.db import models
from uuid import UUID
from ....models import Position
from ..serializers.position import PositionSerializer, PositionDetailSerializer, PositionCreateUpdateSerializer
from ..filters.position_filter import PositionFilter
from ..throttles.structure_limits import HierarchyReadThrottle, HierarchyWriteThrottle
from ..permissions.structure_permissions import (
    CanViewPosition, CanEditPosition, CanDeletePosition
)
from .base import BaseStructureViewSet


class PositionViewSet(BaseStructureViewSet):
    queryset = Position.objects.select_related('reports_to', 'default_department').all()
    filterset_class = PositionFilter
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['job_code', 'title', 'grade']
    ordering_fields = ['job_code', 'title', 'level', 'grade', 'created_at']
    ordering = ['job_code']
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return PositionDetailSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return PositionCreateUpdateSerializer
        return PositionSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update']:
            self.permission_classes = [CanEditPosition]
        elif self.action == 'destroy':
            self.permission_classes = [CanDeletePosition]
        else:
            self.permission_classes = [CanViewPosition]
        return super().get_permissions()
    
    def get_throttles(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            self.throttle_classes = [HierarchyWriteThrottle]
        else:
            self.throttle_classes = [HierarchyReadThrottle]
        return super().get_throttles()
    
    @action(detail=True, methods=['get'], url_path='incumbents')
    def get_incumbents(self, request, pk=None):
        position = self.get_object()
        from ....models.employment import Employment
        incumbents = Employment.objects.filter(
            position_id=position.id,
            tenant_id=position.tenant_id,
            is_current=True,
            is_deleted=False,
            is_active=True
        ).select_related('user')
        incumbent_data = []
        for incumbent in incumbents:
            incumbent_data.append({
                'user_id': str(incumbent.user_id),
                'employment_id': str(incumbent.id),
                'effective_from': incumbent.effective_from,
                'is_manager': incumbent.is_manager
            })
        return Response({
            'position_id': str(position.id),
            'position_code': position.job_code,
            'position_title': position.title,
            'current_incumbents': incumbent_data,
            'incumbent_count': len(incumbent_data),
            'max_incumbents': position.max_incumbents,
            'is_single_incumbent': position.is_single_incumbent,
            'is_vacant': len(incumbent_data) == 0,
            'is_over_occupied': position.max_incumbents and len(incumbent_data) > position.max_incumbents
        })
    
    @action(detail=False, methods=['get'], url_path='by-code/(?P<job_code>[^/.]+)')
    def get_by_code(self, request, job_code=None):
        tenant_id = request.user.tenant_id
        position = Position.objects.filter(job_code=job_code, tenant_id=tenant_id, is_deleted=False).first()
        if not position:
            return Response({'error': 'Position not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = PositionDetailSerializer(position, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path='vacant')
    def get_vacant_positions(self, request):
        tenant_id = request.user.tenant_id
        positions = Position.objects.filter(
            tenant_id=tenant_id,
            is_deleted=False,
            current_incumbents_count=0
        )
        serializer = PositionSerializer(positions, many=True, context={'request': request})
        return Response({
            'vacant_positions': serializer.data,
            'count': positions.count()
        })
    
    @action(detail=False, methods=['get'], url_path='reporting-chain/(?P<position_id>[0-9a-f-]+)')
    def get_reporting_chain(self, request, position_id=None):
        from ....managers.position import PositionManager
        tenant_id = request.user.tenant_id
        manager = PositionManager()
        chain_up = manager.get_reporting_chain_up(UUID(position_id), tenant_id)
        chain_down = manager.get_reporting_chain_down(UUID(position_id), tenant_id, max_depth=5)
        chain_up_serializer = PositionSerializer(chain_up, many=True, context={'request': request})
        chain_down_serializer = PositionSerializer(chain_down, many=True, context={'request': request})
        return Response({
            'position_id': position_id,
            'managers_above': chain_up_serializer.data,
            'subordinates_below': chain_down_serializer.data,
            'level_above_count': len(chain_up),
            'level_below_count': len(chain_down)
        })
    
    @action(detail=False, methods=['get'], url_path='stats')
    def get_stats(self, request):
        tenant_id = request.user.tenant_id
        total = Position.objects.filter(tenant_id=tenant_id, is_deleted=False).count()
        vacant = Position.objects.filter(tenant_id=tenant_id, is_deleted=False, current_incumbents_count=0).count()
        occupied = total - vacant
        single_incumbent = Position.objects.filter(tenant_id=tenant_id, is_deleted=False, is_single_incumbent=True).count()
        level_distribution = {}
        levels = Position.objects.filter(tenant_id=tenant_id, is_deleted=False).values('level').annotate(count=models.Count('id'))
        for level in levels:
            level_distribution[level['level']] = level['count']
        return Response({
            'total_positions': total,
            'vacant_positions': vacant,
            'occupied_positions': occupied,
            'single_incumbent_positions': single_incumbent,
            'occupancy_rate': round((occupied / total * 100), 2) if total > 0 else 0,
            'level_distribution': level_distribution
        })