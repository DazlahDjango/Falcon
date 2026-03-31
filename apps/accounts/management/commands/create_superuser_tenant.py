import uuid
import getpass
from django.core.management.base import BaseCommand, CommandError
from django.utils.translation import gettext_lazy as _
from django.contrib.auth import get_user_model
from apps.core.models import Client
from apps.accounts.models import UserPreference, Profile
from apps.accounts.constants import UserRoles
User = get_user_model()

class Command(BaseCommand):
    help = 'Create a superuser with tenant association'
    def add_arguments(self, parser):
        parser.add_argument('--email', type=str, help='Superuser email')
        parser.add_argument('--username', type=str, help='Superuser username')
        parser.add_argument('--password', type=str, help='Superuser password')
        parser.add_argument('--tenant-id', type=str, help='Tenant ID (UUID)')
        parser.add_argument('--tenant-name', type=str, help='Create new tenant with this name')
        parser.add_argument('--no-input', action='store_true', help='Run without interactive prompts')
    
    def handle(self, *args, **options):
        email = options.get('email')
        username = options.get('username')
        password = options.get('password')
        tenant_id = options.get('tenant_id')
        tenant_name = options.get('tenant_name')
        no_input = options.get('no_input')
        # Get or create tenant
        if tenant_id:
            try:
                tenant = Client.objects.get(id=tenant_id, is_deleted=False)
                self.stdout.write(self.style.SUCCESS(f'Using existing tenant: {tenant.name} ({tenant.id})'))
            except Client.DoesNotExist:
                raise CommandError(f'Tenant with ID {tenant_id} not found')
        elif tenant_name:
            # Create new tenant
            tenant = Client.objects.create(
                name=tenant_name,
                slug=tenant_name.lower().replace(' ', '-'),
                is_active=True
            )
            self.stdout.write(self.style.SUCCESS(f'Created new tenant: {tenant.name} ({tenant.id})'))
        else:
            # Prompt for tenant creation
            if not no_input:
                self.stdout.write(_('\nTenant Configuration'))
                self.stdout.write(_('-' * 50))
                create_new = input(_('Create new tenant? (y/n): ')).lower() == 'y'
                
                if create_new:
                    tenant_name = input(_('Tenant name: '))
                    tenant = Client.objects.create(
                        name=tenant_name,
                        slug=tenant_name.lower().replace(' ', '-'),
                        is_active=True
                    )
                    self.stdout.write(self.style.SUCCESS(f'Created tenant: {tenant.name}'))
                else:
                    tenant_id = input(_('Existing tenant ID (UUID): '))
                    try:
                        tenant = Client.objects.get(id=tenant_id, is_deleted=False)
                    except Client.DoesNotExist:
                        raise CommandError(f'Tenant with ID {tenant_id} not found')
            else:
                raise CommandError('Either --tenant-id or --tenant-name is required')
        
        # Get or create user
        if email and username and password:
            user_email = email
            user_username = username
            user_password = password
        elif not no_input:
            self.stdout.write(_('\nSuperuser Configuration'))
            self.stdout.write(_('-' * 50))
            user_email = input(_('Email: '))
            user_username = input(_('Username: '))
            user_password = getpass.getpass(_('Password: '))
            password_confirm = getpass.getpass(_('Confirm password: '))
            
            if user_password != password_confirm:
                raise CommandError('Passwords do not match')
        else:
            raise CommandError('Email, username, and password are required')
        
        # Check if user exists
        if User.objects.filter(email=user_email).exists():
            self.stdout.write(self.style.WARNING(f'User {user_email} already exists'))
            user = User.objects.get(email=user_email)
            
            # Update user to superuser if not already
            if not user.is_superuser:
                user.is_superuser = True
                user.is_staff = True
                user.role = UserRoles.SUPER_ADMIN
                user.save()
                self.stdout.write(self.style.SUCCESS(f'Updated {user.email} to superuser'))
        else:
            # Create superuser
            user = User.objects.create_superuser(
                email=user_email,
                username=user_username,
                tenant_id=str(tenant.id),
                password=user_password,
                role=UserRoles.SUPER_ADMIN,
                is_verified=True,
                is_onboarded=True
            )
            
            # Create profile
            Profile.objects.create(user=user, tenant_id=str(tenant.id))
            
            # Create preferences
            UserPreference.objects.create(user=user, tenant_id=str(tenant.id))
            
            self.stdout.write(self.style.SUCCESS(f'Created superuser: {user.email}'))
        
        self.stdout.write(self.style.SUCCESS(f'\nSuperuser created successfully!'))
        self.stdout.write(f'Email: {user.email}')
        self.stdout.write(f'Username: {user.username}')
        self.stdout.write(f'Tenant: {tenant.name} ({tenant.id})')