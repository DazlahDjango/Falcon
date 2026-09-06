from decimal import Decimal
from typing import List, Tuple, Dict
from datetime import date
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
import re

from apps.structure.models import Department


def validate_positive_value(value):
    if value is not None and value <= 0:
        raise ValidationError(_("Value must be positive."))

def validate_non_negative_value(value):
    if value is not None and value < 0:
        raise ValidationError(_("Value cannot be negative."))

def validate_percentage(value):
    if value is not None and (value < 0 or value > 100):
        raise ValidationError(_("Percentage must be between 0 and 100."))

def validate_month(value):
    if value is not None and (value < 1 or value > 12):
        raise ValidationError(_("Month must be between 1 and 12."))

def validate_year(value):
    current_year = timezone.now().year
    if value is not None:
        try:
            val_int = int(value)
            if val_int < 2000 or val_int > current_year + 10:
                raise ValidationError(_(f"Year must be between 2000 and {current_year + 10}."))
        except (ValueError, TypeError):
            raise ValidationError(_("Year must be a valid integer."))

def validate_future_date(date):
    """Validate that date is not in the past"""
    if date and date < timezone.now().date():
        raise ValidationError(_("Date cannot be in the past."))

def validate_future_period(year, month=1):
    now = timezone.now()
    try:
        y_int = int(year)
        if y_int < 2000 or y_int > now.year + 10:
            raise ValidationError(_(f"Year must be between 2000 and {now.year + 10}."))
    except (ValueError, TypeError):
        raise ValidationError(_("Invalid year specified."))


def validate_past_period_locked(tenant_id, year, month):
    from .models import PhasingLock
    if PhasingLock.objects.filter(
        tenant_id=tenant_id,
        performance_cycle__contains=str(year)
    ).exists():
        if year < timezone.now().year or (year == timezone.now().year and month < timezone.now().month):
            raise ValidationError(_("Past periods are locked and cannot be modified."))

def validate_kpi_code(code):
    if not re.match(r'^[A-Z0-9_\-]+$', code):
        raise ValidationError(_("KPI code must contain only uppercase letters, numbers, underscores, and hyphens."))
    if len(code) < 2 or len(code) > 50:
        raise ValidationError(_("KPI code must be between 2 and 50 characters."))

def validate_kpi_name(name):
    if not name or len(name.strip()) < 3:
        raise ValidationError(_("KPI name must be at least 3 characters."))
    if len(name) > 255:
        raise ValidationError(_("KPI name cannot exceed 255 characters."))

def validate_weight_sum(weights):
    if not weights:
        return
    total = sum(w.weight for w in weights)
    if abs(total - 100) > 0.01:
        raise ValidationError(_(f"Weights must sum to 100. Current sum: {total}"))

def validate_target_range(min_value, max_value):
    if min_value is not None and max_value is not None and min_value > max_value:
        raise ValidationError(_("Minimum target cannot be greater than maximum target."))

def validate_phasing_sum(monthly_values, annual_target):
    total = sum(monthly_values)
    if abs(total - annual_target) > Decimal('0.01'):
        raise ValidationError(_(f"Monthly phasing sum ({total}) does not equal annual target ({annual_target})."))

def validate_cascade_total(cascade_targets, parent_target):
    total = sum(t.target_value for t in cascade_targets)
    if abs(total - parent_target) > Decimal('0.01'):
        raise ValidationError(_(f"Cascaded targets total ({total}) does not equal parent target ({parent_target})."))

def validate_effective_dates(effective_from, effective_to):
    if effective_from and effective_to and effective_from > effective_to:
        raise ValidationError(_("Effective from date cannot be after effective to date."))

def validate_kpi_dependency(source_kpi, target_kpi):
    if source_kpi == target_kpi:
        raise ValidationError(_("A KPI cannot depend on itself."))

def validate_decimal_precision(value, max_digits=20, decimal_places=2):
    if value is None:
        return
    if abs(value) >= 10 ** (max_digits - decimal_places):
        raise ValidationError(_(f"Value exceeds maximum allowed ({max_digits} digits total)."))

def validate_evidence_file(file):
    max_size = 10 * 1024 * 1024  # 10MB
    if file.size > max_size:
        raise ValidationError(_(f"File size cannot exceed {max_size / 1024 / 1024}MB."))
    allowed_extensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.jpg', '.jpeg', '.png', '.txt']
    file_ext = file.name.lower()[file.name.rfind('.'):] if '.' in file.name else ''
    if file_ext not in allowed_extensions:
        raise ValidationError(_(f"File type not allowed. Allowed: {', '.join(allowed_extensions)}"))

def validate_metadata_schema(metadata, schema=None):
    if not metadata:
        return
    if not isinstance(metadata, dict):
        raise ValidationError(_("Metadata must be a JSON object."))
    if schema:
        # Basic schema validation
        for key, expected_type in schema.items():
            if key in metadata and not isinstance(metadata[key], expected_type):
                raise ValidationError(_(f"Metadata field '{key}' must be of type {expected_type.__name__}."))

def validate_department_hierarchy(department_id, user_id):
    from apps.accounts.models import User
    try:
        user = User.objects.get(id=user_id)
        if department_id and user.department_id != department_id:
            raise ValidationError(_("User does not belong to the specified department."))
    except User.DoesNotExist:
        raise ValidationError(_("User not found."))

def validate_supervisor_access(supervisor_id, employee_id):
    from django.contrib.auth import get_user_model
    User = get_user_model()
    
    try:
        employee = User.objects.get(id=employee_id)
        supervisor = User.objects.get(id=supervisor_id)
        if not supervisor.is_manager_of(employee):
            raise ValidationError(_("Supervisor does not have access to this employee."))
    except User.DoesNotExist:
        raise ValidationError(_("User not found."))

def validate_tenant_isolation(tenant_id, obj_tenant_id):
    if obj_tenant_id and tenant_id != obj_tenant_id:
        raise ValidationError(_("Tenant isolation violation."))

def validate_calculation_period(year, month):
    if month < 1 or month > 12:
        raise ValidationError(_("Month must be between 1 and 12."))
    if year < 2000 or year > 2100:
        raise ValidationError(_("Year must be between 2000 and 2100."))

class KPIWeightValidator:
    def __call__(self, user_id, weights):
        total = sum(weights)
        if abs(total - 100) > 0.01:
            raise ValidationError(_(f"Total weight for user must be 100%. Current: {total}%"))
    def validate_duplicate_kpis(self, kpi_ids):
        if len(kpi_ids) != len(set(kpi_ids)):
            raise ValidationError(_("Duplicate KPIs found in weight assignment."))

class PhasingValidator:
    def validate_monthly_targets(self, monthly_values):
        for month, value in enumerate(monthly_values, 1):
            if value < 0:
                raise ValidationError(_(f"Month {month} target cannot be negative."))
    def validate_seasonal_weights(self, weights):
        if len(weights) != 12:
            raise ValidationError(_("Seasonal weights must have exactly 12 values."))
        total = sum(weights)
        if abs(total - 1.0) > 0.01:
            raise ValidationError(_(f"Seasonal weights must sum to 1.0. Current sum: {total}"))
    def validate_custom_pattern(self, pattern):
        if len(pattern) != 12:
            raise ValidationError(_("Custom pattern must have exactly 12 values."))
        if any(v < 0 for v in pattern):
            raise ValidationError(_("Custom pattern values cannot be negative."))

class CascadeValidator:
    def validate_rule_configuration(self, rule_type, config):
        if rule_type == 'WEIGHTED' and 'weights' not in config:
            raise ValidationError(_("Weighted rule requires 'weights' in configuration."))
        if rule_type == 'WEIGHTED_BY_BUDGET' and 'budgets' not in config:
            raise ValidationError(_("Weighted by budget rule requires 'budgets' in configuration."))
        if rule_type == 'CUSTOM' and 'custom_logic' not in config:
            raise ValidationError(_("Custom rule requires 'custom_logic' in configuration."))
    def validate_entity_ids(self, entity_ids, entity_type):
        """Validate entity IDs exist"""
        if entity_type == 'DEPARTMENT':
            existing = Department.objects.filter(id__in=entity_ids).values_list('id', flat=True)
        else:
            from apps.accounts.models import User
            existing = User.objects.filter(id__in=entity_ids).values_list('id', flat=True)
        missing = set(entity_ids) - set(existing)
        if missing:
            raise ValidationError(_(f"Entities not found: {missing}"))

class ScoreValidator:
    def validate_score_range(self, score):
        if score < 0 or score > 100:
            raise ValidationError(_(f"Score must be between 0 and 100. Current: {score}"))
    def validate_calculation_formula(self, formula):
        valid_formulas = ['higher_is_better', 'lower_is_better']
        if formula not in valid_formulas:
            raise ValidationError(_(f"Invalid formula. Must be one of: {valid_formulas}"))

class DateRangeValidator:
    def __init__(self, start_field='effective_from', end_field='effective_to'):
        self.start_field = start_field
        self.end_field = end_field
    def __call__(self, attrs):
        start = attrs.get(self.start_field)
        end = attrs.get(self.end_field)
        if start and end and start > end:
            raise ValidationError({
                self.end_field: _("End date cannot be before start date.")
            })
        
# Add to existing validators.py

# ============================================================================
# Budget & Cascade Validators
# ============================================================================

def validate_budget_allocation(budget_items: List[Dict], total_budget: Decimal) -> Tuple[bool, str, Decimal]:
    """
    Validate budget allocation sums to total budget
    Returns: (is_valid, error_message, total_allocated)
    """
    total_allocated = Decimal('0')
    
    for item in budget_items:
        amount = Decimal(str(item.get('amount', 0)))
        if amount < 0:
            return False, f"Budget amount cannot be negative: {item.get('name', 'Unknown')}", total_allocated
        total_allocated += amount
    
    if abs(total_allocated - total_budget) > Decimal('0.01'):
        return False, f"Budget allocation sum ({total_allocated}) does not equal total budget ({total_budget})", total_allocated
    
    return True, "", total_allocated


def validate_cascade_weights(weights: Dict[str, Decimal], total: Decimal = Decimal('100')) -> Tuple[bool, str, Decimal]:
    """
    Validate cascade weights sum to 100%
    Returns: (is_valid, error_message, total_weight)
    """
    total_weight = sum(weights.values())
    
    if abs(total_weight - total) > Decimal('0.01'):
        return False, f"Cascade weights sum to {total_weight}%, must be {total}%", total_weight
    
    # Check individual weights
    for entity_id, weight in weights.items():
        if weight < 0:
            return False, f"Weight for {entity_id} cannot be negative", total_weight
        if weight > total:
            return False, f"Weight for {entity_id} exceeds {total}%", total_weight
    
    return True, "", total_weight


def validate_department_budget(department_id: str, allocated_budget: Decimal, total_org_budget: Decimal) -> Tuple[bool, str]:
    """
    Validate department budget against organization budget
    """
    if allocated_budget < 0:
        return False, "Department budget cannot be negative"
    
    if allocated_budget > total_org_budget:
        return False, f"Department budget ({allocated_budget}) exceeds organization budget ({total_org_budget})"
    
    return True, ""


# ============================================================================
# Cross-Model Validators
# ============================================================================

def validate_unique_constraints(model, fields: Dict, exclude_id: str = None) -> Tuple[bool, str]:
    """
    Validate unique constraints across model
    """
    queryset = model.objects.filter(**fields)
    if exclude_id:
        queryset = queryset.exclude(id=exclude_id)
    
    if queryset.exists():
        field_names = ', '.join(fields.keys())
        return False, f"A record with these {field_names} already exists"
    
    return True, ""


def validate_referential_integrity(model, field_name: str, value: str, error_message: str = None) -> Tuple[bool, str]:
    """
    Validate that referenced record exists
    """
    try:
        model.objects.get(id=value)
        return True, ""
    except model.DoesNotExist:
        message = error_message or f"Referenced {model.__name__} does not exist: {value}"
        return False, message


# ============================================================================
# Date & Period Validators
# ============================================================================

def validate_date_range(start_date: date, end_date: date, allow_same: bool = True) -> Tuple[bool, str]:
    """
    Validate date range (start <= end)
    """
    if not start_date or not end_date:
        return False, "Both start and end dates are required"
    
    if start_date > end_date:
        return False, f"Start date ({start_date}) cannot be after end date ({end_date})"
    
    if not allow_same and start_date == end_date:
        return False, "Start and end dates must be different"
    
    return True, ""


def validate_period_overlap(start_date: date, end_date: date, existing_ranges: List[Tuple[date, date]]) -> Tuple[bool, str]:
    """
    Validate that period does not overlap with existing periods
    """
    for existing_start, existing_end in existing_ranges:
        if not (end_date < existing_start or start_date > existing_end):
            return False, f"Period overlaps with existing period: {existing_start} to {existing_end}"
    
    return True, ""


def validate_fiscal_period(year: int, month: int, fiscal_start_month: int = 1) -> Tuple[bool, str]:
    """
    Validate period is within fiscal year
    """
    if fiscal_start_month == 1:
        return True, ""
    
    fiscal_year_start = date(year, fiscal_start_month, 1)
    fiscal_year_end = date(year + 1, fiscal_start_month - 1, 1) if fiscal_start_month > 1 else date(year, 12, 31)
    
    period_date = date(year, month, 1)
    
    if period_date < fiscal_year_start or period_date > fiscal_year_end:
        return False, f"Period {year}-{month:02d} is outside fiscal year {fiscal_year_start.year}-{fiscal_year_end.year}"
    
    return True, ""


# ============================================================================
# KPI Specific Validators
# ============================================================================

def validate_kpi_dependencies(source_kpi_id: str, target_kpi_id: str) -> Tuple[bool, str]:
    """
    Validate KPI dependency relationship (no self-reference)
    """
    if source_kpi_id == target_kpi_id:
        return False, "A KPI cannot depend on itself"
    
    return True, ""


def validate_kpi_formula(formula: Dict) -> Tuple[bool, List[str]]:
    """
    Validate KPI formula structure
    """
    errors = []
    
    if not isinstance(formula, dict):
        errors.append("Formula must be a JSON object")
        return False, errors
    
    required_fields = ['type', 'expression']
    for field in required_fields:
        if field not in formula:
            errors.append(f"Formula missing required field: {field}")
    
    # Validate formula type
    allowed_types = ['simple', 'weighted', 'custom']
    if formula.get('type') not in allowed_types:
        errors.append(f"Invalid formula type. Must be one of: {', '.join(allowed_types)}")
    
    # Validate expression
    if 'expression' in formula and not isinstance(formula['expression'], str):
        errors.append("Formula expression must be a string")
    
    return len(errors) == 0, errors


# ============================================================================
# Weight & Score Validators
# ============================================================================

def validate_weight_distribution(weights: List[Decimal], total: Decimal = Decimal('100')) -> Tuple[bool, str, Decimal]:
    """
    Validate weight distribution across KPIs
    """
    if not weights:
        return False, "No weights provided", Decimal('0')
    
    total_weight = sum(weights)
    
    if abs(total_weight - total) > Decimal('0.01'):
        return False, f"Weight sum ({total_weight}) does not equal required total ({total})", total_weight
    
    # Check individual weights
    for idx, weight in enumerate(weights):
        if weight < 0:
            return False, f"Weight at index {idx} is negative", total_weight
        if weight > total:
            return False, f"Weight at index {idx} exceeds {total}%", total_weight
    
    return True, "", total_weight


def validate_score_calculation(actual: Decimal, target: Decimal, logic: str) -> Tuple[bool, str, Decimal]:
    """
    Validate score calculation inputs
    """
    if target == 0:
        return False, "Target cannot be zero", Decimal('0')
    
    if actual < 0:
        return False, "Actual value cannot be negative", Decimal('0')
    
    if logic not in ['HIGHER_IS_BETTER', 'LOWER_IS_BETTER']:
        return False, f"Invalid calculation logic: {logic}", Decimal('0')
    
    # Calculate expected score range
    if logic == 'HIGHER_IS_BETTER':
        score = (actual / target) * 100
    else:
        score = (target / actual) * 100 if actual > 0 else Decimal('0')
    
    if score < 0 or score > 100:
        return False, f"Calculated score {score} is outside valid range (0-100)", score
    
    return True, "", score


# ============================================================================
# Performance Threshold Validators
# ============================================================================

def validate_thresholds(green_threshold: Decimal, yellow_threshold: Decimal) -> Tuple[bool, str]:
    """
    Validate traffic light thresholds
    """
    if green_threshold <= yellow_threshold:
        return False, f"Green threshold ({green_threshold}) must be greater than yellow threshold ({yellow_threshold})"
    
    if yellow_threshold < 0:
        return False, f"Yellow threshold cannot be negative: {yellow_threshold}"
    
    if green_threshold > 100:
        return False, f"Green threshold cannot exceed 100: {green_threshold}"
    
    if yellow_threshold > 100:
        return False, f"Yellow threshold cannot exceed 100: {yellow_threshold}"
    
    return True, ""


def validate_performance_targets(min_target: Decimal, max_target: Decimal, kpi_type: str = None) -> Tuple[bool, str]:
    """
    Validate performance targets based on KPI type
    """
    if min_target is not None and max_target is not None:
        if min_target > max_target:
            return False, f"Minimum target ({min_target}) cannot be greater than maximum target ({max_target})"
    
    if kpi_type == 'PERCENTAGE':
        if min_target is not None and min_target > 100:
            return False, f"Percentage minimum target cannot exceed 100: {min_target}"
        if max_target is not None and max_target > 100:
            return False, f"Percentage maximum target cannot exceed 100: {max_target}"
    
    if min_target is not None and min_target < 0:
        return False, f"Target cannot be negative: {min_target}"
    
    return True, ""


# ============================================================================
# Import/Export Validators
# ============================================================================

def validate_csv_headers(headers: List[str], required_headers: List[str]) -> Tuple[bool, List[str]]:
    """
    Validate CSV file headers
    """
    missing = [h for h in required_headers if h not in headers]
    if missing:
        return False, missing
    
    return True, []


def validate_csv_row(row: Dict, required_fields: List[str], field_validators: Dict = None) -> Tuple[bool, List[str]]:
    """
    Validate CSV row data
    """
    errors = []
    
    for field in required_fields:
        if field not in row or not row[field]:
            errors.append(f"Missing required field: {field}")
    
    if field_validators:
        for field, validator in field_validators.items():
            if field in row and row[field]:
                try:
                    valid, error = validator(row[field])
                    if not valid:
                        errors.append(f"Field '{field}': {error}")
                except Exception as e:
                    errors.append(f"Field '{field}': {str(e)}")
    
    return len(errors) == 0, errors


# ============================================================================
# Bulk Operation Validators
# ============================================================================

def validate_batch_size(items: List, max_size: int = 1000) -> Tuple[bool, str]:
    if len(items) > max_size:
        return False, f"Batch size ({len(items)}) exceeds maximum allowed ({max_size})"
    return True,


def validate_batch_items(items: List, required_fields: List[str]) -> Tuple[bool, List[Dict]]:
    """
    Validate each item in a batch
    """
    errors = []
    
    for idx, item in enumerate(items):
        missing = [f for f in required_fields if f not in item or not item[f]]
        if missing:
            errors.append({
                'index': idx,
                'missing_fields': missing,
                'item': item
            })
    
    return len(errors) == 0, errors