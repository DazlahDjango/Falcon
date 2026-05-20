from django.db import models
from django.utils import timezone
from django.core.exceptions import PermissionDenied

class DashboardBaseManager(models.Manager):
    def get_queryset(self):
        queryset = super().get_queryset()
        from django.core.cache import cache
        import threading
        tenant_id = getattr(threading.current_thread(), 'tenant_id', None)
        if tenant_id:
            queryset = queryset.filter(tenant_id=tenant_id)
        if hasattr(self.model, 'is_deleted'):
            queryset = queryset.filter(is_deleted=False)
        return queryset
    
    def for_tenant(self, tenant_id):
        if not tenant_id:
            raise ValueError("tenant_id is required for security")
        return self.get_queryset().filter(tenant_id=tenant_id)
    
    def for_user(self, user_id, tenant_id):
        return self.for_tenant(tenant_id).filter(user_id=user_id)
    
    def active_only(self):
        return self.get_queryset().filter(is_active=True)
    
    def secure_create(self, tenant_id, user_id, **kwargs):
        kwargs['tenant_id'] = tenant_id
        kwargs['user_id'] = user_id
        return self.create(**kwargs)


class DashboardConfigBaseManager(DashboardBaseManager):
    def get_by_role(self, tenant_id, user_id, role, dashboard_type):
        allowed_dashboards = {
            'super_admin': ['super_admin', 'executive', 'client_admin'],
            'client_admin': ['client_admin', 'executive'],
            'executive': ['executive'],
            'dashboard_champion': ['champion', 'executive'],
            'supervisor': ['manager', 'staff'],
            'staff': ['staff'],
        }
        
        user_role = role
        if user_role not in allowed_dashboards:
            raise PermissionDenied(f"Role {user_role} cannot access dashboard type {dashboard_type}") 
        
        if dashboard_type not in allowed_dashboards.get(user_role, []):
            raise PermissionDenied(f"Role {user_role} cannot access dashboard type {dashboard_type}")
        
        return self.for_tenant(tenant_id).filter(
            user_id=user_id,
            dashboard_type=dashboard_type
        )
    