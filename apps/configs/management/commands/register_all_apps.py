from django.core.management.base import BaseCommand
from apps.configs.services.registry.app_registry import AppRegistry
from apps.configs.services.registry.app_definitions import V1_APP_DEFINITIONS
from apps.configs.services.registry.dependency_resolver import DependencyResolver


class Command(BaseCommand):
    help = 'Sync all V1 Falcon apps with canonical registry definitions (CIA-aligned)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--apps',
            nargs='*',
            help='Optional app names to sync (default: all canonical definitions)',
        )

    def handle(self, *args, **options):
        registry = AppRegistry()
        app_names = options.get('apps') or list(V1_APP_DEFINITIONS.keys())

        self.stdout.write('Synchronizing apps with canonical registry definitions...')

        synced = registry.sync_all_definitions(app_names=app_names)
        for app in synced:
            self.stdout.write(self.style.SUCCESS(
                f'  ✓ {app.name}: critical={app.is_critical}, priority={app.recovery_priority}, '
                f'rpo={app.rpo_minutes}m, rto={app.rto_minutes}m'
            ))

        try:
            DependencyResolver().validate_dependencies()
            self.stdout.write(self.style.SUCCESS('  ✓ Dependency graph validated (no cycles)'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'  ✗ Dependency validation failed: {e}'))

        self.stdout.write(self.style.SUCCESS(f'\n{len(synced)} app(s) synchronized successfully.'))
