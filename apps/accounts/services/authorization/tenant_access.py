import logging
from typing import Optional, List, Dict, Any, Tuple
from django.core.cache import cache
from apps.accounts.models import User
from apps.core.models import Client
logger = logging.getLogger(__name__)

class TenantAccessService:
    def __int__(self):
        self.cache_prefix = 'tenant_access:'
    
    def get_user_tenant(self, user: User) -> Optional[str]:
        return str(user.tenant_id) if user.tenant_id else None
    
    def is_tenant_member(self, user: User, tenant_id: str) -> bool:
        return str(user.tenant_id) == str(tenant_id)
    
    def can_access_tenant_data(self, user: User, tenant_id: str) -> bool:
        if user.is_superuser or user.role == 'super_admin':
            return True
        return self.is_tenant_member(user, tenant_id)
    
    def can_access_user_data(self, accessing_user: User, target_user: User) -> bool:
        if accessing_user.tenant_id != target_user.tenant_id:
            return False
        # Super admin can access any user
        if accessing_user.is_superuser or accessing_user.role == 'super_admin':
            return True
        # Client admin access al users in tenants
        if accessing_user.role == 'client_admin':
            return True
        # Executive access user in tenants
        if accessing_user.role == 'executive':
            return True
        # Supervisor can access their team
        if accessing_user.role == 'supervisor':
            return target_user.id in accessing_user.get_team_ids() or target_user.id == accessing_user.id
        # Staffs can only access their own data
        if accessing_user.role == 'staff':
            return target_user.id == accessing_user.id
        # Read only can access but with restrictions
        if accessing_user.role == 'read_only':
            return True
        return False
    
    def filter_tenant_queryset(self, user: User, queryset, tenant_field: str = 'tenant_id'):
        if user.is_superuser or user.role == 'super_admin':
            return queryset
        return queryset.filter(**{tenant_field: user.tenant_id})
    
    def set_current_tenant(self, user: User) -> None:
        cache_key = f'{self.cache_prefix}current'
        cache.set(cache_key, str(user.tenant_id), timeout=3600)
    
    def get_current_tenant(self) -> Optional[str]:
        cache_key = f'{self.cache_prefix}current'
        return cache.get(cache_key)
    
    def clear_current_tenant(self) -> Optional[str]:
        cache_key = f'{self.cache_prefix}current'
        cache.delete(cache_key)

    def get_accessible_tenants(self, user: User) -> List[str]:
        if user.is_superuser or user.role == 'super_admin':
            return [str(t.id) for t in Client.objects.filter(is_deleted=False)]
        return [str(user.tenant_id)] if user.tenant_id else []
    
    def validate_cross_tenant_operations(self, user: User, target_tenant_id: str, operation: str) -> Tuple[bool, str]:
        if not self.can_access_tenant_data(user, target_tenant_id):
            return False, 'You do not have access to this tenant data'
        if operation in ['create', 'update', 'delete']:
            if user.role not in ['super_admin', 'client_admin']:
                return False, 'You do not have permission to modify data in this tenant'
        return True, 'OK'