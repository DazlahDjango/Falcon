import stripe
from django.conf import settings
from typing import Optional, Dict, Any
from django.utils import timezone
import logging
logger = logging.getLogger(__name__)

class StripeClient:
    def __init__(self):
        stripe.api_key = settings.STRIPE_SECRET_KEY
        self.stripe = stripe
    def create_customer(self, email: str, name: str = None, metadata: Dict = None) -> stripe.Customer:
        params = {
            'email': email,
            'metadata': metadata or {},
        }
        if name:
            params['name'] = name
        customer = self.stripe.Customer.create(**params)
        logger.info(f"Created Stripe customer: {customer.id} for {email}")
        return customer
    def get_customer(self, customer_id: str) -> stripe.Customer:
        return self.stripe.Customer.retrieve(customer_id)
    def update_customer(self, customer_id: str, **kwargs) -> stripe.Customer:
        return self.stripe.Customer.modify(customer_id, **kwargs)
    def create_subscription(self, customer_id: str, price_id: str, trial_days: int = None, metadata: Dict = None) -> stripe.Subscription:
        params = {
            'customer': customer_id,
            'items': [{'price': price_id}],
            'metadata': metadata or {},
        }
        if trial_days:
            params['trial_period_days'] = trial_days
        subscription = self.stripe.Subscription.create(**params)
        logger.info(f"Created subscription: {subscription.id} for customer: {customer_id}")
        return subscription
    def get_subscription(self, subscription_id: str) -> stripe.Subscription:
        return self.stripe.Subscription.retrieve(subscription_id)
    def update_subscription(self, subscription_id: str, price_id: str = None, cancel_at_period_end: bool = None, metadata: Dict = None) -> stripe.Subscription:
        params = {}
        if price_id:
            params['items'] = [{'price': price_id}]
        if cancel_at_period_end is not None:
            params['cancel_at_period_end'] = cancel_at_period_end
        if metadata:
            params['metadata'] = metadata
        if not params:
            return self.get_subscription(subscription_id)
        return self.stripe.Subscription.modify(subscription_id, **params)
    def create_customer_portal_session(self, customer_id: str, return_url: str) -> stripe.billing_portal.Session:
        session = self.stripe.billing_portal.Session.create(
            customer=customer_id,
            return_url=return_url,
        )
        return session
    def get_invoice(self, invoice_id: str) -> stripe.Invoice:
        return self.stripe.Invoice.retrieve(invoice_id)
    def get_payment_intent(self, payment_intent_id: str) -> stripe.PaymentIntent:
        return self.stripe.PaymentIntent.retrieve(payment_intent_id)
    def construct_webhook_event(self, payload: bytes, sig_header: str, endpoint_secret: str) -> stripe.Event:
        """Construct and verify a webhook event."""
        return self.stripe.Webhook.construct_event(payload, sig_header, endpoint_secret)

    def list_prices(self, product_id: str = None, active: bool = True) -> list:
        """List prices from Stripe."""
        params = {'active': active, 'limit': 100}
        if product_id:
            params['product'] = product_id
        return self.stripe.Price.list(**params).data

    def list_products(self, active: bool = True) -> list:
        """List products from Stripe."""
        return self.stripe.Product.list(active=active, limit=100).data