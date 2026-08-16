# apps/reportplt/services/security/row_level_security.py
import logging
from typing import Optional, Dict, Any, List
from django.db import connection, models
from django.db.models import Q
from django.contrib.auth.models import AnonymousUser
from apps.accounts.models import User
from apps.tenant.context import get_current_tenant_id
from apps.reportplt.exceptions import ReportPermissionError

logger = logging.getLogger(__name__)

class RLSEnforcer:
    def __init__(self, user: Optional[User] = None):
        self.user = user
        self.tenant_id = get_current_tenant_id() if not user else user.tenant_id

    def enforce_tenant_isolation(self, queryset):
        if self.tenant_id:
            if hasattr(queryset.model, 'tenant_id'):
                return queryset.filter(tenant_id=self.tenant_id)
        return queryset

    def enforce_user_access(self, queryset, model_name: str = None):
        if not self.user or self.user.is_anonymous:
            return queryset.none()
        if self._is_super_admin():
            return self.enforce_tenant_isolation(queryset)
        if model_name == 'Report':
            return self._filter_reports(queryset)
        if model_name == 'ReportDashboard':
            return self._filter_dashboards(queryset)
        if model_name == 'ReportTemplate':
            return self._filter_templates(queryset)
        if model_name == 'ReportExport':
            return self._filter_exports(queryset)
        if model_name == 'ReportSchedule':
            return self._filter_schedules(queryset)
        if model_name == 'ReportAudit':
            return self._filter_audits(queryset)
        return self.enforce_tenant_isolation(queryset)

    def _filter_reports(self, queryset):
        qs = self.enforce_tenant_isolation(queryset)
        if self.user.role == 'client_admin':
            return qs
        if self.user.role == 'hr_admin':
            return qs
        if self.user.role == 'executive':
            return qs
        if self.user.role == 'supervisor':
            team_ids = self.user.get_team_ids()
            return qs.filter(
                Q(owner_id=self.user.id) |
                Q(owner_id__in=team_ids) |
                Q(is_public=True) |
                Q(allowed_roles__contains=[self.user.role]) |
                Q(allowed_departments__contains=[self.user.department])
            )
        if self.user.role == 'staff':
            return qs.filter(
                Q(owner_id=self.user.id) |
                Q(is_public=True) |
                Q(allowed_roles__contains=[self.user.role]) |
                Q(allowed_departments__contains=[self.user.department])
            )
        return qs.none()

    def _filter_dashboards(self, queryset):
        qs = self.enforce_tenant_isolation(queryset)
        if self.user.role in ['client_admin', 'hr_admin', 'executive']:
            return qs
        if self.user.role == 'supervisor':
            team_ids = self.user.get_team_ids()
            return qs.filter(
                Q(owner_id=self.user.id) |
                Q(owner_id__in=team_ids) |
                Q(is_shared=True, allowed_roles__contains=[self.user.role]) |
                Q(is_shared=True, allowed_departments__contains=[self.user.department])
            )
        if self.user.role == 'staff':
            return qs.filter(
                Q(owner_id=self.user.id) |
                Q(is_shared=True, allowed_roles__contains=[self.user.role]) |
                Q(is_shared=True, allowed_departments__contains=[self.user.department])
            )
        return qs.none()

    def _filter_templates(self, queryset):
        qs = self.enforce_tenant_isolation(queryset)
        if self.user.role in ['client_admin', 'hr_admin', 'executive']:
            return qs
        if self.user.role == 'supervisor':
            return qs.filter(
                Q(is_published=True) |
                Q(owner_id=self.user.id)
            )
        if self.user.role == 'staff':
            return qs.filter(
                Q(is_published=True) |
                Q(owner_id=self.user.id)
            )
        return qs.none()

    def _filter_exports(self, queryset):
        qs = self.enforce_tenant_isolation(queryset)
        if self.user.role in ['client_admin', 'executive']:
            return qs
        if self.user.role == 'supervisor':
            team_ids = self.user.get_team_ids()
            return qs.filter(
                Q(exported_by_id=self.user.id) |
                Q(exported_by_id__in=team_ids)
            )
        if self.user.role == 'staff':
            return qs.filter(exported_by_id=self.user.id)
        return qs.none()

    def _filter_schedules(self, queryset):
        qs = self.enforce_tenant_isolation(queryset)
        if self.user.role in ['client_admin', 'hr_admin', 'executive']:
            return qs
        if self.user.role == 'supervisor':
            team_ids = self.user.get_team_ids()
            return qs.filter(
                Q(owner_id=self.user.id) |
                Q(owner_id__in=team_ids)
            )
        if self.user.role == 'staff':
            return qs.filter(owner_id=self.user.id)
        return qs.none()

    def _filter_audits(self, queryset):
        qs = self.enforce_tenant_isolation(queryset)
        if self.user.role in ['client_admin', 'executive']:
            return qs
        if self.user.role == 'supervisor':
            team_ids = self.user.get_team_ids()
            return qs.filter(
                Q(user_id=self.user.id) |
                Q(user_id__in=team_ids)
            )
        if self.user.role == 'staff':
            return qs.filter(user_id=self.user.id)
        return qs.none()

    def _is_super_admin(self) -> bool:
        return self.user and (self.user.is_superuser or self.user.role == 'super_admin')

    def enforce_object_access(self, obj):
        if not self.user or self.user.is_anonymous:
            raise ReportPermissionError("Authentication required")
        if self._is_super_admin():
            return True
        if not self._same_tenant(obj):
            raise ReportPermissionError("Access denied: tenant isolation violation")
        model_name = obj._meta.model_name
        if model_name == 'report':
            return self._check_report_access(obj)
        if model_name == 'reportdashboard':
            return self._check_dashboard_access(obj)
        if model_name == 'reporttemplate':
            return self._check_template_access(obj)
        if model_name == 'reportexport':
            return self._check_export_access(obj)
        if model_name == 'reportschedule':
            return self._check_schedule_access(obj)
        return True

    def _check_report_access(self, report):
        if report.owner_id == self.user.id:
            return True
        if report.is_public:
            return True
        if self.user.role in report.allowed_roles:
            return True
        if self.user.department and self.user.department in report.allowed_departments:
            return True
        if self.user.role in ['client_admin', 'hr_admin', 'executive']:
            return True
        if self.user.role == 'supervisor' and report.owner_id in self.user.get_team_ids():
            return True
        return False

    def _check_dashboard_access(self, dashboard):
        if dashboard.owner_id == self.user.id:
            return True
        if dashboard.is_shared:
            if self.user.role in dashboard.allowed_roles:
                return True
            if str(self.user.id) in dashboard.allowed_users:
                return True
            if self.user.department and self.user.department in dashboard.allowed_departments:
                return True
        if self.user.role in ['client_admin', 'hr_admin', 'executive']:
            return True
        if self.user.role == 'supervisor' and dashboard.owner_id in self.user.get_team_ids():
            return True
        return False

    def _check_template_access(self, template):
        if template.is_published:
            return True
        if template.owner_id == self.user.id:
            return True
        if self.user.role in ['client_admin', 'hr_admin', 'executive']:
            return True
        return False

    def _check_export_access(self, export):
        if export.exported_by_id == self.user.id:
            return True
        if self.user.role in ['client_admin', 'executive']:
            return True
        if self.user.role == 'supervisor' and export.exported_by_id in self.user.get_team_ids():
            return True
        return False

    def _check_schedule_access(self, schedule):
        if schedule.owner_id == self.user.id:
            return True
        if self.user.role in ['client_admin', 'hr_admin', 'executive']:
            return True
        if self.user.role == 'supervisor' and schedule.owner_id in self.user.get_team_ids():
            return True
        return False

    def _same_tenant(self, obj) -> bool:
        if hasattr(obj, 'tenant_id'):
            return str(obj.tenant_id) == str(self.tenant_id)
        return True

class RowLevelSecurity:
    def __init__(self):
        self.enforcer = RLSEnforcer()

    def enable_rls(self, table_name: str):
        with connection.cursor() as cursor:
            cursor.execute(f"ALTER TABLE {table_name} ENABLE ROW LEVEL SECURITY;")

    def disable_rls(self, table_name: str):
        with connection.cursor() as cursor:
            cursor.execute(f"ALTER TABLE {table_name} DISABLE ROW LEVEL SECURITY;")

    def create_policy(self, table_name: str, policy_name: str, using_expression: str, check_expression: str = None):
        check_sql = f"WITH CHECK ({check_expression})" if check_expression else ""
        sql = f"""
            CREATE POLICY {policy_name} ON {table_name}
            FOR ALL
            USING ({using_expression})
            {check_sql};
        """
        with connection.cursor() as cursor:
            cursor.execute(sql)

    def drop_policy(self, table_name: str, policy_name: str):
        with connection.cursor() as cursor:
            cursor.execute(f"DROP POLICY {policy_name} ON {table_name};")

    def create_tenant_isolation_policy(self, table_name: str):
        self.create_policy(
            table_name=table_name,
            policy_name=f"{table_name}_tenant_policy",
            using_expression=f"tenant_id = current_setting('app.current_tenant_id')::uuid",
            check_expression=f"tenant_id = current_setting('app.current_tenant_id')::uuid"
        )

    def create_user_isolation_policy(self, table_name: str, user_column: str = 'user_id'):
        self.create_policy(
            table_name=table_name,
            policy_name=f"{table_name}_user_policy",
            using_expression=f"{user_column} = current_setting('app.current_user_id')::uuid",
            check_expression=f"{user_column} = current_setting('app.current_user_id')::uuid"
        )

    def set_tenant_context(self, tenant_id: str):
        with connection.cursor() as cursor:
            cursor.execute(f"SET app.current_tenant_id = '{tenant_id}';")

    def set_user_context(self, user_id: str):
        with connection.cursor() as cursor:
            cursor.execute(f"SET app.current_user_id = '{user_id}';")

    def clear_context(self):
        with connection.cursor() as cursor:
            cursor.execute("RESET app.current_tenant_id;")
            cursor.execute("RESET app.current_user_id;")

    def apply_report_rls(self):
        tables = [
            'reportplt_report',
            'reportplt_template',
            'reportplt_schedule',
            'reportplt_execution',
            'reportplt_export',
            'reportplt_dashboard',
            'reportplt_widget',
            'reportplt_filter',
            'reportplt_share',
            'reportplt_audit',
            'reportplt_cache'
        ]
        for table in tables:
            self.enable_rls(table)
            self.create_tenant_isolation_policy(table)