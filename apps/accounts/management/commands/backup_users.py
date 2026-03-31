"""
Backup users to a secure location.
Usage: python manage.py backup_users --output backup.json
"""

import json
import os
import gzip
from datetime import datetime
from django.core.management.base import BaseCommand
from django.core.management import call_command
from django.utils.translation import gettext_lazy as _

from apps.accounts.models import User, Profile, UserPreference


class Command(BaseCommand):
    """
    Backup users and related data.
    """
    help = 'Backup users and related data'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--output',
            type=str,
            help='Output file path (without extension)'
        )
        parser.add_argument(
            '--compress',
            action='store_true',
            default=True,
            help='Compress output with gzip (default: True)'
        )
        parser.add_argument(
            '--tenant-id',
            type=str,
            help='Backup only specific tenant'
        )
    
    def handle(self, *args, **options):
        output_path = options.get('output')
        compress = options['compress']
        tenant_id = options.get('tenant_id')
        
        if not output_path:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            output_path = f'backup_users_{timestamp}'
        
        # Build backup data
        backup_data = {
            'exported_at': datetime.now().isoformat(),
            'version': '1.0',
            'tenant_id': tenant_id,
            'users': []
        }
        
        # Get users
        queryset = User.objects.filter(is_deleted=False)
        if tenant_id:
            queryset = queryset.filter(tenant_id=tenant_id)
        
        for user in queryset:
            user_data = {
                'user': {
                    'id': str(user.id),
                    'email': user.email,
                    'username': user.username,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'phone': user.phone,
                    'role': user.role,
                    'is_active': user.is_active,
                    'is_verified': user.is_verified,
                    'tenant_id': str(user.tenant_id),
                    'created_at': user.created_at.isoformat() if user.created_at else None
                },
                'profile': None,
                'preferences': None
            }
            
            # Get profile
            profile = Profile.objects.filter(user=user).first()
            if profile:
                user_data['profile'] = {
                    'avatar': profile.avatar.name if profile.avatar else None,
                    'bio': profile.bio,
                    'employee_type': profile.employee_type,
                    'skills': profile.skills,
                    'certifications': profile.certifications
                }
            
            # Get preferences
            preferences = UserPreference.objects.filter(user=user).first()
            if preferences:
                user_data['preferences'] = {
                    'notification_settings': preferences.notification_settings,
                    'dashboard_preferences': preferences.dashboard_preferences,
                    'items_per_page': preferences.items_per_page
                }
            
            backup_data['users'].append(user_data)
        
        # Write to file
        json_str = json.dumps(backup_data, indent=2, default=str)
        
        if compress:
            output_file = f'{output_path}.json.gz'
            with gzip.open(output_file, 'wt', encoding='utf-8') as f:
                f.write(json_str)
        else:
            output_file = f'{output_path}.json'
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(json_str)
        
        self.stdout.write(self.style.SUCCESS(f'Backup completed: {output_file}'))
        self.stdout.write(f'Users backed up: {len(backup_data["users"])}')