import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from apps.reviews.services.sync import ReviewsResourceSyncService

class ReviewsDashboardConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope['user']
        if not self.user.is_authenticated:
            await self.close()
            return
        # Validate tenant_id exists
        if not self.user.tenant_id:
            await self.close()
            return
        self.tenant_id = str(self.user.tenant_id)
        self.group_name = f'reviews_dashboard_{self.tenant_id}'
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()
        metrics = await self.get_metrics()
        await self.send(text_data=json.dumps({'type': 'initial_metrics', 'data': metrics}))

    async def disconnect(self, close_code):
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        if data.get('type') == 'ping':
            await self.send(text_data=json.dumps({'type': 'pong'}))
        elif data.get('type') == 'refresh':
            metrics = await self.get_metrics()
            await self.send(text_data=json.dumps({'type': 'metrics_updated', 'data': metrics}))

    async def metrics_updated(self, event):
        await self.send(text_data=json.dumps({
            'type': 'metrics_updated',
            'data': event.get('data', {}),
            'timestamp': event.get('timestamp'),
        }))

    async def dependency_sync(self, event):
        await self.send(text_data=json.dumps({
            'type': 'dependency_sync',
            'source': event.get('source'),
            'payload': event.get('payload', {}),
            'timestamp': event.get('timestamp'),
        }))

    @database_sync_to_async
    def get_metrics(self):
        return ReviewsResourceSyncService.build_dashboard_metrics(
            self.user.tenant_id, broadcast=False,
        )
