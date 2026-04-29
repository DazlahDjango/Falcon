"""
Data Seeder Service - Seeds initial data for new tenants.

Populates default roles, permissions, settings, and other required data.
"""

import logging
from django.apps import apps
from django.core.management import call_command

logger = logging.getLogger(__name__)


class DataSeeder:
    """
    Seeds initial data for new tenants.

    What it seeds:
        - Default roles (Admin, Manager, Staff, ReadOnly)
        - Default settings and configurations
        - Default KPI categories if available
        - Default notification templates

    Usage:
        seeder = DataSeeder(tenant)
        seeder.seed_all()
    """

    def __init__(self, tenant):
        """
        Initialize data seeder with tenant.

        Args:
            tenant: Tenant object
        """
        self.tenant = tenant
        self.logger = logging.getLogger(f"{__name__}.{tenant.id}")

    def seed_all(self):
        """
        Seed all initial data for tenant.

        Returns:
            bool: True if successful
        """
        self.logger.info(
            f"Seeding initial data for tenant: {self.tenant.name}")

        try:
            self.seed_default_roles()
            self.seed_default_settings()
            self.seed_default_categories()
            self.seed_notification_templates()

            self.logger.info(
                f"Data seeding completed for tenant: {self.tenant.name}")
            return True

        except Exception as e:
            self.logger.error(f"Data seeding failed: {str(e)}")
            raise

    def seed_default_roles(self):
        """
        Seed default roles for tenant.

        Roles created:
            - Admin: Full access
            - Manager: Team access
            - Staff: Self access only
            - ReadOnly: View only
        """
        self.logger.info("Seeding default roles")

        try:
            Role = apps.get_model('accounts', 'Role')

            default_roles = [
                {'name': 'Admin', 'description': 'Full system access', 'level': 100},
                {'name': 'Manager', 'description': 'Team management access', 'level': 60},
                {'name': 'Staff', 'description': 'Self data access only', 'level': 30},
                {'name': 'ReadOnly', 'description': 'View only access', 'level': 10},
            ]

            for role_data in default_roles:
                Role.objects.get_or_create(
                    tenant_id=self.tenant.id,
                    name=role_data['name'],
                    defaults={
                        'description': role_data['description'],
                        'level': role_data['level'],
                    }
                )

        except LookupError:
            self.logger.warning("Role model not found - skipping role seeding")
        except Exception as e:
            self.logger.warning(f"Failed to seed roles: {str(e)}")

    def seed_default_settings(self):
        """
        Seed default settings for tenant.

        Settings include:
            - Timezone
            - Date format
            - Default rating scale
            - Review cycle settings
        """
        self.logger.info("Seeding default settings")

        try:
            Setting = apps.get_model('organisations', 'TenantSetting')

            default_settings = {
                'timezone': 'Africa/Nairobi',
                'date_format': 'YYYY-MM-DD',
                'rating_scale': '1-5',
                'review_cycle': 'quarterly',
                'kpi_approval_required': True,
                'notifications_enabled': True,
            }

            for key, value in default_settings.items():
                Setting.objects.get_or_create(
                    tenant_id=self.tenant.id,
                    setting_key=key,
                    defaults={'setting_value': value}
                )

        except LookupError:
            self.logger.warning(
                "Setting model not found - skipping settings seeding")
        except Exception as e:
            self.logger.warning(f"Failed to seed settings: {str(e)}")

    def seed_default_categories(self):
        """
        Seed default KPI categories for tenant.

        Categories include:
            - Financial
            - Operational
            - Customer
            - Employee
            - Growth
        """
        self.logger.info("Seeding default KPI categories")

        try:
            Category = apps.get_model('kpi', 'Category')

            default_categories = [
                {'name': 'Financial', 'description': 'Financial performance KPIs',
                    'color': '#10b981'},
                {'name': 'Operational',
                    'description': 'Operational efficiency KPIs', 'color': '#3b82f6'},
                {'name': 'Customer', 'description': 'Customer satisfaction KPIs',
                    'color': '#8b5cf6'},
                {'name': 'Employee', 'description': 'Employee performance KPIs',
                    'color': '#f59e0b'},
                {'name': 'Growth', 'description': 'Business growth KPIs',
                    'color': '#ef4444'},
            ]

            for cat_data in default_categories:
                Category.objects.get_or_create(
                    tenant_id=self.tenant.id,
                    name=cat_data['name'],
                    defaults={
                        'description': cat_data['description'],
                        'color': cat_data['color'],
                    }
                )

        except LookupError:
            self.logger.warning(
                "Category model not found - skipping category seeding")
        except Exception as e:
            self.logger.warning(f"Failed to seed categories: {str(e)}")

    def seed_notification_templates(self):
        """
        Seed default notification templates for tenant.
        """
        self.logger.info("Seeding notification templates")

        try:
            Template = apps.get_model('notifications', 'Template')

            default_templates = [
                {
                    'name': 'welcome_email',
                    'subject': 'Welcome to Falcon PMS',
                    'body': 'Welcome {{user_name}}! Your account has been created.',
                },
                {
                    'name': 'kpi_approval',
                    'subject': 'KPI Data Approval Required',
                    'body': 'KPI data for {{kpi_name}} needs your approval.',
                },
            ]

            for template_data in default_templates:
                Template.objects.get_or_create(
                    tenant_id=self.tenant.id,
                    name=template_data['name'],
                    defaults={
                        'subject': template_data['subject'],
                        'body': template_data['body'],
                    }
                )

        except LookupError:
            self.logger.warning(
                "Template model not found - skipping template seeding")
        except Exception as e:
            self.logger.warning(f"Failed to seed templates: {str(e)}")

    def seed_from_fixture(self, fixture_name):
        """
        Seed data from a fixture file.

        Args:
            fixture_name: Name of the fixture file (e.g., 'initial_data.json')
        """
        self.logger.info(f"Loading fixture: {fixture_name}")

        try:
            call_command('loaddata', fixture_name, tenant_id=self.tenant.id)
        except Exception as e:
            self.logger.warning(
                f"Failed to load fixture {fixture_name}: {str(e)}")
