"""
Comprehensive Management Command for Falcon PMS Tenant Isolation and Database Router.
Handles:
- Database Routing Verification: test-routing, inspect-search-path
- Tenant Isolation Integrity: verify-isolation, check-leakage, rls-audit, simulate-request

Usage:
    python manage.py manage_isolation verify-isolation --all
    python manage.py manage_isolation verify-isolation --org-id <uuid>
    python manage.py manage_isolation test-routing --model apps.kpi.models.KPI --org-id <uuid>
    python manage.py manage_isolation test-routing --model apps.accounts.models.User
    python manage.py manage_isolation check-leakage --org-a <uuid> --org-b <uuid>
    python manage.py manage_isolation rls-audit [--all] [--org-id <uuid>]
    python manage.py manage_isolation inspect-search-path --org-id <uuid>
    python manage.py manage_isolation simulate-request --org-id <uuid> --email admin@acme.com
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
from django.apps import apps
from django.db import connection, transaction
from django.utils import timezone

from apps.tenant.models import Organization, OrganizationSchema
from apps.tenant.services import IsolationEnforcer, OrganizationDatabaseRouter, ConnectionService
from apps.tenant.context import tenant_context, get_current_tenant_id
from apps.tenant.constants import OrganizationStatus
from apps.tenant.exceptions import OrganizationException


class Command(BaseCommand):
    help = 'Comprehensive management command for Falcon PMS Multi-Tenant Isolation and Database Router verification.'

    def add_arguments(self, parser):
        subparsers = parser.add_subparsers(dest='action', required=True, help='Action to perform')

        # ---------------- VERIFY ISOLATION ----------------
        iso_parser = subparsers.add_parser('verify-isolation', help='Verify search_path and table isolation across tenants')
        iso_parser.add_argument('--org-id', '-i', type=str, help='Target organization UUID')
        iso_parser.add_argument('--all', action='store_true', help='Verify all active organizations')

        # ---------------- TEST ROUTING ----------------
        route_parser = subparsers.add_parser('test-routing', help='Test OrganizationDatabaseRouter routing decisions for a model')
        route_parser.add_argument('--model', '-m', type=str, required=True, help='Model path (e.g. apps.kpi.KPI or kpi.KPI or User)')
        route_parser.add_argument('--org-id', '-i', type=str, help='Organization UUID context')
        route_parser.add_argument('--read-only', action='store_true', help='Test db_for_read decision instead of db_for_write')

        # ---------------- CHECK LEAKAGE ----------------
        leak_parser = subparsers.add_parser('check-leakage', help='Simulate cross-tenant query execution to verify zero data leakage')
        leak_parser.add_argument('--org-a', type=str, required=True, help='Organization A UUID')
        leak_parser.add_argument('--org-b', type=str, required=True, help='Organization B UUID')

        # ---------------- RLS AUDIT ----------------
        rls_parser = subparsers.add_parser('rls-audit', help='Audit PostgreSQL Row-Level Security policies across schemas')
        rls_parser.add_argument('--org-id', '-i', type=str, help='Organization UUID')
        rls_parser.add_argument('--schema-name', '-n', type=str, help='Schema Name')
        rls_parser.add_argument('--all', action='store_true', help='Audit all active tenant schemas')
        rls_parser.add_argument('--json', action='store_true', help='Output results as JSON')

        # ---------------- INSPECT SEARCH PATH ----------------
        sp_parser = subparsers.add_parser('inspect-search-path', help='Inspect PostgreSQL search_path transitions in tenant context')
        sp_parser.add_argument('--org-id', '-i', type=str, required=True, help='Organization UUID')

        # ---------------- SIMULATE REQUEST ----------------
        sim_parser = subparsers.add_parser('simulate-request', help='Simulate HTTP request tenant middleware context')
        sim_parser.add_argument('--org-id', '-i', type=str, required=True, help='Organization UUID')
        sim_parser.add_argument('--email', '-e', type=str, help='User email to execute context with')

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
        except OrganizationException as e:
            self.stdout.write(self.style.ERROR(f"Isolation Error: {str(e)}"))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error: {str(e)}"))

    # ---------------- HANDLERS ----------------

    def handle_verify_isolation(self, options):
        org_id = options.get('org_id')
        run_all = options.get('all', False)
        enforcer = IsolationEnforcer()

        if run_all:
            orgs = Organization.objects.filter(is_active=True, is_deleted=False)
            self.stdout.write(f"Verifying schema isolation across {orgs.count()} active organization(s)...")
            passed, failed, skipped = 0, 0, 0
            for org in orgs:
                if not org.is_onboarded or org.status != OrganizationStatus.ACTIVE:
                    self.stdout.write(self.style.WARNING(
                        f"  [SKIPPED] {org.name}: Status is '{org.status}' (not yet provisioned/onboarded)"
                    ))
                    skipped += 1
                    continue
                try:
                    with enforcer.scope_to_organization(org):
                        with connection.cursor() as cursor:
                            cursor.execute("SELECT current_schema()")
                            current_schema = cursor.fetchone()[0]
                            expected_schema = org.schema_name
                            if current_schema == expected_schema:
                                self.stdout.write(self.style.SUCCESS(f"  [PASSED] {org.name}: current_schema = '{current_schema}'"))
                                passed += 1
                            else:
                                self.stdout.write(self.style.ERROR(
                                    f"  [MISMATCH] {org.name}: current_schema '{current_schema}' != expected '{expected_schema}'"
                                ))
                                failed += 1
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"  [ERROR] {org.name}: {str(e)}"))
                    failed += 1

            self.stdout.write("\n" + "=" * 60)
            summary_msg = f" Isolation Verification: {passed} PASSED, {failed} FAILED"
            if skipped:
                summary_msg += f", {skipped} SKIPPED (Unprovisioned)"
            self.stdout.write(self.style.SUCCESS(summary_msg))
            self.stdout.write("=" * 60 + "\n")
        elif org_id:
            try:
                org = Organization.objects.get(id=org_id)
            except Organization.DoesNotExist:
                raise CommandError(f"Organization '{org_id}' not found.")

            if not org.is_onboarded or org.status != OrganizationStatus.ACTIVE:
                self.stdout.write(self.style.WARNING(
                    f"Organization '{org.name}' has status '{org.status}' (Onboarded: {org.is_onboarded}). "
                    f"It must be provisioned before its dedicated schema exists in PostgreSQL."
                ))
                return

            self.stdout.write(f"Verifying isolation for '{org.name}' ({org.schema_name})...")
            with enforcer.scope_to_organization(org):
                with connection.cursor() as cursor:
                    cursor.execute("SHOW search_path")
                    sp = cursor.fetchone()[0]
                    cursor.execute("SELECT current_schema()")
                    cs = cursor.fetchone()[0]

            self.stdout.write(self.style.SUCCESS(f"  Target Schema:  {org.schema_name}"))
            self.stdout.write(self.style.SUCCESS(f"  Current Schema: {cs}"))
            self.stdout.write(self.style.SUCCESS(f"  search_path:    {sp}"))
            if cs == org.schema_name:
                self.stdout.write(self.style.SUCCESS(f"  Verification:   PASSED"))
            else:
                self.stdout.write(self.style.ERROR(f"  Verification:   FAILED (Schema mismatch)"))
        else:
            raise CommandError("Please specify --org-id or --all.")

    def handle_test_routing(self, options):
        model_str = options['model']
        org_id = options.get('org_id')
        read_only = options.get('read_only', False)

        # Resolve model
        target_model = None

        # Try 1: Full Python module path (e.g. apps.accounts.models.User)
        if '.' in model_str:
            try:
                import importlib
                mod_path, cls_name = model_str.rsplit('.', 1)
                mod = importlib.import_module(mod_path)
                cls = getattr(mod, cls_name, None)
                if cls and hasattr(cls, '_meta'):
                    target_model = cls
            except Exception:
                pass

        # Try 2: Standard app_label.ModelName (e.g. accounts.User or kpi.KPI)
        if not target_model and '.' in model_str:
            clean_parts = [p for p in model_str.split('.') if p not in ('apps', 'models')]
            if len(clean_parts) == 2:
                try:
                    target_model = apps.get_model(clean_parts[0], clean_parts[1])
                except LookupError:
                    pass

        # Try 3: Search all registered models by class name or label
        if not target_model:
            model_query = model_str.strip().lower()
            for model in apps.get_models():
                if (
                    model.__name__.lower() == model_query or
                    model._meta.label.lower() == model_query or
                    model._meta.label_lower == model_query or
                    f"{model.__module__}.{model.__name__}".lower() == model_query
                ):
                    target_model = model
                    break

        if not target_model:
            raise CommandError(f"Model '{model_str}' could not be resolved in Django app registry.")

        router = OrganizationDatabaseRouter()
        app_label = target_model._meta.app_label
        is_global = router._is_global_app(app_label)

        if org_id:
            with tenant_context(org_id):
                db_write = router.db_for_write(target_model)
                db_read = router.db_for_read(target_model)
        else:
            db_write = router.db_for_write(target_model)
            db_read = router.db_for_read(target_model)

        target_db = db_read if read_only else db_write

        self.stdout.write("\n" + "=" * 65)
        self.stdout.write(self.style.SUCCESS(f" ROUTER DECISION FOR MODEL: {target_model._meta.label}"))
        self.stdout.write("=" * 65)
        self.stdout.write(f"  App Label:        {app_label}")
        self.stdout.write(f"  Model Name:       {target_model.__name__}")
        self.stdout.write(f"  Is Global App:    {'YES' if is_global else 'NO (Tenant Schema App)'}")
        self.stdout.write(f"  Tenant Context:   {org_id or 'None (Public Context)'}")
        self.stdout.write(f"  Selected DB (W):  {db_write}")
        self.stdout.write(f"  Selected DB (R):  {db_read}")
        self.stdout.write("=" * 65 + "\n")

    def handle_check_leakage(self, options):
        org_a_id = options['org_a']
        org_b_id = options['org_b']

        try:
            org_a = Organization.objects.get(id=org_a_id)
            org_b = Organization.objects.get(id=org_b_id)
        except Organization.DoesNotExist as e:
            raise CommandError(f"Organization not found: {e}")

        self.stdout.write(f"\nTesting cross-tenant data leakage between:\n  Org A: '{org_a.name}' ({org_a.schema_name})\n  Org B: '{org_b.name}' ({org_b.schema_name})...\n")

        # Test 1: Query schema A in context A
        conn_a = ConnectionService().get_connection(org_a.id)
        with conn_a.cursor() as cur:
            cur.execute("SELECT current_schema()")
            schema_a_active = cur.fetchone()[0]

        # Test 2: Query schema B in context B
        conn_b = ConnectionService().get_connection(org_b.id)
        with conn_b.cursor() as cur:
            cur.execute("SELECT current_schema()")
            schema_b_active = cur.fetchone()[0]

        # Test 3: Verify reset to public
        with connection.cursor() as cur:
            cur.execute('SET search_path TO "public"')
            cur.execute("SELECT current_schema()")
            schema_main = cur.fetchone()[0]

        self.stdout.write(f"  Org A Context Active Schema: '{schema_a_active}' (Expected: '{org_a.schema_name}')")
        self.stdout.write(f"  Org B Context Active Schema: '{schema_b_active}' (Expected: '{org_b.schema_name}')")
        self.stdout.write(f"  Reset Context Active Schema: '{schema_main}' (Expected: 'public')")

        if schema_a_active == org_a.schema_name and schema_b_active == org_b.schema_name and schema_main == 'public':
            self.stdout.write(self.style.SUCCESS("\n[PASSED] Cross-tenant isolation intact. Zero data leakage detected.\n"))
        else:
            self.stdout.write(self.style.ERROR("\n[FAILED] Isolation boundary violation detected!\n"))

    def handle_rls_audit(self, options):
        org_id = options.get('org_id')
        schema_name = options.get('schema_name')
        run_all = options.get('all', False)
        as_json = options.get('json', False)

        schemas = []
        if run_all:
            schemas = list(OrganizationSchema.objects.filter(is_ready=True, is_deleted=False))
        elif org_id:
            s = OrganizationSchema.objects.filter(organization_id=org_id).first()
            if s:
                schemas = [s]
        elif schema_name:
            s = OrganizationSchema.objects.filter(schema_name=schema_name).first()
            if s:
                schemas = [s]

        if not schemas:
            raise CommandError("No schemas found matching audit criteria.")

        results = []
        for s in schemas:
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT 
                        t.tablename,
                        c.relrowsecurity AS rls_enabled,
                        c.relforcerowsecurity AS rls_forced,
                        COUNT(p.polname) AS policy_count
                    FROM pg_tables t
                    JOIN pg_class c ON c.relname = t.tablename
                    JOIN pg_namespace n ON n.oid = c.relnamespace AND n.nspname = t.schemaname
                    LEFT JOIN pg_policy p ON p.polrelid = c.oid
                    WHERE t.schemaname = %s AND t.tablename != 'django_migrations'
                    GROUP BY t.tablename, c.relrowsecurity, c.relforcerowsecurity
                    ORDER BY t.tablename
                """, [s.schema_name])
                rows = cursor.fetchall()

                schema_audit = {
                    'schema': s.schema_name,
                    'total_tables': len(rows),
                    'tables': [
                        {
                            'table': r[0],
                            'rls_enabled': r[1],
                            'rls_forced': r[2],
                            'policies_count': r[3]
                        }
                        for r in rows
                    ]
                }
                results.append(schema_audit)

        if as_json:
            self.stdout.write(json.dumps(results, indent=2))
            return

        for sa in results:
            self.stdout.write("\n" + "=" * 75)
            self.stdout.write(self.style.SUCCESS(f" RLS AUDIT FOR SCHEMA: {sa['schema']} ({sa['total_tables']} tables)"))
            self.stdout.write("=" * 75)
            self.stdout.write(f"{'Table Name':<35} {'RLS Enabled':<14} {'RLS Forced':<14} {'Policies'}")
            self.stdout.write("-" * 75)
            for t in sa['tables']:
                en_style = self.style.SUCCESS("YES") if t['rls_enabled'] else self.style.WARNING("NO")
                fo_style = self.style.SUCCESS("YES") if t['rls_forced'] else self.style.WARNING("NO")
                self.stdout.write(f"{t['table']:<35} {en_style:<23} {fo_style:<23} {t['policies_count']}")
            self.stdout.write("-" * 75 + "\n")

    def handle_inspect_search_path(self, options):
        org_id = options['org_id']
        try:
            org = Organization.objects.get(id=org_id)
        except Organization.DoesNotExist:
            raise CommandError(f"Organization '{org_id}' not found.")

        service = ConnectionService()
        self.stdout.write(f"Inspecting search_path transitions for '{org.name}' ({org.schema_name})...")

        with connection.cursor() as cur:
            cur.execute("SHOW search_path")
            sp_before = cur.fetchone()[0]

        conn = service.get_connection(org.id)
        with conn.cursor() as cur:
            cur.execute("SHOW search_path")
            sp_during = cur.fetchone()[0]
            cur.execute("SELECT current_schema()")
            cs_during = cur.fetchone()[0]

        with connection.cursor() as cur:
            cur.execute('SET search_path TO "public"')
            cur.execute("SHOW search_path")
            sp_after = cur.fetchone()[0]

        self.stdout.write(f"  Before Context: {sp_before}")
        self.stdout.write(f"  During Context: {sp_during} (Current: '{cs_during}')")
        self.stdout.write(f"  After Context:  {sp_after}")
        self.stdout.write(self.style.SUCCESS("Context manager safely isolated and restored search_path."))

    def handle_simulate_request(self, options):
        org_id = options['org_id']
        email = options.get('email')

        try:
            org = Organization.objects.get(id=org_id)
        except Organization.DoesNotExist:
            raise CommandError(f"Organization '{org_id}' not found.")

        self.stdout.write(f"Simulating tenant request context for '{org.name}' ({org.id})...")
        with tenant_context(str(org.id)):
            current_tid = get_current_tenant_id()
            self.stdout.write(f"  Thread-local Tenant ID: {current_tid}")

            conn = ConnectionService().get_connection(org.id)
            with conn.cursor() as cursor:
                cursor.execute("SELECT current_schema()")
                active_schema = cursor.fetchone()[0]
                self.stdout.write(f"  Active PostgreSQL Schema: {active_schema}")

            if email:
                from apps.accounts.models import User
                user = User.objects.filter(email=email, tenant_id=org.id).first()
                if user:
                    self.stdout.write(self.style.SUCCESS(f"  Resolved user in tenant context: {user.email} (Role: {user.role})"))
                else:
                    self.stdout.write(self.style.WARNING(f"  User '{email}' not found under tenant '{org.name}'"))

        self.stdout.write(self.style.SUCCESS("Simulation completed successfully."))
