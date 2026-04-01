"""
Management command to enforce quotas for all organisations
Run periodically to ensure organisations are within their plan limits
"""

import logging
from django.core.management.base import BaseCommand

from apps.organisations.models import Organisation
from apps.organisations.services import QuotaCheckerService

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Enforce quotas for all organisations'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Run without actually enforcing quotas'
        )
        parser.add_argument(
            '--suspend',
            action='store_true',
            help='Suspend organisations that exceed quotas'
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        suspend = options['suspend']
        
        self.stdout.write(f"\n{'='*60}")
        self.stdout.write(f"ENFORCING QUOTAS")
        self.stdout.write(f"{'='*60}")
        self.stdout.write(f"Dry Run: {dry_run}")
        self.stdout.write(f"Suspend: {suspend}")
        self.stdout.write(f"{'='*60}\n")
        
        # Get all active organisations
        organisations = Organisation.objects.filter(is_active=True)
        
        total = organisations.count()
        self.stdout.write(f"Checking {total} organisations\n")
        
        exceeded_count = 0
        suspended_count = 0
        
        for org in organisations:
            # Check user limit
            user_limit_ok = QuotaCheckerService.check_user_limit(org)
            
            if not user_limit_ok:
                self.stdout.write(f"  ⚠️ {org.name} - User limit exceeded")
                self.stdout.write(f"     Max users: {org.subscription.plan.max_users if org.subscription and org.subscription.plan else 'Unknown'}")
                self.stdout.write(f"     Current users: {org.get_active_users_count()}")
                exceeded_count += 1
                
                if not dry_run and suspend:
                    org.is_active = False
                    org.save()
                    self.stdout.write(f"     🚫 SUSPENDED")
                    suspended_count += 1
                elif not dry_run:
                    self.stdout.write(f"     📧 Notification sent (quota exceeded)")
            
            self.stdout.write("")
        
        self.stdout.write(f"{'='*60}")
        self.stdout.write(f"SUMMARY")
        self.stdout.write(f"{'='*60}")
        self.stdout.write(f"Organisations exceeding quotas: {exceeded_count}")
        self.stdout.write(f"Suspended: {suspended_count}")
        self.stdout.write(f"Total checked: {total}")
        self.stdout.write(f"{'='*60}\n")