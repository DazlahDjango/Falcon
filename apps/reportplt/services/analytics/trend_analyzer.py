# apps/reportplt/services/analytics/trend_analyzer.py
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime, timedelta
from collections import defaultdict
import math
from django.utils import timezone
from apps.reportplt.exceptions import ReportGenerationError

class TrendAnalyzer:
    def __init__(self):
        self.trends = {}
        self.growth_rates = {}

    def analyze_trends(self, data: List[Dict], date_field: str = 'period', value_field: str = 'value') -> Dict[str, Any]:
        if not data:
            return {'trends': [], 'summary': {}}
        sorted_data = sorted(data, key=lambda x: x.get(date_field, ''))
        values = [d.get(value_field, 0) for d in sorted_data]
        periods = [d.get(date_field, '') for d in sorted_data]
        trend_result = {
            'periods': periods,
            'values': values,
            'trend_direction': self._calculate_trend_direction(values),
            'growth_rate': self._calculate_growth_rate(values),
            'mom_growth': self._calculate_mom_growth(values),
            'yoy_growth': self._calculate_yoy_growth(values, periods),
            'average': sum(values) / len(values) if values else 0,
            'min': min(values) if values else 0,
            'max': max(values) if values else 0,
            'volatility': self._calculate_volatility(values),
            'trend_line': self._calculate_trend_line(values)
        }
        return trend_result

    def _calculate_trend_direction(self, values: List[float]) -> str:
        if len(values) < 2:
            return 'stable'
        first = values[0]
        last = values[-1]
        if last > first * 1.1:
            return 'upward'
        elif last < first * 0.9:
            return 'downward'
        return 'stable'

    def _calculate_growth_rate(self, values: List[float]) -> float:
        if len(values) < 2 or values[0] == 0:
            return 0
        first = values[0]
        last = values[-1]
        return ((last - first) / first) * 100

    def _calculate_mom_growth(self, values: List[float]) -> List[float]:
        if len(values) < 2:
            return []
        growth = []
        for i in range(1, len(values)):
            if values[i-1] == 0:
                growth.append(0)
            else:
                growth.append(((values[i] - values[i-1]) / values[i-1]) * 100)
        return growth

    def _calculate_yoy_growth(self, values: List[float], periods: List[str]) -> List[float]:
        if len(values) < 13:
            return []
        growth = []
        for i in range(12, len(values)):
            if values[i-12] == 0:
                growth.append(0)
            else:
                growth.append(((values[i] - values[i-12]) / values[i-12]) * 100)
        return growth

    def _calculate_volatility(self, values: List[float]) -> float:
        if len(values) < 2:
            return 0
        mean = sum(values) / len(values)
        variance = sum((v - mean) ** 2 for v in values) / len(values)
        return math.sqrt(variance)

    def _calculate_trend_line(self, values: List[float]) -> List[float]:
        if len(values) < 2:
            return values
        n = len(values)
        x = list(range(n))
        x_sum = sum(x)
        y_sum = sum(values)
        xy_sum = sum(x[i] * values[i] for i in range(n))
        x2_sum = sum(x[i] ** 2 for i in range(n))
        slope = (n * xy_sum - x_sum * y_sum) / (n * x2_sum - x_sum ** 2) if (n * x2_sum - x_sum ** 2) != 0 else 0
        intercept = (y_sum - slope * x_sum) / n
        return [slope * i + intercept for i in range(n)]

    def calculate_mom(self, current: float, previous: float) -> float:
        if previous == 0:
            return 0
        return ((current - previous) / previous) * 100

    def calculate_yoy(self, current: float, previous_year: float) -> float:
        if previous_year == 0:
            return 0
        return ((current - previous_year) / previous_year) * 100

    def calculate_cagr(self, start_value: float, end_value: float, years: int) -> float:
        if start_value == 0 or years == 0:
            return 0
        return (pow(end_value / start_value, 1 / years) - 1) * 100

    def calculate_moving_average(self, values: List[float], window: int = 3) -> List[float]:
        if len(values) < window:
            return values
        moving_avg = []
        for i in range(len(values)):
            if i < window - 1:
                moving_avg.append(sum(values[:i+1]) / (i+1))
            else:
                moving_avg.append(sum(values[i-window+1:i+1]) / window)
        return moving_avg

    def calculate_exponential_smoothing(self, values: List[float], alpha: float = 0.3) -> List[float]:
        if not values:
            return []
        smoothed = [values[0]]
        for i in range(1, len(values)):
            smoothed.append(alpha * values[i] + (1 - alpha) * smoothed[-1])
        return smoothed

    def detect_trend_pattern(self, values: List[float]) -> Dict[str, Any]:
        if len(values) < 3:
            return {'pattern': 'insufficient_data'}
        direction = self._calculate_trend_direction(values)
        volatility = self._calculate_volatility(values)
        avg_value = sum(values) / len(values)
        pattern = {
            'direction': direction,
            'volatility': 'high' if volatility > avg_value * 0.2 else 'low' if volatility < avg_value * 0.05 else 'medium',
            'consistency': 'high' if len(set(values)) / len(values) < 0.3 else 'low',
            'trend_strength': self._calculate_trend_strength(values)
        }
        return pattern

    def _calculate_trend_strength(self, values: List[float]) -> float:
        if len(values) < 2:
            return 0
        n = len(values)
        x = list(range(n))
        x_mean = sum(x) / n
        y_mean = sum(values) / n
        numerator = sum((x[i] - x_mean) * (values[i] - y_mean) for i in range(n))
        denominator = math.sqrt(sum((x[i] - x_mean) ** 2 for i in range(n)) * sum((values[i] - y_mean) ** 2 for i in range(n)))
        if denominator == 0:
            return 0
        r = numerator / denominator
        return abs(r)

    def get_trend_summary(self, data: List[Dict], date_field: str = 'period', value_field: str = 'value') -> Dict:
        analysis = self.analyze_trends(data, date_field, value_field)
        return {
            'direction': analysis['trend_direction'],
            'growth_rate': round(analysis['growth_rate'], 2),
            'average': round(analysis['average'], 2),
            'volatility': round(analysis['volatility'], 2),
            'min': round(analysis['min'], 2),
            'max': round(analysis['max'], 2),
            'mom_growth': [round(g, 2) for g in analysis['mom_growth']],
            'yoy_growth': [round(g, 2) for g in analysis['yoy_growth']]
        }

class TrendAnalyzerService:
    def __init__(self):
        self.analyzer = TrendAnalyzer()

    def analyze_kpi_trend(self, kpi_data: List[Dict]) -> Dict:
        return self.analyzer.analyze_trends(kpi_data, 'period', 'progress')

    def analyze_financial_trend(self, financial_data: List[Dict]) -> Dict:
        return self.analyzer.analyze_trends(financial_data, 'month', 'amount')

    def analyze_operational_trend(self, operational_data: List[Dict]) -> Dict:
        return self.analyzer.analyze_trends(operational_data, 'date', 'metric_value')

    def get_mom_comparison(self, values: List[float]) -> List[float]:
        return self.analyzer.calculate_mom_growth(values)

    def get_yoy_comparison(self, values: List[float], periods: List[str]) -> List[float]:
        return self.analyzer.calculate_yoy_growth(values, periods)

    def get_forecast_simple(self, values: List[float], periods_ahead: int = 3) -> List[float]:
        if len(values) < 2:
            return []
        trend = self.analyzer.calculate_trend_line(values)
        last_value = trend[-1] if trend else values[-1]
        if len(trend) > 1:
            slope = trend[-1] - trend[-2]
        else:
            slope = 0
        return [last_value + slope * (i + 1) for i in range(periods_ahead)]