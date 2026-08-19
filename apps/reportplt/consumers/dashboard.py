# apps/reportplt/consumers/dashboard.py
import json
import logging
from typing import Dict, Any
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.utils import timezone
from django.core.exceptions import ObjectDoesNotExist
from apps.reportplt.models import ReportDashboard, ReportWidget
from apps.reportplt.services.dashboard.widget_engine import WidgetEngine
from apps.reportplt.services.dashboard.widget_data_fetcher import WidgetDataFetcher
from apps.accounts.models import User
from apps.tenant.context import set_current_tenant_id

logger = logging.getLogger(__name__)

class DashboardConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.dashboard_id = self.scope['url_route']['kwargs'].get('dashboard_id')
        self.group_name = f"dashboard_{self.dashboard_id}"
        self.user = self.scope.get('user')
        if not self.user or self.user.is_anonymous:
            await self.close(code=4001)
            return
        try:
            dashboard = await self.get_dashboard(self.dashboard_id)
            if not await self.has_access(dashboard):
                await self.close(code=4003)
                return
            await self.channel_layer.group_add(self.group_name, self.channel_name)
            await self.accept()
            await self.send_dashboard_snapshot()
            logger.info(f"Dashboard consumer connected: {self.dashboard_id} - {self.user.email}")
        except Exception as e:
            logger.error(f"Dashboard connection failed: {str(e)}")
            await self.close(code=4000)

    async def disconnect(self, close_code):
        try:
            await self.channel_layer.group_discard(self.group_name, self.channel_name)
            logger.info(f"Dashboard consumer disconnected: {self.dashboard_id}")
        except Exception as e:
            logger.error(f"Dashboard disconnect failed: {str(e)}")

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            action = data.get('action')
            if action == 'refresh':
                await self.send_dashboard_snapshot()
            elif action == 'refresh_widget':
                widget_id = data.get('widget_id')
                if widget_id:
                    await self.send_widget_update(widget_id)
            elif action == 'update_layout':
                layout = data.get('layout')
                if layout:
                    await self.update_dashboard_layout(layout)
            elif action == 'update_widget':
                widget_id = data.get('widget_id')
                config = data.get('config')
                if widget_id and config:
                    await self.update_widget_config(widget_id, config)
            elif action == 'ping':
                await self.send(text_data=json.dumps({'type': 'pong', 'timestamp': timezone.now().isoformat()}))
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({'type': 'error', 'message': 'Invalid JSON'}))
        except Exception as e:
            logger.error(f"Dashboard receive error: {str(e)}")
            await self.send(text_data=json.dumps({'type': 'error', 'message': str(e)}))

    async def dashboard_message(self, event):
        content = event.get('content')
        if isinstance(content, str):
            try:
                content = json.loads(content)
            except:
                pass
        await self.send(text_data=json.dumps(content))

    async def send_dashboard_snapshot(self):
        try:
            snapshot = await self.get_dashboard_snapshot(self.dashboard_id)
            await self.send(text_data=json.dumps({
                'type': 'dashboard_snapshot',
                'data': snapshot,
                'timestamp': timezone.now().isoformat()
            }))
        except Exception as e:
            logger.error(f"Failed to send dashboard snapshot: {str(e)}")
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': f"Failed to load dashboard: {str(e)}"
            }))

    async def send_widget_update(self, widget_id: str):
        try:
            widget_data = await self.get_widget_data(widget_id)
            await self.send(text_data=json.dumps({
                'type': 'widget_update',
                'widget_id': widget_id,
                'data': widget_data,
                'timestamp': timezone.now().isoformat()
            }))
        except Exception as e:
            logger.error(f"Failed to send widget update: {str(e)}")

    @database_sync_to_async
    def get_dashboard(self, dashboard_id: str) -> ReportDashboard:
        try:
            return ReportDashboard.objects.get(id=dashboard_id)
        except Exception:
            return None

    @database_sync_to_async
    def has_access(self, dashboard: ReportDashboard) -> bool:
        if not self.user:
            return False
        if self.user.is_superuser or self.user.role == 'super_admin':
            return True
        if str(dashboard.tenant_id) != str(self.user.tenant_id):
            return False
        if dashboard.owner_id == self.user.id:
            return True
        if dashboard.is_shared:
            if self.user.role in dashboard.allowed_roles:
                return True
            if str(self.user.id) in dashboard.allowed_users:
                return True
            if self.user.department and self.user.department in dashboard.allowed_departments:
                return True
        return False

    @database_sync_to_async
    def get_dashboard_snapshot(self, dashboard_id: str) -> Dict:
        try:
            dashboard = ReportDashboard.objects.get(id=dashboard_id)
            widgets = dashboard.widgets.filter(is_active=True, is_visible=True)
            engine = WidgetEngine()
            fetcher = WidgetDataFetcher()
            widget_data = []
            for widget in widgets:
                data = fetcher.fetch_widget_data(widget)
                rendered = engine.render_widget(widget)
                widget_data.append(rendered)
            return {
                'dashboard_id': str(dashboard.id),
                'name': dashboard.name,
                'dashboard_type': dashboard.dashboard_type,
                'widgets': widget_data,
                'layout': dashboard.layout,
                'theme': dashboard.theme
            }
        except ObjectDoesNotExist:
            return {'error': 'Dashboard not found'}

    @database_sync_to_async
    def get_widget_data(self, widget_id: str) -> Dict:
        try:
            widget = ReportWidget.objects.get(id=widget_id)
            fetcher = WidgetDataFetcher()
            engine = WidgetEngine()
            data = fetcher.fetch_widget_data(widget)
            return engine.render_widget(widget)
        except ObjectDoesNotExist:
            return {'error': 'Widget not found'}

    @database_sync_to_async
    def update_dashboard_layout(self, layout: Dict):
        try:
            dashboard = ReportDashboard.objects.get(id=self.dashboard_id)
            dashboard.layout = layout
            dashboard.save(update_fields=['layout'])
        except ObjectDoesNotExist:
            pass

    @database_sync_to_async
    def update_widget_config(self, widget_id: str, config: Dict):
        try:
            widget = ReportWidget.objects.get(id=widget_id)
            widget.config = config
            widget.save(update_fields=['config'])
        except ObjectDoesNotExist:
            pass