import logging
from django.core.exceptions import PermissionDenied
from apps.configs.exceptions import SuperAdminRequiredError, ClientAdminRequiredError, PermissionDeniedError

class AccessEnforcer:
    _instance = None
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    def enforce_super_admin(self, user_role, user_id=None):
        if user_role not in ['super_admin', 'system']:
            raise SuperAdminRequiredError(f"User {user_id} with role {user_role} cannot perform this operation. Super Admin required.")
        return True
    def enforce_client_admin(self, user_role, user_id=None):
        if user_role not in ['super_admin', 'client_admin', 'system']:
            raise ClientAdminRequiredError(f"User {user_id} with role {user_role} cannot perform this operation. Client Admin or Super Admin required.")
        return True
    def enforce_config_access(self, user_role, user_id=None):
        if user_role not in ['super_admin', 'client_admin', 'system']:
            raise PermissionDeniedError(f"User {user_id} with role {user_role} cannot access Config app. Only Super Admin and Client Admin allowed.")
        return True
    def enforce_tenant_access(self, user_tenant_id, target_tenant_id, user_role='client_admin'):
        if user_role == 'super_admin':
            return True
        if not user_tenant_id or str(user_tenant_id) != str(target_tenant_id):
            raise PermissionDeniedError(f"Tenant isolation error: User tenant ({user_tenant_id}) cannot access target tenant ({target_tenant_id}) resource.")
        return True
    def can_trigger_dr(self, user_role):
        return user_role == 'super_admin'
    def can_rotate_keys(self, user_role):
        return user_role == 'super_admin'
    def can_change_quota(self, user_role):
        return user_role == 'super_admin'
    def can_full_maintenance(self, user_role):
        return user_role == 'super_admin'
    def can_partial_maintenance(self, user_role):
        return user_role in ['super_admin', 'client_admin']
    def can_trigger_backup(self, user_role):
        return user_role in ['super_admin', 'client_admin']
    def can_restore(self, user_role):
        return user_role in ['super_admin', 'client_admin']
    def can_view_audit_logs(self, user_role):
        return user_role == 'super_admin'