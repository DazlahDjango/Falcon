import logging
import re
import traceback
from django.db import transaction, connection
from django.utils import timezone
from apps.tenant.models import (
    Organization,
    OrganizationSchema,
    OrganizationResource,
    OrganizationMigration,
)
from apps.tenant.constants import OrganizationStatus, ResourceType, TIER_LIMITS, DEFAULT_ORGANIZATION_LIMITS
from apps.tenant.exceptions import ProvisioningError
from .schema_service import SchemaService
from .seeder_service import DataSeederService
from .migration_service import MigrationService

logger = logging.getLogger(__name__)


class ProvisioningService:
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.schema_service = SchemaService()
        self.seeder_service = DataSeederService()
        self.migration_service = MigrationService()

    def provision_organization(self, organization_id):
        """
        Enterprise-grade provisioning pipeline for a new organization.
        Coordinates:
          1. Advisory Lock acquisition to prevent race conditions.
          2. Input/state validation and schema name validation.
          3. Schema creation and activation.
          4. Sync and run migrations topologically.
          5. Tier-based resource limit setup with custom overrides.
          6. Seed default roles, rating scales, and templates.
          7. Broadcast progress updates over WebSockets.
          8. Automatic rollback and schema cascade drop on failure.
        """
        lock_id = hash(str(organization_id)) % 2**31
        schema_name = None
        
        try:
            # 1. Initialize schema record (Atomic)
            with transaction.atomic():
                # Acquire advisory lock inside transaction
                with connection.cursor() as cursor:
                    cursor.execute(f"SELECT pg_advisory_xact_lock({lock_id})")
                
                # Fetch organization with locking
                org = Organization.objects.select_for_update().get(id=organization_id)
                
                # Idempotency Check
                if org.is_provisioned:
                    self.logger.info(f"Organization {org.name} is already provisioned/active.")
                    return org
                
                schema_name = org.schema_name
                
                # Postgres schema name constraint validation
                if not re.match(r'^[a-z_][a-z0-9_]{0,62}$', schema_name):
                    raise ProvisioningError(
                        f"Invalid schema name '{schema_name}'. Postgres schemas must start with a letter "
                        f"or underscore, contain only lowercase letters, numbers, or underscores, and be max 63 characters."
                    )
                
                # Start Progress Tracking
                self._update_progress(org, 'STARTING', 'Initializing Provisioning', 0, "Starting organization provisioning pipeline...")
                
                # Update status to PROVISIONING
                org.mark_provisioning()
                
                # Create & Activate Schema
                self._update_progress(org, 'CREATING_SCHEMA', 'Creating Schema', 20, f"Creating database schema '{schema_name}'...")
                
                # Verify schema doesn't exist in DB already
                if OrganizationSchema.objects.filter(schema_name=schema_name).exists():
                    raise ProvisioningError(f"Database schema record '{schema_name}' already exists.")
                
                schema = self.schema_service.create_schema(org.id, schema_name)
                self.schema_service.provision_schema(schema.id)

            # 2. Sync & Apply Migrations (NON-ATOMIC)
            org = Organization.objects.get(id=organization_id)
            self._update_progress(org, 'MIGRATING', 'Applying Migrations', 40, "Syncing and running database migrations...")
            
            self.migration_service.sync_tenant_migrations(org.id)
            pending_migrations = self.migration_service.get_pending_migrations(org.id)
            
            total_migrations = pending_migrations.count()
            self.logger.info(f"Found {total_migrations} pending migrations for organization '{org.name}'")
            
            for idx, migration in enumerate(pending_migrations, 1):
                msg = f"Applying migration {idx}/{total_migrations}: {migration.app_name}.{migration.migration_name}"
                self._update_progress(
                    org,
                    'MIGRATING',
                    'Applying Migrations',
                    40 + int((idx / total_migrations) * 25), # spans from 40% to 65%
                    msg
                )
                self.migration_service.apply_migration(org.id, migration.app_name, migration.migration_name)
            
            # Ensure connection search path is restored to public
            with connection.cursor() as cursor:
                cursor.execute('SET search_path TO "public"')

            # 3. Resource Quotas, Seeding, Admin user creation (Atomic)
            with transaction.atomic():
                org = Organization.objects.select_for_update().get(id=organization_id)
                
                # Resource Limits Creation
                self._update_progress(org, 'PROVISIONING_RESOURCES', 'Provisioning Resource Limits', 75, "Setting up resource quotas and limits...")
                self._create_default_resources(org)
                
                # Seed Default Data
                self._update_progress(org, 'SEEDING', 'Seeding Default Data', 85, "Seeding default system roles and configurations...")
                self.seeder_service.seed_default_data(org)
                
                # Create Client Admin
                self._update_progress(org, 'CREATING_ADMIN', 'Creating Client Admin', 92, "Creating organization client administrator...")
                self._create_client_admin(org)
                
                # Finalize Onboarding
                org.mark_onboarded()
                self._update_progress(org, 'COMPLETED', 'Provisioning Completed', 100, "Organization provisioning completed successfully.")
                self.logger.info(f"Provisioned organization successfully: {org.id} - {org.name}")
                return org

        except Exception as e:
            error_trace = traceback.format_exc()
            self.logger.error(f"Provisioning failed for organization {organization_id}: {str(e)}\n{error_trace}")
            
            # Fallback schema name determination if it wasn't set yet
            if not schema_name:
                try:
                    org_temp = Organization.objects.get(id=organization_id)
                    schema_name = org_temp.schema_name
                except Exception:
                    schema_name = f"org_{str(organization_id).replace('-', '_')}"
            
            # Perform Rollback / Cleanup
            self._rollback_provisioning(organization_id, schema_name, str(e))
            raise ProvisioningError(f"Failed to provision organization: {str(e)}")

    def _create_default_resources(self, organization):
        """Create resource limits based on subscription tier and custom overrides."""
        tier = organization.subscription_tier or 'free'
        tier_limits_map = TIER_LIMITS.get(tier, {})

        resource_types = [
            'USERS', 'STORAGE_MB', 'API_CALLS_PER_DAY',
            'DEPARTMENTS', 'CONCURRENT_SESSIONS', 'KPIS',
        ]
        limits = {}
        for resource_type in resource_types:
            enum_member = getattr(ResourceType, resource_type, None)
            if enum_member and enum_member in tier_limits_map:
                limits[resource_type] = tier_limits_map[enum_member]
            elif enum_member and enum_member in DEFAULT_ORGANIZATION_LIMITS:
                limits[resource_type] = DEFAULT_ORGANIZATION_LIMITS[enum_member]
            else:
                limits[resource_type] = 0

        custom_limits = (organization.metadata or {}).get('custom_limits', {})
        for key, val in custom_limits.items():
            normalized = str(key).upper()
            try:
                limits[normalized] = int(val)
            except (ValueError, TypeError):
                self.logger.warning(
                    "Invalid custom limit value for %s: %s. Skipping override.",
                    key, val,
                )

        for resource_type, limit in limits.items():
            OrganizationResource.objects.get_or_create(
                organization=organization,
                resource_type=resource_type,
                defaults={
                    'limit_value': limit,
                    'current_value': 0,
                    'warning_threshold': 80,
                },
            )
        self.logger.info("Created default resources for %s", organization.name)

    def deprovision_organization(self, organization_id, reason='deprovision'):
        """
        Tear down infrastructure for an organization: drop PG schema,
        remove schema/resource/migration records. Does not delete the org row.
        """
        org = Organization.objects.filter(id=organization_id).first()
        schema_name = org.schema_name if org else f"org_{organization_id}"

        self.logger.warning(
            "Deprovisioning organization %s (schema=%s, reason=%s)",
            organization_id, schema_name, reason,
        )

        try:
            with connection.cursor() as cursor:
                cursor.execute(f'DROP SCHEMA IF EXISTS "{schema_name}" CASCADE')
                cursor.execute('SET search_path TO "public"')
        except Exception as exc:
            self.logger.error("Schema drop failed during deprovision: %s", exc)

        if org:
            OrganizationSchema.objects.filter(organization=org).delete()
            OrganizationResource.objects.filter(organization=org).delete()
            OrganizationMigration.objects.filter(organization=org).delete()

        return True

    def _update_progress(self, org, step, step_name, progress_pct, message):
        """Update organization metadata and broadcast WebSocket updates."""
        self.logger.info(f"[{org.name}] Step {step} ({progress_pct}%): {message}")
        
        if 'provisioning' not in org.metadata:
            org.metadata['provisioning'] = {}
        
        org.metadata['provisioning'].update({
            'status': step,
            'step_name': step_name,
            'progress': progress_pct,
            'message': message,
            'updated_at': timezone.now().isoformat(),
        })
        
        if step == 'STARTING':
            org.metadata['provisioning']['started_at'] = timezone.now().isoformat()
            org.metadata['provisioning']['error'] = None
        
        org.save(update_fields=['metadata', 'updated_at'])
        
        # Broadcast via Django Channels
        from channels.layers import get_channel_layer
        from asgiref.sync import async_to_sync
        
        channel_layer = get_channel_layer()
        if channel_layer:
            room_group_name = f"org_{org.id}_provisioning"
            
            if step == 'STARTING':
                event = {
                    'type': 'provisioning_started',
                    'organization_id': str(org.id),
                    'timestamp': timezone.now().isoformat()
                }
            elif step == 'COMPLETED':
                event = {
                    'type': 'provisioning_completed',
                    'organization_id': str(org.id),
                    'message': message,
                    'timestamp': timezone.now().isoformat()
                }
            elif step == 'FAILED':
                event = {
                    'type': 'provisioning_failed',
                    'organization_id': str(org.id),
                    'error': message,
                    'timestamp': timezone.now().isoformat()
                }
            else:
                event = {
                    'type': 'provisioning_step',
                    'organization_id': str(org.id),
                    'step': step,
                    'step_name': step_name,
                    'progress': progress_pct,
                    'message': message,
                    'timestamp': timezone.now().isoformat()
                }
                
            try:
                async_to_sync(channel_layer.group_send)(room_group_name, event)
            except Exception as e:
                self.logger.warning(f"Failed to send real-time WebSocket update: {e}")

    def _rollback_provisioning(self, organization_id, schema_name, error_message):
        """Drop schema, clean related records, and mark organization FAILED."""
        self.logger.warning(
            "Rolling back provisioning for organization %s (schema=%s)",
            organization_id, schema_name,
        )

        self.deprovision_organization(organization_id, reason=error_message)

        try:
            org = Organization.objects.get(id=organization_id)
            org.mark_failed(error_message=error_message)
            self._update_progress(
                org, 'FAILED', 'Provisioning Failed', 0, f"Error: {error_message}",
            )
        except Exception as exc:
            self.logger.error("Failed to update organization status during rollback: %s", exc)

    def _create_client_admin(self, org):
        """Create the default client admin user for the organization."""
        from django.contrib.auth import get_user_model
        from apps.accounts.models import Profile, UserPreference
        from django.conf import settings
        from django.core.mail import send_mail
        from django.template.loader import render_to_string
        import secrets

        # Ensure search path is pointing to public for global user creation
        with connection.cursor() as cursor:
            cursor.execute('SET search_path TO "public"')

        User = get_user_model()
        email = org.contact_email.lower().strip()

        # Check if client admin user already exists
        admin_user = User.objects.filter(email__iexact=email).first()
        if admin_user:
            self.logger.info(f"Client admin user with email {email} already exists. Skipping creation.")
            if admin_user.tenant_id != org.id:
                admin_user.tenant_id = org.id
                admin_user.save(update_fields=['tenant_id'])
            return admin_user

        # Generate a unique username
        username = email.split('@')[0]
        if User.objects.filter(username__iexact=username).exists():
            username = email

        # Generate a strong temporary password
        temp_password = secrets.token_urlsafe(12)

        # Create user
        admin_user = User.objects.create_user(
            email=email,
            username=username,
            tenant_id=org.id,
            password=temp_password,
            first_name='Admin',
            last_name='User',
            role=User.ROLE_CLIENT_ADMIN,
            is_active=True,
            is_verified=True,
            is_onboarded=True,
            is_staff=True
        )

        # Force password change at first login
        admin_user.password_change_required = True
        admin_user.save(update_fields=['password_change_required'])

        # Restore tenant schema search path before profile & preference creation
        schema_name = org.schema_name
        if schema_name:
            with connection.cursor() as cursor:
                cursor.execute(f'SET search_path TO "{schema_name}", public')

        # Create Profile and UserPreference
        Profile.objects.get_or_create(user=admin_user, defaults={'tenant_id': org.id})
        UserPreference.objects.get_or_create(user=admin_user, defaults={'tenant_id': org.id})

        # Send welcome email with temporary password
        try:
            subject = f'Welcome to Falcon PMS - {org.name}'
            context = {
                'user': admin_user,
                'company_name': org.name,
                'temp_password': temp_password,
                'dashboard_url': f"{getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')}/login",
                'setup_guide_url': f"{getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')}/docs/setup"
            }
            html_content = render_to_string('accounts/email/tenant_welcome.html', context)
            text_content = f"Welcome to Falcon PMS! Your login email is {email} and temporary password is {temp_password}."
            
            send_mail(
                subject=subject,
                message=text_content,
                from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@falconpms.com'),
                recipient_list=[email],
                html_message=html_content,
                fail_silently=False
            )
            self.logger.info(f"Welcome email sent successfully to {email}")
        except Exception as e:
            self.logger.error(f"Failed to send welcome email to {email}: {str(e)}")

        return admin_user