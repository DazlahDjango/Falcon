# apps/reviews/consumers/review_status_consumer.py
"""
WebSocket consumer for real-time review status updates
Sends live updates when employees submit reviews or managers approve
"""

import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async

from apps.reviews.services.cycle.cycle_service import CycleService
from apps.reviews.services.notification.notification_service import NotificationService


class ReviewStatusConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for review status updates.
    
    Groups:
    - review_status_{cycle_id} - All users in a specific review cycle
    - manager_{user_id} - Manager's personal queue updates
    - employee_{user_id} - Employee's personal review status
    """
    
    async def connect(self):
        """Handle new WebSocket connection"""
        self.user = self.scope['user']
        
        if not self.user.is_authenticated:
            await self.close()
            return
        
        self.cycle_id = self.scope['url_route']['kwargs'].get('cycle_id')
        self.room_group_name = f'review_status_{self.cycle_id}'
        
        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        # Join personal groups
        await self.channel_layer.group_add(
            f'employee_{self.user.id}',
            self.channel_name
        )
        
        if await self.is_manager():
            await self.channel_layer.group_add(
                f'manager_{self.user.id}',
                self.channel_name
            )
        
        await self.accept()
        
        # Send initial status using CycleService
        await self.send_initial_status()
    
    async def disconnect(self, close_code):
        """Handle WebSocket disconnection"""
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        await self.channel_layer.group_discard(
            f'employee_{self.user.id}',
            self.channel_name
        )
        
        if await self.is_manager():
            await self.channel_layer.group_discard(
                f'manager_{self.user.id}',
                self.channel_name
            )
    
    async def receive(self, text_data):
        """Handle incoming WebSocket messages"""
        data = json.loads(text_data)
        message_type = data.get('type')
        
        if message_type == 'ping':
            await self.send(text_data=json.dumps({'type': 'pong'}))
        
        elif message_type == 'subscribe_cycle':
            cycle_id = data.get('cycle_id')
            if cycle_id:
                new_group = f'review_status_{cycle_id}'
                await self.channel_layer.group_add(new_group, self.channel_name)
                await self.send(text_data=json.dumps({
                    'type': 'subscribed',
                    'cycle_id': cycle_id
                }))
    
    async def send_initial_status(self):
        """Send current review status on connection using CycleService"""
        status = await self.get_cycle_status()
        if status:
            await self.send(text_data=json.dumps({
                'type': 'initial_status',
                'data': status
            }))
    
    async def review_submitted(self, event):
        """Send notification when a review is submitted"""
        await self.send(text_data=json.dumps({
            'type': 'review_submitted',
            'employee_name': event['employee_name'],
            'employee_id': event['employee_id'],
            'submitted_at': event['submitted_at'],
            'cycle_id': event['cycle_id']
        }))
        
        # Send updated completion stats
        await self.send_completion_update(event['cycle_id'])
    
    async def review_approved(self, event):
        """Send notification when a review is approved"""
        await self.send(text_data=json.dumps({
            'type': 'review_approved',
            'employee_name': event['employee_name'],
            'approved_by': event['approved_by'],
            'approved_at': event['approved_at']
        }))
        
        # Send updated completion stats
        await self.send_completion_update(event.get('cycle_id'))
    
    async def completion_updated(self, event):
        """Send updated completion statistics"""
        await self.send(text_data=json.dumps({
            'type': 'completion_updated',
            'submitted_count': event['submitted_count'],
            'total_count': event['total_count'],
            'percentage': event['percentage']
        }))
    
    async def send_completion_update(self, cycle_id):
        """Send completion update to all connected clients"""
        progress = await self.get_cycle_progress(cycle_id)
        if progress:
            await self.channel_layer.group_send(
                f'review_status_{cycle_id}',
                {
                    'type': 'completion_updated',
                    'submitted_count': progress['self_assessment']['submitted'],
                    'total_count': progress['total_employees'],
                    'percentage': progress['self_assessment']['percentage']
                }
            )
    
    @database_sync_to_async
    def is_manager(self):
        """Check if user is a manager"""
        return self.user.role in ['manager', 'admin', 'executive']
    
    @database_sync_to_async
    def get_cycle_status(self):
        """Get current review cycle status using CycleService"""
        if not self.cycle_id:
            return None
        
        try:
            return CycleService.get_cycle_progress(self.cycle_id)
        except Exception:
            return None
    
    @database_sync_to_async
    def get_cycle_progress(self, cycle_id):
        """Get cycle progress using CycleService"""
        try:
            return CycleService.get_cycle_progress(cycle_id)
        except Exception:
            return None