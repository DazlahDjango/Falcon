# apps/reportplt/services/security/report_rbac.py
from django.db import models
from django.core.exceptions import PermissionDenied
from typing import List, Optional, Union
from apps.accounts.models import User
from apps.reportplt.constants import ReportType, SharePermission
from apps.reportplt.exceptions import ReportPermissionError

class ReportRBAC:
    def __init__(self, user: User):
        self.user = user
        self.tenant_id = user.tenant_id

    def can_view_report(self, report) -> bool:
        if self._is_super_admin():
            return True
        if not self._same_tenant(report):
            return False
        if report.is_public:
            return True
        if report.owner_id == self.user.id:
            return True
        if self.user.role in report.allowed_roles:
            return True
        if self.user.department and self.user.department in report.allowed_departments:
            return True
        if self._has_shared_access(report):
            return True
        return False

    def can_generate_report(self, report=None) -> bool:
        if self._is_super_admin():
            return True
        if report and hasattr(report, 'tenant_id') and not self._same_tenant(report):
            return False
        if report:
            return self.can_view_report(report)
        return True

    def can_create_report(self, report_type: str = None) -> bool:
        if self._is_super_admin():
            return True
        if self.user.role in ['client_admin', 'dashboard_champion', 'executive', 'supervisor']:
            return True
        if self.user.role == 'staff' and report_type == 'personal':
            return True
        return False

    def can_edit_report(self, report) -> bool:
        if self._is_super_admin():
            return True
        if not self._same_tenant(report):
            return False
        if report.owner_id == self.user.id:
            return True
        if self.user.role == 'client_admin':
            return True
        if self._has_edit_share(report):
            return True
        return False

    def can_delete_report(self, report) -> bool:
        if self._is_super_admin():
            return True
        if not self._same_tenant(report):
            return False
        if report.owner_id == self.user.id:
            return True
        if self.user.role == 'client_admin':
            return True
        return False

    def can_export_report(self, report, format: str = None) -> bool:
        if self._is_super_admin():
            return True
        if not self._same_tenant(report):
            return False
        if report.owner_id == self.user.id:
            return True
        if self.user.role == 'client_admin':
            return True
        if self.user.role == 'executive':
            return True
        if self._has_export_share(report):
            return True
        return False

    def can_schedule_report(self, report) -> bool:
        if self._is_super_admin():
            return True
        if not self._same_tenant(report):
            return False
        if report.owner_id == self.user.id:
            return True
        if self.user.role in ['client_admin', 'dashboard_champion']:
            return True
        return False

    def can_view_dashboard(self, dashboard) -> bool:
        if self._is_super_admin():
            return True
        if not self._same_tenant(dashboard):
            return False
        if dashboard.owner_id == self.user.id:
            return True
        if dashboard.is_shared:
            if self.user.role in dashboard.allowed_roles:
                return True
            if str(self.user.id) in dashboard.allowed_users:
                return True
            if self.user.department and self.user.department in dashboard.allowed_departments:
                return True
        return False

    def can_edit_dashboard(self, dashboard) -> bool:
        if self._is_super_admin():
            return True
        if not self._same_tenant(dashboard):
            return False
        if dashboard.owner_id == self.user.id:
            return True
        if self.user.role == 'client_admin':
            return True
        return False

    def can_delete_dashboard(self, dashboard) -> bool:
        if self._is_super_admin():
            return True
        if not self._same_tenant(dashboard):
            return False
        if dashboard.owner_id == self.user.id:
            return True
        if self.user.role == 'client_admin':
            return True
        return False

    def can_view_template(self, template) -> bool:
        if self._is_super_admin():
            return True
        if not self._same_tenant(template):
            return False
        if template.is_published:
            return True
        if template.owner_id == self.user.id:
            return True
        if self.user.role == 'client_admin':
            return True
        return False

    def can_create_template(self) -> bool:
        if self._is_super_admin():
            return True
        if self.user.role in ['client_admin', 'dashboard_champion', 'executive']:
            return True
        return False

    def can_edit_template(self, template) -> bool:
        if self._is_super_admin():
            return True
        if not self._same_tenant(template):
            return False
        if template.owner_id == self.user.id:
            return True
        if self.user.role == 'client_admin':
            return True
        return False

    def can_delete_template(self, template) -> bool:
        if self._is_super_admin():
            return True
        if not self._same_tenant(template):
            return False
        if template.is_system:
            return False
        if template.owner_id == self.user.id:
            return True
        if self.user.role == 'client_admin':
            return True
        return False

    def can_view_export(self, export) -> bool:
        if self._is_super_admin():
            return True
        if not self._same_tenant(export):
            return False
        if export.exported_by_id == self.user.id:
            return True
        if self.user.role == 'client_admin':
            return True
        if self.can_view_report(export.report):
            return True
        return False

    def can_download_export(self, export) -> bool:
        if not self.can_view_export(export):
            return False
        if export.is_expired():
            raise ReportPermissionError("Export has expired")
        if not export.is_ready():
            raise ReportPermissionError("Export is not ready for download")
        return True

    def can_view_audit(self, report=None) -> bool:
        if self._is_super_admin():
            return True
        if self.user.role in ['client_admin', 'executive']:
            return True
        if report and report.owner_id == self.user.id:
            return True
        return False

    def can_share_report(self, report) -> bool:
        if self._is_super_admin():
            return True
        if not self._same_tenant(report):
            return False
        if report.owner_id == self.user.id:
            return True
        if self.user.role == 'client_admin':
            return True
        return False

    def can_manage_share(self, share) -> bool:
        if self._is_super_admin():
            return True
        if not self._same_tenant(share):
            return False
        if share.shared_by_id == self.user.id:
            return True
        if self.user.role == 'client_admin':
            return True
        return False

    def _is_super_admin(self) -> bool:
        return self.user.is_superuser or self.user.role == 'super_admin'

    def _same_tenant(self, obj) -> bool:
        if hasattr(obj, 'tenant_id'):
            return str(obj.tenant_id) == str(self.tenant_id)
        return True

    def _has_shared_access(self, report) -> bool:
        from apps.reportplt.models import ReportShare
        return ReportShare.objects.filter(
            report=report,
            shared_with=self.user,
            is_active=True,
            permission__in=['view', 'comment', 'edit', 'export']
        ).exists()

    def _has_edit_share(self, report) -> bool:
        from apps.reportplt.models import ReportShare
        return ReportShare.objects.filter(
            report=report,
            shared_with=self.user,
            is_active=True,
            permission__in=['edit', 'export']
        ).exists()

    def _has_export_share(self, report) -> bool:
        from apps.reportplt.models import ReportShare
        return ReportShare.objects.filter(
            report=report,
            shared_with=self.user,
            is_active=True,
            permission='export'
        ).exists()

    def enforce_view(self, report):
        if not self.can_view_report(report):
            raise ReportPermissionError("You do not have permission to view this report")
        return True

    def enforce_edit(self, report):
        if not self.can_edit_report(report):
            raise ReportPermissionError("You do not have permission to edit this report")
        return True

    def enforce_delete(self, report):
        if not self.can_delete_report(report):
            raise ReportPermissionError("You do not have permission to delete this report")
        return True

    def enforce_export(self, report, format=None):
        if not self.can_export_report(report, format):
            raise ReportPermissionError("You do not have permission to export this report")
        return True

    def enforce_dashboard_view(self, dashboard):
        if not self.can_view_dashboard(dashboard):
            raise ReportPermissionError("You do not have permission to view this dashboard")
        return True