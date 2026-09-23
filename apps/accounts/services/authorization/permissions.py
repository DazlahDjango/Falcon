import logging
from typing import List, Dict, Any, Optional
from django.contrib.contenttypes.models import ContentType
from apps.accounts.models import User, Permission as CustomPermission, Role
from apps.accounts.services.audit.logger import AuditService
from apps.accounts.services.authorization.rbac import RBACService
from apps.accounts.constants import PREDEFINED_PERMISSIONS_DATA, UserRoles

logger = logging.getLogger(__name__)


class PermissionService:
    def __init__(self):
        self.audit_service = AuditService()
        self.rbac_service = RBACService()
    
    def get_user_permissions(self, user: User) -> List[str]:
        """Returns the effective permissions list for the user."""
        return self.rbac_service.get_user_effective_permissions(user)
    
    def check_permission(self, user: User, permission_codename: str, obj: Any = None) -> bool:
        """Checks if a user has a specific permission taking into account tenant & overrides."""
        return self.rbac_service.user_has_permission(user, permission_codename, obj)
    
    def has_permission(self, user: User, permission_codename: str, obj: Any = None) -> bool:
        """Alias for check_permission."""
        return self.check_permission(user, permission_codename, obj)
    
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
    
    def get_permissions_by_category(self, category: str) -> List[Dict[str, Any]]:
        # Filter from predefined data first, plus any DB custom permissions
        predefined = [p for p in PREDEFINED_PERMISSIONS_DATA if p.get('category') == category]
        return predefined
    
    def get_permissions_by_level(self, level: str) -> List[Dict[str, Any]]:
        predefined = [p for p in PREDEFINED_PERMISSIONS_DATA if p.get('level') == level]
        return predefined
    
    def get_user_permission_summary(self, user: User) -> Dict[str, Any]:
        details = self.rbac_service.get_user_permission_details(user)
        return {
            'user_email': user.email,
            'user_role': user.role,
            'permission_count': len(details['effective']),
            'effective_permissions': details['effective'],
            'granted_overrides': details['granted'],
            'revoked_overrides': details['revoked'],
            'is_superuser': user.is_superuser or user.role == UserRoles.SUPER_ADMIN
        }
    
    def has_module_permissions(self, user: User, module: str) -> bool:
        category_map = {
            'kpi': 'kpi',
            'reviews': 'review',
            'dashboard': 'report',
            'reports': 'report',
            'users': 'user',
            'settings': 'config',
            'structure': 'structure',
            'billing': 'billing',
        }
        category = category_map.get(module)
        if not category:
            return False
        
        module_codenames = [p['codename'] for p in PREDEFINED_PERMISSIONS_DATA if p.get('category') == category]
        user_perms = set(self.get_user_permissions(user))
        return bool(user_perms.intersection(set(module_codenames)))