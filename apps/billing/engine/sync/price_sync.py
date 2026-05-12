import logging
from decimal import Decimal
from typing import Dict, Any, List, Optional
from django.db import transaction
from django.utils import timezone
from billing.services.stripe_client import StripeClient
from billing.models import Price, Plan
from billing.exceptions import SyncError
logger = logging.getLogger(__name__)

class PriceSync:
    def __init__(self):
        self.stripe = StripeClient()
    
    @transaction.atomic
    def sync_all_prices(self, product_id: str = None) -> Dict[str, Any]:
        result = {
            'created': 0,
            'updated': 0,
            'skipped': 0,
            'errors': []
        }
        try:
            prices = self.stripe.list_prices(product_id=product_id, active=True)
            
            for price in prices:
                try:
                    self._sync_single_price(price)
                    result['updated'] += 1
                except Exception as e:
                    logger.error(f"Failed to sync price {price.id}: {str(e)}")
                    result['errors'].append({'price_id': price.id, 'error': str(e)})
                    result['skipped'] += 1
            logger.info(f"Price sync completed: {result}")
            return result
        except Exception as e:
            logger.error(f"Price sync failed: {str(e)}")
            raise SyncError(f"Failed to sync prices: {str(e)}")
    
    def _sync_single_price(self, stripe_price) -> Price:
        plan = None
        if stripe_price.product:
            try:
                plan = Plan.objects.get(stripe_product_id=stripe_price.product)
            except Plan.DoesNotExist:
                logger.warning(f"Plan not found for product {stripe_price.product}")
        interval = Price.INTERVAL_MONTH
        if stripe_price.recurring:
            interval = stripe_price.recurring.get('interval', 'month')
        price, created = Price.objects.update_or_create(
            stripe_price_id=stripe_price.id,
            defaults={
                'stripe_product_id': stripe_price.product,
                'plan': plan,
                'amount': Decimal(stripe_price.unit_amount) / 100 if stripe_price.unit_amount else Decimal('0.00'),
                'currency': stripe_price.currency.upper(),
                'interval': interval,
                'interval_count': stripe_price.recurring.get('interval_count', 1) if stripe_price.recurring else 1,
                'is_active': stripe_price.active,
                'is_recurring': stripe_price.recurring is not None,
                'last_synced_at': timezone.now()
            }
        )
        if created:
            logger.info(f"Created new price: {price.amount} {price.currency}/{price.interval}")
        else:
            logger.info(f"Updated price: {price.amount} {price.currency}/{price.interval}")
        return price
    
    @transaction.atomic
    def sync_price_by_id(self, stripe_price_id: str) -> Optional[Price]:
        try:
            price = self.stripe.stripe.Price.retrieve(stripe_price_id)
            return self._sync_single_price(price)
        except Exception as e:
            logger.error(f"Failed to sync price {stripe_price_id}: {str(e)}")
            raise SyncError(f"Failed to sync price: {str(e)}")
    
    def update_plan_prices(self, plan: Plan) -> Dict[str, Any]:
        result = {
            'monthly_price': None,
            'yearly_price': None,
            'updated': False
        }
        prices = Price.objects.filter(
            stripe_product_id=plan.stripe_product_id,
            is_active=True,
            is_deleted=False
        )
        for price in prices:
            if price.interval == Price.INTERVAL_MONTH:
                plan.price_monthly = price.amount
                plan.stripe_price_id_monthly = price.stripe_price_id
                result['monthly_price'] = price.amount
            elif price.interval == Price.INTERVAL_YEAR:
                plan.price_yearly = price.amount
                plan.stripe_price_id_yearly = price.stripe_price_id
                result['yearly_price'] = price.amount
        plan.save(update_fields=['price_monthly', 'price_yearly', 'stripe_price_id_monthly', 'stripe_price_id_yearly'])
        result['updated'] = True
        logger.info(f"Updated plan {plan.name} prices: monthly={plan.price_monthly}, yearly={plan.price_yearly}")
        return result