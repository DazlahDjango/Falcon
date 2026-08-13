import hmac
import hashlib
import logging
from typing import Tuple
from django.conf import settings
from django.http import HttpRequest

logger = logging.getLogger(__name__)

class WebhookSignatureVerifier:
    def __init__(self):
        secret = getattr(settings, 'PAYSTACK_WEBHOOK_SECRET', None)
        if not secret or secret == 'your_webhook_signature_secret_here':
            secret = getattr(settings, 'PAYSTACK_SECRET_KEY', None)
        self.secret = secret
        self.verify_signature = getattr(settings, 'PAYSTACK_VERIFY_WEBHOOK_SIGNATURE', True)
        if not self.verify_signature:
            logger.warning("Webhook signature verification is DISABLED - only for development!")

    def verify(self, request: HttpRequest) -> Tuple[bool, str]:
        if not self.verify_signature:
            return True, "Development mode - signature verification skipped"
        signature = request.headers.get('x-paystack-signature')
        if not signature:
            logger.error("Webhook received without signature header")
            return False, "Missing x-paystack-signature header"
        if not self.secret:
            logger.error("PayStack webhook secret not configured")
            return False, "Webhook secret not configured"
        try:
            raw_body = request.body
            if not raw_body:
                logger.error("Webhook received with empty body")
                return False, "Empty webhook payload"
        except Exception as e:
            logger.error(f"Failed to read webhook body: {str(e)}")
            return False, f"Failed to read request body: {str(e)}"
        try:
            expected_signature = hmac.new(self.secret.encode('utf-8'), raw_body, hashlib.sha512).hexdigest()
        except Exception as e:
            logger.error(f"Failed to compute signature: {str(e)}")
            return False, f"Signature computation failed: {str(e)}"
        is_valid = hmac.compare_digest(expected_signature, signature)
        if is_valid:
            logger.info("Webhook signature verified successfully")
        else:
            logger.error(f"Webhook signature mismatch. Expected: {expected_signature[:20]}..., Got: {signature[:20]}...")
            return False, "Invalid webhook signature"
        return True, "Signature verified"

    def verify_with_payload(self, signature: str, payload: bytes) -> Tuple[bool, str]:
        if not self.verify_signature:
            return True, "Development mode"
        if not self.secret:
            return False, "Webhook secret not configured"
        try:
            expected = hmac.new(self.secret.encode('utf-8'), payload, hashlib.sha512).hexdigest()
            is_valid = hmac.compare_digest(expected, signature)
            if is_valid:
                return True, "Signature verified"
            return False, "Invalid signature"
        except Exception as e:
            return False, f"Verification failed: {str(e)}"