from decimal import Decimal
from datetime import date, timedelta
from django.utils import timezone
from django.core.exceptions import ValidationError
import json
import re

# ========== Score Calculation Helpers ==========

def calculate_percentage(part, whole):
    """
    Calculate percentage of part relative to whole.
    
    Args:
        part: The part value (numerator)
        whole: The whole value (denominator)
    
    Returns:
        float: Percentage rounded to 2 decimal places, or 0 if whole is 0
    """
    if not whole or whole == 0:
        return 0.0
    return round((float(part) / float(whole)) * 100, 2)


def normalize_score(raw_score, min_value, max_value, reverse=False):
    """
    Normalize a raw score to a percentage (0-100).
    
    Args:
        raw_score: The raw score value
        min_value: Minimum possible value
        max_value: Maximum possible value
        reverse: If True, invert the score (higher raw = lower normalized)
    
    Returns:
        float: Normalized percentage rounded to 2 decimal places
    """
    if raw_score is None:
        return None
    
    raw = float(raw_score)
    min_val = float(min_value)
    max_val = float(max_value)
    
    if max_val == min_val:
        return 100.0
    
    normalized = ((raw - min_val) / (max_val - min_val)) * 100
    
    if reverse:
        normalized = 100 - normalized
    
    return round(normalized, 2)


def get_traffic_light(percentage, green_threshold=80, yellow_threshold=60):
    """
    Get traffic light color based on percentage score.
    
    Args:
        percentage: Score as percentage (0-100)
        green_threshold: Minimum for green (default 80)
        yellow_threshold: Minimum for yellow (default 60)
    
    Returns:
        str: 'green', 'yellow', or 'red'
    """
    if percentage is None:
        return 'gray'
    
    if percentage >= green_threshold:
        return 'green'
    elif percentage >= yellow_threshold:
        return 'yellow'
    else:
        return 'red'


def calculate_weighted_score(scores_with_weights):
    """
    Calculate weighted average score.
    
    Args:
        scores_with_weights: List of tuples [(score, weight), ...]
    
    Returns:
        float: Weighted average rounded to 2 decimal places
    """
    if not scores_with_weights:
        return 0.0
    
    total_weight = 0
    weighted_sum = 0
    
    for score, weight in scores_with_weights:
        if score is not None:
            weighted_sum += float(score) * float(weight)
            total_weight += float(weight)
    
    if total_weight == 0:
        return 0.0
    
    return round(weighted_sum / total_weight, 2)


# ========== Date Helpers ==========

def get_today():
    """Return today's date as date object."""
    return timezone.now().date()


def get_now():
    """Return current datetime."""
    return timezone.now()


def is_date_in_range(check_date, start_date, end_date):
    """
    Check if a date falls within a range (inclusive).
    
    Args:
        check_date: Date to check
        start_date: Start of range
        end_date: End of range
    
    Returns:
        bool: True if date is between start and end (inclusive)
    """
    if not check_date:
        return False
    
    if start_date and check_date < start_date:
        return False
    
    if end_date and check_date > end_date:
        return False
    
    return True


def days_between(date1, date2):
    """
    Calculate number of days between two dates.
    
    Args:
        date1: First date
        date2: Second date
    
    Returns:
        int: Number of days (absolute value)
    """
    if not date1 or not date2:
        return 0
    
    delta = date2 - date1
    return abs(delta.days)


def add_days_to_date(target_date, days):
    """
    Add a number of days to a date.
    
    Args:
        target_date: Starting date
        days: Number of days to add
    
    Returns:
        date: New date
    """
    if not target_date:
        return None
    
    return target_date + timedelta(days=days)


def is_overdue(due_date, grace_days=0):
    """
    Check if a due date has passed.
    
    Args:
        due_date: The deadline date
        grace_days: Number of grace days allowed (default 0)
    
    Returns:
        bool: True if overdue
    """
    if not due_date:
        return False
    
    today = get_today()
    return today > due_date + timedelta(days=grace_days)


def get_remaining_days(target_date):
    """
    Calculate remaining days until a target date.
    
    Args:
        target_date: Future date
    
    Returns:
        int: Number of days remaining (negative if past)
    """
    if not target_date:
        return 0
    
    today = get_today()
    delta = target_date - today
    return delta.days


def get_quarter(date_obj):
    """
    Get the quarter of a given date.
    
    Args:
        date_obj: Date object
    
    Returns:
        int: Quarter number (1, 2, 3, or 4)
    """
    if not date_obj:
        return None
    
    month = date_obj.month
    if month <= 3:
        return 1
    elif month <= 6:
        return 2
    elif month <= 9:
        return 3
    else:
        return 4


def get_financial_year_start(date_obj, start_month=7):
    """
    Get the financial year start date (default July).
    
    Args:
        date_obj: Date object
        start_month: Month when financial year starts (default 7 for July)
    
    Returns:
        date: Financial year start date
    """
    if not date_obj:
        return None
    
    year = date_obj.year
    if date_obj.month < start_month:
        year -= 1
    
    return date(year, start_month, 1)


# ========== JSON Helpers ==========

def safe_json_loads(json_string, default=None):
    """
    Safely load JSON from string.
    
    Args:
        json_string: JSON string to parse
        default: Default value if parsing fails
    
    Returns:
        dict or list: Parsed JSON or default
    """
    if not json_string:
        return default or {}
    
    try:
        return json.loads(json_string)
    except (json.JSONDecodeError, TypeError):
        return default or {}


def safe_json_dumps(data, default=None):
    """
    Safely dump data to JSON string.
    
    Args:
        data: Data to serialize
        default: Default value if serialization fails
    
    Returns:
        str: JSON string or default
    """
    if data is None:
        return default or '{}'
    
    try:
        return json.dumps(data)
    except (TypeError, ValueError):
        return default or '{}'


# ========== Rating and Level Helpers ==========

def find_rating_level(levels, score, use_percentage=True):
    """
    Find the matching rating level for a given score.
    
    Args:
        levels: List of level dictionaries with 'min_pct' or 'value' keys
        score: The score to match
        use_percentage: If True, use 'min_pct', otherwise use 'value'
    
    Returns:
        dict: Matching level or the lowest level if no match
    """
    if not levels or score is None:
        return levels[-1] if levels else None
    
    key = 'min_pct' if use_percentage else 'value'
    
    # Sort by key descending to find first match
    sorted_levels = sorted(levels, key=lambda x: x.get(key, 0), reverse=True)
    
    for level in sorted_levels:
        threshold = level.get(key, 0)
        if score >= threshold:
            return level
    
    return levels[-1] if levels else None


def get_rating_color(levels, score, use_percentage=True):
    """
    Get color for a rating level.
    
    Args:
        levels: List of level dictionaries
        score: The score to match
        use_percentage: If True, use 'min_pct', otherwise use 'value'
    
    Returns:
        str: Hex color code
    """
    level = find_rating_level(levels, score, use_percentage)
    return level.get('color', '#95a5a6') if level else '#95a5a6'


def get_rating_label(levels, score, use_percentage=True):
    """
    Get label for a rating level.
    
    Args:
        levels: List of level dictionaries
        score: The score to match
        use_percentage: If True, use 'min_pct', otherwise use 'value'
    
    Returns:
        str: Rating label
    """
    level = find_rating_level(levels, score, use_percentage)
    return level.get('label', 'Not Rated') if level else 'Not Rated'


# ========== String Helpers ==========

def truncate_text(text, max_length=100, suffix='...'):
    """
    Truncate text to a maximum length.
    
    Args:
        text: The text to truncate
        max_length: Maximum length (default 100)
        suffix: Suffix to add when truncated (default '...')
    
    Returns:
        str: Truncated text
    """
    if not text:
        return ''
    
    if len(text) <= max_length:
        return text
    
    return text[:max_length - len(suffix)] + suffix


def slugify_rating(rating_label):
    """
    Convert rating label to a slug for URL or CSS class.
    
    Args:
        rating_label: Rating label (e.g., 'Exceeds Expectations')
    
    Returns:
        str: Slug (e.g., 'exceeds-expectations')
    """
    if not rating_label:
        return ''
    
    # Convert to lowercase
    slug = rating_label.lower()
    
    # Replace spaces with hyphens
    slug = re.sub(r'\s+', '-', slug)
    
    # Remove special characters
    slug = re.sub(r'[^a-z0-9-]', '', slug)
    
    # Remove multiple hyphens
    slug = re.sub(r'-+', '-', slug)
    
    # Remove leading/trailing hyphens
    slug = slug.strip('-')
    
    return slug


def format_rating_display(raw_score, normalized_score, label, color):
    """
    Format rating for display in templates/API.
    
    Args:
        raw_score: Raw score value
        normalized_score: Normalized percentage
        label: Rating label
        color: Color name or hex
    
    Returns:
        dict: Formatted rating information
    """
    return {
        'raw_score': float(raw_score) if raw_score is not None else None,
        'normalized_score': float(normalized_score) if normalized_score is not None else None,
        'label': label or 'Not Rated',
        'color': color or 'gray',
        'display': f"{label} ({normalized_score:.0f}%)" if normalized_score else label,
    }


# ========== Validation Helpers ==========

def validate_unique_per_cycle(instance, model_class, tenant, cycle, employee):
    """
    Helper to check if an instance already exists for a cycle.
    
    Args:
        instance: The instance being saved
        model_class: The model class to check
        tenant: Tenant to filter by
        cycle: Review cycle
        employee: Employee
    
    Returns:
        tuple: (is_unique, existing_instance)
    """
    queryset = model_class.objects.filter(
        tenant=tenant,
        review_cycle=cycle,
        employee=employee
    )
    
    if instance.pk:
        queryset = queryset.exclude(pk=instance.pk)
    
    existing = queryset.first()
    return existing is None, existing


def validate_rating_scale_compatibility(rating_scale, score):
    """
    Check if a score is compatible with a rating scale.
    
    Args:
        rating_scale: RatingScale instance
        score: Score to validate
    
    Returns:
        tuple: (is_valid, error_message)
    """
    if not rating_scale or score is None:
        return True, None
    
    min_val = float(rating_scale.min_value)
    max_val = float(rating_scale.max_value)
    
    if score < min_val:
        return False, f"Score {score} is below minimum {min_val}"
    
    if score > max_val:
        return False, f"Score {score} exceeds maximum {max_val}"
    
    if not rating_scale.allow_decimal and score != int(score):
        return False, "Decimal scores not allowed for this scale"
    
    return True, None


# ========== Progress Calculation Helpers ==========

def calculate_completion_percentage(completed_count, total_count):
    """
    Calculate completion percentage.
    
    Args:
        completed_count: Number of completed items
        total_count: Total number of items
    
    Returns:
        float: Percentage rounded to 1 decimal place
    """
    if not total_count or total_count == 0:
        return 0.0
    
    return round((completed_count / total_count) * 100, 1)


def get_progress_status(percentage):
    """
    Get progress status label based on percentage.
    
    Args:
        percentage: Completion percentage
    
    Returns:
        str: 'not_started', 'in_progress', 'almost_done', or 'complete'
    """
    if percentage is None:
        return 'not_started'
    
    if percentage >= 100:
        return 'complete'
    elif percentage >= 75:
        return 'almost_done'
    elif percentage >= 1:
        return 'in_progress'
    else:
        return 'not_started'


# ========== Color Helpers ==========

def lighten_color(hex_color, amount=0.2):
    """
    Lighten a hex color by a percentage.
    
    Args:
        hex_color: Hex color (e.g., '#2ecc71')
        amount: Amount to lighten (0-1, default 0.2)
    
    Returns:
        str: Lightened hex color
    """
    if not hex_color:
        return '#95a5a6'
    
    # Remove #
    color = hex_color.lstrip('#')
    
    # Convert to RGB
    if len(color) == 3:
        r = int(color[0] * 2, 16)
        g = int(color[1] * 2, 16)
        b = int(color[2] * 2, 16)
    else:
        r = int(color[0:2], 16)
        g = int(color[2:4], 16)
        b = int(color[4:6], 16)
    
    # Lighten
    r = min(255, int(r + (255 - r) * amount))
    g = min(255, int(g + (255 - g) * amount))
    b = min(255, int(b + (255 - b) * amount))
    
    # Convert back to hex
    return f"#{r:02x}{g:02x}{b:02x}"


def darken_color(hex_color, amount=0.2):
    """
    Darken a hex color by a percentage.
    
    Args:
        hex_color: Hex color (e.g., '#2ecc71')
        amount: Amount to darken (0-1, default 0.2)
    
    Returns:
        str: Darkened hex color
    """
    if not hex_color:
        return '#6c757d'
    
    # Remove #
    color = hex_color.lstrip('#')
    
    # Convert to RGB
    if len(color) == 3:
        r = int(color[0] * 2, 16)
        g = int(color[1] * 2, 16)
        b = int(color[2] * 2, 16)
    else:
        r = int(color[0:2], 16)
        g = int(color[2:4], 16)
        b = int(color[4:6], 16)
    
    # Darken
    r = max(0, int(r * (1 - amount)))
    g = max(0, int(g * (1 - amount)))
    b = max(0, int(b * (1 - amount)))
    
    # Convert back to hex
    return f"#{r:02x}{g:02x}{b:02x}"


# ========== Analytics & Statistics Helpers ==========

def get_date_range_for_period(period, end_date=None):
    """
    Get start and end date range for a given period.
    
    Args:
        period: One of 'daily', 'weekly', 'monthly', 'quarterly', 'yearly'
        end_date: Anchor end date (defaults to today)
        
    Returns:
        tuple: (start_date, end_date) as date objects
    """
    if end_date is None:
        end_date = date.today()
    elif isinstance(end_date, timezone.datetime):
        end_date = end_date.date()
    elif isinstance(end_date, str):
        try:
            end_date = date.fromisoformat(end_date)
        except ValueError:
            end_date = date.today()
            
    if period == 'daily':
        start_date = end_date
    elif period == 'weekly':
        start_date = end_date - timedelta(days=7)
    elif period == 'monthly':
        start_date = end_date - timedelta(days=30)
    elif period == 'quarterly':
        start_date = end_date - timedelta(days=90)
    elif period == 'yearly':
        start_date = end_date - timedelta(days=365)
    else:
        start_date = end_date - timedelta(days=30)
        
    return start_date, end_date


def calculate_percentage_change(current, previous):
    """
    Calculate the percentage change between current and previous values.
    
    Args:
        current: Current period numeric value
        previous: Previous period numeric value
        
    Returns:
        float: Percentage change rounded to 2 decimals
    """
    if not previous or float(previous) == 0.0:
        return 0.0
    curr = float(current) if current is not None else 0.0
    prev = float(previous)
    change = curr - prev
    return round((change / prev) * 100, 2)


def calculate_trend(scores):
    """
    Determine direction and rate of change across a sequence of scores.
    
    Args:
        scores: List of numeric values representing chronological trend
        
    Returns:
        dict: {'direction': 'up'|'down'|'stable', 'change_percent': float}
    """
    if len(scores) < 2:
        return {'direction': 'stable', 'change_percent': 0.0}
        
    first = float(scores[0])
    last = float(scores[-1])
    
    if first == 0.0:
        return {'direction': 'stable', 'change_percent': 0.0}
        
    change_percent = ((last - first) / first) * 100
    
    if change_percent > 1.0:
        direction = 'up'
    elif change_percent < -1.0:
        direction = 'down'
    else:
        direction = 'stable'
        
    return {
        'direction': direction,
        'change_percent': round(change_percent, 2)
    }


def calculate_standard_deviation(scores):
    """
    Calculate the sample standard deviation of a sequence of scores.
    
    Args:
        scores: List of numeric scores
        
    Returns:
        float: Standard deviation rounded to 2 decimals
    """
    if not scores:
        return 0.0
    import math
    scores_float = [float(s) for s in scores]
    n = len(scores_float)
    if n < 2:
        return 0.0
    mean = sum(scores_float) / n
    variance = sum((x - mean) ** 2 for x in scores_float) / (n - 1)
    return round(math.sqrt(variance), 2)


def get_rating_distribution(ratings):
    """
    Aggregate score counts and percentages sorted by rating label.
    
    Args:
        ratings: Queryset or iterable of FinalRating objects
        
    Returns:
        dict: Grouped label counts, percentages, and colors
    """
    from django.db.models import Count
    
    total = ratings.count() if hasattr(ratings, 'count') else len(ratings)
    if total == 0:
        return {}
        
    result = {}
    if hasattr(ratings, 'values'):
        dist = ratings.values('final_rating_label', 'final_rating_color').annotate(count=Count('id'))
        for item in dist:
            label = item.get('final_rating_label') or 'Not Rated'
            color = item.get('final_rating_color') or 'gray'
            count = item['count']
            result[label] = {
                'count': count,
                'percentage': round((count / total) * 100, 1),
                'color': color
            }
    else:
        for r in ratings:
            label = getattr(r, 'final_rating_label', 'Not Rated') or 'Not Rated'
            color = getattr(r, 'final_rating_color', 'gray') or 'gray'
            if label not in result:
                result[label] = {'count': 0, 'percentage': 0.0, 'color': color}
            result[label]['count'] += 1
            
        for label in result:
            result[label]['percentage'] = round((result[label]['count'] / total) * 100, 1)
            
    return result