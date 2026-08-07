import jwt
import logging
from channels.db import database_sync_to_async
from channels.middleware import BaseMiddleware
from django.contrib.auth.models import AnonymousUser
from django.conf import settings
from urllib.parse import parse_qs
from apps.accounts.models import User
from apps.accounts.services.auth.jwt import JWTServices

logger = logging.getLogger(__name__)
jwt_service = JWTServices()


@database_sync_to_async
def get_user_from_token(token):
    if not token:
        return None
    
    payload = jwt_service.verify_token(token)
    if not payload:
        logger.debug(f"Invalid token payload")
        return None
    
    user_id = payload.get('user_id')
    if not user_id:
        logger.debug("No user_id in token payload")
        return None
    
    try:
        user = User.objects.get(id=user_id, is_active=True, is_deleted=False)
        logger.debug(f"User authenticated via WebSocket: {user.email}")
        return user
    except User.DoesNotExist:
        logger.debug(f"User {user_id} not found")
        return None


class WebSocketAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        token = ''
        query_string = scope.get('query_string', b'')
        if isinstance(query_string, bytes):
            query_string = query_string.decode(errors='ignore')
        params = parse_qs(query_string)
        token_list = params.get('token', [])

        if token_list:
            token = token_list[0]
        else:
            for name, value in scope.get('headers', []):
                if isinstance(name, bytes):
                    name = name.decode(errors='ignore').lower()
                if name == 'authorization' and value:
                    if isinstance(value, bytes):
                        value = value.decode(errors='ignore')
                    lower_value = value.lower()
                    if lower_value.startswith('bearer '):
                        token = value.split(' ', 1)[1]
                        break
                    if lower_value.startswith('token '):
                        token = value.split(' ', 1)[1]
                        break
                    token = value.strip()
                    break

        if token:
            user = await get_user_from_token(token)
            if user:
                scope['user'] = user
                scope['tenant_id'] = str(user.tenant_id) if getattr(user, 'tenant_id', None) else None
                logger.debug(f"WebSocket authenticated for user {user.email}")
            else:
                scope['user'] = AnonymousUser()
                logger.debug("WebSocket authentication failed - invalid token")
        else:
            user = scope.get('user')
            if user and getattr(user, 'is_authenticated', False):
                scope['tenant_id'] = str(user.tenant_id) if getattr(user, 'tenant_id', None) else None
                logger.debug(f"WebSocket session authenticated for user {user.email}")
            else:
                scope['user'] = AnonymousUser()
                logger.debug("No token provided for WebSocket connection")
        return await super().__call__(scope, receive, send)