# apps/kpi/api/v1/views/dashboard.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from django.db.models import Count, Sum
from django.core.exceptions import ValidationError
import logging

from ..serializers import (
    IndividualDashboardSerializer, ManagerDashboardSerializer,
    ExecutiveDashboardSerializer, ChampionDashboardSerializer
)
from ....services import IndividualDashboard, ManagerDashboard, ExecutiveDashboard, ChampionDashboard
from ....models import KPIFramework, KPICategory, KPITemplate, KPI, KPIHistory
from ..throttles import DashboardThrottle
from apps.accounts.api.v1.permissions import IsManagement, IsSuperAdmin, IsExecutive, IsDashboardChampion
from ..permissions import IsAuthenticatedAndActive, IsManager, CanViewKPIAdminOverview, IsTenantMember

logger = logging.getLogger(__name__)


class IndividualDashboardView(APIView):
    """
    Individual dashboard for regular users showing personal KPI performance.
    """
    permission_classes = [IsAuthenticatedAndActive]
    throttle_classes = [DashboardThrottle]

    def get(self, request):
        try:
            year = request.query_params.get('year')
            month = request.query_params.get('month')

            now = timezone.now()
            if year and month:
                year = int(year)
                month = int(month)
            else:
                year = int(year) if year else now.year
                month = int(month) if month else now.month

            if month < 1 or month > 12:
                return Response(
                    {'error': 'Month must be between 1 and 12'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            dashboard_service = IndividualDashboard()
            dashboard_data = dashboard_service.get_dashboard(
                str(request.user.id),
                year,
                month
            )

            serializer = IndividualDashboardSerializer(dashboard_data)
            return Response(serializer.data)

        except Exception as e:
            logger.error(f"IndividualDashboardView error: {str(e)}", exc_info=True)
            return Response(
                {'error': 'Failed to load dashboard', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ManagerDashboardView(APIView):
    """
    Manager dashboard showing team performance and pending validations.
    Requires user to have direct reports.
    """
    permission_classes = [IsAuthenticatedAndActive, IsManager]
    throttle_classes = [DashboardThrottle]

    def get(self, request):
        try:
            year = request.query_params.get('year')
            month = request.query_params.get('month')

            now = timezone.now()
            if year and month:
                year = int(year)
                month = int(month)
            else:
                year = int(year) if year else now.year
                month = int(month) if month else now.month

            if month < 1 or month > 12:
                return Response(
                    {'error': 'Month must be between 1 and 12'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            dashboard_service = ManagerDashboard()
            dashboard_data = dashboard_service.get_dashboard(
                str(request.user.id),
                year,
                month
            )

            serializer = ManagerDashboardSerializer(dashboard_data)
            return Response(serializer.data)

        except Exception as e:
            logger.error(f"ManagerDashboardView error: {str(e)}", exc_info=True)
            return Response(
                {'error': 'Failed to load manager dashboard', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ExecutiveDashboardView(APIView):
    """
    Executive dashboard for C-level users showing organization-wide metrics.
    """
    permission_classes = [IsAuthenticatedAndActive, IsExecutive]
    throttle_classes = [DashboardThrottle]

    def get(self, request):
        try:
            year = request.query_params.get('year')
            month = request.query_params.get('month')

            now = timezone.now()
            if year and month:
                year = int(year)
                month = int(month)
            else:
                year = int(year) if year else now.year
                month = int(month) if month else now.month

            if month < 1 or month > 12:
                return Response(
                    {'error': 'Month must be between 1 and 12'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            tenant_id = getattr(request, 'current_tenant_id', None)
            if not tenant_id:
                tenant_id = str(request.user.tenant_id) if hasattr(request.user, 'tenant_id') else None

            if not tenant_id:
                return Response(
                    {'error': 'Unable to determine tenant'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            dashboard_service = ExecutiveDashboard()
            dashboard_data = dashboard_service.get_dashboard(tenant_id, year, month)

            serializer = ExecutiveDashboardSerializer(dashboard_data)
            return Response(serializer.data)

        except Exception as e:
            logger.error(f"ExecutiveDashboardView error: {str(e)}", exc_info=True)
            return Response(
                {'error': 'Failed to load executive dashboard', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ChampionDashboardView(APIView):
    """
    Dashboard Champion dashboard for monitoring organization-wide compliance.
    """
    permission_classes = [IsAuthenticatedAndActive, IsDashboardChampion]
    throttle_classes = [DashboardThrottle]

    def get(self, request):
        try:
            year = request.query_params.get('year')
            month = request.query_params.get('month')

            now = timezone.now()
            if year and month:
                year = int(year)
                month = int(month)
            else:
                year = int(year) if year else now.year
                month = int(month) if month else now.month

            if month < 1 or month > 12:
                return Response(
                    {'error': 'Month must be between 1 and 12'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            dashboard_service = ChampionDashboard()
            dashboard_data = dashboard_service.get_dashboard(
                str(request.user.id),
                year,
                month
            )

            serializer = ChampionDashboardSerializer(dashboard_data)
            return Response(serializer.data)

        except Exception as e:
            logger.error(f"ChampionDashboardView error: {str(e)}", exc_info=True)
            return Response(
                {'error': 'Failed to load champion dashboard', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class KPIOverviewDashboardView(APIView):
    """
    Admin dashboard for KPI system overview.
    Shows statistics about frameworks, categories, templates, and KPIs.
    """
    permission_classes = [IsAuthenticatedAndActive, CanViewKPIAdminOverview, IsTenantMember]

    def get(self, request):
        try:
            tenant_id = getattr(request, 'current_tenant_id', None)
            if not tenant_id:
                tenant_id = str(request.user.tenant_id) if hasattr(request.user, 'tenant_id') else None

            if not tenant_id:
                return Response(
                    {'error': 'Unable to determine tenant'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Framework statistics
            frameworks = KPIFramework.objects.filter(tenant_id=tenant_id)
            total_frameworks = frameworks.count()
            published_frameworks = frameworks.filter(status='PUBLISHED').count()
            draft_frameworks = frameworks.filter(status='DRAFT').count()
            archived_frameworks = frameworks.filter(status='ARCHIVED').count()

            # Category statistics
            categories = KPICategory.objects.filter(tenant_id=tenant_id)
            total_categories = categories.count()
            categories_with_kpis = categories.filter(kpis__isnull=False).distinct().count()
            active_categories = categories.filter(is_active=True).count()

            # Template statistics
            templates = KPITemplate.objects.filter(tenant_id=tenant_id)
            total_templates = templates.count()
            published_templates = templates.filter(is_published=True).count()
            total_template_usage = templates.aggregate(total=Sum('usage_count'))['total'] or 0

            # KPI statistics
            kpis = KPI.objects.filter(tenant_id=tenant_id)
            total_kpis = kpis.count()
            active_kpis = kpis.filter(is_active=True).count()
            inactive_kpis = kpis.filter(is_active=False).count()

            # KPI distribution by type
            kpis_by_type = kpis.values('kpi_type').annotate(count=Count('id')).order_by('-count')

            # KPI distribution by framework
            kpis_by_framework = kpis.values('framework__name', 'framework__id').annotate(
                count=Count('id')
            ).order_by('-count')[:10]

            # KPI distribution by sector
            kpis_by_sector = kpis.values('sector__name').annotate(count=Count('id')).order_by('-count')

            # Recent activity
            recent_activity = KPIHistory.objects.filter(
                tenant_id=tenant_id
            ).select_related('kpi', 'performed_by')[:20]

            return Response({
                'frameworks': {
                    'total': total_frameworks,
                    'published': published_frameworks,
                    'draft': draft_frameworks,
                    'archived': archived_frameworks,
                    'completion_rate': round((published_frameworks / total_frameworks * 100), 2) if total_frameworks > 0 else 0
                },
                'categories': {
                    'total': total_categories,
                    'active': active_categories,
                    'with_kpis': categories_with_kpis,
                    'utilization_rate': round((categories_with_kpis / total_categories * 100), 2) if total_categories > 0 else 0
                },
                'templates': {
                    'total': total_templates,
                    'published': published_templates,
                    'total_usage': total_template_usage,
                    'avg_usage_per_template': round(total_template_usage / total_templates, 2) if total_templates > 0 else 0,
                    'publication_rate': round((published_templates / total_templates * 100), 2) if total_templates > 0 else 0
                },
                'kpis': {
                    'total': total_kpis,
                    'active': active_kpis,
                    'inactive': inactive_kpis,
                    'by_type': list(kpis_by_type),
                    'by_framework': list(kpis_by_framework),
                    'by_sector': list(kpis_by_sector),
                    'activation_rate': round((active_kpis / total_kpis * 100), 2) if total_kpis > 0 else 0
                },
                'recent_activity': [
                    {
                        'kpi_name': h.kpi.name if h.kpi else 'Unknown',
                        'kpi_id': str(h.kpi_id) if h.kpi_id else None,
                        'action': h.action,
                        'performed_by': h.performed_by.email if h.performed_by else 'System',
                        'performed_at': h.performed_at.isoformat() if h.performed_at else None
                    }
                    for h in recent_activity
                ]
            })

        except Exception as e:
            logger.error(f"KPIOverviewDashboardView error: {str(e)}", exc_info=True)
            return Response(
                {'error': 'Failed to load KPI overview dashboard', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )