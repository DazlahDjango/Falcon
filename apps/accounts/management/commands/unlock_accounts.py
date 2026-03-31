"""
Unlock locked user accounts.
Usage: python manage.py unlock_accounts
"""

from django.core.management.base import BaseCommand
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

from apps.accounts.models import User


class Command(BaseCommand):
    """
    Unlock locked user accounts.
    """
    help = 'Unlock locked user accounts'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--user-id',
            type=str,
            help='Unlock specific user by ID'
        )
        parser.add_argument(
            '--email',
            type=str,
            help='Unlock specific user by email'
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be unlocked without actually unlocking'
        )
    
    def handle(self, *args, **options):
        user_id = options.get('user_id')
        email = options.get('email')
        dry_run = options.get('dry_run')
        
        if user_id:
            try:
                user = User.objects.get(id=user_id)
                users = [user]
            except User.DoesNotExist:
                self.stdout.write(self.style.ERROR(f'User with ID {user_id} not found'))
                return
        
        elif email:
            try:
                user = User.objects.get(email__iexact=email)
                users = [user]
            except User.DoesNotExist:
                self.stdout.write(self.style.ERROR(f'User with email {email} not found'))
                return
        
        else:
            # Find all locked accounts
            users = User.objects.filter(locked_until__lt=timezone.now(), locked_until__isnull=False)
        
        if not users:
            self.stdout.write(self.style.SUCCESS('No locked accounts found'))
            return
        
        self.stdout.write(_(f'\nFound {len(users)} locked accounts:'))
        
        for user in users:
            self.stdout.write(f'  - {user.email} (locked until: {user.locked_until})')
        
        if dry_run:
            self.stdout.write(self.style.WARNING('\nDry run mode - no changes made'))
            return
        
        # Unlock accounts
        unlocked_count = 0
        for user in users:
            user.reset_login_attempts()
            unlocked_count += 1
        
        self.stdout.write(self.style.SUCCESS(f'\nUnlocked {unlocked_count} accounts'))