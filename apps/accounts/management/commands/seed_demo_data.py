"""
Seed demo data for testing.
Usage: python manage.py seed_demo_data
"""

from django.core.management.base import BaseCommand
from django.utils.translation import gettext_lazy as _
from django.contrib.auth import get_user_model

from apps.core.models import Client
from apps.accounts.models import UserPreference, Profile
from apps.accounts.constants import UserRoles

User = get_user_model()


class Command(BaseCommand):
    """
    Seed demo data for testing.
    """
    help = 'Seed demo data for testing'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force seed even if data exists'
        )
        parser.add_argument(
            '--tenant-id',
            type=str,
            help='Seed data for specific tenant'
        )
    
    def handle(self, *args, **options):
        force = options['force']
        tenant_id = options.get('tenant_id')
        
        if tenant_id:
            try:
                tenant = Client.objects.get(id=tenant_id, is_deleted=False)
                tenants = [tenant]
            except Client.DoesNotExist:
                self.stdout.write(self.style.ERROR(f'Tenant with ID {tenant_id} not found'))
                return
        else:
            tenants = Client.objects.filter(is_deleted=False)
        
        for tenant in tenants:
            self.stdout.write(_(f'\nSeeding data for tenant: {tenant.name}'))
            
            # Check if users already exist
            existing_users = User.objects.filter(tenant_id=tenant.id).count()
            if existing_users > 0 and not force:
                self.stdout.write(self.style.WARNING(f'  Tenant already has {existing_users} users. Use --force to override.'))
                continue
            
            # Create admin user
            admin = User.objects.create_user(
                email=f'admin@{tenant.slug}.com',
                username='admin',
                tenant_id=str(tenant.id),
                password='Admin123!',
                first_name='Admin',
                last_name='User',
                role=UserRoles.CLIENT_ADMIN,
                is_verified=True,
                is_onboarded=True,
                is_staff=True
            )
            Profile.objects.get_or_create(user=admin, tenant_id=str(tenant.id))
            UserPreference.objects.get_or_create(user=admin, tenant_id=str(tenant.id))
            self.stdout.write(self.style.SUCCESS(f'  Created: admin@{tenant.slug}.com'))
            
            # Create executive user
            executive = User.objects.create_user(
                email=f'executive@{tenant.slug}.com',
                username='executive',
                tenant_id=str(tenant.id),
                password='Executive123!',
                first_name='Executive',
                last_name='User',
                role=UserRoles.EXECUTIVE,
                is_verified=True,
                is_onboarded=True
            )
            Profile.objects.get_or_create(user=executive, tenant_id=str(tenant.id))
            UserPreference.objects.get_or_create(user=executive, tenant_id=str(tenant.id))
            self.stdout.write(self.style.SUCCESS(f'  Created: executive@{tenant.slug}.com'))
            
            # Create supervisor user
            supervisor = User.objects.create_user(
                email=f'supervisor@{tenant.slug}.com',
                username='supervisor',
                tenant_id=str(tenant.id),
                password='Supervisor123!',
                first_name='Supervisor',
                last_name='User',
                role=UserRoles.SUPERVISOR,
                is_verified=True,
                is_onboarded=True
            )
            Profile.objects.get_or_create(user=supervisor, tenant_id=str(tenant.id))
            UserPreference.objects.get_or_create(user=supervisor, tenant_id=str(tenant.id))
            self.stdout.write(self.style.SUCCESS(f'  Created: supervisor@{tenant.slug}.com'))
            
            # Create staff users
            for i in range(1, 6):
                staff = User.objects.create_user(
                    email=f'staff{i}@{tenant.slug}.com',
                    username=f'staff{i}',
                    tenant_id=str(tenant.id),
                    password='Staff123!',
                    first_name='Staff',
                    last_name=str(i),
                    role=UserRoles.STAFF,
                    is_verified=True,
                    is_onboarded=True
                )
                Profile.objects.get_or_create(user=staff, tenant_id=str(tenant.id))
                UserPreference.objects.get_or_create(user=staff, tenant_id=str(tenant.id))
            
            self.stdout.write(self.style.SUCCESS(f'  Created: 5 staff users'))
            
            # Create read-only user
            readonly = User.objects.create_user(
                email=f'readonly@{tenant.slug}.com',
                username='readonly',
                tenant_id=str(tenant.id),
                password='Readonly123!',
                first_name='ReadOnly',
                last_name='User',
                role=UserRoles.READ_ONLY,
                is_verified=True,
                is_onboarded=True
            )
            Profile.objects.get_or_create(user=readonly, tenant_id=str(tenant.id))
            UserPreference.objects.get_or_create(user=readonly, tenant_id=str(tenant.id))
            self.stdout.write(self.style.SUCCESS(f'  Created: readonly@{tenant.slug}.com'))
        
        self.stdout.write(self.style.SUCCESS('\n✅ Demo data seeding completed'))