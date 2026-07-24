# apps/reportplt/consumers/notification.py
import json
import logging
from typing import Dict, Any, List
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.utils import timezone
from django.core.exceptions import ObjectDoesNotExist
from notifications.models import Notification
from notifications.signals import notify
from apps.accounts.models import User
from apps.reportplt.models import Report, ReportExport

logger = logging.getLogger(__name__)

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope.get('user')
        if not self.user or self.user.is_anonymous:
            await self.close(code=4001)
            return
        self.group_name = f"user_{self.user.id}"
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()
        await self.send_unread_count()
        await self.send_recent_notifications()
        logger.info(f"Notification consumer connected: {self.user.email}")

    async def disconnect(self, close_code):
        try:
            await self.channel_layer.group_discard(self.group_name, self.channel_name)
            logger.info(f"Notification consumer disconnected: {self.user.email}")
        except Exception as e:
            logger.error(f"Notification disconnect failed: {str(e)}")

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            action = data.get('action')
            if action == 'mark_read':
                notification_id = data.get('notification_id')
                if notification_id:
                    await self.mark_notification_read(notification_id)
            elif action == 'mark_all_read':
                await self.mark_all_read()
            elif action == 'get_unread_count':
                await self.send_unread_count()
            elif action == 'get_notifications':
                limit = data.get('limit', 20)
                offset = data.get('offset', 0)
                await self.send_notifications(limit, offset)
            elif action == 'ping':
                await self.send(text_data=json.dumps({'type': 'pong', 'timestamp': timezone.now().isoformat()}))
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({'type': 'error', 'message': 'Invalid JSON'}))
        except Exception as e:
            logger.error(f"Notification receive error: {str(e)}")
            await self.send(text_data=json.dumps({'type': 'error', 'message': str(e)}))

    async def notification_message(self, event):
        content = event.get('content')
        if isinstance(content, str):
            try:
                content = json.loads(content)
            except:
                pass
        await self.send(text_data=json.dumps({
            'type': 'notification',
            'data': content,
            'timestamp': timezone.now().isoformat()
        }))
        await self.send_unread_count()

    async def send_unread_count(self):
        count = await self.get_unread_count()
        await self.send(text_data=json.dumps({
            'type': 'unread_count',
            'count': count,
            'timestamp': timezone.now().isoformat()
        }))

    async def send_recent_notifications(self, limit: int = 10):
        notifications = await self.get_recent_notifications(limit)
        await self.send(text_data=json.dumps({
            'type': 'recent_notifications',
            'data': notifications,
            'timestamp': timezone.now().isoformat()
        }))

    async def send_notifications(self, limit: int = 20, offset: int = 0):
        notifications = await self.get_notifications(limit, offset)
        total = await self.get_notification_count()
        await self.send(text_data=json.dumps({
            'type': 'notifications',
            'data': notifications,
            'total': total,
            'limit': limit,
            'offset': offset,
            'timestamp': timezone.now().isoformat()
        }))

    @database_sync_to_async
    def get_unread_count(self) -> int:
        try:
            user = User.objects.get(id=self.user.id)
            return Notification.objects.unread().filter(recipient=user).count()
        except ObjectDoesNotExist:
            return 0

    @database_sync_to_async
    def get_recent_notifications(self, limit: int) -> List[Dict]:
        try:
            user = User.objects.get(id=self.user.id)
            notifications = Notification.objects.filter(recipient=user).order_by('-timestamp')[:limit]
            return self._serialize_notifications(notifications)
        except ObjectDoesNotExist:
            return []

    @database_sync_to_async
    def get_notifications(self, limit: int, offset: int) -> List[Dict]:
        try:
            user = User.objects.get(id=self.user.id)
            notifications = Notification.objects.filter(recipient=user).order_by('-timestamp')[offset:offset + limit]
            return self._serialize_notifications(notifications)
        except ObjectDoesNotExist:
            return []

    @database_sync_to_async
    def get_notification_count(self) -> int:
        try:
            user = User.objects.get(id=self.user.id)
            return Notification.objects.filter(recipient=user).count()
        except ObjectDoesNotExist:
            return 0

    @database_sync_to_async
    def mark_notification_read(self, notification_id: str):
        try:
            user = User.objects.get(id=self.user.id)
            notification = Notification.objects.get(id=notification_id, recipient=user)
            notification.mark_as_read()
        except ObjectDoesNotExist:
            pass

    @database_sync_to_async
    def mark_all_read(self):
        try:
            user = User.objects.get(id=self.user.id)
            Notification.objects.filter(recipient=user, unread=True).mark_all_as_read()
        except ObjectDoesNotExist:
            pass

    def _serialize_notifications(self, notifications) -> List[Dict]:
        result = []
        for notification in notifications:
            data = {
                'id': str(notification.id),
                'verb': notification.verb,
                'description': notification.description,
                'timestamp': notification.timestamp.isoformat() if notification.timestamp else None,
                'unread': notification.unread,
                'level': notification.level,
                'data': notification.data,
            }
            if notification.actor:
                data['actor'] = {
                    'id': str(notification.actor.id),
                    'name': notification.actor.get_full_name(),
                    'email': notification.actor.email
                }
            if notification.action_object:
                data['action_object'] = str(notification.action_object)
            if notification.target:
                data['target'] = str(notification.target)
            result.append(data)
        return result

class ReportNotificationService:
    def __init__(self):
        self.user = None

    def send_report_notification(self, recipient: User, verb: str, description: str, report: Report, **kwargs):
        notify.send(
            sender=self.user or recipient,
            recipient=recipient,
            verb=verb,
            description=description,
            action_object=report,
            target=report,
            **kwargs
        )

    def send_export_notification(self, recipient: User, export: ReportExport):
        notify.send(
            sender=self.user or recipient,
            recipient=recipient,
            verb='export_ready',
            description=f"Your report '{export.report.name}' export is ready for download.",
            action_object=export,
            target=export.report,
            data={'export_id': str(export.id), 'format': export.format}
        )

    def send_schedule_notification(self, recipient: User, schedule, report: Report):
        notify.send(
            sender=self.user or recipient,
            recipient=recipient,
            verb='schedule_completed',
            description=f"Scheduled report '{report.name}' has been generated.",
            action_object=schedule,
            target=report
        )

    def send_share_notification(self, recipient: User, report: Report, shared_by: User):
        notify.send(
            sender=shared_by,
            recipient=recipient,
            verb='shared',
            description=f"{shared_by.get_full_name()} shared report '{report.name}' with you.",
            action_object=report,
            target=report
        )

    def send_alert_notification(self, recipient: User, message: str, alert_type: str = 'alert', **kwargs):
        notify.send(
            sender=self.user or recipient,
            recipient=recipient,
            verb=alert_type,
            description=message,
            **kwargs
        )

    def send_bulk_notification(self, recipients: List[User], verb: str, description: str, **kwargs):
        for recipient in recipients:
            notify.send(
                sender=self.user or recipient,
                recipient=recipient,
                verb=verb,
                description=description,
                **kwargs
            )

    def get_user_notifications(self, user: User, unread_only: bool = False, limit: int = 20) -> List[Dict]:
        qs = Notification.objects.filter(recipient=user)
        if unread_only:
            qs = qs.filter(unread=True)
        return self._serialize_notifications(qs.order_by('-timestamp')[:limit])

    def mark_all_as_read(self, user: User):
        Notification.objects.filter(recipient=user, unread=True).mark_all_as_read()

    def _serialize_notifications(self, notifications) -> List[Dict]:
        result = []
        for notification in notifications:
            result.append({
                'id': str(notification.id),
                'verb': notification.verb,
                'description': notification.description,
                'timestamp': notification.timestamp.isoformat() if notification.timestamp else None,
                'unread': notification.unread,
                'level': notification.level,
                'data': notification.data
            })
        return result