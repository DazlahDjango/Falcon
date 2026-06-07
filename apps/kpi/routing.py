from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(
        r'ws/kpi/dashboard/(?P<user_id>[0-9a-f-]+)/$',
        consumers.KPIDashboardConsumer.as_asgi(),
        name='kpi-dashboard'
    ),
    re_path(
        r'ws/kpi/team/(?P<manager_id>[0-9a-f-]+)/$',
        consumers.KPITeamConsumer.as_asgi(),
        name='kpi-team'
    ),
    re_path(
        r'ws/kpi/executive/(?P<tenant_id>[0-9a-f-]+)/$',
        consumers.KPIExecutiveConsumer.as_asgi(),
        name='kpi-executive'
    ),
    re_path(
        r'ws/kpi/admin/monitor/$',
        consumers.KPIAdminConsumer.as_asgi(),
        name='kpi-admin'
    ),
    re_path(
        r'ws/kpi/admin/?$',
        consumers.KPIAdminConsumer.as_asgi(),
        name='kpi-admin-alias'
    ),
    re_path(
        r'ws/kpi/notifications/(?P<user_id>[0-9a-f-]+)/$',
        consumers.KPINotificationConsumer.as_asgi(),
        name='kpi-notifications'
    ),
    re_path(
        r'ws/kpi/scores/(?P<user_id>[0-9a-f-]+)/$',
        consumers.KPIScoreConsumer.as_asgi(),
        name='kpi-scores'
    ),
    re_path(
        r'ws/kpi/validation/(?P<user_id>[0-9a-f-]+)/$',
        consumers.KPIValidationConsumer.as_asgi(),
        name='kpi-validation'
    ),
    re_path(
        r'ws/kpi/reports/(?P<report_id>[0-9a-f-]+)/$',
        consumers.KPIReportConsumer.as_asgi(),
        name='kpi-report'
    ),
    
    # Analytics WebSocket
    re_path(
        r'ws/kpi/analytics/(?P<tenant_id>[0-9a-f-]+)/$',
        consumers.KPIAnalyticsConsumer.as_asgi(),
        name='kpi-analytics'
    ),
    
    # System Alerts WebSocket
    re_path(
        r'ws/kpi/alerts/(?P<tenant_id>[0-9a-f-]+)/$',
        consumers.KPIAlertsConsumer.as_asgi(),
        name='kpi-alerts'
    ),
]