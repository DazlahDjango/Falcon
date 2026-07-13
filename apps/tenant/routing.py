from django.urls import re_path
from .consumers import (
    OrganizationStatusConsumer,
    ProvisioningConsumer,
    DomainVerificationConsumer,
    QuotaWarningConsumer,
    ConnectionEventConsumer,
    MigrationProgressConsumer,
    SystemAlertConsumer,
)

websocket_urlpatterns = [
    re_path(r'ws/organizations/(?P<organization_id>[^/]+)/status/$', OrganizationStatusConsumer.as_asgi()),
    re_path(r'ws/organizations/(?P<organization_id>[^/]+)/provisioning/$', ProvisioningConsumer.as_asgi()),
    re_path(r'ws/organizations/(?P<organization_id>[^/]+)/domain-verification/$', DomainVerificationConsumer.as_asgi()),
    re_path(r'ws/organizations/(?P<organization_id>[^/]+)/quota/$', QuotaWarningConsumer.as_asgi()),
    re_path(r'ws/organizations/(?P<organization_id>[^/]+)/migrations/$', MigrationProgressConsumer.as_asgi()),
    re_path(r'ws/connections/$', ConnectionEventConsumer.as_asgi()),
    re_path(r'ws/system/alerts/$', SystemAlertConsumer.as_asgi()),
]