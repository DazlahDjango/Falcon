# consumers.py
import json
import logging
from typing import Dict, List, Optional
from django.utils import timezone
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .services import ManagerDashboard, IndividualDashboard, ExecutiveDashboard

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

        logger.info(f"WebSocket connected: user {self.user.id}")
        await self.send_initial_data()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.user_group, self.channel_name)
        await self.channel_layer.group_discard(self.tenant_group, self.channel_name)

        if self.manager_group:
            await self.channel_layer.group_discard(self.manager_group, self.channel_name)

        logger.info(f"WebSocket disconnected: user {self.user.id}")

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

    @database_sync_to_async
    def is_manager(self) -> bool:
        try:
            return self.user.get_direct_reports().exists()
        except Exception:
            return False

    @database_sync_to_async
    def get_dashboard_data(self) -> Dict:
        now = timezone.now()
        try:
            if self.manager_group:
                from .services import ManagerDashboard
                dashboard = ManagerDashboard()
                return dashboard.get_dashboard(str(self.user.id), now.year, now.month)
            else:
                from .services import IndividualDashboard
                dashboard = IndividualDashboard()
                return dashboard.get_dashboard(str(self.user.id), now.year, now.month)
        except Exception as e:
            logger.error(f"Failed to get dashboard data: {e}")
            return {'error': str(e), 'overall_score': 0, 'kpis': []}

    @database_sync_to_async
    def get_scores_data(self, kpi_id: Optional[str] = None) -> List[Dict]:
        from .models import Score, TrafficLight
        now = timezone.now()
        scores = Score.objects.filter(
            user_id=self.user.id,
            year=now.year,
            month=now.month
        ).select_related('kpi')

        if kpi_id:
            scores = scores.filter(kpi_id=kpi_id)

        result = []
        for score in scores:
            traffic_light = TrafficLight.objects.filter(score=score).first()
            result.append({
                'kpi_id': str(score.kpi_id),
                'kpi_name': score.kpi.name,
                'score': float(score.score),
                'status': traffic_light.status if traffic_light else 'UNKNOWN'
            })
        return result


class KPIAdminConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        import asyncio
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
        self.stream_task = asyncio.create_task(self.start_metrics_stream())

    async def disconnect(self, close_code):
        if hasattr(self, 'stream_task'):
            self.stream_task.cancel()
        await self.channel_layer.group_discard(self.admin_group, self.channel_name)
        logger.info(f"Admin WebSocket disconnected: user {self.user.id}")

    async def receive(self, text_data):
        try:
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
        except json.JSONDecodeError:
            logger.error(f"Invalid JSON received: {text_data}")
        except Exception as e:
            logger.exception(f"Error handling admin message: {e}")

    async def start_metrics_stream(self):
        import asyncio
        try:
            while True:
                metrics = await self.get_system_metrics()
                await self.send(text_data=json.dumps({
                    'type': 'metrics_update',
                    'data': metrics
                }))
                await asyncio.sleep(10)
        except asyncio.CancelledError:
            logger.info("Admin metrics stream task cancelled")
        except Exception as e:
            logger.error(f"Error sending metrics: {e}")

    async def calculation_event(self, event):
        await self.send(text_data=json.dumps({
            'type': 'calculation_event',
            'data': event.get('data', {})
        }))

    @database_sync_to_async
    def get_system_metrics(self) -> Dict:
        from .models import CalculationLog, Score, MonthlyActual
        now = timezone.now()
        one_hour_ago = now - timezone.timedelta(hours=1)
        two_days_ago = now - timezone.timedelta(hours=48)

        recent_calculations = CalculationLog.objects.filter(
            triggered_at__gte=one_hour_ago
        ).count()

        failed_calculations = CalculationLog.objects.filter(
            triggered_at__gte=one_hour_ago,
            status='FAILED'
        ).count()

        pending_validations = MonthlyActual.objects.filter(
            status='PENDING',
            submitted_at__lte=two_days_ago
        ).count()

        scores_updated = Score.objects.filter(
            calculated_at__gte=one_hour_ago
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
        return []


class KPITeamConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope.get('user')
        if not self.user or not self.user.is_authenticated:
            await self.close()
            return

        self.manager_id = self.scope['url_route']['kwargs']['manager_id']
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
        try:
            data = json.loads(text_data)
            if data.get('type') == 'refresh':
                await self.send_team_data()
        except json.JSONDecodeError:
            logger.error(f"Invalid JSON received: {text_data}")

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
            return manager.get_direct_reports().filter(id=self.user.id).exists()
        except User.DoesNotExist:
            return False

    @database_sync_to_async
    def get_team_dashboard_data(self):
        from .services import ManagerDashboard
        now = timezone.now()
        dashboard = ManagerDashboard()
        return dashboard.get_dashboard(self.manager_id, now.year, now.month)


class KPIExecutiveConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope.get('user')
        if not self.user or not self.user.is_authenticated:
            await self.close()
            return

        self.tenant_id = self.scope['url_route']['kwargs']['tenant_id']

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
        role = getattr(self.user, 'role', '')
        return (self.user.is_superuser or
                role == 'EXECUTIVE' or
                role == 'CEO' or
                role == 'DIRECTOR')

    @database_sync_to_async
    def get_organization_data(self):
        from .services import ExecutiveDashboard
        now = timezone.now()
        dashboard = ExecutiveDashboard()
        return dashboard.get_dashboard(self.tenant_id, now.year, now.month)


class KPINotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope.get('user')
        if not self.user or not self.user.is_authenticated:
            await self.close()
            return

        self.user_id = self.scope['url_route']['kwargs']['user_id']

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
        from .models.notification import NotificationPreference
        return list(NotificationPreference.objects.filter(
            user_id=self.user_id,
            is_read=False
        ).values('id', 'title', 'message', 'created_at')[:20])


class KPIScoreConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope.get('user')
        if not self.user or not self.user.is_authenticated:
            await self.close()
            return

        self.user_id = self.scope['url_route']['kwargs']['user_id']

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
        self.user = self.scope.get('user')
        if not self.user or not self.user.is_authenticated:
            await self.close()
            return

        self.user_id = self.scope['url_route']['kwargs']['user_id']

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
        await self.send(text_data=json.dumps({
            'type': 'validation_update',
            'data': event.get('data', {})
        }))


class KPIReportConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope.get('user')
        if not self.user or not self.user.is_authenticated:
            await self.close()
            return

        self.report_id = self.scope['url_route']['kwargs']['report_id']

        if not await self.can_access_report():
            await self.close()
            return

        self.report_group = f"report_{self.report_id}"
        await self.accept()
        await self.channel_layer.group_add(self.report_group, self.channel_name)

        logger.info(f"Report WebSocket connected: report {self.report_id}")
        await self.send_report_status()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.report_group, self.channel_name)
        logger.info(f"Report WebSocket disconnected: report {self.report_id}")

    async def report_update(self, event):
        await self.send(text_data=json.dumps({
            'type': 'report_update',
            'data': event.get('data', {})
        }))

    async def report_complete(self, event):
        await self.send(text_data=json.dumps({
            'type': 'report_complete',
            'data': event.get('data', {})
        }))

    async def send_report_status(self):
        from .models import ReportTask

        try:
            report = await database_sync_to_async(ReportTask.objects.get)(id=self.report_id)
            await self.send(text_data=json.dumps({
                'type': 'initial',
                'data': {
                    'status': report.status,
                    'progress': report.progress,
                    'result_url': report.result_url if report.status == 'COMPLETED' else None
                }
            }))
        except ReportTask.DoesNotExist:
            pass

    @database_sync_to_async
    def can_access_report(self):
        from .models import ReportTask
        try:
            report = ReportTask.objects.get(id=self.report_id)
            return (self.user.is_superuser or
                    report.user_id == self.user.id or
                    str(report.tenant_id) == str(self.user.tenant_id))
        except ReportTask.DoesNotExist:
            return False


class KPIAnalyticsConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        import asyncio
        self.user = self.scope.get('user')
        if not self.user or not self.user.is_authenticated:
            await self.close()
            return

        self.tenant_id = self.scope['url_route']['kwargs']['tenant_id']

        if not await self.has_executive_access():
            await self.close()
            return

        self.analytics_group = f"analytics_{self.tenant_id}"
        await self.accept()
        await self.channel_layer.group_add(self.analytics_group, self.channel_name)

        logger.info(f"Analytics WebSocket connected: tenant {self.tenant_id}")
        self.stream_task = asyncio.create_task(self.start_analytics_stream())

    async def disconnect(self, close_code):
        if hasattr(self, 'stream_task'):
            self.stream_task.cancel()
        await self.channel_layer.group_discard(self.analytics_group, self.channel_name)
        logger.info(f"Analytics WebSocket disconnected: tenant {self.tenant_id}")

    async def analytics_update(self, event):
        await self.send(text_data=json.dumps({
            'type': 'analytics_update',
            'data': event.get('data', {})
        }))

    async def kpi_update(self, event):
        await self.send(text_data=json.dumps({
            'type': 'kpi_update',
            'data': event.get('data', {})
        }))

    async def score_update(self, event):
        await self.send(text_data=json.dumps({
            'type': 'score_update',
            'data': event.get('data', {})
        }))

    async def start_analytics_stream(self):
        import asyncio
        try:
            while True:
                analytics_data = await self.get_analytics_data()
                await self.send(text_data=json.dumps({
                    'type': 'analytics_data',
                    'data': analytics_data
                }))
                await asyncio.sleep(30)
        except asyncio.CancelledError:
            logger.info("Analytics stream task cancelled")
        except Exception as e:
            logger.error(f"Error streaming analytics: {e}")

    @database_sync_to_async
    def has_executive_access(self):
        role = getattr(self.user, 'role', '')
        return (self.user.is_superuser or
                role == 'EXECUTIVE' or
                role == 'CEO' or
                role == 'DIRECTOR')

    @database_sync_to_async
    def get_analytics_data(self):
        from .models import AggregatedScore, OrganizationHealth
        now = timezone.now()
        year = now.year
        month = now.month

        org_health = OrganizationHealth.objects.filter(
            tenant_id=self.tenant_id,
            year=year,
            month=month
        ).first()

        dept_scores = AggregatedScore.objects.filter(
            level='DEPARTMENT',
            tenant_id=self.tenant_id,
            year=year,
            month=month
        ).values('entity_name', 'aggregated_score')[:10]

        return {
            'overall_health': float(org_health.overall_health_score) if org_health else 0,
            'red_kpi_count': org_health.red_kpi_count if org_health else 0,
            'top_departments': list(dept_scores),
            'timestamp': now.isoformat()
        }


class KPIAlertsConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope.get('user')
        if not self.user or not self.user.is_authenticated:
            await self.close()
            return

        self.tenant_id = self.scope['url_route']['kwargs']['tenant_id']

        if not await self.has_alert_access():
            await self.close()
            return

        self.alerts_group = f"alerts_{self.tenant_id}"
        await self.accept()
        await self.channel_layer.group_add(self.alerts_group, self.channel_name)

        logger.info(f"Alerts WebSocket connected: tenant {self.tenant_id}")
        await self.send_alerts()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.alerts_group, self.channel_name)
        logger.info(f"Alerts WebSocket disconnected: tenant {self.tenant_id}")

    async def alert(self, event):
        await self.send(text_data=json.dumps({
            'type': 'alert',
            'data': event.get('data', {})
        }))

    async def red_alert(self, event):
        await self.send(text_data=json.dumps({
            'type': 'red_alert',
            'data': event.get('data', {})
        }))

    async def send_alerts(self):
        alerts = await self.get_alerts()
        await self.send(text_data=json.dumps({
            'type': 'initial',
            'data': alerts
        }))

    @database_sync_to_async
    def has_alert_access(self):
        role = getattr(self.user, 'role', '')
        return (self.user.is_superuser or
                role == 'MANAGER' or
                role == 'EXECUTIVE' or
                role == 'DASHBOARD_CHAMPION')

    @database_sync_to_async
    def get_alerts(self):
        from .models import TrafficLight, Escalation
        now = timezone.now()

        red_alerts = TrafficLight.objects.filter(
            score__tenant_id=self.tenant_id,
            status='RED',
            consecutive_red_count__gte=2
        ).select_related('score__kpi', 'score__user')[:10]

        pending_escalations = Escalation.objects.filter(
            tenant_id=self.tenant_id,
            status='PENDING'
        ).select_related('actual__kpi', 'escalated_to')[:10]

        return {
            'red_alerts': [
                {
                    'kpi': alert.score.kpi.name,
                    'user': alert.score.user.email,
                    'consecutive_months': alert.consecutive_red_count,
                    'score': float(alert.score_value)
                }
                for alert in red_alerts
            ],
            'pending_escalations': [
                {
                    'id': str(e.id),
                    'kpi': e.actual.kpi.name,
                    'reason': e.reason,
                    'escalated_to': e.escalated_to.email
                }
                for e in pending_escalations
            ],
            'timestamp': now.isoformat()
        }