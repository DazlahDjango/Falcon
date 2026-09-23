import logging
from typing import Optional, List, Dict, Any, Tuple
from django.core.cache import cache
from apps.accounts.models import User, Role, Permission as CustomPermission
from apps.accounts.services.audit.logger import AuditService
from apps.accounts.constants import (
    ROLE_DEFAULT_PERMISSIONS,
    PREDEFINED_PERMISSIONS_DATA,
    SYSTEM_RESTRICTED_CATEGORIES,
    TENANT_ASSIGNABLE_CATEGORIES,
    PermissionLevels,
    CacheKeys,
    UserRoles,
)

logger = logging.getLogger(__name__)

CACHE_TTL_USER_PERMISSIONS = 3600  # 1 hour


class RBACService:
    def __init__(self):
        self.audit_service = AuditService()

    def get_role_default_permissions(self, role_code: str) -> List[str]:
        """
        Get default permission codenames for a given role code.
        Combines predefined dictionary defaults with any DB-backed Role permissions.
        """
        defaults = set(ROLE_DEFAULT_PERMISSIONS.get(role_code, []))
        try:
            role = Role.objects.filter(code=role_code, is_deleted=False).first()
            if role:
                defaults.update(role.get_all_permissions())
        except Exception as e:
            logger.warning(f"Failed to fetch DB role permissions for {role_code}: {e}")
        return sorted(list(defaults))

    def get_user_effective_permissions(self, user: User, use_cache: bool = True) -> List[str]:
        """
        Calculate and return effective permissions for a user:
        Effective = (Role Defaults + Granted Overrides) - Revoked Overrides.
        Super admins and superusers receive all active permissions.
        """
        if not user or not user.is_authenticated:
            return []

        if user.is_superuser or user.role == UserRoles.SUPER_ADMIN:
            # Return all codenames from registry
            all_codenames = [p['codename'] for p in PREDEFINED_PERMISSIONS_DATA]
            # Merge with custom permissions in database if any
            try:
                db_perms = list(CustomPermission.objects.filter(is_active=True).values_list('codename', flat=True))
                all_codenames = list(set(all_codenames + db_perms))
            except Exception:
                pass
            return sorted(all_codenames)

        cache_key = CacheKeys.USER_PERMISSIONS.format(user_id=str(user.id))
        if use_cache:
            cached_perms = cache.get(cache_key)
            if cached_perms is not None:
                return cached_perms

        # Base role defaults
        role_defaults = set(self.get_role_default_permissions(user.role))

        # Per-user overrides
        overrides = getattr(user, 'custom_permission_overrides', {}) or {}
        if not isinstance(overrides, dict):
            overrides = {}

        granted = set(overrides.get('granted', []))
        revoked = set(overrides.get('revoked', []))

        # Effective set formula: (Role Defaults + Granted) - Revoked
        effective_set = (role_defaults | granted) - revoked
        effective_list = sorted(list(effective_set))

        if use_cache:
            try:
                cache.set(cache_key, effective_list, timeout=CACHE_TTL_USER_PERMISSIONS)
            except Exception as e:
                logger.warning(f"Could not cache user permissions for {user.id}: {e}")

        return effective_list

    def clear_user_permission_cache(self, user_id: Any) -> None:
        """Invalidate cached permissions for a user."""
        try:
            cache_key = CacheKeys.USER_PERMISSIONS.format(user_id=str(user_id))
            cache.delete(cache_key)
        except Exception as e:
            logger.warning(f"Error deleting permission cache for user {user_id}: {e}")

    def get_assignable_permissions(self, user: User) -> List[Dict[str, Any]]:
        """Returns list of permissions that the given user is allowed to assign to others."""
        if not user or not user.is_authenticated:
            return []
        if user.is_superuser or getattr(user, 'role', None) == UserRoles.SUPER_ADMIN:
            return list(PREDEFINED_PERMISSIONS_DATA)
        return [
            p for p in PREDEFINED_PERMISSIONS_DATA
            if p.get('category') in TENANT_ASSIGNABLE_CATEGORIES and p.get('level') != PermissionLevels.GLOBAL
        ]

    def get_user_permission_details(self, user: User, viewer: User = None) -> Dict[str, Any]:
        """
        Provides a comprehensive breakdown of a user's role defaults,
        individual granted and revoked overrides, and effective permissions.
        """
        overrides = getattr(user, 'custom_permission_overrides', {}) or {}
        if not isinstance(overrides, dict):
            overrides = {}

        role_defaults = self.get_role_default_permissions(user.role)
        granted = overrides.get('granted', [])
        revoked = overrides.get('revoked', [])
        effective = self.get_user_effective_permissions(user, use_cache=False)

        role_display = user.role
        try:
            role_obj = Role.objects.filter(code=user.role, is_deleted=False).first()
            if role_obj and role_obj.name:
                role_display = role_obj.name
        except Exception:
            pass

        available = self.get_assignable_permissions(viewer) if viewer else list(PREDEFINED_PERMISSIONS_DATA)

        return {
            'user_id': str(user.id),
            'email': user.email,
            'role': user.role,
            'role_display': role_display,
            'role_defaults': role_defaults,
            'granted': granted,
            'revoked': revoked,
            'effective': effective,
            'granted_overrides': granted,
            'revoked_overrides': revoked,
            'effective_permissions': effective,
            'effective_permissions_count': len(effective),
            'all_available': available,
        }

    def assign_user_permission_override(
        self,
        user: User,
        granted: List[str],
        revoked: List[str],
        assigned_by: User = None,
        request=None
    ) -> Tuple[bool, str]:
        """
        Assign custom granted / revoked permission overrides to a specific user.
        Ensures tenant boundaries and logs audit events.
        """
        if assigned_by:
            # Verify permission to manage user permissions
            if assigned_by.role not in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN, UserRoles.HR_ADMIN]:
                return False, "You do not have authorization to modify user permissions."
            
            # Non-superadmin cannot touch users in other tenants
            if assigned_by.role != UserRoles.SUPER_ADMIN and assigned_by.tenant_id != user.tenant_id:
                return False, "Cross-tenant permission modification is prohibited."

            # Non-superadmin cannot assign or revoke system-level permissions (config, billing, tenant)
            if not (assigned_by.is_superuser or assigned_by.role == UserRoles.SUPER_ADMIN):
                from apps.accounts.constants import SYSTEM_RESTRICTED_CATEGORIES, PermissionLevels
                restricted_codenames = {
                    p['codename'] for p in PREDEFINED_PERMISSIONS_DATA 
                    if p.get('category') in SYSTEM_RESTRICTED_CATEGORIES or p.get('level') == PermissionLevels.GLOBAL
                }
                attempted_restricted = (set(granted or []) | set(revoked or [])) & restricted_codenames
                if attempted_restricted:
                    return False, f"Permission denied: Only Super Admin can assign system-level permissions ({', '.join(sorted(attempted_restricted))})."

        clean_granted = sorted(list(set(granted or [])))
        clean_revoked = sorted(list(set(revoked or [])))

        # Clean overlaps: a permission cannot be simultaneously granted and revoked
        clean_granted = [p for p in clean_granted if p not in clean_revoked]

        user.custom_permission_overrides = {
            'granted': clean_granted,
            'revoked': clean_revoked
        }
        user.save(update_fields=['custom_permission_overrides'])

        # Evict cache immediately
        self.clear_user_permission_cache(user.id)

        # Audit logging
        self.audit_service.log(
            user=assigned_by or user,
            action='user.permission_overrides_updated',
            action_type='update',
            request=request,
            severity='info',
            metadata={
                'target_user': user.email,
                'target_user_id': str(user.id),
                'role': user.role,
                'granted': clean_granted,
                'revoked': clean_revoked,
            }
        )

        return True, "User permission overrides updated successfully."

    def assign_role(self, user: User, role_code: str, assigned_by: User = None, request=None) -> Tuple[bool, str]:
        if assigned_by and not self.can_assign_role(assigned_by, role_code):
            return False, 'You do not have permission to assign roles'
        
        # Verify role exists
        if role_code not in UserRoles.values:
            role = Role.objects.filter(code=role_code, is_deleted=False).first()
            if not role:
                return False, f"Role {role_code} does not exist"

        old_role = user.role
        user.role = role_code
        user.save(update_fields=['role'])

        # Clear cache since role defaults change
        self.clear_user_permission_cache(user.id)

        self.audit_service.log(
            user=assigned_by or user, action='user.role_assigned', action_type='update', request=request, severity='info',
            metadata={
                'target_user': user.email,
                'old_role': old_role,
                'new_role': role_code
            }
        )
        try:
            from apps.accounts.services.realtime import AccountsEventBroadcaster
            AccountsEventBroadcaster.role_changed(
                user_id=str(user.id),
                tenant_id=str(user.tenant_id),
                old_role=old_role,
                new_role=role_code,
                assigned_by_id=str(assigned_by.id) if assigned_by else None,
            )
        except Exception as e:
            logger.warning(f"Broadcasting role change failed: {e}")

        return True, 'Role assigned successfully'
    
    def can_assign_role(self, assigner: User, role_code: str) -> bool:
        if assigner.role == UserRoles.SUPER_ADMIN or assigner.is_superuser:
            return True
        if assigner.role == UserRoles.CLIENT_ADMIN:
            # Allow client_admin to assign any tenant-level role, except super_admin
            return role_code != UserRoles.SUPER_ADMIN
        if assigner.role == UserRoles.HR_ADMIN:
            return role_code in [UserRoles.EXECUTIVE, UserRoles.SUPERVISOR, UserRoles.STAFF, UserRoles.READ_ONLY]
        if assigner.role == UserRoles.EXECUTIVE:
            return role_code in [UserRoles.SUPERVISOR, UserRoles.STAFF, UserRoles.READ_ONLY]
        if assigner.role == UserRoles.SUPERVISOR:
            return role_code in [UserRoles.STAFF, UserRoles.READ_ONLY]
        return False
    
    def get_user_permission(self, user: User) -> List[str]:
        """Backward compatible method returning effective permissions."""
        return self.get_user_effective_permissions(user)
    
    def user_has_permission(self, user: User, permission_codename: str, obj: Any = None) -> bool:
        if not user or not user.is_authenticated:
            return False
        if user.is_superuser or user.role == UserRoles.SUPER_ADMIN:
            return True
        if obj and hasattr(obj, 'tenant_id') and obj.tenant_id != user.tenant_id:
            return False
        user_perms = self.get_user_effective_permissions(user)
        return permission_codename in user_perms
    
    def get_accessible_objects(self, user: User, model_class, permission_codename: str = None):
        if user.is_superuser or user.role == UserRoles.SUPER_ADMIN:
            return model_class.objects.filter(tenant_id=user.tenant_id, is_deleted=False)
        if user.role in [UserRoles.CLIENT_ADMIN, UserRoles.HR_ADMIN, UserRoles.EXECUTIVE]:
            return model_class.objects.filter(tenant_id=user.tenant_id, is_deleted=False)
        elif user.role == UserRoles.SUPERVISOR:
            team_ids = user.get_team_ids() if hasattr(user, 'get_team_ids') else []
            if hasattr(model_class, 'user_id'):
                return model_class.objects.filter(user_id__in=team_ids, is_deleted=False)
            elif hasattr(model_class, 'owner_id'): 
                return model_class.objects.filter(owner_id__in=team_ids, is_deleted=False)
            else:
                return model_class.objects.filter(tenant_id=user.tenant_id, is_deleted=False)
        elif user.role == UserRoles.STAFF:
            if hasattr(model_class, 'user_id'):
                return model_class.objects.filter(user_id=user.id, is_deleted=False)
            if hasattr(model_class, 'owner_id'):
                return model_class.objects.filter(owner_id=user.id, is_deleted=False)
            else:
                return model_class.objects.none()
        elif user.role == UserRoles.READ_ONLY: 
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
            current = current.parent
        return higher
    
    def get_lower_roles(self, role_code: str) -> List[str]:
        return self.get_role_hierarchy(role_code)[1:]

    def get_assignable_roles(self, user: User) -> List[Role]:
        """Get roles that user can assign to others."""
        if user.role == UserRoles.SUPER_ADMIN or user.is_superuser:
            return Role.objects.filter(is_assignable=True, is_deleted=False)
        elif user.role == UserRoles.CLIENT_ADMIN:
            return Role.objects.filter(is_assignable=True, is_system=False, is_deleted=False)
        elif user.role == UserRoles.HR_ADMIN:
            return Role.objects.filter(code__in=[UserRoles.EXECUTIVE, UserRoles.SUPERVISOR, UserRoles.STAFF, UserRoles.READ_ONLY], is_deleted=False)
        elif user.role == UserRoles.EXECUTIVE:
            return Role.objects.filter(code__in=[UserRoles.SUPERVISOR, UserRoles.STAFF, UserRoles.READ_ONLY], is_deleted=False)
        elif user.role == UserRoles.SUPERVISOR:
            return Role.objects.filter(code__in=[UserRoles.STAFF, UserRoles.READ_ONLY], is_deleted=False)
        else:
            return Role.objects.none()