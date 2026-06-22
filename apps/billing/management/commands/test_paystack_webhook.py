from django.core.management.base import BaseCommand
from apps.billing.services.paystack.webhook_handler import PayStackWebhookHandler
from apps.billing.services.paystack.signature import verify_signature
import json

class Command(BaseCommand):
    help = 'Test Paystack webhook handling'

    def add_arguments(self, parser):
        parser.add_argument('--payload', type=str, help='JSON payload (file path or string)')
        parser.add_argument('--signature', type=str, help='X-Paystack-Signature header value')
        parser.add_argument('--event', type=str, help='Event type to simulate')

    def handle(self, *args, **options):
        payload = options['payload']
        signature = options['signature']
        event = options['event']

        if payload:
            if payload.endswith('.json'):
                with open(payload, 'r') as f:
                    payload = f.read()

            try:
                payload_dict = json.loads(payload)
                event_type = payload_dict.get('event', 'unknown')
                self.stdout.write(f'Processing event: {event_type}')

                # Verify signature if provided
                if signature:
                    is_valid = verify_signature(payload.encode('utf-8'), signature)
                    if is_valid:
                        self.stdout.write(self.style.SUCCESS('  ✓ Webhook signature valid'))
                    else:
                        self.stdout.write(self.style.ERROR('  ✗ Webhook signature invalid!'))
                        return

                # Process the webhook
                handler = PayStackWebhookHandler()
                handler.handle_webhook(event_type, payload_dict)
                self.stdout.write(self.style.SUCCESS('  ✓ Webhook processed successfully'))

            except json.JSONDecodeError:
                self.stdout.write(self.style.ERROR('  ✗ Invalid JSON payload'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'  ✗ Failed: {e}'))
        else:
            self.stdout.write('Please provide --payload to test webhook handling')
