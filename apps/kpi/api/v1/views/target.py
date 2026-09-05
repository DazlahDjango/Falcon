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
        if not user or not user.is_authenticated:
            return queryset.none()

        scope = self.request.query_params.get('scope')
        if scope == 'my':
            return queryset.filter(user=user)
        elif scope == 'team':
            direct_reports = []
            if hasattr(user, 'get_direct_reports'):
                try:
                    direct_reports = list(user.get_direct_reports().values_list('id', flat=True))
                except Exception:
                    direct_reports = []

            try:
                from apps.structure.models import Employment
                emp_reports = list(Employment.objects.filter(
                    position__reports_to__employments__user_id=user.id,
                    is_current=True,
                    is_active=True
                ).values_list('user_id', flat=True))
                direct_reports.extend(emp_reports)
            except Exception:
                pass

            if direct_reports:
                return queryset.filter(user_id__in=direct_reports).exclude(user_id=user.id)
            else:
                return queryset.exclude(user_id=user.id)

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
        overwrite = request.data.get('overwrite', True)
        try:
            monthly_targets = phaser.phase_target(
                str(target.id),
                strategy,
                strategy_params,
                user=request.user,
                overwrite=overwrite
            )
            serializer = MonthlyPhasingSerializer(monthly_targets, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['post'])
    def bulk_phase(self, request):
        year = request.data.get('year')
        if not year:
            return Response({'error': 'year parameter is required'}, status=status.HTTP_400_BAD_REQUEST)
        strategy = request.data.get('strategy', 'equal_split')
        tenant_id = str(getattr(request, 'current_tenant_id', None) or getattr(request.user, 'tenant_id', None))
        from ....services import TargetBatchPhaser
        batch_phaser = TargetBatchPhaser()
        try:
            res = batch_phaser.phase_all_targets(
                year=int(year),
                tenant_id=tenant_id,
                strategy=strategy,
                user=request.user
            )
            return Response(res)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

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

    @action(detail=False, methods=['post', 'put'])
    def bulk_update(self, request):
        annual_target_id = request.data.get('annual_target') or request.data.get('annualTarget')
        months_data = request.data.get('months') or request.data.get('monthly_values') or []

        if not annual_target_id or not months_data:
            return Response(
                {'error': 'annual_target and months array are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        annual_target = AnnualTarget.objects.filter(id=annual_target_id).first()
        if not annual_target:
            return Response({'error': 'Annual target not found'}, status=status.HTTP_404_NOT_FOUND)

        if MonthlyPhasing.objects.filter(annual_target=annual_target, is_locked=True).exists():
            return Response({'error': 'Cannot update: one or more monthly phasing records are locked'}, status=status.HTTP_400_BAD_REQUEST)

        from decimal import Decimal
        from django.db import transaction

        updated_records = []
        with transaction.atomic():
            for item in months_data:
                m_num = item.get('month')
                m_val = Decimal(str(item.get('target_value', item.get('targetValue', 0))))
                p_obj, _ = MonthlyPhasing.objects.update_or_create(
                    tenant_id=annual_target.tenant_id,
                    annual_target=annual_target,
                    month=m_num,
                    defaults={'target_value': m_val, 'is_locked': False}
                )
                updated_records.append(p_obj)

        serializer = self.get_serializer(updated_records, many=True)
        return Response(serializer.data)