from abc import ABC, abstractmethod
from decimal import Decimal
from typing import Optional
from django.core.exceptions import ValidationError

class BaseCalculator(ABC):
    def __init__(self, kpi):
        self.kpi = kpi
        self.decimal_places = kpi.decimal_places if hasattr(kpi, 'decimal_places') else 2
    @abstractmethod
    def calculate(self, actual: Decimal, target: Decimal) -> Decimal:
        pass
    def validate_inputs(self, actual: Decimal, target: Decimal) -> None:
        if actual is None or target is None:
            raise ValidationError('Both actual and target values are required')
        if target == 0:
            raise ValidationError("Target cannot be zero value")
    def round_score(self, score: Decimal) -> Decimal:
        return round(score, self.decimal_places)
    def clamp_score(self, score: Decimal, min_value: Decimal = Decimal('0'), max_value: Decimal = Decimal('100')) -> Decimal:
        return max(min_value, min(score, max_value))
    
class NumericCalculator(BaseCalculator):
    def calculate(self, actual: Decimal, target: Decimal) -> Decimal:
        self.validate_inputs(actual, target)
        if self.kpi.calculation_logic == 'HIGHER_IS_BETTER':
            score = (actual / target) * 100
        else:
            score = (target / actual) * 100
        return self.clamp_score(self.round_score(score))
    
class PercentageCalculator(BaseCalculator):
    def calculate(self, actual: Decimal, target: Decimal) -> Decimal:
        self.validate_inputs(actual, target)
        if actual < 1 and actual > 0:
            actual = actual * 100
        if target < 1 and target > 0:
            target = target * 100
        if self.kpi.calculation_logic == 'HIGHER_IS_BETTER':
            score = (actual / target) * 100
        else:
            score = (target / actual) * 100
        if score > 100:
            score = Decimal('100')
        return self.clamp_score(self.round_score(score))
    
class FinancialCalculator(BaseCalculator):
    def calculate(self, actual: Decimal, target: Decimal) -> Decimal:
        self.validate_inputs(actual, target)
        if self.kpi.calculation_logic == 'HIGHER_IS_BETTER':
            score = (actual / target) * 100
        else:
            if actual == 0:
                if target == 0:
                    score = Decimal('100')
                else:
                    score = Decimal('0')
            else:
                score = (target / actual) * 100
        # allow scores over 100 for financial over-achievement
        return self.round_score(score)
    
class MilestoneCalculator(BaseCalculator):
    def calculate(self, actual: Decimal, target: Decimal) -> Decimal:
        if actual >= 1:
            return Decimal('100')
        if target > 1 and actual < target:
            return (actual / target) * 100
        return Decimal('0')
    def validate_inputs(self, actual: Decimal, target: Decimal) -> None:
        if actual is None:
            raise ValidationError("Actual value is required")
        
class TimeCalculator(BaseCalculator):
    def calculate(self, actual: Decimal, target: Decimal) -> Decimal:
        self.validate_inputs(actual, target)
        if actual == 0:
            return Decimal('100')
        if actual <= target:
            return Decimal('100')
        penalty = ((actual - target) / target) * 100
        score = max(Decimal('0'), Decimal('100') - penalty)
        return self.clamp_score(self.round_score(score))
    
class ImpactCalculator(BaseCalculator):
    def calculate(self, actual: Decimal, target: Decimal):
        self.validate_inputs(actual, target)
        if target <= 10:
            score = (actual / target) * 100
        else:
            if self.kpi.calculation_logic == 'HIGHER_IS_BETTER':
                score = (actual / target) * 100
            else:
                score = (target / actual) * 100
        return self.clamp_score(self.round_score(score))