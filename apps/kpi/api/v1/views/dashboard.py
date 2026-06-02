from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from ..serializers import (
    IndividualDashboardSerializer, ManagerDashboardSerializer, ExecutiveDashboardSerializer, ChampionDashboardSerializer
)
from ....services import IndividualDashboard, ManagerDashboard, ExecutiveDashboard, ChampionDashboard
from ..throttles import DashboardThrottle
from apps.accounts.api.v1.permissions import IsManagement, IsSuperAdmin, IsExecutive, IsDashboardChampion
from ..permissions import IsAuthenticatedAndActive, IsManager, CanViewKPIAdminOverview, IsTenantMember

class IndividualDashboardView(APIView):
    permission_classes = [IsAuthenticatedAndActive]
    throttle_classes = [DashboardThrottle]
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
        dashboard_service = IndividualDashboard()
        dashboard_data = dashboard_service.get_dashboard(
            str(request.user.id),
            year, 
            month
        )
        serializer = IndividualDashboardSerializer(dashboard_data)
        return Response(serializer.data)

class ManagerDashboardView(APIView):
    permission_classes = [IsAuthenticatedAndActive, IsManager]
    throttle_classes = [DashboardThrottle]
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
        dashboard_service = ManagerDashboard()
        dashboard_data = dashboard_service.get_dashboard(
            str(request.user.id),
            year,
            month
        )
        serializer = ManagerDashboardSerializer(dashboard_data)
        return Response(serializer.data)

class ExecutiveDashboardView(APIView):
    permission_classes = [IsAuthenticatedAndActive, IsExecutive]
    throttle_classes = [DashboardThrottle]
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
        tenant_id = str(
            request.tenant.id
            if getattr(request, 'tenant', None)
            else request.user.tenant_id
        )
        dashboard_service = ExecutiveDashboard()
        dashboard_data = dashboard_service.get_dashboard(tenant_id, year, month)
        serializer = ExecutiveDashboardSerializer(dashboard_data)
        return Response(serializer.data)

class ChampionDashboardView(APIView):
    permission_classes = [IsAuthenticatedAndActive, IsDashboardChampion]
    throttle_classes = [DashboardThrottle]
    def get(self, request):
        """Get champion dashboard data"""
        year = request.query_params.get('year')
        month = request.query_params.get('month')
        if not year or not month:
            now = timezone.now()
            year = year or now.year
            month = month or now.month
        else:
            year = int(year)
            month = int(month)
        dashboard_service = ChampionDashboard()
        dashboard_data = dashboard_service.get_dashboard(
            str(request.user.id),
            year,
            month
        )
        serializer = ChampionDashboardSerializer(dashboard_data)
        return Response(serializer.data)

class KPIOverviewDashboardView(APIView):
    """Admin dashboard for KPI system overview"""
    permission_classes = [IsAuthenticatedAndActive, CanViewKPIAdminOverview, IsTenantMember]
    
    def get(self, request):
        tenant_id = request.tenant.id
        
        # Framework statistics
        frameworks = KPIFramework.objects.filter(tenant_id=tenant_id)
        total_frameworks = frameworks.count()
        published_frameworks = frameworks.filter(status='PUBLISHED').count()
        draft_frameworks = frameworks.filter(status='DRAFT').count()
        
        # Category statistics
        categories = KPICategory.objects.filter(tenant_id=tenant_id)
        total_categories = categories.count()
        categories_with_kpis = categories.filter(kpis__isnull=False).distinct().count()
        
        # Template statistics
        templates = KPITemplate.objects.filter(tenant_id=tenant_id)
        total_templates = templates.count()
        published_templates = templates.filter(is_published=True).count()
        total_template_usage = templates.aggregate(total=Sum('usage_count'))['total'] or 0
        
        # KPI statistics
        kpis = KPI.objects.filter(tenant_id=tenant_id)
        total_kpis = kpis.count()
        active_kpis = kpis.filter(is_active=True).count()
        
        # KPI distribution by framework
        kpis_by_framework = kpis.values(
            'framework__name'
        ).annotate(count=Count('id')).order_by('-count')
        
        # Recent activity
        recent_activity = KPIHistory.objects.filter(
            tenant_id=tenant_id
        ).select_related('kpi', 'performed_by')[:20]
        
        return Response({
            'frameworks': {
                'total': total_frameworks,
                'published': published_frameworks,
                'draft': draft_frameworks,
                'completion_rate': round((published_frameworks / total_frameworks * 100), 2) if total_frameworks > 0 else 0
            },
            'categories': {
                'total': total_categories,
                'with_kpis': categories_with_kpis,
                'utilization_rate': round((categories_with_kpis / total_categories * 100), 2) if total_categories > 0 else 0
            },
            'templates': {
                'total': total_templates,
                'published': published_templates,
                'total_usage': total_template_usage,
                'avg_usage_per_template': round(total_template_usage / total_templates, 2) if total_templates > 0 else 0
            },
            'kpis': {
                'total': total_kpis,
                'active': active_kpis,
                'by_framework': list(kpis_by_framework),
                'activation_rate': round((active_kpis / total_kpis * 100), 2) if total_kpis > 0 else 0
            },
            'recent_activity': [
                {
                    'kpi_name': h.kpi.name,
                    'action': h.action,
                    'performed_by': h.performed_by.email if h.performed_by else 'System',
                    'performed_at': h.performed_at
                }
                for h in recent_activity
            ]
        })