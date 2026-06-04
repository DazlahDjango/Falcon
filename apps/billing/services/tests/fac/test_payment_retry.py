from django.test import TestCase
from unittest.mock import Mock, patch
from django.utils import timezone
from datetime import timedelta
from . import SubscriptionFactory, FailedPaymentRetryFactory
from services.payment.retry import PaymentRetryService

class PaymentRetryServiceTest(TestCase):
    def setUp(self):
        self.service = PaymentRetryService()
        self.subscription = SubscriptionFactory(status='past_due', paystack_authorization_code='AUTH123')

    @patch('services.payment.retry.PayStackProvider')
    def test_schedule_retry(self, MockProvider):
        retry = self.service.schedule_retry(self.subscription, 1)
        self.assertEqual(retry.retry_number, 1)
        self.assertEqual(retry.status, 'pending')
        self.assertIsNotNone(retry.scheduled_at)

    def test_calculate_backoff(self):
        self.assertEqual(self.service._calculate_backoff(1), 24)
        self.assertEqual(self.service._calculate_backoff(2), 48)
        self.assertEqual(self.service._calculate_backoff(3), 96)
        self.assertEqual(self.service._calculate_backoff(4), 192)

    @patch('services.payment.retry.PayStackProvider')
    def test_process_pending_retries(self, MockProvider):
        mock_provider = MockProvider.return_value
        mock_provider.initialize_transaction.return_value.success = True
        retry = FailedPaymentRetryFactory(subscription=self.subscription, scheduled_at=timezone.now() - timedelta(hours=1))
        stats = self.service.process_pending_retries()
        self.assertEqual(stats['processed'], 1)