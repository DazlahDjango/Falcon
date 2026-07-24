# apps/reportplt/services/generation/chart_renderer.py
from typing import Dict, Any, List, Optional
from collections import defaultdict
import json

class ChartRenderer:
    def __init__(self, config: Optional[Dict] = None):
        self.config = config or {}
        self.default_colors = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']

    def prepare_charts(self, data: Dict, chart_config: Optional[Dict] = None) -> List[Dict]:
        charts = []
        config = chart_config or self.config
        kpis = data.get('kpis', [])
        if not kpis:
            return charts
        charts.append(self._prepare_status_chart(kpis, config))
        charts.append(self._prepare_progress_chart(kpis, config))
        if data.get('aggregations', {}).get('by_department'):
            charts.append(self._prepare_department_chart(data['aggregations']['by_department'], config))
        if data.get('aggregations', {}).get('by_category'):
            charts.append(self._prepare_category_chart(data['aggregations']['by_category'], config))
        if data.get('trend'):
            charts.append(self._prepare_trend_chart(data['trend'], config))
        return charts

    def _prepare_status_chart(self, kpis: List[Dict], config: Dict) -> Dict:
        status_counts = {'On Track': 0, 'At Risk': 0, 'Off Track': 0, 'Pending': 0}
        for kpi in kpis:
            status = kpi.get('status', 'Pending')
            status_counts[status] = status_counts.get(status, 0) + 1
        colors = {'On Track': '#10b981', 'At Risk': '#f59e0b', 'Off Track': '#ef4444', 'Pending': '#94a3b8'}
        return {
            'type': 'pie',
            'title': 'KPI Status Distribution',
            'data': {
                'labels': list(status_counts.keys()),
                'values': list(status_counts.values()),
                'colors': [colors.get(k, '#94a3b8') for k in status_counts.keys()]
            },
            'config': {
                'show_legend': True,
                'show_percentage': True,
                'responsive': True
            }
        }

    def _prepare_progress_chart(self, kpis: List[Dict], config: Dict) -> Dict:
        top_kpis = sorted(kpis, key=lambda x: x.get('progress', 0), reverse=True)[:10]
        return {
            'type': 'bar',
            'title': 'Top 10 KPIs by Progress',
            'data': {
                'labels': [k.get('name', '')[:20] for k in top_kpis],
                'values': [k.get('progress', 0) for k in top_kpis],
                'colors': self._get_color_range(len(top_kpis))
            },
            'config': {
                'show_values': True,
                'horizontal': False,
                'show_legend': False
            }
        }

    def _prepare_department_chart(self, dept_data: Dict, config: Dict) -> Dict:
        sorted_depts = sorted(dept_data.items(), key=lambda x: x[1].get('avg_progress', 0), reverse=True)
        return {
            'type': 'bar',
            'title': 'Department Performance',
            'data': {
                'labels': [d[0] for d in sorted_depts],
                'values': [d[1].get('avg_progress', 0) for d in sorted_depts],
                'colors': self._get_color_range(len(sorted_depts))
            },
            'config': {
                'show_values': True,
                'horizontal': True,
                'show_legend': False
            }
        }

    def _prepare_category_chart(self, category_data: Dict, config: Dict) -> Dict:
        sorted_cats = sorted(category_data.items(), key=lambda x: x[1].get('count', 0), reverse=True)
        return {
            'type': 'bar',
            'title': 'KPI Distribution by Category',
            'data': {
                'labels': [c[0] for c in sorted_cats],
                'values': [c[1].get('count', 0) for c in sorted_cats],
                'colors': self._get_color_range(len(sorted_cats))
            },
            'config': {
                'show_values': True,
                'horizontal': False,
                'show_legend': False
            }
        }

    def _prepare_trend_chart(self, trend_data: List[Dict], config: Dict) -> Dict:
        sorted_trend = sorted(trend_data, key=lambda x: x.get('period', ''))
        return {
            'type': 'line',
            'title': 'Performance Trend Over Time',
            'data': {
                'labels': [t.get('period', '') for t in sorted_trend],
                'values': [t.get('avg_progress', 0) for t in sorted_trend],
                'colors': ['#2563eb']
            },
            'config': {
                'show_values': False,
                'show_area': True,
                'show_legend': False,
                'smooth': True
            }
        }

    def _get_color_range(self, count: int) -> List[str]:
        if count <= len(self.default_colors):
            return self.default_colors[:count]
        colors = []
        for i in range(count):
            colors.append(self.default_colors[i % len(self.default_colors)])
        return colors

    def render_chartjs_config(self, chart_data: Dict) -> Dict:
        chart_type = chart_data.get('type', 'bar')
        data = chart_data.get('data', {})
        config = chart_data.get('config', {})
        labels = data.get('labels', [])
        values = data.get('values', [])
        colors = data.get('colors', self.default_colors)
        if chart_type == 'pie':
            return {
                'type': 'pie',
                'data': {
                    'labels': labels,
                    'datasets': [{
                        'data': values,
                        'backgroundColor': colors,
                        'borderWidth': 1
                    }]
                },
                'options': {
                    'responsive': config.get('responsive', True),
                    'plugins': {
                        'legend': {'display': config.get('show_legend', True)},
                        'tooltip': {'callbacks': {'label': 'function(context) { return context.label + ": " + context.parsed + "%"; }'}}
                    }
                }
            }
        elif chart_type == 'bar':
            return {
                'type': 'bar',
                'data': {
                    'labels': labels,
                    'datasets': [{
                        'label': 'Progress (%)',
                        'data': values,
                        'backgroundColor': colors,
                        'borderRadius': 4
                    }]
                },
                'options': {
                    'responsive': config.get('responsive', True),
                    'indexAxis': 'y' if config.get('horizontal', False) else 'x',
                    'plugins': {
                        'legend': {'display': config.get('show_legend', False)}
                    },
                    'scales': {
                        'y': {'beginAtZero': True, 'max': 100}
                    }
                }
            }
        elif chart_type == 'line':
            return {
                'type': 'line',
                'data': {
                    'labels': labels,
                    'datasets': [{
                        'label': 'Trend',
                        'data': values,
                        'borderColor': colors[0] if colors else '#2563eb',
                        'backgroundColor': colors[0] if colors else '#2563eb',
                        'fill': config.get('show_area', False),
                        'tension': 0.4 if config.get('smooth', True) else 0
                    }]
                },
                'options': {
                    'responsive': config.get('responsive', True),
                    'plugins': {
                        'legend': {'display': config.get('show_legend', False)}
                    },
                    'scales': {
                        'y': {'beginAtZero': True, 'max': 100}
                    }
                }
            }
        return {'type': chart_type, 'data': {'labels': labels, 'datasets': [{'data': values}]}}

    def render_highcharts_config(self, chart_data: Dict) -> Dict:
        chart_type = chart_data.get('type', 'bar')
        data = chart_data.get('data', {})
        config = chart_data.get('config', {})
        labels = data.get('labels', [])
        values = data.get('values', [])
        colors = data.get('colors', self.default_colors)
        chart_map = {
            'pie': 'pie',
            'bar': 'bar',
            'line': 'line',
            'area': 'area'
        }
        return {
            'chart': {'type': chart_map.get(chart_type, 'column')},
            'title': {'text': chart_data.get('title', '')},
            'xAxis': {'categories': labels},
            'yAxis': {'title': {'text': 'Value'}, 'min': 0},
            'series': [{
                'name': chart_data.get('title', 'Data'),
                'data': values,
                'color': colors[0] if colors else '#2563eb'
            }],
            'plotOptions': {
                'series': {
                    'dataLabels': {'enabled': config.get('show_values', False)}
                }
            },
            'credits': {'enabled': False}
        }

    def prepare_dashboard_widget_data(self, widget_type: str, data: Dict) -> Dict:
        if widget_type == 'kpi':
            return self._prepare_kpi_widget(data)
        elif widget_type == 'chart':
            return self._prepare_chart_widget(data)
        elif widget_type == 'table':
            return self._prepare_table_widget(data)
        elif widget_type == 'heatmap':
            return self._prepare_heatmap_widget(data)
        elif widget_type == 'gauge':
            return self._prepare_gauge_widget(data)
        else:
            return {'data': data}

    def _prepare_kpi_widget(self, data: Dict) -> Dict:
        summary = data.get('summary', {})
        return {
            'type': 'kpi',
            'data': {
                'total': summary.get('total', 0),
                'on_track': summary.get('on_track', 0),
                'at_risk': summary.get('at_risk', 0),
                'off_track': summary.get('off_track', 0),
                'completion_rate': summary.get('completion_rate', 0)
            }
        }

    def _prepare_chart_widget(self, data: Dict) -> Dict:
        kpis = data.get('kpis', [])
        if not kpis:
            return {'type': 'chart', 'data': {}}
        return self._prepare_status_chart(kpis, {})

    def _prepare_table_widget(self, data: Dict) -> Dict:
        kpis = data.get('kpis', [])
        return {
            'type': 'table',
            'data': {
                'columns': ['Name', 'Progress', 'Status', 'Department'],
                'rows': [
                    [k.get('name', ''), k.get('progress', 0), k.get('status', ''), k.get('department', '')]
                    for k in kpis[:20]
                ]
            }
        }

    def _prepare_heatmap_widget(self, data: Dict) -> Dict:
        dept_data = data.get('aggregations', {}).get('by_department', {})
        dept_names = list(dept_data.keys())
        values = [d.get('avg_progress', 0) for d in dept_data.values()]
        return {
            'type': 'heatmap',
            'data': {
                'labels': dept_names,
                'values': values,
                'min': 0,
                'max': 100
            }
        }

    def _prepare_gauge_widget(self, data: Dict) -> Dict:
        summary = data.get('summary', {})
        completion = summary.get('completion_rate', 0)
        return {
            'type': 'gauge',
            'data': {
                'value': completion,
                'min': 0,
                'max': 100,
                'target': 80,
                'thresholds': {'low': 50, 'medium': 80}
            }
        }