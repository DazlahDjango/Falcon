from decimal import Decimal
from typing import List, Dict, Optional

class EqualSplitStrategy:
    def distribute(self, total: Decimal, kpi, params: Optional[Dict] = None) -> List[Decimal]:
        monthly = total / Decimal('12')
        monthly_values = [monthly for _ in range(12)]
        if sum(monthly_values) != total:
            diff = total - sum(monthly_values)
            monthly_values[-1] += diff
        return monthly_values