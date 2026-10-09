# apps/reportplt/management/commands/seed_report_settings.py
"""
Falcon PMS - Reporting Platform (reportplt)
Seed or refresh prebuilt templates, default templates, and reporting policies across all tenants.

Usage Examples:
    # 1. Seed prebuilt templates across all tenants
    python manage.py seed_report_settings --all-tenants

    # 2. Seed prebuilt templates for a specific tenant
    python manage.py seed_report_settings --tenant-id 275adb1f-8e12-46ee-b394-ea42d41b10c9
"""

from django.core.management.base import BaseCommand, CommandError
from django.db import connection

from apps.accounts.models import User
from apps.tenant.models import Organization, OrganizationSchema
from apps.reportplt.services.templates.prebuilt_templates import PrebuiltTemplates


class Command(BaseCommand):
    help = 'Seed canonical prebuilt templates and reporting defaults across tenants.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--tenant-id', '-t',
            type=str,
            default=None,
            help='Specific Tenant Organization ID'
        )
        parser.add_argument(
            '--all-tenants',
            action='store_true',
            default=False,
            help='Seed prebuilt templates across all active tenants'
        )

    def set_tenant_schema(self, tenant_id):
        schema_obj = OrganizationSchema.objects.filter(organization_id=tenant_id).first()
        if schema_obj:
            schema_name = schema_obj.schema_name
        else:
            try:
                org = Organization.objects.get(id=tenant_id)
                schema_name = f"org_{org.slug.replace('-', '_')}"
            except Exception:
                schema_name = 'public'

        with connection.cursor() as cursor:
            cursor.execute(f'SET search_path TO "{schema_name}", public')
        return schema_name

    def handle(self, *args, **options):
        all_tenants = options.get('all_tenants', False)
        tenant_id = options.get('tenant_id')

        if not all_tenants and not tenant_id:
            tenant_id = '275adb1f-8e12-46ee-b394-ea42d41b10c9'

        if all_tenants:
            orgs = Organization.objects.filter(is_active=True)
            self.stdout.write(self.style.MIGRATE_HEADING(f"Seeding report templates across {orgs.count()} active organizations..."))
            for org in orgs:
                try:
                    self.set_tenant_schema(org.id)
                    prebuilt = PrebuiltTemplates()
                    seeded = prebuilt.seed_prebuilt_templates(tenant_id=org.id)
                    self.stdout.write(self.style.SUCCESS(f"  [OK] Organization '{org.name}' ({org.id}): {len(seeded)} templates seeded."))
                except Exception as e:
                    self.stdout.write(self.style.WARNING(f"  [SKIPPED] Organization '{org.name}' ({org.id}): {str(e)}"))
        else:
            schema_name = self.set_tenant_schema(tenant_id)
            prebuilt = PrebuiltTemplates()
            seeded = prebuilt.seed_prebuilt_templates(tenant_id=tenant_id)
            self.stdout.write(self.style.SUCCESS(f"Successfully seeded {len(seeded)} templates for tenant '{tenant_id}' (Schema: {schema_name})."))
