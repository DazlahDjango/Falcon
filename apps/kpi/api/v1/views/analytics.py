from rest_framework import viewsets, status
from rest_framework.views import APIView
import logging
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q, Avg, Count
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .base import ReadOnlyKPIViewset
from ..serializers import KPISummarySerializer, DepartmentRollupSerializer, OrganizationHealthSerializer, CustomReportSerializer
from ....models import KPISummary, DepartmentRollup, OrganizationHealth, AggregatedScore
from ....services.analytics import (
    get_department_rollups,
    get_kpi_summaries,
    get_organization_health,
    get_organization_health_history,
)
from apps.accounts.api.v1.permissions import IsExecutive
from ..permissions import IsAuthenticatedAndActive, IsManager
from ..throttles import ExportThrottle

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
    
class PerformanceHeatmapView(APIView):
    permission_classes = [IsAuthenticatedAndActive, IsExecutive]
    def get(self, request):
        year = request.query_params.get('year')
        month = request.query_params.get('month')
        if not year or not month:
            now = timezone.now()
            year = year or now.year
            month = month or now.month
        else:
            year = int(year)
            month = int(month)
        dept_scores = AggregatedScore.objects.filter(
            level='DEPARTMENT',
            tenant_id=request.tenant.id,
            year=year,
            month=month
        ).values('entity_id', 'entity_name', 'aggregated_score')
        from apps.kpi.models import Score, KPI
        kpis = KPI.objects.filter(tenant_id=request.tenant.id, is_active=True)
        heatmap_data = []
        for dept in dept_scores:
            from apps.accounts.models import User
            users = User.objects.filter(department_id=dept['entity_id'], is_active=True)
            dept_data = {
                'department_id': dept['entity_id'],
                'department_name': dept['entity_name'],
                'overall_score': dept['aggregated_score'],
                'kpis': []
            }
            for kpi in kpis:
                scores = Score.objects.filter(
                    kpi=kpi,
                    user_id__in=users.values_list('id', flat=True),
                    year=year,
                    month=month
                )   
                avg_score = scores.aggregate(avg=Avg('score'))['avg'] or 0
                dept_data['kpis'].append({
                    'kpi_id': str(kpi.id),
                    'kpi_name': kpi.name,
                    'average_score': avg_score
                })
            heatmap_data.append(dept_data)
        return Response({
            'year': year,
            'month': month,
            'data': heatmap_data
        })

class AnalyticsExportView(APIView):  
    permission_classes = [IsAuthenticatedAndActive, IsExecutive]
    throttle_classes = [ExportThrottle]
    
    def get(self, request):
        export_type = request.query_params.get('type', 'csv')
        year = request.query_params.get('year')
        month = request.query_params.get('month')
        
        if not year or not month:
            now = timezone.now()
            year = year or now.year
            month = month or now.month
        else:
            year = int(year)
            month = int(month)
        
        # Get data
        dept_scores = AggregatedScore.objects.filter(
            level='DEPARTMENT',
            tenant_id=request.tenant.id,
            year=year,
            month=month
        ).values('entity_name', 'aggregated_score', 'member_count')
        
        kpi_summaries = KPISummary.objects.filter(
            tenant_id=request.tenant.id,
            year=year,
            month=month
        ).values('kpi__name', 'average_score', 'green_count', 'yellow_count', 'red_count')
        
        # Generate CSV
        import csv
        import io
        
        output = io.StringIO()
        
        if export_type == 'csv':
            writer = csv.writer(output)
            writer.writerow(['Department', 'Score', 'Member Count'])
            for dept in dept_scores:
                writer.writerow([dept['entity_name'], dept['aggregated_score'], dept['member_count']])
            
            writer.writerow([])
            writer.writerow(['KPI', 'Average Score', 'Green', 'Yellow', 'Red'])
            for kpi in kpi_summaries:
                writer.writerow([
                    kpi['kpi__name'],
                    kpi['average_score'],
                    kpi['green_count'],
                    kpi['yellow_count'],
                    kpi['red_count']
                ])
            
            response = Response(output.getvalue(), content_type='text/csv')
            response['Content-Disposition'] = f'attachment; filename="analytics_{year}_{month:02d}.csv"'
            return response
        
        return Response({'error': 'Unsupported export type'}, status=400)


class CustomReportView(APIView):
    permission_classes = [IsAuthenticatedAndActive, IsExecutive]
    throttle_classes = [ExportThrottle]
    
    def post(self, request):
        serializer = CustomReportSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        report_type = data['report_type']
        format_type = data.get('format', 'pdf')
        filters = data.get('filters', {})
        from apps.kpi.services import ReportGenerator
        
        generator = ReportGenerator()
        
        
        if report_type == 'kpi_performance':
            report = generator.generate_kpi_performance_report(
                request.tenant.id,
                filters.get('kpi_ids', []),
                filters.get('year'),
                filters.get('month'),
                format_type
            )
        elif report_type == 'department_comparison':
            report = generator.generate_department_comparison_report(
                request.tenant.id,
                filters.get('year'),
                filters.get('month'),
                format_type
            )
        elif report_type == 'trend_analysis':
            report = generator.generate_trend_analysis_report(
                request.tenant.id,
                filters.get('kpi_ids', []),
                filters.get('months', 12),
                format_type
            )
        else:
            return Response({'error': f'Unknown report type: {report_type}'}, status=400)
        from ....tasks import generate_custom_report_task
        
        task = generate_custom_report_task.delay(
            tenant_id=str(request.tenant.id),
            report_data=data,
            user_id=str(request.user.id)
        )
        
        return Response({
            'task_id': task.id,
            'status': 'PENDING',
            'message': 'Report generation started'
        }, status=202)


class NotificationPreferencesView(APIView):
    permission_classes = [IsAuthenticatedAndActive]
    
    def get(self, request):
        """Get user notification preferences"""
        from ....models import NotificationPreference
        
        preferences, created = NotificationPreference.objects.get_or_create(
            tenant_id=request.tenant.id,
            user_id=request.user.id
        )
        
        return Response({
            'push_enabled': preferences.push_enabled,
            'email_enabled': preferences.email_enabled,
            'in_app_enabled': preferences.in_app_enabled,
            'types': preferences.types
        })
    
    def put(self, request):
        """Update user notification preferences"""
        from ....models import NotificationPreference
        
        preferences, created = NotificationPreference.objects.get_or_create(
            tenant_id=request.tenant.id,
            user_id=request.user.id
        )
        
        preferences.push_enabled = request.data.get('push_enabled', preferences.push_enabled)
        preferences.email_enabled = request.data.get('email_enabled', preferences.email_enabled)
        preferences.in_app_enabled = request.data.get('in_app_enabled', preferences.in_app_enabled)
        
        if 'types' in request.data:
            preferences.types = {**preferences.types, **request.data['types']}
        
        preferences.save()
        
        return Response({
            'push_enabled': preferences.push_enabled,
            'email_enabled': preferences.email_enabled,
            'in_app_enabled': preferences.in_app_enabled,
            'types': preferences.types
        })