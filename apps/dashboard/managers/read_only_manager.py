# apps/dashboard/managers/read_only_manager.py

from .base import DashboardBaseManager


class ReadOnlyViewManager(DashboardBaseManager):
    """Manager for ReadOnlyView model."""
    
    def get_default_for_user(self, user_id, tenant_id):
        """Get default read-only view for a user."""
        return self.for_tenant(tenant_id).filter(
            user_id=user_id,
            is_default=True
        ).first()
    
    def get_by_user(self, user_id, tenant_id):
        """Get all read-only views for a user."""
        return self.for_tenant(tenant_id).filter(user_id=user_id)
    
    def get_active_view(self, user_id, tenant_id):
        """Get the active (default or first) view for a user."""
        view = self.get_default_for_user(user_id, tenant_id)
        if not view:
            view = self.get_by_user(user_id, tenant_id).first()
        return view
    
    def get_allowed_view_types(self, user_id, tenant_id):
        """Get allowed dashboard types for a read-only user."""
        view = self.get_active_view(user_id, tenant_id)
        if view and view.allowed_view_types:
            return view.allowed_view_types
        return ['executive', 'manager', 'staff']
    
    def should_hide_sensitive_data(self, user_id, tenant_id):
        """Check if sensitive data should be hidden."""
        view = self.get_active_view(user_id, tenant_id)
        if view:
            return view.hide_sensitive_data
        return True
    
    def get_view_preferences(self, user_id, tenant_id):
        """Get all view preferences for a read-only user."""
        view = self.get_active_view(user_id, tenant_id)
        if view:
            return {
                'default_view_type': view.default_view_type,
                'allowed_view_types': view.allowed_view_types,
                'hide_sensitive_data': view.hide_sensitive_data,
                'mask_individual_scores': view.mask_individual_scores,
                'show_export_button': view.show_export_button,
                'show_refresh_button': view.show_refresh_button,
                'auto_refresh_interval': view.auto_refresh_interval,
            }
        return {
            'default_view_type': 'executive',
            'allowed_view_types': ['executive', 'manager', 'staff'],
            'hide_sensitive_data': True,
            'mask_individual_scores': False,
            'show_export_button': True,
            'show_refresh_button': True,
            'auto_refresh_interval': 60,
        }