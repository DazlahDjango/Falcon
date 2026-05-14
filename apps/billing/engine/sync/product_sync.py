import logging
from typing import Dict, Any, List, Optional
from django.db import transaction
from billing.services.stripe_client import StripeClient
from billing.models import Plan, PlanFeature
from billing.exceptions import SyncError
logger = logging.getLogger(__name__)

class ProductSync:
    def __init__(self):
        self.stripe = StripeClient()
    
    @transaction.atomic
    def sync_all_products(self) -> Dict[str, Any]:
        result = {
            'created': 0,
            'updated': 0,
            'skipped': 0,
            'errors': []
        }
        try:
            products = self.stripe.list_products(active=True)
            for product in products:
                try:
                    self._sync_single_product(product)
                    result['updated'] += 1
                except Exception as e:
                    logger.error(f"Failed to sync product {product.id}: {str(e)}")
                    result['errors'].append({'product_id': product.id, 'error': str(e)})
                    result['skipped'] += 1
            logger.info(f"Product sync completed: {result}")
            return result
        except Exception as e:
            logger.error(f"Product sync failed: {str(e)}")
            raise SyncError(f"Failed to sync products: {str(e)}")
    
    @transaction.atomic
    def sync_single_product(self, stripe_product_id: str) -> Optional[Plan]:
        try:
            product = self.stripe.stripe.Product.retrieve(stripe_product_id)
            return self._sync_single_product(product)
        except Exception as e:
            logger.error(f"Failed to sync product {stripe_product_id}: {str(e)}")
            raise SyncError(f"Failed to sync product: {str(e)}")
    
    def _sync_single_product(self, stripe_product) -> Plan:
        plan_type = stripe_product.metadata.get('plan_type')
        if not plan_type:
            plan_type = self._infer_plan_type(stripe_product.name)
        plan, created = Plan.objects.update_or_create(
            stripe_product_id=stripe_product.id,
            defaults={
                'name': stripe_product.name,
                'slug': self._generate_slug(stripe_product.name),
                'description': stripe_product.description or '',
                'plan_type': plan_type,
                'is_active': stripe_product.active,
                'metadata': {
                    'stripe_metadata': stripe_product.metadata,
                    'last_synced': timezone.now().isoformat()
                }
            }
        )
        if created:
            logger.info(f"Created new plan: {plan.name} ({plan.id})")
        else:
            logger.info(f"Updated plan: {plan.name} ({plan.id})")
        return plan
    
    @transaction.atomic
    def delete_synced_product(self, stripe_product_id: str) -> bool:
        try:
            plan = Plan.objects.get(stripe_product_id=stripe_product_id)
            plan.is_active = False
            plan.save(update_fields=['is_active'])
            logger.info(f"Deactivated plan: {plan.name}")
            return True
        except Plan.DoesNotExist:
            logger.warning(f"Plan with stripe_product_id {stripe_product_id} not found")
            return False
    
    def _infer_plan_type(self, product_name: str) -> str:
        name_lower = product_name.lower()
        if 'trial' in name_lower:
            return Plan.PLAN_TRIAL
        elif 'basic' in name_lower:
            return Plan.PLAN_BASIC
        elif 'professional' in name_lower or 'pro' in name_lower:
            return Plan.PLAN_PROFESSIONAL
        elif 'enterprise' in name_lower:
            return Plan.PLAN_ENTERPRISE
        else:
            return Plan.PLAN_BASIC
    
    def _generate_slug(self, name: str) -> str:
        import re
        slug = name.lower()
        slug = re.sub(r'[^a-z0-9]+', '-', slug)
        slug = slug.strip('-')
        return slug