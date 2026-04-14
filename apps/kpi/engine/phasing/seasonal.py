from decimal import Decimal
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
            weight = weights.get(month, 0.0833)
            value = total * Decimal(str(weight))
            monthly_values.append(value)
        if sum(monthly_values) != total:
            diff = total - sum(monthly_values)
            monthly_values[-1] += diff
        return monthly_values