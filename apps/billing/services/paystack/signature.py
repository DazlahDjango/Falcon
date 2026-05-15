import hmac
import hashlib
import logging
from typing import Tuple
from django.conf import settings
from django.http import HttpRequest

from ...exceptions import WebhookSignatureError

logger = logging.getLogger(__name__)


class WebhookSignatureVerifier:
    """
    Verifies PayStack webhook signatures.
    This is the FIRST line of defense for webhook security.
    """
    
    def __init__(self):
        self.secret = getattr(settings, 'PAYSTACK_WEBHOOK_SECRET', None)
        self.skip_verification = getattr(settings, 'PAYSTACK_VERIFY_WEBHOOK_SIGNATURE', True)
        
        if self.skip_verification:
            logger.warning("Webhook signature verification is DISABLED - only for development!")
    
    def verify(self, request: HttpRequest) -> Tuple[bool, str]:
        """
        Verify the webhook signature from PayStack.
        
        Returns:
            Tuple of (is_valid, message)
        """
        # Skip verification in development (with warning)
        if not self.skip_verification:
            return True, "Development mode - signature verification skipped"
        
        # Get signature from headers
        signature = request.headers.get('x-paystack-signature')
        if not signature:
            logger.error("Webhook received without signature header")
            return False, "Missing x-paystack-signature header"
        
        # Check if secret is configured
        if not self.secret:
            logger.error("PayStack webhook secret not configured")
            return False, "Webhook secret not configured"
        
        # Get raw body
        try:
            raw_body = request.body
            if not raw_body:
                logger.error("Webhook received with empty body")
                return False, "Empty webhook payload"
        except Exception as e:
            logger.error(f"Failed to read webhook body: {str(e)}")
            return False, f"Failed to read request body: {str(e)}"
        
        # Compute expected signature
        try:
            expected_signature = hmac.new(
                self.secret.encode('utf-8'),
                raw_body,
                hashlib.sha512
            ).hexdigest()
        except Exception as e:
            logger.error(f"Failed to compute signature: {str(e)}")
            return False, f"Signature computation failed: {str(e)}"
        
        # Compare signatures (constant time comparison)
        is_valid = hmac.compare_digest(expected_signature, signature)
        
        if is_valid:
            logger.info("Webhook signature verified successfully")
        else:
            logger.error(f"Webhook signature mismatch. Expected: {expected_signature[:20]}..., Got: {signature[:20]}...")
            return False, "Invalid webhook signature"
        
        return True, "Signature verified"
    
    def verify_with_payload(self, signature: str, payload: bytes) -> Tuple[bool, str]:
        """
        Verify signature with explicit payload (for testing).
        """
        if not self.skip_verification:
            return True, "Development mode"
        
        if not self.secret:
            return False, "Webhook secret not configured"
        
        try:
            expected = hmac.new(
                self.secret.encode('utf-8'),
                payload,
                hashlib.sha512
            ).hexdigest()
            
            is_valid = hmac.compare_digest(expected, signature)
            
            if is_valid:
                return True, "Signature verified"
            return False, "Invalid signature"
        except Exception as e:
            return False, f"Verification failed: {str(e)}"