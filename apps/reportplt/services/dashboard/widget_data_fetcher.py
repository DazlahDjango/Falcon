# apps/reportplt/services/dashboard/widget_data_fetcher.py
from typing import Dict, Any, List, Optional
from django.db import models
from django.utils import timezone
from apps.reportplt.models import ReportWidget
from apps.reportplt.constants import WidgetType
from apps.reportplt.exceptions import WidgetDataError
from apps.reportplt.services.generation.query_builder import QueryBuilder
from apps.reportplt.services.generation.data_aggregator import DataAggregator
from apps.reportplt.services.generation.chart_renderer import ChartRenderer
from apps.kpi.models import KPI, Score
from apps.reviews.models import SupervisorReview, CompetencyRating
from apps.structure.models import Department

class KPIEntryWrapper:
    def __init__(self, score_obj):
        self.score_obj = score_obj
        from datetime import date
        self.period = date(score_obj.year, score_obj.month, 1)
        self.actual = score_obj.actual_value
        self.progress = score_obj.score
        
        # Get traffic light status
        tf = score_obj.traffic_lights.first() if hasattr(score_obj, 'traffic_lights') else None
        self.status = tf.get_status_display() if tf else 'Pending'

class WidgetDataFetcher:
    def __init__(self):
        self.query_builder = QueryBuilder()
        self.data_aggregator = DataAggregator()
        self.chart_renderer = ChartRenderer()

    def fetch_widget_data(self, widget: ReportWidget) -> Dict[str, Any]:
        data_source = widget.data_source or 'auto'
        if data_source == 'kpi':
            return self._fetch_kpi_data(widget)
        elif data_source == 'reviews':
            return self._fetch_review_data(widget)
        elif data_source == 'tasks':
            return self._fetch_task_data(widget)
        elif data_source == 'pip':
            return self._fetch_pip_data(widget)
        else:
            return self._fetch_auto_data(widget)

    def _fetch_kpi_data(self, widget: ReportWidget) -> Dict:
        query = widget.data_query or {}
        filters = widget.filters or {}
        limit = widget.limit or 100
        try:
            kpis = KPI.objects.filter(tenant_id=widget.tenant_id)
            if filters.get('department'):
                kpis = kpis.filter(department_id=filters['department'])
            if filters.get('category'):
                kpis = kpis.filter(category=filters['category'])
            if filters.get('status'):
                kpis = kpis.filter(status=filters['status'])
            kpis = kpis[:limit]
            kpi_data = []
            for kpi in kpis:
                scores = Score.objects.filter(kpi=kpi).order_by('-year', '-month').prefetch_related('traffic_lights')[:12]
                entries = [KPIEntryWrapper(s) for s in scores]
                if widget.widget_type == WidgetType.KPI:
                    latest = entries.first()
                    if latest:
                        kpi_data.append({
                            'name': kpi.name,
                            'value': latest.actual,
                            'target': kpi.target,
                            'progress': latest.progress,
                            'status': latest.status,
                            'unit': kpi.unit
                        })
                elif widget.widget_type in [WidgetType.TREND, WidgetType.LINE, WidgetType.AREA]:
                    kpi_data.append({
                        'name': kpi.name,
                        'periods': [e.period.isoformat() for e in entries],
                        'values': [e.actual for e in entries],
                        'progress': [e.progress for e in entries]
                    })
                else:
                    kpi_data.append({
                        'name': kpi.name,
                        'target': kpi.target,
                        'actual': latest.actual if latest else 0,
                        'progress': latest.progress if latest else 0,
                        'status': latest.status if latest else 'Pending'
                    })
            return self._format_kpi_response(kpi_data, widget.widget_type)
        except Exception as e:
            raise WidgetDataError(f"Failed to fetch KPI data: {str(e)}")

    def _fetch_review_data(self, widget: ReportWidget) -> Dict:
        try:
            reviews = SupervisorReview.objects.filter(tenant_id=widget.tenant_id)
            if widget.filters.get('period'):
                reviews = reviews.filter(review_cycle_id=widget.filters['period'])
            if widget.filters.get('status'):
                reviews = reviews.filter(status=widget.filters['status'])
            reviews = reviews.select_related('employee', 'review_cycle')[:widget.limit or 50]
            review_data = []
            for review in reviews:
                rating = review.average_competency_rating
                review_data.append({
                    'user': review.employee.get_full_name() if review.employee else None,
                    'period': review.review_cycle.name if review.review_cycle else '',
                    'status': review.status,
                    'score': float(rating) if rating is not None else 0.0,
                    'responses_count': review.competency_ratings_count
                })
            return {
                'items': review_data,
                'total': len(review_data),
                'avg_score': sum(r['score'] or 0 for r in review_data) / len(review_data) if review_data else 0
            }
        except Exception as e:
            raise WidgetDataError(f"Failed to fetch review data: {str(e)}")

    def _fetch_task_data(self, widget: ReportWidget) -> Dict:
        try:
            from apps.tasks_module.models import Task
        except ImportError:
            raise WidgetDataError("Tasks module is not installed or available.")
        try:
            tasks = Task.objects.filter(tenant_id=widget.tenant_id)
            if widget.filters.get('status'):
                tasks = tasks.filter(status=widget.filters['status'])
            if widget.filters.get('priority'):
                tasks = tasks.filter(priority=widget.filters['priority'])
            tasks = tasks[:widget.limit or 100]
            task_data = []
            for task in tasks:
                task_data.append({
                    'id': str(task.id),
                    'title': task.title,
                    'status': task.status,
                    'priority': task.priority,
                    'assigned_to': task.assigned_to.get_full_name() if task.assigned_to else None,
                    'due_date': task.due_date.isoformat() if task.due_date else None,
                    'progress': task.progress
                })
            return {
                'items': task_data,
                'total': len(task_data),
                'by_status': self._group_by(task_data, 'status'),
                'by_priority': self._group_by(task_data, 'priority')
            }
        except Exception as e:
            raise WidgetDataError(f"Failed to fetch task data: {str(e)}")

    def _fetch_pip_data(self, widget: ReportWidget) -> Dict:
        from apps.reviews.models import PerformanceImprovementPlan
        try:
            pips = PerformanceImprovementPlan.objects.filter(tenant_id=widget.tenant_id)
            if widget.filters.get('status'):
                pips = pips.filter(status=widget.filters['status'])
            pips = pips[:widget.limit or 50]
            pip_data = []
            for pip in pips:
                pip_data.append({
                    'employee': pip.employee.get_full_name() if pip.employee else None,
                    'manager': pip.manager.get_full_name() if pip.manager else None,
                    'status': pip.status,
                    'start_date': pip.start_date.isoformat() if pip.start_date else None,
                    'end_date': pip.end_date.isoformat() if pip.end_date else None,
                    'improvement_areas': pip.improvement_areas
                })
            total = len(pip_data)
            completed = sum(1 for p in pip_data if p['status'] == 'Completed')
            return {
                'items': pip_data,
                'total': total,
                'active': sum(1 for p in pip_data if p['status'] == 'Active'),
                'completed': completed,
                'failed': sum(1 for p in pip_data if p['status'] == 'Failed'),
                'success_rate': (completed / total * 100) if total > 0 else 0
            }
        except Exception as e:
            raise WidgetDataError(f"Failed to fetch PIP data: {str(e)}")

    def _fetch_auto_data(self, widget: ReportWidget) -> Dict:
        if widget.widget_type == WidgetType.KPI:
            return self._fetch_kpi_data(widget)
        elif widget.widget_type in [WidgetType.CHART, WidgetType.PIE, WidgetType.BAR, WidgetType.LINE, WidgetType.AREA, WidgetType.SCATTER]:
            return self._fetch_chart_data(widget)
        elif widget.widget_type == WidgetType.TABLE:
            return self._fetch_table_data(widget)
        elif widget.widget_type == WidgetType.HEATMAP:
            return self._fetch_heatmap_data(widget)
        elif widget.widget_type == WidgetType.TREND:
            return self._fetch_trend_data(widget)
        elif widget.widget_type == WidgetType.GAUGE:
            return self._fetch_gauge_data(widget)
        else:
            return {'items': [], 'total': 0}

    def _fetch_chart_data(self, widget: ReportWidget) -> Dict:
        kpis = KPI.objects.filter(tenant_id=widget.tenant_id)[:50]
        data = []
        for kpi in kpis:
            latest_score = Score.objects.filter(kpi=kpi).order_by('-year', '-month').prefetch_related('traffic_lights').first()
            latest = KPIEntryWrapper(latest_score) if latest_score else None
            if latest:
                data.append({
                    'name': kpi.name,
                    'value': latest.actual or 0,
                    'progress': latest.progress or 0
                })
        labels = [d['name'][:20] for d in data[:10]]
        values = [d['progress'] for d in data[:10]]
        return {
            'chart_type': widget.widget_type,
            'labels': labels,
            'datasets': [{'label': 'Progress', 'data': values}],
            'colors': ['#2563eb', '#10b981', '#f59e0b', '#ef4444']
        }

    def _fetch_table_data(self, widget: ReportWidget) -> Dict:
        kpis = KPI.objects.filter(tenant_id=widget.tenant_id)[:widget.limit or 20]
        rows = []
        for kpi in kpis:
            latest_score = Score.objects.filter(kpi=kpi).order_by('-year', '-month').prefetch_related('traffic_lights').first()
            latest = KPIEntryWrapper(latest_score) if latest_score else None
            rows.append([
                kpi.name,
                kpi.target or 0,
                latest.actual if latest else 0,
                latest.progress if latest else 0,
                latest.status if latest else 'Pending'
            ])
        return {
            'columns': ['KPI', 'Target', 'Actual', 'Progress', 'Status'],
            'rows': rows,
            'total_rows': len(rows)
        }

    def _fetch_heatmap_data(self, widget: ReportWidget) -> Dict:
        departments = Department.objects.filter(tenant_id=widget.tenant_id)
        dept_names = [d.name for d in departments]
        values = []
        for dept in departments:
            kpis = KPI.objects.filter(department=dept)
            if kpis.exists():
                avg_progress = sum(k.progress for k in kpis) / kpis.count()
                values.append(avg_progress)
            else:
                values.append(0)
        return {
            'labels': dept_names,
            'values': values,
            'min': 0,
            'max': 100,
            'x_labels': ['Department'],
            'y_labels': dept_names
        }

    def _fetch_trend_data(self, widget: ReportWidget) -> Dict:
        scores = Score.objects.filter(kpi__tenant_id=widget.tenant_id).order_by('-year', '-month').prefetch_related('traffic_lights')[:100]
        entries = [KPIEntryWrapper(s) for s in scores]
        period_data = {}
        for entry in entries:
            period = entry.period.strftime('%Y-%m') if entry.period else 'unknown'
            if period not in period_data:
                period_data[period] = []
            period_data[period].append(entry.progress or 0)
        periods = sorted(period_data.keys())
        avg_values = [sum(period_data[p]) / len(period_data[p]) for p in periods]
        return {
            'periods': periods,
            'values': avg_values,
            'trend_line': self._calculate_trend_line(avg_values),
            'direction': 'upward' if avg_values[-1] > avg_values[0] else 'downward' if avg_values[-1] < avg_values[0] else 'stable',
            'growth_rate': ((avg_values[-1] - avg_values[0]) / avg_values[0] * 100) if avg_values and avg_values[0] != 0 else 0
        }

    def _fetch_gauge_data(self, widget: ReportWidget) -> Dict:
        kpis = KPI.objects.filter(tenant_id=widget.tenant_id)
        if kpis.exists():
            avg_progress = sum(k.progress for k in kpis) / kpis.count()
            return {
                'value': avg_progress,
                'min': 0,
                'max': 100,
                'target': 80,
                'threshold_low': 50,
                'threshold_medium': 80
            }
        return {'value': 0, 'min': 0, 'max': 100, 'target': 80}

    def _format_kpi_response(self, data: List[Dict], widget_type: str) -> Dict:
        if widget_type == WidgetType.KPI:
            if data:
                return {
                    'value': data[0].get('value', 0),
                    'target': data[0].get('target', 0),
                    'progress': data[0].get('progress', 0),
                    'status': data[0].get('status', 'Pending'),
                    'unit': data[0].get('unit', '')
                }
            return {'value': 0, 'target': 0, 'progress': 0, 'status': 'No Data'}
        elif widget_type in [WidgetType.TREND, WidgetType.LINE, WidgetType.AREA]:
            if data:
                return {
                    'labels': data[0].get('periods', []),
                    'datasets': [{'label': d['name'], 'data': d['progress']} for d in data[:5]]
                }
            return {'labels': [], 'datasets': []}
        else:
            return {'items': data, 'total': len(data)}

    def _group_by(self, items: List[Dict], key: str) -> Dict:
        grouped = {}
        for item in items:
            val = item.get(key, 'Unknown')
            grouped[val] = grouped.get(val, 0) + 1
        return grouped

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