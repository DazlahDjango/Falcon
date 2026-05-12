import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.utils import timezone
logger = logging.getLogger(__name__)

class BillingConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope.get('user')
        self.tenant_id = self._get_tenant_id()
        if not self.user or not self.user.is_authenticated:
            await self.close(code=4001)
            return
        if not self.tenant_id:
            await self.close(code=4002)
            return
        self.room_group_name = f'billing_tenant_{self.tenant_id}'
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()
        logger.info(f"Billing WebSocket connected for tenant {self.tenant_id}")
        await self.send_initial_status()
    
    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
        logger.info(f"Billing WebSocket disconnected for tenant {self.tenant_id}")
    
    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            action = data.get('action')
            handlers = {
                'ping': self._handle_ping,
                'get_subscription': self._handle_get_subscription,
                'get_invoices': self._handle_get_invoices,
                'get_quota': self._handle_get_quota,
                'get_payment_methods': self._handle_get_payment_methods,
                'subscribe_updates': self._handle_subscribe_updates,
            }
            
            handler = handlers.get(action)
            if handler:
                await handler(data)
            else:
                await self.send(text_data=json.dumps({
                    'type': 'error',
                    'error': f'Unknown action: {action}',
                    'timestamp': timezone.now().isoformat()
                }))
                
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'error': 'Invalid JSON',
                'timestamp': timezone.now().isoformat()
            }))
        except Exception as e:
            logger.error(f"Error in BillingConsumer.receive: {str(e)}")
            await self.send(text_data=json.dumps({
                'type': 'error',
                'error': 'Internal server error',
                'timestamp': timezone.now().isoformat()
            }))
    
    async def subscription_updated(self, event):
        await self.send(text_data=json.dumps({
            'type': 'subscription_updated',
            'data': event.get('data', {}),
            'timestamp': event.get('timestamp', timezone.now().isoformat())
        }))
    
    async def invoice_created(self, event):
        await self.send(text_data=json.dumps({
            'type': 'invoice_created',
            'data': event.get('data', {}),
            'timestamp': event.get('timestamp', timezone.now().isoformat())
        }))
    
    async def invoice_paid(self, event):
        await self.send(text_data=json.dumps({
            'type': 'invoice_paid',
            'data': event.get('data', {}),
            'timestamp': event.get('timestamp', timezone.now().isoformat())
        }))
    
    async def payment_received(self, event):
        await self.send(text_data=json.dumps({
            'type': 'payment_received',
            'data': event.get('data', {}),
            'timestamp': event.get('timestamp', timezone.now().isoformat())
        }))
    
    async def payment_failed(self, event):
        await self.send(text_data=json.dumps({
            'type': 'payment_failed',
            'data': event.get('data', {}),
            'timestamp': event.get('timestamp', timezone.now().isoformat())
        }))
    
    async def quota_alert(self, event):
        await self.send(text_data=json.dumps({
            'type': 'quota_alert',
            'data': event.get('data', {}),
            'timestamp': event.get('timestamp', timezone.now().isoformat())
        }))
    
    async def trial_ending(self, event):
        await self.send(text_data=json.dumps({
            'type': 'trial_ending',
            'data': event.get('data', {}),
            'timestamp': event.get('timestamp', timezone.now().isoformat())
        }))
    
    async def upcoming_invoice(self, event):
        await self.send(text_data=json.dumps({
            'type': 'upcoming_invoice',
            'data': event.get('data', {}),
            'timestamp': event.get('timestamp', timezone.now().isoformat())
        }))
    
    async def _handle_ping(self, data):
        await self.send(text_data=json.dumps({
            'type': 'pong',
            'timestamp': timezone.now().isoformat()
        }))
    
    async def _handle_get_subscription(self, data):
        data = await self._get_subscription_data()
        await self.send(text_data=json.dumps({
            'type': 'subscription_status',
            'data': data,
            'timestamp': timezone.now().isoformat()
        }))
    
    async def _handle_get_invoices(self, data):
        limit = data.get('limit', 10)
        data = await self._get_recent_invoices(limit)
        await self.send(text_data=json.dumps({
            'type': 'recent_invoices',
            'data': data,
            'timestamp': timezone.now().isoformat()
        }))
    
    async def _handle_get_quota(self, data):
        data = await self._get_quota_data()
        await self.send(text_data=json.dumps({
            'type': 'quota_status',
            'data': data,
            'timestamp': timezone.now().isoformat()
        }))
    
    async def _handle_get_payment_methods(self, data):
        data = await self._get_payment_methods_data()
        await self.send(text_data=json.dumps({
            'type': 'payment_methods',
            'data': data,
            'timestamp': timezone.now().isoformat()
        }))
    
    async def _handle_subscribe_updates(self, data):
        channels = data.get('channels', ['all'])
        self.subscribed_channels = channels
        await self.send(text_data=json.dumps({
            'type': 'subscription_confirmed',
            'channels': channels,
            'timestamp': timezone.now().isoformat()
        }))
    
    async def send_initial_status(self):
        await self._handle_get_subscription({})
        await self._handle_get_quota({})
    
    def _get_tenant_id(self):
        if hasattr(self.scope, 'tenant') and self.scope.tenant:
            return str(self.scope.tenant.id)
        if hasattr(self.user, 'tenant_id') and self.user.tenant_id:
            return str(self.user.tenant_id)
        return None
    
    @database_sync_to_async
    def _get_subscription_data(self):
        from apps.tenant.models import Client
        from apps.billing.services.subscription_service import SubscriptionService
        try:
            tenant = Client.objects.get(id=self.tenant_id)
            service = SubscriptionService()
            return service.get_subscription_status(tenant)
        except Exception as e:
            logger.error(f"Error getting subscription data: {str(e)}")
            return {'error': str(e)}
    
    @database_sync_to_async
    def _get_recent_invoices(self, limit=10):
        from apps.billing.models import Invoice
        invoices = Invoice.objects.filter(
            tenant_id=self.tenant_id,
            is_deleted=False
        ).order_by('-invoice_date')[:limit]
        return [
            {
                'id': str(inv.id),
                'number': inv.invoice_number,
                'amount': str(inv.amount_due),
                'currency': inv.currency,
                'status': inv.status,
                'date': inv.invoice_date.isoformat() if inv.invoice_date else None,
                'pdf_url': inv.invoice_pdf_url,
                'is_overdue': inv.is_overdue
            }
            for inv in invoices
        ]
    
    @database_sync_to_async
    def _get_quota_data(self):
        from apps.tenant.models import Client
        from apps.billing.services.quota_service import QuotaService
        
        try:
            tenant = Client.objects.get(id=self.tenant_id)
            service = QuotaService()
            return service.get_quota_status(tenant)
        except Exception as e:
            logger.error(f"Error getting quota data: {str(e)}")
            return {'error': str(e)}
    
    @database_sync_to_async
    def _get_payment_methods_data(self):
        from apps.tenant.models import Client
        from apps.billing.models import PaymentMethod
        
        try:
            tenant = Client.objects.get(id=self.tenant_id)
            methods = PaymentMethod.objects.filter(
                tenant=tenant,
                is_active=True,
                is_deleted=False
            ).order_by('-is_default', '-created_at')
            return [
                {
                    'id': str(m.id),
                    'type': m.method_type,
                    'last4': m.last4,
                    'brand': m.brand,
                    'is_default': m.is_default,
                    'expiry_month': m.exp_month,
                    'expiry_year': m.exp_year,
                    'billing_email': m.billing_email,
                    'billing_name': m.billing_name,
                    'is_expiring_soon': m.is_expiring_soon
                }
                for m in methods
            ]
        except Exception as e:
            logger.error(f"Error getting payment methods: {str(e)}")
            return []

class InvoiceConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope.get('user')
        self.tenant_id = self._get_tenant_id()
        
        if not self.user or not self.user.is_authenticated or not self.tenant_id:
            await self.close(code=4001)
            return
        
        self.room_group_name = f'invoice_tenant_{self.tenant_id}'
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()
        logger.info(f"Invoice WebSocket connected for tenant {self.tenant_id}")
    
    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
    
    async def invoice_paid(self, event):
        await self.send(text_data=json.dumps({
            'type': 'invoice_paid',
            'invoice_id': event.get('invoice_id'),
            'invoice_number': event.get('invoice_number'),
            'amount': event.get('amount'),
            'currency': event.get('currency'),
            'timestamp': timezone.now().isoformat()
        }))
    
    async def invoice_overdue(self, event):
        await self.send(text_data=json.dumps({
            'type': 'invoice_overdue',
            'invoice_id': event.get('invoice_id'),
            'invoice_number': event.get('invoice_number'),
            'due_date': event.get('due_date'),
            'amount': event.get('amount'),
            'timestamp': timezone.now().isoformat()
        }))
    
    async def invoice_created(self, event):
        await self.send(text_data=json.dumps({
            'type': 'invoice_created',
            'invoice_id': event.get('invoice_id'),
            'invoice_number': event.get('invoice_number'),
            'amount': event.get('amount'),
            'due_date': event.get('due_date'),
            'timestamp': timezone.now().isoformat()
        }))
    
    def _get_tenant_id(self):
        if hasattr(self.scope, 'tenant') and self.scope.tenant:
            return str(self.scope.tenant.id)
        if hasattr(self.user, 'tenant_id') and self.user.tenant_id:
            return str(self.user.tenant_id)
        return None


class PaymentConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope.get('user')
        self.tenant_id = self._get_tenant_id()
        
        if not self.user or not self.user.is_authenticated or not self.tenant_id:
            await self.close(code=4001)
            return
        
        self.room_group_name = f'payment_tenant_{self.tenant_id}'
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()
        logger.info(f"Payment WebSocket connected for tenant {self.tenant_id}")
    
    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
    
    async def payment_succeeded(self, event):
        await self.send(text_data=json.dumps({
            'type': 'payment_succeeded',
            'payment_id': event.get('payment_id'),
            'amount': event.get('amount'),
            'currency': event.get('currency'),
            'receipt_url': event.get('receipt_url'),
            'timestamp': timezone.now().isoformat()
        }))
    
    async def payment_failed(self, event):
        await self.send(text_data=json.dumps({
            'type': 'payment_failed',
            'payment_id': event.get('payment_id'),
            'amount': event.get('amount'),
            'currency': event.get('currency'),
            'failure_reason': event.get('failure_reason'),
            'timestamp': timezone.now().isoformat()
        }))
    
    def _get_tenant_id(self):
        if hasattr(self.scope, 'tenant') and self.scope.tenant:
            return str(self.scope.tenant.id)
        if hasattr(self.user, 'tenant_id') and self.user.tenant_id:
            return str(self.user.tenant_id)
        return None