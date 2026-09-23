"""
Comprehensive Management Command for Falcon PMS MFA (Multi-Factor Authentication).
Handles:
- User-level MFA actions: setup, verify, generate-backup-codes, list-devices, set-primary, remove-device, enable, disable, reset, status
- Tenant-level MFA actions: status, set-policy, enable-all, disable-all, reset-tenant
- System/Audit actions: audit-logs, global-status

Usage:
    python manage.py manage_mfa status --admin careen@falcontech.com
    python manage.py manage_mfa status --email user@example.com
    python manage.py manage_mfa setup --email user@example.com --device-name "Work Phone"
    python manage.py manage_mfa verify --email user@example.com --otp 123456
    python manage.py manage_mfa generate-backup-codes --email user@example.com
    python manage.py manage_mfa list-devices --email user@example.com
    python manage.py manage_mfa set-primary --email user@example.com --device-id <id>
    python manage.py manage_mfa remove-device --email user@example.com --device-id <id>
    python manage.py manage_mfa enable --email user@example.com
    python manage.py manage_mfa disable --email user@example.com
    python manage.py manage_mfa reset --email user@example.com
    python manage.py manage_mfa reset-tenant --admin careen@falcontech.com
    python manage.py manage_mfa set-policy --admin careen@falcontech.com --roles client_admin staff
    python manage.py manage_mfa audit-logs --admin careen@falcontech.com --limit 20
"""

import sys
import pyotp
from typing import Optional, List, Dict

if sys.stdout.encoding != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

from django.core.management.base import BaseCommand, CommandError
from django.db import connection, transaction
from django.utils import timezone

from apps.accounts.models import User, MFADevice, MFABackupCode, MFAAuditLog
from apps.accounts.models.preferences import TenantPreference
from apps.accounts.services.auth.mfa import MFAService
from apps.accounts.services.policy import AccountsPolicyService


class Command(BaseCommand):
    help = 'Comprehensive management command for all MFA operations, device management, and tenant policies.'

    def add_arguments(self, parser):
        subparsers = parser.add_subparsers(dest='action', required=True, help='MFA action to perform')

        # ---------------- STATUS ----------------
        status_parser = subparsers.add_parser('status', help='View MFA status for a user, tenant, or system-wide')
        status_parser.add_argument('--email', '-e', type=str, help='User email')
        status_parser.add_argument('--user-id', '-u', type=str, help='User UUID')
        status_parser.add_argument('--tenant-id', '-t', type=str, help='Tenant ID')
        status_parser.add_argument('--admin', '-a', type=str, help='Admin email to identify tenant')

        # ---------------- SETUP ----------------
        setup_parser = subparsers.add_parser('setup', help='Enroll and set up TOTP MFA for a user')
        setup_parser.add_argument('--email', '-e', type=str, help='User email')
        setup_parser.add_argument('--user-id', '-u', type=str, help='User UUID')
        setup_parser.add_argument('--device-name', '-d', type=str, default='Authenticator', help='Device label (default: Authenticator)')

        # ---------------- VERIFY ----------------
        verify_parser = subparsers.add_parser('verify', help='Verify OTP code or backup code for a user')
        verify_parser.add_argument('--email', '-e', type=str, help='User email')
        verify_parser.add_argument('--user-id', '-u', type=str, help='User UUID')
        verify_parser.add_argument('--otp', type=str, required=True, help='6-digit OTP code or 8-character backup code')

        # ---------------- GENERATE BACKUP CODES ----------------
        codes_parser = subparsers.add_parser('generate-backup-codes', help='Generate fresh backup codes for user')
        codes_parser.add_argument('--email', '-e', type=str, help='User email')
        codes_parser.add_argument('--user-id', '-u', type=str, help='User UUID')

        # ---------------- LIST DEVICES ----------------
        devices_parser = subparsers.add_parser('list-devices', help='List registered MFA devices for a user')
        devices_parser.add_argument('--email', '-e', type=str, help='User email')
        devices_parser.add_argument('--user-id', '-u', type=str, help='User UUID')

        # ---------------- SET PRIMARY DEVICE ----------------
        primary_parser = subparsers.add_parser('set-primary', help='Set device as primary')
        primary_parser.add_argument('--email', '-e', type=str, help='User email')
        primary_parser.add_argument('--user-id', '-u', type=str, help='User UUID')
        primary_parser.add_argument('--device-id', '-d', type=str, required=True, help='Device UUID')

        # ---------------- REMOVE DEVICE ----------------
        remove_parser = subparsers.add_parser('remove-device', help='Remove a specific MFA device')
        remove_parser.add_argument('--email', '-e', type=str, help='User email')
        remove_parser.add_argument('--user-id', '-u', type=str, help='User UUID')
        remove_parser.add_argument('--device-id', '-d', type=str, required=True, help='Device UUID')

        # ---------------- ENABLE / DISABLE ----------------
        enable_parser = subparsers.add_parser('enable', help='Enable MFA on a user')
        enable_parser.add_argument('--email', '-e', type=str, help='User email')
        enable_parser.add_argument('--user-id', '-u', type=str, help='User UUID')

        disable_parser = subparsers.add_parser('disable', help='Disable MFA on a user')
        disable_parser.add_argument('--email', '-e', type=str, help='User email')
        disable_parser.add_argument('--user-id', '-u', type=str, help='User UUID')

        # ---------------- RESET (USER / TENANT) ----------------
        reset_parser = subparsers.add_parser('reset', help='Clear all MFA devices & disable MFA for a user')
        reset_parser.add_argument('--email', '-e', type=str, help='User email')
        reset_parser.add_argument('--user-id', '-u', type=str, help='User UUID')

        reset_tenant_parser = subparsers.add_parser('reset-tenant', help='Clear MFA for all users in a tenant')
        reset_tenant_parser.add_argument('--admin', '-a', type=str, help='Admin email')
        reset_tenant_parser.add_argument('--tenant-id', '-t', type=str, help='Tenant ID')

        # ---------------- SET POLICY ----------------
        policy_parser = subparsers.add_parser('set-policy', help='Configure Tenant MFA Policy')
        policy_parser.add_argument('--admin', '-a', type=str, help='Admin email')
        policy_parser.add_argument('--tenant-id', '-t', type=str, help='Tenant ID')
        policy_parser.add_argument('--roles', '-r', nargs='*', help='Roles requiring MFA (e.g. client_admin executive staff)')
        policy_parser.add_argument('--clear', action='store_true', help='Clear all required roles')
        policy_parser.add_argument('--grace-days', type=int, default=0, help='Grace period days')

        # ---------------- AUDIT LOGS ----------------
        audit_parser = subparsers.add_parser('audit-logs', help='View MFA security audit logs')
        audit_parser.add_argument('--email', '-e', type=str, help='Filter by user email')
        audit_parser.add_argument('--admin', '-a', type=str, help='Filter by tenant admin')
        audit_parser.add_argument('--tenant-id', '-t', type=str, help='Filter by tenant ID')
        audit_parser.add_argument('--limit', '-l', type=int, default=25, help='Limit results (default: 25)')

    def handle(self, *args, **options):
        with connection.cursor() as cursor:
            cursor.execute('SET search_path TO "public"')

        action = options['action']
        handler_map = {
            'status': self.handle_status,
            'setup': self.handle_setup,
            'verify': self.handle_verify,
            'generate-backup-codes': self.handle_generate_backup_codes,
            'list-devices': self.handle_list_devices,
            'set-primary': self.handle_set_primary,
            'remove-device': self.handle_remove_device,
            'enable': self.handle_enable,
            'disable': self.handle_disable,
            'reset': self.handle_reset,
            'reset-tenant': self.handle_reset_tenant,
            'set-policy': self.handle_set_policy,
            'audit-logs': self.handle_audit_logs,
        }

        handler = handler_map.get(action)
        if handler:
            handler(options)
        else:
            raise CommandError(f"Unknown action: {action}")

    # =========================================================================
    # HELPERS
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
                    raise CommandError(f"Admin '{admin_email}' has no tenant_id.")
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
            raise CommandError(f"User not found for (email: {email}, id: {user_id}).")
        return user

    # =========================================================================
    # ACTION HANDLERS
    # =========================================================================

    def handle_status(self, options):
        email = options.get('email')
        user_id = options.get('user_id')
        tenant_id = self._resolve_tenant_id(options)

        # 1. Single User Status
        if email or user_id:
            user = self._get_single_user(options)
            devices = MFADevice.objects.filter(user=user, is_active=True)
            backup_count = MFABackupCode.objects.filter(user=user, is_used=False).count()
            required_by_role = AccountsPolicyService.tenant_requires_mfa(user)
            effective_required = AccountsPolicyService.user_requires_mfa(user)

            self.stdout.write(self.style.MIGRATE_HEADING(f"\n{'=' * 70}\n[MFA STATUS] {user.email}\n{'=' * 70}"))
            self.stdout.write(f"  * MFA Enabled:          {'Yes' if user.mfa_enabled else 'No'}")
            self.stdout.write(f"  * Verified At:          {user.mfa_verified_at or 'Never'}")
            self.stdout.write(f"  * Required by Role:     {'Yes' if required_by_role else 'No'} (Role: {user.role})")
            self.stdout.write(f"  * Required Override:    {user.mfa_required if user.mfa_required is not None else 'None (uses role policy)'}")
            self.stdout.write(f"  * Effective Required:   {'YES' if effective_required else 'No'}")
            self.stdout.write(f"  * Active Devices:       {devices.count()}")
            self.stdout.write(f"  * Usable Backup Codes:  {backup_count}")
            self.stdout.write(f"  * Failure Rate:         {MFAService().get_failure_rate(user):.1f}%")

            if devices.exists():
                self.stdout.write(f"\n  Devices:")
                for d in devices:
                    primary = " (PRIMARY)" if d.is_primary else ""
                    self.stdout.write(f"    - [{d.id}] {d.name} ({d.device_type}){primary} -- Last Used: {d.last_used_at or 'Never'}")

            self.stdout.write("=" * 70 + "\n")
            return

        # 2. Tenant Status
        if tenant_id:
            pref = TenantPreference.objects.filter(client_id=tenant_id).first()
            required_roles = pref.mfa_required_roles if pref else []
            total_users = User.objects.filter(tenant_id=tenant_id, is_deleted=False).count()
            mfa_enabled_users = User.objects.filter(tenant_id=tenant_id, is_deleted=False, mfa_enabled=True).count()

            self.stdout.write(self.style.MIGRATE_HEADING(f"\n{'=' * 70}\n[TENANT MFA POLICY & STATUS] {tenant_id}\n{'=' * 70}"))
            self.stdout.write(f"  * Total Tenant Users:   {total_users}")
            self.stdout.write(f"  * Users with MFA:       {mfa_enabled_users} ({((mfa_enabled_users/total_users)*100 if total_users else 0):.1f}%)")
            self.stdout.write(f"  * MFA Required Roles:   {', '.join(required_roles) if required_roles else 'None'}")
            self.stdout.write(f"  * Policy Version:       {pref.policy_version if pref else 1}")
            self.stdout.write("=" * 70 + "\n")
            return

        # 3. Global Status
        total_users = User.objects.filter(is_deleted=False).count()
        mfa_enabled_users = User.objects.filter(is_deleted=False, mfa_enabled=True).count()
        total_devices = MFADevice.objects.filter(is_active=True).count()

        self.stdout.write(self.style.MIGRATE_HEADING(f"\n{'=' * 70}\n[SYSTEM-WIDE MFA OVERVIEW]\n{'=' * 70}"))
        self.stdout.write(f"  * Total Platform Users: {total_users}")
        self.stdout.write(f"  * Total MFA Enabled:    {mfa_enabled_users} ({((mfa_enabled_users/total_users)*100 if total_users else 0):.1f}%)")
        self.stdout.write(f"  * Total Active Devices: {total_devices}")
        self.stdout.write("=" * 70 + "\n")

    def handle_setup(self, options):
        user = self._get_single_user(options)
        device_name = options.get('device_name', 'Authenticator')

        service = MFAService()
        setup_data = service.setup_totp(user=user, device_name=device_name)

        secret = setup_data['secret']
        uri = setup_data['provisioning_uri']
        backup_codes = setup_data['backup_codes']

        self.stdout.write(self.style.SUCCESS(
            f"\n{'=' * 70}\n[TOTP MFA SETUP GENERATED] {user.email}\n{'=' * 70}"
        ))
        self.stdout.write(f"  * Device Name:         {device_name} (ID: {setup_data['device_id']})")
        self.stdout.write(f"  * Secret Key (Base32): {self.style.MIGRATE_HEADING(secret)}")
        self.stdout.write(f"  * Provisioning URI:    {uri}")

        self.stdout.write(f"\n  [EMERGENCY BACKUP CODES] (Save these safely):")
        for i in range(0, len(backup_codes), 2):
            c1 = backup_codes[i]
            c2 = backup_codes[i + 1] if i + 1 < len(backup_codes) else ""
            self.stdout.write(f"     {c1:<16} {c2:<16}")

        self.stdout.write("\n" + "=" * 70 + "\n")

    def handle_verify(self, options):
        user = self._get_single_user(options)
        otp = options['otp']

        service = MFAService()
        is_valid, device, message = service.verify_otp(user=user, otp=otp)

        if is_valid:
            if not user.mfa_enabled:
                user.mfa_enabled = True
                user.mfa_verified_at = timezone.now()
                user.save(update_fields=['mfa_enabled', 'mfa_verified_at'])

            device_info = f" using device '{device.name}'" if device else " using Backup Code"
            self.stdout.write(self.style.SUCCESS(f"\n[SUCCESS] OTP verified successfully for '{user.email}'{device_info}!\n"))
        else:
            self.stdout.write(self.style.ERROR(f"\n[ERROR] OTP verification failed for '{user.email}': {message}\n"))

    def handle_generate_backup_codes(self, options):
        user = self._get_single_user(options)
        raw_codes, hashes = MFABackupCode.objects.generate_codes(user)

        self.stdout.write(self.style.SUCCESS(
            f"\n{'=' * 70}\n[BACKUP CODES GENERATED] {user.email}\n{'=' * 70}"
        ))
        for i in range(0, len(raw_codes), 2):
            c1 = raw_codes[i]
            c2 = raw_codes[i + 1] if i + 1 < len(raw_codes) else ""
            self.stdout.write(f"     {c1:<16} {c2:<16}")
        self.stdout.write("=" * 70 + "\n")

    def handle_list_devices(self, options):
        user = self._get_single_user(options)
        devices = MFADevice.objects.filter(user=user, is_active=True).order_by('-is_primary', '-created_at')

        self.stdout.write(self.style.MIGRATE_HEADING(
            f"\n{'=' * 85}\n[MFA DEVICES] {user.email} (Total: {devices.count()})\n{'=' * 85}"
        ))

        if not devices.exists():
            self.stdout.write(self.style.NOTICE("No active MFA devices registered."))
            return

        header = f"{'Device ID':<38} {'Name':<20} {'Type':<8} {'Primary':<9} {'Verified':<10}"
        self.stdout.write(self.style.NOTICE(header))
        self.stdout.write("-" * 85)

        for d in devices:
            is_prim = "Yes" if d.is_primary else "No"
            is_ver = "Yes" if d.is_verified else "No"
            self.stdout.write(f"{str(d.id):<38} {d.name[:18]:<20} {d.device_type:<8} {is_prim:<9} {is_ver:<10}")

        self.stdout.write("=" * 85 + "\n")

    def handle_set_primary(self, options):
        user = self._get_single_user(options)
        device_id = options['device_id']

        device = MFADevice.objects.filter(user=user, id=device_id, is_active=True).first()
        if not device:
            raise CommandError(f"Device '{device_id}' not found for user '{user.email}'.")

        MFADevice.objects.set_primary_device(user=user, device_id=device_id)
        self.stdout.write(self.style.SUCCESS(f"[SUCCESS] Device '{device.name}' set as primary for '{user.email}'."))

    def handle_remove_device(self, options):
        user = self._get_single_user(options)
        device_id = options['device_id']

        device = MFADevice.objects.filter(user=user, id=device_id).first()
        if not device:
            raise CommandError(f"Device '{device_id}' not found for user '{user.email}'.")

        device.is_active = False
        device.is_deleted = True
        device.deleted_at = timezone.now()
        device.save(update_fields=['is_active', 'is_deleted', 'deleted_at'])

        # If no active devices remain, disable mfa_enabled
        if not MFADevice.objects.filter(user=user, is_active=True).exists():
            user.mfa_enabled = False
            user.save(update_fields=['mfa_enabled'])

        self.stdout.write(self.style.SUCCESS(f"[SUCCESS] MFA device '{device.name}' removed."))

    def handle_enable(self, options):
        user = self._get_single_user(options)
        user.mfa_enabled = True
        user.mfa_verified_at = timezone.now()
        user.save(update_fields=['mfa_enabled', 'mfa_verified_at'])
        self.stdout.write(self.style.SUCCESS(f"[SUCCESS] MFA enabled for '{user.email}'."))

    def handle_disable(self, options):
        user = self._get_single_user(options)
        user.mfa_enabled = False
        user.save(update_fields=['mfa_enabled'])
        self.stdout.write(self.style.SUCCESS(f"[SUCCESS] MFA disabled for '{user.email}'."))

    def handle_reset(self, options):
        user = self._get_single_user(options)
        service = MFAService()
        service.disable_mfa(user=user)
        self.stdout.write(self.style.SUCCESS(f"[SUCCESS] MFA completely reset for '{user.email}' (devices and backup codes removed)."))

    def handle_reset_tenant(self, options):
        tenant_id = self._resolve_tenant_id(options)
        if not tenant_id:
            raise CommandError("Please specify tenant via --tenant-id or --admin.")

        users = User.objects.filter(tenant_id=tenant_id, is_deleted=False)
        count = 0
        service = MFAService()
        with transaction.atomic():
            for u in users:
                service.disable_mfa(user=u)
                count += 1

        self.stdout.write(self.style.SUCCESS(f"[SUCCESS] MFA reset for all {count} user(s) in tenant '{tenant_id}'."))

    def handle_set_policy(self, options):
        tenant_id = self._resolve_tenant_id(options)
        if not tenant_id:
            raise CommandError("Please specify tenant via --tenant-id or --admin.")

        pref, _ = TenantPreference.objects.get_or_create(
            client_id=tenant_id,
            defaults={'tenant_id': tenant_id}
        )

        if options.get('clear'):
            pref.mfa_required_roles = []
        elif options.get('roles') is not None:
            pref.mfa_required_roles = options['roles']

        pref.policy_version += 1
        pref.save()
        AccountsPolicyService.invalidate_tenant_cache(str(tenant_id))

        self.stdout.write(self.style.SUCCESS(
            f"\n[SUCCESS] Tenant MFA Policy updated for tenant '{tenant_id}'!\n"
            f"  * MFA Required Roles: {', '.join(pref.mfa_required_roles) if pref.mfa_required_roles else 'None'}\n"
            f"  * Policy Version:     {pref.policy_version}\n"
        ))

    def handle_audit_logs(self, options):
        email = options.get('email')
        tenant_id = self._resolve_tenant_id(options)
        limit = options.get('limit', 25)

        qs = MFAAuditLog.objects.all().order_by('-created_at')

        if email:
            qs = qs.filter(user__email__iexact=email)
        if tenant_id:
            qs = qs.filter(user__tenant_id=tenant_id)

        logs = list(qs[:limit])

        self.stdout.write(self.style.MIGRATE_HEADING(
            f"\n{'=' * 95}\n[AUDIT] MFA AUDIT LOGS (Showing {len(logs)} entries)\n{'=' * 95}"
        ))

        if not logs:
            self.stdout.write(self.style.NOTICE("No MFA audit records found."))
            return

        header = f"{'Timestamp':<20} {'User Email':<30} {'Action':<15} {'Success':<8} {'Device':<15}"
        self.stdout.write(self.style.NOTICE(header))
        self.stdout.write("-" * 95)

        for log in logs:
            ts = log.created_at.strftime('%Y-%m-%d %H:%M:%S') if log.created_at else '-'
            u_email = log.user.email if log.user else 'Anonymous'
            succ = "Yes" if log.success else "No"
            dev = log.device_name or (log.device.name if log.device else '-')
            self.stdout.write(f"{ts:<20} {u_email:<30} {log.action:<15} {succ:<8} {dev:<15}")

        self.stdout.write("=" * 95 + "\n")
