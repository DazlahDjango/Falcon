import logging
from typing import List, Dict, Any, Optional
from django.contrib.auth.models import Permission as DjangoPermission
from django.contrib.contenttypes.models import ContentType
from apps.accounts.models import User, Permission as CustomPermission, Role
from apps.accounts.services.audit.logger import AuditService
logger = logging.getLogger(__name__)

class PermissionService:
    def __init__(self):
        self.audit_service = AuditService()
    
    def get_user_permissions(self, user: User) -> List[str]:
        permissions = set()
        if user.is_superuser:
            return list(CustomPermission.objects.filter(is_active=True).values_list('codename', flat=True))
        role = Role.objects.filter(code=user.role, is_deleted=False).first()
        if role:
            permissions.update(role.get_all_permissions())
        return list(permissions)
    
    def check_permission(self, user: User, permission_codename: str, obj: Any = None) -> bool:
        if user.is_superuser:
            return True
        if obj and hasattr(obj, 'tenant_id') and obj.tenant_id != user.tenant_id:
            return False
        perm = CustomPermission.objects.filter(codename=permission_codename, is_active=True).first()
        if not perm:
            return False
        if perm.level == 'global':
            return user.role == 'super_admin'
        elif perm.level == 'tenant':
            return user.role in ['client_admin', 'executive']
        elif perm.level == 'department':
            return user.role in ['client_admin', 'executive', 'supervisor']
        elif perm.level == 'team':
            return user.role in ['client_admin', 'executive', 'supervisor']
        elif perm.level == 'self':
            return True
        user_perms = self.get_user_permissions(user)
        return permission_codename in user_perms
    
    def create_permission(self, codename: str, name: str, content_type_model: str, category: str, level: str = 'tenant', **kwargs) -> Optional[CustomPermission]:
        try:
            app_label, model = content_type_model.split('.')
            content_type = ContentType.objects.get(app_label=app_label, model=model)
            permission = CustomPermission.objects.create(
                codename=codename,
                name=name,
                content_type=content_type,
                category=category,
                level=level,
                **kwargs
            )
            return permission
        except Exception as e:
            logger.error(f"Permission creation error: {str(e)}")
            return None
    
    def get_permissions_by_category(self, category: str) -> List[CustomPermission]:
        return CustomPermission.objects.filter(category=category, is_active=True)
    
    def get_permissions_by_level(self, level: str) -> List[CustomPermission]:
        return CustomPermission.objects.filter(level=level, is_active=True)
    
    def get_user_permission_summary(self, user: User) -> Dict[str, Any]:
        permissions = self.get_user_permissions(user)
        return {
            'user_email': user.email,
            'user_role': user.role,
            'permission_count': len(permissions),
            'permission': permissions[:100],
            'is_superuser': user.is_superuser
        }
    
    def has_module_permissions(self, user: User, module: str) -> bool:
        module_permissions = {
            'kpi': ['view_kpi', 'create_kpi', 'edit_kpi', 'delete_kpi'],
            'reviews': ['view_review', 'create_review', 'approve_review'],
            'dashboard': ['view_executive_dashboard', 'view_team_dashboard', 'view_individual_dashboard'],
            'reports': ['export_report'],
            'users': ['view_user', 'create_user', 'edit_user', 'delete_user'],
            'settings': ['manage_tenant', 'configure_branding'],
        }
        perms = module_permissions.get(module, [])
        if not perms:
            return False
        for perm in perms:
            if self.check_permission(user, perm):
                return True
        return False