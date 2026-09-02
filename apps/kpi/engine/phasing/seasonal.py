from decimal import Decimal, ROUND_HALF_UP
from typing import List, Dict, Optional


class SeasonalStrategy:
    DEFAULT_WEIGHTS = {
        1: 0.07,   # January
        2: 0.07,   # February
        3: 0.08,   # March
        4: 0.08,   # April
        5: 0.08,   # May
        6: 0.08,   # June
        7: 0.08,   # July
        8: 0.08,   # August
        9: 0.08,   # September
        10: 0.08,  # October
        11: 0.08,  # November
        12: 0.14,  # December (holiday season)
    }
    def distribute(self, total: Decimal, kpi, params: Optional[Dict] = None) -> List[Decimal]:
        weights = params.get('weights', self.DEFAULT_WEIGHTS) if params else self.DEFAULT_WEIGHTS
        monthly_values = []
        for month in range(1, 13):
            w = weights.get(month) if month in weights else weights.get(str(month), 0.0833)
            val = (total * Decimal(str(w))).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
            monthly_values.append(val)
        total_sum = sum(monthly_values)
        if total_sum != total:
            diff = total - total_sum
            monthly_values[-1] += diff
        return monthly_values