# apps/dashboard/api/v1/views/__init__.py

from .config import DashboardConfigViewSet, WidgetConfigViewSet
from .dashboard import ExecutiveDashboardViewSet, ClientAdminDashboardViewSet, SuperAdminDashboardViewSet
from .fac import PeriodComparisonViewSet, ExecutiveViewPresetViewSet
from .fevorite import FavoriteKPIViewSet, DashboardAlertViewSet, ExportScheduleViewSet
from .org import HierarchyViewSet

# Add these new imports for Manager, Staff, Champion, Read-Only
from .manager import ManagerDashboardView
from .staff import StaffDashboardView
from .champion import ChampionDashboardView
from .read_only import ReadOnlyDashboardView
from .drill_down import DrillDownView

__all__ = [
    'DashboardConfigViewSet', 'WidgetConfigViewSet', 'ExecutiveDashboardViewSet', 'ClientAdminDashboardViewSet',
    'SuperAdminDashboardViewSet', 'PeriodComparisonViewSet', 'ExecutiveViewPresetViewSet',
    'FavoriteKPIViewSet', 'DashboardAlertViewSet', 'ExportScheduleViewSet', 'HierarchyViewSet',
    # Add these new exports
    'ManagerDashboardView',
    'StaffDashboardView',
    'ChampionDashboardView',
    'ReadOnlyDashboardView',
    'DrillDownView',
]