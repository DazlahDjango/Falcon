import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model

User = get_user_model()
logger = logging.getLogger(__name__)


class ConnectionEventConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope.get('user')
        if not self.user or not self.user.is_authenticated:
            await self.close()
            return
        if not self.user.is_superuser and getattr(self.user, 'role', '') != 'super_admin':
            await self.close()
            return
        self.room_group_name = "connection_events"
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def connection_created(self, event):
        await self.send(text_data=json.dumps({
            'type': 'connection_created',
            'connection_id': event['connection_id'],
            'organization_id': str(event['organization_id']),
            'timestamp': event['timestamp']
        }))

    async def connection_closed(self, event):
        await self.send(text_data=json.dumps({
            'type': 'connection_closed',
            'connection_id': event['connection_id'],
            'organization_id': str(event['organization_id']),
            'reason': event.get('reason'),
            'timestamp': event['timestamp']
        }))

    async def connection_error(self, event):
        await self.send(text_data=json.dumps({
            'type': 'connection_error',
            'connection_id': event['connection_id'],
            'organization_id': str(event['organization_id']),
            'error': event['error'],
            'timestamp': event['timestamp']
        }))

    async def pool_health(self, event):
        await self.send(text_data=json.dumps({
            'type': 'pool_health',
            'total': event['total'],
            'active': event['active'],
            'idle': event['idle'],
            'error': event['error'],
            'timestamp': event['timestamp']
        }))