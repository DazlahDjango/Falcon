import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.utils import timezone
from django.core.cache import cache
from .models import Subscription, Transaction, Invoice
from .constants import SubscriptionStatus, TransactionStatus
logger = logging.getLogger(__name__)

class BillingConsumer(AsyncWebsocketConsumer):
    """
    Base billing consumer with authentication and tenant isolation.
    """
    async def connect(self):
        """Handle WebSocket connection."""
        self.user = self.scope.get('user')
        self.tenant_id = self.scope.get('tenant_id')
        
        # Authentication check
        if not self.user or not self.user.is_authenticated:
            logger.warning(f"Unauthorized WebSocket connection attempt")
            await self.close()
            return
        
        # Tenant isolation check
        if not self.tenant_id:
            logger.warning(f"User {self.user.id} attempted connection without tenant context")
            await self.close()
            return
        
        # Check if user belongs to tenant
        if str(self.user.tenant_id) != str(self.tenant_id):
            logger.warning(f"User {self.user.id} attempted to access tenant {self.tenant_id}")
            await self.close()
            return
        
        # Join tenant-specific group
        self.tenant_group = f"tenant_{self.tenant_id}_billing"
        self.user_group = f"user_{self.user.id}_billing"
        
        await self.channel_layer.group_add(self.tenant_group, self.channel_name)
        await self.channel_layer.group_add(self.user_group, self.channel_name)
        
        await self.accept()
        
        logger.info(f"Billing WebSocket connected: user={self.user.id}, tenant={self.tenant_id}")
        
        # Send initial state
        await self.send_initial_state()
    
    async def disconnect(self, close_code):
        """Handle WebSocket disconnection."""
        if hasattr(self, 'tenant_group'):
            await self.channel_layer.group_discard(self.tenant_group, self.channel_name)
        if hasattr(self, 'user_group'):
            await self.channel_layer.group_discard(self.user_group, self.channel_name)
        
        logger.info(f"Billing WebSocket disconnected: user={self.user.id if self.user else 'unknown'}")
    
    async def receive(self, text_data):
        """Handle incoming WebSocket messages."""
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            if message_type == 'ping':
                await self.send(text_data=json.dumps({'type': 'pong', 'timestamp': str(timezone.now())}))
            
            elif message_type == 'get_subscription_status':
                await self.send_subscription_status()
            
            elif message_type == 'get_recent_transactions':
                limit = data.get('limit', 10)
                await self.send_recent_transactions(limit)
            
            elif message_type == 'get_invoice_status':
                invoice_id = data.get('invoice_id')
                await self.send_invoice_status(invoice_id)
            
            else:
                logger.warning(f"Unknown WebSocket message type: {message_type}")
                
        except json.JSONDecodeError:
            logger.error(f"Invalid JSON received: {text_data}")
        except Exception as e:
            logger.error(f"Error processing WebSocket message: {str(e)}")
    
    async def send_initial_state(self):
        """Send initial billing state to client."""
        subscription = await self.get_current_subscription()
        recent_transactions = await self.get_recent_transactions(5)
        pending_invoices = await self.get_pending_invoices()
        
        await self.send(text_data=json.dumps({
            'type': 'initial_state',
            'data': {
                'subscription': subscription,
                'recent_transactions': recent_transactions,
                'pending_invoices': pending_invoices,
                'timestamp': str(timezone.now())
            }
        }))
    
    async def send_subscription_status(self):
        """Send current subscription status."""
        subscription = await self.get_current_subscription()
        
        await self.send(text_data=json.dumps({
            'type': 'subscription_status',
            'data': subscription
        }))
    
    async def send_recent_transactions(self, limit: int):
        """Send recent transactions."""
        transactions = await self.get_recent_transactions(limit)
        
        await self.send(text_data=json.dumps({
            'type': 'recent_transactions',
            'data': transactions
        }))
    
    async def send_invoice_status(self, invoice_id: str):
        """Send specific invoice status."""
        invoice = await self.get_invoice(invoice_id)
        
        await self.send(text_data=json.dumps({
            'type': 'invoice_status',
            'data': invoice
        }))
    
    # Group message handlers (for real-time updates)
    
    async def payment_success(self, event):
        """Handle payment success notification."""
        await self.send(text_data=json.dumps({
            'type': 'payment_success',
            'data': event.get('data', {}),
            'timestamp': str(timezone.now())
        }))
    
    async def payment_failed(self, event):
        """Handle payment failure notification."""
        await self.send(text_data=json.dumps({
            'type': 'payment_failed',
            'data': event.get('data', {}),
            'timestamp': str(timezone.now())
        }))
    
    async def subscription_updated(self, event):
        """Handle subscription update notification."""
        await self.send(text_data=json.dumps({
            'type': 'subscription_updated',
            'data': event.get('data', {}),
            'timestamp': str(timezone.now())
        }))
    
    async def invoice_ready(self, event):
        """Handle invoice ready notification."""
        await self.send(text_data=json.dumps({
            'type': 'invoice_ready',
            'data': event.get('data', {}),
            'timestamp': str(timezone.now())
        }))
    
    async def trial_ending(self, event):
        """Handle trial ending notification."""
        await self.send(text_data=json.dumps({
            'type': 'trial_ending',
            'data': event.get('data', {}),
            'timestamp': str(timezone.now())
        }))
    
    # Database helpers (async)
    
    @database_sync_to_async
    def get_current_subscription(self):
        """Get current subscription for tenant."""
        try:
            subscription = Subscription.objects.get_current_for_tenant(self.tenant_id)
            if subscription:
                return {
                    'id': str(subscription.id),
                    'subscription_code': subscription.subscription_code,
                    'plan_name': subscription.plan.name,
                    'plan_type': subscription.plan.plan_type,
                    'status': subscription.status,
                    'amount': subscription.amount,
                    'currency': subscription.currency,
                    'current_period_end': subscription.current_period_end.isoformat(),
                    'is_active': subscription.is_active,
                    'is_on_trial': subscription.is_on_trial,
                    'trial_days_remaining': subscription.trial_days_remaining,
                    'days_until_expiry': subscription.days_until_expiry,
                    'auto_renew': subscription.auto_renew,
                    'cancel_at_period_end': subscription.cancel_at_period_end
                }
            return None
        except Exception as e:
            logger.error(f"Error getting subscription: {str(e)}")
            return None
    
    @database_sync_to_async
    def get_recent_transactions(self, limit: int):
        """Get recent transactions for tenant."""
        try:
            transactions = Transaction.objects.get_by_tenant(self.tenant_id)[:limit]
            return [
                {
                    'id': str(t.id),
                    'reference': t.reference,
                    'transaction_type': t.transaction_type,
                    'amount': t.amount,
                    'total_amount': t.total_amount,
                    'currency': t.currency,
                    'status': t.status,
                    'payment_date': t.payment_date.isoformat() if t.payment_date else None,
                    'created_at': t.created_at.isoformat()
                }
                for t in transactions
            ]
        except Exception as e:
            logger.error(f"Error getting transactions: {str(e)}")
            return []
    
    @database_sync_to_async
    def get_pending_invoices(self):
        """Get pending invoices for tenant."""
        try:
            invoices = Invoice.objects.get_unpaid_invoices_for_tenant(self.tenant_id)
            return [
                {
                    'id': str(i.id),
                    'invoice_number': i.invoice_number,
                    'total_amount': i.total_amount,
                    'currency': i.currency,
                    'due_date': i.due_date.isoformat(),
                    'status': i.status,
                    'is_overdue': i.is_overdue
                }
                for i in invoices
            ]
        except Exception as e:
            logger.error(f"Error getting invoices: {str(e)}")
            return []
    
    @database_sync_to_async
    def get_invoice(self, invoice_id: str):
        """Get specific invoice."""
        try:
            invoice = Invoice.objects.get_by_id(invoice_id)
            if str(invoice.tenant_id) != str(self.tenant_id):
                return {'error': 'Unauthorized'}
            
            return {
                'id': str(invoice.id),
                'invoice_number': invoice.invoice_number,
                'subtotal': invoice.subtotal,
                'tax_amount': invoice.tax_amount,
                'total_amount': invoice.total_amount,
                'currency': invoice.currency,
                'status': invoice.status,
                'invoice_date': invoice.invoice_date.isoformat(),
                'due_date': invoice.due_date.isoformat(),
                'paid_at': invoice.paid_at.isoformat() if invoice.paid_at else None,
                'line_items': invoice.line_items,
                'pdf_url': invoice.pdf_url
            }
        except Exception as e:
            logger.error(f"Error getting invoice {invoice_id}: {str(e)}")
            return {'error': 'Invoice not found'}


class AdminBillingConsumer(AsyncWebsocketConsumer):
    """
    Admin WebSocket consumer for real-time billing monitoring.
    Only accessible by Falcon admin users.
    """
    
    async def connect(self):
        """Handle admin WebSocket connection."""
        self.user = self.scope.get('user')
        
        # Authentication check
        if not self.user or not self.user.is_authenticated:
            await self.close()
            return
        
        # Admin check
        if not self.user.role == 'super_admin' and not self.user.is_superuser:
            logger.warning(f"Non-admin user {self.user.id} attempted admin WebSocket connection")
            await self.close()
            return
        
        # Join admin group
        self.admin_group = "admin_billing"
        await self.channel_layer.group_add(self.admin_group, self.channel_name)
        
        await self.accept()
        
        logger.info(f"Admin billing WebSocket connected: user={self.user.id}")
        
        # Send initial metrics
        await self.send_initial_metrics()
    
    async def disconnect(self, close_code):
        """Handle disconnection."""
        if hasattr(self, 'admin_group'):
            await self.channel_layer.group_discard(self.admin_group, self.channel_name)
    
    async def receive(self, text_data):
        """Handle admin WebSocket messages."""
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            if message_type == 'ping':
                await self.send(text_data=json.dumps({'type': 'pong'}))
            
            elif message_type == 'get_metrics':
                await self.send_system_metrics()
            
            elif message_type == 'get_recent_webhooks':
                limit = data.get('limit', 20)
                await self.send_recent_webhooks(limit)
            
            elif message_type == 'get_failed_transactions':
                limit = data.get('limit', 20)
                await self.send_failed_transactions(limit)
                
        except Exception as e:
            logger.error(f"Error processing admin WebSocket message: {str(e)}")
    
    async def send_initial_metrics(self):
        """Send initial system metrics."""
        metrics = await self.get_system_metrics()
        
        await self.send(text_data=json.dumps({
            'type': 'initial_metrics',
            'data': metrics,
            'timestamp': str(timezone.now())
        }))
    
    async def send_system_metrics(self):
        """Send current system metrics."""
        metrics = await self.get_system_metrics()
        
        await self.send(text_data=json.dumps({
            'type': 'system_metrics',
            'data': metrics
        }))
    
    async def send_recent_webhooks(self, limit: int):
        """Send recent webhook events."""
        webhooks = await self.get_recent_webhooks(limit)
        
        await self.send(text_data=json.dumps({
            'type': 'recent_webhooks',
            'data': webhooks
        }))
    
    async def send_failed_transactions(self, limit: int):
        """Send failed transactions."""
        transactions = await self.get_failed_transactions(limit)
        
        await self.send(text_data=json.dumps({
            'type': 'failed_transactions',
            'data': transactions
        }))
    
    # Group message handlers
    
    async def new_transaction(self, event):
        """Broadcast new transaction to admin."""
        await self.send(text_data=json.dumps({
            'type': 'new_transaction',
            'data': event.get('data', {}),
            'timestamp': str(timezone.now())
        }))
    
    async def webhook_received(self, event):
        """Broadcast webhook receipt to admin."""
        await self.send(text_data=json.dumps({
            'type': 'webhook_received',
            'data': event.get('data', {}),
            'timestamp': str(timezone.now())
        }))
    
    async def system_alert(self, event):
        """Broadcast system alert to admin."""
        await self.send(text_data=json.dumps({
            'type': 'system_alert',
            'data': event.get('data', {}),
            'severity': event.get('severity', 'info'),
            'timestamp': str(timezone.now())
        }))
    
    # Database helpers
    
    @database_sync_to_async
    def get_system_metrics(self):
        """Get system billing metrics."""
        from django.db.models import Count, Sum, Q
        
        # Transaction metrics
        total_transactions = Transaction.objects.all().count()
        successful_transactions = Transaction.objects.filter(status=TransactionStatus.SUCCESS).count()
        failed_transactions = Transaction.objects.filter(status=TransactionStatus.FAILED).count()
        
        # Revenue metrics (last 30 days)
        thirty_days_ago = timezone.now() - timezone.timedelta(days=30)
        revenue_30d = Transaction.objects.filter(
            status=TransactionStatus.SUCCESS,
            created_at__gte=thirty_days_ago
        ).aggregate(total=Sum('total_amount'))['total'] or 0
        
        # Subscription metrics
        active_subscriptions = Subscription.objects.filter(status=SubscriptionStatus.ACTIVE).count()
        trialing_subscriptions = Subscription.objects.filter(status=SubscriptionStatus.TRIALING).count()
        
        # Webhook metrics
        from .models import WebhookEventLog
        webhooks_24h = WebhookEventLog.objects.filter(
            created_at__gte=timezone.now() - timezone.timedelta(hours=24)
        ).count()
        
        failed_webhooks = WebhookEventLog.objects.filter(
            processing_status='failed',
            created_at__gte=timezone.now() - timezone.timedelta(hours=24)
        ).count()
        
        return {
            'transactions': {
                'total': total_transactions,
                'successful': successful_transactions,
                'failed': failed_transactions,
                'success_rate': (successful_transactions / total_transactions * 100) if total_transactions > 0 else 0
            },
            'revenue': {
                'last_30_days': revenue_30d,
                'currency': 'KES'
            },
            'subscriptions': {
                'active': active_subscriptions,
                'trialing': trialing_subscriptions,
                'total': active_subscriptions + trialing_subscriptions
            },
            'webhooks': {
                'last_24h': webhooks_24h,
                'failed_24h': failed_webhooks,
                'success_rate': ((webhooks_24h - failed_webhooks) / webhooks_24h * 100) if webhooks_24h > 0 else 0
            }
        }
    
    @database_sync_to_async
    def get_recent_webhooks(self, limit: int):
        """Get recent webhook events."""
        from .models import WebhookEventLog
        
        webhooks = WebhookEventLog.objects.all().order_by('-created_at')[:limit]
        
        return [
            {
                'id': str(w.id),
                'event_type': w.event_type,
                'processing_status': w.processing_status,
                'created_at': w.created_at.isoformat(),
                'signature_valid': w.signature_valid,
                'retry_count': w.retry_count
            }
            for w in webhooks
        ]
    
    @database_sync_to_async
    def get_failed_transactions(self, limit: int):
        """Get failed transactions."""
        transactions = Transaction.objects.filter(
            status=TransactionStatus.FAILED
        ).order_by('-created_at')[:limit]
        
        return [
            {
                'id': str(t.id),
                'reference': t.reference,
                'amount': t.amount,
                'currency': t.currency,
                'error_message': t.error_message,
                'created_at': t.created_at.isoformat()
            }
            for t in transactions
        ]