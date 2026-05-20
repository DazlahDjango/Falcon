# apps/dashboard/api/v1/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ExecutiveDashboardViewSet, ClientAdminDashboardViewSet,
    SuperAdminDashboardViewSet, HierarchyViewSet, DashboardConfigViewSet,
    WidgetConfigViewSet, FavoriteKPIViewSet, DashboardAlertViewSet,
    ExportScheduleViewSet, PeriodComparisonViewSet, ExecutiveViewPresetViewSet,
    # New views for remaining dashboards
    ManagerDashboardView, StaffDashboardView, ChampionDashboardView,
    ReadOnlyDashboardView, DrillDownView
)

router = DefaultRouter()
router.register(r'executive', ExecutiveDashboardViewSet, basename='executive-dashboard')
router.register(r'client-admin', ClientAdminDashboardViewSet, basename='client-admin-dashboard')
router.register(r'super-admin', SuperAdminDashboardViewSet, basename='super-admin-dashboard')
router.register(r'hierarchy', HierarchyViewSet, basename='hierarchy')
router.register(r'configs', DashboardConfigViewSet, basename='dashboard-config')
router.register(r'widgets', WidgetConfigViewSet, basename='widget-config')
router.register(r'favorites', FavoriteKPIViewSet, basename='favorite-kpi')
router.register(r'alerts', DashboardAlertViewSet, basename='dashboard-alert')
router.register(r'exports', ExportScheduleViewSet, basename='export-schedule')
router.register(r'comparisons', PeriodComparisonViewSet, basename='period-comparison')
router.register(r'view-presets', ExecutiveViewPresetViewSet, basename='executive-view-preset')

urlpatterns = [
    # Router URLs (existing)
    path('', include(router.urls)),
    
    # ===================== MANAGER, STAFF, CHAMPION, READ-ONLY URLS =====================
    
    # Manager Dashboard (APIView, not ViewSet)
    path('manager/', ManagerDashboardView.as_view(), name='manager-dashboard'),
    path('manager/approve/', ManagerDashboardView.as_view(), name='manager-approve'),
    path('manager/reject/', ManagerDashboardView.as_view(), name='manager-reject'),
    
    # Staff Dashboard
    path('staff/', StaffDashboardView.as_view(), name='staff-dashboard'),
    path('staff/submit/', StaffDashboardView.as_view(), name='staff-submit'),
    
    # Champion Dashboard
    path('champion/', ChampionDashboardView.as_view(), name='champion-dashboard'),
    path('champion/update/', ChampionDashboardView.as_view(), name='champion-update'),
    
    # Read-Only Dashboard
    path('read-only/', ReadOnlyDashboardView.as_view(), name='read-only-dashboard'),
    path('read-only/export/', ReadOnlyDashboardView.as_view(), name='read-only-export'),
    
    # Enhanced Drill-Down
    path('drill-down/<int:user_id>/', DrillDownView.as_view(), name='drill-down'),
]