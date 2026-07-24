import json
from django.core.management.base import BaseCommand
from apps.billing.services.settings import BillingSettingsService
from django.db import connection

class Command(BaseCommand):
    help = 'Seed or inspect billing platform system settings singleton.'

    def add_arguments(self, parser):
        parser.add_argument('--reset', action='store_true', help='Reset billing settings to system default configuration')
        parser.add_argument('--show', action='store_true', help='Display current billing system settings JSON')

    def handle(self, *args, **options):
        with connection.cursor() as cursor:
            cursor.execute('SET search_path TO "public"')

        if options['reset']:
            record = BillingSettingsService.reset_to_defaults()
            self.stdout.write(self.style.SUCCESS(f'✓ Reset billing settings to defaults (v{record.version})'))
        elif options['show']:
            settings_dict = BillingSettingsService.get_settings(use_cache=False)
            self.stdout.write(self.style.SUCCESS('=== Current Billing System Settings ==='))
            self.stdout.write(json.dumps(settings_dict, indent=2))
        else:
            record = BillingSettingsService.get_record()
            self.stdout.write(self.style.SUCCESS(f'✓ Billing system settings ready (v{record.version})'))
