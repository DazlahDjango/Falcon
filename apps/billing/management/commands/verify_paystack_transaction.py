from django.core.management.base import BaseCommand
from apps.billing.services.payment.paystack_provider import PayStackProvider
from apps.billing.models import Transaction

class Command(BaseCommand):
    help = 'Verify a Paystack transaction manually'

    def add_arguments(self, parser):
        parser.add_argument('--reference', type=str, required=True, help='Paystack transaction reference')
        parser.add_argument('--update', action='store_true', help='Update local transaction status if needed')

    def handle(self, *args, **options):
        provider = PayStackProvider()
        reference = options['reference']
        update = options['update']

        self.stdout.write(f'Verifying transaction {reference}...')

        try:
            result = provider.verify_transaction(reference)
            self.stdout.write(self.style.SUCCESS(f'  ✓ Verification successful!'))
            self.stdout.write(f'    Amount: {result.amount} {result.currency}')
            self.stdout.write(f'    Status: {result.status}')
            self.stdout.write(f'    Authorization: {result.authorization_code}')

            if update:
                try:
                    transaction = Transaction.objects.get(reference=reference)
                    if transaction.status != result.status:
                        transaction.status = result.status
                        transaction.gateway_response = str(result.gateway_response)
                        transaction.save()
                        self.stdout.write(self.style.SUCCESS(f'  ✓ Updated local transaction status to {result.status}'))
                except Transaction.DoesNotExist:
                    self.stdout.write(self.style.WARNING(f'  ⚠ Local transaction {reference} not found'))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f'  ✗ Failed: {e}'))
