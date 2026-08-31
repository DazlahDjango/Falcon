from django.db.models import Q
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
    serializer_class = AnnualTargetSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = AnnualTargetListFilter
    search_fields = ['kpi__name', 'user__email', 'user__first_name', 'user__last_name']
    ordering_fields = ['year', 'target_value', 'created_at']
    ordering = ['-target_value', '-year']

    def paginate_queryset(self, queryset):
        if self.request.query_params.get('all') == 'true' or self.request.query_params.get('no_page') == 'true':
            return None
        return super().paginate_queryset(queryset)

    def get_queryset(self):
        queryset = super().get_queryset().select_related('kpi', 'user', 'approved_by')
        user = self.request.user

        # Champions / HR Admins / Super Admins / Client Admins see overall targets
        role = str(getattr(user, 'role', '')).lower()
        is_admin_or_champion = role in [
            'super_admin', 'superadmin', 'platform_admin', 
            'client_admin', 'admin', 'kpi_champion', 'hr_admin'
        ]

        if is_admin_or_champion or self.request.query_params.get('all') == 'true':
            return queryset

        # Scoping based on organizational structure role / rank
        hierarchy_level = self.request.query_params.get('hierarchy_level') or role
        if hierarchy_level in ['executive', 'ceo']:
            # Executive sees targets cascaded to division level / division leaders
            queryset = queryset.filter(
                Q(child_cascades__division_target__isnull=False) |
                Q(user__role__icontains='division') |
                Q(user=user)
            )
        elif hierarchy_level in ['division_lead', 'division_admin']:
            # Division Lead sees department targets
            queryset = queryset.filter(
                Q(child_cascades__department_target__isnull=False) |
                Q(user__role__icontains='department') |
                Q(user=user)
            )
        elif hierarchy_level in ['department_lead', 'manager']:
            # Department Lead sees section targets
            queryset = queryset.filter(
                Q(child_cascades__section_target__isnull=False) |
                Q(user__role__icontains='section') |
                Q(user=user)
            )
        elif hierarchy_level in ['unit_lead', 'supervisor']:
            # Unit Lead sees team / individual member targets or targets created by user
            queryset = queryset.filter(
                Q(child_cascades__unit_target__isnull=False) |
                Q(child_cascades__individual_target__isnull=False) |
                Q(user=user) |
                Q(created_by=user)
            )
        elif hierarchy_level in ['staff', 'employee', 'individual']:
            # Individual views own assigned targets or targets created by user
            queryset = queryset.filter(Q(user=user) | Q(created_by=user))

        return queryset.distinct()


    def create(self, request, *args, **kwargs):
        setter = TargetSetter()
        kpi_id = request.data.get('kpi') or request.data.get('kpi_id') or request.data.get('kpiId')
        user_id = request.data.get('user') or request.data.get('user_id') or request.data.get('userId')
        year = request.data.get('year')
        target_value = request.data.get('target_value') if 'target_value' in request.data else request.data.get('targetValue')
        try:
            target = setter.set_annual_target(
                kpi_id=kpi_id,
                user_id=user_id,
                year=year,
                target_value=target_value,
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
        strategy_params = request.data.get('strategy_params') or request.data.get('strategyParams') or {}
        try:
            monthly_targets = phaser.phase_target(
                str(target.id),
                strategy,
                strategy_params,
                request.user
            )
            serializer = MonthlyPhasingSerializer(monthly_targets, many=True)
            return Response(serializer.data)
        except Exception as e:
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

    def get_queryset(self):
        queryset = super().get_queryset()
        return queryset.select_related('annual_target__kpi', 'annual_target__user', 'locked_by')

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
        tenant_id = getattr(request, 'current_tenant_id', None)
        if not tenant_id and hasattr(request.user, 'tenant_id'):
            tenant_id = str(request.user.tenant_id)
        if not tenant_id:
            return Response(
                {'error': 'Unable to determine tenant'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        performance_cycle = request.data.get('performance_cycle') or request.data.get('performanceCycle')
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

    @action(detail=False, methods=['post'])
    def unlock_cycle(self, request):
        locker = TargetLocker()
        tenant_id = getattr(request, 'current_tenant_id', None)
        if not tenant_id and hasattr(request.user, 'tenant_id'):
            tenant_id = str(request.user.tenant_id)
        if not tenant_id:
            return Response(
                {'error': 'Unable to determine tenant'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        performance_cycle = request.data.get('performance_cycle') or request.data.get('performanceCycle')
        if not performance_cycle:
            return Response(
                {'error': 'performance_cycle is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        updated = locker.unlock_phasing_for_cycle(
            str(tenant_id),
            performance_cycle,
            request.user
        )
        
        return Response({
            'message': f'Unlocked {updated} phasing records',
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