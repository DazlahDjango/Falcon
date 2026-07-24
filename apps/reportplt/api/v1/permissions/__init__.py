# apps/reportplt/api/v1/permissions/__init__.py
from .base import (
    BasePermission, AllowAny, IsAuthenticated, IsAuthenticatedOrReadOnly,
    IsOwner, IsOwnerOrReadOnly, IsAdminUser, IsAdminOrReadOnly
)
from .report import (
    ReportPermission, ReportViewPermission, ReportCreatePermission,
    ReportEditPermission, ReportDeletePermission, ReportExportPermission,
    ReportSchedulePermission, ReportGeneratePermission
)
from .dashboard import (
    DashboardPermission, DashboardViewPermission, DashboardEditPermission,
    DashboardDeletePermission, DashboardSharePermission, DashboardPublishPermission
)
from .template import (
    TemplatePermission, TemplateViewPermission, TemplateCreatePermission,
    TemplateEditPermission, TemplateDeletePermission, TemplatePublishPermission
)
from .schedule import (
    SchedulePermission, ScheduleViewPermission, ScheduleCreatePermission,
    ScheduleEditPermission, ScheduleDeletePermission, SchedulePausePermission,
    ScheduleResumePermission
)
from .export import (
    ExportPermission, ExportViewPermission, ExportCreatePermission,
    ExportDownloadPermission, ExportDeletePermission
)
from .share import (
    SharePermission, ShareViewPermission, ShareCreatePermission,
    ShareDeletePermission, ShareAccessPermission
)
from .analytics import (
    AnalyticsPermission, AnalyticsViewPermission, AnalyticsCreatePermission,
    TrendAnalysisPermission, ComparativeAnalysisPermission, PredictiveAnalysisPermission
)
from .tenant import (
    TenantIsolationPermission, TenantAccessPermission, TenantAdminPermission,
    TenantResourcePermission
)
from .objects import (
    ObjectPermission, ObjectOwnerPermission, ObjectTenantPermission,
    ObjectRolePermission, ObjectHierarchyPermission, ObjectManagerPermission
)

__all__ = [
    'BasePermission', 'AllowAny', 'IsAuthenticated', 'IsAuthenticatedOrReadOnly',
    'IsOwner', 'IsOwnerOrReadOnly', 'IsAdminUser', 'IsAdminOrReadOnly',
    'ReportPermission', 'ReportViewPermission', 'ReportCreatePermission',
    'ReportEditPermission', 'ReportDeletePermission', 'ReportExportPermission',
    'ReportSchedulePermission', 'ReportGeneratePermission',
    'DashboardPermission', 'DashboardViewPermission', 'DashboardEditPermission',
    'DashboardDeletePermission', 'DashboardSharePermission', 'DashboardPublishPermission',
    'TemplatePermission', 'TemplateViewPermission', 'TemplateCreatePermission',
    'TemplateEditPermission', 'TemplateDeletePermission', 'TemplatePublishPermission',
    'SchedulePermission', 'ScheduleViewPermission', 'ScheduleCreatePermission',
    'ScheduleEditPermission', 'ScheduleDeletePermission', 'SchedulePausePermission',
    'ScheduleResumePermission',
    'ExportPermission', 'ExportViewPermission', 'ExportCreatePermission',
    'ExportDownloadPermission', 'ExportDeletePermission',
    'SharePermission', 'ShareViewPermission', 'ShareCreatePermission',
    'ShareDeletePermission', 'ShareAccessPermission',
    'AnalyticsPermission', 'AnalyticsViewPermission', 'AnalyticsCreatePermission',
    'TrendAnalysisPermission', 'ComparativeAnalysisPermission', 'PredictiveAnalysisPermission',
    'TenantIsolationPermission', 'TenantAccessPermission', 'TenantAdminPermission',
    'TenantResourcePermission',
    'ObjectPermission', 'ObjectOwnerPermission', 'ObjectTenantPermission',
    'ObjectRolePermission', 'ObjectHierarchyPermission', 'ObjectManagerPermission',
]