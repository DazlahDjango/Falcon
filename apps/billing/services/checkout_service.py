import logging
from typing import Optional, Dict, Any
from django.conf import settings
from django.urls import reverse
from apps.billing.services.stripe_client import StripeClient
from apps.billing.services.subscription_service import SubscriptionService
from apps.billing.models import Plan
from apps.billing.exceptions import SubscriptionError
logger = logging.getLogger(__name__)

class CheckoutService:
    def __init__(self):
        self.stripe = StripeClient()
        self.subscription_service = SubscriptionService()
    
    def create_checkout_session(self, tenant, plan: Plan, billing_interval: str, success_url: str = None, cancel_url: str = None, allow_promotion_codes: bool = True, metadata: Dict = None) -> Dict[str, Any]:
        if hasattr(tenant, 'subscription') and tenant.subscription:
            existing = tenant.subscription
            if existing.is_active:
                raise SubscriptionError("Tenant already has an active subscription")
        stripe_customer = self.subscription_service._get_or_create_stripe_customer(tenant)
        stripe_price_id = self.subscription_service._get_stripe_price_id(plan, billing_interval)
        if not stripe_price_id:
            raise SubscriptionError(f"No Stripe price configured for {plan.name}")
        if not success_url:
            success_url = f"{settings.FRONTEND_URL}/billing/success?session_id={{CHECKOUT_SESSION_ID}}"
        if not cancel_url:
            cancel_url = f"{settings.FRONTEND_URL}/billing/cancel"
        try:
            session = self.stripe.create_checkout_session(
                customer_id=stripe_customer.id,
                price_id=stripe_price_id,
                success_url=success_url,
                cancel_url=cancel_url,
                mode='subscription',
                allow_promotion_codes=allow_promotion_codes,
                metadata={
                    'tenant_id': str(tenant.id),
                    'plan_id': str(plan.id),
                    'plan_type': plan.plan_type,
                    'billing_interval': billing_interval,
                    **(metadata or {})
                }
            )
            logger.info(f"Checkout session created: {session.id} for tenant {tenant.id}")
            return {
                'session_id': session.id,
                'checkout_url': session.url,
                'stripe_customer_id': stripe_customer.id
            }
        except Exception as e:
            logger.error(f"Failed to create checkout session: {str(e)}")
            raise SubscriptionError(f"Checkout creation failed: {str(e)}")
    
    def get_checkout_session(self, session_id: str) -> Dict[str, Any]:
        try:
            session = self.stripe.stripe.checkout.Session.retrieve(session_id)
            return {
                'id': session.id,
                'status': session.status,
                'customer': session.customer,
                'customer_email': session.customer_email,
                'subscription': session.subscription,
                'payment_status': session.payment_status,
                'amount_total': session.amount_total / 100 if session.amount_total else 0,
                'currency': session.currency,
                'success_url': session.success_url,
                'cancel_url': session.cancel_url,
                'metadata': session.metadata
            }
        except Exception as e:
            logger.error(f"Failed to retrieve checkout session: {str(e)}")
            raise SubscriptionError(f"Session retrieval failed: {str(e)}")