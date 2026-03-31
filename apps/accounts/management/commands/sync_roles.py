"""
Sync predefined system roles and permissions.
Usage: python manage.py sync_roles
"""

from django.core.management.base import BaseCommand
from django.contrib.auth.models import Permission as DjangoPermission
from django.contrib.contenttypes.models import ContentType
from django.utils.translation import gettext_lazy as _
from apps.accounts.models import Role, Permission
from apps.accounts.constants import SYSTEM_ROLES_DATA, PREDEFINED_PERMISSIONS_DATA
from apps.accounts.managers.role import RoleManager

class Command(BaseCommand):
    help = 'Sync predefined system roles and permissions'
    def add_arguments(self, parser):
        parser.add_argument(
            '--roles-only',
            action='store_true',
            help='Only sync roles, skip permissions'
        )
        parser.add_argument(
            '--permissions-only',
            action='store_true',
            help='Only sync permissions, skip roles'
        )
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force update even if roles exist'
        )
    
    def handle(self, *args, **options):
        roles_only = options['roles_only']
        permissions_only = options['permissions_only']
        force = options['force']
        
        if not permissions_only:
            self.stdout.write(_('\n=== Syncing System Roles ==='))
            self._sync_roles(force)
        
        if not roles_only:
            self.stdout.write(_('\n=== Syncing System Permissions ==='))
            self._sync_permissions(force)
        
        self.stdout.write(self.style.SUCCESS('\n✅ Sync completed successfully'))
    
    def _sync_roles(self, force):
        role_manager = RoleManager()
        for role_data in SYSTEM_ROLES_DATA:
            role, created = Role.objects.get_or_create(
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
            
            if created:
                self.stdout.write(self.style.SUCCESS(f'  Created: {role.name}'))
            elif force:
                # Update existing role
                updated = False
                if role.name != role_data['name']:
                    role.name = role_data['name']
                    updated = True
                if role.description != role_data['description']:
                    role.description = role_data['description']
                    updated = True
                if role.is_assignable != role_data.get('is_assignable', True):
                    role.is_assignable = role_data.get('is_assignable', True)
                    updated = True
                
                if updated:
                    role.save()
                    self.stdout.write(self.style.WARNING(f'  Updated: {role.name}'))
                else:
                    self.stdout.write(f'  Exists: {role.name}')
            else:
                self.stdout.write(f'  Exists: {role.name}')
    
    def _sync_permissions(self, force):
        # Get content types for common models
        from apps.accounts.models import User, Profile, Role as RoleModel
        content_types = {
            'user': ContentType.objects.get_for_model(User),
            'profile': ContentType.objects.get_for_model(Profile),
            'role': ContentType.objects.get_for_model(RoleModel),
        }
        
        for perm_data in PREDEFINED_PERMISSIONS_DATA:
            # Determine appropriate content type
            content_type = content_types.get(
                perm_data.get('model', 'user'),
                content_types['user']
            )
            
            permission, created = Permission.objects.get_or_create(
                codename=perm_data['codename'],
                defaults={
                    'name': perm_data['name'],
                    'content_type': content_type,
                    'category': perm_data['category'],
                    'level': perm_data.get('level', 'tenant'),
                    'is_active': True
                }
            )
            
            if created:
                self.stdout.write(self.style.SUCCESS(f'  Created: {permission.codename}'))
            elif force:
                # Update existing permission
                updated = False
                if permission.name != perm_data['name']:
                    permission.name = perm_data['name']
                    updated = True
                if permission.category != perm_data['category']:
                    permission.category = perm_data['category']
                    updated = True
                
                if updated:
                    permission.save()
                    self.stdout.write(self.style.WARNING(f'  Updated: {permission.codename}'))
                else:
                    self.stdout.write(f'  Exists: {permission.codename}')
            else:
                self.stdout.write(f'  Exists: {permission.codename}')