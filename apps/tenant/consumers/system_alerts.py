import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model

User = get_user_model()
logger = logging.getLogger(__name__)


class SystemAlertConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope.get('user')
        if not self.user or not self.user.is_authenticated:
            await self.close()
            return
        if not self.user.is_superuser and getattr(self.user, 'role', '') != 'super_admin':
            await self.close()
            return
        self.room_group_name = "system_alerts"
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def system_alert(self, event):
        await self.send(text_data=json.dumps({
            'type': 'system_alert',
            'severity': event['severity'],
            'title': event['title'],
            'message': event['message'],
            'timestamp': event['timestamp']
        }))

    async def health_alert(self, event):
        await self.send(text_data=json.dumps({
            'type': 'health_alert',
            'component': event['component'],
            'status': event['status'],
            'message': event['message'],
            'timestamp': event['timestamp']
        }))

    async def scheduled_maintenance(self, event):
        await self.send(text_data=json.dumps({
            'type': 'scheduled_maintenance',
            'start_time': event['start_time'],
            'end_time': event['end_time'],
            'message': event['message'],
            'timestamp': event['timestamp']
        }))