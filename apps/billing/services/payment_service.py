import logging
from decimal import Decimal
from typing import Optional, Dict, Any
from django.db import transaction
from django.utils import timezone
from apps.billing.models import Payment, PaymentMethod, Subscription, Invoice
from apps.billing.services.stripe_client import StripeClient
from apps.billing.services.audit_service import BillingAuditService
from apps.billing.exceptions import PaymentError
logger = logging.getLogger(__name__)


class PaymentService:
    def __init__(self):
        self.stripe = StripeClient()
        self.audit = BillingAuditService()
    
    def sync_payment(self, stripe_payment_intent_id: str) -> Optional[Payment]:
        try:
            stripe_pi = self.stripe.get_payment_intent(stripe_payment_intent_id)
            existing = Payment.objects.filter(
                stripe_payment_intent_id=stripe_pi.id
            ).first()
            if existing:
                return existing
            invoice = None
            if stripe_pi.metadata.get('invoice_id'):
                invoice = Invoice.objects.filter(
                    stripe_invoice_id=stripe_pi.metadata.get('invoice_id')
                ).first()
            status = self._map_payment_status(stripe_pi.status)
            payment = Payment.objects.create(
                tenant_id=self._extract_tenant_id(stripe_pi.metadata),
                subscription=invoice.subscription if invoice else None,
                invoice=invoice,
                stripe_payment_intent_id=stripe_pi.id,
                stripe_charge_id=stripe_pi.latest_charge,
                amount=Decimal(stripe_pi.amount) / 100,
                currency=stripe_pi.currency.upper(),
                status=status,
                payment_date=timezone.now(),
                receipt_url=stripe_pi.charges.data[0].receipt_url if stripe_pi.charges.data else '',
                failure_reason=stripe_pi.last_payment_error.get('message', '') if stripe_pi.last_payment_error else ''
            )
            if status == 'succeeded' and invoice:
                invoice.status = 'paid'
                invoice.amount_paid = payment.amount
                invoice.amount_remaining = Decimal('0.00')
                invoice.save(update_fields=['status', 'amount_paid', 'amount_remaining'])
                self.audit.log_payment_received(payment, payment.amount, payment.currency)
                logger.info(f"Payment {payment.id} marked invoice {invoice.invoice_number} as paid")
            elif status == 'failed':
                self.audit.log_payment_failure(payment, payment.failure_reason)
                logger.warning(f"Payment {payment.id} failed: {payment.failure_reason}")
            return payment
            
        except Exception as e:
            logger.error(f"Failed to sync payment {stripe_payment_intent_id}: {str(e)}")
            raise PaymentError(f"Payment sync failed: {str(e)}")
    
    @transaction.atomic
    def save_payment_method(self, tenant, stripe_payment_method_id: str, stripe_customer_id: str, set_as_default: bool = True) -> PaymentMethod:
        try:
            stripe_pm = self.stripe.stripe.PaymentMethod.retrieve(stripe_payment_method_id)
        except Exception as e:
            logger.error(f"Failed to retrieve payment method: {str(e)}")
            raise PaymentError(f"Invalid payment method: {str(e)}")
        card_details = stripe_pm.card if stripe_pm.type == 'card' else None
        payment_method = PaymentMethod.objects.create(
            tenant=tenant,
            stripe_payment_method_id=stripe_payment_method_id,
            stripe_customer_id=stripe_customer_id,
            method_type=stripe_pm.type,
            last4=card_details.last4 if card_details else '',
            brand=card_details.brand if card_details else '',
            expiry_month=card_details.exp_month if card_details else None,
            expiry_year=card_details.exp_year if card_details else None,
            billing_email=stripe_pm.billing_details.email or '',
            billing_name=stripe_pm.billing_details.name or '',
            is_default=set_as_default,
            is_active=True
        )
        if set_as_default:
            PaymentMethod.objects.filter(
                tenant=tenant,
                is_default=True,
                is_active=True
            ).exclude(id=payment_method.id).update(is_default=False)
        subscription = getattr(tenant, 'subscription', None)
        if subscription:
            payment_method.subscription = subscription
            payment_method.save(update_fields=['subscription'])
        logger.info(f"Saved payment method {payment_method.id} for tenant {tenant.name}")
        return payment_method
    
    @transaction.atomic
    def delete_payment_method(self, payment_method: PaymentMethod) -> bool:
        try:
            self.stripe.stripe.PaymentMethod.detach(payment_method.stripe_payment_method_id)
        except Exception as e:
            logger.warning(f"Failed to detach from Stripe: {str(e)}")
        payment_method.is_active = False
        payment_method.is_deleted = True
        payment_method.deleted_at = timezone.now()
        payment_method.save(update_fields=['is_active', 'is_deleted', 'deleted_at'])
        if payment_method.is_default:
            new_default = PaymentMethod.objects.filter(
                tenant=payment_method.tenant,
                is_active=True,
                is_deleted=False
            ).exclude(id=payment_method.id).first()
            if new_default:
                new_default.is_default = True
                new_default.save(update_fields=['is_default'])
        logger.info(f"Deleted payment method {payment_method.id}")
        return True
    
    def set_default_payment_method(self, payment_method: PaymentMethod) -> PaymentMethod:
        PaymentMethod.objects.filter(
            tenant=payment_method.tenant,
            is_default=True
        ).update(is_default=False)
        payment_method.is_default = True
        payment_method.save(update_fields=['is_default'])
        subscription = getattr(payment_method.tenant, 'subscription', None)
        if subscription and subscription.stripe_customer_id:
            try:
                self.stripe.stripe.Customer.modify(
                    subscription.stripe_customer_id,
                    invoice_settings={'default_payment_method': payment_method.stripe_payment_method_id}
                )
            except Exception as e:
                logger.warning(f"Failed to update Stripe default payment method: {str(e)}")
        logger.info(f"Set payment method {payment_method.id} as default")
        return payment_method
    
    def get_tenant_payment_methods(self, tenant) -> list:
        return list(PaymentMethod.objects.filter(
            tenant=tenant,
            is_active=True,
            is_deleted=False
        ).order_by('-is_default', '-created_at'))
    
    def get_default_payment_method(self, tenant) -> Optional[PaymentMethod]:
        return PaymentMethod.objects.filter(
            tenant=tenant,
            is_default=True,
            is_active=True,
            is_deleted=False
        ).first()
    
    def _map_payment_status(self, stripe_status: str) -> str:
        status_map = {
            'succeeded': 'succeeded',
            'processing': 'pending',
            'requires_payment_method': 'pending',
            'requires_confirmation': 'pending',
            'requires_action': 'pending',
            'canceled': 'failed',
        }
        return status_map.get(stripe_status, 'pending')
    
    def _extract_tenant_id(self, metadata: Dict) -> Optional[str]:
        if metadata and 'tenant_id' in metadata:
            return metadata['tenant_id']
        return None