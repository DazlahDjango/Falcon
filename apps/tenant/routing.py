# apps/tenant/routing.py
"""
WebSocket URL routing for Tenant app.

This file maps WebSocket connections to their respective consumers.
Only needed if you're using real-time features like:
- Live tenant status updates
- Provisioning progress
- Backup progress
"""

from django.urls import re_path
from .consumers import (
    TenantStatusConsumer,
    ProvisioningConsumer,
    BackupProgressConsumer,
)

websocket_urlpatterns = [
    # Real-time tenant status updates
    # Connection URL: ws://domain/ws/tenant/{tenant_id}/status/
    re_path(
        r'^ws/tenant/(?P<tenant_id>[^/]+)/status/$',
        TenantStatusConsumer.as_asgi(),
        name='tenant-status'
    ),

    # Provisioning progress for new tenants
    # Connection URL: ws://domain/ws/tenant/provisioning/{task_id}/
    re_path(
        r'^ws/tenant/provisioning/(?P<task_id>[^/]+)/$',
        ProvisioningConsumer.as_asgi(),
        name='tenant-provisioning'
    ),

    # Backup progress for tenant backups
    # Connection URL: ws://domain/ws/tenant/backup/{backup_id}/progress/
    re_path(
        r'^ws/tenant/backup/(?P<backup_id>[^/]+)/progress/$',
        BackupProgressConsumer.as_asgi(),
        name='tenant-backup-progress'
    ),
]
