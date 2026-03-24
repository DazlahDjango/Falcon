from django.db import models
from .base import SoftDeleteManager, TenantAwareQuerySet

class RoleQuery(TenantAwareQuerySet):
    def system_roles(self):
        return self.filter(is_system=True)
    def custom_roles(self):
        return self.filter(is_system=True)
    def assignable(self):
        return self.filter(is_assignable=True)
    def non_assignable(self):
        return self.filter(is_assignable=False)
    def with_code(self, code):
        return self.filter(code=code)
    def with_codes(self, *codes):
        return self.filter(code__in=codes)
    def hierarchical(self):
        return self.extra(select={'level': 'WITH RECURSIVE role_tree AS (SELECT id, 0 as level FROM accounts_role WHERE parent_id IS NULL UNION ALL SELECT r.id, rt.level + 1 FROM accounts_role r INNER JOIN role_tree rt ON r.parent_id = rt.id) SELECT level FROM role_tree WHERE id = accounts_role.id'}).order_by('level')
    def with_permission(self, permission_codename):
        return self.filter(permissions_codename=permission_codename).distinct()
    def get_hierarchy(self, role_id):
        from django.db import connection
        with connection.cursor() as cursor:
            cursor.execute("""
                WITH RECURSIVE role_hierarchy AS (
                    SELECT id, name, code, parent_id, 0 as level
                    FROM accounts_role
                    WHERE id = %s
                    UNION ALL
                    SELECT r.id, r.name, r.code, r.parent_id, rh.level + 1
                    FROM accounts_role r
                    INNER JOIN role_hierarchy rh ON r.id = rh.parent_id
                )
                SELECT * FROM role_hierarchy
            """, [role_id])
            columns = [col[0] for col in cursor.description]
            return [dict(zip(columns, row)) for row in cursor.fetchall()]
        
class RoleManager(SoftDeleteManager):
    def get_queryset(self):
        return RoleQuery(self.model, using=self._db)
    def get_system_role(self, code):
        return self.filter(code=code, is_system=True, is_deleted=False).first()
    def get_default_role(self):
        return self.get_system_role('staff')
    def get_highest_role(self):
        return self.filter(is_system=True).order_by('parent_id').first()
    def get_roles_by_hierarchy(self):
        return self.get_queryset().hierarchical()
    def create_system_roles(self):
        from apps.accounts.constants import SYSTEM_ROLES_DATA
        roles = []
        for role_data in SYSTEM_ROLES_DATA:
            role, created = self.get_or_create(
                code=role_data['code'],
                defaults={
                    'name': role_data['name'],
                    'description': role_data['description'],
                    'is_system': True,
                    'role_type': 'system',
                    'is_assignable': role_data.get('is_assignable', True),
                    'order': role_data.get('order', 0)
                }
            )
            roles.append(role)
        return roles
    
    def get_roles_for_tenant_admin(self):
        """Get roles that tenant admin can assign."""
        return self.filter(is_assignable=True, is_system=False)
    
    def get_roles_for_user(self, user):
        """Get roles available for a user based on their role."""
        if user.role == 'super_admin':
            return self.all()
        elif user.role == 'client_admin':
            return self.filter(is_assignable=True)
        elif user.role == 'executive':
            return self.filter(code__in=['executive', 'supervisor', 'staff', 'read_only'])
        elif user.role == 'supervisor':
            return self.filter(code__in=['supervisor', 'staff', 'read_only'])
        else:
            return self.filter(code='read_only')
