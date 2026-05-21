from django.core.management.base import BaseCommand
from apps.structure.services.settings import StructureSettingsService


class Command(BaseCommand):
    help = 'Seed structure platform system settings singleton.'

    def add_arguments(self, parser):
        parser.add_argument('--reset', action='store_true', help='Reset settings to defaults')

    def handle(self, *args, **options):
        if options['reset']:
            record = StructureSettingsService.reset_to_defaults()
            self.stdout.write(self.style.SUCCESS(f'Reset structure settings (v{record.version})'))
        else:
            record = StructureSettingsService.get_record()
            self.stdout.write(self.style.SUCCESS(f'Structure settings ready (v{record.version})'))
