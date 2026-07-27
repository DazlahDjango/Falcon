# apps/reportplt/routing.py
from django.urls import re_path
from apps.reportplt.consumers import (
    DashboardConsumer,
    ReportStatusConsumer,
    NotificationConsumer
)

websocket_urlpatterns = [
    re_path(r'ws/dashboard/(?P<dashboard_id>[^/]+)/$', DashboardConsumer.as_asgi()),
    re_path(r'ws/report/(?P<report_id>[^/]+)/status/$', ReportStatusConsumer.as_asgi()),
    re_path(r'ws/notifications/$', NotificationConsumer.as_asgi()),
]