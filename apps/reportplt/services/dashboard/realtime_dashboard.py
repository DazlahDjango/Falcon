# apps/reportplt/services/dashboard/realtime_dashboard.py
import json
import logging
from typing import Dict, Any, List, Optional
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.utils import timezone
from apps.reportplt.models import ReportDashboard, ReportWidget
from apps.reportplt.services.dashboard.widget_engine import WidgetEngine
from apps.reportplt.services.dashboard.widget_data_fetcher import WidgetDataFetcher

logger = logging.getLogger(__name__)

class RealtimeDashboard:
    def __init__(self):
        self.channel_layer = get_channel_layer()
        self.widget_engine = WidgetEngine()
        self.data_fetcher = WidgetDataFetcher()

    def broadcast_dashboard_update(self, dashboard_id: str, group_name: Optional[str] = None) -> None:
        try:
            dashboard = ReportDashboard.objects.get(id=dashboard_id)
            group = group_name or f"dashboard_{dashboard_id}"
            widgets = dashboard.widgets.filter(is_active=True, is_visible=True)
            widget_data = self.widget_engine.render_widgets(widgets)
            message = {
                'type': 'dashboard_update',
                'dashboard_id': str(dashboard_id),
                'widgets': widget_data,
                'timestamp': timezone.now().isoformat()
            }
            async_to_sync(self.channel_layer.group_send)(group, {
                'type': 'dashboard_message',
                'content': json.dumps(message)
            })
            logger.info(f"Dashboard update broadcasted for {dashboard_id}")
        except Exception as e:
            logger.error(f"Failed to broadcast dashboard update: {str(e)}")

    def broadcast_widget_update(self, widget_id: str, dashboard_id: Optional[str] = None) -> None:
        try:
            widget = ReportWidget.objects.get(id=widget_id)
            group = f"dashboard_{dashboard_id or widget.dashboard_id}"
            rendered = self.widget_engine.render_widget(widget)
            message = {
                'type': 'widget_update',
                'widget_id': str(widget_id),
                'widget': rendered,
                'timestamp': timezone.now().isoformat()
            }
            async_to_sync(self.channel_layer.group_send)(group, {
                'type': 'dashboard_message',
                'content': json.dumps(message)
            })
            logger.info(f"Widget update broadcasted for {widget_id}")
        except Exception as e:
            logger.error(f"Failed to broadcast widget update: {str(e)}")

    def broadcast_multi_widget_update(self, widget_ids: List[str]) -> None:
        for widget_id in widget_ids:
            self.broadcast_widget_update(widget_id)

    def broadcast_all_dashboards_for_user(self, user_id: str) -> None:
        try:
            dashboards = ReportDashboard.objects.filter(
                tenant_id__in=['user_tenant'],
                owner_id=user_id
            )
            for dashboard in dashboards:
                self.broadcast_dashboard_update(str(dashboard.id))
        except Exception as e:
            logger.error(f"Failed to broadcast all dashboards: {str(e)}")

    def get_dashboard_snapshot(self, dashboard_id: str) -> Dict[str, Any]:
        try:
            dashboard = ReportDashboard.objects.get(id=dashboard_id)
            widgets = dashboard.widgets.filter(is_active=True, is_visible=True)
            widget_data = self.widget_engine.render_widgets(widgets)
            return {
                'dashboard_id': str(dashboard_id),
                'name': dashboard.name,
                'widgets': widget_data,
                'snapshot_timestamp': timezone.now().isoformat()
            }
        except Exception as e:
            logger.error(f"Failed to get dashboard snapshot: {str(e)}")
            return {'error': str(e)}

    def subscribe_user_to_dashboard(self, user_id: str, dashboard_id: str) -> Dict[str, Any]:
        group = f"dashboard_{dashboard_id}"
        channel_layer = get_channel_layer()
        try:
            async_to_sync(channel_layer.group_add)(group, f"user_{user_id}")
            logger.info(f"User {user_id} subscribed to {dashboard_id}")
            return {'status': 'subscribed', 'group': group}
        except Exception as e:
            logger.error(f"Failed to subscribe user: {str(e)}")
            return {'status': 'error', 'error': str(e)}

    def unsubscribe_user_from_dashboard(self, user_id: str, dashboard_id: str) -> Dict[str, Any]:
        group = f"dashboard_{dashboard_id}"
        channel_layer = get_channel_layer()
        try:
            async_to_sync(channel_layer.group_discard)(group, f"user_{user_id}")
            logger.info(f"User {user_id} unsubscribed from {dashboard_id}")
            return {'status': 'unsubscribed'}
        except Exception as e:
            logger.error(f"Failed to unsubscribe user: {str(e)}")
            return {'status': 'error', 'error': str(e)}

    def send_realtime_alert(self, dashboard_id: str, alert_type: str, message: str) -> None:
        group = f"dashboard_{dashboard_id}"
        channel_layer = get_channel_layer()
        alert_data = {
            'type': 'dashboard_alert',
            'alert_type': alert_type,
            'message': message,
            'timestamp': timezone.now().isoformat()
        }
        try:
            async_to_sync(channel_layer.group_send)(group, {
                'type': 'dashboard_message',
                'content': json.dumps(alert_data)
            })
            logger.info(f"Alert sent to {dashboard_id}: {alert_type}")
        except Exception as e:
            logger.error(f"Failed to send alert: {str(e)}")

    def get_active_dashboard_groups(self) -> List[str]:
        try:
            from channels.layers import get_channel_layer
            channel_layer = get_channel_layer()
            return list(channel_layer.groups.keys())
        except Exception as e:
            logger.error(f"Failed to get active groups: {str(e)}")
            return []

    def refresh_dashboard_data(self, dashboard_id: str) -> Dict[str, Any]:
        try:
            self.broadcast_dashboard_update(dashboard_id)
            return {
                'status': 'refreshed',
                'dashboard_id': dashboard_id,
                'timestamp': timezone.now().isoformat()
            }
        except Exception as e:
            logger.error(f"Failed to refresh dashboard: {str(e)}")
            return {'status': 'error', 'error': str(e)}

class RealtimeDashboardService:
    def __init__(self):
        self.realtime = RealtimeDashboard()

    def broadcast_update(self, dashboard_id: str) -> None:
        self.realtime.broadcast_dashboard_update(dashboard_id)

    def broadcast_widget(self, widget_id: str) -> None:
        self.realtime.broadcast_widget_update(widget_id)

    def get_snapshot(self, dashboard_id: str) -> Dict:
        return self.realtime.get_dashboard_snapshot(dashboard_id)

    def subscribe(self, user_id: str, dashboard_id: str) -> Dict:
        return self.realtime.subscribe_user_to_dashboard(user_id, dashboard_id)

    def unsubscribe(self, user_id: str, dashboard_id: str) -> Dict:
        return self.realtime.unsubscribe_user_from_dashboard(user_id, dashboard_id)

    def send_alert(self, dashboard_id: str, alert_type: str, message: str) -> None:
        self.realtime.send_realtime_alert(dashboard_id, alert_type, message)