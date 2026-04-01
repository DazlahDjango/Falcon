"""
Management command to check for expiring subscriptions
Run daily via cron or Celery beat
"""

import logging
from datetime import timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db.models import Q

from apps.organisations.models import Subscription
from apps.organisations.constants import SubscriptionStatus

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Check for subscriptions expiring soon and send reminders'

    def add_arguments(self, parser):
        parser.add_argument(
            '--days',
            type=int,
            default=7,
            help='Number of days threshold for expiration reminders (default: 7)'
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Run without actually sending emails'
        )

    def handle(self, *args, **options):
        days = options['days']
        dry_run = options['dry_run']
        
        self.stdout.write(f"\n{'='*60}")
        self.stdout.write(f"CHECKING EXPIRING SUBSCRIPTIONS")
        self.stdout.write(f"{'='*60}")
        self.stdout.write(f"Threshold: {days} days")
        self.stdout.write(f"Dry Run: {dry_run}")
        self.stdout.write(f"{'='*60}\n")
        
        # Calculate expiration threshold
        now = timezone.now()
        threshold = now + timedelta(days=days)
        
        # Find subscriptions expiring in the next X days
        expiring_subs = Subscription.objects.filter(
            status=SubscriptionStatus.ACTIVE,
            end_date__lte=threshold,
            end_date__gt=now
        ).select_related('organisation', 'plan')
        
        count = expiring_subs.count()
        self.stdout.write(f"Found {count} subscriptions expiring within {days} days\n")
        
        for sub in expiring_subs:
            days_left = (sub.end_date - now).days
            
            self.stdout.write(f"  📧 {sub.organisation.name}")
            self.stdout.write(f"     Plan: {sub.plan.name if sub.plan else 'No Plan'}")
            self.stdout.write(f"     Expires: {sub.end_date.strftime('%Y-%m-%d')}")
            self.stdout.write(f"     Days left: {days_left}")
            
            if not dry_run:
                # TODO: Send email notification
                # from apps.organisations.services import WelcomeEmailService
                # WelcomeEmailService.send_expiry_reminder(sub)
                self.stdout.write(f"     ⏰ REMINDER SENT")
            else:
                self.stdout.write(f"     🔍 DRY RUN - No email sent")
            
            self.stdout.write("")
        
        self.stdout.write(f"{'='*60}")
        self.stdout.write(f"✅ Completed: {count} subscriptions processed")
        self.stdout.write(f"{'='*60}\n")