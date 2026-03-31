"""
Rotate JWT secrets and other sensitive keys.
Usage: python manage.py rotate_secrets
"""

import secrets
import os
from django.core.management.base import BaseCommand
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from apps.accounts.models import SessionBlacklist

class Command(BaseCommand):
    help = 'Rotate JWT secrets and other sensitive keys'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force rotation without confirmation'
        )
        parser.add_argument(
            '--blacklist-old',
            action='store_true',
            default=True,
            help='Blacklist existing tokens (default: True)'
        )
    def handle(self, *args, **options):
        force = options['force']
        blacklist_old = options['blacklist_old']
        if not force:
            self.stdout.write(self.style.WARNING(_('\n⚠️  WARNING: Rotating JWT secrets will invalidate all existing tokens')))
            self.stdout.write(_('All users will need to log in again.\n'))
            confirm = input(_('Are you sure you want to continue? (yes/no): '))   
            if confirm.lower() != 'yes':
                self.stdout.write(_('Operation cancelled'))
                return
        # Generate new secret
        new_secret = secrets.token_urlsafe(64)
        # Update .env file
        env_path = os.path.join(settings.BASE_DIR, '.env')
        try:
            with open(env_path, 'r') as f:
                env_lines = f.readlines()
        except FileNotFoundError:
            env_lines = []
        # Update or add JWT_SECRET_KEY
        updated = False
        for i, line in enumerate(env_lines):
            if line.startswith('JWT_SECRET_KEY='):
                env_lines[i] = f'JWT_SECRET_KEY={new_secret}\n'
                updated = True
                break
        if not updated:
            env_lines.append(f'JWT_SECRET_KEY={new_secret}\n')
        # Write back
        with open(env_path, 'w') as f:
            f.writelines(env_lines)
        self.stdout.write(self.style.SUCCESS(f'New JWT secret generated: {new_secret[:20]}...'))
        # Blacklist existing tokens
        if blacklist_old:
            # Blacklist all outstanding refresh tokens
            from rest_framework_simplejwt.token_blacklist.models import OutstandingToken
            outstanding = OutstandingToken.objects.all()
            count = outstanding.count()
            for token in outstanding:
                SessionBlacklist.objects.get_or_create(
                    token_id=token.jti,
                    defaults={
                        'token_type': 'refresh',
                        'expires_at': token.expires_at,
                        'reason': 'secret_rotation'
                    }
                )
            self.stdout.write(self.style.SUCCESS(f'Blacklisted {count} existing tokens'))
        self.stdout.write(self.style.SUCCESS('\nSecret rotation completed successfully'))
        self.stdout.write(_('Note: You must restart the application for changes to take effect'))