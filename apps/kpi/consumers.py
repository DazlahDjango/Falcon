import json
import logging
from typing import Dict, List
from django.utils import timezone
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.core.exceptions import PermissionDenied
from .services import IndividualDashboard, ManagerDashboard
logger = logging.getLogger(__name__)

class KPIDashboardConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope.get('user')
        self.tenant_id = self.scope.get('tenant_id')
        if not self.user or not self.user.is_authenticated:
            await self.close()
            return
        self.user_group = f"user_{self.user.id}"
        self.manager_group = None
        self.tenant_group = f"tenant_{self.tenant_id}"
        if await self.is_manager():
            self.manager_group = f"manager_{self.user.id}"
        await self.accept()
        await self.channel_layer.group_add(self.user_group, self.channel_name)
        await self.channel_layer.group_add(self.tenant_group, self.channel_name)
        if self.manager_group:
            await self.channel_layer.group_add(self.manager_group, self.channel_name)
        logger.info(f"WebSocket connected: user {self.user.id}, groups: {self.user_group}, {self.tenant_group}")
        await self.send_initial_data()
    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.user_group, self.channel_name)
        await self.channel_layer.group_discard(self.tenant_group, self.channel_name)
        if self.manager_group:
            await self.channel_layer.group_discard(self.manager_group, self.channel_name)
        logger.info(f"WebSocket disconnected: user {self.user.id}, code: {close_code}")
    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            if message_type == 'ping':
                await self.send(text_data=json.dumps({'type': 'pong'}))
            elif message_type == 'subscribe':
                await self.handle_subscribe(data)
            elif message_type == 'request_update':
                await self.handle_request_update(data)
            else:
                logger.warning(f"Unknown message type: {message_type}")
        except json.JSONDecodeError:
            logger.error(f"Invalid JSON received: {text_data}")
        except Exception as e:
            logger.exception(f"Error handling WebSocket message: {e}")
    async def handle_subscribe(self, data):
        subscription_type = data.get('subscription')
        if subscription_type == 'score_updates':
            self.score_subscribed = True
            await self.send(text_data=json.dumps({
                'type': 'subscribed',
                'subscription': 'score_updates',
                'status': 'success'
            }))
        elif subscription_type == 'team_updates':
            if not self.manager_group:
                await self.send(text_data=json.dumps({
                    'type': 'error',
                    'message': 'Not authorized for team updates'
                }))
                return
            self.team_subscribed = True
            await self.send(text_data=json.dumps({
                'type': 'subscribed',
                'subscription': 'team_updates',
                'status': 'success'
            }))
    async def handle_request_update(self, data):
        update_type = data.get('update_type')
        if update_type == 'dashboard':
            dashboard_data = await self.get_dashboard_data()
            await self.send(text_data=json.dumps({
                'type': 'dashboard_update',
                'data': dashboard_data
            }))
        elif update_type == 'scores':
            scores_data = await self.get_scores_data(data.get('kpi_id'))
            await self.send(text_data=json.dumps({
                'type': 'scores_update',
                'data': scores_data
            }))
    async def send_initial_data(self):
        dashboard_data = await self.get_dashboard_data()
        await self.send(text_data=json.dumps({
            'type': 'initial',
            'data': dashboard_data,
            'user_id': str(self.user.id),
            'tenant_id': str(self.tenant_id)
        }))
    async def score_update(self, event):
        await self.send(text_data=json.dumps({
            'type': 'score_update',
            'data': event.get('data', {})
        }))
    async def team_update(self, event):
        await self.send(text_data=json.dumps({
            'type': 'team_update',
            'data': event.get('data', {})
        }))
    async def validation_update(self, event):
        await self.send(text_data=json.dumps({
            'type': 'validation_update',
            'data': event.get('data', {})
        }))
    async def notification(self, event):
        await self.send(text_data=json.dumps({
            'type': 'notification',
            'data': event.get('data', {})
        }))
    # Database
    @database_sync_to_async
    def is_manager(self) -> bool:
        return self.user.get_direct_reports().exists()
    @database_sync_to_async
    def get_dashboard_data(self) -> Dict:
        now = timezone.now()
        if self.manager_group:
            dashboard = ManagerDashboard()
            return dashboard.get_dashboard(str(self.user.id), now.year, now.month)
        else:
            dashboard = IndividualDashboard()
            return dashboard.get_dashboard(str(self.user.id), now.year, now.month)
    @database_sync_to_async
    def get_scores_data(self, kpi_id: str = None) -> List[Dict]:
        from .models import Score
        now = timezone.now()
        scores = Score.objects.filter(
            user_id=self.user.id,
            year=now.year,
            month=now.month
        )
        if kpi_id:
            scores = scores.filter(kpi_id=kpi_id)
        return [
            {
                'kpi_id': str(s.kpi_id),
                'kpi_name': s.kpi.name,
                'score': float(s.score),
                'status': s.traffic_light.status if hasattr(s, 'traffic_light') else 'UNKNOWN'
            }
            for s in scores
        ]
    
class KPIAdminConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope.get('user')
        if not self.user or not self.user.is_authenticated:
            await self.close()
            return
        if not self.user.is_staff and not self.user.is_superuser:
            logger.warning(f"Non-admin user {self.user.id} attempted admin WebSocket connection")
            await self.close()
            return
        self.admin_group = "kpi_admin"
        await self.accept()
        await self.channel_layer.group_add(self.admin_group, self.channel_name)
        logger.info(f"Admin WebSocket connected: user {self.user.id}")
        await self.start_metrics_stream()
    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.admin_group, self.channel_name)
        logger.info(f"Admin WebSocket disconnected: user {self.user.id}")
    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get('type')
        if message_type == 'get_metrics':
            metrics = await self.get_system_metrics()
            await self.send(text_data=json.dumps({
                'type': 'metrics',
                'data': metrics
            }))
        elif message_type == 'get_calculations':
            calculations = await self.get_active_calculations()
            await self.send(text_data=json.dumps({
                'type': 'calculations',
                'data': calculations
            }))
    async def start_metrics_stream(self):
        import asyncio
        while True:
            try:
                metrics = await self.get_system_metrics()
                await self.send(text_data=json.dumps({
                    'type': 'metrics_update',
                    'data': metrics
                }))
                await asyncio.sleep(10)
            except Exception as e:
                logger.error(f"Error sending metrics: {e}")
                break
    async def calculation_event(self, event):
        await self.send(text_data=json.dumps({
            'type': 'calculation_event',
            'data': event.get('data', {})
        }))
    # Database
    @database_sync_to_async
    def get_system_metrics(self) -> Dict:
        from .models import CalculationLog, Score, MonthlyActual
        now = timezone.now()
        recent_calculations = CalculationLog.objects.filter(
            triggered_at__gte=now - timezone.timedelta(hours=1)
        ).count()
        failed_calculations = CalculationLog.objects.filter(
            triggered_at__gte=now - timezone.timedelta(hours=1),
            status='FAILED'
        ).count()
        pending_validations = MonthlyActual.objects.filter(
            status='PENDING',
            submitted_at__lte=now - timezone.timedelta(hours=48)
        ).count()
        scores_updated = Score.objects.filter(
            calculated_at__gte=now - timezone.timedelta(hours=1)
        ).count()
        return {
            'recent_calculations': recent_calculations,
            'failed_calculations': failed_calculations,
            'pending_validations': pending_validations,
            'scores_updated': scores_updated,
            'timestamp': now.isoformat()
        }
    @database_sync_to_async
    def get_active_calculations(self) -> List[Dict]:
        # This would integrate with Celery to get active tasks
        # Simplified for now
        return []
    
class KPITeamConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.manager_id = self.scope['url_route']['kwargs']['manager_id']
        self.user = self.scope.get('user')
        self.tenant_id = self.scope.get('tenant_id')
        if not await self.is_manager_of_team():
            await self.close()
            return
        self.team_group = f"team_{self.manager_id}"
        await self.accept()
        await self.channel_layer.group_add(self.team_group, self.channel_name)
        logger.info(f"Team WebSocket connected: manager {self.manager_id}")
        await self.send_team_data()
    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.team_group, self.channel_name)
        logger.info(f"Team WebSocket disconnected: manager {self.manager_id}")
    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get('type')
        if message_type == 'refresh':
            await self.send_team_data()
    async def team_update(self, event):
        await self.send(text_data=json.dumps({
            'type': 'team_update',
            'data': event.get('data', {})
        }))
    async def member_score_update(self, event):
        await self.send(text_data=json.dumps({
            'type': 'member_score_update',
            'data': event.get('data', {})
        }))
    async def send_team_data(self):
        team_data = await self.get_team_dashboard_data()
        await self.send(text_data=json.dumps({
            'type': 'initial',
            'data': team_data
        }))
    @database_sync_to_async
    def is_manager_of_team(self):
        from django.contrib.auth import get_user_model
        User = get_user_model()
        try:
            manager = User.objects.get(id=self.manager_id)
            return self.user.is_manager_of(manager)
        except User.DoesNotExist:
            return False
    @database_sync_to_async
    def get_team_dashboard_data(self):
        from .services import ManagerDashboard
        from django.utils import timezone
        now = timezone.now()
        dashboard = ManagerDashboard()
        return dashboard.get_dashboard(self.manager_id, now.year, now.month)

class KPIExecutiveConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.tenant_id = self.scope['url_route']['kwargs']['tenant_id']
        self.user = self.scope.get('user')
        if not await self.is_executive():
            await self.close()
            return
        self.executive_group = f"executive_{self.tenant_id}"
        await self.accept()
        await self.channel_layer.group_add(self.executive_group, self.channel_name)
        logger.info(f"Executive WebSocket connected: tenant {self.tenant_id}")
        await self.send_organization_data()
    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.executive_group, self.channel_name)
        logger.info(f"Executive WebSocket disconnected: tenant {self.tenant_id}")
    async def organization_health_update(self, event):
        await self.send(text_data=json.dumps({
            'type': 'organization_health_update',
            'data': event.get('data', {})
        }))
    async def department_update(self, event):
        await self.send(text_data=json.dumps({
            'type': 'department_update',
            'data': event.get('data', {})
        }))
    async def red_alert_update(self, event):
        await self.send(text_data=json.dumps({
            'type': 'red_alert',
            'data': event.get('data', {})
        }))
    async def send_organization_data(self):
        org_data = await self.get_organization_data()
        await self.send(text_data=json.dumps({
            'type': 'initial',
            'data': org_data
        }))
    @database_sync_to_async
    def is_executive(self):
        return (self.user.is_superuser or 
                self.user.has_role('EXECUTIVE') or 
                self.user.has_role('CEO') or 
                self.user.has_role('DIRECTOR'))
    @database_sync_to_async
    def get_organization_data(self):
        from .services import ExecutiveDashboard
        from django.utils import timezone
        now = timezone.now()
        dashboard = ExecutiveDashboard()
        return dashboard.get_dashboard(self.tenant_id, now.year, now.month)

class KPINotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user_id = self.scope['url_route']['kwargs']['user_id']
        self.user = self.scope.get('user')
        if str(self.user.id) != self.user_id and not self.user.is_superuser:
            await self.close()
            return
        self.user_group = f"notifications_{self.user_id}"
        await self.accept()
        await self.channel_layer.group_add(self.user_group, self.channel_name)
        logger.info(f"Notification WebSocket connected: user {self.user_id}")
        await self.send_pending_notifications()
    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.user_group, self.channel_name)
        logger.info(f"Notification WebSocket disconnected: user {self.user_id}")
    async def notification(self, event):
        await self.send(text_data=json.dumps({
            'type': 'notification',
            'data': event.get('data', {})
        }))
    async def send_pending_notifications(self):
        pending = await self.get_pending_notifications()
        for notif in pending:
            await self.send(text_data=json.dumps({
                'type': 'notification',
                'data': notif
            }))
    @database_sync_to_async
    def get_pending_notifications(self):
        from .models import Notification  # Assuming notification model exists
        return list(Notification.objects.filter(
            user_id=self.user_id,
            is_read=False
        ).values('id', 'title', 'message', 'created_at')[:20])

class KPIScoreConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user_id = self.scope['url_route']['kwargs']['user_id']
        self.user = self.scope.get('user')
        if str(self.user.id) != self.user_id:
            await self.close()
            return
        self.score_group = f"scores_{self.user_id}"
        await self.accept()
        await self.channel_layer.group_add(self.score_group, self.channel_name)
        logger.info(f"Score WebSocket connected: user {self.user_id}")
    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.score_group, self.channel_name)
    async def score_update(self, event):
        await self.send(text_data=json.dumps({
            'type': 'score_update',
            'data': event.get('data', {})
        }))

class KPIValidationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user_id = self.scope['url_route']['kwargs']['user_id']
        self.user = self.scope.get('user')
        if str(self.user.id) != self.user_id:
            await self.close()
            return
        self.validation_group = f"validation_{self.user_id}"
        await self.accept()
        await self.channel_layer.group_add(self.validation_group, self.channel_name)
        logger.info(f"Validation WebSocket connected: user {self.user_id}")
    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.validation_group, self.channel_name)
    async def validation_update(self, event):
        """Handle validation update"""
        await self.send(text_data=json.dumps({
            'type': 'validation_update',
            'data': event.get('data', {})
        }))