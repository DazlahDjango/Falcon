import logging
from typing import Optional, Dict, Any, Tuple
from datetime import timedelta
from django.utils import timezone
from django.db import transaction
from django.conf import settings
from ...models import Subscription, SubscriptionPlan, Transaction, Invoice
from ...exceptions import SubscriptionUpgradeError, SubscriptionDowngradeError
from ...utils import calculate_prorated_amount, calculate_total_amount, calculate_tax, generate_invoice_number
from ..paystack.client import PayStackClient
from ..billing.invoice import InvoiceService
from ..audit.logger import audit_logger

logger = logging.getLogger(__name__)

class PlanChangeService:
    def __init__(self):
        self.paystack_client = PayStackClient()
        self.invoice_service = InvoiceService()

    @transaction.atomic
    def upgrade_plan(self, subscription: Subscription, new_plan: SubscriptionPlan, immediate: bool = True) -> Subscription:
        if not self._is_valid_upgrade(subscription.plan, new_plan):
            raise SubscriptionUpgradeError(f"Cannot upgrade from {subscription.plan.plan_type} to {new_plan.plan_type}")
        if immediate:
            return self._upgrade_immediate(subscription, new_plan)
        else:
            return self._schedule_upgrade(subscription, new_plan)

    @transaction.atomic
    def downgrade_plan(self, subscription: Subscription, new_plan: SubscriptionPlan, immediate: bool = False) -> Subscription:
        if not self._is_valid_downgrade(subscription.plan, new_plan):
            raise SubscriptionDowngradeError(f"Cannot downgrade from {subscription.plan.plan_type} to {new_plan.plan_type}")
        if immediate:
            return self._downgrade_immediate(subscription, new_plan)
        else:
            return self._schedule_downgrade(subscription, new_plan)

    def _is_valid_upgrade(self, current_plan: SubscriptionPlan, new_plan: SubscriptionPlan) -> bool:
        upgrade_order = {'trial': ['basic', 'professional', 'enterprise'], 'basic': ['professional', 'enterprise'], 'professional': ['enterprise'], 'enterprise': []}
        return new_plan.plan_type in upgrade_order.get(current_plan.plan_type, [])

    def _is_valid_downgrade(self, current_plan: SubscriptionPlan, new_plan: SubscriptionPlan) -> bool:
        downgrade_order = {'enterprise': ['professional', 'basic', 'trial'], 'professional': ['basic', 'trial'], 'basic': ['trial'], 'trial': []}
        return new_plan.plan_type in downgrade_order.get(current_plan.plan_type, [])

    def _upgrade_immediate(self, subscription: Subscription, new_plan: SubscriptionPlan) -> Subscription:
        days_remaining = (subscription.current_period_end - timezone.now()).days
        total_days = 30 if subscription.billing_interval == 'monthly' else 365
        days_used = total_days - days_remaining
        current_plan_value = subscription.amount
        used_value = calculate_prorated_amount(current_plan_value, days_used, total_days)
        remaining_value = current_plan_value - used_value
        new_plan_daily_rate = new_plan.price / total_days
        new_plan_cost = new_plan_daily_rate * days_remaining
        additional_amount = new_plan_cost - remaining_value
        tax_amount = calculate_tax(additional_amount)
        total_amount = calculate_total_amount(additional_amount, tax_amount)
        if additional_amount > 0:
            invoice = self._create_upgrade_invoice(subscription, new_plan, additional_amount, tax_amount, total_amount)
            if subscription.paystack_authorization_code:
                self._charge_for_upgrade(subscription, invoice, additional_amount)
            else:
                self.invoice_service.send_invoice_email(str(invoice.id), f"tenant-{subscription.tenant_id}@falconpms.com")
        old_plan = subscription.plan
        subscription.plan = new_plan
        subscription.amount = new_plan.price
        if subscription.billing_interval == 'monthly':
            subscription.current_period_end = timezone.now() + timedelta(days=days_remaining)
        else:
            subscription.current_period_end = timezone.now() + timedelta(days=days_remaining)
        subscription.save()
        audit_logger.log(user=None, tenant_id=subscription.tenant_id, action='upgrade', resource_type='subscription', resource_id=subscription.id, before={'plan': old_plan.plan_type, 'amount': old_plan.price}, after={'plan': new_plan.plan_type, 'amount': new_plan.price}, metadata={'immediate': True, 'additional_amount': additional_amount})
        logger.info(f"Upgraded subscription {subscription.subscription_code} to {new_plan.plan_type}")
        return subscription

    def _downgrade_immediate(self, subscription: Subscription, new_plan: SubscriptionPlan) -> Subscription:
        days_remaining = (subscription.current_period_end - timezone.now()).days
        total_days = 30 if subscription.billing_interval == 'monthly' else 365
        old_plan_daily_rate = subscription.amount / total_days
        new_plan_daily_rate = new_plan.price / total_days
        refund_amount = (old_plan_daily_rate - new_plan_daily_rate) * days_remaining
        old_plan = subscription.plan
        subscription.plan = new_plan
        subscription.amount = new_plan.price
        subscription.save()
        if refund_amount > 0:
            self._process_downgrade_refund(subscription, refund_amount)
        audit_logger.log(user=None, tenant_id=subscription.tenant_id, action='downgrade', resource_type='subscription', resource_id=subscription.id, before={'plan': old_plan.plan_type, 'amount': old_plan.price}, after={'plan': new_plan.plan_type, 'amount': new_plan.price}, metadata={'immediate': True, 'refund_amount': refund_amount})
        logger.info(f"Downgraded subscription {subscription.subscription_code} to {new_plan.plan_type}")
        return subscription

    def _schedule_upgrade(self, subscription: Subscription, new_plan: SubscriptionPlan) -> Subscription:
        metadata = subscription.metadata or {}
        metadata['pending_plan_change'] = {'new_plan_id': str(new_plan.id), 'new_plan_type': new_plan.plan_type, 'effective_date': subscription.current_period_end.isoformat(), 'change_type': 'upgrade'}
        subscription.metadata = metadata
        subscription.save(update_fields=['metadata'])
        logger.info(f"Scheduled upgrade for {subscription.subscription_code} to {new_plan.plan_type} at period end")
        return subscription

    def _schedule_downgrade(self, subscription: Subscription, new_plan: SubscriptionPlan) -> Subscription:
        metadata = subscription.metadata or {}
        metadata['pending_plan_change'] = {'new_plan_id': str(new_plan.id), 'new_plan_type': new_plan.plan_type, 'effective_date': subscription.current_period_end.isoformat(), 'change_type': 'downgrade'}
        subscription.metadata = metadata
        subscription.save(update_fields=['metadata'])
        logger.info(f"Scheduled downgrade for {subscription.subscription_code} to {new_plan.plan_type} at period end")
        return subscription

    def _create_upgrade_invoice(self, subscription: Subscription, new_plan: SubscriptionPlan, amount: int, tax_amount: int, total_amount: int) -> Invoice:
        invoice = Invoice.objects.create(tenant_id=subscription.tenant_id, subscription=subscription, invoice_number=generate_invoice_number(subscription.tenant_id), invoice_date=timezone.now(), due_date=timezone.now() + timedelta(days=30), subtotal=amount, tax_amount=tax_amount, total_amount=total_amount, currency=subscription.currency, status=Invoice.STATUS_PENDING, line_items=[{'description': f"Plan Upgrade: {subscription.plan.name} → {new_plan.name}", 'quantity': 1, 'unit_price': amount, 'total': amount}, {'description': f"Tax ({getattr(settings, 'BILLING_TAX_RATE', 16)}% VAT)", 'quantity': 1, 'unit_price': tax_amount, 'total': tax_amount, 'is_tax': True}])
        return invoice

    def _charge_for_upgrade(self, subscription: Subscription, invoice: Invoice, amount: int):
        try:
            from apps.tenant.models import Organization
            tenant = Organization.objects.get(id=subscription.tenant_id)
            email = tenant.contact_email or f"tenant-{subscription.tenant_id}@falconpms.com"
            reference = f"UPGRADE_{subscription.subscription_code}_{invoice.invoice_number}"
            charge_response = self.paystack_client._request(
                'POST', '/transaction/charge_authorization',
                data={
                    'authorization_code': subscription.paystack_authorization_code,
                    'email': email,
                    'amount': invoice.total_amount,
                    'reference': reference,
                    'metadata': {
                        'tenant_id': str(subscription.tenant_id),
                        'subscription_code': subscription.subscription_code,
                        'invoice_id': str(invoice.id),
                        'transaction_type': 'upgrade',
                    }
                }
            )
            if charge_response.get('status') == 'success':
                invoice.mark_paid()
                Transaction.objects.create(
                    tenant_id=subscription.tenant_id,
                    subscription=subscription,
                    invoice=invoice,
                    reference=reference,
                    transaction_type='upgrade',
                    amount=invoice.subtotal,
                    tax_amount=invoice.tax_amount,
                    total_amount=invoice.total_amount,
                    currency=invoice.currency,
                    status=Transaction.STATUS_SUCCESS,
                    payment_date=timezone.now(),
                )
                logger.info(f"Upgrade charge successful for {subscription.subscription_code}")
            else:
                logger.warning(f"Upgrade charge failed for {subscription.subscription_code}: {charge_response.get('message')}")
                self.invoice_service.send_invoice_email(str(invoice.id), email)
        except Exception as e:
            logger.error(f"Failed to charge for upgrade {subscription.subscription_code}: {str(e)}")
            self.invoice_service.send_invoice_email(str(invoice.id), f"tenant-{subscription.tenant_id}@falconpms.com")

    def _process_downgrade_refund(self, subscription: Subscription, refund_amount: int):
        Transaction.objects.create(tenant_id=subscription.tenant_id, subscription=subscription, transaction_type=Transaction.TYPE_REFUND, amount=refund_amount, total_amount=refund_amount, currency=subscription.currency, status=Transaction.STATUS_PENDING, metadata={'refund_reason': 'plan_downgrade'})
        logger.info(f"Initiated refund of {refund_amount} for downgrade of {subscription.subscription_code}")

    def apply_pending_plan_changes(self) -> int:
        applied_count = 0
        subscriptions = Subscription.objects.active()
        for subscription in subscriptions:
            metadata = subscription.metadata or {}
            pending = metadata.get('pending_plan_change')
            if pending:
                effective_date = pending.get('effective_date')
                if effective_date and timezone.now() >= timezone.datetime.fromisoformat(effective_date):
                    new_plan = SubscriptionPlan.objects.get_by_id(pending['new_plan_id'])
                    if pending['change_type'] == 'upgrade':
                        self._upgrade_immediate(subscription, new_plan)
                    else:
                        self._downgrade_immediate(subscription, new_plan)
                    del metadata['pending_plan_change']
                    subscription.metadata = metadata
                    subscription.save(update_fields=['metadata'])
                    applied_count += 1
        return applied_count