"""
Management command to process auto-renewals
Run daily to handle subscription renewals
"""

import logging
from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.organisations.models import Subscription
from apps.organisations.constants import SubscriptionStatus
from apps.organisations.services import RenewalService

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Process auto-renewing subscriptions'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Run without actually processing renewals'
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        
        self.stdout.write(f"\n{'='*60}")
        self.stdout.write(f"PROCESSING SUBSCRIPTION RENEWALS")
        self.stdout.write(f"{'='*60}")
        self.stdout.write(f"Dry Run: {dry_run}")
        self.stdout.write(f"{'='*60}\n")
        
        today = timezone.now().date()
        
        # Find subscriptions that expire today and are set to auto-renew
        renewing_subs = Subscription.objects.filter(
            end_date__date=today,
            auto_renew=True,
            status=SubscriptionStatus.ACTIVE
        ).select_related('organisation', 'plan')
        
        count = renewing_subs.count()
        self.stdout.write(f"Found {count} subscriptions to renew today\n")
        
        success_count = 0
        failed_count = 0
        
        for sub in renewing_subs:
            self.stdout.write(f"  🔄 Processing: {sub.organisation.name}")
            self.stdout.write(f"     Current plan: {sub.plan.name if sub.plan else 'No Plan'}")
            self.stdout.write(f"     Current end date: {sub.end_date.strftime('%Y-%m-%d')}")
            
            if dry_run:
                self.stdout.write(f"     🔍 DRY RUN - Would renew")
                success_count += 1
            else:
                try:
                    renewed = RenewalService.renew_subscription(sub)
                    if renewed:
                        self.stdout.write(f"     ✅ RENEWED - New end date: {sub.end_date.strftime('%Y-%m-%d')}")
                        success_count += 1
                    else:
                        self.stdout.write(f"     ❌ FAILED - Renewal failed")
                        failed_count += 1
                except Exception as e:
                    self.stdout.write(f"     ❌ ERROR - {str(e)}")
                    failed_count += 1
            
            self.stdout.write("")
        
        self.stdout.write(f"{'='*60}")
        self.stdout.write(f"SUMMARY")
        self.stdout.write(f"{'='*60}")
        self.stdout.write(f"Success: {success_count}")
        self.stdout.write(f"Failed: {failed_count}")
        self.stdout.write(f"Total: {count}")
        self.stdout.write(f"{'='*60}\n")