"""
Clean up expired token blacklist entries.
Usage: python manage.py cleanup_blacklist
"""

from django.core.management.base import BaseCommand
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

from apps.accounts.models import SessionBlacklist


class Command(BaseCommand):
    """
    Clean up expired token blacklist entries.
    """
    help = 'Clean up expired token blacklist entries'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be deleted without actually deleting'
        )
    
    def handle(self, *args, **options):
        dry_run = options['dry_run']
        
        expired = SessionBlacklist.objects.filter(expires_at__lte=timezone.now())
        count = expired.count()
        
        self.stdout.write(_(f'Found {count} expired blacklist entries'))
        
        if dry_run:
            self.stdout.write(self.style.WARNING('Dry run mode - no changes made'))
            return
        
        if count > 0:
            deleted, _ = expired.delete()
            self.stdout.write(self.style.SUCCESS(f'Deleted {deleted} expired entries'))
        else:
            self.stdout.write(self.style.SUCCESS('No expired entries found'))