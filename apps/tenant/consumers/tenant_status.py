# apps/tenant/consumers/tenant_status.py
"""
WebSocket consumer for real-time tenant status updates.
Shows live changes when tenant status changes (activated, suspended, etc.)
"""

import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.utils import timezone
logger = logging.getLogger(__name__)


class TenantStatusConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for tenant status updates.

    Connection URL: ws://domain/ws/tenant/{tenant_id}/status/

    What it sends:
        - Tenant status changes (active, suspended, deleted)
        - Provisioning progress
        - Quota warnings
        - Maintenance mode notifications
    """

    async def connect(self):
        """Called when client initiates WebSocket connection"""

        # Get tenant_id from URL (e.g., /ws/tenant/123/status/)
        self.tenant_id = self.scope['url_route']['kwargs'].get('tenant_id')
        self.room_group_name = f'tenant_{self.tenant_id}_status'

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        # Accept the connection
        await self.accept()

        logger.info(
            f"TenantStatusConsumer connected for tenant {self.tenant_id}")

        # Send current status immediately
        await self.send_current_status()

    async def disconnect(self, close_code):
        """Called when client disconnects"""

        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

        logger.info(
            f"TenantStatusConsumer disconnected for tenant {self.tenant_id}")

    async def receive(self, text_data):
        """
        Called when client sends a message to the server.
        Client can request certain actions like refreshing status.
        """

        try:
            data = json.loads(text_data)
            action = data.get('action')

            if action == 'refresh_status':
                await self.send_current_status()
            elif action == 'ping':
                await self.send(text_data=json.dumps({'pong': True}))

        except json.JSONDecodeError:
            logger.error(f"Invalid JSON received: {text_data}")

    async def send_current_status(self):
        """Fetch and send current tenant status to client"""

        status = await self.get_tenant_status()

        await self.send(text_data=json.dumps({
            'type': 'status_update',
            'data': status,
            'timestamp': str(timezone.now())
        }))

    @database_sync_to_async
    def get_tenant_status(self):
        """Get tenant status from database (runs in thread pool)"""

        from apps.tenant.models import Client

        try:
            tenant = Client.objects.get(id=self.tenant_id, is_deleted=False)

            return {
                'id': str(tenant.id),
                'name': tenant.name,
                'slug': tenant.slug,
                'status': tenant.status,
                'is_active': tenant.is_active,
                'is_verified': tenant.is_verified,
                'subscription_plan': tenant.subscription_plan,
                'subscription_expires_at': tenant.subscription_expires_at.isoformat() if tenant.subscription_expires_at else None,
                'provisioned_at': tenant.provisioned_at.isoformat() if hasattr(tenant, 'provisioned_at') and tenant.provisioned_at else None,
                'current_users': getattr(tenant, 'current_users', 0),
                'max_users': getattr(tenant, 'max_users', 100),
            }
        except Exception as e:
            logger.error(f"Failed to get tenant status: {e}")
            return {'error': str(e)}

    async def tenant_status_changed(self, event):
        """
        Called when tenant status changes (sent from Django signals).
        Sends update to all connected WebSocket clients.
        """

        await self.send(text_data=json.dumps({
            'type': 'tenant_status_changed',
            'data': event['data'],
            'timestamp': event.get('timestamp', str(timezone.now()))
        }))

    async def quota_warning(self, event):
        """Called when tenant quota is near limit"""

        await self.send(text_data=json.dumps({
            'type': 'quota_warning',
            'resource_type': event['resource_type'],
            'current_value': event['current_value'],
            'limit_value': event['limit_value'],
            'percentage': event['percentage'],
            'timestamp': event.get('timestamp', str(timezone.now()))
        }))
