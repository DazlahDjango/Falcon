# apps/tenant/consumers/backup_progress.py
"""
WebSocket consumer for real-time backup progress.
Shows progress when backing up tenant data.
"""

import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.utils import timezone

logger = logging.getLogger(__name__)


class BackupProgressConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for backup progress.

    Connection URL: ws://domain/ws/tenant/backup/{backup_id}/progress/

    What it sends:
        - Backup percentage complete
        - Current operation (dumping schema, compressing, uploading)
        - Estimated time remaining
        - Completion notification
    """

    async def connect(self):
        """Called when client initiates WebSocket connection"""

        self.backup_id = self.scope['url_route']['kwargs'].get('backup_id')
        self.room_group_name = f'backup_{self.backup_id}_progress'

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

        logger.info(
            f"BackupProgressConsumer connected for backup {self.backup_id}")

    async def disconnect(self, close_code):
        """Called when client disconnects"""

        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

        logger.info(
            f"BackupProgressConsumer disconnected for backup {self.backup_id}")

    async def backup_progress(self, event):
        """
        Called when backup progress updates.
        """

        await self.send(text_data=json.dumps({
            'type': 'backup_progress',
            'progress': event['progress'],
            'step': event.get('step', ''),
            'bytes_processed': event.get('bytes_processed', 0),
            'total_bytes': event.get('total_bytes', 0),
            'speed_mbps': event.get('speed_mbps', 0),
            'eta_seconds': event.get('eta_seconds', None),
            'message': event.get('message', ''),
            'timestamp': str(timezone.now())
        }))

    async def backup_complete(self, event):
        """
        Called when backup completes successfully.
        """

        await self.send(text_data=json.dumps({
            'type': 'backup_complete',
            'backup_id': event['backup_id'],
            'file_size_mb': event.get('file_size_mb', 0),
            'duration_seconds': event.get('duration_seconds', 0),
            'message': event.get('message', 'Backup completed successfully!'),
            'timestamp': str(timezone.now())
        }))

    async def backup_failed(self, event):
        """
        Called when backup fails.
        """

        await self.send(text_data=json.dumps({
            'type': 'backup_failed',
            'error': event['error'],
            'message': event.get('message', 'Backup failed. Please try again.'),
            'timestamp': str(timezone.now())
        }))
