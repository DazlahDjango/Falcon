# apps/reportplt/api/v1/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_nested import routers as nested_routers
from apps.reportplt.api.v1.views import (
    ReportViewSet, TemplateViewSet, ScheduleViewSet, ExecutionViewSet,
    ExportViewSet, DashboardViewSet, WidgetViewSet, FilterViewSet,
    ShareViewSet, AuditViewSet, AnalyticsViewSet, ReportingViewSet
)

router = DefaultRouter()
router.register(r'reports', ReportViewSet, basename='report')
router.register(r'templates', TemplateViewSet, basename='template')
router.register(r'schedules', ScheduleViewSet, basename='schedule')
router.register(r'executions', ExecutionViewSet, basename='execution')
router.register(r'exports', ExportViewSet, basename='export')
router.register(r'dashboards', DashboardViewSet, basename='dashboard')
router.register(r'widgets', WidgetViewSet, basename='widget')
router.register(r'filters', FilterViewSet, basename='filter')
router.register(r'shares', ShareViewSet, basename='share')
router.register(r'audits', AuditViewSet, basename='audit')
router.register(r'analytics', AnalyticsViewSet, basename='analytics')
router.register(r'reporting', ReportingViewSet, basename='reporting')

report_router = nested_routers.NestedDefaultRouter(router, r'reports', lookup='report')
report_router.register(r'schedules', ScheduleViewSet, basename='report-schedules')
report_router.register(r'executions', ExecutionViewSet, basename='report-executions')
report_router.register(r'exports', ExportViewSet, basename='report-exports')
report_router.register(r'shares', ShareViewSet, basename='report-shares')
report_router.register(r'audits', AuditViewSet, basename='report-audits')

dashboard_router = nested_routers.NestedDefaultRouter(router, r'dashboards', lookup='dashboard')
dashboard_router.register(r'widgets', WidgetViewSet, basename='dashboard-widgets')
dashboard_router.register(r'shares', ShareViewSet, basename='dashboard-shares')
dashboard_router.register(r'audits', AuditViewSet, basename='dashboard-audits')

schedule_router = nested_routers.NestedDefaultRouter(router, r'schedules', lookup='schedule')
schedule_router.register(r'executions', ExecutionViewSet, basename='schedule-executions')

template_router = nested_routers.NestedDefaultRouter(router, r'templates', lookup='template')

urlpatterns = [
    path('', include(router.urls)),
    path('', include(report_router.urls)),
    path('', include(dashboard_router.urls)),
    path('', include(schedule_router.urls)),
    path('', include(template_router.urls)),
]