import logging
import json
from typing import Dict, Any, Optional
from django.conf import settings
from django.utils import timezone
from django.db import transaction
from apps.billing.services.stripe_client import StripeClient
from apps.billing.services.subscription_service import SubscriptionService
from apps.billing.services.invoice_service import InvoiceService
from apps.billing.services.payment_service import PaymentService
from apps.billing.services.audit_service import BillingAuditService
from apps.billing.models import WebhookEvent, Subscription
from apps.billing.constants import WebhookEventType
from apps.billing.exceptions import WebhookError
logger = logging.getLogger(__name__)

class WebhookService:
    def __init__(self):
        self.stripe = StripeClient()
        self.subscription_service = SubscriptionService()
        self.invoice_service = InvoiceService()
        self.payment_service = PaymentService()
        self.audit = BillingAuditService()
    
    def process_webhook(self, payload: bytes, sig_header: str) -> Dict[str, Any]:
        try:
            event = self.stripe.construct_webhook_event(
                payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
            )
        except Exception as e:
            logger.error(f"Webhook signature verification failed: {str(e)}")
            raise WebhookError(f"Invalid signature: {str(e)}")
        existing = WebhookEvent.objects.filter(stripe_event_id=event.id).first()
        if existing:
            logger.info(f"Webhook {event.id} already processed")
            return {'processed': False, 'already_processed': True}
        webhook_event = WebhookEvent.objects.create(
            stripe_event_id=event.id,
            event_type=event.type,
            api_version=event.api_version,
            payload=event.to_dict(),
            is_processed=False
        )
        self.audit.log_webhook_received(
            event_type=event.type,
            stripe_event_id=event.id,
            payload=event.to_dict(),
            processed=False
        )
        result = self._dispatch_event(event.type, event.data.object)
        webhook_event.mark_processed(error=result.get('error'))
        self.audit.log_webhook_received(
            event_type=event.type,
            stripe_event_id=event.id,
            payload=event.to_dict(),
            processed=True,
            error=result.get('error')
        )
        return result
    
    def _dispatch_event(self, event_type: str, event_data: Dict) -> Dict[str, Any]:
        handlers = {
            WebhookEventType.CUSTOMER_SUBSCRIPTION_CREATED: self._handle_subscription_created,
            WebhookEventType.CUSTOMER_SUBSCRIPTION_UPDATED: self._handle_subscription_updated,
            WebhookEventType.CUSTOMER_SUBSCRIPTION_DELETED: self._handle_subscription_deleted,
            WebhookEventType.CUSTOMER_SUBSCRIPTION_TRIAL_WILL_END: self._handle_trial_will_end,
            WebhookEventType.INVOICE_PAID: self._handle_invoice_paid,
            WebhookEventType.INVOICE_PAYMENT_FAILED: self._handle_invoice_payment_failed,
            WebhookEventType.PAYMENT_INTENT_SUCCEEDED: self._handle_payment_succeeded,
            WebhookEventType.PAYMENT_INTENT_PAYMENT_FAILED: self._handle_payment_failed,
            WebhookEventType.CHECKOUT_SESSION_COMPLETED: self._handle_checkout_completed,
        }
        handler = handlers.get(event_type)
        if handler:
            return handler(event_data)
        logger.info(f"No handler for webhook event type: {event_type}")
        return {'processed': True, 'handler': None}
    
    @transaction.atomic
    def _handle_subscription_created(self, data: Dict) -> Dict[str, Any]:
        stripe_subscription_id = data.get('id')
        stripe_customer_id = data.get('customer')
        subscription = Subscription.objects.filter(
            stripe_subscription_id=stripe_subscription_id
        ).first()
        if not subscription:
            subscription = Subscription.objects.filter(
                stripe_customer_id=stripe_customer_id
            ).first()
            if subscription:
                subscription.stripe_subscription_id = stripe_subscription_id
                subscription.save()
        if subscription:
            self.subscription_service.sync_with_stripe(subscription)
        return {'processed': True, 'event': 'subscription_created'}
    
    @transaction.atomic
    def _handle_subscription_updated(self, data: Dict) -> Dict[str, Any]:
        stripe_subscription_id = data.get('id')
        subscription = Subscription.objects.filter(
            stripe_subscription_id=stripe_subscription_id
        ).first()
        if subscription:
            self.subscription_service.sync_with_stripe(subscription)
        return {'processed': True, 'event': 'subscription_updated'}
    
    @transaction.atomic
    def _handle_subscription_deleted(self, data: Dict) -> Dict[str, Any]:
        stripe_subscription_id = data.get('id')
        subscription = Subscription.objects.filter(
            stripe_subscription_id=stripe_subscription_id
        ).first()
        if subscription:
            subscription.status = 'canceled'
            subscription.ended_at = timezone.now()
            subscription.save()
        return {'processed': True, 'event': 'subscription_deleted'}
    
    @transaction.atomic
    def _handle_trial_will_end(self, data: Dict) -> Dict[str, Any]:
        stripe_subscription_id = data.get('id')
        subscription = Subscription.objects.filter(
            stripe_subscription_id=stripe_subscription_id
        ).first()
        if subscription:
            from billing.services.notification_service import BillingNotificationService
            BillingNotificationService().send_trial_ending_notification(subscription)
        return {'processed': True, 'event': 'trial_will_end'}
    
    @transaction.atomic
    def _handle_invoice_paid(self, data: Dict) -> Dict[str, Any]:
        stripe_invoice_id = data.get('id')
        invoice = self.invoice_service.sync_invoice(stripe_invoice_id)
        if invoice and invoice.subscription:
            from billing.services.quota_service import QuotaService
            QuotaService().refresh_usage(invoice.tenant)
        return {'processed': True, 'event': 'invoice_paid', 'invoice_id': stripe_invoice_id}
    
    @transaction.atomic
    def _handle_invoice_payment_failed(self, data: Dict) -> Dict[str, Any]:
        stripe_invoice_id = data.get('id')
        invoice = self.invoice_service.sync_invoice(stripe_invoice_id)
        if invoice and invoice.subscription:
            if invoice.subscription.status == 'active':
                invoice.subscription.status = 'past_due'
                invoice.subscription.save()
        return {'processed': True, 'event': 'invoice_payment_failed'}
    
    @transaction.atomic
    def _handle_payment_succeeded(self, data: Dict) -> Dict[str, Any]:
        stripe_payment_intent_id = data.get('id')
        payment = self.payment_service.sync_payment(stripe_payment_intent_id)
        return {'processed': True, 'event': 'payment_succeeded', 'payment_id': stripe_payment_intent_id}
    
    @transaction.atomic
    def _handle_payment_failed(self, data: Dict) -> Dict[str, Any]:
        stripe_payment_intent_id = data.get('id')
        payment = self.payment_service.sync_payment(stripe_payment_intent_id)
        return {'processed': True, 'event': 'payment_failed'}
    
    @transaction.atomic
    def _handle_checkout_completed(self, data: Dict) -> Dict[str, Any]:
        session_id = data.get('id')
        stripe_subscription_id = data.get('subscription')
        stripe_customer_id = data.get('customer')
        metadata = data.get('metadata', {})
        tenant_id = metadata.get('tenant_id')
        if tenant_id and stripe_subscription_id:
            from apps.tenant.models import Client
            try:
                tenant = Client.objects.get(id=tenant_id)
                subscription = Subscription.objects.filter(
                    tenant=tenant
                ).first()
                if subscription:
                    subscription.stripe_subscription_id = stripe_subscription_id
                    subscription.stripe_customer_id = stripe_customer_id
                    subscription.save()
                    self.subscription_service.sync_with_stripe(subscription)
                logger.info(f"Checkout completed for tenant {tenant.name}")
            except Client.DoesNotExist:
                logger.error(f"Tenant {tenant_id} not found for checkout completion")
        return {'processed': True, 'event': 'checkout_completed'}