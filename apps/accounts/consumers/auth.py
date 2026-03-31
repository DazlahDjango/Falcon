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

class AuthConsumer(AsyncWebsocketConsumer):
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
                f'user_{self.user_id}',
                self.channel_name
            )
            await self.channel_layer.group_add(
                f'tenant_{self.tenant_id}',
                self.channel_name
            )
            await self.send(text_data=json.dumps({
                'type': 'connection',
                'status': 'connected',
                'user_id': self.user_id,
                'tenant_id': self.tenant_id
            }))
            logger.info(f"Websocket connected: {self.user_id}")
        else:
            await self.close(code=4001, reason='Authentication failed')
    
    async def disconnect(self, close_code):
        if hasattr(self, 'user_id'):
            await self.channel_layer.group_discard(
                f'user_{self.user_id}',
                self.channel_name
            )
            await self.channel_layer.group_discard(
                f'tenant_{self.tenant_id}',
                self.channel_name
            )
            await self.update_presence(status='offline')
            logger.info(f"Websocket disconnected: user {self.user_id}, code: {close_code}")

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            if message_type == 'ping':
                await self.send(text_data=json.dumps({'type': 'pong'}))
            elif message_type == 'logout':
                await self.handle_logout()
            elif message_type == 'status':
                await self.update_presence(data.get('status', 'online'))
            elif message_type == 'typing':
                await self.broadcast_typing(data)
        except json.JSONDecodeError:
            logger.error(f"Invalid websocket message: {text_data}")
        except Exception as e:
            logger.error(f"Websocket receive error: {str(e)}")

    async def handle_logout(self):
        if hasattr(self.scope, 'session_key'):
            await database_sync_to_async(session_service.terminate_session)(
                self.scope['session_key']
            )
        await self.send(text_data=json.dumps({
            'type': 'logout',
            'status': 'success'
        }))
        await self.close()

    async def broadcast_typing(self, data):
        target_user = data.get('target_user')
        if target_user:
            await self.channel_layer.group_send(
                f"user_{target_user}",
                {
                    'type': 'typing_notification',
                    'user_id': self.user_id,
                    'is_typing': data.get('is_typing', True)
                }
            )
        
    async def typing_notification(self, event):
        await self.send(text_data=json.dumps({
            'type': 'typing',
            'user_id': event['user_id'],
            'is_typing': event['is_typing']
        }))
    
    @database_sync_to_async
    def authenticate_token(self, token):
        if not token:
            return None
        payload = jwt_service.verify_token(token)
        if not payload:
            return None
        user_id = payload.get('user_id')
        if not user_id:
            return None
        try:
            user = User.objects.get(id=user_id, is_active=True, is_deleted=False)
            return user
        except User.DoesNotExist:
            return None
        
    @database_sync_to_async
    def update_presence(self, status):
        cache_key = f"user_presence:{self.user_id}"
        cache.set(cache_key, {
            'status': status,
            'last_seen': timezone.now().isoformat(),
            'channel': self.channel_name
        }, timeout=300)