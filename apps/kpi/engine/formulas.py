from decimal import Decimal
from typing import Optional, List, Dict

class HigherIsBetterFormula:
    def calculate(self, actual: Decimal, target: Decimal) -> Decimal:
        if target == 0:
            return Decimal('100') if actual > 0 else Decimal('0')
        score = (actual / target) * 100
        return self._clamp(score)
    def calculate_cumulative(self, actuals: list, targets: list) -> Decimal:
        total_actual = sum(actuals)
        total_target = sum(targets)
        if total_target == 0:
            return Decimal('100') if total_actual > 0 else Decimal('0')
        return (total_actual / total_target) * 100
    def _clamp(self, score: Decimal) -> Decimal:
        return max(Decimal('0'), min(Decimal('100'), score))
    
class LowerIsBetterFormula:
    def calculate(self, actual: Decimal, target: Decimal) -> Decimal:
        if actual == 0:
            return Decimal('100')
        score = (target / actual) * 100
        return self._clamp(score)
    def calculate_cumulative(self, actuals: list, targets: list) -> Decimal:
        total_actual = sum(actuals)
        total_target = sum(targets)
        if total_actual == 0:
            return Decimal('100')
        score = (total_target / total_actual) * 100
        return self._clamp(score)
    def _clamp(self, score: Decimal) -> Decimal:
        return max(Decimal('0'), min(Decimal('100'), score))
    
class CumulativeFormula:
    def __init__(self, calculation_logic: str):
        self.calculation_logic = calculation_logic
    def calculate_ytd(self, actuals: List[Decimal], targets: List[Decimal]) -> Decimal:
        total_actual = sum(actuals)
        total_target = sum(targets)
        if self.calculation_logic == 'HIGHER_IS_BETTER':
            formula = HigherIsBetterFormula()
        else:
            formula = LowerIsBetterFormula()
        return formula.calculate(total_actual, total_target)
    def get_ytd_actual(self, actuals: List[Decimal]) -> Decimal:
        return sum(actuals)
    def get_ytd_target(self, targets: List[Decimal]) -> Decimal:
        return sum(targets)
    
class NonCumulativeFormula:
    def __init__(self, calculation_logic: str):
        self.calculation_logic = calculation_logic
    def calculate(self, actual: Decimal, target: Decimal) -> Decimal:
        if self.calculation_logic == 'HIGHER_IS_BETTER':
            formula = HigherIsBetterFormula()
        else:
            formula = LowerIsBetterFormula()
        return formula.calculate(actual, target)
    
class WeightedAverageFormula:
    def calculate(self, items: List[Dict]) -> Decimal:
        if not items:
            return Decimal('0')
        total_weighted = sum(item['score'] * item['weight'] for item in items)
        total_weight = sum(item['weight'] for item in items)
        if total_weight == 0:
            return Decimal('0')
        return total_weighted / total_weight
    def calculate_with_weights(self, scores: List[Decimal], weights: List[Decimal]) -> Decimal:
        if not scores or not weights or len(scores) != len(weights):
            return Decimal('0')
        total_weighted = sum(s * w for s, w in  zip(scores, weights))
        total_weight = sum(weights)
        if total_weight == 0:
            return Decimal('0')
        return total_weighted / total_weight