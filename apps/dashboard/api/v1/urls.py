from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ExecutiveDashboardViewSet, ClientAdminDashboardViewSet,
    SuperAdminDashboardViewSet, HierarchyViewSet, DashboardConfigViewSet,
    WidgetConfigViewSet, FavoriteKPIViewSet, DashboardAlertViewSet,
    ExportScheduleViewSet, PeriodComparisonViewSet, ExecutiveViewPresetViewSet
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
    path('', include(router.urls)),
]