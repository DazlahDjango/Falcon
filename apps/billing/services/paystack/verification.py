import logging
from typing import Optional, Dict, Any
from django.core.cache import cache
from django.utils import timezone
from .client import PayStackClient
from ...models import Transaction
from ...exceptions import PaymentVerificationError

logger = logging.getLogger(__name__)

class PaymentVerifier:
    def __init__(self):
        self.client = PayStackClient()

    def verify_transaction(self, reference: str, skip_cache: bool = False) -> Dict[str, Any]:
        cache_key = f"payment_verify_{reference}"
        if not skip_cache:
            cached = cache.get(cache_key)
            if cached:
                logger.info(f"Returning cached verification for {reference}")
                return cached
        try:
            result = self.client.verify_transaction(reference)
            ttl = 300 if result.get('status') == 'success' else 60
            cache.set(cache_key, result, ttl)
            logger.info(f"Transaction {reference} verified: {result.get('status')}")
            return result
        except Exception as e:
            logger.error(f"Verification failed for {reference}: {str(e)}")
            raise PaymentVerificationError(f"Failed to verify payment: {str(e)}")

    def process_verified_transaction(self, transaction: Transaction, verification_data: Dict) -> bool:
        if transaction.status == Transaction.STATUS_SUCCESS:
            logger.info(f"Transaction {transaction.reference} already processed")
            return True
        paystack_ref = verification_data.get('reference')
        status = verification_data.get('status')
        amount = verification_data.get('amount', transaction.amount)
        gateway_response = verification_data.get('gateway_response')
        if status == 'success':
            transaction.status = Transaction.STATUS_SUCCESS
            transaction.paystack_reference = paystack_ref
            transaction.payment_date = timezone.now()
            transaction.paystack_response = verification_data
            logger.info(f"Transaction {transaction.reference} marked as successful")
            return True
        elif status == 'failed':
            transaction.status = Transaction.STATUS_FAILED
            transaction.error_message = gateway_response or "Payment failed"
            transaction.paystack_response = verification_data
            logger.warning(f"Transaction {transaction.reference} failed: {transaction.error_message}")
            return False
        elif status == 'pending':
            logger.info(f"Transaction {transaction.reference} is still pending")
            return False
        else:
            logger.warning(f"Unknown transaction status {status} for {transaction.reference}")
            return False

    def verify_and_update_transaction(self, reference: str) -> Optional[Transaction]:
        from django.db import transaction as db_transaction
        try:
            local_txn = Transaction.objects.get_by_reference(reference)
            verification = self.verify_transaction(reference, skip_cache=True)
            with db_transaction.atomic():
                success = self.process_verified_transaction(local_txn, verification)
                local_txn.save()
            return local_txn
        except Transaction.DoesNotExist:
            logger.error(f"Transaction {reference} not found locally")
            return None
        except Exception as e:
            logger.exception(f"Error processing transaction {reference}: {str(e)}")
            return None