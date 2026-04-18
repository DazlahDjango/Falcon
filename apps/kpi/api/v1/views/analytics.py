from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q, Avg, Count
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .base import ReadOnlyKPIViewset
from ..serializers import KPISummarySerializer, DepartmentRollupSerializer, OrganizationHealthSerializer
from ....models import KPISummary, DepartmentRollup, OrganizationHealth
from apps.accounts.api.v1.permissions import IsExecutive
from ..permissions import IsAuthenticatedAndActive, IsManager

class KPISummaryViewSet(ReadOnlyKPIViewset):
    queryset = KPISummary.objects.all()
    serializer_class = KPISummarySerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['kpi', 'year', 'month']
    search_fields = ['kpi__name', 'kpi__code']
    ordering_fields = ['average_score', 'year', 'month']
    ordering = ['-year', '-month', '-average_score']
    permission_classes = [IsAuthenticatedAndActive, IsManager]

    @action(detail=False, methods=['get'])
    def by_sector(self, request):
        year = request.query_params.get('year')
        month = request.query_params.get('month')
        queryset = self.queryset
        if year:
            queryset = queryset.filter(year=year)
        if month:
            queryset = queryset.filter(month=month)
        sector_summaries = queryset.values('kpi__sector__name').annotate(
            avg_score=Avg('average_score')
        )
        return Response(sector_summaries)
    @action(detail=False, methods=['get'])
    def trends(self, request):
        kpi_id = request.query_params.get('kpi')
        if not kpi_id:
            return Response(
                {'error': 'kpi parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        summaries = self.queryset.filter(kpi_id=kpi_id).order_by('year', 'month')
        serializer = self.get_serializer(summaries, many=True)
        return Response(serializer.data)
    
class DepartmentRollupViewSet(ReadOnlyKPIViewset):
    queryset = DepartmentRollup.objects.all()
    serializer_class = DepartmentRollupSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['department_id', 'year', 'month']
    search_fields = ['department_name']
    ordering_fields = ['overall_score', 'year', 'month']
    ordering = ['-year', '-month', '-overall_score']
    permission_classes = [IsAuthenticatedAndActive, IsManager]

    @action(detail=False, methods=['get'])
    def ranking(self, request):
        year = request.query_params.get('year')
        month = request.query_params.get('month')
        queryset = queryset.filter
        if year:
            queryset = queryset.filter(year=year)
        if month:
            queryset = queryset.filter(month=month)
        ranking = queryset.order_by('-overall_score')
        serializer = self.get_serializer(ranking)
        return Response(serializer.data)
    
class OrganizationHealthViewSet(ReadOnlyKPIViewset):
    queryset = OrganizationHealth.objects.all()
    serializer_class = OrganizationHealthSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['tenant_id', 'year', 'month']
    ordering_fields = ['overall_health_score', 'year', 'month']
    ordering = ['-year', '-month']
    permission_classes = [IsAuthenticatedAndActive, IsExecutive]

    @action(detail=False, methods=['get'])
    def history(self, request):
        months_back = int(request.query_params.get('months', 12))
        from ....utils import DateUtils
        now = timezone.now()
        periods = []
        for i in range(months_back):
            year, month = DateUtils.get_previous_period(now.year, now.month - i)
            health = self.queryset.filter(
                tenant_id=request.tenant.id,
                year=year,
                month=month
            ).first()
            if health:
                periods.append(self.get_serializer(health).data)
        return Response(periods)