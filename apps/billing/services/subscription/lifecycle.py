"""
Subscription Lifecycle Service
Manages the complete subscription lifecycle.
"""

import logging
from typing import Optional, Dict, Any
from datetime import timedelta
from django.utils import timezone
from django.db import transaction

from ...models import Subscription, SubscriptionPlan, Transaction, Invoice, BillingAuditLog
from ...exceptions import (
    SubscriptionNotFoundError, SubscriptionAlreadyActiveError,
    SubscriptionExpiredError, SubscriptionCancellationError, SubscriptionError
)
from ...utils import (
    generate_subscription_code, serialize_for_audit,
    calculate_total_amount, calculate_tax
)
from ..paystack.client import PayStackClient
from ..billing.invoice import InvoiceService
from ..audit.logger import AuditLogger

logger = logging.getLogger(__name__)


class SubscriptionLifecycleService:
    """
    Manages subscription lifecycle:
    - Creation
    - Activation
    - Cancellation
    - Expiration
    - Reactivation
    """
    
    def __init__(self):
        self.paystack_client = PayStackClient()
        self.invoice_service = InvoiceService()
        self.audit_logger = AuditLogger()
    
    @transaction.atomic
    def create_subscription(self, tenant_id: str, plan: SubscriptionPlan,
                           payment_method_code: Optional[str] = None,
                           trial_days: int = 14) -> Subscription:
        """
        Create a new subscription for a tenant.
        
        Args:
            tenant_id: Tenant UUID
            plan: Subscription plan
            payment_method_code: PayStack authorization code
            trial_days: Number of trial days (0 for no trial)
        
        Returns:
            Created subscription
        """
        # Check for existing active subscription
        existing = Subscription.objects.get_current_for_tenant(tenant_id)
        if existing and existing.is_active:
            raise SubscriptionAlreadyActiveError(
                f"Tenant already has active subscription: {existing.subscription_code}"
            )
        
        # Calculate dates
        now = timezone.now()
        trial_end = now + timedelta(days=trial_days) if trial_days > 0 else None
        
        if plan.is_trial or trial_days > 0:
            status = Subscription.STATUS_TRIALING
            current_period_end = trial_end or now + timedelta(days=trial_days)
        else:
            status = Subscription.STATUS_ACTIVE
            if plan.billing_interval == SubscriptionPlan.INTERVAL_MONTHLY:
                current_period_end = now + timedelta(days=30)
            else:
                current_period_end = now + timedelta(days=365)
        
        # Create subscription
        subscription = Subscription.objects.create(
            tenant_id=tenant_id,
            plan=plan,
            subscription_code=generate_subscription_code(),
            status=status,
            start_date=now,
            trial_end_date=trial_end,
            current_period_start=now,
            current_period_end=current_period_end,
            billing_interval=plan.billing_interval,
            amount=plan.price,
            currency=plan.currency,
            auto_renew=True,
            metadata={'source': 'manual_creation'}
        )
        
        logger.info(f"Created subscription {subscription.subscription_code} for tenant {tenant_id}")
        
        # Create initial invoice
        invoice = self.invoice_service.create_for_subscription(subscription)
        
        # Log audit
        self.audit_logger.log(
            user=None,
            tenant_id=tenant_id,
            action='create',
            resource_type='subscription',
            resource_id=subscription.id,
            after=serialize_for_audit(subscription),
            metadata={'subscription_code': subscription.subscription_code}
        )
        
        return subscription
    
    @transaction.atomic
    def activate_subscription(self, subscription: Subscription) -> Subscription:
        """
        Activate a subscription (transition from trial to active).
        """
        if subscription.status != Subscription.STATUS_TRIALING:
            raise SubscriptionError(f"Cannot activate subscription with status {subscription.status}")
        
        subscription.activate()
        
        # Update billing period
        if subscription.billing_interval == SubscriptionPlan.INTERVAL_MONTHLY:
            subscription.current_period_end = timezone.now() + timedelta(days=30)
        else:
            subscription.current_period_end = timezone.now() + timedelta(days=365)
        
        subscription.save()
        
        logger.info(f"Activated subscription {subscription.subscription_code}")
        
        self.audit_logger.log(
            user=None,
            tenant_id=subscription.tenant_id,
            action='update',
            resource_type='subscription',
            resource_id=subscription.id,
            after=serialize_for_audit(subscription),
            metadata={'action': 'activate'}
        )
        
        return subscription
    
    @transaction.atomic
    def cancel_subscription(self, subscription: Subscription, at_period_end: bool = True) -> Subscription:
        """
        Cancel a subscription.
        
        Args:
            subscription: Subscription to cancel
            at_period_end: If True, cancel at end of period; if False, cancel immediately
        """
        if not subscription.is_active:
            raise SubscriptionExpiredError("Cannot cancel inactive subscription")
        
        subscription.cancel(at_period_end=at_period_end)
        subscription.save()
        
        logger.info(f"Cancelled subscription {subscription.subscription_code} (at_period_end={at_period_end})")
        
        self.audit_logger.log(
            user=None,
            tenant_id=subscription.tenant_id,
            action='cancel',
            resource_type='subscription',
            resource_id=subscription.id,
            after=serialize_for_audit(subscription),
            metadata={'at_period_end': at_period_end}
        )
        
        return subscription
    
    @transaction.atomic
    def expire_subscription(self, subscription: Subscription) -> Subscription:
        """
        Expire a subscription (period ended without renewal).
        """
        subscription.expire()
        subscription.save()
        
        logger.info(f"Expired subscription {subscription.subscription_code}")
        
        self.audit_logger.log(
            user=None,
            tenant_id=subscription.tenant_id,
            action='update',
            resource_type='subscription',
            resource_id=subscription.id,
            after=serialize_for_audit(subscription),
            metadata={'action': 'expire'}
        )
        
        return subscription
    
    @transaction.atomic
    def renew_subscription(self, subscription: Subscription) -> Subscription:
        """
        Renew a subscription for the next period.
        """
        if not subscription.auto_renew:
            raise SubscriptionError("Auto-renew is disabled for this subscription")
        
        if subscription.cancel_at_period_end:
            raise SubscriptionError("Subscription is scheduled for cancellation")
        
        # Calculate new period end
        if subscription.billing_interval == SubscriptionPlan.INTERVAL_MONTHLY:
            new_period_end = timezone.now() + timedelta(days=30)
        else:
            new_period_end = timezone.now() + timedelta(days=365)
        
        subscription.renew(new_period_end)
        subscription.save()
        
        # Create new invoice for renewal
        invoice = self.invoice_service.create_for_subscription(subscription, is_renewal=True)
        
        logger.info(f"Renewed subscription {subscription.subscription_code}")
        
        self.audit_logger.log(
            user=None,
            tenant_id=subscription.tenant_id,
            action='renew',
            resource_type='subscription',
            resource_id=subscription.id,
            after=serialize_for_audit(subscription),
            metadata={'invoice_id': str(invoice.id)}
        )
        
        return subscription
    
    @transaction.atomic
    def check_and_process_expiring_subscriptions(self) -> int:
        """
        Check for subscriptions that need renewal or expiration.
        
        Returns:
            Number of subscriptions processed
        """
        processed_count = 0
        
        # Subscriptions that need renewal (due today)
        due_for_renewal = Subscription.objects.subscriptions_due_for_renewal()
        for sub in due_for_renewal:
            try:
                self.renew_subscription(sub)
                processed_count += 1
            except Exception as e:
                logger.error(f"Failed to renew subscription {sub.subscription_code}: {str(e)}")
                sub.mark_past_due()
        
        # Expired subscriptions (past end date)
        expired_subs = Subscription.objects.expired_subscriptions()
        for sub in expired_subs:
            try:
                self.expire_subscription(sub)
                processed_count += 1
            except Exception as e:
                logger.error(f"Failed to expire subscription {sub.subscription_code}: {str(e)}")
        
        # Expired trials
        expired_trials = Subscription.objects.expired_trials()
        for sub in expired_trials:
            try:
                if sub.auto_renew:
                    self.activate_subscription(sub)
                else:
                    self.expire_subscription(sub)
                processed_count += 1
            except Exception as e:
                logger.error(f"Failed to process expired trial {sub.subscription_code}: {str(e)}")
        
        return processed_count