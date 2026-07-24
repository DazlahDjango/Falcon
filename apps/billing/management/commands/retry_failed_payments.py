from django.core.management.base import BaseCommand
from apps.billing.models import Transaction, FailedPaymentRetry
from apps.billing.services.payment.retry import PaymentRetryService
from django.db import connection

class Command(BaseCommand):
    help = 'Retry failed billing payment transactions or process scheduled retries'

    def add_arguments(self, parser):
        parser.add_argument('--transaction-id', type=str, help='Retry specific failed transaction by ID')
        parser.add_argument('--all', action='store_true', help='Process all pending failed payment retries')
        parser.add_argument('--days', type=int, default=7, help='Process retries created in last N days')

    def handle(self, *args, **options):
        with connection.cursor() as cursor:
            cursor.execute('SET search_path TO "public"')

        retry_service = PaymentRetryService()
        transaction_id = options.get('transaction_id')
        process_all = options.get('all')

        if not transaction_id and not process_all:
            self.stdout.write(self.style.WARNING('Please specify either --transaction-id <UUID> or --all'))
            return

        if transaction_id:
            try:
                txn = Transaction.objects.get(id=transaction_id)
                self.stdout.write(f'Processing retry for transaction {transaction_id} (Ref: {txn.reference})...')
                
                if txn.subscription:
                    retry_item = retry_service.schedule_retry(txn.subscription, retry_number=1)
                    success = retry_service._execute_retry(retry_item)
                    if success:
                        self.stdout.write(self.style.SUCCESS(f'  [OK] Retry successful for {txn.reference}!'))
                    else:
                        self.stdout.write(self.style.ERROR(f'  [FAIL] Retry failed for {txn.reference}'))
                else:
                    self.stdout.write(self.style.ERROR(f'Transaction {transaction_id} has no attached subscription.'))
            except Transaction.DoesNotExist:
                self.stdout.write(self.style.ERROR(f'Transaction {transaction_id} not found'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Error executing retry: {e}'))
        else:
            self.stdout.write('Processing all pending payment retries...')
            stats = retry_service.process_pending_retries()
            self.stdout.write(self.style.SUCCESS(
                f'  [OK] Processed: {stats["processed"]} | Successful: {stats["successful"]} | Failed: {stats["failed"]}'
            ))
