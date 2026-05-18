import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async

class BackupProgressConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.backup_job_id = self.scope['url_route']['kwargs'].get('backup_job_id')
        self.user_id = self.scope['user'].id if hasattr(self.scope, 'user') else None
        if not self.backup_job_id or not self.user_id:
            await self.close()
            return
        self.room_group_name = f'backup_progress_{self.backup_job_id}'
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()
        await self.send_current_progress()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def send_current_progress(self):
        progress = await self.get_backup_progress()
        await self.send(text_data=json.dumps({
            'type': 'progress_update',
            'backup_job_id': self.backup_job_id,
            **progress
        }))

    @database_sync_to_async
    def get_backup_progress(self):
        from apps.configs.models import BackupJob, BackupJobDetail
        try:
            job = BackupJob.objects.get(id=self.backup_job_id)
            details = BackupJobDetail.objects.filter(backup_job=job)
            completed = details.filter(status='completed').count()
            total = details.count()
            return {
                'status': job.status,
                'progress_percent': (completed / total * 100) if total > 0 else 0,
                'completed_items': completed,
                'total_items': total,
                'size_bytes': job.size_bytes,
                'started_at': job.started_at.isoformat() if job.started_at else None,
                'duration_seconds': job.duration_seconds
            }
        except Exception:
            return {'status': 'unknown', 'progress_percent': 0, 'completed_items': 0, 'total_items': 0}

    async def backup_progress(self, event):
        await self.send(text_data=json.dumps({
            'type': 'backup_progress',
            'status': event['status'],
            'progress_percent': event['progress_percent'],
            'completed_items': event['completed_items'],
            'total_items': event['total_items'],
            'current_item': event.get('current_item'),
            'timestamp': event['timestamp']
        }))