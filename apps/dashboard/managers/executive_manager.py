from django.core.cache import cache
from .base import DashboardBaseManager

class ExecutiveViewPresetManager(DashboardBaseManager):
    def get_executive_views(self, user_id, tenant_id):
        cache_key = f"dashboard_executive_views_{tenant_id}_{user_id}"
        cached = cache.get(cache_key)
        if cached is not None:
            return cached
        views = self.for_tenant(tenant_id).filter(user_id=user_id).order_by('view_type', 'name')
        cache.set(cache_key, views, 3600)
        return views
    
    def get_default_view(self, user_id, tenant_id):
        return self.for_tenant(tenant_id).filter(
            user_id=user_id,
            is_default=True
        ).first()
    
    def set_default_view(self, view_id, user_id, tenant_id):
        from django.db import transaction
        with transaction.atomic():
            self.filter(
                user_id=user_id,
                tenant_id=tenant_id,
                is_default=True
            ).exclude(id=view_id).update(is_default=False)
            view = self.get(id=view_id, user_id=user_id, tenant_id=tenant_id)
            view.is_default = True
            view.save(update_fields=['is_default', 'updated_at'])
            cache_key = f"dashboard_executive_views_{tenant_id}_{user_id}"
            cache.delete(cache_key)
        return view
    
    def create_preset_from_filters(self, user_id, tenant_id, name, view_type, filters, set_as_default=False):
        preset = self.secure_create(
            tenant_id=tenant_id,
            user_id=user_id,
            name=name,
            view_type=view_type,
            filters=filters,
            is_default=set_as_default
        )
        if set_as_default:
            self.set_default_view(preset.id, user_id, tenant_id)
        return preset