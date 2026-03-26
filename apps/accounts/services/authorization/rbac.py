import logging
from typing import Optional, List, Dict, Any, Tuple
from django.contrib.auth.models import Permission
from apps.accounts.models import User, Role, Permission as CustomPermission
from apps.accounts.services.audit.logger import AuditService
logger = logging.getLogger(__name__)

class RBACService:
    def __init__(self):
        self.audit_service = AuditService()

    def assign_role(self, user: User, role_code: str, assigned_by: User = None, request=None) -> Tuple[bool, str]:
        if assigned_by and not self.can_assign_role(assigned_by, role_code):
            return False, 'You do not have permission to assign roles'
        role = Role.objects.filter(code=role_code, is_deleted=False).first()
        if not role:
            return False, f"Role {role_code} does not exists"
        old_role = user.role
        user.role = role_code
        user.save(update_fields=['role'])
        self.audit_service.log(
            user=assigned_by or user, action='user.role_assigned', action_type='update', request=request, severity='info',
            metadata= {
                'target_user': user.email,
                'old_role': old_role,
                'new_role': role_code
            }
        )
        return True, 'Role assigned successfully'
    
    def can_assign_role(self, assigner: User, role_code: str) -> bool:
        if assigner.role == 'super_admin':
            return True
        if assigner.role == 'client_admin':
            role = Role.objects.filter(code=role_code).first()
            if role and role.is_assignable and not role.is_system:
                return True
        if assigner.role == 'executive':
            if role_code in ['executive', 'supervisor', 'staff', 'read_only']:
                return True
        if assigner.role == 'supervisor':
            if role_code in ['staff', 'read_only']:
                return True
        return False
    
    def get_user_permission(self, user: User) -> List[str]:
        if user.is_superuser or user.role == 'super_admin':
            return list(CustomPermission.objects.filter(is_active=True).values_list('codename', flat=True))
        role = Role.objects.filter(code=user.role, is_deleted=False).first()
        if role:
            return list(role.get_all_permissions())
        return []
    
    def user_has_permission(self, user: User, permission_codename: str, obj: Any = None) -> bool:
        if user.is_superuser or user.role == 'super_admin':
            return True
        if obj and hasattr(obj, 'tenant_id') and obj.tenant_id != user.tenant_id:
            return False
        user_perms = self.get_user_permission(user)
        return permission_codename in user_perms
    
    def get_accessible_objects(self, user: User, model_class, permission_codename: str = None):
        if user.is_superuser or user.role == 'super_admin':
            return model_class.objects.filter(tenant_id=user.tenant_id, is_deleted=False)
        if user.role == 'client_admin':
            return model_class.objects.filter(tenant_id=user.tenant_id, is_deleted=False)
        elif user.role == 'executive':
            return model_class.objects.filter(tenant_id=user.tenant_id, is_deleted=False)
        elif user.role == 'supervisor':
            team_ids = user.get_team_ids()
            if hasattr(model_class, 'user_id'):
                return model_class.objects.filter(user_id__in=team_ids, is_deleted=False)
            elif hasattr(model_class, 'owner_id'): 
                return model_class.objects.filter(owner_id__in=team_ids, is_deleted=False)
            else:
                return model_class.objects.filter(tenant_id=user.tenant_id, is_deleted=False)
        elif user.role == 'staff':
            if hasattr(model_class, 'user_id'):
                return model_class.objects.filter(user_id=user.id, is_deleted=False)
            if hasattr(model_class, 'owner_id'):
                return model_class.objects.filter(owner_id=user.id, is_deleted=False)
            else:
                return model_class.objects.none()
        elif user.role == 'read_only': 
            return model_class.objects.filter(tenant_id=user.tenant_id, is_deleted=False)
        return model_class.objects.none()
    
    def get_role_hierarchy(self, role_code: str) -> List[str]:
        role = Role.objects.filter(code=role_code).first()
        if not role:
            return [role_code]
        hierarchy = [role_code]
        children = Role.objects.filter(parent=role, is_deleted=False)
        for child in children:
            hierarchy.extend(self.get_role_hierarchy(child.code))
        return hierarchy
    
    def get_higher_roles(self, role_code: str) -> List[str]:
        role = Role.objects.filter(code=role_code).first()
        if not role:
            return []
        higher = []
        current = role.parent
        while current:
            higher.append(current.code)
            current = current.parrent
        return higher
    
    def get_lower_roles(self, role_code: str) -> List[str]:
        return self.get_role_hierarchy(role_code)[1:]