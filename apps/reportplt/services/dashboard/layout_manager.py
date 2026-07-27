# apps/reportplt/services/dashboard/layout_manager.py
from typing import Dict, Any, List, Optional
from copy import deepcopy
from apps.reportplt.models import ReportDashboard, ReportWidget
from apps.reportplt.constants import DEFAULT_DASHBOARD_CONFIG
from apps.reportplt.exceptions import DashboardError

class LayoutManager:
    def __init__(self):
        self.grid_columns = DEFAULT_DASHBOARD_CONFIG.get('grid_columns', 12)
        self.row_height = DEFAULT_DASHBOARD_CONFIG.get('row_height', 100)
        self.spacing = DEFAULT_DASHBOARD_CONFIG.get('spacing', 10)

    def get_layout(self, dashboard: ReportDashboard) -> Dict[str, Any]:
        return {
            'grid_columns': dashboard.layout.get('grid_columns', self.grid_columns),
            'row_height': dashboard.layout.get('row_height', self.row_height),
            'spacing': dashboard.layout.get('spacing', self.spacing),
            'widgets': self._get_widget_layouts(dashboard)
        }

    def _get_widget_layouts(self, dashboard: ReportDashboard) -> List[Dict]:
        widgets = dashboard.widgets.filter(is_active=True).order_by('created_at')
        layouts = []
        for widget in widgets:
            layouts.append({
                'id': str(widget.id),
                'position': widget.position or {'x': 0, 'y': 0},
                'size': widget.size or {'w': 4, 'h': 3},
                'widget_type': widget.widget_type,
                'title': widget.title or widget.name
            })
        return layouts

    def update_widget_position(self, widget: ReportWidget, x: int, y: int) -> ReportWidget:
        widget.position = {'x': x, 'y': y}
        widget.save(update_fields=['position'])
        return widget

    def update_widget_size(self, widget: ReportWidget, width: int, height: int) -> ReportWidget:
        widget.size = {'w': width, 'h': height}
        widget.save(update_fields=['size'])
        return widget

    def update_widget_position_and_size(self, widget: ReportWidget, x: int, y: int, width: int, height: int) -> ReportWidget:
        widget.position = {'x': x, 'y': y}
        widget.size = {'w': width, 'h': height}
        widget.save(update_fields=['position', 'size'])
        return widget

    def reorder_widgets(self, dashboard: ReportDashboard, widget_order: List[str]) -> ReportDashboard:
        if len(widget_order) != dashboard.widgets.filter(is_active=True).count():
            raise DashboardError("Widget order length does not match active widgets")
        dashboard.widgets_order = widget_order
        dashboard.save(update_fields=['widgets_order'])
        return dashboard

    def auto_layout(self, dashboard: ReportDashboard) -> ReportDashboard:
        widgets = dashboard.widgets.filter(is_active=True)
        x = 0
        y = 0
        max_height = 0
        for widget in widgets:
            size = widget.size or {'w': 4, 'h': 3}
            if x + size.get('w', 4) > self.grid_columns:
                x = 0
                y += max_height + self.spacing
                max_height = 0
            widget.position = {'x': x, 'y': y}
            widget.save(update_fields=['position'])
            x += size.get('w', 4) + self.spacing
            max_height = max(max_height, size.get('h', 3))
        return dashboard

    def compact_layout(self, dashboard: ReportDashboard) -> ReportDashboard:
        widgets = dashboard.widgets.filter(is_active=True).order_by('created_at')
        grid = {}
        x = 0
        y = 0
        for widget in widgets:
            size = widget.size or {'w': 4, 'h': 3}
            width = size.get('w', 4)
            height = size.get('h', 3)
            placed = False
            for try_y in range(y, y + 10):
                for try_x in range(0, self.grid_columns - width + 1):
                    if self._is_space_available(grid, try_x, try_y, width, height):
                        widget.position = {'x': try_x, 'y': try_y}
                        widget.save(update_fields=['position'])
                        self._occupy_space(grid, try_x, try_y, width, height)
                        placed = True
                        break
                if placed:
                    break
            if not placed:
                widget.position = {'x': 0, 'y': y}
                widget.save(update_fields=['position'])
                self._occupy_space(grid, 0, y, width, height)
                y += height + self.spacing
        return dashboard

    def _is_space_available(self, grid: Dict, x: int, y: int, width: int, height: int) -> bool:
        for dx in range(width):
            for dy in range(height):
                key = f"{x + dx}_{y + dy}"
                if grid.get(key, False):
                    return False
        return True

    def _occupy_space(self, grid: Dict, x: int, y: int, width: int, height: int) -> None:
        for dx in range(width):
            for dy in range(height):
                key = f"{x + dx}_{y + dy}"
                grid[key] = True

    def get_layout_sections(self, dashboard: ReportDashboard) -> List[Dict]:
        sections = dashboard.layout.get('sections', [])
        if not sections:
            return [{'name': 'main', 'widgets': self._get_widget_layouts(dashboard)}]
        section_widgets = {}
        for widget in dashboard.widgets.filter(is_active=True):
            section = widget.config.get('section', 'main')
            if section not in section_widgets:
                section_widgets[section] = []
            section_widgets[section].append({
                'id': str(widget.id),
                'position': widget.position,
                'size': widget.size,
                'widget_type': widget.widget_type,
                'title': widget.title or widget.name
            })
        return [
            {
                'name': section,
                'widgets': section_widgets.get(section, [])
            }
            for section in sections
        ]

    def get_grid_config(self, dashboard: ReportDashboard) -> Dict:
        return {
            'grid_columns': dashboard.layout.get('grid_columns', self.grid_columns),
            'row_height': dashboard.layout.get('row_height', self.row_height),
            'spacing': dashboard.layout.get('spacing', self.spacing),
            'max_rows': dashboard.layout.get('max_rows', 10)
        }

    def validate_layout(self, layout: Dict) -> bool:
        required_keys = ['grid_columns', 'row_height', 'spacing']
        for key in required_keys:
            if key not in layout:
                return False
        if not isinstance(layout['grid_columns'], int) or layout['grid_columns'] < 1:
            return False
        if not isinstance(layout['row_height'], int) or layout['row_height'] < 10:
            return False
        return True

    def update_grid_config(self, dashboard: ReportDashboard, grid_columns: int = None, row_height: int = None, spacing: int = None) -> ReportDashboard:
        layout = dashboard.layout or {}
        if grid_columns is not None:
            layout['grid_columns'] = grid_columns
        if row_height is not None:
            layout['row_height'] = row_height
        if spacing is not None:
            layout['spacing'] = spacing
        dashboard.layout = layout
        dashboard.save(update_fields=['layout'])
        return dashboard

    def get_widgets_in_row(self, dashboard: ReportDashboard, row: int) -> List[ReportWidget]:
        widgets = dashboard.widgets.filter(is_active=True)
        row_widgets = []
        for widget in widgets:
            position = widget.position or {'x': 0, 'y': 0}
            if position.get('y', 0) == row:
                row_widgets.append(widget)
        return sorted(row_widgets, key=lambda w: w.position.get('x', 0))

    def calculate_total_height(self, dashboard: ReportDashboard) -> int:
        widgets = dashboard.widgets.filter(is_active=True)
        max_y = 0
        for widget in widgets:
            position = widget.position or {'x': 0, 'y': 0}
            size = widget.size or {'w': 4, 'h': 3}
            max_y = max(max_y, position.get('y', 0) + size.get('h', 3))
        return max_y

    def is_widget_visible(self, widget: ReportWidget) -> bool:
        return widget.is_active and widget.is_visible

    def get_widget_span(self, widget: ReportWidget) -> int:
        size = widget.size or {'w': 4, 'h': 3}
        return size.get('w', 4)

    def get_widget_height(self, widget: ReportWidget) -> int:
        size = widget.size or {'w': 4, 'h': 3}
        return size.get('h', 3)