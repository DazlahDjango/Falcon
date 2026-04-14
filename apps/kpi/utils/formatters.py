from decimal import Decimal
from typing import Union, Optional, Dict
from django.utils.html import format_html
from .decimal_utils import DecimalUtils

class FormatUtils:
    @classmethod
    def format_score(cls, score: Union[int, float, str, Decimal, None], 
                     decimal_places: int = 0, include_percent: bool = True) -> str:
        if score is None:
            return "N/A"
        score_dec = DecimalUtils.safe_decimal(score)
        formatted = DecimalUtils.round_decimal(score_dec, decimal_places)
        if include_percent:
            return f"{formatted}%"
        return str(formatted)
    
    @classmethod
    def format_currency(cls, value: Union[int, float, str, Decimal, None],
                        currency: str = "KES", decimal_places: int = 2) -> str:
        if value is None:
            return "N/A"
        value_dec = DecimalUtils.safe_decimal(value)
        formatted = DecimalUtils.round_decimal(value_dec, decimal_places)
        formatted_str = f"{formatted:,.{decimal_places}f}"
        return f"{currency} {formatted_str}"
    
    @classmethod
    def format_percentage(cls, value: Union[int, float, str, Decimal, None],
                          decimal_places: int = 1) -> str:
        if value is None:
            return "N/A"
        value_dec = DecimalUtils.safe_decimal(value)
        formatted = DecimalUtils.round_decimal(value_dec, decimal_places)
        return f"{formatted}%"
    
    @classmethod
    def format_traffic_light(cls, status: str, with_emoji: bool = True) -> str:
        config = {
            'GREEN': {'emoji': '🟢', 'label': 'On Track', 'color': '#22c55e'},
            'YELLOW': {'emoji': '🟡', 'label': 'At Risk', 'color': '#eab308'},
            'RED': {'emoji': '🔴', 'label': 'Off Track', 'color': '#ef4444'},
        }
        status_config = config.get(status, {'emoji': '⚪', 'label': 'Unknown', 'color': '#6b7280'})
        if with_emoji:
            return f"{status_config['emoji']} {status_config['label']}"
        return status_config['label']
    @classmethod
    def format_metric_value(cls, value: Union[int, float, str, Decimal, None],
                            unit: str = "", decimal_places: int = 0,
                            compact: bool = False) -> str:
        if value is None:
            return "N/A"
        value_dec = DecimalUtils.safe_decimal(value)
        if compact:
            if value_dec >= 1_000_000_000:
                formatted = f"{value_dec / 1_000_000_000:.1f}B"
            elif value_dec >= 1_000_000:
                formatted = f"{value_dec / 1_000_000:.1f}M"
            elif value_dec >= 1_000:
                formatted = f"{value_dec / 1_000:.1f}K"
            else:
                formatted = DecimalUtils.round_decimal(value_dec, decimal_places)
                formatted = f"{formatted:,}"
        else:
            formatted = DecimalUtils.round_decimal(value_dec, decimal_places)
            formatted = f"{formatted:,}"
        if unit:
            return f"{formatted} {unit}"
        return formatted
    
    @classmethod
    def format_period(cls, year: int, month: int, format_type: str = 'YYYY-MM') -> str:
        """Format period string"""
        if format_type == 'YYYY-MM':
            return f"{year}-{month:02d}"
        elif format_type == 'MM/YYYY':
            return f"{month:02d}/{year}"
        elif format_type == 'Month YYYY':
            from .date_utils import get_month_name
            return f"{get_month_name(month)} {year}"
        elif format_type == 'MMM YYYY':
            from .date_utils import get_month_name
            return f"{get_month_name(month, abbreviated=True)} {year}"
        return f"{year}-{month:02d}"
    
    @classmethod
    def format_trend(cls, trend_data: Dict) -> str:
        direction = trend_data.get('direction', 'STABLE')
        confidence = trend_data.get('confidence', 0)
        config = {
            'IMPROVING': {'arrow': '↑', 'color': '#22c55e'},
            'DECLINING': {'arrow': '↓', 'color': '#ef4444'},
            'STABLE': {'arrow': '→', 'color': '#6b7280'},
            'VOLATILE': {'arrow': '↗↘', 'color': '#eab308'},
        }
        cfg = config.get(direction, {'arrow': '?', 'color': '#6b7280'})
        return f"<span style='color: {cfg['color']}'>{cfg['arrow']}</span>"
    
    @classmethod
    def format_duration(cls, seconds: float) -> str:
        if seconds < 60:
            return f"{seconds:.0f}s"
        elif seconds < 3600:
            minutes = seconds / 60
            return f"{minutes:.1f}m"
        else:
            hours = seconds / 3600
            return f"{hours:.1f}h"
    
    @classmethod
    def format_number(cls, value: Union[int, float, str, Decimal, None],
                      decimal_places: int = 0) -> str:
        if value is None:
            return "N/A"
        value_dec = DecimalUtils.safe_decimal(value)
        formatted = DecimalUtils.round_decimal(value_dec, decimal_places)
        return f"{formatted:,.{decimal_places}f}"

def format_score(score: Union[int, float, str, Decimal, None], 
                 decimal_places: int = 0, include_percent: bool = True) -> str:
    return FormatUtils.format_score(score, decimal_places, include_percent)

def format_currency(value: Union[int, float, str, Decimal, None],
                    currency: str = "KES", decimal_places: int = 2) -> str:
    return FormatUtils.format_currency(value, currency, decimal_places)

def format_percentage(value: Union[int, float, str, Decimal, None],
                      decimal_places: int = 1) -> str:
    return FormatUtils.format_percentage(value, decimal_places)

def format_traffic_light(status: str, with_emoji: bool = True) -> str:
    return FormatUtils.format_traffic_light(status, with_emoji)

def format_metric_value(value: Union[int, float, str, Decimal, None],
                        unit: str = "", decimal_places: int = 0,
                        compact: bool = False) -> str:
    return FormatUtils.format_metric_value(value, unit, decimal_places, compact)

def format_period(year: int, month: int, format_type: str = 'YYYY-MM') -> str:
    return FormatUtils.format_period(year, month, format_type)