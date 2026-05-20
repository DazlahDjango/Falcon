# apps/dashboard/managers/champion_manager.py

from .base import DashboardBaseManager


class ChampionViewManager(DashboardBaseManager):
    """Manager for ChampionView model."""
    
    def get_default_for_user(self, user_id, tenant_id):
        """Get default champion view for a user."""
        return self.for_tenant(tenant_id).filter(
            user_id=user_id,
            is_default=True
        ).first()
    
    def get_templates(self, tenant_id):
        """Get all champion templates."""
        return self.for_tenant(tenant_id).filter(is_template=True)
    
    def get_template_by_name(self, tenant_id, template_name):
        """Get a template by name."""
        return self.for_tenant(tenant_id).filter(
            is_template=True,
            template_name=template_name
        ).first()
    
    def apply_template(self, tenant_id, template_id, target_user_id, target_tenant_id=None):
        """Apply a champion template to a target user."""
        template = self.for_tenant(tenant_id).get(id=template_id)
        
        # Create new view for target user based on template
        return self.create(
            tenant_id=target_tenant_id or tenant_id,
            user_id=target_user_id,
            view_name=f"From template: {template.template_name or template.view_name}",
            saved_configuration=template.saved_configuration,
            is_template=False,
        )
    
    def get_saved_configuration(self, user_id, tenant_id, target_user_id=None):
        """Get saved configuration for a target user."""
        query = self.for_tenant(tenant_id).filter(user_id=user_id)
        
        if target_user_id:
            query = query.filter(target_user_id=target_user_id)
        
        view = query.order_by('-is_default', '-created_at').first()
        
        if view:
            return view.saved_configuration
        return {}
    
    def save_configuration(self, user_id, tenant_id, config, target_user_id=None, view_name='default'):
        """Save a dashboard configuration."""
        defaults = {
            'saved_configuration': config,
            'is_default': False,
        }
        
        if target_user_id:
            defaults['target_user_id'] = target_user_id
        
        view, created = self.update_or_create(
            tenant_id=tenant_id,
            user_id=user_id,
            view_name=view_name,
            defaults=defaults
        )
        
        return view