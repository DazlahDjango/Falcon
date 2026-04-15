from decimal import Decimal
from typing import Dict, List
from django.utils import timezone
from datetime import timedelta, datetime
import logging
logger = logging.getLogger(__name__)


class TrafficLightEvaluator:
    def __init__(self, green_threshold: Decimal = Decimal('90'), yellow_threshold: Decimal = Decimal('50')):
        self.green_threshold = green_threshold
        self.yellow_threshold = yellow_threshold
    def evaluate(self, score: Decimal) -> Dict[str, str]:
        if score >= self.green_threshold:
            status = 'GREEN'
        elif score >= self.yellow_threshold:
            status = 'YELLOW'
        else:
            status = 'RED'
        return {
            'status': status,
            'green_threshold': self.green_threshold,
            'yellow_threshold': self.yellow_threshold
        }
    def get_status_description(self, status: str) -> str:
        descriptions = {
            'GREEN': 'On Track - Performance meets or exceeds expectations',
            'YELLOW': 'At Risk - Performance below target, requires attention',
            'RED': 'Off Track - Significant gap, immediate intervention needed'
        }
        return descriptions.get(status, 'Unknown status')
    def get_action_required(self, status: str) -> str:
        actions = {
            'GREEN': 'Monitor and sustain',
            'YELLOW': 'Review and intervene',
            'RED': 'Escalate and remediate'
        }
        return actions.get(status, 'Review status')
    
class TrendAnalyzer:
    TREND_IMPROVING = 'IMPROVING'
    TREND_DECLINING = 'DECLINING'
    TREND_STABLE = 'STABLE'
    TREND_VOLATILE = 'VOLATILE'
    def analyze(self, scores: List[Decimal]) -> Dict[str, any]:
        if not scores:
            return {'direction': self.TREND_STABLE, 'confidence': 0}
        if len(scores) == 1:
            return {'direction': self.TREND_STABLE, 'confidence': 0.5}
        ma_short = self._moving_average(scores, min(3, len(scores)))
        ma_long = self._moving_average(scores, min(6, len(scores)))
        if len(ma_short) >= 2 and len(ma_long) >= 2:
            short_slope = ma_short[-1] - ma_short[0]
            long_slope = ma_long[-1] - ma_long[0]
            if short_slope > 5 and long_slope > 2:
                direction = self.TREND_IMPROVING
                confidence = min(0.9, (short_slope / 20))
            elif short_slope < -5 and long_slope < -2:
                direction = self.TREND_DECLINING
                confidence = min(0.9, abs(short_slope / 20))
            elif abs(short_slope) <= 3:
                direction = self.TREND_STABLE
                confidence = 0.6
            else:
                direction = self.TREND_VOLATILE
                confidence = 0.4
        else:
            direction = self.TREND_STABLE
            confidence = 0.3
        last_3_avg = sum(scores[-3:]) / min(3, len(scores)) if scores else 0
        last_6_avg = sum(scores[-6:]) / min(6, len(scores)) if scores else 0
        return {
            'direction': direction,
            'confidence': round(confidence, 2),
            'last_3_months_avg': round(last_3_avg, 2),
            'last_6_months_avg': round(last_6_avg, 2),
            'overall_trend': self._calculate_slope(scores)
        }
    def _moving_average(self, scores: List[Decimal], window: int) -> List[Decimal]:
        if len(scores) < window:
            return scores
        result = []
        for i in range(len(scores) - window + 1):
            avg = sum(scores[i:i+window]) / window
            result.append(avg)
        return result
    def _caclulate_slope(self, scores: List[Decimal]) -> float:
        if len(scores) < 2:
            return 0
        n = len(scores)
        x = list(range(n))
        x_mean = sum(x) / n
        y_mean = sum(scores) / n
        numerator = sum((x[i] - x_mean) * (scores[i] - y_mean) for i in range(n))
        denominator = sum((x[i] - x_mean) **2 for i in range(n))
        if denominator == 0:
            return 0
        return numerator / denominator
    def detect_consecutive_red(self, traffic_lights: List[str]) -> int:
        consecutive = 0
        for status in reversed(traffic_lights):
            if status == 'RED':
                consecutive += 1
            else:
                break
        return consecutive
    
class RiskPredictor:
    def __init__(self):
        self.ml_enabled = False
    def predict_risk(self, kpi_id: str, user_id: str, scores: List[Decimal]) -> Dict[str, any]:
        if not scores:
            return {'risk_level': 'UNKNOWN', 'probability': 0}
        last_score = scores[-1] if scores else Decimal('0')
        trend = self._calculate_trend(scores)
        factors = []
        if last_score < 50:
            factors.append('current_score_red')
        if trend < -5:
            factors.append('declining_trend')
        if len(scores) >= 3 and all(s < 50 for s in scores[-3:]):
            factors.append('persistent_underperformance')
        if len(factors) >= 2:
            risk_level = 'HIGH'
            probability = 0.8
        elif len(factors) == 1:
            risk_level = 'MEDIUM'
            probability = 0.5
        else:
            risk_level = 'LOW'
            probability = 0.2
        return {
            'risk_level': risk_level,
            'probability': probability,
            'factors': factors,
            'prediction': 'RED' if probability > 0.6 else 'YELLOW' if probability > 0.3 else 'GREEN'
        }
    def _calculate_trend(self, scores: List[Decimal]) -> float:
        if len(scores) < 2:
            return 0
        n = len(scores)
        x = list(range(n))
        x_mean = sum(x) / n
        y_mean = sum(scores) / n
        numerator = sum((x[i] - x_mean) * (scores[i] - y_mean) for i in range(n))
        denominator = sum((x[i] - x_mean) ** 2 for i in range(n))
        if denominator == 0:
            return 0
        return float(numerator / denominator)
    def get_recommendations(self, risk_level: str, factors: List[str]) -> List[str]:
        recommendations = {
            'HIGH': [
                'Schedule immediate performance review',
                'Develop corrective action plan',
                'Increase supervision frequency',
                'Consider PIP if persistent'
            ],
            'MEDIUM': [
                'Review performance this week',
                'Provide additional support/resources',
                'Monitor weekly instead of monthly'
            ],
            'LOW': [
                'Continue regular monitoring',
                'Document improvement strategies'
            ]
        }
        return recommendations.get(risk_level, ['Continue regular monitoring'])
    