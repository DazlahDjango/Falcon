# apps/reportplt/services/generation/data_aggregator.py
from typing import Dict, Any, List, Optional
from collections import defaultdict
from django.db.models import Avg, Sum, Count, Min, Max
from datetime import datetime

class DataAggregator:
    def __init__(self):
        self.groupings = {}
        self.calculations = {}

    def aggregate_kpi_data(self, data: Dict) -> Dict[str, Any]:
        kpis = data.get('kpis', [])
        if not kpis:
            return data
        summary = {
            'total': len(kpis),
            'on_track': sum(1 for k in kpis if k.get('status') == 'On Track'),
            'at_risk': sum(1 for k in kpis if k.get('status') == 'At Risk'),
            'off_track': sum(1 for k in kpis if k.get('status') == 'Off Track'),
            'pending': sum(1 for k in kpis if k.get('status') == 'Pending'),
            'avg_progress': sum(k.get('progress', 0) for k in kpis) / len(kpis) if kpis else 0,
            'max_progress': max((k.get('progress', 0) for k in kpis), default=0),
            'min_progress': min((k.get('progress', 0) for k in kpis), default=0),
            'total_target': sum(k.get('target', 0) for k in kpis),
            'total_actual': sum(k.get('actual', 0) for k in kpis)
        }
        summary['completion_rate'] = round(
            (summary['on_track'] + summary['at_risk']) / summary['total'] * 100, 2
        ) if summary['total'] > 0 else 0
        by_department = self._group_by(kpis, 'department')
        by_category = self._group_by(kpis, 'category')
        by_status = self._group_by(kpis, 'status')
        return {
            **data,
            'summary': summary,
            'aggregations': {
                'by_department': by_department,
                'by_category': by_category,
                'by_status': by_status
            }
        }

    def aggregate_departmental_data(self, data: Dict) -> Dict[str, Any]:
        kpis = data.get('kpis', [])
        if not kpis:
            return data
        dept_stats = defaultdict(lambda: {'count': 0, 'progress': 0, 'on_track': 0, 'at_risk': 0, 'off_track': 0})
        for kpi in kpis:
            dept = kpi.get('department', 'Unassigned')
            dept_stats[dept]['count'] += 1
            dept_stats[dept]['progress'] += kpi.get('progress', 0)
            status = kpi.get('status', '')
            if status == 'On Track':
                dept_stats[dept]['on_track'] += 1
            elif status == 'At Risk':
                dept_stats[dept]['at_risk'] += 1
            elif status == 'Off Track':
                dept_stats[dept]['off_track'] += 1
        for dept, stats in dept_stats.items():
            stats['avg_progress'] = round(stats['progress'] / stats['count'], 2) if stats['count'] > 0 else 0
            stats['completion_rate'] = round(
                (stats['on_track'] + stats['at_risk']) / stats['count'] * 100, 2
            ) if stats['count'] > 0 else 0
        return {
            **data,
            'department_summary': dict(dept_stats),
            'department_count': len(dept_stats)
        }

    def aggregate_executive_data(self, data: Dict) -> Dict[str, Any]:
        result = self.aggregate_kpi_data(data)
        summary = result.get('summary', {})
        if data.get('type') == 'combined':
            kpi_summary = data.get('kpi', {}).get('summary', {})
            review_count = data.get('reviews', {}).get('count', 0)
            task_count = data.get('tasks', {}).get('count', 0)
            pip_count = data.get('pips', {}).get('count', 0)
            summary['review_count'] = review_count
            summary['task_count'] = task_count
            summary['pip_count'] = pip_count
            summary['total_items'] = summary.get('total', 0) + review_count + task_count + pip_count
        return result

    def aggregate_trend_data(self, data: Dict) -> Dict[str, Any]:
        kpis = data.get('kpis', [])
        if not kpis:
            return data
        period_data = defaultdict(list)
        for kpi in kpis:
            period = kpi.get('period', '')
            if period:
                period_data[period].append(kpi.get('progress', 0))
        trend = []
        for period, values in sorted(period_data.items()):
            trend.append({
                'period': period,
                'avg_progress': sum(values) / len(values) if values else 0,
                'count': len(values),
                'max': max(values) if values else 0,
                'min': min(values) if values else 0
            })
        return {
            **data,
            'trend': trend,
            'trend_summary': {
                'periods': len(trend),
                'avg_trend': sum(t['avg_progress'] for t in trend) / len(trend) if trend else 0
            }
        }

    def aggregate_comparative_data(self, data: Dict) -> Dict[str, Any]:
        kpis = data.get('kpis', [])
        if not kpis:
            return data
        by_department = self._group_by(kpis, 'department')
        by_category = self._group_by(kpis, 'category')
        rankings = sorted(kpis, key=lambda x: x.get('progress', 0), reverse=True)
        return {
            **data,
            'comparisons': {
                'by_department': by_department,
                'by_category': by_category,
                'top_performers': rankings[:10],
                'bottom_performers': rankings[-10:] if len(rankings) > 10 else rankings,
                'average_score': sum(k.get('progress', 0) for k in kpis) / len(kpis) if kpis else 0
            }
        }

    def aggregate_generic_data(self, data: Dict) -> Dict[str, Any]:
        if 'kpis' in data:
            return self.aggregate_kpi_data(data)
        return data

    def _group_by(self, items: List[Dict], key: str) -> Dict[str, Any]:
        grouped = defaultdict(list)
        for item in items:
            value = item.get(key, 'Unknown')
            grouped[value].append(item)
        result = {}
        for group, items_list in grouped.items():
            result[group] = {
                'count': len(items_list),
                'progress': sum(i.get('progress', 0) for i in items_list),
                'avg_progress': sum(i.get('progress', 0) for i in items_list) / len(items_list) if items_list else 0
            }
        return result

    def aggregate_by_field(self, data: List[Dict], field: str, agg_type: str = 'sum') -> Dict:
        result = defaultdict(float)
        for item in data:
            key = item.get(field, 'Unknown')
            value = item.get('value', 0)
            if agg_type == 'sum':
                result[key] += value
            elif agg_type == 'count':
                result[key] += 1
            elif agg_type == 'avg':
                result[key] = (result.get(key, 0) + value) / 2
        return dict(result)

    def aggregate_time_series(self, data: List[Dict], date_field: str, value_field: str) -> List[Dict]:
        time_series = defaultdict(list)
        for item in data:
            date = item.get(date_field)
            if date:
                time_series[date].append(item.get(value_field, 0))
        return [
            {'date': date, 'avg': sum(vals) / len(vals), 'sum': sum(vals), 'count': len(vals)}
            for date, vals in sorted(time_series.items())
        ]