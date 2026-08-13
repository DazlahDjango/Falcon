import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from apps.tenant.models import Organization

User = get_user_model()
logger = logging.getLogger(__name__)


class OrganizationStatusConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope.get('user')
        if not self.user or not self.user.is_authenticated:
            await self.accept()
            await self.close(code=4001, reason='Authentication failed')
            return
        self.org_id = self.scope['url_route']['kwargs'].get('organization_id')
        if not self.org_id:
            await self.accept()
            await self.close(code=4000, reason='Organization ID required')
            return
        if not await self._has_access(self.user, self.org_id):
            await self.accept()
            await self.close(code=4003, reason='Access denied')
            return
        self.room_group_name = f"org_{self.org_id}_status"
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()
        await self._send_initial_status()

    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            action = data.get('action')
            if action == 'ping':
                await self.send(text_data=json.dumps({'type': 'pong', 'timestamp': data.get('timestamp')}))
        except json.JSONDecodeError:
            pass

    async def status_update(self, event):
        await self.send(text_data=json.dumps({
            'type': 'status_update',
            'organization_id': str(event['organization_id']),
            'status': event['status'],
            'is_active': event['is_active'],
            'is_onboarded': event['is_onboarded'],
            'timestamp': event['timestamp']
        }))

    async def provisioning_progress(self, event):
        await self.send(text_data=json.dumps({
            'type': 'provisioning_progress',
            'organization_id': str(event['organization_id']),
            'step': event['step'],
            'progress': event['progress'],
            'message': event['message'],
            'timestamp': event['timestamp']
        }))

    async def _send_initial_status(self):
        org = await self._get_organization(self.org_id)
        if org:
            await self.send(text_data=json.dumps({
                'type': 'initial_status',
                'organization_id': str(org.id),
                'name': org.name,
                'status': org.status,
                'is_active': org.is_active,
                'is_onboarded': org.is_onboarded,
                'onboarded_at': str(org.onboarded_at) if org.onboarded_at else None
            }))

    @database_sync_to_async
    def _get_organization(self, org_id):
        try:
            return Organization.objects.get(id=org_id, is_deleted=False)
        except (Organization.DoesNotExist, Exception):
            return None

    @database_sync_to_async
    def _has_access(self, user, org_id):
        if user.is_superuser or getattr(user, 'role', '') == 'super_admin':
            return True
        user_tenant_id = getattr(user, 'tenant_id', None) or getattr(user, 'organization_id', None)
        if user_tenant_id:
            return str(user_tenant_id) == str(org_id)
        return False