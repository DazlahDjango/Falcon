from decimal import Decimal
from django.db import models
from typing import Dict, List, Optional, Any
from django.db import transaction
from django.utils import timezone
from apps.accounts.exceptions import ValidationError
from apps.configs.exceptions import ValidationError
from apps.kpi.models import AnnualTarget, MonthlyPhasing, PhasingLock

class PhasingEngine:
    STRATEGY_MAP = {}
    def __init__(self):
        self._register_strategies()
    def _register_strategies(self):
        from .equal_split import EqualSplitStrategy
        from .seasonal import SeasonalStrategy
        from .custom_pattern import CustomPatternStrategy
        
        self.STRATEGY_MAP = {
            'equal_split': EqualSplitStrategy(),
            'seasonal': SeasonalStrategy(),
            'custom_pattern': CustomPatternStrategy(),
        }
    def phase_target(self, annual_target_id: str, strategy: str = 'equal_split', strategy_params: Optional[Dict] = None) -> List[MonthlyPhasing]:
        annual_target = AnnualTarget.objects.get(id=annual_target_id)
        # Validate strategy_params
        if strategy_params:
            self._validate_strategy_params(strategy, strategy_params)
        # Check if phasing is locked
        if self._is_phasing_locked(annual_target.tenant_id, annual_target.year):
            raise Exception(f"Phasing is locked for performance cycle {annual_target.year}")
        # Check if phasing already exists
        if MonthlyPhasing.objects.filter(annual_target=annual_target).exists():
            raise Exception(f"Phasing already exists for target {annual_target.id}")
        # Get strategy
        phasing_strategy = self.STRATEGY_MAP.get(strategy)
        if not phasing_strategy:
            raise Exception(f"Unknown phasing strategy: {strategy}")
        # Calculate monthly distribution
        monthly_values = phasing_strategy.distribute(
            annual_target.target_value,
            annual_target.kpi,
            strategy_params
        )
        # Create monthly phasing records
        monthly_phasing = []
        with transaction.atomic():
            for month, value in enumerate(monthly_values, start=1):
                phasing = MonthlyPhasing.objects.create(
                    tenant_id=annual_target.tenant_id,
                    annual_target=annual_target,
                    month=month,
                    target_value=value,
                    is_locked=False
                )
                monthly_phasing.append(phasing)
        return monthly_phasing
    def _validate_strategy_params(self, strategy: str, params: Dict):
        if strategy == 'custom_pattern':
            if 'pattern' not in params:
                raise ValidationError("custom_pattern requires 'pattern'")
            pattern = params['pattern']
            if len(pattern) != 12:
                raise ValidationError("Pattern must have exactly 12 values")
            if not all(isinstance(v, (int, float)) and v >= 0 for v in pattern):
                raise ValidationError("Pattern values must be non-negative numbers")
        
        if strategy == 'seasonal':
            if 'weights' in params:
                weights = params['weights']
                if not all(1 <= m <= 12 for m in weights.keys()):
                    raise ValidationError("Month keys must be 1-12")
                if not all(isinstance(w, (int, float)) and 0 <= w <= 1 for w in weights.values()):
                    raise ValidationError("Weights must be between 0 and 1")
    def lock_phasing(self, tenant_id: str, performance_cycle: str, user_id: str) -> bool:
        # Create lock record
        PhasingLock.objects.create(
            tenant_id=tenant_id,
            performance_cycle=performance_cycle,
            locked_by_id=user_id,
            locked_at=timezone.now()
        )
        # Lock all phasing for this cycle
        year = int(performance_cycle[-4:])  # Extract year from FY2025
        updated = MonthlyPhasing.objects.filter(
            tenant_id=tenant_id,
            annual_target__year=year
        ).update(is_locked=True, locked_at=timezone.now(), locked_by_id=user_id)
        return updated > 0
    def verify_phasing_sum(self, annual_target_id: str) -> bool:
        """Verify that monthly phasing sums to annual target."""
        annual_target = AnnualTarget.objects.get(id=annual_target_id)
        total_phased = MonthlyPhasing.objects.filter(
            annual_target=annual_target
        ).aggregate(total=models.Sum('target_value'))['total'] or 0
        return total_phased == annual_target.target_value
    def _is_phasing_locked(self, tenant_id: str, year: int) -> bool:
        """Check if phasing is locked for a period."""
        return PhasingLock.objects.filter(
            tenant_id=tenant_id,
            performance_cycle__contains=str(year)
        ).exists()