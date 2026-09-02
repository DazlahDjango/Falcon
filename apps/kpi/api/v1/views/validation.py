from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .base import BaseKpiViewset
from ..serializers import ValidationRecordSerializer, RejectionReasonSerializer, EscalationSerializer
from ....models import ValidationRecord, RejectionReason, Escalation
from ..filters import ValidationRecordListFilter
from ....services import ValidationEscalator
from ....services.validation import pending_validation_count_for_supervisor

class ValidationRecordViewSet(BaseKpiViewset):
    queryset = ValidationRecord.objects.all()
    serializer_class = ValidationRecordSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = ValidationRecordListFilter
    search_fields = ['comment', 'validated_by__email']
    ordering_fields = ['validated_at']
    ordering = ['-validated_at']

    def get_queryset(self):
        queryset = super().get_queryset()
        return queryset.select_related('actual', 'actual__kpi', 'actual__user', 'validated_by')

    @action(detail=False, methods=['get'])
    def pending(self, request):
        from apps.kpi.models import MonthlyActual
        from apps.kpi.api.v1.serializers import MonthlyActualSerializer

        user = request.user
        role = str(getattr(user, 'role', '')).lower()

        qs = MonthlyActual.objects.filter(status='PENDING').select_related('kpi', 'user')

        if role not in ['super_admin', 'superadmin', 'client_admin', 'admin', 'dashboard_champion', 'executive'] and not getattr(user, 'is_superuser', False):
            reports = []
            if hasattr(user, 'get_direct_reports'):
                reports.extend([str(r) for r in user.get_direct_reports().values_list('id', flat=True)])

            try:
                from apps.structure.models import Employment
                employments = Employment.objects.filter(is_current=True, is_active=True)
                for emp in employments:
                    if emp.effective_manager_user_id and str(emp.effective_manager_user_id) == str(user.id):
                        reports.append(str(emp.user_id))
            except Exception:
                pass

            reports = list(set(reports))
            qs = qs.filter(user_id__in=reports)

        serializer = MonthlyActualSerializer(qs, many=True)
        return Response({
            'results': serializer.data,
            'count': qs.count(),
        })

    @action(detail=False, methods=['get'], url_path='pending-summary')
    def pending_summary(self, request):
        """Enhanced pending summary with more metadata."""
        direct_reports = request.user.get_direct_reports().values_list('id', flat=True)
        
        pending_validations = self.get_queryset().filter(
            actual__user_id__in=direct_reports,
            status='PENDING'
        ).select_related('actual__kpi', 'actual__user')
        
        # Calculate additional metrics
        from django.db.models import Count, Min, Max
        from django.utils import timezone
        
        now = timezone.now()
        
        summary = {
            'pending_count': pending_validations.count(),
            'supervisor_id': str(request.user.id),
            'by_kpi': {},
            'by_user': {},
            'by_period': {},
            'oldest_pending': None,
            'oldest_days': None,
        }
        
        # Group by KPI
        for validation in pending_validations:
            kpi_name = validation.actual.kpi.name
            if kpi_name not in summary['by_kpi']:
                summary['by_kpi'][kpi_name] = 0
            summary['by_kpi'][kpi_name] += 1
            
            # Group by user
            user_email = validation.actual.user.email
            if user_email not in summary['by_user']:
                summary['by_user'][user_email] = 0
            summary['by_user'][user_email] += 1
            
            # Group by period
            period = f"{validation.actual.year}-{validation.actual.month:02d}"
            if period not in summary['by_period']:
                summary['by_period'][period] = 0
            summary['by_period'][period] += 1
            
            # Find oldest
            if validation.validated_at:
                days_old = (now - validation.validated_at).days
                if summary['oldest_days'] is None or days_old > summary['oldest_days']:
                    summary['oldest_days'] = days_old
                    summary['oldest_pending'] = {
                        'kpi': kpi_name,
                        'user': user_email,
                        'period': period,
                        'days_old': days_old,
                        'validation_id': str(validation.id)
                    }
        
        # Convert to lists for easier frontend consumption
        summary['by_kpi'] = [{'kpi': k, 'count': v} for k, v in summary['by_kpi'].items()]
        summary['by_user'] = [{'user': u, 'count': v} for u, v in summary['by_user'].items()]
        summary['by_period'] = [{'period': p, 'count': v} for p, v in summary['by_period'].items()]
        
        return Response(summary)


class RejectionReasonViewSet(BaseKpiViewset):
    queryset = RejectionReason.objects.filter(is_active=True)
    serializer_class = RejectionReasonSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['category', 'is_active']
    search_fields = ['reason', 'description']
    ordering_fields = ['display_order']
    ordering = ['display_order']

    def get_queryset(self):
        queryset = super().get_queryset()
        tenant_id = getattr(self.request, 'current_tenant_id', None)
        if tenant_id:
            return queryset.filter(tenant_id=tenant_id)
        return queryset


class EscalationViewSet(BaseKpiViewset):
    queryset = Escalation.objects.all()
    serializer_class = EscalationSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'escalated_by', 'escalated_to']
    search_fields = ['reason', 'resolution']
    ordering_fields = ['escalated_at']
    ordering = ['-escalated_at']

    def get_queryset(self):
        queryset = super().get_queryset()
        return queryset.select_related(
            'actual', 'actual__kpi', 'actual__user',
            'escalated_by', 'escalated_to', 'resolved_by'
        )

    def create(self, request, *args, **kwargs):
        escalator = ValidationEscalator()
        try:
            escalation = escalator.escalate(
                actual_id=request.data.get('actual'),
                escalated_to_id=request.data.get('escalated_to'),
                reason=request.data.get('reason'),
                user=request.user
            )
            serializer = self.get_serializer(escalation)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    def resolve(self, request, pk=None):
        escalation = self.get_object()
        escalator = ValidationEscalator()
        try:
            resolved = escalator.resolve_escalation(
                str(escalation.id),
                request.data.get('resolution'),
                request.user
            )
            serializer = self.get_serializer(resolved)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['get'])
    def my_escalations(self, request):
        user_id = request.user.id
        escalations = self.get_queryset().filter(
            escalated_to_id=user_id,
            status__in=['PENDING', 'REVIEWING']
        )
        serializer = self.get_serializer(escalations, many=True)
        return Response(serializer.data)