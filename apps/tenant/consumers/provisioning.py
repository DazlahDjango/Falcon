# apps/tenant/consumers/provisioning.py
"""
WebSocket consumer for real-time provisioning progress.
Shows step-by-step progress when creating a new tenant.
"""

import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.utils import timezone
logger = logging.getLogger(__name__)


class ProvisioningConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for tenant provisioning progress.

    Connection URL: ws://domain/ws/tenant/provisioning/{task_id}/

    What it sends:
        - Step-by-step progress (25%, 50%, 75%, 100%)
        - Current step name (creating schema, running migrations, etc.)
        - Error messages if provisioning fails
        - Completion notification
    """

    async def connect(self):
        """Called when client initiates WebSocket connection"""

        self.task_id = self.scope['url_route']['kwargs'].get('task_id')
        self.room_group_name = f'provisioning_{self.task_id}'

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

        logger.info(f"ProvisioningConsumer connected for task {self.task_id}")

    async def disconnect(self, close_code):
        """Called when client disconnects"""

        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

        logger.info(
            f"ProvisioningConsumer disconnected for task {self.task_id}")

    async def receive(self, text_data):
        """Called when client sends a message"""

        try:
            data = json.loads(text_data)
            action = data.get('action')

            if action == 'get_status':
                await self.send_progress({'progress': 0, 'step': 'Checking status...'})

        except json.JSONDecodeError:
            logger.error(f"Invalid JSON received: {text_data}")

    async def send_progress(self, progress_data):
        """Send progress update to client"""

        await self.send(text_data=json.dumps({
            'type': 'progress_update',
            'data': progress_data,
            'timestamp': str(timezone.now())
        }))

    async def provisioning_progress(self, event):
        """
        Called when provisioning progress updates (from Celery task).
        Sends progress to connected client.
        """

        await self.send(text_data=json.dumps({
            'type': 'provisioning_progress',
            'progress': event['progress'],
            'step': event['step'],
            'step_number': event.get('step_number', 0),
            'total_steps': event.get('total_steps', 4),
            'message': event.get('message', ''),
            'timestamp': event.get('timestamp', str(timezone.now()))
        }))

    async def provisioning_complete(self, event):
        """
        Called when provisioning completes successfully.
        """

        await self.send(text_data=json.dumps({
            'type': 'provisioning_complete',
            'tenant_id': event['tenant_id'],
            'tenant_name': event.get('tenant_name', ''),
            'message': event.get('message', 'Provisioning completed successfully!'),
            'timestamp': event.get('timestamp', str(timezone.now()))
        }))

    async def provisioning_failed(self, event):
        """
        Called when provisioning fails.
        """

        await self.send(text_data=json.dumps({
            'type': 'provisioning_failed',
            'error': event['error'],
            'step': event.get('step', ''),
            'message': event.get('message', 'Provisioning failed. Please check logs.'),
            'timestamp': event.get('timestamp', str(timezone.now()))
        }))
