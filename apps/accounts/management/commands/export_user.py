"""
Export users to CSV/JSON.
Usage: python manage.py export_users --format csv --output users.csv
"""

import csv
import json
import os
from django.core.management.base import BaseCommand
from django.utils.translation import gettext_lazy as _

from apps.accounts.models import User


class Command(BaseCommand):
    """
    Export users to CSV or JSON.
    """
    help = 'Export users to CSV or JSON'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--format',
            type=str,
            choices=['csv', 'json'],
            default='csv',
            help='Output format (csv or json)'
        )
        parser.add_argument(
            '--output',
            type=str,
            required=True,
            help='Output file path'
        )
        parser.add_argument(
            '--tenant-id',
            type=str,
            help='Filter by tenant ID'
        )
        parser.add_argument(
            '--role',
            type=str,
            help='Filter by role'
        )
        parser.add_argument(
            '--active-only',
            action='store_true',
            help='Export only active users'
        )
    
    def handle(self, *args, **options):
        output_format = options['format']
        output_path = options['output']
        tenant_id = options.get('tenant_id')
        role = options.get('role')
        active_only = options.get('active_only')
        
        # Build queryset
        queryset = User.objects.filter(is_deleted=False)
        
        if tenant_id:
            queryset = queryset.filter(tenant_id=tenant_id)
        
        if role:
            queryset = queryset.filter(role=role)
        
        if active_only:
            queryset = queryset.filter(is_active=True)
        
        count = queryset.count()
        self.stdout.write(_(f'Exporting {count} users to {output_path}'))
        
        # Prepare data
        users_data = []
        for user in queryset:
            users_data.append({
                'id': str(user.id),
                'email': user.email,
                'username': user.username,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'role': user.role,
                'is_active': user.is_active,
                'is_verified': user.is_verified,
                'mfa_enabled': user.mfa_enabled,
                'tenant_id': str(user.tenant_id),
                'created_at': user.created_at.isoformat() if user.created_at else '',
                'last_login': user.last_login.isoformat() if user.last_login else ''
            })
        
        # Create output directory if needed
        os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
        
        # Write to file
        if output_format == 'csv':
            with open(output_path, 'w', newline='', encoding='utf-8') as f:
                writer = csv.DictWriter(f, fieldnames=users_data[0].keys())
                writer.writeheader()
                writer.writerows(users_data)
        
        elif output_format == 'json':
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(users_data, f, indent=2, default=str)
        
        self.stdout.write(self.style.SUCCESS(f'Successfully exported {count} users to {output_path}'))