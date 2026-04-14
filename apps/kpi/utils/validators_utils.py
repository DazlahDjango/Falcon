from decimal import Decimal
from typing import Dict, List, Tuple, Optional, Any
from django.core.exceptions import ValidationError
from datetime import date
from ..constants import KPIType, CalculationLogic, MeasureType
from .decimal_utils import DecimalUtils

class ValidatorUtils:
    @classmethod
    def validate_period(cls, year: int, month: int, allow_future: bool = False) -> Tuple[bool, str]:
        """Validate period (year, month)"""
        if not (1 <= month <= 12):
            return False, f"Invalid month: {month}. Must be between 1 and 12."
        
        if year < 2000 or year > 2100:
            return False, f"Invalid year: {year}. Must be between 2000 and 2100."
        
        if not allow_future:
            from django.utils import timezone
            now = timezone.now()
            if year > now.year or (year == now.year and month > now.month):
                return False, f"Cannot use future period: {year}-{month:02d}"
        
        return True, "Valid"
    
    @classmethod
    def validate_kpi_structure(cls, kpi_data: Dict) -> List[str]:
        """Validate KPI structure for consistency"""
        errors = []
        
        # Check required fields
        required = ['name', 'code', 'kpi_type', 'calculation_logic', 'measure_type']
        for field in required:
            if not kpi_data.get(field):
                errors.append(f"Missing required field: {field}")
        
        # Check KPI type compatibility
        kpi_type = kpi_data.get('kpi_type')
        if kpi_type == KPIType.PERCENTAGE:
            if kpi_data.get('target_min') and kpi_data.get('target_min') > 100:
                errors.append("Percentage target min cannot exceed 100")
            if kpi_data.get('target_max') and kpi_data.get('target_max') > 100:
                errors.append("Percentage target max cannot exceed 100")
        
        if kpi_type == KPIType.MILESTONE:
            if kpi_data.get('decimal_places', 0) > 0:
                errors.append("Milestone KPIs should have 0 decimal places")
        
        if kpi_type == KPIType.TIME:
            if kpi_data.get('calculation_logic') != CalculationLogic.LOWER_IS_BETTER:
                errors.append("Time KPIs should use LOWER_IS_BETTER logic")
        
        # Check target range
        target_min = kpi_data.get('target_min')
        target_max = kpi_data.get('target_max')
        if target_min is not None and target_max is not None:
            if target_min > target_max:
                errors.append(f"Target min ({target_min}) cannot be greater than target max ({target_max})")
        
        return errors
    
    @classmethod
    def validate_target_consistency(cls, annual_target: Decimal, 
                                     monthly_targets: List[Decimal]) -> Tuple[bool, str, Decimal]:
        """Validate that monthly targets sum to annual target"""
        total_monthly = DecimalUtils.sum_decimal_list(monthly_targets)
        difference = total_monthly - annual_target
        
        if abs(difference) > Decimal('0.01'):
            return False, f"Monthly sum ({total_monthly}) does not equal annual target ({annual_target})", difference
        
        return True, "Valid", difference
    
    @classmethod
    def validate_cascade_integrity(cls, parent_target: Decimal, 
                                    child_targets: List[Decimal]) -> Tuple[bool, str, Decimal]:
        """Validate that child targets sum to parent target"""
        total_children = DecimalUtils.sum_decimal_list(child_targets)
        difference = total_children - parent_target
        
        if abs(difference) > Decimal('0.01'):
            return False, f"Child targets sum ({total_children}) does not equal parent ({parent_target})", difference
        
        return True, "Valid", difference
    
    @classmethod
    def validate_weight_sum(cls, weights: List[Decimal], total_expected: Decimal = Decimal('100')) -> Tuple[bool, str]:
        """Validate that weights sum to expected total"""
        total = DecimalUtils.sum_decimal_list(weights)
        
        if abs(total - total_expected) > Decimal('0.01'):
            return False, f"Weight sum ({total}) does not equal expected ({total_expected})"
        
        return True, "Valid"
    
    @classmethod
    def validate_duplicate_entries(cls, model, filters: Dict, exclude_id: str = None) -> Tuple[bool, str]:
        """Check for duplicate entries"""
        queryset = model.objects.filter(**filters)
        if exclude_id:
            queryset = queryset.exclude(id=exclude_id)
        
        if queryset.exists():
            return False, f"Duplicate entry found for {filters}"
        
        return True, "Valid"
    
    @classmethod
    def validate_date_range(cls, start_date: date, end_date: date) -> Tuple[bool, str]:
        """Validate date range (start <= end)"""
        if start_date and end_date and start_date > end_date:
            return False, f"Start date ({start_date}) cannot be after end date ({end_date})"
        
        return True, "Valid"
    
    @classmethod
    def validate_thresholds(cls, green_threshold: Decimal, 
                            yellow_threshold: Decimal) -> Tuple[bool, str]:
        """Validate traffic light thresholds"""
        if green_threshold <= yellow_threshold:
            return False, f"Green threshold ({green_threshold}) must be greater than yellow threshold ({yellow_threshold})"
        
        if yellow_threshold < 0 or green_threshold > 100:
            return False, "Thresholds must be between 0 and 100"
        
        return True, "Valid"


def validate_period(year: int, month: int, allow_future: bool = False) -> None:
    """Validate period, raises ValidationError if invalid"""
    valid, message = ValidatorUtils.validate_period(year, month, allow_future)
    if not valid:
        raise ValidationError(message)


def validate_kpi_structure(kpi_data: Dict) -> None:
    """Validate KPI structure, raises ValidationError if invalid"""
    errors = ValidatorUtils.validate_kpi_structure(kpi_data)
    if errors:
        raise ValidationError(errors)


def validate_target_consistency(annual_target: Decimal, monthly_targets: List[Decimal]) -> None:
    """Validate target consistency, raises ValidationError if invalid"""
    valid, message, _ = ValidatorUtils.validate_target_consistency(annual_target, monthly_targets)
    if not valid:
        raise ValidationError(message)


def validate_cascade_integrity(parent_target: Decimal, child_targets: List[Decimal]) -> None:
    """Validate cascade integrity, raises ValidationError if invalid"""
    valid, message, _ = ValidatorUtils.validate_cascade_integrity(parent_target, child_targets)
    if not valid:
        raise ValidationError(message)