from .config import DashboardConfigSerializer, WidgetConfigSerializer
from .flc import DepartmentPerformanceSerializer, KPITrendSerializer, ExportScheduleListSerializer, DashboardAlertListSerializer, BulkWidgetUpdateSerializer, DashboardCloneSerializer
from .viewer import ExecutiveViewPresetSerializer, TeamMemberSerializer, TeamAggregateSerializer, OrgTreeNodeSerializer, ReportingChainSerializer, PeriodComparisonResultSerializer
from .dashboard import TenantOverviewSnapshotSerializer, ExecutiveDashboardDataSerializer, ClientAdminDashboardDataSerializer, SuperAdminDashboardDataSerializer
from .period import PeriodComparisonSerializer, DashboardAccessLogSerializer
from .favorite import FavoriteKPISerializer, DashboardAlertSerializer, ExportScheduleSerializer

# New imports for Manager, Staff, Champion, Read-Only dashboards
from .manager import ManagerDashboardDataSerializer
from .staff import StaffDashboardDataSerializer
from .champion import ChampionDashboardDataSerializer
from .read_only import ReadOnlyDashboardDataSerializer

# Request serializers for POST/PUT operations
from .requests import (
    DashboardFilterSerializer, SubmitKPISerializer, ApprovalActionSerializer,
    UpdateConfigSerializer, KPIAssignmentSerializer, WeightUpdateSerializer, TargetUpdateSerializer
)

__all__ = [
    # Existing serializers
    'DashboardConfigSerializer', 'WidgetConfigSerializer',
    'DepartmentPerformanceSerializer', 'KPITrendSerializer', 'ExportScheduleListSerializer', 'DashboardAlertListSerializer',
    'BulkWidgetUpdateSerializer', 'DashboardCloneSerializer', 'ExecutiveViewPresetSerializer', 'TeamMemberSerializer', 'TeamAggregateSerializer',
    'OrgTreeNodeSerializer', 'ReportingChainSerializer', 'PeriodComparisonResultSerializer', 'TenantOverviewSnapshotSerializer',
    'ExecutiveDashboardDataSerializer', 'ClientAdminDashboardDataSerializer', 'SuperAdminDashboardDataSerializer',
    'PeriodComparisonSerializer', 'DashboardAccessLogSerializer', 'FavoriteKPISerializer', 'DashboardAlertSerializer', 'ExportScheduleSerializer',
    
    # New dashboard serializers for Manager, Staff, Champion, Read-Only
    'ManagerDashboardDataSerializer',
    'StaffDashboardDataSerializer',
    'ChampionDashboardDataSerializer',
    'ReadOnlyDashboardDataSerializer',
    
    # Request serializers
    'DashboardFilterSerializer',
    'SubmitKPISerializer',
    'ApprovalActionSerializer',
    'UpdateConfigSerializer',
    'KPIAssignmentSerializer',
    'WeightUpdateSerializer',
    'TargetUpdateSerializer',
]