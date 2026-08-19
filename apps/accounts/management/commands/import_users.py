"""
Import users in bulk from a CSV file.
Usage:
    python manage.py import_users --file accs.csv --admin careen@falcontech.com
"""

import os
from django.core.management.base import BaseCommand, CommandError
from django.db import connection
from apps.accounts.models import User
from apps.accounts.services.registration.bulk import BulkUserImportService


class Command(BaseCommand):
    help = 'Import users from a CSV file attached to a specific Client Admin or Super Admin tenant.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--file',
            '-f',
            type=str,
            default='accs.csv',
            help='Path to the CSV file containing user data (default: accs.csv)'
        )
        parser.add_argument(
            '--admin',
            '-a',
            type=str,
            required=True,
            help='Email of the Admin user performing the import (e.g., careen@falcontech.com)'
        )
        parser.add_argument(
            '--tenant-id',
            '-t',
            type=str,
            default=None,
            help='Optional explicit tenant ID override'
        )

    def handle(self, *args, **options):
        file_path = options['file']
        admin_email = options['admin']
        tenant_id = options.get('tenant_id')

        # Ensure search_path is public for tenant routing
        with connection.cursor() as cursor:
            cursor.execute('SET search_path TO "public"')

        # Find Admin user
        try:
            admin_user = User.objects.get(email__iexact=admin_email, is_deleted=False)
        except User.DoesNotExist:
            raise CommandError(f"Admin user with email '{admin_email}' not found.")

        # Determine target tenant_id
        if not tenant_id:
            if admin_user.tenant_id:
                tenant_id = str(admin_user.tenant_id)
            else:
                raise CommandError(f"Admin user '{admin_email}' has no assigned tenant_id. Please specify --tenant-id.")

        # Verify CSV file existence
        if not os.path.exists(file_path):
            raise CommandError(f"File not found: '{file_path}'")

        self.stdout.write(self.style.MIGRATE_HEADING(
            f"[START] Starting bulk user import from '{file_path}' for tenant '{tenant_id}' (Admin: {admin_user.email})..."
        ))

        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                file_content = f.read()
        except Exception as e:
            raise CommandError(f"Failed to read file '{file_path}': {str(e)}")

        # Execute Bulk Import Service
        service = BulkUserImportService()
        success_count, errors, imported_data = service.import_users_from_csv(
            file_content=file_content,
            tenant_id=tenant_id,
            request_user=admin_user
        )

        # Output results
        if success_count > 0:
            self.stdout.write(self.style.SUCCESS(
                f"\n[SUCCESS] Successfully imported {success_count} user(s) into tenant '{tenant_id}'!"
            ))
            for idx, user_info in enumerate(imported_data, start=1):
                raw_pwd_info = f" -- Password: {user_info['raw_password']}" if user_info.get('raw_password') else ""
                self.stdout.write(
                    f"  {idx}. {user_info['email']} ({user_info['username']}) -- Role: {user_info['role']}{raw_pwd_info}"
                )

        if errors:
            self.stdout.write(self.style.ERROR(f"\n[ERROR] Encountered {len(errors)} error(s) during import:"))
            for err in errors:
                self.stdout.write(self.style.WARNING(f"  * {err}"))

        if success_count == 0 and not errors:
            self.stdout.write(self.style.NOTICE("No users were processed."))
