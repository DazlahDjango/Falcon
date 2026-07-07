import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model

User = get_user_model()
logger = logging.getLogger(__name__)


class MigrationProgressConsumer(AsyncWebsocketConsumer):
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
        self.room_group_name = f"org_{self.org_id}_migrations"
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def migration_started(self, event):
        await self.send(text_data=json.dumps({
            'type': 'migration_started',
            'migration_id': str(event['migration_id']),
            'migration_name': event['migration_name'],
            'app_name': event['app_name'],
            'timestamp': event['timestamp']
        }))

    async def migration_progress(self, event):
        await self.send(text_data=json.dumps({
            'type': 'migration_progress',
            'migration_id': str(event['migration_id']),
            'progress': event['progress'],
            'message': event['message'],
            'timestamp': event['timestamp']
        }))

    async def migration_completed(self, event):
        await self.send(text_data=json.dumps({
            'type': 'migration_completed',
            'migration_id': str(event['migration_id']),
            'migration_name': event['migration_name'],
            'execution_time_ms': event['execution_time_ms'],
            'timestamp': event['timestamp']
        }))

    async def migration_failed(self, event):
        await self.send(text_data=json.dumps({
            'type': 'migration_failed',
            'migration_id': str(event['migration_id']),
            'migration_name': event['migration_name'],
            'error': event['error'],
            'timestamp': event['timestamp']
        }))

    async def migration_rolled_back(self, event):
        await self.send(text_data=json.dumps({
            'type': 'migration_rolled_back',
            'migration_id': str(event['migration_id']),
            'migration_name': event['migration_name'],
            'timestamp': event['timestamp']
        }))

    @database_sync_to_async
    def _has_access(self, user, org_id):
        if user.is_superuser or getattr(user, 'role', '') == 'super_admin':
            return True
        if hasattr(user, 'organization_id') and user.organization_id:
            return str(user.organization_id) == str(org_id)
        return False