# apps/dashboard/managers/manager_manager.py

from django.db import models
from .base import DashboardBaseManager


class ManagerViewManager(DashboardBaseManager):
    """Manager for ManagerView model."""
    
    def get_default_for_user(self, user_id, tenant_id):
        """Get default manager view for a user."""
        return self.for_tenant(tenant_id).filter(
            user_id=user_id,
            is_default=True
        ).first()
    
    def get_by_user(self, user_id, tenant_id):
        """Get all manager views for a user."""
        return self.for_tenant(tenant_id).filter(user_id=user_id)
    
    def get_team_view(self, user_id, tenant_id, view_name='default'):
        """Get specific team view configuration."""
        return self.for_tenant(tenant_id).filter(
            user_id=user_id,
            view_name=view_name
        ).first()
    
    def get_active_view(self, user_id, tenant_id):
        """Get the active (default or first) view for a user."""
        view = self.get_default_for_user(user_id, tenant_id)
        if not view:
            view = self.get_by_user(user_id, tenant_id).first()
        return view
    
    def get_team_preferences(self, user_id, tenant_id):
        """Get team display preferences for a manager."""
        view = self.get_active_view(user_id, tenant_id)
        if view:
            return {
                'show_personal_kpis': view.show_personal_kpis,
                'show_team_kpis': view.show_team_kpis,
                'default_team_view': view.default_team_view,
                'team_member_sort': view.team_member_sort,
                'team_filters': view.team_filters,
            }
        return {
            'show_personal_kpis': True,
            'show_team_kpis': True,
            'default_team_view': 'cards',
            'team_member_sort': 'name',
            'team_filters': {},
        }