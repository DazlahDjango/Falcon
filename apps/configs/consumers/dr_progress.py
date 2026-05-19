import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async

class DRProgressConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.execution_id = self.scope['url_route']['kwargs'].get('execution_id')
        self.user_id = self.scope['user'].id if hasattr(self.scope, 'user') else None
        if not self.execution_id or not self.user_id:
            await self.close()
            return
        self.room_group_name = f'dr_progress_{self.execution_id}'
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()
        await self.send_current_progress()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def send_current_progress(self):
        progress = await self.get_dr_progress()
        await self.send(text_data=json.dumps({
            'type': 'dr_progress_update',
            'execution_id': self.execution_id,
            **progress
        }))

    @database_sync_to_async
    def get_dr_progress(self):
        from apps.configs.models import DisasterRecoveryExecution
        try:
            execution = DisasterRecoveryExecution.objects.select_related('dr_plan__app').get(id=self.execution_id)
            steps = execution.steps_executed or []
            completed_steps = len([s for s in steps if s.get('status') == 'success'])
            total_steps = len(steps) if steps else 1
            return {
                'status': execution.status,
                'progress_percent': (completed_steps / total_steps * 100) if total_steps > 0 else 0,
                'completed_steps': completed_steps,
                'total_steps': total_steps,
                'steps': steps[-5:],
                'rto_achieved_minutes': execution.rto_achieved_minutes,
                'rpo_achieved_minutes': execution.rpo_achieved_minutes,
                'started_at': execution.started_at.isoformat() if execution.started_at else None,
            }
        except Exception:
            return {'status': 'unknown', 'progress_percent': 0, 'completed_steps': 0, 'total_steps': 0}

    async def dr_progress(self, event):
        await self.send(text_data=json.dumps({
            'type': 'dr_progress',
            'status': event['status'],
            'progress_percent': event['progress_percent'],
            'completed_steps': event['completed_steps'],
            'total_steps': event['total_steps'],
            'current_step': event.get('current_step'),
            'timestamp': event['timestamp']
        }))