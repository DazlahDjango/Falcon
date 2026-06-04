import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.utils import timezone
from django.core.cache import cache
from .models import Subscription, Transaction, Invoice, WebhookEventLog
from .constants import SubscriptionStatus, TransactionStatus
logger = logging.getLogger(__name__)
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from apps.accounts.models import User

class BillingConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Extract token from query string
        query_string = self.scope['query_string'].decode()
        token = None
        for param in query_string.split('&'):
            if param.startswith('token='):
                token = param.split('=')[1]
                break
        
        if not token:
            logger.warning("WebSocket connection rejected: No token provided")
            await self.close()
            return
        
        # Validate token and get user
        user = await self.get_user_from_token(token)
        if not user:
            logger.warning(f"WebSocket connection rejected: Invalid token")
            await self.close()
            return
        
        # Get tenant_id from URL
        tenant_id = self.scope['url_route']['kwargs'].get('tenant_id')
        
        # Verify user belongs to tenant
        if str(user.tenant_id) != str(tenant_id):
            logger.warning(f"User {user.id} attempted to access tenant {tenant_id}")
            await self.close()
            return
        
        self.user = user
        self.tenant_id = tenant_id
        self.tenant_group = f"tenant_{tenant_id}_billing"
        self.user_group = f"user_{user.id}_billing"
        
        await self.channel_layer.group_add(self.tenant_group, self.channel_name)
        await self.channel_layer.group_add(self.user_group, self.channel_name)
        await self.accept()
        await self.send_initial_state()
        
        logger.info(f"Billing WebSocket connected: user={user.email}, tenant={tenant_id}")
    
    @database_sync_to_async
    def get_user_from_token(self, token):
        try:
            access_token = AccessToken(token)
            user_id = access_token.get('user_id')
            return User.objects.get(id=user_id)
        except (InvalidToken, TokenError, User.DoesNotExist) as e:
            logger.error(f"Token validation failed: {str(e)}")
            return None
    
    async def disconnect(self, close_code):
        if hasattr(self, 'tenant_group'):
            await self.channel_layer.group_discard(self.tenant_group, self.channel_name)
        if hasattr(self, 'user_group'):
            await self.channel_layer.group_discard(self.user_group, self.channel_name)
    
    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            msg_type = data.get('type')
            if msg_type == 'ping':
                await self.send(text_data=json.dumps({'type': 'pong', 'timestamp': str(timezone.now())}))
            elif msg_type == 'get_subscription_status':
                await self.send_subscription_status()
            elif msg_type == 'get_recent_transactions':
                await self.send_recent_transactions(data.get('limit', 10))
            elif msg_type == 'get_invoice_status':
                await self.send_invoice_status(data.get('invoice_id'))
        except Exception as e:
            logger.error(f"WebSocket receive error: {str(e)}")
    
    async def send_initial_state(self):
        subscription = await self.get_current_subscription()
        transactions = await self.get_recent_transactions(5)
        invoices = await self.get_pending_invoices()
        await self.send(text_data=json.dumps({
            'type': 'initial_state',
            'data': {
                'subscription': subscription,
                'recent_transactions': transactions,
                'pending_invoices': invoices,
                'timestamp': str(timezone.now())
            }
        }))
    
    async def send_subscription_status(self):
        subscription = await self.get_current_subscription()
        await self.send(text_data=json.dumps({'type': 'subscription_status', 'data': subscription}))
    
    async def send_recent_transactions(self, limit):
        transactions = await self.get_recent_transactions(limit)
        await self.send(text_data=json.dumps({'type': 'recent_transactions', 'data': transactions}))
    
    async def send_invoice_status(self, invoice_id):
        invoice = await self.get_invoice(invoice_id)
        await self.send(text_data=json.dumps({'type': 'invoice_status', 'data': invoice}))
    
    async def payment_success(self, event):
        await self.send(text_data=json.dumps({'type': 'payment_success', 'data': event.get('data', {}), 'timestamp': str(timezone.now())}))
    
    async def payment_failed(self, event):
        await self.send(text_data=json.dumps({'type': 'payment_failed', 'data': event.get('data', {}), 'timestamp': str(timezone.now())}))
    
    async def subscription_updated(self, event):
        await self.send(text_data=json.dumps({'type': 'subscription_updated', 'data': event.get('data', {}), 'timestamp': str(timezone.now())}))
    
    async def invoice_ready(self, event):
        await self.send(text_data=json.dumps({'type': 'invoice_ready', 'data': event.get('data', {}), 'timestamp': str(timezone.now())}))
    
    async def trial_ending(self, event):
        await self.send(text_data=json.dumps({'type': 'trial_ending', 'data': event.get('data', {}), 'timestamp': str(timezone.now())}))
    
    @database_sync_to_async
    def get_current_subscription(self):
        from apps.billing.models import Subscription
        try:
            sub = Subscription.objects.get_current_for_tenant(self.tenant_id)
            if sub:
                return {
                    'id': str(sub.id),
                    'subscription_code': sub.subscription_code,
                    'plan_name': sub.plan.name,
                    'plan_type': sub.plan.plan_type,
                    'status': sub.status,
                    'amount': sub.amount,
                    'currency': sub.currency,
                    'current_period_end': sub.current_period_end.isoformat(),
                    'is_active': sub.is_active,
                    'is_on_trial': sub.is_on_trial,
                    'trial_days_remaining': sub.trial_days_remaining,
                    'days_until_expiry': sub.days_until_expiry,
                    'auto_renew': sub.auto_renew,
                    'cancel_at_period_end': sub.cancel_at_period_end
                }
            return None
        except Exception as e:
            logger.error(f"get_current_subscription error: {str(e)}")
            return None
    
    @database_sync_to_async
    def get_recent_transactions(self, limit):
        from apps.billing.models import Transaction
        try:
            txs = Transaction.objects.filter(tenant_id=self.tenant_id).order_by('-created_at')[:limit]
            return [{'id': str(t.id), 'reference': t.reference, 'transaction_type': t.transaction_type, 'amount': t.amount, 'total_amount': t.total_amount, 'currency': t.currency, 'status': t.status, 'payment_date': t.payment_date.isoformat() if t.payment_date else None, 'created_at': t.created_at.isoformat()} for t in txs]
        except Exception as e:
            logger.error(f"get_recent_transactions error: {str(e)}")
            return []
    
    @database_sync_to_async
    def get_pending_invoices(self):
        from apps.billing.models import Invoice
        try:
            invs = Invoice.objects.filter(tenant_id=self.tenant_id, status__in=['pending', 'overdue']).order_by('due_date')
            return [{'id': str(i.id), 'invoice_number': i.invoice_number, 'total_amount': i.total_amount, 'currency': i.currency, 'due_date': i.due_date.isoformat(), 'status': i.status, 'is_overdue': i.is_overdue} for i in invs]
        except Exception as e:
            logger.error(f"get_pending_invoices error: {str(e)}")
            return []
    
    @database_sync_to_async
    def get_invoice(self, invoice_id):
        from apps.billing.models import Invoice
        try:
            inv = Invoice.objects.get(id=invoice_id)
            if str(inv.tenant_id) != str(self.tenant_id):
                return {'error': 'Unauthorized'}
            return {'id': str(inv.id), 'invoice_number': inv.invoice_number, 'subtotal': inv.subtotal, 'tax_amount': inv.tax_amount, 'total_amount': inv.total_amount, 'currency': inv.currency, 'status': inv.status, 'invoice_date': inv.invoice_date.isoformat(), 'due_date': inv.due_date.isoformat(), 'paid_at': inv.paid_at.isoformat() if inv.paid_at else None, 'line_items': inv.line_items, 'pdf_url': inv.pdf_url}
        except Exception as e:
            logger.error(f"get_invoice error: {str(e)}")
            return {'error': 'Invoice not found'}

class AdminBillingConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope.get('user')
        if not self.user or not self.user.is_authenticated or (self.user.role != 'super_admin' and not self.user.is_superuser):
            await self.close()
            return
        self.admin_group = "admin_billing"
        await self.channel_layer.group_add(self.admin_group, self.channel_name)
        await self.accept()
        await self.send_initial_metrics()

    async def disconnect(self, close_code):
        if hasattr(self, 'admin_group'):
            await self.channel_layer.group_discard(self.admin_group, self.channel_name)

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            msg_type = data.get('type')
            if msg_type == 'ping':
                await self.send(text_data=json.dumps({'type': 'pong'}))
            elif msg_type == 'get_metrics':
                await self.send_system_metrics()
            elif msg_type == 'get_recent_webhooks':
                await self.send_recent_webhooks(data.get('limit', 20))
            elif msg_type == 'get_failed_transactions':
                await self.send_failed_transactions(data.get('limit', 20))
        except Exception as e:
            logger.error(f"Admin WebSocket error: {str(e)}")

    async def send_initial_metrics(self):
        metrics = await self.get_system_metrics()
        await self.send(text_data=json.dumps({'type': 'initial_metrics', 'data': metrics, 'timestamp': str(timezone.now())}))

    async def send_system_metrics(self):
        metrics = await self.get_system_metrics()
        await self.send(text_data=json.dumps({'type': 'system_metrics', 'data': metrics}))

    async def send_recent_webhooks(self, limit):
        webhooks = await self.get_recent_webhooks(limit)
        await self.send(text_data=json.dumps({'type': 'recent_webhooks', 'data': webhooks}))

    async def send_failed_transactions(self, limit):
        txs = await self.get_failed_transactions(limit)
        await self.send(text_data=json.dumps({'type': 'failed_transactions', 'data': txs}))

    async def new_transaction(self, event):
        await self.send(text_data=json.dumps({'type': 'new_transaction', 'data': event.get('data', {}), 'timestamp': str(timezone.now())}))

    async def webhook_received(self, event):
        await self.send(text_data=json.dumps({'type': 'webhook_received', 'data': event.get('data', {}), 'timestamp': str(timezone.now())}))

    async def system_alert(self, event):
        await self.send(text_data=json.dumps({'type': 'system_alert', 'data': event.get('data', {}), 'severity': event.get('severity', 'info'), 'timestamp': str(timezone.now())}))

    @database_sync_to_async
    def get_system_metrics(self):
        from django.db.models import Count, Sum, Q
        thirty_days_ago = timezone.now() - timezone.timedelta(days=30)
        total_txs = Transaction.objects.all().count()
        success_txs = Transaction.objects.filter(status=TransactionStatus.SUCCESS).count()
        failed_txs = Transaction.objects.filter(status=TransactionStatus.FAILED).count()
        revenue_30d = Transaction.objects.filter(status=TransactionStatus.SUCCESS, created_at__gte=thirty_days_ago).aggregate(total=Sum('total_amount'))['total'] or 0
        active_subs = Subscription.objects.filter(status=SubscriptionStatus.ACTIVE).count()
        trialing_subs = Subscription.objects.filter(status=SubscriptionStatus.TRIALING).count()
        webhooks_24h = WebhookEventLog.objects.filter(created_at__gte=timezone.now() - timezone.timedelta(hours=24)).count()
        failed_webhooks = WebhookEventLog.objects.filter(processing_status='failed', created_at__gte=timezone.now() - timezone.timedelta(hours=24)).count()
        return {'transactions': {'total': total_txs, 'successful': success_txs, 'failed': failed_txs, 'success_rate': (success_txs / total_txs * 100) if total_txs > 0 else 0}, 'revenue': {'last_30_days': revenue_30d, 'currency': 'KES'}, 'subscriptions': {'active': active_subs, 'trialing': trialing_subs, 'total': active_subs + trialing_subs}, 'webhooks': {'last_24h': webhooks_24h, 'failed_24h': failed_webhooks, 'success_rate': ((webhooks_24h - failed_webhooks) / webhooks_24h * 100) if webhooks_24h > 0 else 0}}

    @database_sync_to_async
    def get_recent_webhooks(self, limit):
        webhooks = WebhookEventLog.objects.all().order_by('-created_at')[:limit]
        return [{'id': str(w.id), 'event_type': w.event_type, 'processing_status': w.processing_status, 'created_at': w.created_at.isoformat(), 'signature_valid': w.signature_valid, 'retry_count': w.retry_count} for w in webhooks]

    @database_sync_to_async
    def get_failed_transactions(self, limit):
        txs = Transaction.objects.filter(status=TransactionStatus.FAILED).order_by('-created_at')[:limit]
        return [{'id': str(t.id), 'reference': t.reference, 'amount': t.amount, 'currency': t.currency, 'error_message': t.error_message, 'created_at': t.created_at.isoformat()} for t in txs]