from django.core.management.base import BaseCommand
from apps.configs.services.health.health_checker import HealthChecker

class Command(BaseCommand):
    help = 'Run health checks on all registered apps'

    def add_arguments(self, parser):
        parser.add_argument('--verbose', action='store_true', help='Show detailed results')

    def handle(self, *args, **options):
        checker = HealthChecker()
        
        self.stdout.write('Running health checks on all apps...')
        
        results = checker.check_all_apps()
        
        healthy = sum(1 for r in results if r.status == 'healthy')
        degraded = sum(1 for r in results if r.status == 'degraded')
        unhealthy = sum(1 for r in results if r.status == 'unhealthy')
        
        self.stdout.write(f'\nResults: {healthy} healthy, {degraded} degraded, {unhealthy} unhealthy')
        
        if options['verbose']:
            for result in results:
                status_color = self.style.SUCCESS if result.status == 'healthy' else self.style.WARNING if result.status == 'degraded' else self.style.ERROR
                self.stdout.write(f'  {result.app.name}: {status_color(result.status)} ({result.response_time_ms}ms)')
        
        if unhealthy > 0:
            self.stdout.write(self.style.ERROR(f'\n⚠️ {unhealthy} apps are unhealthy!'))