from channels.generic.websocket import AsyncJsonWebsocketConsumer

class LiveReportMetricsConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.tenant_id = self.scope['url_route']['kwargs'].get('tenant_id')
        self.room_group_name = f"report_metrics_{self.tenant_id}"
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def report_metrics_update(self, event):
        await self.send_json(event['data'])
