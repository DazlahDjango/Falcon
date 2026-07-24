# apps/reportplt/services/analytics/comparative_analyzer.py
from typing import Dict, Any, List, Optional, Tuple
from collections import defaultdict
import math
from apps.reportplt.exceptions import ReportGenerationError

class ComparativeAnalyzer:
    def __init__(self):
        self.comparisons = {}
        self.rankings = {}

    def compare_departments(self, departments: Dict[str, List[Dict]], metric: str = 'progress') -> Dict[str, Any]:
        if not departments:
            return {'comparisons': [], 'summary': {}}
        result = {}
        dept_names = list(departments.keys())
        for name, data in departments.items():
            values = [d.get(metric, 0) for d in data]
            avg = sum(values) / len(values) if values else 0
            result[name] = {
                'avg': avg,
                'min': min(values) if values else 0,
                'max': max(values) if values else 0,
                'count': len(values),
                'total': sum(values),
                'std_dev': self._calculate_std_dev(values)
            }
        dept_values = [v['avg'] for v in result.values()]
        overall_avg = sum(dept_values) / len(dept_values) if dept_values else 0
        rankings = sorted(result.items(), key=lambda x: x[1]['avg'], reverse=True)
        return {
            'departments': result,
            'rankings': rankings,
            'overall_avg': overall_avg,
            'top_performer': rankings[0][0] if rankings else None,
            'bottom_performer': rankings[-1][0] if rankings else None,
            'variance': self._calculate_variance(dept_values)
        }

    def compare_teams(self, teams: Dict[str, List[Dict]], metric: str = 'progress') -> Dict[str, Any]:
        return self.compare_departments(teams, metric)

    def compare_individuals(self, individuals: List[Dict], group_by: str = 'department', metric: str = 'progress') -> Dict[str, Any]:
        if not individuals:
            return {'comparisons': [], 'summary': {}}
        grouped = defaultdict(list)
        for ind in individuals:
            key = ind.get(group_by, 'Unknown')
            grouped[key].append(ind.get(metric, 0))
        result = {}
        for key, values in grouped.items():
            result[key] = {
                'avg': sum(values) / len(values) if values else 0,
                'count': len(values),
                'min': min(values) if values else 0,
                'max': max(values) if values else 0,
                'std_dev': self._calculate_std_dev(values)
            }
        rankings = sorted(result.items(), key=lambda x: x[1]['avg'], reverse=True)
        return {
            'groups': result,
            'rankings': rankings,
            'top_group': rankings[0][0] if rankings else None,
            'bottom_group': rankings[-1][0] if rankings else None
        }

    def compare_time_periods(self, time_data: Dict[str, List[float]]) -> Dict[str, Any]:
        if not time_data:
            return {'comparisons': [], 'summary': {}}
        result = {}
        periods = list(time_data.keys())
        for period, values in time_data.items():
            avg = sum(values) / len(values) if values else 0
            result[period] = {
                'avg': avg,
                'min': min(values) if values else 0,
                'max': max(values) if values else 0,
                'count': len(values),
                'total': sum(values)
            }
        period_values = [v['avg'] for v in result.values()]
        overall_avg = sum(period_values) / len(period_values) if period_values else 0
        rankings = sorted(result.items(), key=lambda x: x[1]['avg'], reverse=True)
        return {
            'periods': result,
            'rankings': rankings,
            'overall_avg': overall_avg,
            'best_period': rankings[0][0] if rankings else None,
            'worst_period': rankings[-1][0] if rankings else None,
            'trend': [result[p]['avg'] for p in sorted(periods)]
        }

    def compare_categories(self, category_data: Dict[str, List[Dict]], metric: str = 'progress', value_field: str = 'value') -> Dict[str, Any]:
        if not category_data:
            return {'comparisons': [], 'summary': {}}
        result = {}
        for category, items in category_data.items():
            values = [i.get(metric, 0) for i in items]
            result[category] = {
                'avg': sum(values) / len(values) if values else 0,
                'count': len(values),
                'total': sum(values),
                'min': min(values) if values else 0,
                'max': max(values) if values else 0
            }
        rankings = sorted(result.items(), key=lambda x: x[1]['avg'], reverse=True)
        return {
            'categories': result,
            'rankings': rankings,
            'top_category': rankings[0][0] if rankings else None,
            'bottom_category': rankings[-1][0] if rankings else None
        }

    def calculate_comparison_matrix(self, data: List[Dict], row_field: str, col_field: str, value_field: str = 'value') -> Dict:
        matrix = defaultdict(lambda: defaultdict(float))
        row_labels = set()
        col_labels = set()
        for item in data:
            row = item.get(row_field, 'Unknown')
            col = item.get(col_field, 'Unknown')
            val = item.get(value_field, 0)
            row_labels.add(row)
            col_labels.add(col)
            matrix[row][col] = val
        sorted_rows = sorted(row_labels)
        sorted_cols = sorted(col_labels)
        return {
            'row_labels': sorted_rows,
            'col_labels': sorted_cols,
            'matrix': [[matrix[row].get(col, 0) for col in sorted_cols] for row in sorted_rows],
            'row_totals': [sum(matrix[row].values()) for row in sorted_rows],
            'col_totals': [sum(matrix[row].get(col, 0) for row in sorted_rows) for col in sorted_cols]
        }

    def calculate_rankings(self, items: List[Dict], metric: str = 'score', name_field: str = 'name') -> List[Dict]:
        sorted_items = sorted(items, key=lambda x: x.get(metric, 0), reverse=True)
        rankings = []
        for idx, item in enumerate(sorted_items, 1):
            rankings.append({
                'rank': idx,
                'name': item.get(name_field, ''),
                'score': item.get(metric, 0),
                'is_top': idx <= 3,
                'is_bottom': idx > len(sorted_items) - 3
            })
        return rankings

    def _calculate_std_dev(self, values: List[float]) -> float:
        if not values:
            return 0
        mean = sum(values) / len(values)
        variance = sum((v - mean) ** 2 for v in values) / len(values)
        return math.sqrt(variance)

    def _calculate_variance(self, values: List[float]) -> float:
        if not values:
            return 0
        mean = sum(values) / len(values)
        return sum((v - mean) ** 2 for v in values) / len(values)

    def compare_with_benchmark(self, data: List[Dict], benchmark: float, metric: str = 'value', name_field: str = 'name') -> Dict:
        comparisons = []
        for item in data:
            value = item.get(metric, 0)
            comparisons.append({
                'name': item.get(name_field, ''),
                'value': value,
                'benchmark': benchmark,
                'difference': value - benchmark,
                'difference_percentage': ((value - benchmark) / benchmark * 100) if benchmark != 0 else 0,
                'is_above': value > benchmark,
                'is_below': value < benchmark,
                'is_at': value == benchmark
            })
        return {
            'comparisons': comparisons,
            'summary': {
                'total_above': sum(1 for c in comparisons if c['is_above']),
                'total_below': sum(1 for c in comparisons if c['is_below']),
                'total_at': sum(1 for c in comparisons if c['is_at']),
                'avg_difference': sum(c['difference'] for c in comparisons) / len(comparisons) if comparisons else 0
            }
        }

class ComparativeAnalyzerService:
    def __init__(self):
        self.analyzer = ComparativeAnalyzer()

    def compare_departments(self, departments_data: Dict[str, List[Dict]]) -> Dict:
        return self.analyzer.compare_departments(departments_data)

    def compare_teams(self, teams_data: Dict[str, List[Dict]]) -> Dict:
        return self.analyzer.compare_teams(teams_data)

    def compare_performance_groups(self, groups_data: Dict[str, List[Dict]]) -> Dict:
        return self.analyzer.compare_categories(groups_data)

    def compare_executive_dashboard(self, data: Dict) -> Dict:
        dept_analysis = self.analyzer.compare_departments(data.get('departments', {}))
        team_analysis = self.analyzer.compare_teams(data.get('teams', {}))
        return {
            'departments': dept_analysis,
            'teams': team_analysis,
            'overall_rankings': self.analyzer.calculate_rankings(
                data.get('individuals', []),
                metric='progress',
                name_field='name'
            )
        }