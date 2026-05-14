from decimal import Decimal, ROUND_HALF_UP
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, Tuple
from django.utils import timezone
from dateutil.relativedelta import relativedelta

class ProrationCalculator:
    DECIMAL_PLACES = Decimal('0.01')
    @classmethod
    def calculate_proration(cls, current_price: Decimal, new_price: Decimal, current_period_start: datetime, current_period_end: datetime, change_date: datetime = None) -> Tuple[Decimal, Decimal, Decimal]:
        if change_date is None:
            change_date = timezone.now()
        total_days = (current_period_end - current_period_start).days
        remaining_days = max(0, (current_period_end - change_date).days)
        if total_days <= 0:
            return Decimal('0.00'), Decimal('0.00'), new_price
        current_daily_rate = cls._calculate_daily_rate(current_price, total_days)
        new_daily_rate = cls._calculate_daily_rate(new_price, total_days)
        remaining_value = current_daily_rate * Decimal(str(remaining_days))
        new_value = new_daily_rate * Decimal(str(remaining_days))
        if new_value > remaining_value:
            propation_amount = (new_value - remaining_value).quantize(cls.DECIMAL_PLACES, rounding=ROUND_HALF_UP)
            refund_amount = Decimal('0.00')
            new_charge_amount = propation_amount
        elif new_value < remaining_value:
            propation_amount = (remaining_value - new_value).quantize(cls.DECIMAL_PLACES, rounding=ROUND_HALF_UP)
            refund_amount = propation_amount
            new_charge_amount = Decimal('0.00')
        else:
            propation_amount = Decimal('0.00')
            refund_amount = Decimal('0.00')
            new_charge_amount = Decimal('0.00')
        return propation_amount, refund_amount, new_charge_amount
    @classmethod
    def calculate_trial_proration(cls, full_price: Decimal, trial_days_used: int, total_trial_days: int) -> Decimal:
        if total_trial_days <= 0:
            return full_price
        remaining_ratio = Decimal(str(max(0, total_trial_days - trial_days_used))) / Decimal(str(total_trial_days))
        prorated_amount = (full_price * remaining_ratio).quantize(cls.DECIMAL_PLACES, rounding=ROUND_HALF_UP)
        return prorated_amount
    @classmethod
    def calculate_immediate_downgrade_credit(cls, current_price: Decimal, new_price: Decimal, days_paid_in_advance: int) -> Decimal:
        daily_rate_current = current_price / Decimal('30.44')  
        daily_rate_new = new_price / Decimal('30.44')
        daily_difference = daily_rate_current - daily_rate_new
        credit_amount = (daily_difference * Decimal(str(days_paid_in_advance))).quantize(cls.DECIMAL_PLACES, rounding=ROUND_HALF_UP)
        return max(Decimal('0.00'), credit_amount)
    @classmethod
    def calculate_next_billing_amount(cls, current_plan_price: Decimal, new_plan_price: Decimal, is_upgrade: bool, billing_interval_days: int) -> Decimal:
        if not is_upgrade:
            return Decimal('0.00')
        difference = new_plan_price - current_plan_price
        return difference.quantize(cls.DECIMAL_PLACES, rounding=ROUND_HALF_UP)