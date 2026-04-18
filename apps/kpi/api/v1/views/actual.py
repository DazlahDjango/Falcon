from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .base import BaseKpiViewset
from ..serializers import MonthlyActualSerializer, EvidenceSerializer, ActualAdjustmentSerializer, ValidationRecordSerializer
from ....models import MonthlyActual, Evidence, ActualAdjustment
from ..filters import MonthlyActualListFilter
from ....services import ActualEntry, ActualSubmitter, ActualEvidence, ActualAdjustmentService, ValidationApprover, ValidationRejecter, ValidationResubmission
from ....exceptions import HistoricalDataError, EvidenceUploadError

class MonthlyActualViewSet(BaseKpiViewset):
    queryset = MonthlyActual.objects.all()
    serializer_class = MonthlyActualSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = MonthlyActualListFilter
    search_fields = ['kpi__name', 'kpi__code', 'user__email', 'notes']
    ordering_fields = ['year', 'month', 'actual_value', 'status', 'submitted_at']
    ordering = ['-year', '-month', 'kpi__name']

    def create(self, request, *args, **kwargs):
        entry_service = ActualEntry()
        try:
            actual = entry_service.enter_actual(
                kpi_id=request.data.get('kpi'),
                user_id=request.data.get('user', request.user.id),
                year=request.data.get('year'),
                month=request.data.get('month'),
                actual_value=request.data.get('actual_value'),
                notes=request.data.get('notes', ''),
                evidence_file=request.FILES.get('evidence')
            )
            serializer = self.get_serializer(actual)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except (HistoricalDataError, EvidenceUploadError) as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        actual = self.get_object()
        submitter = ActualSubmitter()
        try:
            submitted = submitter.submit_for_validation(str(actual.id), request.user)
            serializer = self.get_serializer(submitted)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        actual = self.get_object()
        approver = ValidationApprover()
        try: 
            approved = approver.approve(
                str(actual.id),
                request.user,
                request.data.get('comment', '')
            )
            serializer = self.get_serializer(approved)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_403_FORBIDDEN
            )
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        actual = self.get_object()
        rejecter = ValidationRejecter()
        try:
            rejected = rejecter.reject(
                str(actual.id),
                request.user,
                request.data.get('reason_id'),
                request.data.get('comment', '')
            )
            serializer = self.get_serializer(rejected)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_403_FORBIDDEN
            )
    @action(detail=True, methods=['post'])
    def resubmit(self, request, pk=None):
        actual = self.get_object()
        resubmitter = ValidationResubmission()
        try:
            resubmitted = resubmitter.resubmit(
                str(actual.id),
                request.data.get('actual_value'),
                request.user,
                request.data.get('notes', '')
            )
            serializer = self.get_serializer(resubmitted)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    @action(detail=True, methods=['get'])
    def evidence(self, request, pk=None):
        actual = self.get_object()
        evidence = actual.evidence.all()
        serializer = EvidenceSerializer(evidence, many=True)
        return Response(serializer.data)
    @action(detail=True, methods=['get'])
    def validations(self, request, pk=None):
        actual = self.get_object()
        validations = actual.validations.all()
        serializer = ValidationRecordSerializer(validations)
        return Response(serializer.data)

class EvidenceViewSet(BaseKpiViewset):
    queryset = Evidence.objects.all()
    serializer_class = EvidenceSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['actual', 'evidence_type']
    def perform_create(self, serializer):
        serializer.save(
            tenant_id=self.request.tenant.id,
            uploaded_by=self.request.user
        )

class ActualAdjustmentViewSet(BaseKpiViewset):
    queryset = ActualAdjustment.objects.all()
    serializer_class = ActualAdjustmentSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'requested_by', 'original_actual']
    ordering = ['-requested_at']
    def create(self, request, *args, **kwargs):
        adjustment_service = ActualAdjustmentService()
        try:
            result = adjustment_service.request_adjustment(
                actual_id=request.data.get('original_actual'),
                new_value=request.data.get('adjusted_value'),
                reason=request.data.get('reason'),
                user=request.user
            )
            return Response(result, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        adjustment = self.get_object()
        adjustment_service = ActualAdjustmentService()
        try:
            approved_actual = adjustment_service.approve_adjustment(str(adjustment.id), request.user)
            serializer = MonthlyActualSerializer(approved_actual)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_403_FORBIDDEN
            )