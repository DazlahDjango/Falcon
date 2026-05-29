from decimal import Decimal
from typing import List, Dict, Tuple, Optional
from datetime import date
from django.core.exceptions import ValidationError
from ..validators import *
from ..exceptions import *

class ValidationService:
    @staticmethod
    def validate_budget_cascade(budget_items: List[Dict], total_budget: Decimal) -> None:
        valid, error, total = validate_budget_allocation(budget_items, total_budget)
        if not valid:
            raise BudgetAllocationError(error)
    
    @staticmethod
    def validate_cascade_weights(weights: Dict[str, Decimal]) -> None:
        """Validate cascade weights"""
        valid, error, total = validate_cascade_weights(weights)
        if not valid:
            raise CascadeWeightError(error)
    
    @staticmethod
    def validate_department_budget(department_id: str, allocated_budget: Decimal, total_org_budget: Decimal) -> None:
        """Validate department budget"""
        valid, error = validate_department_budget(department_id, allocated_budget, total_org_budget)
        if not valid:
            raise DepartmentBudgetError(error)
    
    @staticmethod
    def validate_unique(model, fields: Dict, exclude_id: str = None) -> None:
        """Validate unique constraints"""
        valid, error = validate_unique_constraints(model, fields, exclude_id)
        if not valid:
            raise UniqueConstraintError(error)
    
    @staticmethod
    def validate_reference(model, field_name: str, value: str) -> None:
        """Validate referential integrity"""
        valid, error = validate_referential_integrity(model, field_name, value)
        if not valid:
            raise ReferentialIntegrityError(error)
    
    @staticmethod
    def validate_date_range(start_date: date, end_date: date, allow_same: bool = True) -> None:
        """Validate date range"""
        valid, error = validate_date_range(start_date, end_date, allow_same)
        if not valid:
            raise ValidationError(error)
    
    @staticmethod
    def validate_period_overlap(start_date: date, end_date: date, existing_ranges: List[Tuple[date, date]]) -> None:
        """Validate period overlap"""
        valid, error = validate_period_overlap(start_date, end_date, existing_ranges)
        if not valid:
            raise ValidationError(error)
    
    @staticmethod
    def validate_kpi_dependencies(source_kpi_id: str, target_kpi_id: str) -> None:
        """Validate KPI dependencies"""
        valid, error = validate_kpi_dependencies(source_kpi_id, target_kpi_id)
        if not valid:
            raise ValidationError(error)
    
    @staticmethod
    def validate_kpi_formula(formula: Dict) -> None:
        """Validate KPI formula"""
        valid, errors = validate_kpi_formula(formula)
        if not valid:
            raise InvalidFormulaError(f"Invalid formula: {'; '.join(errors)}")
    
    @staticmethod
    def validate_weight_distribution(weights: List[Decimal]) -> None:
        """Validate weight distribution"""
        valid, error, total = validate_weight_distribution(weights)
        if not valid:
            raise WeightDistributionError(error)
    
    @staticmethod
    def validate_score_calculation(actual: Decimal, target: Decimal, logic: str) -> Decimal:
        """Validate and calculate score"""
        valid, error, score = validate_score_calculation(actual, target, logic)
        if not valid:
            raise ScoreCalculationError(error)
        return score
    
    @staticmethod
    def validate_thresholds(green_threshold: Decimal, yellow_threshold: Decimal) -> None:
        """Validate traffic light thresholds"""
        valid, error = validate_thresholds(green_threshold, yellow_threshold)
        if not valid:
            raise ThresholdValidationError(error)
    
    @staticmethod
    def validate_performance_targets(min_target: Decimal, max_target: Decimal, kpi_type: str = None) -> None:
        """Validate performance targets"""
        valid, error = validate_performance_targets(min_target, max_target, kpi_type)
        if not valid:
            raise TargetRangeError(error)
    
    @staticmethod
    def validate_csv_headers(headers: List[str], required_headers: List[str]) -> None:
        """Validate CSV headers"""
        valid, missing = validate_csv_headers(headers, required_headers)
        if not valid:
            raise MissingHeadersError(f"Missing required headers: {', '.join(missing)}")
    
    @staticmethod
    def validate_csv_row(row: Dict, required_fields: List[str], field_validators: Dict = None) -> None:
        """Validate CSV row"""
        valid, errors = validate_csv_row(row, required_fields, field_validators)
        if not valid:
            raise DataValidationError(f"Row validation failed: {'; '.join(errors)}")
    
    @staticmethod
    def validate_batch_size(items: List, max_size: int = 1000) -> None:
        """Validate batch size"""
        valid, error = validate_batch_size(items, max_size)
        if not valid:
            raise BatchSizeExceededError(error)
    
    @staticmethod
    def validate_batch_items(items: List, required_fields: List[str]) -> None:
        """Validate batch items"""
        valid, errors = validate_batch_items(items, required_fields)
        if not valid:
            raise DataValidationError(f"Batch validation failed: {len(errors)} items have errors")