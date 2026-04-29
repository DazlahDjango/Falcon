from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
import re

def validate_department_code(value):
    pattern = r'^[A-Z0-9][A-Z0-9\-_]{2,49}$'
    if not re.match(pattern, value):
        raise ValidationError(_("Department code must be 3-50 characters: uppercase letters, numbers, hyphens, underscores. Must start with letter or number."))

def validate_cost_center_code(value):
    pattern = r'^[A-Z0-9]{3,20}$'
    if not re.match(pattern, value):
        raise ValidationError(_("Cost center code must be 3-20 uppercase alphanumeric characters."))

def validate_position_job_code(value):
    pattern = r'^[A-Z]{2,4}-[0-9]{3,5}$'
    if not re.match(pattern, value):
        raise ValidationError(_("Job code format: 2-4 uppercase letters, hyphen, 3-5 digits (e.g., ENG-001, MKT-1234)."))

def validate_grade(value):
    pattern = r'^[A-Z][0-9]{1,2}[A-Z]?$'
    if not re.match(pattern, value):
        raise ValidationError(_("Grade format: letter(s) followed by numbers (e.g., P4, M2, S3, D1)."))

def validate_reporting_weight(weight):
    if weight < 0 or weight > 1:
        raise ValidationError(_("Reporting weight must be between 0 and 1."))

def validate_hierarchy_depth(depth, max_depth=20):
    if depth > max_depth:
        raise ValidationError(_("Hierarchy depth {depth} exceeds maximum allowed {max_depth}.").format(depth=depth, max_depth=max_depth))

def validate_date_range(start_date, end_date):
    if start_date and end_date and start_date > end_date:
        raise ValidationError(_("Start date cannot be after end date."))

def validate_not_future_date(date):
    if date and date > timezone.now().date():
        raise ValidationError(_("Date cannot be in the future."))

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

def validate_headcount_limit(limit):
    if limit is not None and limit <= 0:
        raise ValidationError(_("Headcount limit must be positive."))

def validate_team_max_members(max_members):
    if max_members is not None and max_members <= 0:
        raise ValidationError(_("Team maximum members must be positive."))

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

def validate_notification_preferences(preferences):
    if not isinstance(preferences, dict):
        raise ValidationError(_("Notification preferences must be a dictionary."))
    valid_keys = ['email', 'in_app', 'sms', 'webhook']
    invalid_keys = [k for k in preferences.keys() if k not in valid_keys]
    if invalid_keys:
        raise ValidationError(_("Invalid notification preference keys: {keys}.").format(keys=', '.join(invalid_keys)))