import logging
from typing import Dict, Any, Optional
from django.utils import timezone
from django.db import transaction
from ...models import Transaction, Subscription, Invoice, WebhookEventLog, PaymentMethod, BillingAuditLog
from ...exceptions import WebhookProcessingError
from ...utils import generate_idempotency_key, serialize_for_audit
from .client import PayStackClient

logger = logging.getLogger(__name__)

class WebhookHandler:
    def __init__(self):
        self.client = PayStackClient()

    @transaction.atomic
    def handle_charge_success(self, event_data: Dict[str, Any], webhook_log: WebhookEventLog) -> Optional[Transaction]:
        logger.info("Processing charge.success webhook")
        data = event_data.get('data', {})
        reference = data.get('reference')
        if not reference:
            logger.error("charge.success webhook missing reference")
            raise WebhookProcessingError("Missing transaction reference")
        transaction_obj = Transaction.objects.get_by_reference(reference)
        if not transaction_obj:
            logger.info(f"Creating transaction from webhook: {reference}")
            transaction_obj = Transaction.objects.create(tenant_id=data.get('metadata', {}).get('tenant_id', 'unknown'), reference=reference, paystack_reference=data.get('transaction_reference'), amount=data.get('amount', 0), total_amount=data.get('amount', 0), currency=data.get('currency', 'KES'), status=Transaction.STATUS_SUCCESS, payment_method=data.get('channel'), card_last4=data.get('authorization', {}).get('last4', ''), card_brand=data.get('authorization', {}).get('brand', ''), payment_date=timezone.now(), paystack_response=event_data, metadata={'source': 'webhook'})
        transaction_obj.status = Transaction.STATUS_SUCCESS
        transaction_obj.paystack_reference = data.get('transaction_reference')
        transaction_obj.payment_date = timezone.now()
        transaction_obj.paystack_response = event_data
        transaction_obj.save()
        if transaction_obj.subscription:
            sub = transaction_obj.subscription
            sub.last_payment_date = timezone.now()
            if sub.status == Subscription.STATUS_PAST_DUE:
                sub.activate()
            sub.save()
        if transaction_obj.invoice:
            invoice = transaction_obj.invoice
            if invoice.status != Invoice.STATUS_PAID:
                invoice.mark_paid()
        auth_data = data.get('authorization', {})
        if auth_data.get('authorization_code'):
            PaymentMethod.objects.update_or_create(authorization_code=auth_data['authorization_code'], defaults={'tenant_id': transaction_obj.tenant_id, 'customer_code': auth_data.get('customer_code', ''), 'email': data.get('customer', {}).get('email', ''), 'payment_type': 'card', 'card_last4': auth_data.get('last4', ''), 'card_brand': auth_data.get('brand', ''), 'card_expiry_month': auth_data.get('expiry_month', ''), 'card_expiry_year': auth_data.get('expiry_year', ''), 'reusable': auth_data.get('reusable', True), 'status': 'active'})
        BillingAuditLog.log_action(user=None, tenant_id=transaction_obj.tenant_id, action='payment', resource_type='transaction', resource_id=transaction_obj.id, after=serialize_for_audit(transaction_obj), metadata={'webhook_source': 'charge.success'})
        webhook_log.related_transaction = transaction_obj
        webhook_log.save()
        logger.info(f"Successfully processed charge.success for {reference}")
        return transaction_obj

    @transaction.atomic
    def handle_subscription_create(self, event_data: Dict[str, Any], webhook_log: WebhookEventLog) -> Optional[Subscription]:
        logger.info("Processing subscription.create webhook")
        data = event_data.get('data', {})
        subscription_code = data.get('subscription_code')
        if not subscription_code:
            logger.error("subscription.create webhook missing subscription_code")
            raise WebhookProcessingError("Missing subscription_code")
        subscription = Subscription.objects.get_by_paystack_subscription_code(subscription_code)
        if subscription:
            subscription.paystack_subscription_code = subscription_code
            subscription.paystack_authorization_code = data.get('authorization', {}).get('authorization_code', '')
            subscription.status = Subscription.STATUS_ACTIVE
            subscription.current_period_start = timezone.now()
            subscription.save()
            BillingAuditLog.log_action(user=None, tenant_id=subscription.tenant_id, action='create', resource_type='subscription', resource_id=subscription.id, after=serialize_for_audit(subscription), metadata={'webhook_source': 'subscription.create'})
        webhook_log.related_subscription = subscription
        webhook_log.save()
        logger.info(f"Successfully processed subscription.create for {subscription_code}")
        return subscription

    @transaction.atomic
    def handle_subscription_disable(self, event_data: Dict[str, Any], webhook_log: WebhookEventLog) -> Optional[Subscription]:
        logger.info("Processing subscription.disable webhook")
        data = event_data.get('data', {})
        subscription_code = data.get('subscription_code')
        if not subscription_code:
            logger.error("subscription.disable webhook missing subscription_code")
            raise WebhookProcessingError("Missing subscription_code")
        subscription = Subscription.objects.get_by_paystack_subscription_code(subscription_code)
        if subscription:
            subscription.status = Subscription.STATUS_CANCELLED
            subscription.cancelled_at = timezone.now()
            subscription.save()
            BillingAuditLog.log_action(user=None, tenant_id=subscription.tenant_id, action='cancel', resource_type='subscription', resource_id=subscription.id, after=serialize_for_audit(subscription), metadata={'webhook_source': 'subscription.disable'})
        webhook_log.related_subscription = subscription
        webhook_log.save()
        logger.info(f"Successfully processed subscription.disable for {subscription_code}")
        return subscription

    @transaction.atomic
    def handle_subscription_enable(self, event_data: Dict[str, Any], webhook_log: WebhookEventLog) -> Optional[Subscription]:
        logger.info("Processing subscription.enable webhook")
        data = event_data.get('data', {})
        subscription_code = data.get('subscription_code')
        if not subscription_code:
            logger.error("subscription.enable webhook missing subscription_code")
            raise WebhookProcessingError("Missing subscription_code")
        subscription = Subscription.objects.get_by_paystack_subscription_code(subscription_code)
        if subscription:
            subscription.status = Subscription.STATUS_ACTIVE
            subscription.save()
            BillingAuditLog.log_action(user=None, tenant_id=subscription.tenant_id, action='update', resource_type='subscription', resource_id=subscription.id, after=serialize_for_audit(subscription), metadata={'webhook_source': 'subscription.enable'})
        webhook_log.related_subscription = subscription
        webhook_log.save()
        logger.info(f"Successfully processed subscription.enable for {subscription_code}")
        return subscription

    @transaction.atomic
    def handle_invoice_payment_failed(self, event_data: Dict[str, Any], webhook_log: WebhookEventLog) -> Optional[Invoice]:
        logger.info("Processing invoice.payment_failed webhook")
        data = event_data.get('data', {})
        invoice_id = data.get('id')
        if not invoice_id:
            logger.error("invoice.payment_failed webhook missing invoice id")
            raise WebhookProcessingError("Missing invoice id")
        invoice = Invoice.objects.get_by_paystack_invoice_id(str(invoice_id))
        if invoice:
            invoice.status = Invoice.STATUS_OVERDUE
            invoice.save()
            if invoice.subscription:
                invoice.subscription.mark_past_due()
            BillingAuditLog.log_action(user=None, tenant_id=invoice.tenant_id, action='update', resource_type='invoice', resource_id=invoice.id, after=serialize_for_audit(invoice), metadata={'webhook_source': 'invoice.payment_failed'})
        webhook_log.related_invoice_id = str(invoice.id) if invoice else None
        webhook_log.save()
        return invoice

    def dispatch(self, event_type: str, event_data: Dict[str, Any], webhook_log: WebhookEventLog):
        handlers = {'charge.success': self.handle_charge_success, 'subscription.create': self.handle_subscription_create, 'subscription.disable': self.handle_subscription_disable, 'subscription.enable': self.handle_subscription_enable, 'invoice.payment_failed': self.handle_invoice_payment_failed}
        handler = handlers.get(event_type)
        if handler:
            logger.info(f"Dispatching webhook to {event_type} handler")
            return handler(event_data, webhook_log)
        else:
            logger.warning(f"No handler for webhook event type: {event_type}")
            return None