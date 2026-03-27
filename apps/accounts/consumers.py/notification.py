import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.core.cache import cache
from ..services import JWTServices, SessionService
from ..models import UserSession, AuditLog
User = get_user_model()
logger = logging.getLogger(__name__)
jwt_service = JWTServices()
session_service = SessionService()

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        token = self.scope['query_string'].decode()
        if token.startswith('token='):
            token = token.split('=')[1]
        user = await self.authenticate_token(token)
        if user:
            self.user = user
            self.user_id = str(user.id)
            await self.accept()
            await self.channel_layer.group_add(
                f"notifications_{self.user_id}",
                self.channel_name
            )
            unread_count = await self.get_unread_count()
            await self.send(text_data=json.dumps({
                'type': 'connected',
                'unread_count': unread_count
            }))
            logger.info(f"Notification websocket connected: user: {self.user_id}")
        else:
            await self.close(code=4001, reason='Authentication failed')

    async def disconnect(self, close_code):
        if hasattr(self, 'user_id'):
            await self.channel_layer.group_discard(
                f'notifications_{self.user_id}',
                self.channel_name
            )
            logger.info(f"Notification websocket disconnected: user: {self.user_id}")

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            if message_type == 'mark_read':
                await self.mark_notification_read(data.get('notification_id'))
            elif message_type == 'mark_all_read':
                await self.mark_all_read()
            elif message_type == 'ping':
                await self.send(text_data=json.dumps({'type': 'pong'}))
        except Exception as e:
            logger.error(f"Notification websocket recieve error: {str(e)}")
    
    async def send_notification(self, event):
        await self.send(text_data=json.dumps({
            'type': 'notification',
            'id': event.get('notification_id'),
            'title': event.get('title'),
            'message': event.get('message'),
            'level': event.get('level', 'info'),
            'created_at': event.get('created_at'),
            'data': event.get('data', {})
        }))

    async def notification_count(self, event):
        await self.send(text_data=json.dumps({
            'type': 'count',
            'unread_count': event.get('count', 0)
        }))
    
    @database_sync_to_async
    def authenticate_token(self, token):
        if not token:
            return None
        payload = jwt_service.verify_token(token)
        if not payload:
            return None
        user_id = payload.get('user_id')
        try:
            return User.objects.get(id=user_id, is_active=True, is_deleted=False)
        except User.DoesNotExist:
            return None
        
    @database_sync_to_async
    def get_unread_count(self):
        """Get unread notification count."""
        from notifications.models import Notification
        return Notification.objects.filter(
            recipient=self.user,
            unread=True
        ).count()
    
    async def mark_notification_read(self, notification_id):
        if not notification_id:
            return
        from notifications.models import Notification
        try:
            notification = await database_sync_to_async(
                lambda: Notification.objects.get(
                    id=notification_id,
                    recipient=self.user
                )
            )()
            await database_sync_to_async(notification.mark_as_read)()
            new_count = await database_sync_to_async(
                lambda: Notification.objects.filter(
                    recipient=self.user,
                    unreat=True
                ).count()
            )()
            from channels.layers import get_channel_layer
            channel_layer = get_channel_layer()
            await channel_layer.group_send(
                f'notifications_{self.user_id}',
                {
                    'type': 'notification_count',
                    'count': new_count
                }
            )
        except Exception as e:
            logger.error(f"Failed to mark notification read: {str(e)}")

    async def mark_all_read(self):
        from notifications.models import Notification
        updated = await database_sync_to_async(
            lambda: Notification.objects.filter(
                recepient=self.user,
                unread=True
            ).update(unread=False)
        )()
        # Send updated count
        await self.send(text_data=json.dumps({
            'type': 'count',
            'unread_count': 0,
            'marked_count': updated
        }))
