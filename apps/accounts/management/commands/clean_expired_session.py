"""
Clean expired user sessions.
Usage: python manage.py clean_expired_sessions
"""

from django.core.management.base import BaseCommand
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from apps.accounts.models import UserSession

class Command(BaseCommand):
    help = 'Clean up expired user sessions'
    def add_arguments(self, parser):
        parser.add_argument(
            '--days',
            type=int,
            default=90,
            help='Delete sessions older than this many days'
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be deleted without actually deleting'
        )
    
    def handle(self, *args, **options):
        days = options['days']
        dry_run = options['dry_run']  
        # Find expired sessions
        expired_sessions = UserSession.objects.filter(
            expires_at__lt=timezone.now()
        ).exclude(status='expired')  
        expired_count = expired_sessions.count() 
        # Find very old sessions
        cutoff = timezone.now() - timezone.timedelta(days=days)
        old_sessions = UserSession.objects.filter(
            login_time__lt=cutoff
        )
        old_count = old_sessions.count()
        self.stdout.write(_(f'Found {expired_count} expired sessions'))
        self.stdout.write(_(f'Found {old_count} sessions older than {days} days'))
        if dry_run:
            self.stdout.write(self.style.WARNING('Dry run mode - no changes made'))
            return
        # Update expired sessions
        if expired_count > 0:
            expired_sessions.update(status='expired')
            self.stdout.write(self.style.SUCCESS(f'Updated {expired_count} expired sessions'))
        # Delete old sessions
        if old_count > 0:
            deleted, _ = old_sessions.delete()
            self.stdout.write(self.style.SUCCESS(f'Deleted {deleted} old sessions'))
        self.stdout.write(self.style.SUCCESS('Session cleanup completed'))