"""
Comprehensive Management Command for Falcon PMS Password Management.
Handles:
- User-level password actions: status, change, reset, confirm-reset, force-reset, set-password, clear-history, validate
- Tenant-level & Bulk actions: bulk-reset, force-reset-tenant, clear-history-tenant
- Policy & Validation: validate password strength and history compliance

Usage Examples:
    python manage.py manage_password status --email user@example.com
    python manage.py manage_password status --admin careen@falcontech.com
    python manage.py manage_password change --email user@example.com --old-password "OldPass123!" --new-password "NewPass456!"
    python manage.py manage_password reset --email user@example.com
    python manage.py manage_password confirm-reset --token <token> --new-password "FreshPass@2026!"
    python manage.py manage_password force-reset --email user@example.com
    python manage.py manage_password set-password --email user@example.com --password "SecurePass@2026!" --must-change
    python manage.py manage_password bulk-reset --admin careen@falcontech.com --password "Admin@123"
    python manage.py manage_password bulk-reset --tenant-id 275adb1f-8e12-46ee-b394-ea42d41b10c9 --password "Admin@123"
    python manage.py manage_password bulk-reset --all-system --password "Admin@123"
    python manage.py manage_password bulk-reset --admin careen@falcontech.com --mode system_generated --must-change
    python manage.py manage_password clear-history --email user@example.com
    python manage.py manage_password validate --password "MySecretPass123!" --email user@example.com
"""

import sys
import secrets
from typing import Optional, List, Dict

if sys.stdout.encoding != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

from django.core.management.base import BaseCommand, CommandError
from django.db import connection, transaction
from django.utils import timezone

from apps.accounts.models import User
from apps.accounts.models.preferences import TenantPreference
from apps.accounts.services.auth.password import PasswordService
from apps.accounts.services.auth.session import SessionService
from apps.accounts.tasks import send_password_reset_email


class Command(BaseCommand):
    help = 'Comprehensive management command for all Password operations, resets, policies, and history management.'

    def add_arguments(self, parser):
        subparsers = parser.add_subparsers(dest='action', required=True, help='Password action to perform')

        # ---------------- STATUS ----------------
        status_parser = subparsers.add_parser('status', help='View password security status for user, tenant, or system')
        status_parser.add_argument('--email', '-e', type=str, help='User email')
        status_parser.add_argument('--user-id', '-u', type=str, help='User UUID')
        status_parser.add_argument('--tenant-id', '-t', type=str, help='Tenant ID')
        status_parser.add_argument('--admin', '-a', type=str, help='Admin email to identify tenant')

        # ---------------- CHANGE ----------------
        change_parser = subparsers.add_parser('change', help='Change user password with old password verification')
        change_parser.add_argument('--email', '-e', type=str, help='User email')
        change_parser.add_argument('--user-id', '-u', type=str, help='User UUID')
        change_parser.add_argument('--old-password', type=str, required=True, help='Current password')
        change_parser.add_argument('--new-password', type=str, required=True, help='New password')

        # ---------------- RESET (REQUEST) ----------------
        reset_parser = subparsers.add_parser('reset', help='Initiate password reset request and email token')
        reset_parser.add_argument('--email', '-e', type=str, required=True, help='User email')
        reset_parser.add_argument('--print-token', action='store_true', help='Print generated token to console directly')

        # ---------------- CONFIRM RESET ----------------
        confirm_parser = subparsers.add_parser('confirm-reset', help='Confirm password reset with a valid token')
        confirm_parser.add_argument('--token', type=str, required=True, help='Password reset token')
        confirm_parser.add_argument('--new-password', type=str, required=True, help='New password')

        # ---------------- FORCE RESET ----------------
        force_parser = subparsers.add_parser('force-reset', help='Admin force password reset on single user or tenant users')
        force_parser.add_argument('--email', '-e', type=str, help='Target user email')
        force_parser.add_argument('--user-id', '-u', type=str, help='Target user UUID')
        force_parser.add_argument('--tenant-id', '-t', type=str, help='Target tenant ID')
        force_parser.add_argument('--admin', '-a', type=str, help='Admin email to target tenant users')
        force_parser.add_argument('--print-token', action='store_true', help='Print token to stdout')

        # ---------------- SET PASSWORD ----------------
        set_parser = subparsers.add_parser('set-password', help='Directly set user password without requiring old password')
        set_parser.add_argument('--email', '-e', type=str, help='User email')
        set_parser.add_argument('--user-id', '-u', type=str, help='User UUID')
        set_parser.add_argument('--password', '-p', type=str, required=True, help='New raw password')
        set_parser.add_argument('--must-change', action='store_true', help='Force user to change password upon next login')

        # ---------------- BULK RESET ----------------
        bulk_parser = subparsers.add_parser('bulk-reset', help='Bulk reset passwords across tenant users or system-wide')
        bulk_parser.add_argument('--password', '-p', type=str, default='Admin@123', help='Password to set for users (default: Admin@123)')
        bulk_parser.add_argument('--tenant-id', '-t', type=str, help='Tenant ID to target')
        bulk_parser.add_argument('--admin', '-a', type=str, help='Admin email to identify target tenant')
        bulk_parser.add_argument('--all-system', action='store_true', help='Reset passwords for ALL users across the entire system')
        bulk_parser.add_argument('--role', '-r', type=str, help='Filter by specific role (e.g. staff, supervisor, client_admin)')
        bulk_parser.add_argument('--mode', type=str, choices=['uniform', 'system_generated', 'email', 'custom_static'], default='uniform', help='Password generation mode: uniform (use -p), system_generated, email, custom_static')
        bulk_parser.add_argument('--must-change', action='store_true', default=False, help='Require users to change password on next login (default: False)')
        bulk_parser.add_argument('--activate', action='store_true', default=True, help='Ensure users are marked is_active=True (default: True)')
        bulk_parser.add_argument('--verify', action='store_true', default=True, help='Ensure users are marked is_verified=True (default: True)')
        bulk_parser.add_argument('--clear-history', action='store_true', default=True, help='Clear password history records to prevent reuse conflicts')

        # ---------------- CLEAR HISTORY ----------------
        history_parser = subparsers.add_parser('clear-history', help='Clear password history entries')
        history_parser.add_argument('--email', '-e', type=str, help='User email')
        history_parser.add_argument('--user-id', '-u', type=str, help='User UUID')
        history_parser.add_argument('--tenant-id', '-t', type=str, help='Tenant ID to clear history for all tenant users')
        history_parser.add_argument('--admin', '-a', type=str, help='Admin email to target tenant users')

        # ---------------- VALIDATE ----------------
        val_parser = subparsers.add_parser('validate', help='Validate password strength and reuse against policy')
        val_parser.add_argument('--password', '-p', type=str, required=True, help='Password string to validate')
        val_parser.add_argument('--email', '-e', type=str, help='Optional user email to check reuse history against')

    def handle(self, *args, **options):
        action = options.get('action')
        try:
            if action == 'status':
                self.handle_status(options)
            elif action == 'change':
                self.handle_change(options)
            elif action == 'reset':
                self.handle_reset(options)
            elif action == 'confirm-reset':
                self.handle_confirm_reset(options)
            elif action == 'force-reset':
                self.handle_force_reset(options)
            elif action == 'set-password':
                self.handle_set_password(options)
            elif action == 'bulk-reset':
                self.handle_bulk_reset(options)
            elif action == 'clear-history':
                self.handle_clear_history(options)
            elif action == 'validate':
                self.handle_validate(options)
            else:
                self.stderr.write(self.style.ERROR(f"Unknown action: {action}"))
        except CommandError as ce:
            self.stderr.write(self.style.ERROR(f"\n❌ Command Error: {str(ce)}"))
        except Exception as ex:
            self.stderr.write(self.style.ERROR(f"\n💥 Unexpected Error: {str(ex)}"))
            import traceback
            traceback.print_exc()

    # =========================================================================
    # HELPER METHODS
    # =========================================================================
    def get_user(self, options: dict) -> User:
        email = options.get('email')
        user_id = options.get('user_id')

        if not email and not user_id:
            raise CommandError("Please specify either --email or --user-id.")

        try:
            if email:
                return User.objects.get(email__iexact=email.strip(), is_deleted=False)
            return User.objects.get(id=user_id, is_deleted=False)
        except User.DoesNotExist:
            raise CommandError(f"User not found with {'email=' + email if email else 'id=' + user_id}.")

    def get_tenant_id(self, options: dict) -> Optional[str]:
        tenant_id = options.get('tenant_id')
        admin_email = options.get('admin')

        if tenant_id:
            return tenant_id
        if admin_email:
            try:
                admin_user = User.objects.get(email__iexact=admin_email.strip(), is_deleted=False)
                if not admin_user.tenant_id:
                    raise CommandError(f"Admin user '{admin_email}' is not assigned to a tenant schema.")
                return str(admin_user.tenant_id)
            except User.DoesNotExist:
                raise CommandError(f"Admin user '{admin_email}' not found.")
        return None

    # =========================================================================
    # ACTION HANDLERS
    # =========================================================================
    def handle_status(self, options: dict):
        email = options.get('email')
        user_id = options.get('user_id')
        tenant_id = self.get_tenant_id(options)

        if email or user_id:
            user = self.get_user(options)
            self.stdout.write(self.style.SUCCESS(f"\n🔐 PASSWORD STATUS FOR USER: {user.email}"))
            self.stdout.write("=" * 70)
            self.stdout.write(f"  • User ID:                {user.id}")
            self.stdout.write(f"  • Role:                   {user.role}")
            self.stdout.write(f"  • Tenant ID:              {user.tenant_id or 'Global (None)'}")
            self.stdout.write(f"  • Is Active:              {'✅ Yes' if user.is_active else '❌ No'}")
            self.stdout.write(f"  • Is Verified:            {'✅ Yes' if user.is_verified else '❌ No'}")
            self.stdout.write(f"  • Password Last Changed:  {user.password_last_changed or 'Never'}")
            self.stdout.write(f"  • Must Change On Login:   {'⚠️ YES' if user.password_change_required else 'No'}")
            
            history = getattr(user, 'password_history', None) or []
            self.stdout.write(f"  • History Count:          {len(history)} previous passwords stored")
            failed_attempts = getattr(user, 'failed_login_attempts', 0)
            locked_until = getattr(user, 'locked_until', None)
            is_locked = locked_until and locked_until > timezone.now()
            self.stdout.write(f"  • Failed Logins:          {failed_attempts}")
            self.stdout.write(f"  • Account Locked:         {'🔒 Locked until ' + str(locked_until) if is_locked else '🔓 Unlocked'}")
            self.stdout.write("=" * 70 + "\n")
            return

        if tenant_id:
            users = User.objects.filter(tenant_id=tenant_id, is_deleted=False)
            total = users.count()
            must_change = users.filter(password_change_required=True).count()
            never_changed = users.filter(password_last_changed__isnull=True).count()

            self.stdout.write(self.style.SUCCESS(f"\n🏢 TENANT PASSWORD STATUS (Tenant: {tenant_id})"))
            self.stdout.write("=" * 70)
            self.stdout.write(f"  • Total Users:            {total}")
            self.stdout.write(f"  • Require Password Change: {must_change} ({(must_change/total*100):.1f}%)" if total else "  • Require Password Change: 0")
            self.stdout.write(f"  • Never Changed Password: {never_changed}")
            self.stdout.write("=" * 70 + "\n")
            return

        # Global Overview
        total_users = User.objects.filter(is_deleted=False).count()
        must_change_total = User.objects.filter(is_deleted=False, password_change_required=True).count()
        self.stdout.write(self.style.SUCCESS("\n🌐 GLOBAL PASSWORD SECURITY OVERVIEW"))
        self.stdout.write("=" * 70)
        self.stdout.write(f"  • Total Active Users:     {total_users}")
        self.stdout.write(f"  • Must Change Password:   {must_change_total}")
        self.stdout.write("=" * 70 + "\n")

    def handle_change(self, options: dict):
        user = self.get_user(options)
        old_pass = options.get('old_password')
        new_pass = options.get('new_password')

        password_service = PasswordService()
        success, message = password_service.change_password(user, old_pass, new_pass)

        if success:
            self.stdout.write(self.style.SUCCESS(f"✅ Password changed successfully for {user.email}."))
        else:
            raise CommandError(f"Password change failed: {message}")

    def handle_reset(self, options: dict):
        email = options.get('email')
        print_token = options.get('print_token')

        try:
            user = User.objects.get(email__iexact=email.strip(), is_active=True, is_deleted=False)
            password_service = PasswordService()
            token = password_service._generate_reset_token(user)
            send_password_reset_email.delay(str(user.id), token)

            self.stdout.write(self.style.SUCCESS(f"✅ Password reset email dispatched to {user.email}."))
            if print_token:
                self.stdout.write(self.style.WARNING(f"🔑 Reset Token: {token}"))
        except User.DoesNotExist:
            self.stdout.write(self.style.SUCCESS(f"✅ Password reset email sent if account exists."))

    def handle_confirm_reset(self, options: dict):
        token = options.get('token')
        new_password = options.get('new_password')

        password_service = PasswordService()
        success, message = password_service.confirm_reset(token, new_password)

        if success:
            self.stdout.write(self.style.SUCCESS(f"✅ Password reset confirmed successfully! User can now log in."))
        else:
            raise CommandError(f"Password reset confirmation failed: {message}")

    def handle_force_reset(self, options: dict):
        email = options.get('email')
        user_id = options.get('user_id')
        tenant_id = self.get_tenant_id(options)
        print_token = options.get('print_token')

        password_service = PasswordService()

        if email or user_id:
            user = self.get_user(options)
            token = password_service._generate_reset_token(user)
            send_password_reset_email.delay(str(user.id), token)
            self.stdout.write(self.style.SUCCESS(f"✅ Forced password reset triggered for {user.email}."))
            if print_token:
                self.stdout.write(self.style.WARNING(f"🔑 Reset Token: {token}"))
            return

        if tenant_id:
            users = User.objects.filter(tenant_id=tenant_id, is_active=True, is_deleted=False)
            count = 0
            for u in users:
                token = password_service._generate_reset_token(u)
                send_password_reset_email.delay(str(u.id), token)
                count += 1
            self.stdout.write(self.style.SUCCESS(f"✅ Forced password reset sent to {count} users in tenant {tenant_id}."))
            return

        raise CommandError("Please specify --email, --user-id, or --admin/--tenant-id.")

    def handle_set_password(self, options: dict):
        user = self.get_user(options)
        password = options.get('password')
        must_change = options.get('must_change')

        password_service = PasswordService()
        is_valid, errors = password_service.validate_password(password, user)
        if not is_valid:
            raise CommandError(f"Invalid password: {errors[0]}")

        password_service._record_password_history(user)
        user.set_password(password)
        user.password_last_changed = timezone.now()
        user.password_change_required = bool(must_change)
        user.is_verified = True
        user.save(update_fields=['password', 'password_last_changed', 'password_history', 'password_change_required', 'is_verified'])

        # Terminate active sessions
        SessionService().terminate_all_sessions(user)

        self.stdout.write(self.style.SUCCESS(f"✅ Password directly updated for {user.email} (Must change on login: {must_change})."))

    def handle_bulk_reset(self, options: dict):
        all_system = options.get('all_system')
        tenant_id = self.get_tenant_id(options)

        if not all_system and not tenant_id:
            raise CommandError("Please specify --tenant-id, --admin, or --all-system to target users for bulk reset.")

        role_filter = options.get('role')
        mode = options.get('mode', 'uniform')
        uniform_pass = options.get('password', 'Admin@123')
        must_change = options.get('must_change', False)
        activate = options.get('activate', True)
        verify = options.get('verify', True)
        clear_hist = options.get('clear_history', True)

        with connection.cursor() as cursor:
            cursor.execute('SET search_path TO "public"')

        users_qs = User.objects.filter(is_deleted=False)
        if not all_system and tenant_id:
            users_qs = users_qs.filter(tenant_id=tenant_id)
        if role_filter:
            users_qs = users_qs.filter(role=role_filter)

        total_users = users_qs.count()
        if total_users == 0:
            self.stdout.write(self.style.WARNING("⚠️ No matching users found."))
            return

        target_scope = "ALL SYSTEM USERS" if all_system else f"Tenant '{tenant_id}'"
        self.stdout.write(self.style.WARNING(f"\n⚡ Starting Bulk Password Reset for {total_users} user(s) in {target_scope} (Mode: {mode})..."))

        updated_count = 0
        pass_service = PasswordService()
        session_service = SessionService()

        with transaction.atomic():
            for user in users_qs:
                if mode == 'uniform':
                    raw_pass = uniform_pass
                elif mode == 'system_generated':
                    raw_pass = f"Pass@{secrets.token_urlsafe(6)}!2026"
                elif mode == 'email':
                    raw_pass = user.email
                elif mode == 'custom_static':
                    raw_pass = uniform_pass or "FalconDefault123!"
                else:
                    raw_pass = uniform_pass

                if clear_hist:
                    user.password_history = []
                else:
                    pass_service._record_password_history(user)

                user.set_password(raw_pass)
                user.password_last_changed = timezone.now()
                user.password_change_required = must_change
                if activate:
                    user.is_active = True
                if verify:
                    user.is_verified = True

                update_fields = ['password', 'password_last_changed', 'password_history', 'password_change_required']
                if activate:
                    update_fields.append('is_active')
                if verify:
                    update_fields.append('is_verified')

                user.save(update_fields=update_fields)
                session_service.terminate_all_sessions(user)
                updated_count += 1

        self.stdout.write(self.style.SUCCESS(
            f"\n🎉 [SUCCESS] Reset passwords for {updated_count} user(s) in {target_scope}!\n"
            f"   ↳ Default Password:   {uniform_pass if mode == 'uniform' else '[' + mode + ']'}\n"
            f"   ↳ Must Change Pass:   {'YES' if must_change else 'No'}\n"
            f"   ↳ Active & Verified:  {'YES' if (activate and verify) else 'Unchanged'}"
        ))

    def handle_clear_history(self, options: dict):
        email = options.get('email')
        user_id = options.get('user_id')
        tenant_id = self.get_tenant_id(options)

        if email or user_id:
            user = self.get_user(options)
            user.password_history = []
            user.save(update_fields=['password_history'])
            self.stdout.write(self.style.SUCCESS(f"✅ Cleared password history for user {user.email}."))
            return

        if tenant_id:
            count = User.objects.filter(tenant_id=tenant_id, is_deleted=False).update(password_history=[])
            self.stdout.write(self.style.SUCCESS(f"✅ Cleared password history for {count} users in tenant {tenant_id}."))
            return

        raise CommandError("Please specify --email, --user-id, or --tenant-id/--admin.")

    def handle_validate(self, options: dict):
        password = options.get('password')
        email = options.get('email')
        user = None
        if email:
            user = self.get_user({'email': email})

        password_service = PasswordService()
        is_valid, errors = password_service.validate_password(password, user)

        if is_valid:
            self.stdout.write(self.style.SUCCESS(f"✅ Password '{password}' is STRONG and compliant with security policy."))
        else:
            self.stdout.write(self.style.ERROR(f"❌ Password validation failed:"))
            for err in errors:
                self.stdout.write(self.style.ERROR(f"   • {err}"))
