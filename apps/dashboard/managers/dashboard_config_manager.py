from django.core.exceptions import PermissionDenied
from django.db import models
from django.core.cache import cache
from .base import DashboardBaseManager, DashboardConfigBaseManager

class DashboardConfigManager(DashboardConfigBaseManager):
    def get_default_for_user(self, user_id, tenant_id, dashboard_type):
        cache_key = f"dashboard_config_default_{tenant_id}_{user_id}_{dashboard_type}"
        cached = cache.get(cache_key)
        if cached is not None:
            return cached
        try:
            config = self.get(
                user_id=user_id,
                tenant_id=tenant_id,
                dashboard_type=dashboard_type,
                is_default=True
            )
        except self.model.DoesNotExist:
            config = self.secure_create(
                tenant_id=tenant_id,
                user_id=user_id,
                dashboard_type=dashboard_type,
                is_default=True,
                name=f"Default {dashboard_type.replace('_', ' ').title()} Dashboard",
                layout={
                    'widgets': [],
                    'columns': 12,
                    'cell_height': 100,
                    'margin': 10
                }
            )
        cache.set(cache_key, config, 3600)
        return config
    
    def get_user_dashboards(self, user_id, tenant_id):
        return self.for_tenant(tenant_id).filter(user_id=user_id).order_by('-is_default', 'name')
    
    def set_default_dashboard(self, dashboard_id, user_id, tenant_id):
        from django.db import transaction
        with transaction.atomic():
            dashboard = self.get(id=dashboard_id, user_id=user_id, tenant_id=tenant_id)
            self.filter(
                user_id=user_id,
                tenant_id=tenant_id,
                dashboard_type=dashboard.dashboard_type,
                is_default=True
            ).exclude(id=dashboard_id).update(is_default=False)
            dashboard.is_default = True
            dashboard.save(update_fields=['is_default', 'updated_at'])
            cache_key = f"dashboard_config_default_{tenant_id}_{user_id}_{dashboard.dashboard_type}"
            cache.delete(cache_key)
        return dashboard
    
    def clone_dashboard(self, source_id, user_id, tenant_id, new_name):
        from django.db import transaction
        with transaction.atomic():
            source = self.get(id=source_id, tenant_id=tenant_id)
            new_config = self.secure_create(
                tenant_id=tenant_id,
                user_id=user_id,
                dashboard_type=source.dashboard_type,
                name=new_name,
                layout=source.layout.copy(),
                default_filters=source.default_filters.copy(),
                default_time_period=source.default_time_period,
                default_view=source.default_view,
                is_default=False,
                description=f"Cloned from {source.name}"
            )
            for widget in source.widgets.all():
                WidgetConfigManager().secure_create(
                    tenant_id=tenant_id,
                    dashboard_id=new_config.id,
                    widget_type=widget.widget_type,
                    row=widget.row,
                    col=widget.col,
                    width=widget.width,
                    height=widget.height,
                    config=widget.config.copy(),
                    title=widget.title,
                    show_title=widget.show_title,
                    refresh_interval=widget.refresh_interval,
                    is_visible=widget.is_visible,
                    order=widget.order
                )
            return new_config

class WidgetConfigManager(DashboardBaseManager):
    def get_widgets_for_dashboard(self, dashboard_id, tenant_id):
        cache_key = f"dashboard_widgets_{tenant_id}_{dashboard_id}"
        cached = cache.get(cache_key)
        if cached is not None:
            return cached
        widgets = self.for_tenant(tenant_id).filter(
            dashboard_id=dashboard_id,
            is_visible=True
        ).order_by('order', 'row', 'col')
        cache.set(cache_key, widgets, 1800)
        return widgets
    
    def get_widget_by_position(self, dashboard_id, row, col, tenant_id):
        return self.for_tenant(tenant_id).filter(
            dashboard_id=dashboard_id,
            row=row,
            col=col
        ).first()
    
    def reposition_widgets(self, dashboard_id, tenant_id, widgets_positions):
        from django.db import transaction
        with transaction.atomic():
            updates = []
            positions_used = set()
            for pos in widgets_positions:
                widget_id = pos.get('id')
                new_row = pos.get('row', 0)
                new_col = pos.get('col', 0)
                position_key = f"{new_row}_{new_col}"
                if position_key in positions_used:
                    raise ValueError(f"Position conflict at row {new_row}, col {new_col}")
                positions_used.add(position_key)
                widget = self.get(id=widget_id, dashboard_id=dashboard_id, tenant_id=tenant_id)
                widget.row = new_row
                widget.col = new_col
                updates.append(widget)
            self.bulk_update(updates, ['row', 'col', 'updated_at'])
            cache.delete(f"dashboard_widgets_{tenant_id}_{dashboard_id}")
        return updates
    
    def secure_create(self, tenant_id, dashboard_id, widget_type, **kwargs):
        from apps.dashboard.models import DashboardConfig
        dashboard = DashboardConfig.objects.filter(
            id=dashboard_id, 
            tenant_id=tenant_id
        ).first()
        if not dashboard:
            raise PermissionDenied("Dashboard not found in tenant")
        kwargs['tenant_id'] = tenant_id
        kwargs['dashboard_id'] = dashboard_id
        kwargs['widget_type'] = widget_type
        return self.create(**kwargs)