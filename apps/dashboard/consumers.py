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
            await self.close()
            return
        
        self.user_id = str(user.id)
        self.tenant_id = str(getattr(user, 'tenant_id', ''))
        self.dashboard_type = self.scope['url_route']['kwargs'].get('dashboard_type', 'staff')
        
        if not self._has_dashboard_access(user, self.dashboard_type):
            await self.close()
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
    
    async def alert_trigger(self, event):
        await self.send(text_data=json.dumps({
            'type': 'alert',
            'alert_type': event.get('alert_type'),
            'severity': event.get('severity'),
            'message': event.get('message'),
            'timestamp': event.get('timestamp')
        }))
    
    async def _handle_approval_action(self, data):
        """Handle approval/rejection action from manager"""
        submission_id = data.get('submission_id')
        action = data.get('approval_action')
        comments = data.get('comments', '')
        
        if action == 'approve':
            from apps.dashboard.services import ManagerService
            service = ManagerService(self.scope['user'], self.tenant_id)
            result = await database_sync_to_async(service.approve_submission)(submission_id, comments)
        elif action == 'reject':
            from apps.dashboard.services import ManagerService
            service = ManagerService(self.scope['user'], self.tenant_id)
            result = await database_sync_to_async(service.reject_submission)(submission_id, comments)
        
        await self.send(text_data=json.dumps({
            'type': 'approval_result',
            'success': result.get('success'),
            'message': result.get('message'),
            'timestamp': timezone.now().isoformat()
        }))
    
    async def _handle_kpi_submission(self, data):
        """Handle KPI submission from staff"""
        kpi_id = data.get('kpi_id')
        value = data.get('value')
        comments = data.get('comments', '')
        
        from apps.dashboard.services import StaffService
        service = StaffService(self.scope['user'], self.tenant_id)
        result = await database_sync_to_async(service.submit_kpi_actual)(kpi_id, value, comments)
        
        await self.send(text_data=json.dumps({
            'type': 'submission_result',
            'success': result.get('success'),
            'message': result.get('message'),
            'timestamp': timezone.now().isoformat()
        }))
    
    async def _handle_drill_down(self, data):
        """Handle drill-down request"""
        target_user_id = data.get('user_id')
        
        from apps.dashboard.services import ManagerService
        service = ManagerService(self.scope['user'], self.tenant_id)
        data = await database_sync_to_async(service.get_dashboard_data)(
            period='current',
            include_team=True,
            drill_down_user_id=target_user_id
        )
        
        await self.send(text_data=json.dumps({
            'type': 'drill_down_data',
            'data': data,
            'timestamp': timezone.now().isoformat()
        }))
    
    @database_sync_to_async
    def _has_dashboard_access(self, user, dashboard_type):
        from apps.dashboard.constants import DashboardType
        allowed = DashboardType.ROLE_DASHBOARD_MAP.get(user.role, [])
        return dashboard_type in allowed
    
    @database_sync_to_async
    def _get_dashboard_data(self):
        from apps.dashboard.services import ExecutiveDashboardService
        from apps.dashboard.services import ClientAdminDashboardService
        from apps.dashboard.services import SuperAdminDashboardService
        from apps.dashboard.services import ManagerService
        from apps.dashboard.services import StaffService
        from apps.dashboard.services import ChampionService
        from apps.dashboard.services import ReadOnlyService
        
        try:
            # Executive Dashboard
            if self.dashboard_type == 'executive':
                service = ExecutiveDashboardService(self.scope['user'], self.tenant_id)
                return service.get_dashboard_data(self.user_id)
            
            # Client Admin Dashboard
            elif self.dashboard_type == 'client_admin':
                service = ClientAdminDashboardService(self.scope['user'], self.tenant_id)
                return service.get_dashboard_data()
            
            # Super Admin Dashboard
            elif self.dashboard_type == 'super_admin':
                service = SuperAdminDashboardService(self.scope['user'], self.tenant_id)
                return service.get_dashboard_data()
            
            # Manager Dashboard
            elif self.dashboard_type == 'manager':
                service = ManagerService(self.scope['user'], self.tenant_id)
                return service.get_dashboard_data(
                    period='current',
                    include_team=True,
                    drill_down_user_id=None
                )
            
            # Staff Dashboard
            elif self.dashboard_type == 'staff':
                service = StaffService(self.scope['user'], self.tenant_id)
                return service.get_dashboard_data(period='current')
            
            # Champion Dashboard
            elif self.dashboard_type == 'champion':
                service = ChampionService(self.scope['user'], self.tenant_id)
                return service.get_editable_dashboard(
                    target_user_id=None,
                    period='current'
                )
            
            # Read-Only Dashboard
            elif self.dashboard_type == 'read_only':
                service = ReadOnlyService(self.scope['user'], self.tenant_id)
                return service.get_dashboard_data(
                    period='current',
                    view_type='executive'
                )
            
            else:
                return {'error': f'Unknown dashboard type: {self.dashboard_type}'}
                
        except Exception as e:
            logger.error(f"Failed to get dashboard data for {self.dashboard_type}: {e}")
            return {'error': str(e)}
    
    @database_sync_to_async
    def _subscribe_kpi(self, kpi_id):
        pass


class DashboardNotificationConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for real-time notifications."""
    
    async def connect(self):
        user = self.scope.get('user')
        if not user or not user.is_authenticated:
            await self.close()
            return
        
        self.user_id = str(user.id)
        self.tenant_id = str(getattr(user, 'tenant_id', ''))
        self.room_group_name = f"notifications_{self.tenant_id}_{self.user_id}"
        
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
    
    async def disconnect(self, close_code):
        if self.room_group_name:
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
    
    async def send_notification(self, event):
        await self.send(text_data=json.dumps({
            'type': 'notification',
            'notification_id': event.get('notification_id'),
            'title': event.get('title'),
            'message': event.get('message'),
            'severity': event.get('severity'),
            'created_at': event.get('created_at')
        }))