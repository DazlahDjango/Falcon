# apps/reportplt/services/analytics/performance_analyzer.py
from typing import Dict, Any, List, Optional, Tuple
from collections import defaultdict
import math
from apps.reportplt.exceptions import ReportGenerationError

class PerformanceAnalyzer:
    def __init__(self):
        self.performance_scores = {}
        self.rankings = {}

    def analyze_performance(self, data: List[Dict], target_field: str = 'target', actual_field: str = 'actual', name_field: str = 'name') -> Dict[str, Any]:
        if not data:
            return {'items': [], 'summary': {}}
        analyzed_items = []
        for item in data:
            target = item.get(target_field, 0)
            actual = item.get(actual_field, 0)
            progress = self._calculate_progress(actual, target)
            performance = self._calculate_performance_score(actual, target)
            status = self._determine_status(progress)
            variance = actual - target
            analyzed_items.append({
                'name': item.get(name_field, ''),
                'target': target,
                'actual': actual,
                'progress': progress,
                'performance_score': performance,
                'status': status,
                'variance': variance,
                'variance_percentage': (variance / target * 100) if target != 0 else 0
            })
        summary = self._calculate_summary(analyzed_items)
        rankings = self._rank_items(analyzed_items)
        return {
            'items': analyzed_items,
            'summary': summary,
            'rankings': rankings,
            'status_distribution': self._get_status_distribution(analyzed_items)
        }

    def _calculate_progress(self, actual: float, target: float) -> float:
        if target == 0:
            return 0
        return min(100, (actual / target) * 100)

    def _calculate_performance_score(self, actual: float, target: float) -> float:
        if target == 0:
            return 0
        return (actual / target) * 100

    def _determine_status(self, progress: float) -> str:
        if progress >= 90:
            return 'On Track'
        elif progress >= 50:
            return 'At Risk'
        else:
            return 'Off Track'

    def _calculate_summary(self, items: List[Dict]) -> Dict:
        if not items:
            return {'average_progress': 0, 'total_actual': 0, 'total_target': 0}
        total_items = len(items)
        total_actual = sum(i.get('actual', 0) for i in items)
        total_target = sum(i.get('target', 0) for i in items)
        avg_progress = sum(i.get('progress', 0) for i in items) / total_items if total_items > 0 else 0
        avg_performance = sum(i.get('performance_score', 0) for i in items) / total_items if total_items > 0 else 0
        on_track = sum(1 for i in items if i.get('status') == 'On Track')
        at_risk = sum(1 for i in items if i.get('status') == 'At Risk')
        off_track = sum(1 for i in items if i.get('status') == 'Off Track')
        return {
            'total_items': total_items,
            'total_actual': round(total_actual, 2),
            'total_target': round(total_target, 2),
            'average_progress': round(avg_progress, 2),
            'average_performance': round(avg_performance, 2),
            'completion_rate': round((on_track + at_risk) / total_items * 100, 2) if total_items > 0 else 0,
            'on_track': on_track,
            'at_risk': at_risk,
            'off_track': off_track
        }

    def _rank_items(self, items: List[Dict]) -> Dict:
        sorted_items = sorted(items, key=lambda x: x.get('performance_score', 0), reverse=True)
        return {
            'top_performers': sorted_items[:5],
            'bottom_performers': sorted_items[-5:],
            'ranked_list': sorted_items
        }

    def _get_status_distribution(self, items: List[Dict]) -> Dict:
        distribution = defaultdict(int)
        for item in items:
            distribution[item.get('status', 'Unknown')] += 1
        return dict(distribution)

    def calculate_variance_analysis(self, data: List[Dict], target_field: str = 'target', actual_field: str = 'actual') -> Dict:
        variances = []
        for item in data:
            target = item.get(target_field, 0)
            actual = item.get(actual_field, 0)
            variance = actual - target
            variances.append({
                'name': item.get('name', ''),
                'variance': variance,
                'variance_percentage': (variance / target * 100) if target != 0 else 0,
                'is_favorable': variance > 0,
                'is_unfavorable': variance < 0
            })
        positive_variances = [v for v in variances if v['is_favorable']]
        negative_variances = [v for v in variances if v['is_unfavorable']]
        return {
            'variances': variances,
            'summary': {
                'total_positive': len(positive_variances),
                'total_negative': len(negative_variances),
                'total_positive_value': sum(v['variance'] for v in positive_variances),
                'total_negative_value': abs(sum(v['variance'] for v in negative_variances)),
                'net_variance': sum(v['variance'] for v in variances)
            }
        }

    def calculate_threshold_analysis(self, data: List[Dict], threshold_field: str = 'threshold', actual_field: str = 'actual', name_field: str = 'name') -> Dict:
        results = []
        for item in data:
            threshold = item.get(threshold_field, 0)
            actual = item.get(actual_field, 0)
            is_above = actual > threshold
            is_below = actual < threshold
            deviation = actual - threshold
            deviation_percentage = (deviation / threshold * 100) if threshold != 0 else 0
            results.append({
                'name': item.get(name_field, ''),
                'threshold': threshold,
                'actual': actual,
                'is_above': is_above,
                'is_below': is_below,
                'deviation': deviation,
                'deviation_percentage': deviation_percentage
            })
        return {
            'items': results,
            'summary': {
                'total_above': sum(1 for r in results if r['is_above']),
                'total_below': sum(1 for r in results if r['is_below']),
                'max_deviation': max((r['deviation'] for r in results), default=0),
                'min_deviation': min((r['deviation'] for r in results), default=0)
            }
        }

    def calculate_score_distribution(self, data: List[Dict], score_field: str = 'progress') -> Dict:
        scores = [i.get(score_field, 0) for i in data]
        if not scores:
            return {}
        sorted_scores = sorted(scores)
        return {
            'min': min(scores),
            'max': max(scores),
            'mean': sum(scores) / len(scores),
            'median': sorted_scores[len(sorted_scores) // 2],
            'std_dev': self._calculate_std_dev(scores),
            'percentiles': {
                '25th': sorted_scores[int(len(sorted_scores) * 0.25)] if len(scores) > 0 else 0,
                '50th': sorted_scores[int(len(sorted_scores) * 0.50)] if len(scores) > 0 else 0,
                '75th': sorted_scores[int(len(sorted_scores) * 0.75)] if len(scores) > 0 else 0,
                '90th': sorted_scores[int(len(sorted_scores) * 0.90)] if len(scores) > 0 else 0
            }
        }

    def _calculate_std_dev(self, values: List[float]) -> float:
        if not values:
            return 0
        mean = sum(values) / len(values)
        variance = sum((v - mean) ** 2 for v in values) / len(values)
        return math.sqrt(variance)

class PerformanceAnalyzerService:
    def __init__(self):
        self.analyzer = PerformanceAnalyzer()

    def analyze_kpi_performance(self, kpis: List[Dict]) -> Dict:
        return self.analyzer.analyze_performance(kpis, 'target', 'actual', 'name')

    def analyze_department_performance(self, departments: List[Dict]) -> Dict:
        return self.analyzer.analyze_performance(departments, 'target', 'actual', 'name')

    def analyze_team_performance(self, teams: List[Dict]) -> Dict:
        return self.analyzer.analyze_performance(teams, 'target', 'actual', 'name')

    def analyze_individual_performance(self, individuals: List[Dict]) -> Dict:
        return self.analyzer.analyze_performance(individuals, 'target', 'actual', 'name')

    def calculate_team_comparison(self, teams_data: Dict) -> Dict:
        teams = list(teams_data.keys())
        team_scores = {}
        for team, data in teams_data.items():
            analysis = self.analyzer.analyze_performance(data, 'target', 'actual', 'name')
            team_scores[team] = analysis['summary']
        return {
            'teams': teams,
            'scores': team_scores,
            'ranking': sorted(team_scores.items(), key=lambda x: x[1].get('average_progress', 0), reverse=True)
        }