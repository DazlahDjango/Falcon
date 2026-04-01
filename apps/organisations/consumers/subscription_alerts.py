"""
Subscription Alerts WebSocket Consumer
Provides real-time updates for subscription and billing events
"""

import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model

User = get_user_model()
logger = logging.getLogger(__name__)


class SubscriptionAlertConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for real-time subscription and billing alerts.
    
    Connected clients receive:
    - Subscription status changes
    - Renewal reminders
    - Payment success/failure alerts
    - Trial expiration warnings
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
        
        # Join organisation subscription room
        self.room_group_name = f"org_subscription_{self.organisation_id}"
        
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
        logger.info(f"Subscription WebSocket connected: User {self.user.id} joined org {self.organisation_id}")
        
        # Send initial subscription status
        await self.send_subscription_status()
    
    async def disconnect(self, close_code):
        """
        Handle WebSocket disconnection
        """
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
            logger.info(f"Subscription WebSocket disconnected: User {self.user.id}")
    
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
            
            elif message_type == 'get_subscription':
                await self.send_subscription_status()
            
            elif message_type == 'request_renewal':
                await self.handle_renewal_request()
            
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
    
    async def subscription_updated(self, event):
        """
        Send subscription update to all clients in the group
        """
        await self.send(text_data=json.dumps({
            'type': 'subscription_updated',
            'data': event.get('data', {}),
            'timestamp': await self._get_timestamp()
        }))
    
    async def renewal_reminder(self, event):
        """
        Send renewal reminder notification
        """
        await self.send(text_data=json.dumps({
            'type': 'renewal_reminder',
            'days_left': event.get('days_left'),
            'expiry_date': event.get('expiry_date'),
            'message': event.get('message', 'Your subscription is expiring soon'),
            'timestamp': await self._get_timestamp()
        }))
    
    async def payment_success(self, event):
        """
        Send payment success notification
        """
        await self.send(text_data=json.dumps({
            'type': 'payment_success',
            'amount': event.get('amount'),
            'currency': event.get('currency'),
            'invoice_id': event.get('invoice_id'),
            'message': event.get('message', 'Payment successful'),
            'timestamp': await self._get_timestamp()
        }))
    
    async def payment_failed(self, event):
        """
        Send payment failure notification
        """
        await self.send(text_data=json.dumps({
            'type': 'payment_failed',
            'amount': event.get('amount'),
            'currency': event.get('currency'),
            'reason': event.get('reason'),
            'message': event.get('message', 'Payment failed'),
            'timestamp': await self._get_timestamp()
        }))
    
    async def trial_ending(self, event):
        """
        Send trial ending notification
        """
        await self.send(text_data=json.dumps({
            'type': 'trial_ending',
            'days_left': event.get('days_left'),
            'end_date': event.get('end_date'),
            'message': event.get('message', 'Your trial is ending soon'),
            'timestamp': await self._get_timestamp()
        }))
    
    async def plan_changed(self, event):
        """
        Send plan change notification
        """
        await self.send(text_data=json.dumps({
            'type': 'plan_changed',
            'old_plan': event.get('old_plan'),
            'new_plan': event.get('new_plan'),
            'effective_date': event.get('effective_date'),
            'timestamp': await self._get_timestamp()
        }))
    
    # ============================================================
    # Helper Methods
    # ============================================================
    
    async def send_subscription_status(self):
        """
        Send current subscription status
        """
        status = await self._get_subscription_status()
        await self.send(text_data=json.dumps({
            'type': 'subscription_status',
            'data': status,
            'timestamp': await self._get_timestamp()
        }))
    
    async def handle_renewal_request(self):
        """
        Handle manual renewal request
        """
        result = await self._process_renewal()
        await self.send(text_data=json.dumps({
            'type': 'renewal_response',
            'success': result.get('success', False),
            'message': result.get('message'),
            'timestamp': await self._get_timestamp()
        }))
    
    @database_sync_to_async
    def _get_subscription_status(self):
        """
        Get current subscription status from database
        """
        from apps.organisations.models import Subscription
        
        try:
            subscription = Subscription.objects.select_related('plan', 'organisation').get(
                organisation_id=self.organisation_id
            )
            return {
                'status': subscription.status,
                'plan_name': subscription.plan.name if subscription.plan else 'No Plan',
                'plan_code': subscription.plan.code if subscription.plan else None,
                'start_date': subscription.start_date.isoformat() if subscription.start_date else None,
                'end_date': subscription.end_date.isoformat() if subscription.end_date else None,
                'trial_end_date': subscription.trial_end_date.isoformat() if subscription.trial_end_date else None,
                'auto_renew': subscription.auto_renew,
                'is_active': subscription.is_active_subscription(),
                'days_until_expiry': subscription.days_until_expiry(),
                'days_left_in_trial': subscription.days_left_in_trial(),
            }
        except Subscription.DoesNotExist:
            return None
    
    @database_sync_to_async
    def _process_renewal(self):
        """
        Process subscription renewal
        """
        from apps.organisations.services import RenewalService
        from apps.organisations.models import Subscription
        
        try:
            subscription = Subscription.objects.get(organisation_id=self.organisation_id)
            renewed = RenewalService.renew_subscription(subscription)
            
            if renewed:
                return {
                    'success': True,
                    'message': 'Subscription renewed successfully'
                }
            else:
                return {
                    'success': False,
                    'message': 'Renewal failed. Please contact support.'
                }
        except Subscription.DoesNotExist:
            return {
                'success': False,
                'message': 'No subscription found for this organisation'
            }
    
    @database_sync_to_async
    def _get_timestamp(self):
        """
        Get current timestamp
        """
        from django.utils import timezone
        return timezone.now().isoformat()