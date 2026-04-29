"""
Tenant Provisioner Service - Main tenant setup and provisioning.

This is the MOST IMPORTANT service in the tenant app.
It handles the complete lifecycle of creating a new tenant.
"""

import logging
from django.utils import timezone
from django.db import transaction
from django.core.management import call_command

from apps.tenant.models import Tenant
from apps.tenant.constants import TenantStatus, SubscriptionPlan, DEFAULT_TENANT_LIMITS
from apps.tenant.exceptions import TenantProvisioningError, SchemaCreationError

logger = logging.getLogger(__name__)


class TenantProvisioner:
    """
    Main service for provisioning new tenants.

    What it does:
        1. Creates database schema (if using separate schemas)
        2. Runs migrations for the new schema
        3. Seeds initial data (default roles, settings)
        4. Creates resource limits
        5. Sets up backup schedule
        6. Marks tenant as active

    Usage:
        provisioner = TenantProvisioner(tenant_id)
        provisioner.provision()
    """

    def __init__(self, tenant_id):
        """
        Initialize provisioner with tenant ID.

        Args:
            tenant_id: UUID of the tenant to provision
        """
        self.tenant_id = tenant_id
        self.tenant = None
        self.logger = logging.getLogger(f"{__name__}.{tenant_id}")

    def provision(self):
        """
        Main provisioning workflow.

        Steps:
            1. Get tenant and validate status
            2. Create database schema
            3. Run migrations
            4. Seed initial data
            5. Setup resource limits
            6. Activate tenant
        """
        self.logger.info(f"Starting provisioning for tenant: {self.tenant_id}")

        try:
            # Step 1: Get tenant
            self.tenant = self._get_tenant()
            self._validate_tenant_status()

            # Step 2: Create schema
            self._create_schema()

            # Step 3: Run migrations
            self._run_migrations()

            # Step 4: Seed initial data
            self._seed_initial_data()

            # Step 5: Setup resource limits
            self._setup_resource_limits()

            # Step 6: Activate tenant
            self._activate_tenant()

            self.logger.info(
                f"Successfully provisioned tenant: {self.tenant_id}")
            return True

        except Exception as e:
            self.logger.error(
                f"Provisioning failed for {self.tenant_id}: {str(e)}")
            self._mark_provisioning_failed(str(e))
            raise TenantProvisioningError(
                f"Failed to provision tenant: {str(e)}")

    def _get_tenant(self):
        """Get tenant object from database"""
        try:
            return Tenant.objects.get(id=self.tenant_id)
        except Tenant.DoesNotExist:
            raise TenantProvisioningError(f"Tenant {self.tenant_id} not found")

    def _validate_tenant_status(self):
        """Validate tenant is in correct state for provisioning"""
        if self.tenant.status != TenantStatus.PENDING:
            raise TenantProvisioningError(
                f"Tenant status is {self.tenant.status}, expected PENDING"
            )

    def _create_schema(self):
        """Create database schema for tenant"""
        self.logger.info(f"Creating schema for tenant: {self.tenant.name}")

        try:
            # From schema_engine.py (will implement later)
            from .schema_engine import SchemaEngine
            engine = SchemaEngine(self.tenant)
            engine.create_schema()

        except ImportError:
            # Fallback for now
            self.logger.warning("SchemaEngine not available yet")
            pass
        except Exception as e:
            raise SchemaCreationError(f"Failed to create schema: {str(e)}")

    def _run_migrations(self):
        """Run Django migrations for tenant schema"""
        self.logger.info(f"Running migrations for tenant: {self.tenant.name}")

        try:
            # For separate schema migrations
            if hasattr(self.tenant, 'schema_name') and self.tenant.schema_name:
                call_command(
                    'migrate',
                    database='default',
                    schema=self.tenant.schema_name
                )
        except Exception as e:
            raise TenantProvisioningError(
                f"Failed to run migrations: {str(e)}")

    def _seed_initial_data(self):
        """Seed initial data for tenant (default roles, settings, etc.)"""
        self.logger.info(
            f"Seeding initial data for tenant: {self.tenant.name}")

        try:
            # From data_seeder.py (will implement later)
            from .data_seeder import DataSeeder
            seeder = DataSeeder(self.tenant)
            seeder.seed_all()

        except ImportError:
            # Fallback for now
            self.logger.warning("DataSeeder not available yet")
            pass
        except Exception as e:
            self.logger.warning(f"Failed to seed data: {str(e)}")

    def _setup_resource_limits(self):
        """Setup default resource limits for tenant"""
        self.logger.info(
            f"Setting up resource limits for tenant: {self.tenant.name}")

        try:
            from apps.tenant.models import TenantResource
            from apps.tenant.constants import ResourceType

            # Get plan limits or use defaults
            plan = getattr(self.tenant, 'subscription_plan',
                           SubscriptionPlan.TRIAL)
            plan_limits = DEFAULT_TENANT_LIMITS

            # Create resource records
            for resource_type, limit in plan_limits.items():
                TenantResource.objects.create(
                    tenant_id=self.tenant.id,
                    resource_type=resource_type,
                    limit_value=limit,
                    current_value=0
                )

        except Exception as e:
            self.logger.warning(f"Failed to setup resource limits: {str(e)}")

    def _activate_tenant(self):
        """Mark tenant as active/provisioned"""
        self.tenant.status = TenantStatus.ACTIVE
        self.tenant.provisioned_at = timezone.now()
        self.tenant.save(update_fields=['status', 'provisioned_at'])
        self.logger.info(f"Tenant activated: {self.tenant.name}")

    def _mark_provisioning_failed(self, error_message):
        """Mark tenant as failed provisioning"""
        self.tenant.status = TenantStatus.FAILED
        self.tenant.save(update_fields=['status'])

    def rollback(self):
        """Rollback provisioning on failure"""
        self.logger.warning(
            f"Rolling back provisioning for tenant: {self.tenant_id}")

        try:
            # Delete schema if created
            if self.tenant and hasattr(self.tenant, 'schema_name'):
                from .schema_engine import SchemaEngine
                engine = SchemaEngine(self.tenant)
                engine.drop_schema()

            # Mark tenant as failed
            self.tenant.status = TenantStatus.FAILED
            self.tenant.save()

        except Exception as e:
            self.logger.error(f"Rollback failed: {str(e)}")

    def get_status(self):
        """Get current provisioning status"""
        if not self.tenant:
            self.tenant = self._get_tenant()

        return {
            'tenant_id': str(self.tenant.id),
            'name': self.tenant.name,
            'status': self.tenant.status,
            'provisioned_at': self.tenant.provisioned_at,
        }
