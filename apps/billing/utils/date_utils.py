# billing/utils/date_utils.py
"""
Date utilities for billing calculations.
"""
from datetime import datetime, timedelta, date
from typing import Tuple, Optional
from django.utils import timezone
from dateutil.relativedelta import relativedelta


def get_billing_period_dates(
    start_date: datetime,
    interval: str,
    interval_count: int = 1
) -> Tuple[datetime, datetime]:
    """
    Calculate billing period start and end dates.
    
    Args:
        start_date: When the billing period starts
        interval: 'month', 'year', 'week'
        interval_count: Number of intervals (e.g., 3 months)
    
    Returns:
        Tuple of (period_start, period_end)
    """
    period_start = start_date
    
    if interval == 'month':
        period_end = start_date + relativedelta(months=interval_count)
    elif interval == 'year':
        period_end = start_date + relativedelta(years=interval_count)
    elif interval == 'week':
        period_end = start_date + timedelta(weeks=interval_count)
    else:
        period_end = start_date + timedelta(days=interval_count)
    
    return period_start, period_end


def calculate_prorated_days(
    start_date: datetime,
    end_date: datetime,
    period_start: datetime,
    period_end: datetime
) -> int:
    """
    Calculate prorated days for a partial period.
    
    Returns:
        Number of days in the prorated period
    """
    effective_start = max(start_date, period_start)
    effective_end = min(end_date, period_end)
    
    if effective_end <= effective_start:
        return 0
    
    return (effective_end - effective_start).days


def get_next_billing_date(
    current_period_end: datetime,
    interval: str,
    interval_count: int = 1
) -> datetime:
    """
    Calculate the next billing date after the current period.
    """
    if interval == 'month':
        return current_period_end + relativedelta(months=interval_count)
    elif interval == 'year':
        return current_period_end + relativedelta(years=interval_count)
    elif interval == 'week':
        return current_period_end + timedelta(weeks=interval_count)
    else:
        return current_period_end + timedelta(days=interval_count)


def get_days_until_date(target_date: datetime) -> int:
    """Get number of days until target date."""
    now = timezone.now()
    if target_date <= now:
        return 0
    return (target_date - now).days


def is_date_in_past(target_date: datetime) -> bool:
    """Check if a date is in the past."""
    return target_date < timezone.now()


def get_month_start(date_value: datetime = None) -> datetime:
    """Get the start of the month for a given date."""
    if date_value is None:
        date_value = timezone.now()
    return date_value.replace(day=1, hour=0, minute=0, second=0, microsecond=0)


def get_month_end(date_value: datetime = None) -> datetime:
    """Get the end of the month for a given date."""
    if date_value is None:
        date_value = timezone.now()
    next_month = date_value.replace(day=28) + timedelta(days=4)
    return next_month - timedelta(days=next_month.day)