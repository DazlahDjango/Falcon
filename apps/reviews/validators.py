# apps/reviews/validators.py
"""
Custom validators for Reviews app
Reusable validation functions for fields
"""

from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from decimal import Decimal
import re


# ========== Score Validators ==========

def validate_score_range(value):
    """
    Validate that a score is between 0 and 100.
    Used for percentage scores (KPI, competency, final scores)
    """
    if value is not None:
        if value < 0 or value > 100:
            raise ValidationError(
                _('Score must be between 0 and 100. Got %(value)s'),
                params={'value': value},
                code='invalid_score_range'
            )


def validate_raw_score(value, min_value=0, max_value=10):
    """
    Validate that a raw score is within allowed range.
    
    Args:
        value: The score to validate
        min_value: Minimum allowed value (default 0)
        max_value: Maximum allowed value (default 10)
    """
    if value is not None:
        if value < min_value or value > max_value:
            raise ValidationError(
                _('Raw score must be between %(min)s and %(max)s. Got %(value)s'),
                params={'min': min_value, 'max': max_value, 'value': value},
                code='invalid_raw_score'
            )


def validate_weight_percentage(value):
    """
    Validate that a weight is between 0 and 100.
    Used for KPI weights, competency weights, etc.
    """
    if value is not None:
        if value < 0 or value > 100:
            raise ValidationError(
                _('Weight must be between 0 and 100 percent. Got %(value)s%%'),
                params={'value': value},
                code='invalid_weight'
            )


def validate_coefficient_value(value):
    """
    Validate that a coefficient is between 0.5 and 1.5.
    Coefficients adjust scores up or down.
    """
    if value is not None:
        value = float(value)
        if value < 0.5 or value > 1.5:
            raise ValidationError(
                _('Coefficient must be between 0.5 and 1.5. Got %(value)s'),
                params={'value': value},
                code='invalid_coefficient'
            )


# ========== Date Validators ==========

def validate_future_date(value):
    """
    Validate that a date is in the future.
    Used for deadlines, target dates, etc.
    """
    from django.utils import timezone
    
    if value and value <= timezone.now().date():
        raise ValidationError(
            _('Date must be in the future. Got %(date)s'),
            params={'date': value},
            code='past_date'
        )


def validate_past_date(value):
    """
    Validate that a date is in the past.
    Used for completed dates, historical records.
    """
    from django.utils import timezone
    
    if value and value >= timezone.now().date():
        raise ValidationError(
            _('Date must be in the past. Got %(date)s'),
            params={'date': value},
            code='future_date'
        )


def validate_date_range(start_date, end_date):
    """
    Validate that end_date is after start_date.
    This is used in model clean() methods, not as a field validator.
    """
    if start_date and end_date and end_date <= start_date:
        raise ValidationError(
            _('End date (%(end)s) must be after start date (%(start)s)'),
            params={'end': end_date, 'start': start_date},
            code='invalid_date_range'
        )


# ========== Text Validators ==========

def validate_not_empty(value):
    """
    Validate that a text field is not empty or just whitespace.
    """
    if value and not value.strip():
        raise ValidationError(
            _('This field cannot be empty or contain only whitespace'),
            code='empty_value'
        )


def validate_max_words(value, max_words=500):
    """
    Validate that text does not exceed maximum word count.
    
    Args:
        value: The text to validate
        max_words: Maximum allowed words (default 500)
    """
    if value:
        word_count = len(value.split())
        if word_count > max_words:
            raise ValidationError(
                _('Text exceeds maximum of %(max)s words. Got %(count)s words'),
                params={'max': max_words, 'count': word_count},
                code='max_words_exceeded'
            )


def validate_rating_label(value):
    """
    Validate rating label format (e.g., "Exceeds Expectations").
    No special characters, proper capitalization.
    """
    if value:
        # Allow letters, spaces, hyphens, and parentheses
        if not re.match(r'^[A-Za-z\s\-\(\)]+$', value):
            raise ValidationError(
                _('Rating label can only contain letters, spaces, hyphens, and parentheses'),
                code='invalid_rating_label'
            )


# ========== JSON Validators ==========

def validate_json_levels(value):
    """
    Validate that levels JSON has the required structure for rating scales.
    """
    if not value:
        raise ValidationError(
            _('Rating scale levels cannot be empty'),
            code='empty_levels'
        )
    
    if not isinstance(value, list):
        raise ValidationError(
            _('Levels must be a JSON array'),
            code='invalid_levels_type'
        )
    
    if len(value) < 2:
        raise ValidationError(
            _('Rating scale must have at least 2 levels'),
            code='insufficient_levels'
        )
    
    for idx, level in enumerate(value):
        if 'value' not in level:
            raise ValidationError(
                _('Level %(index)s missing "value" field'),
                params={'index': idx + 1},
                code='missing_value'
            )
        
        if 'label' not in level:
            raise ValidationError(
                _('Level %(index)s missing "label" field'),
                params={'index': idx + 1},
                code='missing_label'
            )
        
        if 'color' not in level:
            raise ValidationError(
                _('Level %(index)s missing "color" field'),
                params={'index': idx + 1},
                code='missing_color'
            )


def validate_json_success_metrics(value):
    """
    Validate that success metrics JSON has valid structure for PIPs.
    Example: {"sales_target": 80, "quality_score": 90}
    """
    if value:
        if not isinstance(value, dict):
            raise ValidationError(
                _('Success metrics must be a JSON object'),
                code='invalid_metrics_type'
            )
        
        for key, val in value.items():
            if not isinstance(val, (int, float)):
                raise ValidationError(
                    _('Metric "%(key)s" value must be a number'),
                    params={'key': key},
                    code='invalid_metric_value'
                )
            
            if val < 0 or val > 100:
                raise ValidationError(
                    _('Metric "%(key)s" must be between 0 and 100'),
                    params={'key': key},
                    code='metric_out_of_range'
                )


# ========== Color Validators ==========

def validate_hex_color(value):
    """
    Validate that a color value is a valid hex color code.
    Examples: #FF0000, #00FF00, #0000FF, #fff
    """
    if value:
        # Remove # if present
        color = value.lstrip('#')
        
        # Check length
        if len(color) not in [3, 6]:
            raise ValidationError(
                _('Hex color must be 3 or 6 characters (excluding #)'),
                code='invalid_hex_length'
            )
        
        # Check characters
        if not all(c in '0123456789ABCDEFabcdef' for c in color):
            raise ValidationError(
                _('Hex color can only contain 0-9, A-F, a-f'),
                code='invalid_hex_chars'
            )


# ========== Percentage Validators ==========

def validate_percentage(value, allow_zero=True, allow_hundred=True):
    """
    Validate that a value is a valid percentage.
    
    Args:
        value: The percentage to validate
        allow_zero: Allow 0% (default True)
        allow_hundred: Allow 100% (default True)
    """
    if value is not None:
        min_val = 0 if allow_zero else 1
        max_val = 100 if allow_hundred else 99
        
        if value < min_val or value > max_val:
            raise ValidationError(
                _('Percentage must be between %(min)s and %(max)s. Got %(value)s%%'),
                params={'min': min_val, 'max': max_val, 'value': value},
                code='invalid_percentage'
            )


def validate_bonus_percentage(value):
    """
    Validate bonus percentage (0-200%).
    Bonuses can exceed 100% for exceptional performance.
    """
    if value is not None:
        if value < 0 or value > 200:
            raise ValidationError(
                _('Bonus percentage must be between 0 and 200. Got %(value)s%%'),
                params={'value': value},
                code='invalid_bonus'
            )


# ========== ID Validators ==========

def validate_uuid_format(value):
    """
    Validate that a string is in UUID format.
    Used for GenericForeignKey object_id fields.
    """
    if value:
        uuid_pattern = r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
        if not re.match(uuid_pattern, value, re.IGNORECASE):
            raise ValidationError(
                _('Value must be a valid UUID format'),
                code='invalid_uuid'
            )


# ========== Choice Validators ==========

def validate_choice(value, valid_choices):
    """
    Validate that a value is in the allowed choices.
    
    Args:
        value: The value to validate
        valid_choices: List or tuple of allowed values
    """
    if value and value not in valid_choices:
        raise ValidationError(
            _('%(value)s is not a valid choice. Allowed: %(choices)s'),
            params={'value': value, 'choices': ', '.join(valid_choices)},
            code='invalid_choice'
        )


# ========== Combined Validators (for model clean methods) ==========

def validate_weights_sum(weights_dict, expected_sum=100, tolerance=5):
    """
    Validate that a dictionary of weights sums to expected value.
    
    Args:
        weights_dict: Dictionary of weight names and values
        expected_sum: Expected total (default 100)
        tolerance: Allowed deviation (default 5)
    
    Returns:
        tuple: (is_valid, total, error_message)
    """
    total = sum(weights_dict.values())
    is_valid = abs(total - expected_sum) <= tolerance
    
    if not is_valid:
        error_msg = f"Weights sum to {total}%. Expected {expected_sum}% ±{tolerance}%"
        return False, total, error_msg
    
    return True, total, None


def validate_calendar_order(dates_dict):
    """
    Validate that dates are in chronological order.
    
    Args:
        dates_dict: Dictionary of date_name: date_value in expected order
    
    Returns:
        tuple: (is_valid, error_message)
    """
    date_items = list(dates_dict.items())
    
    for i in range(len(date_items) - 1):
        current_name, current_date = date_items[i]
        next_name, next_date = date_items[i + 1]
        
        if current_date and next_date and current_date >= next_date:
            error_msg = f"{next_name} must be after {current_name}"
            return False, error_msg
    
    return True, None