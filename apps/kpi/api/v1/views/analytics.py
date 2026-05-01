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
                logger.warning(f"No KPI summaries found for year={year}, month={month}")
                # Return empty but valid response
                return Response({
                    'count': 0,
                    'next': None,
                    'previous': None,
                    'results': [],
                    'message': 'No KPI summary data available for the selected period'
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
            
            # Count total before pagination
            total_count = queryset.count()
            
            # Apply ordering and pagination
            start = (page - 1) * page_size
            end = start + page_size
            
            queryset = queryset.order_by('-year', '-month', '-overall_score')[start:end]
            
            serializer = self.get_serializer(queryset, many=True)
            
            # Return paginated response
            return Response({
                'count': total_count,
                'page': page,
                'page_size': page_size,
                'results': serializer.data
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
                
            ranking = queryset.order_by('-overall_score')[:limit]
            serializer = self.get_serializer(ranking, many=True)
            return Response(serializer.data)
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