from .base import DashboardBaseManager
from django.db import models

class FavoriteKPIManager(DashboardBaseManager):
    def get_user_favorites(self, user_id, tenant_id):
        from django.core.cache import cache
        cache_key = f"dashboard_favorites_{tenant_id}_{user_id}"
        cached = cache.get(cache_key)
        if cached is not None:
            return cached
        favorites = self.for_tenant(tenant_id).filter(
            user_id=user_id
        ).select_related().order_by('order')
        cache.set(cache_key, favorites, 1800)
        return favorites
    
    def add_favorite(self, user_id, tenant_id, kpi_id, kpi_name, order=None, notes=""):
        existing = self.filter(
            user_id=user_id,
            tenant_id=tenant_id,
            kpi_id=kpi_id
        ).first()
        if existing:
            return existing
        if order is None:
            max_order = self.filter(
                user_id=user_id,
                tenant_id=tenant_id
            ).aggregate(models.Max('order'))['order__max'] or -1
            order = max_order + 1
        return self.secure_create(
            tenant_id=tenant_id,
            user_id=user_id,
            kpi_id=kpi_id,
            kpi_name=kpi_name,
            order=order,
            notes=notes
        )
    
    def remove_favorite(self, user_id, tenant_id, kpi_id):
        deleted_count = self.filter(
            user_id=user_id,
            tenant_id=tenant_id,
            kpi_id=kpi_id
        ).delete()
        from django.core.cache import cache
        cache_key = f"dashboard_favorites_{tenant_id}_{user_id}"
        cache.delete(cache_key)
        return deleted_count
    
    def reorder_favorites(self, user_id, tenant_id, favorite_ids_in_order):
        from django.db import transaction
        with transaction.atomic():
            for idx, fav_id in enumerate(favorite_ids_in_order):
                self.filter(
                    id=fav_id,
                    user_id=user_id,
                    tenant_id=tenant_id
                ).update(order=idx)
        from django.core.cache import cache
        cache_key = f"dashboard_favorites_{tenant_id}_{user_id}"
        cache.delete(cache_key)