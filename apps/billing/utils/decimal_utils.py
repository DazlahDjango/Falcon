# billing/utils/decimal_utils.py
"""
Decimal utilities for precise financial calculations.
"""
from decimal import Decimal, ROUND_HALF_UP
from typing import Union


DECIMAL_PLACES = Decimal('0.01')


def round_decimal(value: Union[Decimal, float, int], places: int = 2) -> Decimal:
    """
    Round a decimal value to specified decimal places.
    Uses ROUND_HALF_UP (standard rounding).
    """
    if isinstance(value, (float, int)):
        value = Decimal(str(value))
    
    decimal_places = Decimal('0.1') ** places
    return value.quantize(decimal_places, rounding=ROUND_HALF_UP)


def calculate_percentage(part: Union[Decimal, float, int], whole: Union[Decimal, float, int]) -> Decimal:
    """
    Calculate percentage (part / whole * 100).
    """
    part = Decimal(str(part))
    whole = Decimal(str(whole))
    
    if whole == 0:
        return Decimal('0')
    
    return round_decimal((part / whole) * 100, 1)


def decimal_to_cents(amount: Union[Decimal, float, int]) -> int:
    """Convert decimal amount to cents (integer)."""
    if isinstance(amount, (float, int)):
        amount = Decimal(str(amount))
    
    return int(amount * 100)


def cents_to_decimal(cents: int) -> Decimal:
    """Convert cents to decimal amount."""
    return Decimal(str(cents)) / 100


def add_tax(amount: Decimal, tax_rate: Decimal) -> Decimal:
    """
    Add tax to an amount.
    
    Args:
        amount: Base amount
        tax_rate: Tax rate as decimal (e.g., 0.16 for 16%)
    
    Returns:
        Amount including tax
    """
    tax_amount = (amount * tax_rate).quantize(DECIMAL_PLACES, rounding=ROUND_HALF_UP)
    return amount + tax_amount


def apply_discount(amount: Decimal, discount_rate: Decimal, is_percentage: bool = True) -> Decimal:
    """
    Apply discount to an amount.
    
    Args:
        amount: Original amount
        discount_rate: Discount rate
        is_percentage: If True, discount_rate is percentage; if False, it's fixed amount
    
    Returns:
        Discounted amount
    """
    if is_percentage:
        discount_amount = (amount * discount_rate).quantize(DECIMAL_PLACES, rounding=ROUND_HALF_UP)
    else:
        discount_amount = Decimal(str(discount_rate))
    
    discounted = amount - discount_amount
    return max(Decimal('0'), discounted.quantize(DECIMAL_PLACES, rounding=ROUND_HALF_UP))


def calculate_prorated_amount(
    full_amount: Decimal,
    days_used: int,
    total_days: int
) -> Decimal:
    """Calculate prorated amount based on days used."""
    if total_days <= 0:
        return Decimal('0')
    
    daily_rate = full_amount / Decimal(str(total_days))
    prorated = daily_rate * Decimal(str(days_used))
    
    return prorated.quantize(DECIMAL_PLACES, rounding=ROUND_HALF_UP)