import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model

User = get_user_model()
logger = logging.getLogger(__name__)


class DomainVerificationConsumer(AsyncWebsocketConsumer):
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
        self.room_group_name = f"org_{self.org_id}_domain_verification"
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def verification_started(self, event):
        await self.send(text_data=json.dumps({
            'type': 'verification_started',
            'domain_id': str(event['domain_id']),
            'domain': event['domain'],
            'timestamp': event['timestamp']
        }))

    async def dns_check(self, event):
        await self.send(text_data=json.dumps({
            'type': 'dns_check',
            'domain': event['domain'],
            'status': event['status'],
            'message': event['message'],
            'timestamp': event['timestamp']
        }))

    async def ssl_issuance(self, event):
        await self.send(text_data=json.dumps({
            'type': 'ssl_issuance',
            'domain': event['domain'],
            'status': event['status'],
            'message': event['message'],
            'timestamp': event['timestamp']
        }))

    async def verification_completed(self, event):
        await self.send(text_data=json.dumps({
            'type': 'verification_completed',
            'domain_id': str(event['domain_id']),
            'domain': event['domain'],
            'status': event['status'],
            'timestamp': event['timestamp']
        }))

    async def verification_failed(self, event):
        await self.send(text_data=json.dumps({
            'type': 'verification_failed',
            'domain_id': str(event['domain_id']),
            'domain': event['domain'],
            'error': event['error'],
            'timestamp': event['timestamp']
        }))

    @database_sync_to_async
    def _has_access(self, user, org_id):
        if user.is_superuser or getattr(user, 'role', '') == 'super_admin':
            return True
        user_tenant_id = getattr(user, 'tenant_id', None) or getattr(user, 'organization_id', None)
        if user_tenant_id:
            return str(user_tenant_id) == str(org_id)
        return False