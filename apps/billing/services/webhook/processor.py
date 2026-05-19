import json
import logging
from typing import Optional, Dict, Any
from django.utils import timezone
from django.db import transaction
from ...models import WebhookEventLog, BillingAuditLog
from ...exceptions import WebhookSignatureError, WebhookProcessingError, WebhookIdempotencyError
from ...utils import generate_idempotency_key, serialize_for_audit
from ..paystack.signature import WebhookSignatureVerifier
from ..paystack.webhook_handler import WebhookHandler
logger = logging.getLogger(__name__)

class WebhookProcessor:
    def __init__(self):
        self.signature_verifier = WebhookSignatureVerifier()
        self.event_handler = WebhookHandler()
    
    def process(self, request) -> Optional[WebhookEventLog]:
        """
        Process incoming webhook request.
        
        Steps:
        1. Verify signature
        2. Check for duplicates (idempotency)
        3. Parse payload
        4. Dispatch to handler
        5. Log result
        """
        # Step 1: Verify signature
        is_valid, message = self.signature_verifier.verify(request)
        if not is_valid:
            logger.error(f"Webhook signature verification failed: {message}")
            raise WebhookSignatureError(message)
        
        # Step 2: Parse payload
        try:
            payload = json.loads(request.body)
        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON payload: {str(e)}")
            raise WebhookProcessingError(f"Invalid JSON: {str(e)}")
        
        event_type = payload.get('event')
        event_data = payload.get('data', {})
        
        if not event_type:
            logger.error("Webhook missing event type")
            raise WebhookProcessingError("Missing event type")
        
        # Step 3: Generate idempotency key and check for duplicates
        idempotency_key = generate_idempotency_key(
            event_data.get('id', ''),
            event_type
        )
        
        existing_log = WebhookEventLog.objects.get_by_idempotency_key(idempotency_key)
        if existing_log and existing_log.is_processed:
            logger.info(f"Duplicate webhook detected: {idempotency_key}")
            existing_log.mark_duplicate()
            return existing_log
        
        # Step 4: Create webhook log
        webhook_log = WebhookEventLog.objects.create(
            event_type=event_type,
            event_idempotency_key=idempotency_key,
            paystack_event_id=event_data.get('id', ''),
            paystack_data_id=event_data.get('data', {}).get('id', ''),
            raw_payload=payload,
            signature_valid=is_valid,
            processing_status=WebhookEventLog.PROCESSING_STATUS_PENDING
        )
        
        # Step 5: Process webhook
        try:
            with transaction.atomic():
                result = self.event_handler.dispatch(event_type, payload, webhook_log)
                
                webhook_log.mark_processed()
                logger.info(f"Webhook {event_type} processed successfully")
                
                # Log audit
                BillingAuditLog.log_action(
                    user=None,
                    tenant_id=None,
                    action='webhook',
                    resource_type='webhook',
                    resource_id=webhook_log.id,
                    after={'event_type': event_type, 'status': 'processed'},
                    metadata={'idempotency_key': idempotency_key}
                )
                
        except Exception as e:
            error_msg = str(e)
            logger.exception(f"Webhook processing failed: {error_msg}")
            webhook_log.mark_failed(error_msg)
            raise WebhookProcessingError(error_msg)
        
        return webhook_log