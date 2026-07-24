import json
import uuid
from django.core.management.base import BaseCommand
from apps.billing.services.paystack.webhook_handler import WebhookHandler
from apps.billing.services.paystack.signature import WebhookSignatureVerifier
from apps.billing.models import WebhookEventLog
from django.db import connection

class Command(BaseCommand):
    help = 'Simulate and test Paystack webhook events locally'

    def add_arguments(self, parser):
        parser.add_argument('--event', type=str, help='Event type (e.g. charge.success, subscription.create, subscription.disable)')
        parser.add_argument('--payload', type=str, help='JSON payload string or path to .json file')
        parser.add_argument('--reference', type=str, help='Transaction or subscription reference to inject into test payload')

    def handle(self, *args, **options):
        with connection.cursor() as cursor:
            cursor.execute('SET search_path TO "public"')

        event_type = options.get('event') or 'charge.success'
        payload_input = options.get('payload')
        reference = options.get('reference') or 'REF-TEST-WEBHOOK-123'

        if payload_input:
            if payload_input.endswith('.json'):
                with open(payload_input, 'r', encoding='utf-8') as f:
                    payload_dict = json.load(f)
            else:
                payload_dict = json.loads(payload_input)
        else:
            self.stdout.write(self.style.NOTICE(f"Generating sample webhook payload for event '{event_type}'..."))
            payload_dict = {
                'event': event_type,
                'data': {
                    'id': 12345678,
                    'domain': 'test',
                    'status': 'success',
                    'reference': reference,
                    'amount': 500000,
                    'currency': 'KES',
                    'subscription_code': 'SUB-TEST-123',
                    'customer': {
                        'email': 'admin@falcontech.com',
                        'customer_code': 'CUS_TEST123'
                    },
                    'authorization': {
                        'authorization_code': 'AUTH_TEST123',
                        'card_type': 'visa',
                        'last4': '4242',
                        'exp_month': '12',
                        'exp_year': '2028'
                    }
                }
            }

        self.stdout.write(f"Processing Paystack Webhook Event: {event_type}...")
        handler = WebhookHandler()
        
        try:
            log = WebhookEventLog.objects.create(
                event_type=event_type,
                event_idempotency_key=f"cmd_test_{event_type}_{reference}_{uuid.uuid4().hex[:6]}",
                paystack_event_id=str(payload_dict.get('data', {}).get('id', '')),
                raw_payload=payload_dict,
                signature_valid=True,
                processing_status=WebhookEventLog.PROCESSING_STATUS_PENDING
            )
            
            result = handler.dispatch(event_type, payload_dict, log)
            log.mark_processed()
            
            self.stdout.write(self.style.SUCCESS(f"  [OK] Webhook Event '{event_type}' handled successfully!"))
            self.stdout.write(f"  Result Output: {result}")
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"  [FAIL] Webhook Processing Error: {e}"))
