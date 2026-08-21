# tests/services/test_usage_tracking.py
from django.test import TestCase
from unittest.mock import Mock, patch
from decimal import Decimal
from uuid import uuid4
from . import SubscriptionFactory, UsageRecordFactory
from ...usage.service import UsageTrackingService
from ....exceptions import UsageLimitExceededError

class UsageTrackingServiceTest(TestCase):
    def setUp(self):
        self.service = UsageTrackingService()
        self.subscription = SubscriptionFactory(status='active', plan__max_users=100)
        self.subscription.custom_limits = {'api_calls': 5000}
        self.subscription.save()

    def test_track_usage_within_limit(self):
        result = self.service.track_usage(str(uuid4()), self.subscription, 'users', 1)
        self.assertEqual(result['current'], 1)
        self.assertEqual(result['limit'], 100)
        self.assertLess(result['percentage'], 100)

    def test_track_usage_soft_limit_warning(self):
        for i in range(101):
            self.service.track_usage(str(uuid4()), self.subscription, 'users', 1)
        result = self.service.track_usage(str(uuid4()), self.subscription, 'users', 1)
        self.assertGreaterEqual(result['percentage'], 100)
        self.assertLess(result['percentage'], 110)

    def test_track_usage_hard_limit_exceeded(self):
        for i in range(110):
            self.service.track_usage(str(uuid4()), self.subscription, 'users', 1)
        with self.assertRaises(UsageLimitExceededError):
            self.service.track_usage(str(uuid4()), self.subscription, 'users', 1)

    def test_get_usage_summary(self):
        self.service.track_usage(str(uuid4()), self.subscription, 'users', 25)
        self.service.track_usage(str(uuid4()), self.subscription, 'kpis', 50)
        summary = self.service.get_usage_summary(self.subscription)
        self.assertIn('users', summary)
        self.assertIn('kpis', summary)
        self.assertEqual(summary['users']['current'], 25)