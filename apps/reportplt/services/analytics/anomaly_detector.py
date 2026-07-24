# apps/reportplt/services/analytics/anomaly_detector.py
from typing import Dict, Any, List, Optional, Tuple
import math
import statistics
from collections import deque
from apps.reportplt.exceptions import ReportGenerationError

class AnomalyDetector:
    def __init__(self, window_size: int = 30, threshold: float = 2.0):
        self.window_size = window_size
        self.threshold = threshold
        self.data_window = deque(maxlen=window_size)

    def detect_anomalies(self, data: List[float], threshold: Optional[float] = None) -> List[Dict]:
        if len(data) < 3:
            return []
        threshold = threshold or self.threshold
        anomalies = []
        for i, value in enumerate(data):
            window = data[max(0, i - self.window_size):i]
            if len(window) >= 3:
                mean = sum(window) / len(window)
                std_dev = self._calculate_std_dev(window)
                z_score = (value - mean) / std_dev if std_dev != 0 else 0
                is_anomaly = abs(z_score) > threshold
                if is_anomaly:
                    anomalies.append({
                        'index': i,
                        'value': value,
                        'z_score': z_score,
                        'mean': mean,
                        'std_dev': std_dev,
                        'severity': self._determine_severity(abs(z_score))
                    })
        return anomalies

    def _calculate_std_dev(self, values: List[float]) -> float:
        if not values:
            return 0
        mean = sum(values) / len(values)
        variance = sum((v - mean) ** 2 for v in values) / len(values)
        return math.sqrt(variance)

    def _determine_severity(self, z_score: float) -> str:
        if z_score > 3.0:
            return 'critical'
        elif z_score > 2.5:
            return 'high'
        elif z_score > 2.0:
            return 'medium'
        else:
            return 'low'

    def detect_outliers_iqr(self, data: List[float]) -> List[Dict]:
        if len(data) < 4:
            return []
        sorted_data = sorted(data)
        q1 = sorted_data[int(len(sorted_data) * 0.25)]
        q3 = sorted_data[int(len(sorted_data) * 0.75)]
        iqr = q3 - q1
        lower_bound = q1 - 1.5 * iqr
        upper_bound = q3 + 1.5 * iqr
        outliers = []
        for i, value in enumerate(data):
            if value < lower_bound or value > upper_bound:
                outliers.append({
                    'index': i,
                    'value': value,
                    'lower_bound': lower_bound,
                    'upper_bound': upper_bound,
                    'type': 'low' if value < lower_bound else 'high'
                })
        return outliers

    def detect_performance_anomalies(self, kpis: List[Dict], metric: str = 'progress', threshold: float = 2.0) -> List[Dict]:
        anomalies = []
        if not kpis:
            return anomalies
        values = [k.get(metric, 0) for k in kpis]
        detected = self.detect_anomalies(values, threshold)
        for anomaly in detected:
            idx = anomaly['index']
            if idx < len(kpis):
                anomalies.append({
                    'kpi': kpis[idx],
                    'anomaly': anomaly
                })
        return anomalies

    def detect_data_quality_issues(self, data: List[Dict], fields: List[str]) -> List[Dict]:
        issues = []
        for idx, item in enumerate(data):
            for field in fields:
                value = item.get(field)
                if value is None:
                    issues.append({
                        'index': idx,
                        'field': field,
                        'issue': 'missing_value',
                        'severity': 'high'
                    })
                elif isinstance(value, (int, float)):
                    if value < 0:
                        issues.append({
                            'index': idx,
                            'field': field,
                            'issue': 'negative_value',
                            'severity': 'medium',
                            'value': value
                        })
                    elif value > 100 and field in ['progress', 'score']:
                        issues.append({
                            'index': idx,
                            'field': field,
                            'issue': 'out_of_range',
                            'severity': 'medium',
                            'value': value
                        })
        return issues

    def detect_trend_anomalies(self, data: List[float], window: int = 5) -> List[Dict]:
        if len(data) < window + 2:
            return []
        anomalies = []
        for i in range(window, len(data) - 1):
            prev_window = data[i-window:i]
            curr_value = data[i]
            next_value = data[i+1]
            if len(prev_window) > 0:
                trend = statistics.mean(prev_window)
                trend_std = self._calculate_std_dev(prev_window)
                if curr_value > trend + 2 * trend_std or curr_value < trend - 2 * trend_std:
                    direction = 'up' if curr_value > trend else 'down'
                    if (direction == 'up' and next_value < curr_value) or (direction == 'down' and next_value > curr_value):
                        anomalies.append({
                            'index': i,
                            'value': curr_value,
                            'trend': trend,
                            'direction': direction,
                            'severity': 'high' if abs(curr_value - trend) / (trend_std + 0.001) > 3 else 'medium'
                        })
        return anomalies

    def detect_sudden_changes(self, data: List[float], threshold_percentage: float = 20) -> List[Dict]:
        if len(data) < 2:
            return []
        changes = []
        for i in range(1, len(data)):
            if data[i-1] == 0:
                continue
            change_percentage = abs((data[i] - data[i-1]) / data[i-1]) * 100
            if change_percentage > threshold_percentage:
                changes.append({
                    'index': i,
                    'previous': data[i-1],
                    'current': data[i],
                    'change_percentage': change_percentage,
                    'direction': 'up' if data[i] > data[i-1] else 'down'
                })
        return changes

    def detect_stagnation(self, data: List[float], window: int = 10, tolerance: float = 0.01) -> List[Dict]:
        if len(data) < window:
            return []
        stagnations = []
        for i in range(window, len(data)):
            window_data = data[i-window:i]
            avg = sum(window_data) / len(window_data)
            std_dev = self._calculate_std_dev(window_data)
            if std_dev < tolerance * avg and avg > 0:
                stagnations.append({
                    'index': i,
                    'value': data[i],
                    'avg': avg,
                    'std_dev': std_dev,
                    'duration': window
                })
        return stagnations

    def get_anomaly_summary(self, data: List[float]) -> Dict:
        anomalies = self.detect_anomalies(data)
        outliers = self.detect_outliers_iqr(data)
        sudden_changes = self.detect_sudden_changes(data)
        return {
            'total_data_points': len(data),
            'anomalies_count': len(anomalies),
            'outliers_count': len(outliers),
            'sudden_changes_count': len(sudden_changes),
            'anomaly_rate': len(anomalies) / len(data) if data else 0,
            'top_anomalies': sorted(anomalies, key=lambda x: abs(x.get('z_score', 0)), reverse=True)[:5]
        }

class AnomalyDetectorService:
    def __init__(self):
        self.detector = AnomalyDetector()

    def detect_kpi_anomalies(self, kpi_data: List[Dict], metric: str = 'progress') -> List[Dict]:
        return self.detector.detect_performance_anomalies(kpi_data, metric)

    def detect_financial_anomalies(self, financial_data: List[float]) -> List[Dict]:
        return self.detector.detect_anomalies(financial_data)

    def detect_operational_anomalies(self, operational_data: List[float]) -> List[Dict]:
        return self.detector.detect_trend_anomalies(operational_data)

    def get_anomaly_report(self, data: List[float]) -> Dict:
        return self.detector.get_anomaly_summary(data)

    def detect_data_quality_issues(self, data: List[Dict], fields: List[str]) -> List[Dict]:
        return self.detector.detect_data_quality_issues(data, fields)

    def detect_outliers(self, data: List[float]) -> List[Dict]:
        return self.detector.detect_outliers_iqr(data)