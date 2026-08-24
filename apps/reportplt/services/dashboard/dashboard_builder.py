import uuid
from typing import Dict, Any, List, Optional
from copy import deepcopy
from django.db import transaction
from django.core.exceptions import ValidationError
from apps.reportplt.models import ReportDashboard, ReportWidget
from apps.reportplt.constants import DashboardType, WidgetType, DEFAULT_DASHBOARD_CONFIG
from apps.reportplt.exceptions import DashboardError, WidgetError, ReportPermissionError
from apps.accounts.models import User
from apps.reportplt.services.security.report_rbac import ReportRBAC

class DashboardBuilder:
    def __init__(self, user: Optional[User] = None):
        self.user = user
        self.rbac = ReportRBAC(user) if user else None

    def create_dashboard(self, name: str, dashboard_type: str = DashboardType.PERSONAL, config: Optional[Dict] = None) -> ReportDashboard:
        if self.rbac and self.user:
            if dashboard_type != DashboardType.PERSONAL and self.user.role not in ['client_admin', 'hr_admin', 'executive']:
                raise ReportPermissionError("You do not have permission to create this dashboard type")
        dashboard = ReportDashboard(
            tenant_id=self.user.tenant_id if self.user else None,
            name=name,
            dashboard_type=dashboard_type,
            owner=self.user,
            is_default=False,
            is_shared=False,
            is_published=False,
            layout=config.get('layout', DEFAULT_DASHBOARD_CONFIG) if config else DEFAULT_DASHBOARD_CONFIG,
            config=config or {},
            theme=config.get('theme', {'mode': 'light', 'primary_color': '#2563eb'}) if config else {'mode': 'light', 'primary_color': '#2563eb'},
            widgets_order=[],
            refresh_interval=config.get('refresh_interval', 300) if config else 300,
            allowed_roles=config.get('allowed_roles', []) if config else [],
            allowed_users=config.get('allowed_users', []) if config else [],
            allowed_departments=config.get('allowed_departments', []) if config else [],
            tags=config.get('tags', []) if config else []
        )
        dashboard.full_clean()
        dashboard.save()
        return dashboard

    def get_dashboard(self, dashboard_id: str) -> ReportDashboard:
        try:
            dashboard = ReportDashboard.objects.get(id=dashboard_id)
            if self.rbac:
                self.rbac.enforce_dashboard_view(dashboard)
            return dashboard
        except ReportDashboard.DoesNotExist:
            raise DashboardError(f"Dashboard with ID {dashboard_id} not found")

    def get_dashboards(self, filters: Optional[Dict] = None) -> List[ReportDashboard]:
        qs = ReportDashboard.objects.filter(tenant_id=self.user.tenant_id if self.user else None)
        if self.user and self.user.role not in ['client_admin', 'hr_admin', 'executive']:
            qs = qs.filter(
                models.Q(owner=self.user) |
                models.Q(is_shared=True, allowed_roles__contains=[self.user.role]) |
                models.Q(is_shared=True, allowed_departments__contains=[self.user.department])
            )
        if filters:
            if filters.get('dashboard_type'):
                qs = qs.filter(dashboard_type=filters['dashboard_type'])
            if filters.get('is_default') is not None:
                qs = qs.filter(is_default=filters['is_default'])
            if filters.get('is_shared') is not None:
                qs = qs.filter(is_shared=filters['is_shared'])
            if filters.get('is_published') is not None:
                qs = qs.filter(is_published=filters['is_published'])
            if filters.get('search'):
                qs = qs.filter(name__icontains=filters['search'])
            if filters.get('owner_id'):
                qs = qs.filter(owner_id=filters['owner_id'])
        return qs

    def update_dashboard(self, dashboard_id: str, data: Dict) -> ReportDashboard:
        dashboard = self.get_dashboard(dashboard_id)
        if self.rbac and not self.rbac.can_edit_dashboard(dashboard):
            raise ReportPermissionError("You do not have permission to edit this dashboard")
        for key, value in data.items():
            if hasattr(dashboard, key) and key not in ['id', 'created_at', 'updated_at', 'view_count']:
                setattr(dashboard, key, value)
        dashboard.full_clean()
        dashboard.save()
        return dashboard

    def delete_dashboard(self, dashboard_id: str) -> bool:
        dashboard = self.get_dashboard(dashboard_id)
        if self.rbac and not self.rbac.can_delete_dashboard(dashboard):
            raise ReportPermissionError("You do not have permission to delete this dashboard")
        dashboard.soft_delete()
        return True

    def set_default_dashboard(self, dashboard_id: str) -> ReportDashboard:
        dashboard = self.get_dashboard(dashboard_id)
        if self.rbac and not self.rbac.can_edit_dashboard(dashboard):
            raise ReportPermissionError("You do not have permission to set default dashboard")
        with transaction.atomic():
            ReportDashboard.objects.filter(
                tenant_id=dashboard.tenant_id,
                owner=self.user,
                is_default=True
            ).update(is_default=False)
            dashboard.is_default = True
            dashboard.save(update_fields=['is_default'])
        return dashboard

    def share_dashboard(self, dashboard_id: str, roles: List[str] = None, users: List[str] = None, departments: List[str] = None) -> ReportDashboard:
        dashboard = self.get_dashboard(dashboard_id)
        if self.rbac and dashboard.owner_id != self.user.id and self.user.role != 'client_admin':
            raise ReportPermissionError("You do not have permission to share this dashboard")
        dashboard.is_shared = True
        if roles:
            dashboard.allowed_roles = list(set(dashboard.allowed_roles + roles))
        if users:
            dashboard.allowed_users = list(set(dashboard.allowed_users + users))
        if departments:
            dashboard.allowed_departments = list(set(dashboard.allowed_departments + departments))
        dashboard.save(update_fields=['is_shared', 'allowed_roles', 'allowed_users', 'allowed_departments'])
        return dashboard

    def unshare_dashboard(self, dashboard_id: str) -> ReportDashboard:
        dashboard = self.get_dashboard(dashboard_id)
        if self.rbac and dashboard.owner_id != self.user.id and self.user.role != 'client_admin':
            raise ReportPermissionError("You do not have permission to unshare this dashboard")
        dashboard.is_shared = False
        dashboard.allowed_roles = []
        dashboard.allowed_users = []
        dashboard.allowed_departments = []
        dashboard.save(update_fields=['is_shared', 'allowed_roles', 'allowed_users', 'allowed_departments'])
        return dashboard

    def publish_dashboard(self, dashboard_id: str) -> ReportDashboard:
        dashboard = self.get_dashboard(dashboard_id)
        if self.rbac and dashboard.owner_id != self.user.id and self.user.role != 'client_admin':
            raise ReportPermissionError("You do not have permission to publish this dashboard")
        dashboard.is_published = True
        dashboard.save(update_fields=['is_published'])
        return dashboard

    def unpublish_dashboard(self, dashboard_id: str) -> ReportDashboard:
        dashboard = self.get_dashboard(dashboard_id)
        if self.rbac and dashboard.owner_id != self.user.id and self.user.role != 'client_admin':
            raise ReportPermissionError("You do not have permission to unpublish this dashboard")
        dashboard.is_published = False
        dashboard.save(update_fields=['is_published'])
        return dashboard

    def duplicate_dashboard(self, dashboard_id: str, new_name: Optional[str] = None) -> ReportDashboard:
        dashboard = self.get_dashboard(dashboard_id)
        if self.rbac and not self.rbac.can_view_dashboard(dashboard):
            raise ReportPermissionError("You do not have permission to duplicate this dashboard")
        new_dashboard = ReportDashboard(
            tenant_id=dashboard.tenant_id,
            name=new_name or f"{dashboard.name} (Copy)",
            dashboard_type=dashboard.dashboard_type,
            owner=self.user,
            is_default=False,
            is_shared=False,
            is_published=False,
            layout=deepcopy(dashboard.layout),
            config=deepcopy(dashboard.config),
            theme=deepcopy(dashboard.theme),
            widgets_order=[],
            refresh_interval=dashboard.refresh_interval,
            allowed_roles=[],
            allowed_users=[],
            allowed_departments=[],
            tags=deepcopy(dashboard.tags)
        )
        new_dashboard.full_clean()
        new_dashboard.save()
        for widget in dashboard.widgets.all():
            new_widget = ReportWidget(
                tenant_id=widget.tenant_id,
                dashboard=new_dashboard,
                name=widget.name,
                widget_type=widget.widget_type,
                config=deepcopy(widget.config),
                data_config=deepcopy(widget.data_config),
                style_config=deepcopy(widget.style_config),
                position=deepcopy(widget.position),
                size=deepcopy(widget.size),
                is_active=widget.is_active,
                is_visible=widget.is_visible,
                auto_refresh=widget.auto_refresh,
                refresh_interval=widget.refresh_interval,
                title=widget.title,
                subtitle=widget.subtitle,
                data_source=widget.data_source,
                data_query=deepcopy(widget.data_query),
                filters=deepcopy(widget.filters),
                sort=deepcopy(widget.sort),
                aggregation=deepcopy(widget.aggregation),
                limit=widget.limit
            )
            new_widget.full_clean()
            new_widget.save()
            new_dashboard.add_widget(new_widget)
        return new_dashboard

    def get_default_dashboard(self) -> Optional[ReportDashboard]:
        return ReportDashboard.objects.filter(
            tenant_id=self.user.tenant_id if self.user else None,
            owner=self.user,
            is_default=True
        ).first()

    def get_shared_dashboards(self) -> List[ReportDashboard]:
        return ReportDashboard.objects.filter(
            tenant_id=self.user.tenant_id if self.user else None,
            is_shared=True
        )

    def get_dashboard_with_widgets(self, dashboard_id: str) -> Dict:
        dashboard = self.get_dashboard(dashboard_id)
        widgets = dashboard.widgets.filter(is_active=True).order_by('created_at')
        return {
            'dashboard': dashboard,
            'widgets': widgets,
            'layout': dashboard.layout,
            'theme': dashboard.theme
        }