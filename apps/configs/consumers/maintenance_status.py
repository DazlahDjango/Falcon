import json
from django.utils import timezone
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from apps.configs.services.maintenance.maintenance_mode import MaintenanceMode

class MaintenanceStatusConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.tenant_id = self.scope['url_route']['kwargs'].get('tenant_id', 'system')
        self.room_group_name = f'maintenance_{self.tenant_id}'
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()
        await self.send_current_status()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def send_current_status(self):
        mode = MaintenanceMode()
        await self.send(text_data=json.dumps({
            'type': 'status_update',
            'maintenance_active': mode.is_active(),
            'maintenance_type': mode.get_type(),
            'message': mode.get_message(),
            'affected_apps': mode.get_affected_apps(),
            'timestamp': timezone.now().isoformat()
        }))

    async def maintenance_update(self, event):
        await self.send(text_data=json.dumps({
            'type': 'maintenance_update',
            'maintenance_active': event['maintenance_active'],
            'maintenance_type': event['maintenance_type'],
            'message': event['message'],
            'affected_apps': event['affected_apps'],
            'started_at': event.get('started_at'),
            'expected_end': event.get('expected_end'),
            'timestamp': event['timestamp']
        }))