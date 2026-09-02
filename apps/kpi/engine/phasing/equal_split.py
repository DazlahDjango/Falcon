from decimal import Decimal, ROUND_HALF_UP
from typing import List, Dict, Optional

class EqualSplitStrategy:
    def distribute(self, total: Decimal, kpi, params: Optional[Dict] = None) -> List[Decimal]:
        monthly = (total / Decimal('12')).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        monthly_values = [monthly for _ in range(12)]
        total_sum = sum(monthly_values)
        if total_sum != total:
            diff = total - total_sum
            monthly_values[-1] += diff
        return monthly_values