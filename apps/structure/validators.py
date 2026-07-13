from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
import re
from apps.structure.constants import MAX_ORG_DEPTH, LEVEL_ORDER, PARENT_LEVEL_MAP

def validate_no_self_parent(value, instance):
    if value and value.id == instance.id:
        raise ValidationError(_("Cannot set self as parent."))

def validate_max_depth(value, instance):
    if value and value.depth >= MAX_ORG_DEPTH - 1:
        raise ValidationError(_("Maximum organization depth of {0} exceeded.").format(MAX_ORG_DEPTH))

def validate_parent_level(value, instance):
    if value and PARENT_LEVEL_MAP.get(instance.level) != value.level:
        raise ValidationError(_("Parent must be at {0} level.").format(PARENT_LEVEL_MAP.get(instance.level)))

def validate_level_order(value):
    if value not in LEVEL_ORDER:
        raise ValidationError(_("Invalid organization level."))

def validate_tenant_match(value, tenant_id):
    if value and value.tenant_id != tenant_id:
        raise ValidationError(_("Resource must belong to same tenant."))

def validate_future_date(value):
    if value and value < timezone.now().date():
        raise ValidationError(_("Date cannot be in the past."))

def validate_date_range(from_date, to_date):
    if from_date and to_date and from_date > to_date:
        raise ValidationError(_("From date cannot be after to date."))

def validate_headcount_limit(value, limit):
    if limit and value and value > limit:
        raise ValidationError(_("Headcount exceeds limit of {0}.").format(limit))

def validate_department_code(value):
    pattern = r'^[A-Z0-9][A-Z0-9\-_]{2,49}$'
    if not re.match(pattern, value):
        raise ValidationError(_("Department code must be 3-50 characters: uppercase letters, numbers, hyphens, underscores. Must start with letter or number."))

def validate_cost_center_code(value):
    pattern = r'^[A-Z0-9][A-Z0-9\-_]{2,19}$'
    if not re.match(pattern, value):
        raise ValidationError(_("Cost center code must be 3-20 characters: uppercase letters, numbers, hyphens, underscores. Must start with letter or number."))

def validate_position_job_code(value):
    pattern = r'^[A-Z]{2,4}-[0-9]{3,5}$'
    if not re.match(pattern, value):
        raise ValidationError(_("Job code format: 2-4 uppercase letters, hyphen, 3-5 digits (e.g., ENG-001, MKT-1234)."))

def validate_grade(value):
    pattern = r'^[A-Z][0-9]{1,2}[A-Z]?$'
    if not re.match(pattern, value):
        raise ValidationError(_("Grade format: letter(s) followed by numbers (e.g., P4, M2, S3, D1)."))

def validate_hierarchy_depth(depth, max_depth=4):
    if depth > max_depth:
        raise ValidationError(_("Hierarchy depth {depth} exceeds maximum allowed {max_depth}.").format(depth=depth, max_depth=max_depth))

def validate_employment_period(effective_from, effective_to):
    if effective_from and effective_to and effective_from > effective_to:
        raise ValidationError(_("Employment effective from date cannot be after effective to date."))
    if effective_from and effective_from > timezone.now().date():
        raise ValidationError(_("Employment effective from date cannot be in the future."))

def validate_budget_amount(amount):
    if amount is not None and amount < 0:
        raise ValidationError(_("Budget amount cannot be negative."))

def validate_allocation_percentage(percentage):
    if percentage < 0 or percentage > 100:
        raise ValidationError(_("Allocation percentage must be between 0 and 100."))

def validate_headcount_limit_positive(limit):
    if limit is not None and limit <= 0:
        raise ValidationError(_("Headcount limit must be positive."))

def validate_seating_capacity(capacity):
    if capacity is not None and capacity < 0:
        raise ValidationError(_("Seating capacity cannot be negative."))

def validate_position_level(level):
    if level < 1 or level > 20:
        raise ValidationError(_("Position level must be between 1 and 20."))

def validate_phone_number(value):
    pattern = r'^\+?[0-9]{10,15}$'
    if value and not re.match(pattern, value):
        raise ValidationError(_("Enter a valid phone number with 10-15 digits."))

def validate_postal_code(value):
    pattern = r'^[A-Z0-9\s\-]{3,20}$'
    if value and not re.match(pattern, value):
        raise ValidationError(_("Enter a valid postal code."))

def validate_path_segment(value):
    forbidden = ['/', '\\', '..', '//']
    if any(f in value for f in forbidden):
        raise ValidationError(_("Path segment contains invalid characters."))

def validate_required_competencies(competencies):
    if not isinstance(competencies, list):
        raise ValidationError(_("Required competencies must be a list."))
    for comp in competencies:
        if not isinstance(comp, dict):
            raise ValidationError(_("Each competency must be a dictionary."))
        required_keys = ['name', 'level']
        for key in required_keys:
            if key not in comp:
                raise ValidationError(_("Competency missing required key: {key}.").format(key=key))

def validate_unit_code(value):
    pattern = r'^[A-Z0-9][A-Z0-9\-_]{1,49}$'
    if not re.match(pattern, value):
        raise ValidationError(_("Unit code must be 2-50 characters: uppercase letters, numbers, hyphens, underscores."))

def validate_section_code(value):
    pattern = r'^[A-Z0-9][A-Z0-9\-_]{2,49}$'
    if not re.match(pattern, value):
        raise ValidationError(_("Section code must be 3-50 characters: uppercase letters, numbers, hyphens, underscores."))

def validate_division_code(value):
    pattern = r'^[A-Z0-9][A-Z0-9\-_]{2,49}$'
    if not re.match(pattern, value):
        raise ValidationError(_("Division code must be 3-50 characters: uppercase letters, numbers, hyphens, underscores."))