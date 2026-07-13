from django.core.management.base import BaseCommand
from apps.tenant.services import HealthCheckService

class Command(BaseCommand):
    help = 'Run health check on organizations.'

    def add_arguments(self, parser):
        parser.add_argument('--org-id', type=str, help='Check specific organization')
        parser.add_argument('--all', action='store_true', help='Check all organizations')
        parser.add_argument('--json', action='store_true', help='Output as JSON')

    def handle(self, *args, **options):
        import json
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
        status = '✅ HEALTHY' if result.get('is_healthy') else '❌ UNHEALTHY'
        self.stdout.write(f"\nOrganization: {result.get('organization_name')}")
        self.stdout.write(f"Status: {status}")
        self.stdout.write(f"Response Time: {result.get('response_time_ms')}ms")
        if result.get('error_message'):
            self.stdout.write(self.style.ERROR(f"Error: {result.get('error_message')}"))

    def _print_all_health(self, results):
        self.stdout.write(f"\nTotal: {results.get('total')}")
        self.stdout.write(f"Healthy: {results.get('healthy')}")
        self.stdout.write(f"Unhealthy: {results.get('unhealthy')}")
        for org in results.get('organizations', []):
            status = '✅' if org.get('is_healthy') else '❌'
            self.stdout.write(f"  {status} {org.get('organization_name')}")

    def _print_system_health(self, result):
        self.stdout.write("\n=== SYSTEM HEALTH ===\n")
        db = result.get('database', {})
        self.stdout.write(f"Database: {'✅' if db.get('status') == 'healthy' else '❌'}")
        schemas = result.get('schemas', {})
        self.stdout.write(f"Schemas: {'✅' if schemas.get('status') == 'healthy' else '❌'} ({schemas.get('schemas', 0)} active)")
        orgs = result.get('organizations', {})
        self.stdout.write(f"Organizations: {'✅' if orgs.get('status') == 'healthy' else '❌'} ({orgs.get('organizations', 0)} active)")