import sys
import json

if sys.stdout.encoding != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

from django.core.management.base import BaseCommand
from apps.tenant.services import HealthCheckService


class Command(BaseCommand):
    help = 'Run comprehensive multi-tenant operational and connection health checks.'

    def add_arguments(self, parser):
        parser.add_argument('--org-id', '-i', type=str, help='Check specific organization UUID or slug')
        parser.add_argument('--all', '-a', action='store_true', help='Check all active organizations')
        parser.add_argument('--json', action='store_true', help='Output results in JSON format')

    def handle(self, *args, **options):
        service = HealthCheckService()
        if options.get('org_id'):
            result = service.check_organization(options['org_id'])
            if options.get('json'):
                self.stdout.write(json.dumps(result, indent=2, default=str))
            else:
                self._print_health_result(result)
        elif options.get('all'):
            results = service.check_all_organizations()
            if options.get('json'):
                self.stdout.write(json.dumps(results, indent=2, default=str))
            else:
                self._print_all_health(results)
        else:
            result = service.full_health_check()
            if options.get('json'):
                self.stdout.write(json.dumps(result, indent=2, default=str))
            else:
                self._print_system_health(result)

    def _print_health_result(self, result):
        is_h = result.get('is_healthy')
        status_label = self.style.SUCCESS("[HEALTHY]") if is_h else self.style.ERROR("[UNHEALTHY]")
        self.stdout.write("\n" + "=" * 65)
        self.stdout.write(self.style.SUCCESS(f" ORGANIZATION HEALTH: {result.get('organization_name')}"))
        self.stdout.write("=" * 65)
        self.stdout.write(f"  Organization ID:   {result.get('organization_id')}")
        self.stdout.write(f"  Schema Name:       {result.get('schema_name') or 'N/A'}")
        self.stdout.write(f"  Status:            {status_label}")
        self.stdout.write(f"  Response Latency:  {result.get('response_time_ms', 0)} ms")
        if result.get('error_message'):
            self.stdout.write(self.style.ERROR(f"  Error Detail:      {result.get('error_message')}"))
        self.stdout.write("=" * 65 + "\n")

    def _print_all_health(self, results):
        orgs = results.get('organizations', [])
        total = results.get('total', 0)
        healthy = results.get('healthy', 0)
        unhealthy = results.get('unhealthy', 0)
        skipped = results.get('skipped', 0)

        self.stdout.write("\n" + "=" * 95)
        self.stdout.write(self.style.SUCCESS(f" MULTI-TENANT HEALTH CHECK ({len(orgs)} organizations)"))
        self.stdout.write("=" * 95)
        self.stdout.write(f"{'Organization':<30} {'Schema':<28} {'Status':<16} {'Latency':<12} {'Notes'}")
        self.stdout.write("-" * 95)

        for org in orgs:
            st = org.get('status')
            if st == 'healthy':
                st_str = self.style.SUCCESS("[HEALTHY  ]")
            elif st == 'skipped':
                st_str = self.style.WARNING("[SKIPPED  ]")
            else:
                st_str = self.style.ERROR("[UNHEALTHY]")

            org_name = (org.get('organization_name') or 'Unknown')[:28]
            schema_name = (org.get('schema_name') or 'N/A')[:26]
            latency = f"{org.get('response_time_ms', 0)} ms" if st != 'skipped' else "-"
            notes = org.get('error_message') or ""
            if len(notes) > 18:
                notes = notes[:15] + "..."

            self.stdout.write(f"{org_name:<30} {schema_name:<28} {st_str:<26} {latency:<12} {notes}")

        self.stdout.write("-" * 95)
        summary = f" Summary: {healthy} HEALTHY, {unhealthy} UNHEALTHY"
        if skipped:
            summary += f", {skipped} SKIPPED (Pending Onboarding)"
        summary += f" of {total} total"
        self.stdout.write(self.style.SUCCESS(summary) if unhealthy == 0 else self.style.WARNING(summary))
        self.stdout.write("=" * 95 + "\n")

    def _print_system_health(self, result):
        self.stdout.write("\n" + "=" * 65)
        self.stdout.write(self.style.SUCCESS(" GLOBAL TENANT SYSTEM HEALTH"))
        self.stdout.write("=" * 65)
        db = result.get('database', {})
        db_ok = db.get('status') == 'healthy'
        db_str = self.style.SUCCESS("[HEALTHY]") if db_ok else self.style.ERROR("[UNHEALTHY]")
        self.stdout.write(f"  PostgreSQL Core DB: {db_str}")

        schemas = result.get('schemas', {})
        sc_ok = schemas.get('status') == 'healthy'
        sc_str = self.style.SUCCESS("[HEALTHY]") if sc_ok else self.style.ERROR("[UNHEALTHY]")
        self.stdout.write(f"  Tenant Schemas:     {sc_str} ({schemas.get('schemas', 0)} active ready schemas)")

        orgs = result.get('organizations', {})
        org_ok = orgs.get('status') == 'healthy'
        org_str = self.style.SUCCESS("[HEALTHY]") if org_ok else self.style.ERROR("[UNHEALTHY]")
        self.stdout.write(f"  Organizations:      {org_str} ({orgs.get('organizations', 0)} active)")

        self.stdout.write(f"  Total Check Time:   {result.get('response_time_ms', 0)} ms")
        self.stdout.write("=" * 65 + "\n")