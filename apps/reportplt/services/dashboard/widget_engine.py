# apps/reportplt/services/dashboard/widget_engine.py
import json
from typing import Dict, Any, List, Optional
from copy import deepcopy
from datetime import datetime
from django.utils import timezone
from apps.reportplt.models import ReportWidget
from apps.reportplt.constants import WidgetType
from apps.reportplt.exceptions import WidgetError
from apps.reportplt.services.dashboard.widget_data_fetcher import WidgetDataFetcher

class WidgetEngine:
    def __init__(self):
        self.data_fetcher = WidgetDataFetcher()
        self._renderers = {
            WidgetType.KPI: self._render_kpi,
            WidgetType.CHART: self._render_chart,
            WidgetType.TABLE: self._render_table,
            WidgetType.HEATMAP: self._render_heatmap,
            WidgetType.TREND: self._render_trend,
            WidgetType.GAUGE: self._render_gauge,
            WidgetType.PIE: self._render_pie,
            WidgetType.BAR: self._render_bar,
            WidgetType.LINE: self._render_line,
            WidgetType.AREA: self._render_area,
            WidgetType.SCATTER: self._render_scatter,
            WidgetType.MAP: self._render_map,
            WidgetType.LIST: self._render_list,
            WidgetType.SUMMARY: self._render_summary,
            WidgetType.MISSION: self._render_mission,
            WidgetType.PIP: self._render_pip,
            WidgetType.COMPLIANCE: self._render_compliance,
            WidgetType.CUSTOM: self._render_custom
        }

    def render_widget(self, widget: ReportWidget) -> Dict[str, Any]:
        try:
            if not widget.is_active:
                return {'status': 'inactive', 'widget_id': str(widget.id)}
            data = self.data_fetcher.fetch_widget_data(widget)
            renderer = self._renderers.get(widget.widget_type, self._render_custom)
            rendered = renderer(widget, data)
            return {
                'status': 'success',
                'widget_id': str(widget.id),
                'widget_type': widget.widget_type,
                'title': widget.title or widget.name,
                'subtitle': widget.subtitle,
                'data': rendered,
                'config': widget.style_config,
                'position': widget.position,
                'size': widget.size,
                'rendered_at': timezone.now().isoformat()
            }
        except Exception as e:
            return {
                'status': 'error',
                'widget_id': str(widget.id),
                'error': str(e),
                'widget_type': widget.widget_type
            }

    def render_widgets(self, widgets: List[ReportWidget]) -> List[Dict]:
        return [self.render_widget(w) for w in widgets]

    def _render_kpi(self, widget: ReportWidget, data: Dict) -> Dict:
        value = data.get('value', 0)
        target = data.get('target', 0)
        progress = (value / target * 100) if target != 0 else 0
        status = self._determine_status(progress)
        return {
            'type': 'kpi',
            'value': value,
            'target': target,
            'progress': round(progress, 2),
            'status': status,
            'status_color': self._get_status_color(status),
            'unit': data.get('unit', ''),
            'trend': data.get('trend', 0),
            'trend_direction': 'up' if data.get('trend', 0) > 0 else 'down' if data.get('trend', 0) < 0 else 'stable',
            'comparison': data.get('comparison', {})
        }

    def _render_chart(self, widget: ReportWidget, data: Dict) -> Dict:
        chart_type = data.get('chart_type', 'bar')
        chart_data = data.get('chart_data', {})
        return {
            'type': 'chart',
            'chart_type': chart_type,
            'chart_data': chart_data,
            'labels': data.get('labels', []),
            'datasets': data.get('datasets', []),
            'options': data.get('options', {}),
            'colors': data.get('colors', ['#2563eb']),
            'height': data.get('height', 400),
            'width': data.get('width', '100%')
        }

    def _render_table(self, widget: ReportWidget, data: Dict) -> Dict:
        return {
            'type': 'table',
            'columns': data.get('columns', []),
            'rows': data.get('rows', []),
            'total_rows': data.get('total_rows', 0),
            'page': data.get('page', 1),
            'page_size': data.get('page_size', 10),
            'sortable': data.get('sortable', True),
            'searchable': data.get('searchable', True),
            'pagination': data.get('pagination', True)
        }

    def _render_heatmap(self, widget: ReportWidget, data: Dict) -> Dict:
        return {
            'type': 'heatmap',
            'labels': data.get('labels', []),
            'values': data.get('values', []),
            'min': data.get('min', 0),
            'max': data.get('max', 100),
            'color_scale': data.get('color_scale', ['#10b981', '#f59e0b', '#ef4444']),
            'x_labels': data.get('x_labels', []),
            'y_labels': data.get('y_labels', [])
        }

    def _render_trend(self, widget: ReportWidget, data: Dict) -> Dict:
        return {
            'type': 'trend',
            'periods': data.get('periods', []),
            'values': data.get('values', []),
            'trend_line': data.get('trend_line', []),
            'mom_growth': data.get('mom_growth', []),
            'yoy_growth': data.get('yoy_growth', []),
            'direction': data.get('direction', 'stable'),
            'growth_rate': data.get('growth_rate', 0),
            'volatility': data.get('volatility', 0)
        }

    def _render_gauge(self, widget: ReportWidget, data: Dict) -> Dict:
        value = data.get('value', 0)
        min_val = data.get('min', 0)
        max_val = data.get('max', 100)
        target = data.get('target', 80)
        threshold_low = data.get('threshold_low', 50)
        threshold_medium = data.get('threshold_medium', 80)
        return {
            'type': 'gauge',
            'value': value,
            'min': min_val,
            'max': max_val,
            'target': target,
            'threshold_low': threshold_low,
            'threshold_medium': threshold_medium,
            'status': self._determine_gauge_status(value, threshold_low, threshold_medium),
            'percentage': ((value - min_val) / (max_val - min_val) * 100) if max_val > min_val else 0
        }

    def _render_pie(self, widget: ReportWidget, data: Dict) -> Dict:
        return {
            'type': 'pie',
            'labels': data.get('labels', []),
            'values': data.get('values', []),
            'colors': data.get('colors', ['#2563eb', '#10b981', '#f59e0b', '#ef4444']),
            'show_percentage': data.get('show_percentage', True),
            'show_legend': data.get('show_legend', True),
            'donut': data.get('donut', False)
        }

    def _render_bar(self, widget: ReportWidget, data: Dict) -> Dict:
        return {
            'type': 'bar',
            'labels': data.get('labels', []),
            'datasets': data.get('datasets', []),
            'horizontal': data.get('horizontal', False),
            'stacked': data.get('stacked', False),
            'show_values': data.get('show_values', True),
            'colors': data.get('colors', ['#2563eb'])
        }

    def _render_line(self, widget: ReportWidget, data: Dict) -> Dict:
        return {
            'type': 'line',
            'labels': data.get('labels', []),
            'datasets': data.get('datasets', []),
            'smooth': data.get('smooth', True),
            'fill_area': data.get('fill_area', False),
            'show_points': data.get('show_points', True),
            'colors': data.get('colors', ['#2563eb'])
        }

    def _render_area(self, widget: ReportWidget, data: Dict) -> Dict:
        result = self._render_line(widget, data)
        result['fill_area'] = True
        result['type'] = 'area'
        return result

    def _render_scatter(self, widget: ReportWidget, data: Dict) -> Dict:
        return {
            'type': 'scatter',
            'datasets': data.get('datasets', []),
            'labels': data.get('labels', []),
            'colors': data.get('colors', ['#2563eb']),
            'show_trend_line': data.get('show_trend_line', True)
        }

    def _render_map(self, widget: ReportWidget, data: Dict) -> Dict:
        return {
            'type': 'map',
            'regions': data.get('regions', []),
            'values': data.get('values', []),
            'color_scale': data.get('color_scale', ['#10b981', '#f59e0b', '#ef4444']),
            'show_labels': data.get('show_labels', True),
            'interactive': data.get('interactive', True)
        }

    def _render_list(self, widget: ReportWidget, data: Dict) -> Dict:
        return {
            'type': 'list',
            'items': data.get('items', []),
            'max_items': data.get('max_items', 10),
            'show_more': data.get('show_more', True),
            'sort_by': data.get('sort_by', ''),
            'sort_order': data.get('sort_order', 'desc')
        }

    def _render_summary(self, widget: ReportWidget, data: Dict) -> Dict:
        return {
            'type': 'summary',
            'title': widget.title,
            'content': data.get('content', ''),
            'metrics': data.get('metrics', {}),
            'statistics': data.get('statistics', {}),
            'highlights': data.get('highlights', [])
        }

    def _render_mission(self, widget: ReportWidget, data: Dict) -> Dict:
        return {
            'type': 'mission',
            'kpis': data.get('kpis', []),
            'overall_status': data.get('overall_status', 'Pending'),
            'performance_analysis': data.get('performance_analysis', ''),
            'challenges': data.get('challenges', []),
            'action_plans': data.get('action_plans', []),
            'next_steps': data.get('next_steps', [])
        }

    def _render_pip(self, widget: ReportWidget, data: Dict) -> Dict:
        return {
            'type': 'pip',
            'active_pips': data.get('active_pips', []),
            'completed_pips': data.get('completed_pips', []),
            'success_rate': data.get('success_rate', 0),
            'at_risk': data.get('at_risk', []),
            'summary': data.get('summary', {})
        }

    def _render_compliance(self, widget: ReportWidget, data: Dict) -> Dict:
        return {
            'type': 'compliance',
            'overall_rate': data.get('overall_rate', 0),
            'compliant': data.get('compliant', 0),
            'non_compliant': data.get('non_compliant', 0),
            'at_risk': data.get('at_risk', 0),
            'by_category': data.get('by_category', {}),
            'details': data.get('details', [])
        }

    def _render_custom(self, widget: ReportWidget, data: Dict) -> Dict:
        return {
            'type': 'custom',
            'widget_id': str(widget.id),
            'config': widget.config,
            'data': data,
            'rendered_at': timezone.now().isoformat()
        }

    def _determine_status(self, progress: float) -> str:
        if progress >= 90:
            return 'On Track'
        elif progress >= 50:
            return 'At Risk'
        else:
            return 'Off Track'

    def _get_status_color(self, status: str) -> str:
        colors = {
            'On Track': '#10b981',
            'At Risk': '#f59e0b',
            'Off Track': '#ef4444',
            'Pending': '#94a3b8'
        }
        return colors.get(status, '#94a3b8')

    def _determine_gauge_status(self, value: float, threshold_low: float, threshold_medium: float) -> str:
        if value >= threshold_medium:
            return 'good'
        elif value >= threshold_low:
            return 'warning'
        else:
            return 'critical'