import logging
from typing import Dict, Any, Optional
from django.conf import settings
from apps.billing.services.stripe_client import StripeClient
from apps.billing.exceptions import SubscriptionError
logger = logging.getLogger(__name__)

class CustomerPortalService:
    def __init__(self):
        self.stripe = StripeClient()
    
    def create_portal_session(self, tenant, return_url: str = None, configuration_id: str = None) -> Dict[str, Any]:
        if not hasattr(tenant, 'subscription') or not tenant.subscription:
            raise SubscriptionError("Tenant has no subscription")
        subscription = tenant.subscription
        if not subscription.stripe_customer_id:
            raise SubscriptionError("No Stripe customer ID found")
        if not return_url:
            return_url = f"{settings.FRONTEND_URL}/billing"
        try:
            portal_session = self.stripe.create_customer_portal_session(
                customer_id=subscription.stripe_customer_id,
                return_url=return_url
            )
            logger.info(f"Created portal session for tenant {tenant.id}: {portal_session.id}")
            return {
                'portal_url': portal_session.url,
                'session_id': portal_session.id,
                'return_url': return_url
            }
        except Exception as e:
            logger.error(f"Failed to create portal session: {str(e)}")
            raise SubscriptionError(f"Portal session creation failed: {str(e)}")
    
    def get_portal_configuration(self, configuration_id: str = None) -> Optional[Dict]:
        try:
            if configuration_id:
                config = self.stripe.stripe.billing_portal.Configuration.retrieve(configuration_id)
            else:
                configs = self.stripe.stripe.billing_portal.Configuration.list(limit=1)
                config = configs.data[0] if configs.data else None
            if config:
                return {
                    'id': config.id,
                    'is_default': config.is_default,
                    'features': {
                        'customer_update': config.features.customer_update,
                        'invoice_history': config.features.invoice_history,
                        'payment_method_update': config.features.payment_method_update,
                        'subscription_cancel': config.features.subscription_cancel,
                        'subscription_update': config.features.subscription_update,
                    }
                }
            return None
            
        except Exception as e:
            logger.error(f"Failed to get portal configuration: {str(e)}")
            return None