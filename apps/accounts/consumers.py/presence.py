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

class PresenceConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        token = self.scope['query_string'].decode()
        if token.startswith('token='):
            token = token.split('=')[1]
        user = await self.authenticate_token(token)
        if user:
            self.user = user
            self.user_id = str(user.id)
            self.tenant_id = str(user.tenant_id)
            await self.accept()
            await self.channel_layer.group_add(
                f'presence_tenant_{self.tenant_id}',
                self.channel_name
            )
            await self.announce_presence(status='online')
            online_users = await self.get_online_users()
            await self.send(text_data=json.dumps({
                'type': 'presence',
                'online_users': online_users
            }))
            logger.info(f'Presence websocket connected: user: {self.user_id}')
        else:
            await self.close(code=4001, reason='Authentication failed')
    
    async def disconnect(self, close_code):
        if hasattr(self, 'user_id'):
            await self.announce_presence(status='offline')
            await self.channel_layer.group_discard(
                f'presence_tenant_{self.tenant_id}',
                self.channel_name
            )
            logger.info(f"Pressence websocket disconnected: user: {self.user_id}")
    
    async def user_status_change(self, event):
        await self.send(text_data=json.dumps({
            'type': 'status_change',
            'user_id': event['user_id'],
            'status': event['status'],
            'timestamp': event['timestamp']
        }))
    
    async def announce_presence(self, status):
        await self.channel_layer.group_send(
            f'presence_tenant_{self.tenant_id}',
            {
                'type': 'user_status_change',
                'user_id': self.user_id,
                'status': status,
                'timestamp': timezone.now().isoformat()
            }
        )
    
    async def authenticate_token(self, token):
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
    def get_online_users(self):
        online_users = []
        keys = cache.keys('user_presence:*')
        for key in keys:
            presence = cache.get(key)
            if presence:
                user_id = key.split(':')[-1]
                online_users.append({
                    'user_id': user_id,
                    'status': presence.get('status', 'online'),
                    'last_seen': presence.get('last_seen')
                })
        return online_users