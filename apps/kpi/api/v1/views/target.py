from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .base import BaseKpiViewset
from ..serializers import AnnualTargetSerializer, MonthlyPhasingSerializer
from ....models import AnnualTarget, MonthlyPhasing
from ..filters import AnnualTargetListFilter, MonthlyPhasingListFilter
from ....services import TargetSetter, TargetPhaser, TargetLocker, TargetValidator
from ....exceptions import PhasingLockedError, DuplicatePhasingError

class AnnualTargetViewSet(BaseKpiViewset):
    queryset = AnnualTarget.objects.all()
    serializer_class = AnnualTargetListFilter
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filter_class = AnnualTargetListFilter
    search_fields = ['kpi__name', 'kpi__code', 'user__email']
    ordering_fields = ['year', 'target_value', 'created_at']
    ordering = ['-year', 'kpi__name']

    def create(self, request, *args, **kwargs):
        setter = TargetSetter()
        try:
            target = setter.set_annual_target(
                kpi_id=request.data.get('kpi'),
                user_id=request.data.get('user'),
                year=request.data.get('year'),
                target_value=request.data.get('target_value'),
                user=request.user
            )
            serializer = self.get_serializer(target)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    @action(detail=True, methods=['post'])
    def phase(self, request, pk=None):
        target = self.get_object()
        phaser = TargetPhaser()
        strategy = request.data.get('strategy', 'equal_split')
        strategy_params = request.data.get('strategy_params', {})
        try:
            monthly_target = phaser.phase_target(
                str(target.id),
                strategy,
                strategy_params,
                request.user
            )
            serializer = MonthlyPhasingSerializer(monthly_target, many=True)
            return Response(serializer.data)
        except (PhasingLockedError, DuplicatePhasingError) as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    @action(detail=True, methods=['get'])
    def phasing(self, request, pk=None):
        target = self.get_object()
        phasing = target.monthly_phasing.all().order_by('month')
        serializer = MonthlyPhasingSerializer(phasing, many=True)
        return Response(serializer.data)
    @action(detail=True, methods=['get'])
    def validate(self, request, pk=None):
        target = self.get_object()
        validator = TargetValidator()
        phasing_validation = validator.validate_phasing_sum(str(target.id))
        monthly_validation = validator.validate_monthly_targets(str(target.id))
        return Response({
            'annual_target_valid': True,
            'phasing_summary': phasing_validation,
            'monthly_validation': monthly_validation
        })
    
class MonthlyPhasingViewSet(BaseKpiViewset):
    queryset = MonthlyPhasing.objects.all()
    serializer_class = MonthlyPhasingSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = MonthlyPhasingListFilter
    ordering_fields = ['month', 'target_value', 'is_locked']
    ordering = ['annual_target', 'month']

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.is_locked:
            return Response(
                {'error': 'Cannot modify locked phasing'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)
    @action(detail=False, methods=['post'])
    def lock_cycle(self, request):
        locker = TargetLocker()
        tenant_id = request.tenant.id
        performance_cycle = request.data.get('performance_cycle')
        if not performance_cycle:
            return Response(
                {'error': 'performance_cycle is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        updated = locker.lock_phasing_for_cycle(
            str(tenant_id),
            performance_cycle,
            request.user
        )
        return Response({
            'message': f'Locked {updated} phasing records',
            'updated_count': updated
        })
    @action(detail=True, methods=['post'])
    def lock(self, request, pk=None):
        phasing = self.get_object()
        if phasing.is_locked:
            return Response(
                {'error': 'Already locked'},
                status=status.HTTP_400_BAD_REQUEST
            )
        phasing.lock(request.user)
        serializer = self.get_serializer(phasing)
        return Response(serializer.data)