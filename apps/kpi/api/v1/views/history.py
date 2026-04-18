from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .base import ReadOnlyKPIViewset
from ..serializers import KPIHistorySerializer, ActualHistorySerializer, TargetHistorySerializer
from ....models import KPIHistory, ActualHistory, TargetHistory
from ..permissions import IsAuthenticatedAndActive, CanViewAuditLogs

class KPIHistoryViewSet(ReadOnlyKPIViewset):
    queryset = KPIHistory.objects.all()
    serializer_class = KPIHistorySerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['kpi', 'action', 'performed_by']
    search_fields = ['reason', 'snapshot']
    ordering_fields = ['performed_at']
    ordering = ['-performed_at']
    permission_classes = [IsAuthenticatedAndActive, CanViewAuditLogs]

    @action(detail=False, methods=['get'])
    def for_kpi(self, request):
        kpi_id = request.query_params.get('kpi_id')
        if not kpi_id:
            return Response(
                {'error': 'kpi_id parameter is required'},
                status=400
            )
        history = self.queryset.filter(kpi_id=kpi_id)
        serializer = self.get_serializer(history, many=True)
        return Response(serializer.data)

class ActualHistoryViewSet(ReadOnlyKPIViewset):
    queryset = ActualHistory.objects.all()
    serializer_class = ActualHistorySerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['actual', 'action', 'performed_by']
    search_fields = ['reason']
    ordering_fields = ['performed_at']
    ordering = ['-performed_at']
    permission_classes = [IsAuthenticatedAndActive, CanViewAuditLogs]

    @action(detail=False, methods=['get'])
    def for_actual(self, request):
        actual_id = request.query_params.get('actual_id')
        if not actual_id:
            return Response(
                {'error': 'actual_id parameter is required'},
                status=400
            )
        history = self.queryset.filter(actual_id=actual_id)
        serializer = self.get_serializer(history, many=True)
        return Response(serializer.data)

class TargetHistoryViewSet(ReadOnlyKPIViewset):
    queryset = TargetHistory.objects.all()
    serializer_class = TargetHistorySerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['annual_target', 'action', 'performed_by']
    search_fields = ['notes']
    ordering_fields = ['performed_at']
    ordering = ['-performed_at']
    permission_classes = [IsAuthenticatedAndActive, CanViewAuditLogs]

    @action(detail=False, methods=['get'])
    def for_target(self, request):
        target_id = request.query_params.get('target_id')
        if not target_id:
            return Response(
                {'error': 'target_id parameter is required'},
                status=400
            )
        history = self.queryset.filter(annual_target_id=target_id)
        serializer = self.get_serializer(history, many=True)
        return Response(serializer.data)