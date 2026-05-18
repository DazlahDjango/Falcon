from django.urls import re_path
from apps.configs.consumers import MaintenanceStatusConsumer, BackupProgressConsumer, DRProgressConsumer

websocket_urlpatterns = [
    re_path(r'ws/config/maintenance/(?P<tenant_id>[^/]+)/$', MaintenanceStatusConsumer.as_asgi()),
    re_path(r'ws/config/backup/(?P<backup_job_id>[^/]+)/$', BackupProgressConsumer.as_asgi()),
    re_path(r'ws/config/dr/(?P<execution_id>[^/]+)/$', DRProgressConsumer.as_asgi()),
]