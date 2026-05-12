import logging
from decimal import Decimal
from typing import Dict, Optional, Any
from django.db import transaction, models
from django.utils import timezone
from django.core.exceptions import ValidationError
from apps.billing.models import Subscription, Plan, SubscriptionHistory
from apps.billing.services.stripe_client import StripeClient
from apps.billing.services.audit_service import BillingAuditService
from apps.billing.services.quota_service import QuotaService
from apps.billing.exceptions import SubscriptionError, PaymentError
from apps.billing.constants import SubscriptionStatus, BillingInterval
from apps.billing.validators import validate_subscription_status, validate_billing_interval
logger = logging.getLogger(__name__)

class SubscriptionService:
    def __init__(self):
        self.stripe = StripeClient()
        self.audit = BillingAuditService()
        self.quota_service = QuotaService()
    
    @transaction.atomic
    def create_subscription(self, tenant, plan: Plan, billing_interval: str = BillingInterval.MONTHLY, trial_days: int = None, payment_method: str = None, created_by=None) -> Subscription:
        validate_billing_interval(billing_interval)
        if hasattr(tenant, 'subscription') and tenant.subscription:
            existing = tenant.subscription
            if existing.status in [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING]:
                raise SubscriptionError("Tenant already has active subscriptions")
        stripe_customer = self._get_or_create_stripe_customer(tenant)
        stripe_price_id = self._get_stripe_price_id(plan, billing_interval)
        if not stripe_price_id:
            raise SubscriptionError(f"No Stripe price configured for {plan.name} ({billing_interval})")
        trial_days = trial_days or plan.trial_days
        trial_end = timezone.now() + timezone.timedelta(days=trial_days) if trial_days else None
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
            logger.error(f"Stripe subscription creation failed: {str(e)}")
            raise SubscriptionError(f"Payment processor error: {str(e)}")
        subscription = Subscription.objects.create(
            tenant=tenant,
            plan=plan,
            stripe_customer_id=stripe_customer.id,
            stripe_subscription_id=stripe_sub.id,
            stripe_price_id=stripe_price_id,
            billing_interval=billing_interval,
            status=self._map_stripe_status(stripe_sub.status),
            trial_start=timezone.now() if trial_days else None,
            trial_end=trial_end,
            current_period_start=timezone.fromtimestamp(stripe_sub.current_period_start),
            current_period_end=timezone.fromtimestamp(stripe_sub.current_period_end),
            cancel_at_period_end=stripe_sub.cancel_at_period_end,
            features_snapshot=self._get_features_snapshot(plan)
        )
        self.quota_service.initialize_limits(subscription)
        self.audit.log_subscription_creation(
            subscription=subscription,
            user=created_by,
            metadata={'billing_interval': billing_interval, 'trial_days': trial_days}
        )
        logger.info(f"Subscription created: {subscription.id} for tenant {tenant.name}")
        return subscription
    
    @transaction.atomic
    def update_subscription_plan(self, subscription: Subscription, new_plan: Plan, billing_interval: str = None, prorate: bool = True, updated_by=None) -> Subscription:
        if subscription.status not in [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING]:
            raise SubscriptionError(f"Cannot change plan for subscription in {subscription.status} state")
        old_plan = subscription.plan
        interval = billing_interval or subscription.billing_interval
        validate_billing_interval(interval)
        new_price_id = self._get_stripe_price_id(new_plan, interval)
        if not new_price_id:
            raise SubscriptionError(f"No Stripe price for {new_plan.name} ({interval})")
        old_values = {
            'plan_id': str(old_plan.id),
            'plan_name': old_plan.name,
            'status': subscription.status,
            'price': str(old_plan.price_monthly if interval == 'month' else old_plan.price_yearly)
        }
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
            logger.error(f"Stripe subscription update failed: {str(e)}")
            raise SubscriptionError(f"Payment processor error: {str(e)}")
        subscription.plan = new_plan
        subscription.stripe_price_id = new_price_id
        subscription.billing_interval = interval
        subscription.features_snapshot = self._get_features_snapshot(new_plan)
        if stripe_sub.current_period_start:
            subscription.current_period_start = timezone.fromtimestamp(stripe_sub.current_period_start)
        if stripe_sub.current_period_end:
            subscription.current_period_end = timezone.fromtimestamp(stripe_sub.current_period_end)
        subscription.save()
        self.quota_service.update_limits_for_subscription(subscription)
        new_values = {
            'plan_id': str(new_plan.id),
            'plan_name': new_plan.name,
            'status': subscription.status,
            'price': str(new_plan.price_monthly if interval == 'month' else new_plan.price_yearly)
        }
        self.audit.log_subscription_change(
            subscription=subscription,
            user=updated_by,
            old_value=old_values,
            new_value=new_values,
            reason=f"Plan {'upgrade' if new_plan.price_monthly > old_plan.price_monthly else 'downgrade'}"
        )
        logger.info(f"Subscription {subscription.id} plan updated: {old_plan.name} -> {new_plan.name}")
        return subscription
    
    def cancel_subscription(self, subscription: Subscription, at_period_end: bool = True, cancelled_by=None, reason: str = "") -> Subscription:
        if subscription.status not in [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING, SubscriptionStatus.PAST_DUE]:
            raise SubscriptionError(f"Cannot cancel subscription in {subscription.status} state")
        try:
            stripe_sub = self.stripe.cancel_subscription(
                subscription_id=subscription.stripe_subscription_id,
                at_period_end=at_period_end
            )
        except Exception as e:
            logger.error(f"Stripe cancellation failed: {str(e)}")
            raise SubscriptionError(f"Payment processor error: {str(e)}")
        subscription.cancel_at_period_end = at_period_end
        subscription.canceled_at = timezone.now()
        if not at_period_end:
            subscription.status = SubscriptionStatus.CANCELED
            subscription.ended_at = timezone.now()
        subscription.save()
        self.audit.log_subscription_cancellation(
            subscription=subscription,
            user=cancelled_by,
            metadata={'reason': reason, 'at_period_end': at_period_end}
        )
        logger.info(f"Subscription {subscription.id} cancelled (at_period_end={at_period_end})")
        return subscription
    
    @transaction.atomic
    def reactivate_subscription(self, subscription: Subscription, reactivated_by=None) -> Subscription:
        if not subscription.cancel_at_period_end:
            raise SubscriptionError("Subscription is not scheduled for cancellation")
        try:
            stripe_sub = self.stripe.update_subscription(
                subscription_id=subscription.stripe_subscription_id,
                cancel_at_period_end=False
            )
        except Exception as e:
            logger.error(f"Stripe reactivation failed: {str(e)}")
            raise SubscriptionError(f"Payment processor error: {str(e)}")
        subscription.cancel_at_period_end = False
        subscription.canceled_at = None
        subscription.save()
        self.audit.log_subscription_change(
            subscription=subscription,
            user=reactivated_by,
            old_value={'cancel_at_period_end': True},
            new_value={'cancel_at_period_end': False},
            reason="Subscription reactivated"
        )
        logger.info(f"Subscription {subscription.id} reactivated")
        return subscription
    
    def get_subscription_status(self, tenant) -> Dict[str, Any]:
        subscription = getattr(tenant, 'subscription', None)
        if not subscription:
            return {
                'has_subscription': False,
                'status': None,
                'plan': None,
                'is_active': False,
                'requires_action': True,
                'action_type': 'subscribe'
            }
        health = self._check_subscription_health(subscription)
        return {
            'has_subscription': True,
            'subscription_id': str(subscription.id),
            'status': subscription.status,
            'plan': {
                'id': str(subscription.plan.id),
                'name': subscription.plan.name,
                'type': subscription.plan.plan_type,
                'features': subscription.features_snapshot
            },
            'billing_interval': subscription.billing_interval,
            'current_period_start': subscription.current_period_start.isoformat() if subscription.current_period_start else None,
            'current_period_end': subscription.current_period_end.isoformat() if subscription.current_period_end else None,
            'trial_end': subscription.trial_end.isoformat() if subscription.trial_end else None,
            'cancel_at_period_end': subscription.cancel_at_period_end,
            'is_active': subscription.is_active,
            'health': health,
            'requires_action': not subscription.is_active or health.get('has_issues', False),
            'action_type': self._determine_action_type(subscription, health)
        }
    
    def get_subscription_summary(self, subscription: Subscription) -> Dict[str, Any]:
        from billing.models import Invoice, Payment
        total_paid = Invoice.objects.filter(
            subscription=subscription,
            status='paid',
            is_deleted=False
        ).aggregate(total=models.Sum('amount_paid'))['total'] or Decimal('0.00')
        outstanding = Invoice.objects.filter(
            subscription=subscription,
            status__in=['draft', 'open'],
            is_deleted=False
        ).aggregate(total=models.Sum('amount_remaining'))['total'] or Decimal('0.00')
        return {
            'id': str(subscription.id),
            'tenant': {
                'id': str(subscription.tenant.id),
                'name': subscription.tenant.name
            },
            'plan': {
                'id': str(subscription.plan.id),
                'name': subscription.plan.name,
                'price_monthly': str(subscription.plan.price_monthly),
                'price_yearly': str(subscription.plan.price_yearly)
            },
            'status': subscription.status,
            'billing_interval': subscription.billing_interval,
            'dates': {
                'trial_start': subscription.trial_start.isoformat() if subscription.trial_start else None,
                'trial_end': subscription.trial_end.isoformat() if subscription.trial_end else None,
                'current_period_start': subscription.current_period_start.isoformat() if subscription.current_period_start else None,
                'current_period_end': subscription.current_period_end.isoformat() if subscription.current_period_end else None,
                'canceled_at': subscription.canceled_at.isoformat() if subscription.canceled_at else None,
                'ended_at': subscription.ended_at.isoformat() if subscription.ended_at else None
            },
            'financial': {
                'total_paid': str(total_paid),
                'outstanding_balance': str(outstanding),
                'currency': subscription.plan.currency
            },
            'auto_renew': subscription.auto_renew and not subscription.cancel_at_period_end
        }
    
    def sync_with_stripe(self, subscription: Subscription) -> Subscription:
        if not subscription.stripe_subscription_id:
            raise SubscriptionError("No Stripe subscription ID")
        try:
            stripe_sub = self.stripe.get_subscription(subscription.stripe_subscription_id)
            subscription.status = self._map_stripe_status(stripe_sub.status)
            subscription.current_period_start = timezone.fromtimestamp(stripe_sub.current_period_start)
            subscription.current_period_end = timezone.fromtimestamp(stripe_sub.current_period_end)
            subscription.cancel_at_period_end = stripe_sub.cancel_at_period_end
            if stripe_sub.trial_start and stripe_sub.trial_end:
                subscription.trial_start = timezone.fromtimestamp(stripe_sub.trial_start)
                subscription.trial_end = timezone.fromtimestamp(stripe_sub.trial_end)
            subscription.save()
            self.audit.log_stripe_sync(
                operation='sync_subscription',
                entity_type='subscription',
                entity_id=str(subscription.id),
                success=True
            )
            logger.info(f"Subscription {subscription.id} synced with Stripe")
        except Exception as e:
            self.audit.log_stripe_sync(
                operation='sync_subscription',
                entity_type='subscription',
                entity_id=str(subscription.id),
                success=False,
                error=str(e)
            )
            raise SubscriptionError(f"Sync failed: {str(e)}")
        return subscription
    
    def _get_or_create_stripe_customer(self, tenant):
        subscription = Subscription.objects.filter(tenant=tenant).first()
        if subscription and subscription.stripe_customer_id:
            try:
                return self.stripe.get_customer(subscription.stripe_customer_id)
            except Exception:
                pass
        return self.stripe.create_customer(
            email=tenant.contact_email or f"{tenant.slug}@falconpms.com",
            name=tenant.name,
            metadata={
                'tenant_id': str(tenant.id),
                'tenant_slug': tenant.slug,
                'platform': 'FalconPMS'
            }
        )
    
    def _get_stripe_price_id(self, plan: Plan, interval: str) -> Optional[str]:
        if interval == BillingInterval.MONTHLY:
            return plan.stripe_price_id_monthly
        return plan.stripe_price_id_yearly
    
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
    
    def _get_features_snapshot(self, plan: Plan) -> Dict:
        from billing.models import PlanFeature
        features = {}
        for feature in PlanFeature.objects.filter(plan=plan, is_deleted=False):
            features[feature.name] = {
                'value': feature.value,
                'is_highlight': feature.is_highlight
            }
        return features
    
    def _check_subscription_health(self, subscription: Subscription) -> Dict[str, Any]:
        issues = []
        warnings = []
        if not subscription.is_active:
            issues.append(f"Subscription is {subscription.status}")
        if subscription.current_period_end and subscription.current_period_end < timezone.now():
            issues.append("Subscription period has expired")
        if subscription.status == SubscriptionStatus.PAST_DUE:
            issues.append("Payment is past due")
        if subscription.trial_end and subscription.trial_end < timezone.now():
            issues.append("Trial period has expired")
        elif subscription.trial_end and (subscription.trial_end - timezone.now()).days <= 3:
            warnings.append(f"Trial ends in {(subscription.trial_end - timezone.now()).days} days")
        if subscription.cancel_at_period_end:
            warnings.append("Subscription will cancel at period end")
        return {
            'has_issues': len(issues) > 0,
            'issues': issues,
            'warnings': warnings,
            'is_healthy': len(issues) == 0
        }
    
    def _determine_action_type(self, subscription: Subscription, health: Dict) -> str:
        if not subscription.is_active:
            if subscription.status == SubscriptionStatus.PAST_DUE:
                return 'update_payment'
            return 'subscribe'
        if subscription.cancel_at_period_end:
            return 'reactivate'
        if subscription.trial_end and subscription.trial_end > timezone.now():
            days_left = (subscription.trial_end - timezone.now()).days
            if days_left <= 3:
                return 'upgrade_from_trial'
        return 'none'