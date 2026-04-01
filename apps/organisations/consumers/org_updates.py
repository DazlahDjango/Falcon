"""
Organisation Updates WebSocket Consumer
Provides real-time updates for organisation changes
"""

import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model

User = get_user_model()
logger = logging.getLogger(__name__)


class OrganisationUpdateConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for real-time organisation updates.
    
    Connected clients receive:
    - Organisation details changes
    - Status changes (active/suspended/pending)
    - Branding updates
    - Settings changes
    """
    
    async def connect(self):
        """
        Handle WebSocket connection
        """
        self.organisation_id = self.scope['url_route']['kwargs'].get('organisation_id')
        self.user = self.scope.get('user')
        
        # Authentication check
        if not self.user or not self.user.is_authenticated:
            logger.warning(f"Unauthenticated connection attempt to org {self.organisation_id}")
            await self.close()
            return
        
        # Permission check - user must belong to this organisation
        if str(self.user.organisation_id) != self.organisation_id:
            logger.warning(f"User {self.user.id} attempted to connect to org {self.organisation_id}")
            await self.close()
            return
        
        # Join organisation room
        self.room_group_name = f"org_{self.organisation_id}"
        
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
        logger.info(f"WebSocket connected: User {self.user.id} joined org {self.organisation_id}")
        
        # Send initial connection confirmation
        await self.send(text_data=json.dumps({
            'type': 'connection_established',
            'message': 'Connected to organisation updates',
            'organisation_id': self.organisation_id,
            'timestamp': await self._get_timestamp()
        }))
    
    async def disconnect(self, close_code):
        """
        Handle WebSocket disconnection
        """
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
            logger.info(f"WebSocket disconnected: User {self.user.id} left org {self.organisation_id}")
    
    async def receive(self, text_data):
        """
        Handle incoming WebSocket messages
        """
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            if message_type == 'ping':
                await self.send(text_data=json.dumps({
                    'type': 'pong',
                    'timestamp': await self._get_timestamp()
                }))
            
            elif message_type == 'get_status':
                await self.send_organisation_status()
            
            else:
                await self.send(text_data=json.dumps({
                    'type': 'error',
                    'message': f'Unknown message type: {message_type}'
                }))
                
        except json.JSONDecodeError as e:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': f'Invalid JSON: {str(e)}'
            }))
    
    # ============================================================
    # Group Send Methods (called from other parts of the app)
    # ============================================================
    
    async def organisation_updated(self, event):
        """
        Send organisation update to all clients in the group
        """
        await self.send(text_data=json.dumps({
            'type': 'organisation_updated',
            'data': event.get('data', {}),
            'timestamp': await self._get_timestamp()
        }))
    
    async def status_changed(self, event):
        """
        Send status change notification
        """
        await self.send(text_data=json.dumps({
            'type': 'status_changed',
            'old_status': event.get('old_status'),
            'new_status': event.get('new_status'),
            'timestamp': await self._get_timestamp()
        }))
    
    async def branding_updated(self, event):
        """
        Send branding update notification
        """
        await self.send(text_data=json.dumps({
            'type': 'branding_updated',
            'data': event.get('data', {}),
            'timestamp': await self._get_timestamp()
        }))
    
    async def settings_updated(self, event):
        """
        Send settings update notification
        """
        await self.send(text_data=json.dumps({
            'type': 'settings_updated',
            'data': event.get('data', {}),
            'timestamp': await self._get_timestamp()
        }))
    
    # ============================================================
    # Helper Methods
    # ============================================================
    
    async def send_organisation_status(self):
        """
        Send current organisation status
        """
        status = await self._get_organisation_status()
        await self.send(text_data=json.dumps({
            'type': 'organisation_status',
            'data': status,
            'timestamp': await self._get_timestamp()
        }))
    
    @database_sync_to_async
    def _get_organisation_status(self):
        """
        Get current organisation status from database
        """
        from apps.organisations.models import Organisation
        
        try:
            org = Organisation.objects.get(id=self.organisation_id)
            return {
                'id': str(org.id),
                'name': org.name,
                'slug': org.slug,
                'status': org.status,
                'is_active': org.is_active,
                'sector': org.sector,
            }
        except Organisation.DoesNotExist:
            return None
    
    @database_sync_to_async
    def _get_timestamp(self):
        """
        Get current timestamp
        """
        from django.utils import timezone
        return timezone.now().isoformat()