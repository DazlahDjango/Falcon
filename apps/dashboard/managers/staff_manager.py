# apps/dashboard/managers/staff_manager.py

from .base import DashboardBaseManager


class StaffViewManager(DashboardBaseManager):
    """Manager for StaffView model."""
    
    def get_default_for_user(self, user_id, tenant_id):
        """Get default staff view for a user."""
        return self.for_tenant(tenant_id).filter(
            user_id=user_id,
            is_default=True
        ).first()
    
    def get_by_user(self, user_id, tenant_id):
        """Get all staff views for a user."""
        return self.for_tenant(tenant_id).filter(user_id=user_id)
    
    def get_active_view(self, user_id, tenant_id):
        """Get the active (default or first) view for a user."""
        view = self.get_default_for_user(user_id, tenant_id)
        if not view:
            view = self.get_by_user(user_id, tenant_id).first()
        return view
    
    def get_preferences(self, user_id, tenant_id):
        """Get staff dashboard preferences."""
        view = self.get_active_view(user_id, tenant_id)
        if view:
            return {
                'show_mission_status': view.show_mission_status,
                'show_tasks': view.show_tasks,
                'show_recent_activity': view.show_recent_activity,
                'show_performance_chart': view.show_performance_chart,
                'kpi_display_mode': view.kpi_display_mode,
                'auto_save_drafts': view.auto_save_drafts,
                'default_period': view.default_period,
            }
        return {
            'show_mission_status': True,
            'show_tasks': True,
            'show_recent_activity': True,
            'show_performance_chart': True,
            'kpi_display_mode': 'cards',
            'auto_save_drafts': True,
            'default_period': 'current',
        }