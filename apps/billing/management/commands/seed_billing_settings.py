from django.core.management.base import BaseCommand
from apps.billing.services.settings import BillingSettingsService


class Command(BaseCommand):
    help = 'Seed billing platform system settings singleton.'

    def add_arguments(self, parser):
        parser.add_argument('--reset', action='store_true')

    def handle(self, *args, **options):
        if options['reset']:
            record = BillingSettingsService.reset_to_defaults()
            self.stdout.write(self.style.SUCCESS(f'Reset billing settings (v{record.version})'))
        else:
            record = BillingSettingsService.get_record()
            self.stdout.write(self.style.SUCCESS(f'Billing settings ready (v{record.version})'))
