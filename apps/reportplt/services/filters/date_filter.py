# apps/reportplt/services/filters/date_filter.py
from enum import Enum
from typing import Dict, Any, Optional, Tuple, List
from datetime import datetime, timedelta, date
from django.utils import timezone
from dateutil.relativedelta import relativedelta

class DateRangeType(Enum):
    TODAY = 'today'
    YESTERDAY = 'yesterday'
    LAST_7_DAYS = 'last_7_days'
    LAST_30_DAYS = 'last_30_days'
    LAST_90_DAYS = 'last_90_days'
    THIS_WEEK = 'this_week'
    LAST_WEEK = 'last_week'
    THIS_MONTH = 'this_month'
    LAST_MONTH = 'last_month'
    THIS_QUARTER = 'this_quarter'
    LAST_QUARTER = 'last_quarter'
    THIS_YEAR = 'this_year'
    LAST_YEAR = 'last_year'
    YTD = 'ytd'
    MTD = 'mtd'
    CUSTOM = 'custom'

class DateFilter:
    def __init__(self):
        self.timezone = timezone.get_current_timezone()

    def get_date_range(self, range_type: DateRangeType, custom_start: Optional[str] = None, custom_end: Optional[str] = None) -> Tuple[Optional[date], Optional[date]]:
        if range_type == DateRangeType.TODAY:
            return self._get_today()
        elif range_type == DateRangeType.YESTERDAY:
            return self._get_yesterday()
        elif range_type == DateRangeType.LAST_7_DAYS:
            return self._get_last_7_days()
        elif range_type == DateRangeType.LAST_30_DAYS:
            return self._get_last_30_days()
        elif range_type == DateRangeType.LAST_90_DAYS:
            return self._get_last_90_days()
        elif range_type == DateRangeType.THIS_WEEK:
            return self._get_this_week()
        elif range_type == DateRangeType.LAST_WEEK:
            return self._get_last_week()
        elif range_type == DateRangeType.THIS_MONTH:
            return self._get_this_month()
        elif range_type == DateRangeType.LAST_MONTH:
            return self._get_last_month()
        elif range_type == DateRangeType.THIS_QUARTER:
            return self._get_this_quarter()
        elif range_type == DateRangeType.LAST_QUARTER:
            return self._get_last_quarter()
        elif range_type == DateRangeType.THIS_YEAR:
            return self._get_this_year()
        elif range_type == DateRangeType.LAST_YEAR:
            return self._get_last_year()
        elif range_type == DateRangeType.YTD:
            return self._get_ytd()
        elif range_type == DateRangeType.MTD:
            return self._get_mtd()
        elif range_type == DateRangeType.CUSTOM:
            return self._get_custom(custom_start, custom_end)
        return None, None

    def _get_today(self) -> Tuple[date, date]:
        today = timezone.now().date()
        return today, today

    def _get_yesterday(self) -> Tuple[date, date]:
        yesterday = timezone.now().date() - timedelta(days=1)
        return yesterday, yesterday

    def _get_last_7_days(self) -> Tuple[date, date]:
        end = timezone.now().date()
        start = end - timedelta(days=7)
        return start, end

    def _get_last_30_days(self) -> Tuple[date, date]:
        end = timezone.now().date()
        start = end - timedelta(days=30)
        return start, end

    def _get_last_90_days(self) -> Tuple[date, date]:
        end = timezone.now().date()
        start = end - timedelta(days=90)
        return start, end

    def _get_this_week(self) -> Tuple[date, date]:
        today = timezone.now().date()
        start = today - timedelta(days=today.weekday())
        end = start + timedelta(days=6)
        return start, end

    def _get_last_week(self) -> Tuple[date, date]:
        today = timezone.now().date()
        start = today - timedelta(days=today.weekday() + 7)
        end = start + timedelta(days=6)
        return start, end

    def _get_this_month(self) -> Tuple[date, date]:
        today = timezone.now().date()
        start = date(today.year, today.month, 1)
        end = start + relativedelta(months=1) - timedelta(days=1)
        return start, end

    def _get_last_month(self) -> Tuple[date, date]:
        today = timezone.now().date()
        last_month = today - relativedelta(months=1)
        start = date(last_month.year, last_month.month, 1)
        end = start + relativedelta(months=1) - timedelta(days=1)
        return start, end

    def _get_this_quarter(self) -> Tuple[date, date]:
        today = timezone.now().date()
        quarter = (today.month - 1) // 3
        start = date(today.year, quarter * 3 + 1, 1)
        end = start + relativedelta(months=3) - timedelta(days=1)
        return start, end

    def _get_last_quarter(self) -> Tuple[date, date]:
        today = timezone.now().date()
        quarter = (today.month - 1) // 3
        if quarter == 0:
            last_quarter_start = date(today.year - 1, 10, 1)
            last_quarter_end = date(today.year - 1, 12, 31)
        else:
            start_month = quarter * 3 - 2
            last_quarter_start = date(today.year, start_month, 1)
            last_quarter_end = last_quarter_start + relativedelta(months=3) - timedelta(days=1)
        return last_quarter_start, last_quarter_end

    def _get_this_year(self) -> Tuple[date, date]:
        today = timezone.now().date()
        start = date(today.year, 1, 1)
        end = date(today.year, 12, 31)
        return start, end

    def _get_last_year(self) -> Tuple[date, date]:
        today = timezone.now().date()
        start = date(today.year - 1, 1, 1)
        end = date(today.year - 1, 12, 31)
        return start, end

    def _get_ytd(self) -> Tuple[date, date]:
        today = timezone.now().date()
        start = date(today.year, 1, 1)
        return start, today

    def _get_mtd(self) -> Tuple[date, date]:
        today = timezone.now().date()
        start = date(today.year, today.month, 1)
        return start, today

    def _get_custom(self, start: Optional[str], end: Optional[str]) -> Tuple[Optional[date], Optional[date]]:
        start_date = None
        end_date = None
        if start:
            try:
                start_date = datetime.strptime(start, '%Y-%m-%d').date()
            except ValueError:
                raise ValueError(f"Invalid start date format: {start}. Use YYYY-MM-DD")
        if end:
            try:
                end_date = datetime.strptime(end, '%Y-%m-%d').date()
            except ValueError:
                raise ValueError(f"Invalid end date format: {end}. Use YYYY-MM-DD")
        return start_date, end_date

    def get_date_filter_kwargs(self, field: str, range_type: DateRangeType, **kwargs) -> Dict:
        start, end = self.get_date_range(range_type, kwargs.get('custom_start'), kwargs.get('custom_end'))
        if not start and not end:
            return {}
        kwargs = {}
        if start:
            kwargs[f"{field}__gte"] = start
        if end:
            kwargs[f"{field}__lte"] = end
        return kwargs

    def is_date_in_range(self, date_to_check: date, range_type: DateRangeType) -> bool:
        start, end = self.get_date_range(range_type)
        if not start and not end:
            return False
        if start and end:
            return start <= date_to_check <= end
        if start:
            return date_to_check >= start
        if end:
            return date_to_check <= end
        return False

    def get_date_range_display(self, range_type: DateRangeType) -> str:
        start, end = self.get_date_range(range_type)
        if not start and not end:
            return 'All Time'
        if start and end:
            if start == end:
                return start.strftime('%B %d, %Y')
            return f"{start.strftime('%B %d, %Y')} - {end.strftime('%B %d, %Y')}"
        if start:
            return f"From {start.strftime('%B %d, %Y')}"
        if end:
            return f"Until {end.strftime('%B %d, %Y')}"
        return ''

    def get_date_range_for_filter(self, range_type: DateRangeType, custom_start: Optional[str] = None, custom_end: Optional[str] = None) -> Dict:
        start, end = self.get_date_range(range_type, custom_start, custom_end)
        result = {
            'range_type': range_type.value,
            'display': self.get_date_range_display(range_type)
        }
        if start:
            result['start'] = start.isoformat()
        if end:
            result['end'] = end.isoformat()
        return result

    def get_available_range_types(self) -> List[Dict]:
        return [
            {'value': 'today', 'label': 'Today'},
            {'value': 'yesterday', 'label': 'Yesterday'},
            {'value': 'last_7_days', 'label': 'Last 7 Days'},
            {'value': 'last_30_days', 'label': 'Last 30 Days'},
            {'value': 'last_90_days', 'label': 'Last 90 Days'},
            {'value': 'this_week', 'label': 'This Week'},
            {'value': 'last_week', 'label': 'Last Week'},
            {'value': 'this_month', 'label': 'This Month'},
            {'value': 'last_month', 'label': 'Last Month'},
            {'value': 'this_quarter', 'label': 'This Quarter'},
            {'value': 'last_quarter', 'label': 'Last Quarter'},
            {'value': 'this_year', 'label': 'This Year'},
            {'value': 'last_year', 'label': 'Last Year'},
            {'value': 'ytd', 'label': 'Year to Date'},
            {'value': 'mtd', 'label': 'Month to Date'},
            {'value': 'custom', 'label': 'Custom Range'},
        ]