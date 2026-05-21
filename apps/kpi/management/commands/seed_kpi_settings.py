from django.core.management.base import BaseCommand
from apps.kpi.services.settings import KpiSettingsService


class Command(BaseCommand):
    help = 'Seed or refresh persisted KPI system settings with canonical defaults'

    def add_arguments(self, parser):
        parser.add_argument('--reset', action='store_true', help='Reset to defaults')

    def handle(self, *args, **options):
        if options['reset']:
            record = KpiSettingsService.reset_to_defaults()
            self.stdout.write(self.style.WARNING(f'KPI settings reset (v{record.version})'))
        else:
            record = KpiSettingsService.get_record()
            KpiSettingsService.get_settings(use_cache=False)
            self.stdout.write(self.style.SUCCESS(f'KPI settings ready (v{record.version})'))
