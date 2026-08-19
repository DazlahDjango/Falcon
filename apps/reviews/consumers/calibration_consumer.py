import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from apps.reviews.services.calibration.calibration_service import CalibrationService
from apps.reviews.services.reporting.calibration_report_service import CalibrationReportService
from apps.reviews.services.notification.notification_service import NotificationService


class CalibrationConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for live calibration sessions.
    
    Groups:
    - calibration_{session_id} - All participants in a specific calibration session
    """
    
    async def connect(self):
        """Handle new WebSocket connection for calibration session"""
        self.user = self.scope['user']
        
        if not self.user.is_authenticated:
            await self.close()
            return
        
        self.session_id = self.scope['url_route']['kwargs'].get('session_id')
        self.room_group_name = f'calibration_{self.session_id}'
        
        # Check if user is a participant using CalibrationService
        if not await self.is_participant():
            await self.close()
            return
        
        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
        
        # Send session info using CalibrationReportService
        await self.send_session_info()
    
    async def disconnect(self, close_code):
        """Handle WebSocket disconnection"""
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
    
    async def receive(self, text_data):
        """Handle incoming WebSocket messages"""
        data = json.loads(text_data)
        message_type = data.get('type')
        
        if message_type == 'chat_message':
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': data['message'],
                    'sender': self.user.email,
                    'sender_name': self.user.get_full_name(),
                    'timestamp': str(await self.get_timestamp())
                }
            )
        
        elif message_type == 'rating_adjustment':
            # Use CalibrationService to save adjustment
            await self.save_rating_adjustment(data)
            
            # Broadcast to all participants
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'rating_adjustment',
                    'employee_id': data['employee_id'],
                    'employee_name': data['employee_name'],
                    'before_score': data['before_score'],
                    'after_score': data['after_score'],
                    'adjustment_reason': data.get('adjustment_reason', ''),
                    'adjusted_by': self.user.email,
                    'timestamp': str(await self.get_timestamp())
                }
            )
        
        elif message_type == 'sync_request':
            await self.send_calibration_data()
        
        elif message_type == 'typing':
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'typing_indicator',
                    'sender': self.user.email,
                    'is_typing': data.get('is_typing', False)
                }
            )
        
        elif message_type == 'complete_session':
            # Use CalibrationService to complete session
            await self.complete_session()
    
    async def chat_message(self, event):
        """Send chat message to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'message': event['message'],
            'sender': event['sender'],
            'sender_name': event['sender_name'],
            'timestamp': event['timestamp']
        }))
    
    async def rating_adjustment(self, event):
        """Send rating adjustment to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'rating_adjustment',
            'employee_id': event['employee_id'],
            'employee_name': event['employee_name'],
            'before_score': event['before_score'],
            'after_score': event['after_score'],
            'adjustment_reason': event['adjustment_reason'],
            'adjusted_by': event['adjusted_by'],
            'timestamp': event['timestamp']
        }))
    
    async def typing_indicator(self, event):
        """Send typing indicator to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'typing',
            'sender': event['sender'],
            'is_typing': event['is_typing']
        }))
    
    async def send_session_info(self):
        """Send current session information using CalibrationReportService"""
        session_info = await self.get_session_info()
        if session_info:
            await self.send(text_data=json.dumps({
                'type': 'session_info',
                'data': session_info
            }))
    
    async def send_calibration_data(self):
        """Send all calibration data using CalibrationReportService"""
        data = await self.get_calibration_data()
        if data:
            await self.send(text_data=json.dumps({
                'type': 'calibration_data',
                'data': data
            }))
    
    async def complete_session(self):
        """Complete the calibration session using CalibrationService"""
        result = await self.complete_calibration_session()
        if result:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'session_completed',
                    'message': 'Calibration session has been completed'
                }
            )
    
    async def session_completed(self, event):
        """Send session completed notification"""
        await self.send(text_data=json.dumps({
            'type': 'session_completed',
            'message': event['message']
        }))
    
    @database_sync_to_async
    def is_participant(self):
        """Check if user is a participant using CalibrationService"""
        try:
            if self.user.is_superuser or getattr(self.user, 'role', '') in ['super_admin', 'admin', 'executive', 'manager']:
                return True
            session = CalibrationService.get_session(self.session_id)
            if not session:
                return False
            return session.participants.filter(id=self.user.id).exists() or session.facilitator_id == self.user.id
        except Exception:
            return True
    
    @database_sync_to_async
    def get_session_info(self):
        """Get calibration session information using CalibrationReportService"""
        try:
            report = CalibrationReportService.get_session_report(self.session_id)
            return report.get('session') if report else None
        except Exception:
            return None
    
    @database_sync_to_async
    def get_calibration_data(self):
        """Get calibration data using CalibrationReportService"""
        try:
            report = CalibrationReportService.get_session_report(self.session_id)
            if report:
                return {
                    'ratings': report.get('adjustments', {}).get('list', []),
                    'participants': report.get('participants', [])
                }
            return None
        except Exception:
            return None
    
    @database_sync_to_async
    def save_rating_adjustment(self, data):
        """Save rating adjustment using CalibrationService"""
        try:
            return CalibrationService.add_rating_adjustment(
                session_id=self.session_id,
                final_rating_id=data['employee_id'],
                adjusted_by=self.user,
                before_score=data['before_score'],
                after_score=data['after_score'],
                reason=data.get('adjustment_reason', '')
            )
        except Exception:
            return None
    
    @database_sync_to_async
    def complete_calibration_session(self):
        """Complete calibration session using CalibrationService"""
        try:
            return CalibrationService.complete_session(self.session_id)
        except Exception:
            return None
    
    @database_sync_to_async
    def get_timestamp(self):
        """Get current timestamp"""
        from django.utils import timezone
        return timezone.now()