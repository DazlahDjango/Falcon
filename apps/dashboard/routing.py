from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/dashboard/(?P<dashboard_type>\w+)/$', consumers.DashboardConsumer.as_asgi()),
    re_path(r'ws/notifications/$', consumers.DashboardNotificationConsumer.as_asgi()),
]