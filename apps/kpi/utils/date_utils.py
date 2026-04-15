from datetime import date, timedelta, datetime
from typing import Tuple, Optional, List
from calendar import month_name
from django.utils import timezone


class DateUtils:
    MONTH_NAMES = month_name
    QUARTER_MONTHS = {1: [1, 2, 3], 2: [4, 5, 6], 3: [7, 8, 9], 4: [10, 11, 12]}
    @classmethod
    def get_period_dates(cls, year: int, month: int) -> Tuple[date, date]:
        start = date(year, month, 1)
        if month == 12:
            end = date(year + 1, 1, 1) - timedelta(days=1)
        else:
            end = date(year, month + 1, 1) - timedelta(days=1)
        return start, end
    @classmethod
    def get_previous_period(cls, year: int, month: int) -> Tuple[int, int]:
        if month == 1:
            return year - 1, 12
        return year, month - 1
    @classmethod
    def get_next_period(cls, year: int, month: int) -> Tuple[int, int]:
        if month == 12:
            return year + 1, 1
        return year, month + 1
    
    @classmethod
    def get_quarter_from_month(cls, month: int) -> int:
        return (month - 1) // 3 + 1
    
    @classmethod
    def get_quarter_months(cls, quarter: int) -> List[int]:
        return cls.QUARTER_MONTHS.get(quarter, [])
    
    @classmethod
    def get_fiscal_year(cls, date_obj: date, fiscal_start_month: int = 1) -> Tuple[int, int]:
        year = date_obj.year
        if date_obj.month < fiscal_start_month:
            return year - 1, year
        return year, year + 1
    
    @classmethod
    def is_period_valid(cls, year: int, month: int) -> bool:
        now = timezone.now().date()
        if year > now.year:
            return False
        if year == now.year and month > now.month + 1:  # Allow next month for planning
            return False
        return 1 <= month <= 12 and year >= 2000
    
    @classmethod
    def is_period_locked(cls, year: int, month: int, lock_months: int = 3) -> bool:
        now = timezone.now().date()
        period_date = date(year, month, 1)
        months_diff = (now.year - year) * 12 + (now.month - month)
        return months_diff > lock_months
    
    @classmethod
    def get_month_name(cls, month: int, abbreviated: bool = False) -> str:
        if abbreviated:
            return cls.MONTH_NAMES[month][:3]
        return cls.MONTH_NAMES[month]
    @classmethod
    def get_period_range(cls, start_year: int, start_month: int, 
                         end_year: int, end_month: int) -> List[Tuple[int, int]]:
        periods = []
        year, month = start_year, start_month
        while (year < end_year) or (year == end_year and month <= end_month):
            periods.append((year, month))
            year, month = cls.get_next_period(year, month)
        return periods
    
    @classmethod
    def get_year_to_date_periods(cls, year: int, current_month: int) -> List[Tuple[int, int]]:
        return [(year, month) for month in range(1, current_month + 1)]
    
    @classmethod
    def format_period(cls, year: int, month: int, format_type: str = 'YYYY-MM') -> str:
        if format_type == 'YYYY-MM':
            return f"{year}-{month:02d}"
        elif format_type == 'MM/YYYY':
            return f"{month:02d}/{year}"
        elif format_type == 'Month YYYY':
            return f"{cls.get_month_name(month)} {year}"
        return f"{year}-{month:02d}"
    
    @classmethod
    def parse_period(cls, period_str: str) -> Tuple[int, int]:
        if '-' in period_str:
            year, month = period_str.split('-')
        elif '/' in period_str:
            month, year = period_str.split('/')
        else:
            raise ValueError(f"Invalid period format: {period_str}")
        return int(year), int(month)

# Convenience functions
def get_period_dates(year: int, month: int) -> Tuple[date, date]:
    return DateUtils.get_period_dates(year, month)

def get_previous_period(year: int, month: int) -> Tuple[int, int]:
    return DateUtils.get_previous_period(year, month)

def get_next_period(year: int, month: int) -> Tuple[int, int]:
    return DateUtils.get_next_period(year, month)

def get_quarter_from_month(month: int) -> int:
    return DateUtils.get_quarter_from_month(month)

def get_fiscal_year(date_obj: date, fiscal_start_month: int = 1) -> Tuple[int, int]:
    return DateUtils.get_fiscal_year(date_obj, fiscal_start_month)

def is_period_valid(year: int, month: int) -> bool:
    return DateUtils.is_period_valid(year, month)

def get_month_name(month: int, abbreviated: bool = False) -> str:
    return DateUtils.get_month_name(month, abbreviated)

def get_period_range(start_year: int, start_month: int, end_year: int, end_month: int) -> List[Tuple[int, int]]:
    return DateUtils.get_period_range(start_year, start_month, end_year, end_month)