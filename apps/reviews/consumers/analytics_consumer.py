# apps/reviews/consumers/analytics_consumer.py
"""
WebSocket consumer for real-time analytics updates.
Sends live analytics data to dashboard and reports.
"""

import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.utils import timezone

# Import existing services (following the pattern from calibration_consumer.py)
from apps.reviews.services.analytics.analytics_service import AnalyticsService
from apps.reviews.services.analytics.insight_service import InsightService
from apps.reviews.services.analytics.predictive_service import PredictiveService
from apps.reviews.services.realtime.event_broadcaster import ReviewsEventBroadcaster


class AnalyticsConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for real-time analytics data.
    
    Groups:
    - analytics_{tenant_id} - All users in a tenant
    - analytics_department_{dept_id} - Department-specific analytics
    - analytics_manager_{manager_id} - Manager-specific analytics
    """
    
    async def connect(self):
        """Handle new WebSocket connection for analytics."""
        self.user = self.scope['user']
        
        if not self.user.is_authenticated:
            await self.close()
            return
        
        self.tenant_id = self.scope['url_route']['kwargs'].get('tenant_id')
        
        if not self.tenant_id and hasattr(self.user, 'tenant_id'):
            self.tenant_id = str(self.user.tenant_id)
        
        if not self.tenant_id:
            await self.close()
            return
        
        # Join tenant analytics group
        self.tenant_group = f'analytics_{self.tenant_id}'
        await self.channel_layer.group_add(
            self.tenant_group,
            self.channel_name
        )
        
        # Join department group if user has department
        if hasattr(self.user, 'department_id') and self.user.department_id:
            self.dept_group = f'analytics_department_{self.user.department_id}'
            await self.channel_layer.group_add(
                self.dept_group,
                self.channel_name
            )
        
        # Join manager group if user is manager
        if self.user.role in ['manager', 'executive', 'admin', 'hr']:
            self.manager_group = f'analytics_manager_{self.user.id}'
            await self.channel_layer.group_add(
                self.manager_group,
                self.channel_name
            )
        
        await self.accept()
        
        # Send initial analytics data
        await self.send_initial_analytics()
        
        # Send initial insights
        await self.send_initial_insights()
    
    async def disconnect(self, close_code):
        """Handle WebSocket disconnection."""
        await self.channel_layer.group_discard(
            self.tenant_group,
            self.channel_name
        )
        
        if hasattr(self, 'dept_group'):
            await self.channel_layer.group_discard(
                self.dept_group,
                self.channel_name
            )
        
        if hasattr(self, 'manager_group'):
            await self.channel_layer.group_discard(
                self.manager_group,
                self.channel_name
            )
    
    async def receive(self, text_data):
        """Handle incoming WebSocket messages."""
        data = json.loads(text_data)
        message_type = data.get('type')
        
        if message_type == 'ping':
            await self.send(text_data=json.dumps({'type': 'pong'}))
        
        elif message_type == 'refresh_analytics':
            await self.refresh_and_send_analytics()
        
        elif message_type == 'refresh_insights':
            await self.refresh_and_send_insights()
        
        elif message_type == 'get_predictions':
            await self.send_predictions()
        
        elif message_type == 'subscribe_department':
            dept_id = data.get('department_id')
            if dept_id:
                new_group = f'analytics_department_{dept_id}'
                await self.channel_layer.group_add(new_group, self.channel_name)
                await self.send(text_data=json.dumps({
                    'type': 'subscribed',
                    'department_id': dept_id
                }))
    
    async def send_initial_analytics(self):
        """Send initial analytics data on connection."""
        # Company analytics
        company_analytics = await self.get_company_analytics()
        if company_analytics:
            await self.send(text_data=json.dumps({
                'type': 'company_analytics',
                'data': company_analytics
            }))
        
        # Department analytics
        dept_analytics = await self.get_department_analytics()
        if dept_analytics:
            await self.send(text_data=json.dumps({
                'type': 'department_analytics',
                'data': dept_analytics
            }))
        
        # Manager analytics (if user is manager/admin/hr)
        if self.user.role in ['manager', 'executive', 'admin', 'hr']:
            manager_analytics = await self.get_manager_analytics()
            if manager_analytics:
                await self.send(text_data=json.dumps({
                    'type': 'manager_analytics',
                    'data': manager_analytics
                }))
    
    async def send_initial_insights(self):
        """Send initial insights on connection."""
        insights = await self.get_insights()
        if insights:
            await self.send(text_data=json.dumps({
                'type': 'insights',
                'data': insights
            }))
    
    async def send_predictions(self):
        """Send flight risk predictions."""
        predictions = await self.get_predictions()
        if predictions:
            await self.send(text_data=json.dumps({
                'type': 'predictions',
                'data': predictions
            }))
    
    async def refresh_and_send_analytics(self):
        """Refresh analytics cache and send updates."""
        await self.refresh_analytics_cache()
        await self.send_initial_analytics()
    
    async def refresh_and_send_insights(self):
        """Refresh insights and send updates."""
        await self.refresh_insights_cache()
        await self.send_initial_insights()
    
    # ========== Event Handlers (Called from signals) ==========
    
    async def analytics_updated(self, event):
        """
        Send analytics update to WebSocket.
        Triggered when analytics data changes.
        """
        await self.send(text_data=json.dumps({
            'type': 'analytics_updated',
            'analytics_type': event.get('analytics_type'),
            'data': event.get('data'),
            'updated_at': event.get('updated_at')
        }))
    
    async def insights_updated(self, event):
        """
        Send insights update to WebSocket.
        Triggered when new insights are generated.
        """
        await self.send(text_data=json.dumps({
            'type': 'insights_updated',
            'insights': event.get('insights'),
            'generated_at': event.get('generated_at')
        }))
    
    async def predictions_updated(self, event):
        """
        Send predictions update to WebSocket.
        Triggered when risk predictions are refreshed.
        """
        await self.send(text_data=json.dumps({
            'type': 'predictions_updated',
            'predictions': event.get('predictions'),
            'updated_at': event.get('updated_at')
        }))
    
    async def department_ranking_updated(self, event):
        """
        Send department ranking update to WebSocket.
        """
        await self.send(text_data=json.dumps({
            'type': 'department_ranking_updated',
            'ranking': event.get('ranking'),
            'updated_at': event.get('updated_at')
        }))
    
    # ========== Database Operations ==========
    
    @database_sync_to_async
    def get_company_analytics(self):
        """Get company analytics from database."""
        try:
            from apps.tenant.models import Client
            tenant = Client.objects.get(id=self.tenant_id)
            return AnalyticsService.get_company_analytics(tenant)
        except Exception as e:
            return None
    
    @database_sync_to_async
    def get_department_analytics(self):
        """Get department analytics from database."""
        try:
            from apps.tenant.models import Client
            tenant = Client.objects.get(id=self.tenant_id)
            return AnalyticsService.get_department_analytics(tenant)
        except Exception:
            return None
    
    @database_sync_to_async
    def get_manager_analytics(self):
        """Get manager analytics from database."""
        try:
            from apps.tenant.models import Client
            tenant = Client.objects.get(id=self.tenant_id)
            return AnalyticsService.get_manager_analytics(tenant)
        except Exception:
            return None
    
    @database_sync_to_async
    def get_insights(self):
        """Get insights from database."""
        try:
            from apps.tenant.models import Client
            tenant = Client.objects.get(id=self.tenant_id)
            return InsightService.get_all_insights(tenant)
        except Exception:
            return None
    
    @database_sync_to_async
    def get_predictions(self):
        """Get flight risk predictions from database."""
        try:
            from apps.tenant.models import Client
            tenant = Client.objects.get(id=self.tenant_id)
            return PredictiveService.get_high_risk_employees(tenant)
        except Exception:
            return None
    
    @database_sync_to_async
    def refresh_analytics_cache(self):
        """Refresh analytics cache."""
        try:
            from apps.tenant.models import Client
            from django.core.cache import cache
            
            tenant = Client.objects.get(id=self.tenant_id)
            
            # Refresh and recache
            AnalyticsService.get_company_analytics(tenant)
            AnalyticsService.get_department_analytics(tenant)
            AnalyticsService.get_manager_analytics(tenant)
            
            # Clear old cache keys
            cache.delete_pattern(f'reviews:analytics:*{self.tenant_id}*')
            
        except Exception:
            pass
    
    @database_sync_to_async
    def refresh_insights_cache(self):
        """Refresh insights cache."""
        try:
            from apps.tenant.models import Client
            from django.core.cache import cache
            
            tenant = Client.objects.get(id=self.tenant_id)
            InsightService.get_all_insights(tenant)
            
            # Clear old cache
            cache.delete(f'reviews:analytics:insights:{self.tenant_id}')
            
        except Exception:
            pass
    
    @database_sync_to_async
    def get_timestamp(self):
        """Get current timestamp"""
        from django.utils import timezone
        return timezone.now()