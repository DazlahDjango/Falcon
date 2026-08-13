import logging
from decimal import Decimal
from typing import Optional, Dict, Any, Tuple
from django.db import transaction
from django.utils import timezone
from django.core.exceptions import ValidationError
from apps.billing.services.paystack.client import PayStackClient
from apps.billing.services.audit.logger import AuditLogger as BillingAuditService
from apps.billing.exceptions import (
    SubscriptionError, PaymentError, UsageError as QuotaError, WebhookError
)
from apps.billing.constants import (
    SubscriptionStatus, InvoiceStatus, TransactionStatus as PaymentStatus, BillingInterval
)
logger = logging.getLogger(__name__)

class BillingOrchestrator:
    def __init__(self):
        self.stripe = StripeClient()
        self.audit = BillingAuditService()
    
    @transaction.atomic
    def create_subscription(self, tenant, plan, billing_interval: str = BillingInterval.MONTHLY, trial_days: int = None, payment_method_id: str = None, created_by=None) -> Dict[str, Any]:
        from apps.billing.models import Subscription, SubscriptionPlan as Plan
        if hasattr(tenant, 'subscription') and tenant.subscription:
            raise SubscriptionError("Tenant already has an active subscription")
        stripe_customer = self._get_or_create_stripe_customer(tenant)
        stripe_price_id = plan.get_stripe_price_id_for_interval(billing_interval)
        if not stripe_price_id:
            raise SubscriptionError(f"No Stripe price ID for plan {plan.name}")
        trial_days = trial_days or plan.trial_days
        try:
            stripe_sub = self.stripe.create_subscription(
                customer_id=stripe_customer.id,
                price_id=stripe_price_id,
                trial_days=trial_days,
                metadata={
                    'tenant_id': str(tenant.id),
                    'tenant_name': tenant.name,
                    'plan': plan.plan_type
                }
            )
        except Exception as e:
            logger.error(f"Failed to create Stripe subscription: {str(e)}")
            raise SubscriptionError(f"Stripe error: {str(e)}")
        subscription = Subscription.objects.create(
            tenant=tenant,
            plan=plan,
            stripe_customer_id=stripe_customer.id,
            stripe_subscription_id=stripe_sub.id,
            stripe_price_id=stripe_price_id,
            billing_interval=billing_interval,
            status=self._map_stripe_status(stripe_sub.status),
            trial_start=timezone.now() if trial_days else None,
            trial_end=timezone.now() + timezone.timedelta(days=trial_days) if trial_days else None,
            current_period_start=timezone.fromtimestamp(stripe_sub.current_period_start),
            current_period_end=timezone.fromtimestamp(stripe_sub.current_period_end),
            cancel_at_period_end=stripe_sub.cancel_at_period_end,
            features_snapshot=self._get_features_snapshot(plan)
        )
        from apps.billing.services.usage.service import UsageTrackingService as QuotaService
        QuotaService().initialize_limits(subscription)
        self.audit.log_subscription_creation(
            subscription=subscription,
            user=created_by,
            metadata={
                'billing_interval': billing_interval,
                'trial_days': trial_days
            }
        )
        logger.info(f"Created subscription {subscription.id} for tenant {tenant.name}")
        return {
            'subscription': subscription,
            'stripe_customer': stripe_customer,
            'stripe_subscription': stripe_sub,
            'requires_payment_method': stripe_sub.status == 'incomplete'
        }
    
    @transaction.atomic
    def update_subscription_plan(self, subscription, new_plan, billing_interval: str = None, prorate: bool = True, updated_by=None) -> Dict[str, Any]:
        from apps.billing.models import Subscription as SubscriptionHistory
        old_plan = subscription.plan
        old_status = subscription.status
        interval = billing_interval or subscription.billing_interval
        new_price_id = new_plan.get_stripe_price_id_for_interval(interval)
        if not new_price_id:
            raise SubscriptionError(f"No Stripe price ID for plan {new_plan.name}")
        try:
            stripe_sub = self.stripe.update_subscription(
                subscription_id=subscription.stripe_subscription_id,
                price_id=new_price_id,
                metadata={
                    'previous_plan': old_plan.plan_type,
                    'new_plan': new_plan.plan_type,
                    'prorated': prorate
                }
            )
        except Exception as e:
            logger.error(f"Failed to update Stripe subscription: {str(e)}")
            raise SubscriptionError(f"Stripe error: {str(e)}")
        old_features = subscription.features_snapshot
        subscription.plan = new_plan
        subscription.stripe_price_id = new_price_id
        subscription.billing_interval = interval
        subscription.features_snapshot = self._get_features_snapshot(new_plan)
        if stripe_sub.current_period_start:
            subscription.current_period_start = timezone.fromtimestamp(stripe_sub.current_period_start)
        if stripe_sub.current_period_end:
            subscription.current_period_end = timezone.fromtimestamp(stripe_sub.current_period_end)
        subscription.save()
        from apps.billing.services.usage.service import UsageTrackingService as QuotaService
        QuotaService().update_limits_for_subscription(subscription)
        SubscriptionHistory.objects.create(
            subscription=subscription,
            previous_plan=old_plan,
            new_plan=new_plan,
            previous_status=old_status,
            new_status=subscription.status,
            change_reason=f"Plan {'upgrade' if new_plan.price_monthly > old_plan.price_monthly else 'downgrade'}",
            metadata={
                'prorated': prorate,
                'billing_interval': interval
            }
        )
        self.audit.log_subscription_change(
            subscription=subscription,
            user=updated_by,
            old_value={'plan': old_plan.name, 'status': old_status},
            new_value={'plan': new_plan.name, 'status': subscription.status}
        )
        logger.info(f"Updated subscription {subscription.id} from {old_plan.name} to {new_plan.name}")
        return {
            'subscription': subscription,
            'stripe_subscription': stripe_sub,
            'old_plan': old_plan,
            'new_plan': new_plan
        }
    
    @transaction.atomic
    def cancel_subscription(
        self,
        subscription,
        at_period_end: bool = True,
        cancelled_by=None,
        reason: str = ""
    ) -> Dict[str, Any]:
        try:
            stripe_sub = self.stripe.cancel_subscription(
                subscription_id=subscription.stripe_subscription_id,
                at_period_end=at_period_end
            )
        except Exception as e:
            logger.error(f"Failed to cancel Stripe subscription: {str(e)}")
            raise SubscriptionError(f"Stripe error: {str(e)}")
        subscription.cancel_at_period_end = at_period_end
        subscription.canceled_at = timezone.now()
        if not at_period_end:
            subscription.status = SubscriptionStatus.CANCELED
            subscription.ended_at = timezone.now()
        subscription.save()
        self.audit.log_subscription_cancellation(
            subscription=subscription,
            user=cancelled_by,
            metadata={'at_period_end': at_period_end, 'reason': reason}
        )
        logger.info(f"Cancelled subscription {subscription.id} (at_period_end={at_period_end})")
        return {
            'subscription': subscription,
            'stripe_subscription': stripe_sub,
            'cancelled_immediately': not at_period_end
        }
    
    @transaction.atomic
    def process_successful_payment(self,stripe_payment_intent,invoice=None,subscription=None) -> Dict[str, Any]:
        from apps.billing.models import Transaction as Payment, Invoice
        if Payment.objects.filter(stripe_payment_intent_id=stripe_payment_intent.id).exists():
            logger.info(f"Payment {stripe_payment_intent.id} already processed")
            return {'already_processed': True}
        payment = Payment.objects.create(
            tenant_id=self._extract_tenant_id(stripe_payment_intent.metadata),
            subscription=subscription,
            invoice=invoice,
            stripe_payment_intent_id=stripe_payment_intent.id,
            stripe_charge_id=stripe_payment_intent.latest_charge,
            amount=Decimal(stripe_payment_intent.amount) / 100,
            currency=stripe_payment_intent.currency.upper(),
            status=PaymentStatus.SUCCEEDED,
            payment_date=timezone.now(),
            receipt_url=stripe_payment_intent.charges.data[0].receipt_url if stripe_payment_intent.charges.data else ''
        )
        if invoice:
            invoice.status = InvoiceStatus.PAID
            invoice.amount_paid = payment.amount
            invoice.amount_remaining = Decimal('0.00')
            invoice.save()
        self.audit.log_payment_received(
            payment=payment,
            amount=payment.amount,
            currency=payment.currency
        )
        
        logger.info(f"Processed successful payment {payment.id} for {payment.amount}")
        return {'payment': payment, 'invoice_updated': invoice is not None}
    
    @transaction.atomic
    def process_failed_payment(self,stripe_payment_intent,invoice=None,subscription=None) -> Dict[str, Any]:
        from apps.billing.models import Transaction as Payment
        payment = Payment.objects.create(
            tenant_id=self._extract_tenant_id(stripe_payment_intent.metadata),
            subscription=subscription,
            invoice=invoice,
            stripe_payment_intent_id=stripe_payment_intent.id,
            amount=Decimal(stripe_payment_intent.amount) / 100,
            currency=stripe_payment_intent.currency.upper(),
            status=PaymentStatus.FAILED,
            failure_reason=stripe_payment_intent.last_payment_error.get('message', '') if stripe_payment_intent.last_payment_error else 'Unknown error',
            payment_date=timezone.now()
        )
        if subscription and subscription.status == SubscriptionStatus.ACTIVE:
            subscription.status = SubscriptionStatus.PAST_DUE
            subscription.save()
        self.audit.log_payment_failure(
            payment=payment,
            failure_reason=payment.failure_reason
        )
        logger.warning(f"Failed payment {payment.id}: {payment.failure_reason}")
        return {'payment': payment, 'subscription_status_updated': subscription is not None}
    
    def create_checkout_session(
        self,
        tenant,
        plan,
        billing_interval: str,
        success_url: str,
        cancel_url: str,
        allow_promotion_codes: bool = True
    ) -> Dict[str, Any]:
        stripe_customer = self._get_or_create_stripe_customer(tenant)
        stripe_price_id = plan.get_stripe_price_id_for_interval(billing_interval)
        if not stripe_price_id:
            raise SubscriptionError(f"No Stripe price ID for plan {plan.name}")        
        session = self.stripe.create_checkout_session(
            customer_id=stripe_customer.id,
            price_id=stripe_price_id,
            success_url=success_url,
            cancel_url=cancel_url,
            mode='subscription',
            allow_promotion_codes=allow_promotion_codes,
            metadata={
                'tenant_id': str(tenant.id),
                'plan_type': plan.plan_type,
                'billing_interval': billing_interval
            }
        )
        return {
            'session_id': session.id,
            'checkout_url': session.url,
            'stripe_customer_id': stripe_customer.id
        }
    
    def create_customer_portal_session(self, tenant, return_url: str) -> Dict[str, Any]:
        if not hasattr(tenant, 'subscription') or not tenant.subscription:
            raise SubscriptionError("Tenant has no subscription")
        subscription = tenant.subscription
        if not subscription.stripe_customer_id:
            raise SubscriptionError("No Stripe customer ID found")
        portal_session = self.stripe.create_customer_portal_session(
            customer_id=subscription.stripe_customer_id,
            return_url=return_url
        )
        return {
            'portal_url': portal_session.url,
            'session_id': portal_session.id
        }
    
    def _get_or_create_stripe_customer(self, tenant):
        from apps.billing.models import Subscription
        existing_sub = Subscription.objects.filter(tenant=tenant).first()
        if existing_sub and existing_sub.stripe_customer_id:
            return self.stripe.get_customer(existing_sub.stripe_customer_id)
        return self.stripe.create_customer(
            email=tenant.contact_email or f"{tenant.slug}@falconpms.com",
            name=tenant.name,
            metadata={
                'tenant_id': str(tenant.id),
                'tenant_slug': tenant.slug,
                'platform': 'FalconPMS'
            }
        )
    
    def _map_stripe_status(self, stripe_status: str) -> str:
        status_map = {
            'trialing': SubscriptionStatus.TRIALING,
            'active': SubscriptionStatus.ACTIVE,
            'past_due': SubscriptionStatus.PAST_DUE,
            'canceled': SubscriptionStatus.CANCELED,
            'incomplete': SubscriptionStatus.INCOMPLETE,
            'incomplete_expired': SubscriptionStatus.INCOMPLETE_EXPIRED,
            'unpaid': SubscriptionStatus.UNPAID,
        }
        return status_map.get(stripe_status, SubscriptionStatus.UNPAID)
    
    def _get_features_snapshot(self, plan):
        from apps.billing.models import SubscriptionPlanFeature as PlanFeature
        features = {}
        for feature in PlanFeature.objects.filter(plan=plan, is_deleted=False):
            features[feature.name] = {
                'value': feature.value,
                'is_highlight': feature.is_highlight
            }
        return features
    
    def _extract_tenant_id(self, metadata: Dict) -> str:
        if metadata and 'tenant_id' in metadata:
            return metadata['tenant_id']
        return None
    
    def validate_subscription_health(self, subscription) -> Dict[str, Any]:
        health = {
            'is_valid': True,
            'issues': [],
            'warnings': []
        }
        if subscription.current_period_end and subscription.current_period_end < timezone.now():
            health['is_valid'] = False
            health['issues'].append('Subscription period has expired')
        if subscription.status == SubscriptionStatus.TRIALING and subscription.trial_end:
            if subscription.trial_end < timezone.now():
                health['is_valid'] = False
                health['issues'].append('Trial period has expired')
            elif (subscription.trial_end - timezone.now()).days <= 3:
                health['warnings'].append(f"Trial ends in {(subscription.trial_end - timezone.now()).days} days")
        if subscription.status == SubscriptionStatus.PAST_DUE:
            health['warnings'].append('Payment is past due')
            health['is_valid'] = False
        if subscription.cancel_at_period_end:
            health['warnings'].append('Subscription is set to cancel at period end')
        return health