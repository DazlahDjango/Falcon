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
        direct_reports = request.user.get_direct_reports().values_list('id', flat=True)
        validations = self.get_queryset().filter(
            actual__user_id__in=direct_reports,
            status='PENDING'
        )
        serializer = self.get_serializer(validations, many=True)
        return Response({
            'results': serializer.data,
            'count': len(serializer.data),
        })

    @action(detail=False, methods=['get'], url_path='pending-summary')
    def pending_summary(self, request):
        count = pending_validation_count_for_supervisor(request.user)
        return Response({
            'pending_count': count,
            'supervisor_id': str(request.user.id),
        })


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