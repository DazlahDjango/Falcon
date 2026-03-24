from .base import SoftDeleteManager, TenantAwareQuerySet

class PermissionQuerySet(TenantAwareQuerySet):
    def global_permissions(self):
        return self.filter(level='global')
    def tenant_permissions(self):
        return self.filter(level='tenant')
    def department_permissions(self):
        return self.filter(level='department')
    def team_permissions(self):
        return self.filter(level='team')
    def self_permissions(self):
        return self.filter(level='self')
    def by_category(self, category):
        return self.filter(category=category)
    def kpi_permissions(self):
        return self.filter(category='kpi')
    def review_permissions(self):
        return self.filter(category='review')
    def user_permissions(self):
        return self.filter(category='user')
    def tenant_permissions(self):
        return self.filter(category='tenant')
    def report_permissions(self):
        return self.filter(category='report')
    def workflow_permissions(self):
        return self.filter(category='workflow')
    def admin_permissions(self):
        return self.filter(category='admin')
    def active_permissions(self):
        return self.filter(is_active=True)
    def with_codename(self, codename):
        return self.filter(codename=codename)
    def with_codenames(self, *codenames):
        return self.filter(codename__in=codenames)
    def for_content_type(self, content_type_id):
        return self.filter(content_type_id=content_type_id)
    
class PermissionManager(SoftDeleteManager):
    def get_queryset(self):
        return PermissionQuerySet(self.model, using=self._db)
    
    def get_by_codename(self, codename):
        return self.filter(codename=codename).first()
    
    def get_or_create_permission(self, codename, name, content_type, category, level='tenant'):
        """Get or create a permission."""
        return self.get_or_create(
            codename=codename,
            defaults={
                'name': name,
                'content_type': content_type,
                'category': category,
                'level': level,
                'is_active': True,
            }
        )
    
    def bulk_create_predefined(self, content_type, permissions_data):
        permissions = []
        for data in permissions_data:
            perm, created = self.get_or_create(
                codename=data['codename'],
                defaults={
                    'name': data['name'],
                    'content_type': content_type,
                    'category': data['category'],
                    'level': data.get('level', 'tenant'),
                    'is_active': True,
                }
            )
            permissions.append(perm)
        return permissions
    
    def get_user_permissions(self, user):
        if user.is_superuser:
            return self.filter(is_active=True)
        # Get permissions from user's role and its parent roles
        role_perms = set()
        role = user.role
        if role:
            from apps.accounts.models import Role
            role_obj = Role.objects.filter(code=role).first()
            if role_obj:
                role_perms.update(role_obj.get_all_permissions())
        return self.filter(codename__in=role_perms, is_active=True)
    
    def user_has_permission(self, user, permission_codename, obj=None):
        if user.is_superuser:
            return True
        # Check role permissions
        from apps.accounts.models import Role
        role_obj = Role.objects.filter(code=user.role).first()
        if role_obj and role_obj.has_permission(permission_codename):
            return True
        # Check object-level permissions (if using guardian)
        if obj and hasattr(obj, 'tenant_id') and obj.tenant_id != user.tenant_id:
            return False
        return False