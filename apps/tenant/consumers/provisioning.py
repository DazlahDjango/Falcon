import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model

User = get_user_model()
logger = logging.getLogger(__name__)


class ProvisioningConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope.get('user')
        if not self.user or not self.user.is_authenticated:
            await self.close()
            return
        self.org_id = self.scope['url_route']['kwargs'].get('organization_id')
        if not self.org_id:
            await self.close()
            return
        if not await self._has_access(self.user, self.org_id):
            await self.close()
            return
        self.room_group_name = f"org_{self.org_id}_provisioning"
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def provisioning_started(self, event):
        await self.send(text_data=json.dumps({
            'type': 'provisioning_started',
            'organization_id': str(event['organization_id']),
            'timestamp': event['timestamp']
        }))

    async def provisioning_step(self, event):
        await self.send(text_data=json.dumps({
            'type': 'provisioning_step',
            'organization_id': str(event['organization_id']),
            'step': event['step'],
            'step_name': event['step_name'],
            'progress': event['progress'],
            'message': event['message'],
            'timestamp': event['timestamp']
        }))

    async def provisioning_completed(self, event):
        await self.send(text_data=json.dumps({
            'type': 'provisioning_completed',
            'organization_id': str(event['organization_id']),
            'message': event['message'],
            'timestamp': event['timestamp']
        }))

    async def provisioning_failed(self, event):
        await self.send(text_data=json.dumps({
            'type': 'provisioning_failed',
            'organization_id': str(event['organization_id']),
            'error': event['error'],
            'timestamp': event['timestamp']
        }))

    @database_sync_to_async
    def _has_access(self, user, org_id):
        if user.is_superuser or getattr(user, 'role', '') == 'super_admin':
            return True
        if hasattr(user, 'organization_id') and user.organization_id:
            return str(user.organization_id) == str(org_id)
        return False