"""
Clean up old audit logs.
Usage: python manage.py cleanup_audit_logs --days 365
"""

from django.core.management.base import BaseCommand
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

from apps.accounts.models import AuditLog, LoginAttempt, MFAAuditLog


class Command(BaseCommand):
    """
    Clean up old audit logs.
    """
    help = 'Clean up old audit logs'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--days',
            type=int,
            default=365,
            help='Delete logs older than this many days (default: 365)'
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be deleted without actually deleting'
        )
        parser.add_argument(
            '--keep-security',
            action='store_true',
            default=True,
            help='Keep security-related logs longer (default: True)'
        )
    
    def handle(self, *args, **options):
        days = options['days']
        dry_run = options['dry_run']
        keep_security = options['keep_security']
        
        cutoff = timezone.now() - timezone.timedelta(days=days)
        
        # Audit logs
        audit_logs = AuditLog.objects.filter(timestamp__lt=cutoff)
        if keep_security:
            # Keep security logs (critical, error, warning) longer
            audit_logs = audit_logs.exclude(severity__in=['critical', 'error', 'warning'])
        
        audit_count = audit_logs.count()
        
        # Login attempts
        login_attempts = LoginAttempt.objects.filter(attempted_at__lt=cutoff)
        login_count = login_attempts.count()
        
        # MFA audit logs
        mfa_logs = MFAAuditLog.objects.filter(created_at__lt=cutoff)
        mfa_count = mfa_logs.count()
        
        self.stdout.write(_(f'\nFound records older than {days} days:'))
        self.stdout.write(_(f'  Audit logs: {audit_count}'))
        self.stdout.write(_(f'  Login attempts: {login_count}'))
        self.stdout.write(_(f'  MFA audit logs: {mfa_count}'))
        
        if dry_run:
            self.stdout.write(self.style.WARNING('\nDry run mode - no changes made'))
            return
        
        # Delete
        if audit_count > 0:
            deleted, _ = audit_logs.delete()
            self.stdout.write(self.style.SUCCESS(f'Deleted {deleted} audit logs'))
        
        if login_count > 0:
            deleted, _ = login_attempts.delete()
            self.stdout.write(self.style.SUCCESS(f'Deleted {deleted} login attempts'))
        
        if mfa_count > 0:
            deleted, _ = mfa_logs.delete()
            self.stdout.write(self.style.SUCCESS(f'Deleted {deleted} MFA audit logs'))
        
        self.stdout.write(self.style.SUCCESS('\nCleanup completed'))