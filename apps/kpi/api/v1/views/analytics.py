from rest_framework import viewsets, status
import logging
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q, Avg, Count
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .base import ReadOnlyKPIViewset
from ..serializers import KPISummarySerializer, DepartmentRollupSerializer, OrganizationHealthSerializer
from ....models import KPISummary, DepartmentRollup, OrganizationHealth
from ....services.analytics import (
    get_department_rollups,
    get_kpi_summaries,
    get_organization_health,
    get_organization_health_history,
)
from apps.accounts.api.v1.permissions import IsExecutive
from ..permissions import IsAuthenticatedAndActive, IsManager

logger = logging.getLogger(__name__)

class KPISummaryViewSet(ReadOnlyKPIViewset):
    queryset = KPISummary.objects.all()
    serializer_class = KPISummarySerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['kpi', 'year', 'month']
    search_fields = ['kpi__name', 'kpi__code']
    ordering_fields = ['average_score', 'year', 'month']
    ordering = ['-year', '-month', '-average_score']
    permission_classes = [IsAuthenticatedAndActive, IsManager]

    def get_queryset(self):
        """Override to add filtering and error handling"""
        try:
            queryset = super().get_queryset()
            
            # Add tenant filtering if applicable
            if hasattr(self.request, 'tenant') and self.request.tenant:
                # Assuming your KPISummary has tenant_id field
                if hasattr(KPISummary, 'tenant_id'):
                    queryset = queryset.filter(tenant_id=self.request.tenant.id)
            
            return queryset
        except Exception as e:
            logger.error(f"Error in get_queryset: {str(e)}")
            return KPISummary.objects.none()

    def list(self, request, *args, **kwargs):
        """Override list to handle empty results gracefully"""
        try:
            # Get year and month from query params
            year = request.query_params.get('year')
            month = request.query_params.get('month')
            
            logger.info(f"Fetching KPI summaries for year={year}, month={month}")
            
            # Get filtered queryset
            queryset = self.get_queryset()
            
            if year:
                queryset = queryset.filter(year=year)
            if month:
                queryset = queryset.filter(month=month)
            
            # Check if we have data
            if not queryset.exists():
                tenant_id = str(request.tenant.id)
                live_rows = get_kpi_summaries(
                    tenant_id,
                    int(year) if year else timezone.now().year,
                    int(month) if month else timezone.now().month,
                    prefer_mv=False,
                )
                if live_rows:
                    if isinstance(live_rows[0], dict):
                        return Response({
                            'count': len(live_rows),
                            'results': live_rows,
                            'source': 'live',
                        })
                    serializer = self.get_serializer(live_rows, many=True)
                    return Response({
                        'count': len(live_rows),
                        'results': serializer.data,
                        'source': 'materialized_view',
                    })
                logger.warning(f"No KPI summaries found for year={year}, month={month}")
                return Response({
                    'count': 0,
                    'next': None,
                    'previous': None,
                    'results': [],
                    'message': 'No KPI summary data available for the selected period',
                }, status=status.HTTP_200_OK)
            
            # Paginate if needed
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
            
        except Exception as e:
            logger.error(f"Error in KPISummaryViewSet.list: {str(e)}", exc_info=True)
            return Response(
                {
                    'error': 'Failed to fetch KPI summaries',
                    'detail': str(e),
                    'results': []
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def by_sector(self, request):
        try:
            year = request.query_params.get('year')
            month = request.query_params.get('month')
            queryset = self.get_queryset()
            
            if year:
                queryset = queryset.filter(year=year)
            if month:
                queryset = queryset.filter(month=month)
            
            if not queryset.exists():
                return Response([], status=status.HTTP_200_OK)
            
            sector_summaries = queryset.values('kpi__sector__name').annotate(
                avg_score=Avg('average_score')
            )
            return Response(sector_summaries)
        except Exception as e:
            logger.error(f"Error in by_sector: {str(e)}")
            return Response([], status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'])
    def trends(self, request):
        try:
            kpi_id = request.query_params.get('kpi')
            if not kpi_id:
                return Response(
                    {'error': 'kpi parameter is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            summaries = self.get_queryset().filter(kpi_id=kpi_id).order_by('year', 'month')
            serializer = self.get_serializer(summaries, many=True)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error in trends: {str(e)}")
            return Response([], status=status.HTTP_200_OK)
class DepartmentRollupViewSet(ReadOnlyKPIViewset):
    queryset = DepartmentRollup.objects.all()
    serializer_class = DepartmentRollupSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['department_id', 'year', 'month']
    search_fields = ['department_name']
    ordering_fields = ['overall_score', 'year', 'month']
    ordering = ['-year', '-month', '-overall_score']
    permission_classes = [IsAuthenticatedAndActive, IsManager]
    pagination_class = None  # Will use manual pagination for analytics

    def list(self, request, *args, **kwargs):
        """Override list to add pagination and optimization"""
        try:
            # Get filter parameters
            year = request.query_params.get('year')
            month = request.query_params.get('month')
            
            # Start with base queryset
            queryset = self.get_queryset()
            
            # Apply filters
            if year:
                queryset = queryset.filter(year=year)
            if month:
                queryset = queryset.filter(month=month)
            
            # Get pagination params
            page_size = int(request.query_params.get('page_size', 50))
            page = int(request.query_params.get('page', 1))
            
            # Limit page size to prevent huge requests
            page_size = min(page_size, 500)
            
            tenant_id = str(request.tenant.id)
            y = int(year) if year else timezone.now().year
            m = int(month) if month else timezone.now().month

            if not queryset.exists():
                live_rows = get_department_rollups(tenant_id, y, m, prefer_mv=False)
                total_count = len(live_rows)
                start = (page - 1) * page_size
                end = start + page_size
                page_rows = live_rows[start:end]
                return Response({
                    'count': total_count,
                    'page': page,
                    'page_size': page_size,
                    'results': page_rows,
                    'source': 'live',
                })

            total_count = queryset.count()
            start = (page - 1) * page_size
            end = start + page_size
            queryset = queryset.order_by('-year', '-month', '-overall_score')[start:end]
            results = []
            for row in queryset:
                data = self.get_serializer(row).data
                from ....services.analytics import enrich_department_rollup_row
                results.append(enrich_department_rollup_row(tenant_id, dict(data)))
            return Response({
                'count': total_count,
                'page': page,
                'page_size': page_size,
                'results': results,
                'source': 'materialized_view',
            })
        except Exception as e:
            logger.error(f"Error in DepartmentRollupViewSet.list: {str(e)}", exc_info=True)
            return Response(
                {
                    'error': 'Failed to fetch department rollups',
                    'detail': str(e),
                    'results': []
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def ranking(self, request):
        try:
            year = request.query_params.get('year')
            month = request.query_params.get('month')
            
            # Get limit parameter for ranking (default 10)
            limit = int(request.query_params.get('limit', 10))
            limit = min(limit, 100)  # Max 100 records
            
            queryset = self.get_queryset()
            
            if year:
                queryset = queryset.filter(year=year)
            if month:
                queryset = queryset.filter(month=month)
                
            tenant_id = str(request.tenant.id)
            y = int(year) if year else timezone.now().year
            m = int(month) if month else timezone.now().month
            if not queryset.exists():
                live_rows = get_department_rollups(tenant_id, y, m, prefer_mv=False)[:limit]
                return Response(live_rows)
            ranking = queryset.order_by('-overall_score')[:limit]
            results = []
            for row in ranking:
                data = dict(self.get_serializer(row).data)
                from ....services.analytics import enrich_department_rollup_row
                results.append(enrich_department_rollup_row(tenant_id, data))
            return Response(results)
        except Exception as e:
            logger.error(f"Error in ranking: {str(e)}")
            return Response([], status=status.HTTP_200_OK)
    
class OrganizationHealthViewSet(ReadOnlyKPIViewset):
    queryset = OrganizationHealth.objects.all()
    serializer_class = OrganizationHealthSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['tenant_id', 'year', 'month']
    ordering_fields = ['overall_health_score', 'year', 'month']
    ordering = ['-year', '-month']
    permission_classes = [IsAuthenticatedAndActive, IsExecutive]

    def list(self, request, *args, **kwargs):
        year = request.query_params.get('year')
        month = request.query_params.get('month')
        now = timezone.now()
        y = int(year) if year else now.year
        m = int(month) if month else now.month
        tenant_id = str(request.tenant.id)
        health = get_organization_health(tenant_id, y, m)
        return Response({
            'count': 1,
            'results': [health],
            'source': health.get('source', 'live'),
        })

    @action(detail=False, methods=['get'])
    def current(self, request):
        """Primary executive health payload for the selected period."""
        now = timezone.now()
        year = int(request.query_params.get('year', now.year))
        month = int(request.query_params.get('month', now.month))
        tenant_id = str(request.tenant.id)
        health = get_organization_health(tenant_id, year, month)
        return Response(health)

    @action(detail=False, methods=['get'])
    def history(self, request):
        months_back = int(request.query_params.get('months', 12))
        tenant_id = str(request.tenant.id)
        periods = get_organization_health_history(tenant_id, months_back=months_back)
        return Response(periods)