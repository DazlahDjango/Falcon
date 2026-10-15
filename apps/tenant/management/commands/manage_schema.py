"""
Comprehensive Management Command for Falcon PMS Tenant Schemas.
Handles:
- Schema Lifecycle: list, info, create, provision, drop
- Security & Integrity: enable-rls, inspect-tables, stats

Usage:
    python manage.py manage_schema list --status ACTIVE
    python manage.py manage_schema info --schema-name org_globalapex
    python manage.py manage_schema info --org-id <uuid>
    python manage.py manage_schema create --org-id <uuid> --schema-name org_acme
    python manage.py manage_schema provision --schema-name org_acme
    python manage.py manage_schema drop --schema-name org_acme [--cascade] [--force]
    python manage.py manage_schema enable-rls --all
    python manage.py manage_schema enable-rls --org-id <uuid>
    python manage.py manage_schema stats --all
    python manage.py manage_schema inspect-tables --org-id <uuid>
"""

import sys
import json
from typing import Optional, List, Dict

if sys.stdout.encoding != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

from django.core.management.base import BaseCommand, CommandError
from django.db import connection, transaction
from django.utils import timezone
from django.db.models import Q

from apps.tenant.models import Organization, OrganizationSchema
from apps.tenant.services import SchemaService, OrganizationService
from apps.tenant.exceptions import SchemaError, OrganizationException


class Command(BaseCommand):
    help = 'Comprehensive management command for Falcon PMS Tenant PostgreSQL Schemas and RLS isolation.'

    def add_arguments(self, parser):
        subparsers = parser.add_subparsers(dest='action', required=True, help='Action to perform')

        # ---------------- LIST ----------------
        list_parser = subparsers.add_parser('list', help='List tenant schemas with filters')
        list_parser.add_argument('--status', '-s', type=str, help='Filter by status (PENDING, CREATING, ACTIVE, MIGRATING, FAILED, DELETED)')
        list_parser.add_argument('--ready', type=str, choices=['true', 'false'], help='Filter by is_ready flag')
        list_parser.add_argument('--org-id', '-i', type=str, help='Filter by Organization UUID')
        list_parser.add_argument('--search', '-q', type=str, help='Search term (schema name, org name)')
        list_parser.add_argument('--limit', '-l', type=int, default=50, help='Maximum rows to show (default: 50)')
        list_parser.add_argument('--json', action='store_true', help='Output results as JSON')

        # ---------------- INFO ----------------
        info_parser = subparsers.add_parser('info', help='Display detailed profile of a tenant schema')
        info_parser.add_argument('--schema-name', '-n', type=str, help='PostgreSQL Schema Name')
        info_parser.add_argument('--schema-id', type=str, help='Schema record UUID')
        info_parser.add_argument('--org-id', '-i', type=str, help='Organization UUID')
        info_parser.add_argument('--json', action='store_true', help='Output details as JSON')

        # ---------------- CREATE ----------------
        create_parser = subparsers.add_parser('create', help='Create a schema record in database')
        create_parser.add_argument('--org-id', '-i', type=str, required=True, help='Organization UUID')
        create_parser.add_argument('--schema-name', '-n', type=str, help='PostgreSQL schema name (auto-generated if omitted)')
        create_parser.add_argument('--provision', action='store_true', help='Immediately provision physical PostgreSQL schema')

        # ---------------- PROVISION ----------------
        prov_parser = subparsers.add_parser('provision', help='Physically create PostgreSQL schema and set permissions')
        prov_parser.add_argument('--schema-name', '-n', type=str, help='PostgreSQL Schema Name')
        prov_parser.add_argument('--schema-id', type=str, help='Schema record UUID')
        prov_parser.add_argument('--org-id', '-i', type=str, help='Organization UUID')

        # ---------------- DROP ----------------
        drop_parser = subparsers.add_parser('drop', help='Drop PostgreSQL schema and mark record deleted')
        drop_parser.add_argument('--schema-name', '-n', type=str, help='PostgreSQL Schema Name')
        drop_parser.add_argument('--schema-id', type=str, help='Schema record UUID')
        drop_parser.add_argument('--org-id', '-i', type=str, help='Organization UUID')
        drop_parser.add_argument('--cascade', action='store_true', default=True, help='Drop schema CASCADE (default: True)')
        drop_parser.add_argument('--force', action='store_true', help='Bypass confirmation prompt')

        # ---------------- ENABLE RLS ----------------
        rls_parser = subparsers.add_parser('enable-rls', help='Enforce Row-Level Security on tenant schema tables')
        rls_parser.add_argument('--schema-name', '-n', type=str, help='PostgreSQL Schema Name')
        rls_parser.add_argument('--schema-id', type=str, help='Schema record UUID')
        rls_parser.add_argument('--org-id', '-i', type=str, help='Organization UUID')
        rls_parser.add_argument('--all', action='store_true', help='Apply RLS across all active tenant schemas')

        # ---------------- STATS ----------------
        stats_parser = subparsers.add_parser('stats', help='Recalculate table count and disk size for tenant schemas')
        stats_parser.add_argument('--schema-name', '-n', type=str, help='PostgreSQL Schema Name')
        stats_parser.add_argument('--schema-id', type=str, help='Schema record UUID')
        stats_parser.add_argument('--org-id', '-i', type=str, help='Organization UUID')
        stats_parser.add_argument('--all', action='store_true', help='Recalculate stats for all active schemas')

        # ---------------- INSPECT TABLES ----------------
        inspect_parser = subparsers.add_parser('inspect-tables', help='Inspect PostgreSQL tables, columns, and rows in schema')
        inspect_parser.add_argument('--schema-name', '-n', type=str, help='PostgreSQL Schema Name')
        inspect_parser.add_argument('--org-id', '-i', type=str, help='Organization UUID')

    def handle(self, *args, **options):
        action = options['action']
        handler = getattr(self, f"handle_{action.replace('-', '_')}", None)
        if not handler:
            self.stdout.write(self.style.ERROR(f"Action '{action}' is not implemented."))
            return
        try:
            handler(options)
        except CommandError as e:
            self.stdout.write(self.style.ERROR(str(e)))
        except (SchemaError, OrganizationException) as e:
            self.stdout.write(self.style.ERROR(f"Schema Error: {str(e)}"))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error: {str(e)}"))

    def _resolve_schema(self, options) -> OrganizationSchema:
        schema_id = options.get('schema_id')
        schema_name = options.get('schema_name')
        org_id = options.get('org_id')

        qs = OrganizationSchema.objects.all_with_deleted().select_related('organization')
        if schema_id:
            try:
                return qs.get(id=schema_id)
            except OrganizationSchema.DoesNotExist:
                raise CommandError(f"Schema with ID '{schema_id}' does not exist.")
        elif schema_name:
            schema = qs.filter(schema_name__iexact=schema_name).first()
            if not schema:
                raise CommandError(f"Schema with name '{schema_name}' does not exist.")
            return schema
        elif org_id:
            schema = qs.filter(organization_id=org_id).first()
            if not schema:
                raise CommandError(f"No schema associated with Organization '{org_id}'.")
            return schema
        else:
            raise CommandError("Please specify --schema-name, --schema-id, or --org-id.")

    # ---------------- HANDLER IMPLEMENTATIONS ----------------

    def handle_list(self, options):
        status_filter = options.get('status')
        ready_filter = options.get('ready')
        org_id = options.get('org_id')
        search_query = options.get('search')
        limit = options.get('limit', 50)
        as_json = options.get('json', False)

        qs = OrganizationSchema.objects.filter(is_deleted=False).select_related('organization').order_by('-created_at')

        if status_filter:
            qs = qs.filter(status=status_filter.upper())
        if ready_filter is not None:
            qs = qs.filter(is_ready=(ready_filter.lower() == 'true'))
        if org_id:
            qs = qs.filter(organization_id=org_id)
        if search_query:
            qs = qs.filter(
                Q(schema_name__icontains=search_query) |
                Q(organization__name__icontains=search_query) |
                Q(organization__slug__icontains=search_query)
            )

        total_count = qs.count()
        schemas = list(qs[:limit])

        if as_json:
            data = [
                {
                    'id': str(s.id),
                    'schema_name': s.schema_name,
                    'organization_id': str(s.organization_id),
                    'organization_name': s.organization.name if s.organization else None,
                    'status': s.status,
                    'is_ready': s.is_ready,
                    'table_count': s.table_count,
                    'size_mb': float(s.size_mb or 0),
                    'created_at': s.created_at.isoformat() if s.created_at else None,
                }
                for s in schemas
            ]
            self.stdout.write(json.dumps({'total': total_count, 'results': data}, indent=2))
            return

        self.stdout.write("\n" + "=" * 110)
        self.stdout.write(self.style.SUCCESS(f" TENANT POSTGRESQL SCHEMAS ({len(schemas)} of {total_count} total)"))
        self.stdout.write("=" * 110)
        header = f"{'Schema Name':<28} {'Organization':<28} {'Status':<14} {'Ready':<8} {'Tables':<10} {'Size (MB)':<12}"
        self.stdout.write(header)
        self.stdout.write("-" * 110)

        for s in schemas:
            org_name = s.organization.name if s.organization else "Unassigned"
            status_style = self.style.SUCCESS if s.status == 'ACTIVE' else (self.style.ERROR if s.status == 'FAILED' else self.style.WARNING)
            ready_str = self.style.SUCCESS("Yes") if s.is_ready else self.style.WARNING("No")
            size_str = f"{(s.size_mb or 0):.2f}"

            self.stdout.write(
                f"{s.schema_name[:26]:<28} {org_name[:26]:<28} [{status_style(s.status):<12}] "
                f"{ready_str:<16} {s.table_count:<10} {size_str:<12}"
            )

        self.stdout.write("-" * 110 + "\n")

    def handle_info(self, options):
        schema = self._resolve_schema(options)
        as_json = options.get('json', False)

        # Check physical existence in PostgreSQL
        with connection.cursor() as cursor:
            cursor.execute("SELECT EXISTS(SELECT 1 FROM pg_namespace WHERE nspname = %s)", [schema.schema_name])
            pg_exists = cursor.fetchone()[0]

            cursor.execute("""
                SELECT COUNT(*), COALESCE(SUM(pg_total_relation_size('"' || schemaname || '"."' || tablename || '"')), 0)
                FROM pg_tables WHERE schemaname = %s
            """, [schema.schema_name])
            pg_table_count, pg_size_bytes = cursor.fetchone()
            pg_size_mb = float(pg_size_bytes or 0) / (1024.0 * 1024.0)

            # Check RLS enabled count
            cursor.execute("""
                SELECT COUNT(*) FROM pg_tables t
                JOIN pg_class c ON c.relname = t.tablename
                JOIN pg_namespace n ON n.oid = c.relnamespace AND n.nspname = t.schemaname
                WHERE t.schemaname = %s AND c.relrowsecurity = true
            """, [schema.schema_name])
            rls_table_count = cursor.fetchone()[0]

        if as_json:
            data = {
                'id': str(schema.id),
                'schema_name': schema.schema_name,
                'organization_id': str(schema.organization_id),
                'organization_name': schema.organization.name if schema.organization else None,
                'status': schema.status,
                'is_ready': schema.is_ready,
                'tracked_table_count': schema.table_count,
                'tracked_size_mb': float(schema.size_mb or 0),
                'physical_exists': pg_exists,
                'physical_table_count': pg_table_count,
                'physical_size_mb': round(pg_size_mb, 2),
                'rls_protected_tables': rls_table_count,
                'created_at': schema.created_at.isoformat() if schema.created_at else None,
                'updated_at': schema.updated_at.isoformat() if schema.updated_at else None,
            }
            self.stdout.write(json.dumps(data, indent=2))
            return

        self.stdout.write("\n" + "=" * 70)
        self.stdout.write(self.style.SUCCESS(f" TENANT SCHEMA REPORT: {schema.schema_name}"))
        self.stdout.write("=" * 70)
        self.stdout.write(f"  Schema ID:             {schema.id}")
        self.stdout.write(f"  Organization:          {schema.organization.name if schema.organization else 'N/A'} ({schema.organization_id})")
        self.stdout.write(f"  Record Status:         {schema.status} (Ready: {schema.is_ready})")
        self.stdout.write(f"  PostgreSQL Physical:   {'EXISTS' if pg_exists else 'NOT FOUND'}")
        self.stdout.write(f"  Physical Table Count:  {pg_table_count}")
        self.stdout.write(f"  Physical Schema Size:  {pg_size_mb:.2f} MB")
        self.stdout.write(f"  RLS Protected Tables:  {rls_table_count} of {pg_table_count}")
        self.stdout.write(f"  Created At:            {schema.created_at}")
        self.stdout.write("=" * 70 + "\n")

    def handle_create(self, options):
        org_id = options['org_id']
        schema_name = options.get('schema_name')
        provision_now = options.get('provision', False)

        try:
            org = Organization.objects.get(id=org_id)
        except Organization.DoesNotExist:
            raise CommandError(f"Organization '{org_id}' not found.")

        if not schema_name:
            schema_name = f"org_{org.slug.replace('-', '_')}"

        service = SchemaService()
        self.stdout.write(f"Creating schema record '{schema_name}' for '{org.name}'...")
        try:
            schema = service.create_schema(org.id, schema_name)
            self.stdout.write(self.style.SUCCESS(f"Created schema record '{schema.schema_name}' (ID: {schema.id})."))

            if provision_now:
                self.stdout.write(f"Provisioning physical schema '{schema.schema_name}'...")
                service.provision_schema(schema.id)
                self.stdout.write(self.style.SUCCESS(f"Successfully provisioned schema '{schema.schema_name}'."))
        except SchemaError as e:
            raise CommandError(str(e))

    def handle_provision(self, options):
        schema = self._resolve_schema(options)
        service = SchemaService()
        self.stdout.write(f"Provisioning PostgreSQL schema '{schema.schema_name}'...")
        try:
            res = service.provision_schema(schema.id)
            self.stdout.write(self.style.SUCCESS(f"Successfully provisioned schema '{res.schema_name}' (Status: {res.status})."))
        except SchemaError as e:
            raise CommandError(str(e))

    def handle_drop(self, options):
        schema = self._resolve_schema(options)
        cascade = options.get('cascade', True)
        force = options.get('force', False)

        if not force:
            confirm = input(f"Are you sure you want to DROP schema '{schema.schema_name}' (ALL DATA WILL BE DESTROYED)? [y/N]: ")
            if confirm.lower() != 'y':
                self.stdout.write("Operation cancelled.")
                return

        service = SchemaService()
        self.stdout.write(f"Dropping schema '{schema.schema_name}'...")
        try:
            service.drop_schema(schema.id)
            self.stdout.write(self.style.SUCCESS(f"Dropped schema '{schema.schema_name}'."))
        except SchemaError as e:
            raise CommandError(str(e))

    def handle_enable_rls(self, options):
        run_all = options.get('all', False)
        service = SchemaService()

        if run_all:
            schemas = OrganizationSchema.objects.filter(is_ready=True, is_deleted=False)
            self.stdout.write(f"Applying RLS policies to {schemas.count()} active tenant schema(s)...")
            success_count = 0
            for s in schemas:
                try:
                    res = service.enable_rls(s.id)
                    self.stdout.write(self.style.SUCCESS(f"  [OK] {s.schema_name}: Protected {res['tables_protected']} table(s)"))
                    success_count += 1
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"  [FAILED] {s.schema_name}: {str(e)}"))
            self.stdout.write(self.style.SUCCESS(f"Completed RLS enforcement: {success_count}/{schemas.count()} successful."))
        else:
            schema = self._resolve_schema(options)
            try:
                res = service.enable_rls(schema.id)
                self.stdout.write(self.style.SUCCESS(f"RLS enabled on '{res['schema']}': {res['tables_protected']} tables protected."))
            except SchemaError as e:
                raise CommandError(str(e))

    def handle_stats(self, options):
        run_all = options.get('all', False)
        service = SchemaService()

        if run_all:
            schemas = OrganizationSchema.objects.filter(is_ready=True, is_deleted=False)
            self.stdout.write(f"Updating stats for {schemas.count()} active schema(s)...")
            for s in schemas:
                updated = service.update_schema_stats(s.id)
                self.stdout.write(f"  - {s.schema_name}: {updated.table_count} tables, {(updated.size_mb or 0):.2f} MB")
            self.stdout.write(self.style.SUCCESS("Schema stats updated."))
        else:
            schema = self._resolve_schema(options)
            updated = service.update_schema_stats(schema.id)
            self.stdout.write(self.style.SUCCESS(f"Updated stats for '{schema.schema_name}': {updated.table_count} tables, {(updated.size_mb or 0):.2f} MB"))

    def handle_inspect_tables(self, options):
        schema_name = options.get('schema_name')
        org_id = options.get('org_id')

        if not schema_name and org_id:
            schema = OrganizationSchema.objects.filter(organization_id=org_id).first()
            if not schema:
                raise CommandError(f"No schema found for organization '{org_id}'.")
            schema_name = schema.schema_name
        elif not schema_name:
            raise CommandError("Please specify --schema-name or --org-id.")

        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT 
                    t.tablename,
                    c.reltuples::bigint AS estimated_rows,
                    pg_total_relation_size('"' || t.schemaname || '"."' || t.tablename || '"') AS size_bytes,
                    c.relrowsecurity AS has_rls
                FROM pg_tables t
                JOIN pg_class c ON c.relname = t.tablename
                JOIN pg_namespace n ON n.oid = c.relnamespace AND n.nspname = t.schemaname
                WHERE t.schemaname = %s
                ORDER BY size_bytes DESC
            """, [schema_name])
            rows = cursor.fetchall()

        if not rows:
            self.stdout.write(self.style.WARNING(f"No tables found in PostgreSQL schema '{schema_name}'."))
            return

        self.stdout.write("\n" + "=" * 85)
        self.stdout.write(self.style.SUCCESS(f" TABLES IN SCHEMA: {schema_name} ({len(rows)} total)"))
        self.stdout.write("=" * 85)
        self.stdout.write(f"{'Table Name':<38} {'Est. Rows':<14} {'Size (KB)':<14} {'RLS Enforced'}")
        self.stdout.write("-" * 85)

        for tablename, est_rows, size_bytes, has_rls in rows:
            size_kb = float(size_bytes or 0) / 1024.0
            rls_str = self.style.SUCCESS("YES") if has_rls else self.style.WARNING("NO")
            self.stdout.write(f"{tablename:<38} {est_rows:<14} {size_kb:<14.1f} {rls_str}")

        self.stdout.write("-" * 85 + "\n")
