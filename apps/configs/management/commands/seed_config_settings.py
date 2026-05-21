from django.core.management.base import BaseCommand
from apps.configs.services.settings import ConfigSettingsService


class Command(BaseCommand):
    help = 'Seed or refresh persisted config system settings with canonical defaults'

    def add_arguments(self, parser):
        parser.add_argument('--reset', action='store_true', help='Reset to defaults')

    def handle(self, *args, **options):
        if options['reset']:
            record = ConfigSettingsService.reset_to_defaults()
            self.stdout.write(self.style.WARNING('Settings reset to defaults'))
        else:
            record = ConfigSettingsService.get_record()
            ConfigSettingsService.get_settings(use_cache=False)
            self.stdout.write(self.style.SUCCESS(f'Settings ready (version {record.version})'))
