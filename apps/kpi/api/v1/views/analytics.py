# analytics.py
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
from ..serializers import (
    KPISummarySerializer, DepartmentRollupSerializer,
    OrganizationHealthSerializer, CustomReportSerializer
)
from ....models import KPISummary, DepartmentRollup, OrganizationHealth, AggregatedScore, Score, KPI
from ....services.analytics import (
    get_department_rollups,
    get_kpi_summaries,
    get_organization_health,
    get_organization_health_history,
    enrich_department_rollup_row
)
from apps.accounts.api.v1.permissions import IsExecutive
from ..permissions import IsAuthenticatedAndActive, IsManager
from ..throttles import ExportThrottle

logger = logging.getLogger(__name__)


class KPISummaryViewSet(ReadOnlyKPIViewset):
    serializer_class = KPISummarySerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['year', 'month']
    search_fields = ['kpi__name', 'kpi__code']
    ordering_fields = ['average_score', 'year', 'month']
    ordering = ['-year', '-month', '-average_score']
    permission_classes = [IsAuthenticatedAndActive, IsManager]

    def get_queryset(self):
        return KPISummary.objects.none()

    def list(self, request, *args, **kwargs):
        try:
            year = request.query_params.get('year')
            month = request.query_params.get('month')
            
            logger.info(f"Fetching KPI summaries for year={year}, month={month}")
            
            tenant_id = getattr(request, 'current_tenant_id', None)
            if not tenant_id and hasattr(request.user, 'tenant_id'):
                tenant_id = str(request.user.tenant_id)
            y = int(year) if year else timezone.now().year
            m = int(month) if month else timezone.now().month
            
            live_rows = get_kpi_summaries(tenant_id, y, m, prefer_mv=False)
            
            if live_rows:
                return Response({
                    'count': len(live_rows),
                    'results': live_rows,
                    'source': 'live',
                })
            
            logger.warning(f"No KPI summaries found for year={y}, month={m}")
            return Response({
                'count': 0,
                'results': [],
                'message': 'No KPI summary data available for the selected period',
            }, status=status.HTTP_200_OK)
            
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
            
            tenant_id = getattr(request, 'current_tenant_id', None)
            if not tenant_id and hasattr(request.user, 'tenant_id'):
                tenant_id = str(request.user.tenant_id)
            y = int(year) if year else timezone.now().year
            m = int(month) if month else timezone.now().month
            
            summaries = get_kpi_summaries(tenant_id, y, m, prefer_mv=False)
            
            from collections import defaultdict
            sector_map = defaultdict(lambda: {'total': 0, 'count': 0})
            
            for s in summaries:
                sector = s.get('sector_name', 'Unknown')
                sector_map[sector]['total'] += s.get('average_score', 0)
                sector_map[sector]['count'] += 1
            
            result = [
                {'sector': name, 'avg_score': round(data['total'] / data['count'], 2) if data['count'] > 0 else 0}
                for name, data in sector_map.items()
            ]
            
            return Response(result)
        except Exception as e:
            logger.error(f"Error in by_sector: {str(e)}")
            return Response([], status=status.HTTP_200_OK)


class DepartmentRollupViewSet(ReadOnlyKPIViewset):
    serializer_class = DepartmentRollupSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['year', 'month']
    search_fields = ['department_name']
    ordering_fields = ['overall_score', 'year', 'month']
    ordering = ['-year', '-month', '-overall_score']
    permission_classes = [IsAuthenticatedAndActive, IsManager]

    def get_queryset(self):
        return DepartmentRollup.objects.none()

    def list(self, request, *args, **kwargs):
        try:
            year = request.query_params.get('year')
            month = request.query_params.get('month')
            
            page_size = int(request.query_params.get('page_size', 50))
            page = int(request.query_params.get('page', 1))
            page_size = min(page_size, 500)
            
            tenant_id = getattr(request, 'current_tenant_id', None)
            if not tenant_id and hasattr(request.user, 'tenant_id'):
                tenant_id = str(request.user.tenant_id)
            y = int(year) if year else timezone.now().year
            m = int(month) if month else timezone.now().month
            
            live_rows = get_department_rollups(tenant_id, y, m, prefer_mv=False)
            
            total_count = len(live_rows)
            start = (page - 1) * page_size
            end = start + page_size
            page_rows = live_rows[start:end]
            
            enriched_rows = [enrich_department_rollup_row(tenant_id, row) for row in page_rows]
            
            return Response({
                'count': total_count,
                'page': page,
                'page_size': page_size,
                'results': enriched_rows,
                'source': 'live',
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
            limit = int(request.query_params.get('limit', 10))
            limit = min(limit, 100)
            
            tenant_id = getattr(request, 'current_tenant_id', None)
            if not tenant_id and hasattr(request.user, 'tenant_id'):
                tenant_id = str(request.user.tenant_id)
            y = int(year) if year else timezone.now().year
            m = int(month) if month else timezone.now().month
            
            rollups = get_department_rollups(tenant_id, y, m, prefer_mv=False)[:limit]
            
            enriched_rows = [enrich_department_rollup_row(tenant_id, row) for row in rollups]
            
            return Response(enriched_rows)
        except Exception as e:
            logger.error(f"Error in ranking: {str(e)}")
            return Response([], status=status.HTTP_200_OK)


class OrganizationHealthViewSet(ReadOnlyKPIViewset):
    serializer_class = OrganizationHealthSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['year', 'month']
    ordering_fields = ['overall_health_score', 'year', 'month']
    ordering = ['-year', '-month']
    permission_classes = [IsAuthenticatedAndActive, IsExecutive]

    def get_queryset(self):
        return OrganizationHealth.objects.none()

    def list(self, request, *args, **kwargs):
        year = request.query_params.get('year')
        month = request.query_params.get('month')
        now = timezone.now()
        y = int(year) if year else now.year
        m = int(month) if month else now.month
        tenant_id = getattr(request, 'current_tenant_id', None)
        if not tenant_id and hasattr(request.user, 'tenant_id'):
            tenant_id = str(request.user.tenant_id)
        health = get_organization_health(tenant_id, y, m)
        return Response({
            'count': 1,
            'results': [health],
            'source': health.get('source', 'live'),
        })

    @action(detail=False, methods=['get'])
    def current(self, request):
        now = timezone.now()
        year = int(request.query_params.get('year', now.year))
        month = int(request.query_params.get('month', now.month))
        tenant_id = getattr(request, 'current_tenant_id', None)
        if not tenant_id and hasattr(request.user, 'tenant_id'):
            tenant_id = str(request.user.tenant_id)
        health = get_organization_health(tenant_id, year, month)
        return Response(health)

    @action(detail=False, methods=['get'])
    def history(self, request):
        months_back = int(request.query_params.get('months', 12))
        tenant_id = getattr(request, 'current_tenant_id', None)
        if not tenant_id and hasattr(request.user, 'tenant_id'):
            tenant_id = str(request.user.tenant_id)
        history = get_organization_health_history(tenant_id, months_back=months_back)
        return Response(history)


class PerformanceHeatmapView(APIView):
    permission_classes = [IsAuthenticatedAndActive, IsExecutive]

    def get(self, request):
        year = request.query_params.get('year')
        month = request.query_params.get('month')
        
        now = timezone.now()
        y = int(year) if year else now.year
        m = int(month) if month else now.month
        
        dept_scores = AggregatedScore.objects.filter(
            level='DEPARTMENT',
            tenant_id=getattr(request, 'current_tenant_id', None),
            year=y,
            month=m
        ).values('entity_id', 'entity_name', 'aggregated_score')
        
        kpis = KPI.objects.filter(tenant_id=getattr(request, 'current_tenant_id', None), is_active=True)
        
        from apps.accounts.models import User
        
        heatmap_data = []
        for dept in dept_scores:
            users = User.objects.filter(department_id=dept['entity_id'], is_active=True)
            user_ids = list(users.values_list('id', flat=True))
            
            dept_data = {
                'department_id': dept['entity_id'],
                'department_name': dept['entity_name'],
                'overall_score': dept['aggregated_score'],
                'kpis': []
            }
            
            for kpi in kpis:
                scores = Score.objects.filter(
                    kpi=kpi,
                    user_id__in=user_ids,
                    year=y,
                    month=m
                )
                avg_score = scores.aggregate(avg=Avg('score'))['avg'] or 0
                dept_data['kpis'].append({
                    'kpi_id': str(kpi.id),
                    'kpi_name': kpi.name,
                    'average_score': round(float(avg_score), 2)
                })
            
            heatmap_data.append(dept_data)
        
        return Response({
            'year': y,
            'month': m,
            'data': heatmap_data
        })


class AnalyticsExportView(APIView):
    permission_classes = [IsAuthenticatedAndActive, IsExecutive]
    throttle_classes = [ExportThrottle]

    def get(self, request):
        export_type = request.query_params.get('type', 'csv')
        year = request.query_params.get('year')
        month = request.query_params.get('month')
        
        now = timezone.now()
        y = int(year) if year else now.year
        m = int(month) if month else now.month
        
        dept_scores = AggregatedScore.objects.filter(
            level='DEPARTMENT',
            tenant_id=getattr(request, 'current_tenant_id', None),
            year=y,
            month=m
        ).values('entity_name', 'aggregated_score', 'member_count')
        
        kpi_summaries_list = get_kpi_summaries(str(getattr(request, 'current_tenant_id', None)), y, m, prefer_mv=False)
        
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
            for kpi_summary in kpi_summaries_list:
                writer.writerow([
                    kpi_summary.get('kpi_name', 'Unknown'),
                    kpi_summary.get('average_score', 0),
                    kpi_summary.get('green_count', 0),
                    kpi_summary.get('yellow_count', 0),
                    kpi_summary.get('red_count', 0)
                ])
            
            response = Response(output.getvalue(), content_type='text/csv')
            response['Content-Disposition'] = f'attachment; filename="analytics_{y}_{m:02d}.csv"'
            return response
        
        return Response({'error': 'Unsupported export type'}, status=400)


class CustomReportView(APIView):
    permission_classes = [IsAuthenticatedAndActive, IsExecutive]
    throttle_classes = [ExportThrottle]

    def post(self, request):
        serializer = CustomReportSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        
        from ....services import ReportGenerator
        from ....tasks import generate_custom_report_task
        
        generator = ReportGenerator()
        report_type = data['report_type']
        format_type = data.get('format', 'pdf')
        filters = data.get('filters', {})
        
        if report_type == 'kpi_performance':
            report = generator.generate_kpi_performance_report(
                str(getattr(request, 'current_tenant_id', None)),
                str(getattr(request, 'current_tenant_id', None)),
                filters.get('kpi_ids', []),
                filters.get('year'),
                filters.get('month'),
                format_type
            )
        elif report_type == 'department_comparison':
            report = generator.generate_department_comparison_report(
                str(getattr(request, 'current_tenant_id', None)),
                str(getattr(request, 'current_tenant_id', None)),
                filters.get('year'),
                filters.get('month'),
                format_type
            )
        elif report_type == 'trend_analysis':
            report = generator.generate_trend_analysis_report(
                str(getattr(request, 'current_tenant_id', None)),
                str(getattr(request, 'current_tenant_id', None)),
                filters.get('kpi_ids', []),
                filters.get('months', 12),
                format_type
            )
        else:
            return Response({'error': f'Unknown report type: {report_type}'}, status=400)
        
        task = generate_custom_report_task.delay(
            tenant_id=str(getattr(request, 'current_tenant_id', None)),
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
        from ....models import NotificationPreference
        
        tenant_id = getattr(request, 'current_tenant_id', None)
        if not tenant_id and hasattr(request.user, 'tenant_id'):
            tenant_id = str(request.user.tenant_id)
        
        if not tenant_id:
            return Response({'error': 'Unable to determine tenant'}, status=400)
        
        preferences, created = NotificationPreference.objects.get_or_create(
            tenant_id=tenant_id,
            user=request.user
        )
        
        return Response({
            'push_enabled': preferences.push_enabled,
            'email_enabled': preferences.email_enabled,
            'in_app_enabled': preferences.in_app_enabled,
            'types': preferences.types or {}
        })

    def put(self, request):
        from ....models import NotificationPreference
        
        tenant_id = getattr(request, 'current_tenant_id', None)
        if not tenant_id and hasattr(request.user, 'tenant_id'):
            tenant_id = str(request.user.tenant_id)
        
        if not tenant_id:
            return Response({'error': 'Unable to determine tenant'}, status=400)
        
        preferences, created = NotificationPreference.objects.get_or_create(
            tenant_id=tenant_id,
            user=request.user
        )
        
        preferences.push_enabled = request.data.get('push_enabled', preferences.push_enabled)
        preferences.email_enabled = request.data.get('email_enabled', preferences.email_enabled)
        preferences.in_app_enabled = request.data.get('in_app_enabled', preferences.in_app_enabled)
        
        if 'types' in request.data:
            current_types = preferences.types or {}
            preferences.types = {**current_types, **request.data['types']}
        
        preferences.save()
        
        return Response({
            'push_enabled': preferences.push_enabled,
            'email_enabled': preferences.email_enabled,
            'in_app_enabled': preferences.in_app_enabled,
            'types': preferences.types
        })