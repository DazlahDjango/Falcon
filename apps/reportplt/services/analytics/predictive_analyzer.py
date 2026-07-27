# apps/reportplt/services/analytics/predictive_analyzer.py
from typing import Dict, Any, List, Optional, Tuple
import math
from datetime import datetime, timedelta
import statistics
from apps.reportplt.exceptions import ReportGenerationError

class PredictiveAnalyzer:
    def __init__(self):
        self.forecast_models = {}

    def simple_linear_forecast(self, data: List[float], periods: int = 3) -> List[float]:
        if len(data) < 2:
            return [data[-1] if data else 0] * periods
        n = len(data)
        x = list(range(n))
        x_mean = sum(x) / n
        y_mean = sum(data) / n
        numerator = sum((x[i] - x_mean) * (data[i] - y_mean) for i in range(n))
        denominator = sum((x[i] - x_mean) ** 2 for i in range(n))
        slope = numerator / denominator if denominator != 0 else 0
        intercept = y_mean - slope * x_mean
        return [slope * (n + i) + intercept for i in range(periods)]

    def moving_average_forecast(self, data: List[float], window: int = 3, periods: int = 3) -> List[float]:
        if len(data) < window:
            return [data[-1] if data else 0] * periods
        forecast = []
        for _ in range(periods):
            if len(data) < window:
                forecast.append(data[-1] if data else 0)
            else:
                avg = sum(data[-window:]) / window
                forecast.append(avg)
                data.append(avg)
        return forecast

    def exponential_smoothing_forecast(self, data: List[float], alpha: float = 0.3, periods: int = 3) -> List[float]:
        if not data:
            return [0] * periods
        smoothed = [data[0]]
        for i in range(1, len(data)):
            smoothed.append(alpha * data[i] + (1 - alpha) * smoothed[-1])
        last_smoothed = smoothed[-1]
        return [last_smoothed] * periods

    def holt_winters_forecast(self, data: List[float], seasonal_period: int = 12, alpha: float = 0.3, beta: float = 0.1, gamma: float = 0.1, periods: int = 3) -> List[float]:
        if len(data) < seasonal_period * 2:
            return self.simple_linear_forecast(data, periods)
        level = data[0]
        trend = data[1] - data[0] if len(data) > 1 else 0
        seasonal = [data[i] / (data[0] + 0.001) for i in range(seasonal_period)]
        forecast = []
        for t in range(periods):
            forecast.append(level + trend * (t + 1) + seasonal[t % seasonal_period])
            if t == 0:
                level = alpha * data[-1] + (1 - alpha) * (level + trend)
                trend = beta * (level - data[-1]) + (1 - beta) * trend
                seasonal[t % seasonal_period] = gamma * (data[-1] / (level + 0.001)) + (1 - gamma) * seasonal[t % seasonal_period]
        return forecast

    def arima_forecast(self, data: List[float], periods: int = 3) -> List[float]:
        return self.simple_linear_forecast(data, periods)

    def calculate_confidence_interval(self, data: List[float], forecast: List[float], confidence: float = 0.95) -> List[Dict]:
        if len(data) < 2:
            return []
        residuals = [data[i] - data[i-1] if i > 0 else 0 for i in range(1, len(data))]
        std_dev = statistics.stdev(residuals) if len(residuals) > 1 else 0
        z_score = 1.96
        margin = z_score * std_dev
        intervals = []
        for value in forecast:
            intervals.append({
                'forecast': value,
                'lower': value - margin,
                'upper': value + margin,
                'confidence': confidence
            })
        return intervals

    def detect_forecast_accuracy(self, actual: List[float], forecast: List[float]) -> Dict:
        if not actual or not forecast:
            return {'mae': 0, 'mse': 0, 'rmse': 0, 'mape': 0}
        min_len = min(len(actual), len(forecast))
        actual = actual[:min_len]
        forecast = forecast[:min_len]
        errors = [actual[i] - forecast[i] for i in range(min_len)]
        mae = sum(abs(e) for e in errors) / min_len
        mse = sum(e ** 2 for e in errors) / min_len
        rmse = math.sqrt(mse)
        mape = sum(abs(e) / (actual[i] + 0.001) for i, e in enumerate(errors)) / min_len * 100
        return {'mae': mae, 'mse': mse, 'rmse': rmse, 'mape': mape}

    def seasonality_analysis(self, data: List[float], period: int = 12) -> Dict:
        if len(data) < period * 2:
            return {'seasonal_pattern': 'insufficient_data'}
        seasonal_indices = []
        for i in range(period):
            indices = [data[j] for j in range(i, len(data), period) if j < len(data)]
            seasonal_indices.append(sum(indices) / len(indices) if indices else 0)
        avg = sum(seasonal_indices) / len(seasonal_indices) if seasonal_indices else 1
        seasonal_indices = [s / avg for s in seasonal_indices]
        return {
            'seasonal_indices': seasonal_indices,
            'pattern': self._detect_seasonal_pattern(seasonal_indices),
            'peak_season': seasonal_indices.index(max(seasonal_indices)) + 1 if seasonal_indices else None,
            'low_season': seasonal_indices.index(min(seasonal_indices)) + 1 if seasonal_indices else None
        }

    def _detect_seasonal_pattern(self, indices: List[float]) -> str:
        if not indices:
            return 'no_pattern'
        avg = sum(indices) / len(indices)
        peaks = sum(1 for i in indices if i > avg * 1.1)
        troughs = sum(1 for i in indices if i < avg * 0.9)
        if peaks > len(indices) * 0.3 and troughs > len(indices) * 0.3:
            return 'cyclical'
        elif peaks > len(indices) * 0.4:
            return 'peak_dominated'
        elif troughs > len(indices) * 0.4:
            return 'trough_dominated'
        else:
            return 'stable'

    def get_forecast_summary(self, data: List[float], periods: int = 3, method: str = 'linear') -> Dict:
        if method == 'linear':
            forecast = self.simple_linear_forecast(data, periods)
        elif method == 'moving_average':
            forecast = self.moving_average_forecast(data, 3, periods)
        elif method == 'exponential':
            forecast = self.exponential_smoothing_forecast(data, 0.3, periods)
        elif method == 'holt_winters':
            forecast = self.holt_winters_forecast(data, 12, 0.3, 0.1, 0.1, periods)
        else:
            forecast = self.simple_linear_forecast(data, periods)
        confidence = self.calculate_confidence_interval(data, forecast)
        return {
            'forecast': forecast,
            'confidence_intervals': confidence,
            'last_actual': data[-1] if data else 0,
            'trend_direction': 'upward' if forecast[-1] > (data[-1] if data else 0) else 'downward' if forecast[-1] < (data[-1] if data else 0) else 'stable',
            'method': method
        }

class PredictiveAnalyzerService:
    def __init__(self):
        self.analyzer = PredictiveAnalyzer()

    def forecast_kpi_performance(self, kpi_history: List[float], periods: int = 3) -> Dict:
        return self.analyzer.get_forecast_summary(kpi_history, periods)

    def forecast_revenue(self, revenue_history: List[float], periods: int = 3) -> Dict:
        return self.analyzer.get_forecast_summary(revenue_history, periods, 'holt_winters')

    def forecast_growth(self, growth_history: List[float], periods: int = 3) -> Dict:
        return self.analyzer.get_forecast_summary(growth_history, periods, 'exponential')

    def seasonality_analysis(self, data: List[float], period: int = 12) -> Dict:
        return self.analyzer.seasonality_analysis(data, period)