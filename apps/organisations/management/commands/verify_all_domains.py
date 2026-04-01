"""
Management command to verify all pending domains
Run periodically to verify DNS records
"""

import logging
from django.core.management.base import BaseCommand

from apps.organisations.models import Domain
from apps.organisations.constants import DomainVerificationStatus
from apps.organisations.services import DNSVerifierService

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Verify all pending custom domains'

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force re-verification even for already verified domains'
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Run without actually updating verification status'
        )

    def handle(self, *args, **options):
        force = options['force']
        dry_run = options['dry_run']
        
        self.stdout.write(f"\n{'='*60}")
        self.stdout.write(f"VERIFYING DOMAINS")
        self.stdout.write(f"{'='*60}")
        self.stdout.write(f"Force: {force}")
        self.stdout.write(f"Dry Run: {dry_run}")
        self.stdout.write(f"{'='*60}\n")
        
        # Get domains to verify
        if force:
            domains = Domain.objects.all()
        else:
            domains = Domain.objects.filter(
                verification_status=DomainVerificationStatus.PENDING
            )
        
        count = domains.count()
        self.stdout.write(f"Found {count} domains to verify\n")
        
        verified_count = 0
        failed_count = 0
        skipped_count = 0
        
        for domain in domains:
            self.stdout.write(f"  🌐 Verifying: {domain.domain_name}")
            self.stdout.write(f"     Organisation: {domain.organisation.name}")
            self.stdout.write(f"     Current status: {domain.verification_status}")
            
            if dry_run:
                self.stdout.write(f"     🔍 DRY RUN - Would verify")
                skipped_count += 1
            else:
                try:
                    verified = DNSVerifierService.verify_domain(domain)
                    if verified:
                        self.stdout.write(f"     ✅ VERIFIED")
                        verified_count += 1
                    else:
                        self.stdout.write(f"     ❌ FAILED - DNS record not found")
                        failed_count += 1
                except Exception as e:
                    self.stdout.write(f"     ❌ ERROR - {str(e)}")
                    failed_count += 1
            
            self.stdout.write("")
        
        self.stdout.write(f"{'='*60}")
        self.stdout.write(f"SUMMARY")
        self.stdout.write(f"{'='*60}")
        self.stdout.write(f"Verified: {verified_count}")
        self.stdout.write(f"Failed: {failed_count}")
        self.stdout.write(f"Skipped: {skipped_count}")
        self.stdout.write(f"Total: {count}")
        self.stdout.write(f"{'='*60}\n")