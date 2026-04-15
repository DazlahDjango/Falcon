from decimal import Decimal, ROUND_HALF_UP, ROUND_DOWN, ROUND_UP
from typing import Union, List, Optional
import math


class DecimalUtils:
    DEFAULT_PRECISION = 2
    MAX_PRECISION = 10
    @classmethod
    def safe_decimal(cls, value: Union[int, float, str, Decimal, None], 
                     default: Decimal = Decimal('0')) -> Decimal:
        if value is None:
            return default
        try:
            if isinstance(value, Decimal):
                return value
            return Decimal(str(value))
        except (TypeError, ValueError):
            return default
    
    @classmethod
    def round_decimal(cls, value: Union[int, float, str, Decimal], places: int = DEFAULT_PRECISION, rounding: str = 'HALF_UP') -> Decimal:
        decimal_value = cls.safe_decimal(value)
        rounding_modes = {
            'HALF_UP': ROUND_HALF_UP,
            'DOWN': ROUND_DOWN,
            'UP': ROUND_UP,
        }
        rounding_mode = rounding_modes.get(rounding, ROUND_HALF_UP)
        quantize_str = '1.' + '0' * places
        return decimal_value.quantize(Decimal(quantize_str), rounding=rounding_mode)
    
    @classmethod
    def sum_decimal_list(cls, values: List[Union[int, float, str, Decimal]]) -> Decimal:
        total = Decimal('0')
        for v in values:
            total += cls.safe_decimal(v)
        return total
    
    @classmethod
    def average_decimal_list(cls, values: List[Union[int, float, str, Decimal]]) -> Decimal:
        if not values:
            return Decimal('0')
        total = cls.sum_decimal_list(values)
        return total / Decimal(str(len(values)))
    
    @classmethod
    def percentage_change(cls, old_value: Union[int, float, str, Decimal], new_value: Union[int, float, str, Decimal]) -> Decimal:
        old = cls.safe_decimal(old_value)
        new = cls.safe_decimal(new_value)
        if old == 0:
            if new == 0:
                return Decimal('0')
            return Decimal('100') if new > 0 else Decimal('-100')
        return ((new - old) / old) * Decimal('100')
    
    @classmethod
    def clamp_decimal(cls, value: Union[int, float, str, Decimal], min_value: Union[int, float, str, Decimal] = Decimal('0'), max_value: Union[int, float, str, Decimal] = Decimal('100')) -> Decimal:
        decimal_value = cls.safe_decimal(value)
        min_dec = cls.safe_decimal(min_value)
        max_dec = cls.safe_decimal(max_value)
        if decimal_value < min_dec:
            return min_dec
        if decimal_value > max_dec:
            return max_dec
        return decimal_value
    
    @classmethod
    def weighted_average(cls, values: List[Decimal], weights: List[Decimal]) -> Decimal:
        if not values or not weights or len(values) != len(weights):
            return Decimal('0')
        total_weighted = sum(v * w for v, w in zip(values, weights))
        total_weight = sum(weights)
        if total_weight == 0:
            return Decimal('0')
        return total_weighted / total_weight
    
    @classmethod
    def is_within_tolerance(cls, value1: Decimal, value2: Decimal, tolerance: Decimal = Decimal('0.01')) -> bool:
        return abs(value1 - value2) <= tolerance

# Convenience functions
def safe_decimal(value: Union[int, float, str, Decimal, None], default: Decimal = Decimal('0')) -> Decimal:
    return DecimalUtils.safe_decimal(value, default)


def round_decimal(value: Union[int, float, str, Decimal], places: int = 2) -> Decimal:
    return DecimalUtils.round_decimal(value, places)


def sum_decimal_list(values: List[Union[int, float, str, Decimal]]) -> Decimal:
    return DecimalUtils.sum_decimal_list(values)


def average_decimal_list(values: List[Union[int, float, str, Decimal]]) -> Decimal:
    return DecimalUtils.average_decimal_list(values)


def percentage_change(old_value: Union[int, float, str, Decimal],
                      new_value: Union[int, float, str, Decimal]) -> Decimal:
    return DecimalUtils.percentage_change(old_value, new_value)


def clamp_decimal(value: Union[int, float, str, Decimal],
                  min_value: Union[int, float, str, Decimal] = Decimal('0'),
                  max_value: Union[int, float, str, Decimal] = Decimal('100')) -> Decimal:
    return DecimalUtils.clamp_decimal(value, min_value, max_value)