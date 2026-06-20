from django.core.management.base import BaseCommand
from apps.billing.models import Transaction
from apps.billing.services.payment.retry import PaymentRetryService

class Command(BaseCommand):
    help = 'Retry failed payment transactions'

    def add_arguments(self, parser):
        parser.add_argument('--transaction-id', type=str, help='Retry specific transaction')
        parser.add_argument('--all', action='store_true', help='Retry all failed transactions')
        parser.add_argument('--days', type=int, default=7, help='Retry transactions from last N days')

    def handle(self, *args, **options):
        retry_service = PaymentRetryService()
        transaction_id = options['transaction_id']
        all = options['all']
        days = options['days']

        if not transaction_id and not all:
            self.stdout.write(self.style.WARNING('Please specify either --transaction-id or --all'))
            return

        if transaction_id:
            try:
                transaction = Transaction.objects.get(id=transaction_id)
                self.stdout.write(f'Retrying transaction {transaction_id}...')
                result = retry_service.retry_transaction(transaction)
                if result:
                    self.stdout.write(self.style.SUCCESS('  ✓ Retry successful!'))
                else:
                    self.stdout.write(self.style.ERROR('  ✗ Retry failed!'))
            except Transaction.DoesNotExist:
                self.stdout.write(self.style.ERROR(f'Transaction {transaction_id} not found'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Error: {e}'))
        else:
            self.stdout.write(f'Retrying failed transactions from last {days} days...')
            count = retry_service.retry_all_eligible(days_back=days)
            self.stdout.write(self.style.SUCCESS(f'  ✓ Retried {count} transactions!'))
