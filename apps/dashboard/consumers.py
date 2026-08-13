import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.core.exceptions import PermissionDenied
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)


class DashboardConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user_id = None
        self.tenant_id = None
        self.dashboard_type = None
        self.room_group_name = None
        user = self.scope.get('user')
        
        if not user or not user.is_authenticated:
            await self.accept()
            await self.close(code=4001, reason='Authentication failed')
            return
        
        self.user_id = str(user.id)
        self.tenant_id = str(getattr(user, 'tenant_id', ''))
        self.dashboard_type = self.scope['url_route']['kwargs'].get('dashboard_type', 'staff')
        
        if not await self._has_dashboard_access(user, self.dashboard_type):
            await self.accept()
            await self.close(code=4003, reason='Access denied')
            return
        
        self.room_group_name = f"dashboard_{self.tenant_id}_{self.user_id}_{self.dashboard_type}"
        
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
        await self.send_initial_data()
    
    async def disconnect(self, close_code):
        if self.room_group_name:
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
    
    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            action = data.get('action')
            
            if action == 'refresh':
                await self.send_initial_data()
            elif action == 'subscribe_kpi':
                await self._subscribe_kpi(data.get('kpi_id'))
            elif action == 'ping':
                await self.send(text_data=json.dumps({
                    'type': 'pong', 
                    'timestamp': timezone.now().isoformat()
                }))
            elif action == 'approval_action':
                await self._handle_approval_action(data)
            elif action == 'submit_kpi':
                await self._handle_kpi_submission(data)
            elif action == 'drill_down':
                await self._handle_drill_down(data)
                
        except Exception as e:
            logger.error(f"WebSocket receive error: {e}")
            await self.send(text_data=json.dumps({
                'type': 'error', 
                'message': str(e)
            }))
    
    async def send_initial_data(self):
        data = await self._get_dashboard_data()
        await self.send(text_data=json.dumps({
            'type': 'initial',
            'data': data,
            'timestamp': timezone.now().isoformat()
        }))
    
    async def dashboard_update(self, event):
        await self.send(text_data=json.dumps({
            'type': 'update',
            'update_type': event.get('update_type'),
            'data': event.get('data'),
            'timestamp': event.get('timestamp')
        }))
    
    async def kpi_update(self, event):
        await self.send(text_data=json.dumps({
            'type': 'kpi_update',
            'kpi_id': event.get('kpi_id'),
            'new_score': event.get('new_score'),
            'new_status': event.get('new_status'),
            'timestamp': event.get('timestamp')
        }))
    
    @database_sync_to_async
    def _has_dashboard_access(self, user, dashboard_type):
        if user.is_superuser or getattr(user, 'role', '') == 'super_admin':
            return True
        role_access_map = {
            'executive': ['executive_admin', 'super_admin', 'client_admin'],
            'client_admin': ['client_admin', 'super_admin'],
            'manager': ['manager', 'client_admin', 'super_admin'],
            'staff': ['staff', 'manager', 'client_admin', 'super_admin'],
            'champion': ['champion', 'client_admin', 'super_admin'],
            'read_only': ['read_only', 'executive_admin', 'client_admin', 'super_admin'],
        }
        allowed_roles = role_access_map.get(dashboard_type, [])
        return user.role in allowed_roles

    @database_sync_to_async
    def _get_dashboard_data(self):
        return {'status': 'active', 'type': self.dashboard_type}


class DashboardNotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        user = self.scope.get('user')
        if not user or not user.is_authenticated:
            await self.accept()
            await self.close(code=4001, reason='Authentication failed')
            return
        self.user_id = str(user.id)
        self.room_group_name = f"dashboard_notifications_{self.user_id}"
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def send_dashboard_notification(self, event):
        await self.send(text_data=json.dumps({
            'type': 'notification',
            'data': event.get('data')
        }))