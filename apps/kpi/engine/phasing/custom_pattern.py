from decimal import Decimal, ROUND_HALF_UP
from typing import List, Dict, Optional


class CustomPatternStrategy:
    def distribute(self, total: Decimal, kpi, params: Optional[Dict] = None) -> List[Decimal]:
        if not params or 'pattern' not in params:
            raise ValueError("Custom pattern requires 'pattern' parameter")
        pattern = params['pattern']
        if len(pattern) != 12:
            raise ValueError("Pattern must have exactly 12 values")
        
        total_weight = Decimal(str(sum(pattern)))
        if total_weight == 0:
            raise ValueError("Sum of pattern values cannot be zero")
            
        monthly_values = [
            (total * (Decimal(str(v)) / total_weight)).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
            for v in pattern
        ]
        
        total_sum = sum(monthly_values)
        if total_sum != total:
            diff = total - total_sum
            monthly_values[-1] += diff
        return monthly_values