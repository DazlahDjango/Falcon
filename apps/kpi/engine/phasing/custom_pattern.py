from decimal import Decimal
from typing import List, Dict, Optional


class CustomPatternStrategy:
    def distribute(self, total: Decimal, kpi, params: Optional[Dict] = None) -> List[Decimal]:
        if not params or 'pattern' not in params:
            raise ValueError("Custom pattern requires 'pattern' parameter")
        pattern = params['pattern']
        if len(pattern) != 12:
            raise ValueError("Pattern must have exactly 12 values")
        if all(isinstance(v, (int, float, Decimal)) and v <= 1 for v in pattern):
            total_weight = sum(pattern)
            monthly_values = [total * Decimal(str(v / total_weight)) for v in pattern]
        else:
            total_pattern = sum(pattern)
            monthly_values = [total * Decimal(str(v / total_pattern)) for v in pattern]
        if sum(monthly_values) != total:
            diff = total - sum(monthly_values)
            monthly_values[-1] += diff
        return monthly_values