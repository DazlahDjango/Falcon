import traceback
from django.core.management.base import BaseCommand, CommandError
from apps.tenant.models import Organization, OrganizationSchema
from apps.tenant.services import SchemaService


class Command(BaseCommand):
    help = 'Manage PostgreSQL tenant organization schemas (provision, drop, stats, enable-rls, status)'

    def add_arguments(self, parser):
        parser.add_argument(
            'action',
            type=str,
            choices=['provision', 'drop', 'stats', 'enable-rls', 'status'],
            help='Action to perform: provision, drop, stats, enable-rls, status'
        )
        parser.add_argument(
            '--org-id',
            type=str,
            help='Organization UUID (required unless --all-tenants is specified)'
        )
        parser.add_argument(
            '--all-tenants',
            action='store_true',
            default=False,
            help='Run the action across all active tenant organizations'
        )

    def handle(self, *args, **options):
        action = options['action']
        org_id = options.get('org_id')
        all_tenants = options.get('all-tenants', False) or options.get('all_tenants', False)

        service = SchemaService()

        if not org_id and not all_tenants:
            raise CommandError("Either --org-id <uuid> or --all-tenants must be specified.")

        if org_id and all_tenants:
            raise CommandError("Cannot specify both --org-id and --all-tenants.")

        if all_tenants:
            target_orgs = list(Organization.objects.filter(is_deleted=False))
            if not target_orgs:
                self.stdout.write(self.style.WARNING("No organizations found."))
                return
        else:
            try:
                org = Organization.objects.get(id=org_id, is_deleted=False)
                target_orgs = [org]
            except Organization.DoesNotExist:
                raise CommandError(f"Organization '{org_id}' not found.")

        if action == 'status':
            self.stdout.write("\nTenant Schema Status Report:")
            self.stdout.write("-" * 80)
            self.stdout.write(f"{'Organization':<25} {'Schema Name':<35} {'Status':<12} {'Tables':<8} {'Size (MB)':<10}")
            self.stdout.write("-" * 80)
            for org in target_orgs:
                try:
                    schema = org.schema
                    status_style = self.style.SUCCESS if schema.status == 'ACTIVE' else self.style.WARNING
                    if schema.status == 'FAILED':
                        status_style = self.style.ERROR
                    self.stdout.write(
                        f"{org.name:<25} {schema.schema_name:<35} [{status_style(schema.status):<10}] {schema.table_count:<8} {schema.size_mb:.2f} MB"
                    )
                except OrganizationSchema.DoesNotExist:
                    self.stdout.write(f"{org.name:<25} {'[NO SCHEMA]':<35} [{self.style.WARNING('NONE'):<10}] 0        0.00 MB")
            self.stdout.write("-" * 80)

        elif action == 'provision':
            for org in target_orgs:
                self.stdout.write(f"Provisioning schema for organization '{org.name}' ({org.id})...")
                try:
                    schema, created = OrganizationSchema.objects.get_or_create(
                        organization=org,
                        defaults={'schema_name': f"org_{str(org.id).replace('-', '_')}", 'status': 'PENDING'}
                    )
                    if schema.status == 'ACTIVE':
                        self.stdout.write(self.style.SUCCESS(f"  [OK] Schema '{schema.schema_name}' is already ACTIVE."))
                        continue
                    if schema.status != 'PENDING':
                        schema.status = 'PENDING'
                        schema.save(update_fields=['status'])

                    res = service.provision_schema(schema.id)
                    self.stdout.write(self.style.SUCCESS(
                        f"  Successfully provisioned schema '{res.schema_name}' ({res.table_count} tables, {res.size_mb:.2f} MB)"
                    ))
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"  Provisioning failed for '{org.name}': {str(e)}"))

        elif action == 'stats':
            for org in target_orgs:
                try:
                    schema = org.schema
                    res = service.update_schema_stats(schema.id)
                    self.stdout.write(self.style.SUCCESS(
                        f"Updated stats for '{org.name}' ({res.schema_name}): {res.table_count} tables, {res.size_mb:.2f} MB"
                    ))
                except OrganizationSchema.DoesNotExist:
                    self.stdout.write(self.style.WARNING(f"Organization '{org.name}' has no schema record."))

        elif action == 'enable-rls':
            for org in target_orgs:
                try:
                    schema = org.schema
                    res = service.enable_rls(schema.id)
                    self.stdout.write(self.style.SUCCESS(
                        f"Enabled RLS for '{org.name}' ({res['schema']}): Protected {res['tables_protected']} table(s)"
                    ))
                except OrganizationSchema.DoesNotExist:
                    self.stdout.write(self.style.WARNING(f"Organization '{org.name}' has no schema record."))
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"Failed to enable RLS for '{org.name}': {str(e)}"))

        elif action == 'drop':
            if len(target_orgs) > 1:
                raise CommandError("Schema drop action can only be run for a single organization (--org-id).")
            org = target_orgs[0]
            try:
                schema = org.schema
                self.stdout.write(self.style.WARNING(f"Dropping schema '{schema.schema_name}' CASCADE for '{org.name}'..."))
                res = service.drop_schema(schema.id)
                self.stdout.write(self.style.SUCCESS(f"Successfully dropped schema '{res.schema_name}'."))
            except OrganizationSchema.DoesNotExist:
                raise CommandError(f"Organization '{org.name}' has no schema record.")
