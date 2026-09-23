"""
Comprehensive Management Command for Falcon PMS Accounts & User Management.
Handles:
- Single-user actions: activate, deactivate, lock, unlock, verify, unverify, set-password, set-role, delete, info
- Tenant/batch user actions: list, activate-all, deactivate-all, unlock-all, verify-all, reset-passwords
- Invitations: invite, list-invitations, revoke-invitation
- Bulk operations: import (from CSV inheriting tenant_id from client_admin), export (to CSV/JSON)

Usage:
    python manage.py manage_user list --tenant-id <tenant_id>
    python manage.py manage_user info --email user@example.com
    python manage.py manage_user activate --email user@example.com
    python manage.py manage_user deactivate --email user@example.com
    python manage.py manage_user lock --email user@example.com --hours 24
    python manage.py manage_user unlock --email user@example.com
    python manage.py manage_user verify --email user@example.com
    python manage.py manage_user set-password --email user@example.com --password NewPass123!
    python manage.py manage_user set-role --email user@example.com --role staff
    python manage.py manage_user delete --email user@example.com
    python manage.py manage_user reset-passwords --admin careen@falcontech.com --password Admin@123
    python manage.py manage_user invite --email new@example.com --role staff --admin careen@falcontech.com
    python manage.py manage_user list-invitations --admin careen@falcontech.com
    python manage.py manage_user revoke-invitation --invitation-id <id> --admin careen@falcontech.com
    python manage.py manage_user import --file users.csv --admin careen@falcontech.com
    python manage.py manage_user export --output users.csv --admin careen@falcontech.com --format csv
"""

import os
import sys
import csv
import json
import secrets
from datetime import timedelta
from typing import Optional, List, Dict

if sys.stdout.encoding != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

from django.core.management.base import BaseCommand, CommandError
from django.db import connection, transaction
from django.utils import timezone
from django.db.models import Q

from apps.accounts.models import User
from apps.accounts.models.session import UserSession
from apps.accounts.services.registration.bulk import BulkUserImportService
from apps.accounts.services.registration.invitation import InvitationService
from apps.accounts.services.audit.logger import AuditService


class Command(BaseCommand):
    help = 'Comprehensive management command for all user operations, invitations, imports, and exports.'

    def add_arguments(self, parser):
        subparsers = parser.add_subparsers(dest='action', required=True, help='Action to perform')

        # ---------------- LIST ----------------
        list_parser = subparsers.add_parser('list', help='List users with filters')
        list_parser.add_argument('--tenant-id', '-t', type=str, help='Filter by tenant ID')
        list_parser.add_argument('--admin', '-a', type=str, help='Filter by admin user\'s tenant')
        list_parser.add_argument('--role', '-r', type=str, help='Filter by role')
        list_parser.add_argument('--status', '-s', type=str, choices=['active', 'inactive', 'verified', 'unverified', 'locked'], help='Filter by status')
        list_parser.add_argument('--search', '-q', type=str, help='Search query (email, username, name)')
        list_parser.add_argument('--limit', '-l', type=int, default=50, help='Maximum number of users to show (default 50)')

        # ---------------- INFO ----------------
        info_parser = subparsers.add_parser('info', help='Display detailed profile of a single user')
        info_parser.add_argument('--email', '-e', type=str, help='User email')
        info_parser.add_argument('--user-id', '-u', type=str, help='User UUID')

        # ---------------- CREATE ----------------
        create_parser = subparsers.add_parser('create', help='Create a new user')
        create_parser.add_argument('--email', '-e', type=str, required=True, help='Email address')
        create_parser.add_argument('--username', type=str, help='Username (defaults to email)')
        create_parser.add_argument('--role', '-r', type=str, default='staff', help='User role (default: staff)')
        create_parser.add_argument('--admin', '-a', type=str, help='Admin email to inherit tenant ID from')
        create_parser.add_argument('--tenant-id', '-t', type=str, help='Explicit tenant ID')
        create_parser.add_argument('--first-name', type=str, default='', help='First name')
        create_parser.add_argument('--last-name', type=str, default='', help='Last name')
        create_parser.add_argument('--password', '-p', type=str, help='Password (auto-generated if omitted)')
        create_parser.add_argument('--verified', action='store_true', default=True, help='Mark user as verified')

        # ---------------- ACTIVATE / DEACTIVATE ----------------
        act_parser = subparsers.add_parser('activate', help='Activate a user or all users in tenant')
        act_parser.add_argument('--email', '-e', type=str, help='User email')
        act_parser.add_argument('--user-id', '-u', type=str, help='User UUID')
        act_parser.add_argument('--tenant-id', '-t', type=str, help='Target all users in tenant')
        act_parser.add_argument('--admin', '-a', type=str, help='Target all users under admin\'s tenant')
        act_parser.add_argument('--all', action='store_true', help='Target all users system-wide')

        deact_parser = subparsers.add_parser('deactivate', help='Deactivate a user or all users in tenant')
        deact_parser.add_argument('--email', '-e', type=str, help='User email')
        deact_parser.add_argument('--user-id', '-u', type=str, help='User UUID')
        deact_parser.add_argument('--tenant-id', '-t', type=str, help='Target all users in tenant')
        deact_parser.add_argument('--admin', '-a', type=str, help='Target all users under admin\'s tenant')
        deact_parser.add_argument('--all', action='store_true', help='Target all users system-wide')

        # ---------------- LOCK / UNLOCK ----------------
        lock_parser = subparsers.add_parser('lock', help='Lock user account')
        lock_parser.add_argument('--email', '-e', type=str, help='User email')
        lock_parser.add_argument('--user-id', '-u', type=str, help='User UUID')
        lock_parser.add_argument('--hours', type=int, default=24, help='Lock duration in hours (default 24)')

        unlock_parser = subparsers.add_parser('unlock', help='Unlock user account(s)')
        unlock_parser.add_argument('--email', '-e', type=str, help='User email')
        unlock_parser.add_argument('--user-id', '-u', type=str, help='User UUID')
        unlock_parser.add_argument('--tenant-id', '-t', type=str, help='Target all users in tenant')
        unlock_parser.add_argument('--admin', '-a', type=str, help='Target all users under admin\'s tenant')
        unlock_parser.add_argument('--all', action='store_true', help='Target all locked users system-wide')

        # ---------------- VERIFY / UNVERIFY ----------------
        ver_parser = subparsers.add_parser('verify', help='Verify user email/identity')
        ver_parser.add_argument('--email', '-e', type=str, help='User email')
        ver_parser.add_argument('--user-id', '-u', type=str, help='User UUID')
        ver_parser.add_argument('--tenant-id', '-t', type=str, help='Target all users in tenant')
        ver_parser.add_argument('--admin', '-a', type=str, help='Target all users under admin\'s tenant')
        ver_parser.add_argument('--all', action='store_true', help='Target all unverified users system-wide')

        unver_parser = subparsers.add_parser('unverify', help='Mark user as unverified')
        unver_parser.add_argument('--email', '-e', type=str, help='User email')
        unver_parser.add_argument('--user-id', '-u', type=str, help='User UUID')

        # ---------------- SET PASSWORD ----------------
        pwd_parser = subparsers.add_parser('set-password', help='Set password for a user')
        pwd_parser.add_argument('--email', '-e', type=str, help='User email')
        pwd_parser.add_argument('--user-id', '-u', type=str, help='User UUID')
        pwd_parser.add_argument('--password', '-p', type=str, help='New password (auto-generated if omitted)')

        # ---------------- SET ROLE ----------------
        role_parser = subparsers.add_parser('set-role', help='Change user role')
        role_parser.add_argument('--email', '-e', type=str, help='User email')
        role_parser.add_argument('--user-id', '-u', type=str, help='User UUID')
        role_parser.add_argument('--role', '-r', type=str, required=True, choices=[r[0] for r in User.ROLE_CHOICES], help='New role')

        # ---------------- DELETE ----------------
        del_parser = subparsers.add_parser('delete', help='Soft-delete a user')
        del_parser.add_argument('--email', '-e', type=str, help='User email')
        del_parser.add_argument('--user-id', '-u', type=str, help='User UUID')
        del_parser.add_argument('--hard', action='store_true', help='Permanently remove from database')

        # ---------------- RESET PASSWORDS (BATCH) ----------------
        reset_pwd_parser = subparsers.add_parser('reset-passwords', help='Reset passwords for all users in tenant or role')
        reset_pwd_parser.add_argument('--admin', '-a', type=str, help='Admin email to identify target tenant')
        reset_pwd_parser.add_argument('--tenant-id', '-t', type=str, help='Target tenant ID')
        reset_pwd_parser.add_argument('--password', '-p', type=str, default='Admin@123', help='Password to set (default: Admin@123)')
        reset_pwd_parser.add_argument('--role', '-r', type=str, help='Filter by specific role')

        # ---------------- INVITATIONS ----------------
        invite_parser = subparsers.add_parser('invite', help='Invite a new user to tenant')
        invite_parser.add_argument('--email', '-e', type=str, required=True, help='Invitee email')
        invite_parser.add_argument('--role', '-r', type=str, default='staff', help='Assigned role (default: staff)')
        invite_parser.add_argument('--admin', '-a', type=str, required=True, help='Admin email inviting the user (inherits tenant_id)')
        invite_parser.add_argument('--first-name', type=str, default='', help='First name')
        invite_parser.add_argument('--last-name', type=str, default='', help='Last name')
        invite_parser.add_argument('--message', '-m', type=str, default='', help='Personal message')

        list_inv_parser = subparsers.add_parser('list-invitations', help='List pending invitations')
        list_inv_parser.add_argument('--admin', '-a', type=str, help='Admin email (filters by admin\'s tenant)')
        list_inv_parser.add_argument('--tenant-id', '-t', type=str, help='Target tenant ID')

        revoke_inv_parser = subparsers.add_parser('revoke-invitation', help='Revoke/cancel a pending invitation')
        revoke_inv_parser.add_argument('--invitation-id', '-i', type=str, required=True, help='Invitation ID or token hash')
        revoke_inv_parser.add_argument('--admin', '-a', type=str, help='Admin performing revocation')

        # ---------------- IMPORT / EXPORT ----------------
        import_parser = subparsers.add_parser('import', help='Bulk import users from CSV file')
        import_parser.add_argument('--file', '-f', type=str, default='accs.csv', help='Path to CSV file (default: accs.csv)')
        import_parser.add_argument('--admin', '-a', type=str, required=True, help='Admin email performing import (inherits tenant_id)')
        import_parser.add_argument('--tenant-id', '-t', type=str, help='Explicit tenant ID override')

        export_parser = subparsers.add_parser('export', help='Export users to CSV or JSON')
        export_parser.add_argument('--output', '-o', type=str, required=True, help='Output file path')
        export_parser.add_argument('--format', choices=['csv', 'json'], default='csv', help='Output format (csv or json)')
        export_parser.add_argument('--admin', '-a', type=str, help='Filter by admin\'s tenant')
        export_parser.add_argument('--tenant-id', '-t', type=str, help='Filter by tenant ID')
        export_parser.add_argument('--role', '-r', type=str, help='Filter by role')
        export_parser.add_argument('--active-only', action='store_true', help='Export active users only')

    def handle(self, *args, **options):
        # Ensure search_path is public
        with connection.cursor() as cursor:
            cursor.execute('SET search_path TO "public"')

        action = options['action']
        handler_map = {
            'list': self.handle_list,
            'info': self.handle_info,
            'create': self.handle_create,
            'activate': self.handle_activate,
            'deactivate': self.handle_deactivate,
            'lock': self.handle_lock,
            'unlock': self.handle_unlock,
            'verify': self.handle_verify,
            'unverify': self.handle_unverify,
            'set-password': self.handle_set_password,
            'set-role': self.handle_set_role,
            'delete': self.handle_delete,
            'reset-passwords': self.handle_reset_passwords,
            'invite': self.handle_invite,
            'list-invitations': self.handle_list_invitations,
            'revoke-invitation': self.handle_revoke_invitation,
            'import': self.handle_import,
            'export': self.handle_export,
        }

        handler = handler_map.get(action)
        if handler:
            handler(options)
        else:
            raise CommandError(f"Unknown action: {action}")

    # =========================================================================
    # HELPER METHODS
    # =========================================================================

    def _resolve_tenant_id(self, options: Dict) -> Optional[str]:
        tenant_id = options.get('tenant_id')
        admin_email = options.get('admin')
        if admin_email:
            try:
                admin_user = User.objects.get(email__iexact=admin_email, is_deleted=False)
                if admin_user.tenant_id:
                    return str(admin_user.tenant_id)
                elif admin_user.role == 'super_admin' and not tenant_id:
                    return None
                elif not tenant_id:
                    raise CommandError(f"Admin '{admin_email}' has no tenant_id. Please specify --tenant-id.")
            except User.DoesNotExist:
                raise CommandError(f"Admin user with email '{admin_email}' not found.")
        return tenant_id

    def _get_single_user(self, options: Dict) -> User:
        email = options.get('email')
        user_id = options.get('user_id')
        if not email and not user_id:
            raise CommandError("Please specify either --email or --user-id.")

        qs = User.objects.all()
        if email:
            qs = qs.filter(email__iexact=email)
        if user_id:
            qs = qs.filter(id=user_id)

        user = qs.first()
        if not user:
            raise CommandError(f"User not found for identifier (email: {email}, id: {user_id}).")
        return user

    def _get_target_users(self, options: Dict) -> List[User]:
        email = options.get('email')
        user_id = options.get('user_id')
        if email or user_id:
            return [self._get_single_user(options)]

        tenant_id = self._resolve_tenant_id(options)
        is_all = options.get('all', False)

        if not tenant_id and not is_all:
            raise CommandError("Please specify a user (--email / --user-id), a tenant (--tenant-id / --admin), or --all.")

        qs = User.objects.filter(is_deleted=False)
        if tenant_id:
            qs = qs.filter(tenant_id=tenant_id)
        return list(qs)

    # =========================================================================
    # ACTION HANDLERS
    # =========================================================================

    def handle_list(self, options):
        tenant_id = self._resolve_tenant_id(options)
        role = options.get('role')
        status = options.get('status')
        search = options.get('search')
        limit = options.get('limit', 50)

        qs = User.objects.filter(is_deleted=False).order_by('-created_at')

        if tenant_id:
            qs = qs.filter(tenant_id=tenant_id)
        if role:
            qs = qs.filter(role=role)
        if search:
            qs = qs.filter(
                Q(email__icontains=search) |
                Q(username__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search)
            )

        if status == 'active':
            qs = qs.filter(is_active=True)
        elif status == 'inactive':
            qs = qs.filter(is_active=False)
        elif status == 'verified':
            qs = qs.filter(is_verified=True)
        elif status == 'unverified':
            qs = qs.filter(is_verified=False)
        elif status == 'locked':
            qs = qs.filter(locked_until__gt=timezone.now())

        total_count = qs.count()
        users = list(qs[:limit])

        self.stdout.write(self.style.MIGRATE_HEADING(
            f"\n{'=' * 95}\n[USERS] USER DIRECTORY (Showing {len(users)} of {total_count} matching users)\n{'=' * 95}"
        ))

        header = f"{'Email':<32} {'Full Name':<20} {'Role':<14} {'Active':<8} {'Verified':<10} {'Locked':<8} {'MFA':<6}"
        self.stdout.write(self.style.NOTICE(header))
        self.stdout.write("-" * 95)

        for u in users:
            is_locked = "Yes" if u.is_locked() else "No"
            is_act = "Yes" if u.is_active else "No"
            is_ver = "Yes" if u.is_verified else "No"
            mfa = "On" if u.mfa_enabled else "Off"
            full_name = f"{u.first_name} {u.last_name}".strip() or "-"

            act_colored = self.style.SUCCESS(is_act) if is_act == "Yes" else self.style.ERROR(is_act)
            ver_colored = self.style.SUCCESS(is_ver) if is_ver == "Yes" else self.style.WARNING(is_ver)
            lock_colored = self.style.ERROR(is_locked) if is_locked == "Yes" else is_locked

            row = f"{u.email:<32} {full_name[:18]:<20} {u.role:<14} {is_act:<8} {is_ver:<10} {is_locked:<8} {mfa:<6}"
            self.stdout.write(row)

        self.stdout.write("=" * 95 + "\n")

    def handle_info(self, options):
        user = self._get_single_user(options)
        devices_count = user.auth_devices.filter(is_active=True).count()
        active_sessions = UserSession.objects.filter(user=user, status='active', expires_at__gt=timezone.now()).count()

        self.stdout.write(self.style.MIGRATE_HEADING(f"\n{'=' * 70}\n[USER PROFILE] {user.email}\n{'=' * 70}"))
        self.stdout.write(f"  * ID:                 {user.id}")
        self.stdout.write(f"  * Email:              {user.email}")
        self.stdout.write(f"  * Username:           {user.username}")
        self.stdout.write(f"  * Full Name:          {user.first_name} {user.last_name}")
        self.stdout.write(f"  * Role:               {user.get_role_display()} ({user.role})")
        self.stdout.write(f"  * Tenant ID:          {user.tenant_id or 'System-wide / None'}")
        self.stdout.write(f"  * Status:             {'Active' if user.is_active else 'Inactive'}")
        self.stdout.write(f"  * Verification:       {'Verified' if user.is_verified else 'Unverified'}")
        self.stdout.write(f"  * Lock Status:        {'LOCKED until ' + str(user.locked_until) if user.is_locked() else 'Unlocked'}")
        self.stdout.write(f"  * MFA Enabled:        {'Yes' if user.mfa_enabled else 'No'} ({devices_count} active device(s))")
        self.stdout.write(f"  * Active Sessions:    {active_sessions}")
        self.stdout.write(f"  * Last Login:         {user.last_login or 'Never'}")
        self.stdout.write(f"  * Created At:         {user.created_at}")
        self.stdout.write("=" * 70 + "\n")

    def handle_create(self, options):
        email = options['email']
        username = options.get('username') or email
        role = options['role']
        first_name = options.get('first_name', '')
        last_name = options.get('last_name', '')
        tenant_id = self._resolve_tenant_id(options)
        verified = options.get('verified', True)
        raw_password = options.get('password') or secrets.token_urlsafe(12)

        if User.objects.filter(email__iexact=email).exists():
            raise CommandError(f"User with email '{email}' already exists.")

        user = User.objects.create_user(
            username=username,
            email=email,
            password=raw_password,
            first_name=first_name,
            last_name=last_name,
            role=role,
            tenant_id=tenant_id,
            is_active=True,
            is_verified=verified
        )

        self.stdout.write(self.style.SUCCESS(
            f"\n[SUCCESS] User created successfully!\n"
            f"  * Email:    {user.email}\n"
            f"  * Username: {user.username}\n"
            f"  * Role:     {user.role}\n"
            f"  * Tenant:   {user.tenant_id}\n"
            f"  * Password: {raw_password}\n"
        ))

    def handle_activate(self, options):
        users = self._get_target_users(options)
        count = 0
        with transaction.atomic():
            for u in users:
                if not u.is_active:
                    u.is_active = True
                    u.save(update_fields=['is_active'])
                    count += 1
        self.stdout.write(self.style.SUCCESS(f"[SUCCESS] Activated {count} user(s)."))

    def handle_deactivate(self, options):
        users = self._get_target_users(options)
        count = 0
        with transaction.atomic():
            for u in users:
                if u.is_active:
                    u.is_active = False
                    u.save(update_fields=['is_active'])
                    count += 1
        self.stdout.write(self.style.SUCCESS(f"[SUCCESS] Deactivated {count} user(s)."))

    def handle_lock(self, options):
        user = self._get_single_user(options)
        hours = options.get('hours', 24)
        user.locked_until = timezone.now() + timedelta(hours=hours)
        user.save(update_fields=['locked_until'])
        self.stdout.write(self.style.SUCCESS(f"[SUCCESS] User '{user.email}' locked until {user.locked_until}."))

    def handle_unlock(self, options):
        users = self._get_target_users(options)
        count = 0
        with transaction.atomic():
            for u in users:
                if u.locked_until or u.login_attempts > 0:
                    u.locked_until = None
                    u.login_attempts = 0
                    u.save(update_fields=['locked_until', 'login_attempts'])
                    count += 1
        self.stdout.write(self.style.SUCCESS(f"[SUCCESS] Unlocked {count} user(s)."))

    def handle_verify(self, options):
        users = self._get_target_users(options)
        count = 0
        with transaction.atomic():
            for u in users:
                if not u.is_verified:
                    u.is_verified = True
                    u.verified_at = timezone.now()
                    u.save(update_fields=['is_verified', 'verified_at'])
                    count += 1
        self.stdout.write(self.style.SUCCESS(f"[SUCCESS] Verified {count} user(s)."))

    def handle_unverify(self, options):
        user = self._get_single_user(options)
        user.is_verified = False
        user.verified_at = None
        user.save(update_fields=['is_verified', 'verified_at'])
        self.stdout.write(self.style.SUCCESS(f"[SUCCESS] User '{user.email}' marked as unverified."))

    def handle_set_password(self, options):
        user = self._get_single_user(options)
        password = options.get('password') or secrets.token_urlsafe(12)
        user.set_password(password)
        user.password_change_required = False
        user.save(update_fields=['password', 'password_change_required'])
        self.stdout.write(self.style.SUCCESS(f"[SUCCESS] Password for '{user.email}' updated to: {password}"))

    def handle_set_role(self, options):
        user = self._get_single_user(options)
        new_role = options['role']
        old_role = user.role
        user.role = new_role
        user.save(update_fields=['role'])
        self.stdout.write(self.style.SUCCESS(f"[SUCCESS] Role for '{user.email}' changed from '{old_role}' to '{new_role}'."))

    def handle_delete(self, options):
        user = self._get_single_user(options)
        is_hard = options.get('hard', False)
        email = user.email
        if is_hard:
            user.delete()
            self.stdout.write(self.style.SUCCESS(f"[SUCCESS] Permanently deleted user '{email}'."))
        else:
            user.is_deleted = True
            user.is_active = False
            user.deleted_at = timezone.now()
            user.save(update_fields=['is_deleted', 'is_active', 'deleted_at'])
            self.stdout.write(self.style.SUCCESS(f"[SUCCESS] Soft-deleted user '{email}'."))

    def handle_reset_passwords(self, options):
        tenant_id = self._resolve_tenant_id(options)
        if not tenant_id:
            raise CommandError("Please specify target tenant via --tenant-id or --admin.")

        new_password = options.get('password', 'Admin@123')
        role = options.get('role')

        qs = User.objects.filter(tenant_id=tenant_id, is_deleted=False)
        if role:
            qs = qs.filter(role=role)

        count = qs.count()
        if count == 0:
            self.stdout.write(self.style.WARNING(f"No matching active users found in tenant '{tenant_id}'."))
            return

        with transaction.atomic():
            for u in qs:
                u.set_password(new_password)
                u.password_change_required = False
                u.is_active = True
                u.is_verified = True
                u.save(update_fields=['password', 'password_change_required', 'is_active', 'is_verified'])

        self.stdout.write(self.style.SUCCESS(
            f"\n[SUCCESS] Set password '{new_password}' for {count} user(s) in tenant '{tenant_id}'!"
        ))

    def handle_invite(self, options):
        admin_email = options['admin']
        try:
            admin_user = User.objects.get(email__iexact=admin_email, is_deleted=False)
        except User.DoesNotExist:
            raise CommandError(f"Admin user '{admin_email}' not found.")

        if not admin_user.tenant_id and admin_user.role != 'super_admin':
            raise CommandError(f"Admin user '{admin_email}' has no associated tenant.")

        tenant_id = str(admin_user.tenant_id)
        email = options['email']
        role = options['role']
        first_name = options.get('first_name', '')
        last_name = options.get('last_name', '')
        message = options.get('message', '')

        service = InvitationService()
        success, res_message = service.send_invitation(
            email=email,
            role=role,
            tenant_id=tenant_id,
            invited_by=admin_user,
            message=message
        )

        if success:
            self.stdout.write(self.style.SUCCESS(
                f"\n[SUCCESS] Invitation created and sent to '{email}'!\n"
                f"  * Role:       {role}\n"
                f"  * Tenant ID:  {tenant_id}\n"
                f"  * Invited By: {admin_user.email}\n"
            ))
        else:
            self.stdout.write(self.style.ERROR(f"[ERROR] Failed to send invitation: {res_message}"))

    def handle_list_invitations(self, options):
        tenant_id = self._resolve_tenant_id(options)
        if not tenant_id:
            raise CommandError("Please specify tenant via --tenant-id or --admin.")

        service = InvitationService()
        pending = service.get_pending_invitations(tenant_id=tenant_id)

        self.stdout.write(self.style.MIGRATE_HEADING(
            f"\n{'=' * 85}\n[INVITATIONS] PENDING INVITATIONS (Tenant: {tenant_id}) -- Total: {len(pending)}\n{'=' * 85}"
        ))

        if not pending:
            self.stdout.write(self.style.NOTICE("No pending invitations found."))
            return

        header = f"{'Email':<32} {'Role':<14} {'Invited By':<24} {'Expires At':<15}"
        self.stdout.write(self.style.NOTICE(header))
        self.stdout.write("-" * 85)

        for inv in pending:
            invited_by = inv.get('invited_by', {}).get('email', 'Admin') if isinstance(inv.get('invited_by'), dict) else 'Admin'
            expires = inv.get('expires_at', '')[:10]
            self.stdout.write(f"{inv['email']:<32} {inv.get('role', 'staff'):<14} {invited_by:<24} {expires:<15}")

        self.stdout.write("=" * 85 + "\n")

    def handle_revoke_invitation(self, options):
        inv_id = options['invitation_id']
        service = InvitationService()
        success, msg = service.cancel_invitation(inv_id)
        if success:
            self.stdout.write(self.style.SUCCESS(f"[SUCCESS] Revoked invitation '{inv_id}'."))
        else:
            self.stdout.write(self.style.ERROR(f"[ERROR] Failed to revoke invitation: {msg}"))

    def handle_import(self, options):
        file_path = options['file']
        admin_email = options['admin']
        tenant_id = options.get('tenant_id')

        try:
            admin_user = User.objects.get(email__iexact=admin_email, is_deleted=False)
        except User.DoesNotExist:
            raise CommandError(f"Admin user with email '{admin_email}' not found.")

        if not tenant_id:
            if admin_user.tenant_id:
                tenant_id = str(admin_user.tenant_id)
            else:
                raise CommandError(f"Admin user '{admin_email}' has no assigned tenant_id. Please specify --tenant-id.")

        if not os.path.exists(file_path):
            raise CommandError(f"File not found: '{file_path}'")

        self.stdout.write(self.style.MIGRATE_HEADING(
            f"[START] Bulk user import from '{file_path}' for tenant '{tenant_id}' (Admin: {admin_user.email})..."
        ))

        with open(file_path, 'r', encoding='utf-8') as f:
            file_content = f.read()

        service = BulkUserImportService()
        success_count, errors, imported_data = service.import_users_from_csv(
            file_content=file_content,
            tenant_id=tenant_id,
            request_user=admin_user
        )

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

    def handle_export(self, options):
        output_path = options['output']
        output_format = options.get('format', 'csv')
        tenant_id = self._resolve_tenant_id(options)
        role = options.get('role')
        active_only = options.get('active_only', False)

        qs = User.objects.filter(is_deleted=False)
        if tenant_id:
            qs = qs.filter(tenant_id=tenant_id)
        if role:
            qs = qs.filter(role=role)
        if active_only:
            qs = qs.filter(is_active=True)

        count = qs.count()
        users_data = []
        for user in qs:
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
                'tenant_id': str(user.tenant_id) if user.tenant_id else '',
                'created_at': user.created_at.isoformat() if user.created_at else '',
                'last_login': user.last_login.isoformat() if user.last_login else ''
            })

        os.makedirs(os.path.dirname(os.path.abspath(output_path)) or '.', exist_ok=True)

        if output_format == 'csv':
            with open(output_path, 'w', newline='', encoding='utf-8') as f:
                if users_data:
                    writer = csv.DictWriter(f, fieldnames=users_data[0].keys())
                    writer.writeheader()
                    writer.writerows(users_data)
        elif output_format == 'json':
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(users_data, f, indent=2, default=str)

        self.stdout.write(self.style.SUCCESS(f"[SUCCESS] Exported {count} user(s) to '{output_path}' ({output_format.upper()})."))
