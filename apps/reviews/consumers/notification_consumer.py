# apps/reviews/consumers/notification_consumer.py
"""
WebSocket consumer for real-time notifications
Sends instant notifications to users when events occur
"""

import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async


class NotificationConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for real-time user notifications.
    
    Groups:
    - notifications_{user_id} - Personal notification channel for each user
    """
    
    async def connect(self):
        """Handle new WebSocket connection for notifications"""
        self.user = self.scope['user']
        
        # Only allow authenticated users
        if not self.user.is_authenticated:
            await self.close()
            return
        
        # Create personal notification group for this user
        self.room_group_name = f'notifications_{self.user.id}'
        
        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
        
        # Send unread notification count on connection
        await self.send_unread_count()
    
    async def disconnect(self, close_code):
        """Handle WebSocket disconnection"""
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
    
    async def receive(self, text_data):
        """Handle incoming WebSocket messages"""
        data = json.loads(text_data)
        message_type = data.get('type')
        
        if message_type == 'ping':
            await self.send(text_data=json.dumps({'type': 'pong'}))
        
        elif message_type == 'mark_read':
            notification_id = data.get('notification_id')
            if notification_id:
                await self.mark_notification_read(notification_id)
                await self.send_unread_count()
        
        elif message_type == 'mark_all_read':
            await self.mark_all_notifications_read()
            await self.send_unread_count()
        
        elif message_type == 'get_unread_count':
            await self.send_unread_count()
        
        elif message_type == 'get_notifications':
            limit = data.get('limit', 20)
            await self.send_notifications(limit)
    
    async def send_notification(self, event):
        """
        Send a notification to the user's WebSocket.
        Triggered by signals when various events occur.
        """
        await self.send(text_data=json.dumps({
            'type': 'notification',
            'id': event.get('notification_id'),
            'title': event.get('title'),
            'message': event.get('message'),
            'notification_type': event.get('notification_type'),
            'link': event.get('link'),
            'created_at': event.get('created_at'),
            'is_read': event.get('is_read', False)
        }))
        
        # Also send updated unread count
        await self.send_unread_count()
    
    async def send_unread_count(self):
        """Send the user's unread notification count"""
        count = await self.get_unread_count()
        await self.send(text_data=json.dumps({
            'type': 'unread_count',
            'count': count
        }))
    
    async def send_notifications(self, limit=20):
        """Send recent notifications to the user"""
        notifications = await self.get_recent_notifications(limit)
        await self.send(text_data=json.dumps({
            'type': 'notifications_list',
            'notifications': notifications,
            'total': len(notifications)
        }))
    
    @database_sync_to_async
    def get_unread_count(self):
        """Get unread notification count for the user"""
        try:
            from notifications.models import Notification
            return Notification.objects.filter(
                recipient=self.user,
                unread=True
            ).count()
        except Exception:
            # Notifications table or model not available
            return 0
    
    @database_sync_to_async
    def get_recent_notifications(self, limit=20):
        """Get recent notifications for the user"""
        try:
            from notifications.models import Notification
            field_names = {field.name for field in Notification._meta.fields}
            if 'timestamp' in field_names:
                ordering = '-timestamp'
            elif 'created_at' in field_names:
                ordering = '-created_at'
            else:
                ordering = '-id'

            notifications = Notification.objects.filter(
                recipient=self.user
            ).order_by(ordering)[:limit]
            
            results = []
            for n in notifications:
                created_at = getattr(n, 'timestamp', None) or getattr(n, 'created_at', None)
                data = getattr(n, 'data', {}) or {}
                results.append({
                    'id': n.id,
                    'title': getattr(n, 'verb', '') or '',
                    'message': getattr(n, 'description', '') or '',
                    'notification_type': data.get('notification_type') or getattr(n, 'verb', ''),
                    'link': data.get('link'),
                    'created_at': created_at.isoformat() if created_at else None,
                    'is_read': not getattr(n, 'unread', False)
                })
            return results
        except Exception:
            return []
    
    @database_sync_to_async
    def mark_notification_read(self, notification_id):
        """Mark a single notification as read"""
        try:
            from notifications.models import Notification
            Notification.objects.filter(
                id=notification_id,
                recipient=self.user
            ).update(unread=False)
        except Exception:
            pass
    
    @database_sync_to_async
    def mark_all_notifications_read(self):
        """Mark all notifications as read for the user"""
        try:
            from notifications.models import Notification
            Notification.objects.filter(
                recipient=self.user,
                unread=True
            ).update(unread=False)
        except Exception:
            pass


# ========== Event Triggers (Called from signals/services) ==========

# These methods are called from NotificationService to broadcast via WebSocket

async def broadcast_notification(user_id, notification_data):
    """
    Broadcast a notification to a specific user's WebSocket.
    
    Args:
        user_id: ID of the user to notify
        notification_data: Dict with title, message, type, link, etc.
    """
    from channels.layers import get_channel_layer
    
    channel_layer = get_channel_layer()
    group_name = f'notifications_{user_id}'
    
    await channel_layer.group_send(
        group_name,
        {
            'type': 'send_notification',
            'notification_id': notification_data.get('id'),
            'title': notification_data.get('title'),
            'message': notification_data.get('message'),
            'notification_type': notification_data.get('type'),
            'link': notification_data.get('link'),
            'created_at': notification_data.get('created_at'),
            'is_read': False
        }
    )


async def broadcast_to_managers(manager_ids, notification_data):
    """
    Broadcast a notification to multiple managers.
    
    Args:
        manager_ids: List of manager user IDs
        notification_data: Dict with notification information
    """
    from channels.layers import get_channel_layer
    
    channel_layer = get_channel_layer()
    
    for manager_id in manager_ids:
        group_name = f'notifications_{manager_id}'
        await channel_layer.group_send(
            group_name,
            {
                'type': 'send_notification',
                'notification_id': notification_data.get('id'),
                'title': notification_data.get('title'),
                'message': notification_data.get('message'),
                'notification_type': notification_data.get('type'),
                'link': notification_data.get('link'),
                'created_at': notification_data.get('created_at'),
                'is_read': False
            }
        )


async def broadcast_to_calibration_participants(session_id, notification_data):
    """
    Broadcast a notification to all participants in a calibration session.
    
    Args:
        session_id: Calibration session ID
        notification_data: Dict with notification information
    """
    from channels.layers import get_channel_layer
    from apps.reviews.models import CalibrationSession
    
    try:
        session = await database_sync_to_async(
            lambda: CalibrationSession.objects.get(id=session_id)
        )()
        
        channel_layer = get_channel_layer()
        
        # Notify facilitator
        if session.facilitator:
            group_name = f'notifications_{session.facilitator.id}'
            await channel_layer.group_send(group_name, {
                'type': 'send_notification',
                **notification_data
            })
        
        # Notify all participants
        for participant in await database_sync_to_async(lambda: list(session.participants.all()))():
            group_name = f'notifications_{participant.id}'
            await channel_layer.group_send(group_name, {
                'type': 'send_notification',
                **notification_data
            })
    except Exception:
        pass