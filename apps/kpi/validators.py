from decimal import Decimal
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
import re

from apps.organisations.models.department import Department


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
    if value is not None and (value < 2000 or value > current_year + 10):
        raise ValidationError(_(f"Year must be between 2000 and {current_year + 10}."))

def validate_future_date(date):
    """Validate that date is not in the past"""
    if date and date < timezone.now().date():
        raise ValidationError(_("Date cannot be in the past."))

def validate_future_period(year, month):
    now = timezone.now()
    if year > now.year or (year == now.year and month > now.month):
        raise ValidationError(_("Cannot set targets for future periods."))

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

def validate_strategic_objective(objective):
    if objective and len(objective) > 255:
        raise ValidationError(_("Strategic objective cannot exceed 255 characters."))

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
    from apps.organisations.models import Hierarchy as ReportingHierarchy
    
    if not ReportingHierarchy.objects.filter(manager_id=supervisor_id, employee_id=employee_id).exists():
        raise ValidationError(_("Supervisor does not have access to this employee."))

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
            from apps.organisations.models import Department
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