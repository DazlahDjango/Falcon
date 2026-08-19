"""
Reset or set default passwords for all tenant users.
Usage:
    python manage.py reset_user_passwords --password Admin@123 --tenant-id 275adb1f-8e12-46ee-b394-ea42d41b10c9
"""

from django.core.management.base import BaseCommand, CommandError
from django.db import connection, transaction
from apps.accounts.models import User


class Command(BaseCommand):
    help = 'Sets a known default password for all active users in a specified tenant.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--password',
            '-p',
            type=str,
            default='Admin@123',
            help='Password to set for all tenant users (default: Admin@123)'
        )
        parser.add_argument(
            '--tenant-id',
            '-t',
            type=str,
            default='275adb1f-8e12-46ee-b394-ea42d41b10c9',
            help='Tenant ID to target'
        )

    def handle(self, *args, **options):
        new_password = options['password']
        tenant_id = options['tenant_id']

        with connection.cursor() as cursor:
            cursor.execute('SET search_path TO "public"')

        users = User.objects.filter(tenant_id=tenant_id, is_deleted=False)
        if not users.exists():
            raise CommandError(f"No active users found for tenant_id '{tenant_id}'.")

        updated_count = 0
        with transaction.atomic():
            for u in users:
                u.set_password(new_password)
                u.password_change_required = False
                u.is_active = True
                u.is_verified = True
                u.save(update_fields=['password', 'password_change_required', 'is_active', 'is_verified'])
                updated_count += 1

        self.stdout.write(self.style.SUCCESS(
            f"\n[SUCCESS] Set password '{new_password}' for {updated_count} user(s) in tenant '{tenant_id}'!"
        ))
