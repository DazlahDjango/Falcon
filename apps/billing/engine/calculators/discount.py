# billing/engine/calculators/discount.py
from decimal import Decimal, ROUND_HALF_UP
from typing import Dict, Optional, List, Tuple
from dataclasses import dataclass
from datetime import datetime, date
from django.utils import timezone

@dataclass
class DiscountResult:
    original_amount: Decimal
    discount_amount: Decimal
    final_amount: Decimal
    discount_type: str
    discount_percentage: Decimal
    applied_coupon_id: Optional[str] = None

class DiscountCalculator:
    DECIMAL_PLACES = Decimal('0.01')
    @classmethod
    def calculate_percentage_discount(cls, amount: Decimal, percentage: Decimal, max_discount: Optional[Decimal] = None) -> DiscountResult:
        if percentage <= 0:
            return DiscountResult(
                original_amount=amount,
                discount_amount=Decimal('0.00'),
                final_amount=amount,
                discount_type='percentage',
                discount_percentage=Decimal('0.00')
            )
        discount_amount = (amount * (percentage / Decimal('100'))).quantize(
            cls.DECIMAL_PLACES, rounding=ROUND_HALF_UP
        )
        if max_discount and discount_amount > max_discount:
            discount_amount = max_discount
        final_amount = (amount - discount_amount).quantize(cls.DECIMAL_PLACES, rounding=ROUND_HALF_UP)
        return DiscountResult(
            original_amount=amount,
            discount_amount=discount_amount,
            final_amount=final_amount,
            discount_type='percentage',
            discount_percentage=percentage
        )
    
    @classmethod
    def calculate_fixed_discount(cls, amount: Decimal, discount_amount: Decimal, minimum_amount: Optional[Decimal] = None) -> DiscountResult:
        if discount_amount <= 0:
            return DiscountResult(
                original_amount=amount,
                discount_amount=Decimal('0.00'),
                final_amount=amount,
                discount_type='fixed',
                discount_percentage=Decimal('0.00')
            )
        if discount_amount > amount:
            discount_amount = amount
        final_amount = amount - discount_amount
        if minimum_amount and final_amount < minimum_amount:
            final_amount = minimum_amount
            discount_amount = amount - final_amount
        discount_percentage = (discount_amount / amount * Decimal('100')).quantize(
            cls.DECIMAL_PLACES, rounding=ROUND_HALF_UP
        ) if amount > 0 else Decimal('0.00')
        return DiscountResult(
            original_amount=amount,
            discount_amount=discount_amount,
            final_amount=final_amount,
            discount_type='fixed',
            discount_percentage=discount_percentage
        )
    
    @classmethod
    def calculate_volume_discount(cls, unit_price: Decimal, quantity: int, volume_tiers: List[Dict]) -> DiscountResult:
        total_amount = unit_price * Decimal(str(quantity))
        applicable_discount = Decimal('0.00')
        for tier in sorted(volume_tiers, key=lambda x: x.get('min_quantity', 0), reverse=True):
            if quantity >= tier.get('min_quantity', 0):
                applicable_discount = Decimal(str(tier.get('discount_percentage', 0)))
                break
        if applicable_discount <= 0:
            return DiscountResult(
                original_amount=total_amount,
                discount_amount=Decimal('0.00'),
                final_amount=total_amount,
                discount_type='percentage',
                discount_percentage=Decimal('0.00')
            )
        discount_amount = (total_amount * (applicable_discount / Decimal('100'))).quantize(
            cls.DECIMAL_PLACES, rounding=ROUND_HALF_UP
        )
        return DiscountResult(
            original_amount=total_amount,
            discount_amount=discount_amount,
            final_amount=total_amount - discount_amount,
            discount_type='percentage',
            discount_percentage=applicable_discount
        )
    
    @classmethod
    def apply_coupon(cls, amount: Decimal, coupon: Dict, current_date: Optional[datetime] = None) -> Optional[DiscountResult]:
        now = current_date or timezone.now()
        valid_from = coupon.get('valid_from')
        valid_to = coupon.get('valid_to')
        if valid_from and now < valid_from:
            return None
        if valid_to and now > valid_to:
            return None
        max_uses = coupon.get('max_uses')
        used_count = coupon.get('used_count', 0)
        if max_uses and used_count >= max_uses:
            return None
        min_amount = coupon.get('minimum_order_amount')
        if min_amount and amount < Decimal(str(min_amount)):
            return None
        discount_type = coupon.get('discount_type')
        discount_value = Decimal(str(coupon.get('discount_value', 0)))
        if discount_type == 'percentage':
            max_discount = coupon.get('max_discount_amount')
            if max_discount:
                max_discount = Decimal(str(max_discount))
            result = cls.calculate_percentage_discount(amount, discount_value, max_discount)
        elif discount_type == 'fixed':
            result = cls.calculate_fixed_discount(amount, discount_value)
        else:
            return None
        result.applied_coupon_id = coupon.get('coupon_id')
        return result
    
    @classmethod
    def calculate_early_payment_discount(cls, amount: Decimal, discount_percentage: Decimal, days_until_due: int, paid_on_day: int) -> DiscountResult:
        if paid_on_day > days_until_due:
            return DiscountResult(
                original_amount=amount,
                discount_amount=Decimal('0.00'),
                final_amount=amount,
                discount_type='percentage',
                discount_percentage=Decimal('0.00')
            )
        early_ratio = Decimal(str(max(0, days_until_due - paid_on_day))) / Decimal(str(days_until_due))
        applicable_discount = discount_percentage * early_ratio
        return cls.calculate_percentage_discount(amount, applicable_discount)