"""
Management command to clean up expired trial organisations
Run daily to handle expired trials
"""

import logging
from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.organisations.models import Organisation
from apps.organisations.constants import OrganisationStatus

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Clean up expired trial organisations'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Run without actually updating status'
        )
        parser.add_argument(
            '--archive',
            action='store_true',
            help='Archive expired trials instead of just marking as expired'
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        archive = options['archive']
        
        self.stdout.write(f"\n{'='*60}")
        self.stdout.write(f"CLEANING UP EXPIRED TRIALS")
        self.stdout.write(f"{'='*60}")
        self.stdout.write(f"Dry Run: {dry_run}")
        self.stdout.write(f"Archive: {archive}")
        self.stdout.write(f"{'='*60}\n")
        
        # Find expired trials
        expired_trials = Organisation.objects.filter(
            status=OrganisationStatus.TRIAL,
            subscription__trial_end_date__lt=timezone.now()
        ).select_related('subscription')
        
        count = expired_trials.count()
        self.stdout.write(f"Found {count} expired trials\n")
        
        updated_count = 0
        
        for org in expired_trials:
            trial_end_date = org.subscription.trial_end_date if hasattr(org, 'subscription') else None
            days_overdue = (timezone.now() - trial_end_date).days if trial_end_date else 0
            
            self.stdout.write(f"  🏢 {org.name}")
            self.stdout.write(f"     Trial ended: {trial_end_date.strftime('%Y-%m-%d') if trial_end_date else 'Unknown'}")
            self.stdout.write(f"     Days overdue: {days_overdue}")
            
            if dry_run:
                self.stdout.write(f"     🔍 DRY RUN - Would mark as {OrganisationStatus.EXPIRED}")
                updated_count += 1
            else:
                if archive:
                    org.status = OrganisationStatus.ARCHIVED
                    self.stdout.write(f"     📦 ARCHIVED")
                else:
                    org.status = OrganisationStatus.EXPIRED
                    self.stdout.write(f"     ⏰ EXPIRED")
                org.save()
                updated_count += 1
            
            self.stdout.write("")
        
        self.stdout.write(f"{'='*60}")
        self.stdout.write(f"SUMMARY")
        self.stdout.write(f"{'='*60}")
        self.stdout.write(f"Updated: {updated_count}")
        self.stdout.write(f"Total: {count}")
        self.stdout.write(f"{'='*60}\n")