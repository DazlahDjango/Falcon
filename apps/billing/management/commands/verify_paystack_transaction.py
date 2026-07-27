from django.core.management.base import BaseCommand
from apps.billing.services.payment.paystack_provider import PayStackProvider
from apps.billing.models import Transaction as BillingTransaction
from django.db import connection

class Command(BaseCommand):
    help = 'Verify a Paystack transaction status via Paystack API and optionally update local record'

    def add_arguments(self, parser):
        parser.add_argument('--reference', type=str, required=True, help='Paystack transaction reference code')
        parser.add_argument('--update', action='store_true', help='Update local transaction record status if verified successfully')

    def handle(self, *args, **options):
        with connection.cursor() as cursor:
            cursor.execute('SET search_path TO "public"')

        reference = options['reference']
        should_update = options['update']

        self.stdout.write(f'Verifying Paystack Transaction reference: {reference}...')

        try:
            provider = PayStackProvider()
            result = provider.verify_transaction(reference)

            self.stdout.write(self.style.SUCCESS(f'  [OK] Paystack API Verification Result:'))
            self.stdout.write(f'    Success: {result.success}')
            self.stdout.write(f'    Status: {result.status}')
            self.stdout.write(f'    Amount: {result.currency} {result.amount / 100:.2f}')
            self.stdout.write(f'    Auth Code: {result.authorization_code or "N/A"}')
            self.stdout.write(f'    Customer Code: {result.customer_code or "N/A"}')

            if should_update:
                txn = BillingTransaction.objects.filter(reference=reference).first()
                if txn:
                    old_status = txn.status
                    txn.status = result.status
                    if result.status == 'success':
                        txn.mark_success(payment_method='paystack')
                    elif result.status == 'failed':
                        txn.mark_failed(error_message='Failed via Paystack verification')
                    
                    txn.save()
                    self.stdout.write(self.style.SUCCESS(f'  [OK] Updated local transaction status from {old_status} to {txn.status}'))
                else:
                    self.stdout.write(self.style.WARNING(f'  [WARN] Local transaction record with reference {reference} not found.'))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f'  [FAIL] Verification Failed: {e}'))
