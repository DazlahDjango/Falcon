"""
Billing Integration Service - Handles Stripe/PayPal integration
"""

import logging
import stripe
from django.conf import settings
from django.db import transaction
from datetime import timedelta
from django.utils import timezone

from apps.organisations.models import Subscription
from apps.organisations.constants import SubscriptionStatus

logger = logging.getLogger(__name__)

# Initialize Stripe
stripe.api_key = getattr(settings, 'STRIPE_SECRET_KEY', '')


class BillingIntegrationService:
    """
    Service for integrating with payment providers
    """
    
    @classmethod
    def create_checkout_session(cls, organisation, plan, success_url, cancel_url):
        """
        Creates a Stripe Checkout Session for a subscription.
        """
        try:
            # Map plan to Stripe Price ID (you'll need to configure these in Stripe)
            price_id = cls._get_stripe_price_id(plan)
            
            session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=[{
                    'price': price_id,
                    'quantity': 1,
                }],
                mode='subscription',
                success_url=success_url,
                cancel_url=cancel_url,
                client_reference_id=str(organisation.id),
                metadata={
                    'organisation_id': str(organisation.id), 
                    'plan_code': plan.code,
                    'plan_name': plan.name
                }
            )
            
            logger.info(f"Created checkout session for {organisation.name}")
            return session.url
            
        except Exception as e:
            logger.error(f"Failed to create checkout session: {e}")
            return None
    
    @classmethod
    def handle_webhook(cls, payload, sig_header):
        """
        Handles Stripe webhooks (e.g., checkout.session.completed).
        """
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
            )
        except ValueError as e:
            logger.error(f"Invalid payload: {e}")
            raise ValueError("Invalid payload")
        except stripe.error.SignatureVerificationError as e:
            logger.error(f"Invalid signature: {e}")
            raise ValueError("Invalid signature")
        
        # Handle different event types
        if event['type'] == 'checkout.session.completed':
            cls._handle_checkout_completed(event)
        elif event['type'] == 'invoice.paid':
            cls._handle_invoice_paid(event)
        elif event['type'] == 'invoice.payment_failed':
            cls._handle_invoice_failed(event)
        elif event['type'] == 'customer.subscription.deleted':
            cls._handle_subscription_cancelled(event)
        
        return True
    
    @classmethod
    def _handle_checkout_completed(cls, event):
        """Handle successful checkout"""
        session = event['data']['object']
        organisation_id = session['metadata']['organisation_id']
        plan_code = session['metadata']['plan_code']
        
        from apps.organisations.models import Plan, Subscription
        
        plan = Plan.objects.filter(code=plan_code).first()
        
        with transaction.atomic():
            subscription, created = Subscription.objects.update_or_create(
                organisation_id=organisation_id,
                defaults={
                    'plan': plan,
                    'plan_type': plan_code,
                    'status': SubscriptionStatus.ACTIVE,
                    'start_date': timezone.now(),
                    'end_date': timezone.now() + timedelta(days=365 if plan.price_yearly > 0 else 30),
                    'stripe_subscription_id': session.get('subscription'),
                    'stripe_customer_id': session.get('customer'),
                    'auto_renew': True,
                    'is_active': True
                }
            )
            logger.info(f"Subscription activated for organisation {organisation_id}")
    
    @classmethod
    def _handle_invoice_paid(cls, event):
        """Handle successful invoice payment"""
        invoice = event['data']['object']
        logger.info(f"Invoice paid: {invoice.get('id')}")
        # TODO: Create invoice record in database
    
    @classmethod
    def _handle_invoice_failed(cls, event):
        """Handle failed invoice payment"""
        invoice = event['data']['object']
        logger.warning(f"Invoice payment failed: {invoice.get('id')}")
        # TODO: Send notification to organisation
    
    @classmethod
    def _handle_subscription_cancelled(cls, event):
        """Handle subscription cancellation"""
        subscription_data = event['data']['object']
        stripe_subscription_id = subscription_data.get('id')
        
        from apps.organisations.models import Subscription
        
        subscription = Subscription.objects.filter(
            stripe_subscription_id=stripe_subscription_id
        ).first()
        
        if subscription:
            subscription.status = SubscriptionStatus.CANCELLED
            subscription.auto_renew = False
            subscription.cancelled_at = timezone.now()
            subscription.save()
            logger.info(f"Subscription cancelled for {subscription.organisation.name}")
    
    @classmethod
    def _get_stripe_price_id(cls, plan):
        """
        Get Stripe Price ID for a plan
        You'll need to configure these in Stripe dashboard
        """
        # In production, you'd store price IDs in the Plan model
        price_mapping = {
            'basic': 'price_basic_monthly',
            'professional': 'price_professional_monthly',
            'enterprise': 'price_enterprise_monthly',
        }
        
        # Return yearly price if yearly subscription
        # For now, return monthly
        return price_mapping.get(plan.code, f"price_{plan.code}_monthly")
    
    @classmethod
    def create_customer(cls, organisation):
        """
        Create a customer in Stripe
        """
        try:
            customer = stripe.Customer.create(
                email=organisation.contact_email,
                name=organisation.name,
                metadata={'organisation_id': str(organisation.id)}
            )
            
            # Update organisation with Stripe customer ID
            if hasattr(organisation, 'subscription'):
                subscription = organisation.subscription
                subscription.stripe_customer_id = customer.id
                subscription.save()
            
            logger.info(f"Created Stripe customer for: {organisation.name}")
            return customer.id
            
        except Exception as e:
            logger.error(f"Failed to create Stripe customer: {e}")
            return None
    
    @classmethod
    def create_subscription(cls, subscription):
        """
        Create a subscription in Stripe
        """
        try:
            price_id = cls._get_stripe_price_id(subscription.plan)
            
            stripe_subscription = stripe.Subscription.create(
                customer=subscription.stripe_customer_id,
                items=[{'price': price_id}],
                trial_end=int(subscription.trial_end_date.timestamp()) if subscription.trial_end_date else None,
                metadata={
                    'organisation_id': str(subscription.organisation.id),
                    'subscription_id': str(subscription.id)
                }
            )
            
            subscription.stripe_subscription_id = stripe_subscription.id
            subscription.save()
            
            logger.info(f"Created Stripe subscription for: {subscription.organisation.name}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to create Stripe subscription: {e}")
            return False