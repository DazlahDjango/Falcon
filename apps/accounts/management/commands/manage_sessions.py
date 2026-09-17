"""
Comprehensive Management Command for Falcon PMS User Sessions & Blacklist Management.
Handles:
- User-level session actions: list, active, details, terminate, terminate-all
- Tenant-level session actions: active, terminate-tenant, stats
- System-level actions: cleanup expired sessions, stats, blacklist management

Usage Examples:
    python manage.py manage_sessions list --email user@example.com
    python manage.py manage_sessions list --admin careen@falcontech.com --status active --limit 20
    python manage.py manage_sessions active --email user@example.com
    python manage.py manage_sessions active --admin careen@falcontech.com
    python manage.py manage_sessions details --session-id <uuid>
    python manage.py manage_sessions terminate --session-id <uuid>
    python manage.py manage_sessions terminate-all --email user@example.com
    python manage.py manage_sessions terminate-all --admin careen@falcontech.com
    python manage.py manage_sessions cleanup --days 30
    python manage.py manage_sessions blacklist --view
    python manage.py manage_sessions blacklist --token-id <jti> --user-email user@example.com --reason "Compromised device"
    python manage.py manage_sessions stats --admin careen@falcontech.com
    python manage.py manage_sessions stats
"""

import sys
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
from datetime import timedelta

from apps.accounts.models import User, UserSession, SessionBlacklist
from apps.accounts.services.auth.session import SessionService


class Command(BaseCommand):
    help = 'Comprehensive management command for Falcon PMS session tracking, termination, and token blacklisting.'

    def add_arguments(self, parser):
        subparsers = parser.add_subparsers(dest='action', required=True, help='Session action to perform')

        # ---------------- LIST ----------------
        list_parser = subparsers.add_parser('list', help='List user sessions with optional filters')
        list_parser.add_argument('--email', '-e', type=str, help='User email')
        list_parser.add_argument('--user-id', '-u', type=str, help='User UUID')
        list_parser.add_argument('--tenant-id', '-t', type=str, help='Tenant ID')
        list_parser.add_argument('--admin', '-a', type=str, help='Admin email to identify tenant')
        list_parser.add_argument('--status', '-s', type=str, choices=['active', 'expired', 'logged_out', 'revoked'], help='Filter by session status')
        list_parser.add_argument('--device', '-d', type=str, choices=['desktop', 'mobile', 'tablet', 'unknown'], help='Filter by device type')
        list_parser.add_argument('--ip', type=str, help='Filter by IP address')
        list_parser.add_argument('--limit', '-l', type=int, default=25, help='Max records to display (default: 25)')

        # ---------------- ACTIVE ----------------
        active_parser = subparsers.add_parser('active', help='Show active sessions for user, tenant, or system-wide')
        active_parser.add_argument('--email', '-e', type=str, help='User email')
        active_parser.add_argument('--user-id', '-u', type=str, help='User UUID')
        active_parser.add_argument('--tenant-id', '-t', type=str, help='Tenant ID')
        active_parser.add_argument('--admin', '-a', type=str, help='Admin email to identify tenant')
        active_parser.add_argument('--limit', '-l', type=int, default=50, help='Max records to display (default: 50)')

        # ---------------- DETAILS ----------------
        detail_parser = subparsers.add_parser('details', help='Retrieve detailed metadata for a specific session')
        detail_parser.add_argument('--session-id', '-s', type=str, required=True, help='Session UUID')

        # ---------------- TERMINATE ----------------
        term_parser = subparsers.add_parser('terminate', help='Terminate a single session by UUID')
        term_parser.add_argument('--session-id', '-s', type=str, required=True, help='Session UUID')

        # ---------------- TERMINATE ALL ----------------
        term_all_parser = subparsers.add_parser('terminate-all', help='Terminate all active sessions for user or tenant')
        term_all_parser.add_argument('--email', '-e', type=str, help='User email')
        term_all_parser.add_argument('--user-id', '-u', type=str, help='User UUID')
        term_all_parser.add_argument('--tenant-id', '-t', type=str, help='Tenant ID to terminate all sessions in tenant')
        term_all_parser.add_argument('--admin', '-a', type=str, help='Admin email to target tenant users')
        term_all_parser.add_argument('--all-system', action='store_true', help='Terminate all active sessions system-wide')

        # ---------------- CLEANUP ----------------
        clean_parser = subparsers.add_parser('cleanup', help='Purge old expired sessions and blacklist entries from database')
        clean_parser.add_argument('--days', '-d', type=int, default=30, help='Delete records older than X days (default: 30)')
        clean_parser.add_argument('--dry-run', action='store_true', help='Preview records to be deleted without removing them')

        # ---------------- BLACKLIST ----------------
        bl_parser = subparsers.add_parser('blacklist', help='View or add token to JWT session blacklist')
        bl_parser.add_argument('--view', action='store_true', help='View active blacklist entries')
        bl_parser.add_argument('--token-id', type=str, help='JWT Token ID (JTI claim) to blacklist')
        bl_parser.add_argument('--user-email', type=str, help='Optional user email to associate with blacklisted token')
        bl_parser.add_argument('--reason', type=str, default='Revoked via management command', help='Reason for blacklisting')
        bl_parser.add_argument('--hours', type=int, default=24, help='Blacklist duration in hours (default: 24)')

        # ---------------- STATS ----------------
        stats_parser = subparsers.add_parser('stats', help='View session analytics and device distribution')
        stats_parser.add_argument('--tenant-id', '-t', type=str, help='Tenant ID')
        stats_parser.add_argument('--admin', '-a', type=str, help='Admin email to identify tenant')

    def handle(self, *args, **options):
        action = options.get('action')
        try:
            if action == 'list':
                self.handle_list(options)
            elif action == 'active':
                self.handle_active(options)
            elif action == 'details':
                self.handle_details(options)
            elif action == 'terminate':
                self.handle_terminate(options)
            elif action == 'terminate-all':
                self.handle_terminate_all(options)
            elif action == 'cleanup':
                self.handle_cleanup(options)
            elif action == 'blacklist':
                self.handle_blacklist(options)
            elif action == 'stats':
                self.handle_stats(options)
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

    # =========================================================================
    # ACTION HANDLERS
    # =========================================================================
    def handle_list(self, options: dict):
        qs = UserSession.objects.select_related('user').all()

        email = options.get('email')
        user_id = options.get('user_id')
        tenant_id = self.get_tenant_id(options)
        status = options.get('status')
        device = options.get('device')
        ip = options.get('ip')
        limit = options.get('limit', 25)

        if email:
            qs = qs.filter(user__email__icontains=email)
        if user_id:
            qs = qs.filter(user_id=user_id)
        if tenant_id:
            qs = qs.filter(tenant_id=tenant_id)
        if status:
            qs = qs.filter(status=status)
        if device:
            qs = qs.filter(device_type=device)
        if ip:
            qs = qs.filter(ip_address__icontains=ip)

        total = qs.count()
        records = qs[:limit]

        self.stdout.write(self.style.SUCCESS(f"\n📋 SESSIONS LIST (Showing {len(records)} of {total} records)"))
        self.stdout.write("=" * 110)
        self.stdout.write(f"{'SESSION ID':<38} {'USER':<28} {'DEVICE':<10} {'IP ADDRESS':<16} {'STATUS':<10} {'LOGIN TIME'}")
        self.stdout.write("-" * 110)

        for s in records:
            user_label = s.user.email if s.user else "Unknown"
            status_style = self.style.SUCCESS if s.status == 'active' else self.style.WARNING
            self.stdout.write(
                f"{str(s.id):<38} {user_label[:26]:<28} {(s.device_type or 'unknown'):<10} {(s.ip_address or '-'):<16} {s.status:<10} {s.login_time.strftime('%Y-%m-%d %H:%M')}"
            )

        self.stdout.write("=" * 110 + "\n")

    def handle_active(self, options: dict):
        qs = UserSession.objects.select_related('user').filter(status='active', expires_at__gt=timezone.now())

        email = options.get('email')
        user_id = options.get('user_id')
        tenant_id = self.get_tenant_id(options)
        limit = options.get('limit', 50)

        if email:
            qs = qs.filter(user__email__icontains=email)
        if user_id:
            qs = qs.filter(user_id=user_id)
        if tenant_id:
            qs = qs.filter(tenant_id=tenant_id)

        total = qs.count()
        records = qs[:limit]

        self.stdout.write(self.style.SUCCESS(f"\n🟢 ACTIVE SESSIONS (Count: {total})"))
        self.stdout.write("=" * 110)
        self.stdout.write(f"{'SESSION ID':<38} {'USER':<28} {'DEVICE':<10} {'IP ADDRESS':<16} {'BROWSER/OS':<16} {'EXPIRES'}")
        self.stdout.write("-" * 110)

        for s in records:
            user_label = s.user.email if s.user else "Unknown"
            browser_os = f"{s.browser or ''} {s.os or ''}".strip() or '-'
            expires_str = s.expires_at.strftime('%Y-%m-%d %H:%M') if s.expires_at else '-'
            self.stdout.write(
                f"{str(s.id):<38} {user_label[:26]:<28} {(s.device_type or 'desktop'):<10} {(s.ip_address or '-'):<16} {browser_os[:14]:<16} {expires_str}"
            )

        self.stdout.write("=" * 110 + "\n")

    def handle_details(self, options: dict):
        session_id = options.get('session_id')
        try:
            s = UserSession.objects.select_related('user').get(id=session_id)
        except UserSession.DoesNotExist:
            raise CommandError(f"Session '{session_id}' not found.")

        self.stdout.write(self.style.SUCCESS(f"\n🔍 SESSION DETAILS ({s.id})"))
        self.stdout.write("=" * 70)
        self.stdout.write(f"  • User:               {s.user.email} ({s.user.role})")
        self.stdout.write(f"  • Tenant ID:          {s.tenant_id or 'Global (Super Admin)'}")
        self.stdout.write(f"  • Status:             {s.status.upper()}")
        self.stdout.write(f"  • IP Address:         {s.ip_address or '-'}")
        self.stdout.write(f"  • Device Type:        {s.device_type or 'unknown'}")
        self.stdout.write(f"  • Browser:            {s.browser or '-'}")
        self.stdout.write(f"  • OS:                 {s.os or '-'}")
        self.stdout.write(f"  • User Agent:         {s.user_agent[:60]}..." if len(s.user_agent) > 60 else f"  • User Agent:         {s.user_agent or '-'}")
        self.stdout.write(f"  • Location:           {s.location_city or ''} {s.location_country or ''}".strip() or '  • Location:           Unknown')
        self.stdout.write(f"  • MFA Verified:       {'✅ Yes' if s.mfa_verified else '❌ No'}")
        self.stdout.write(f"  • Trusted Device:     {'✅ Yes' if s.is_trusted_device else 'No'}")
        self.stdout.write(f"  • Login Time:         {s.login_time}")
        self.stdout.write(f"  • Last Activity:      {s.last_activity}")
        self.stdout.write(f"  • Expires At:         {s.expires_at}")
        self.stdout.write(f"  • Logout Time:        {s.logout_time or '-'}")
        self.stdout.write("=" * 70 + "\n")

    def handle_terminate(self, options: dict):
        session_id = options.get('session_id')
        session_service = SessionService()
        success = session_service.terminate_session(session_id)

        if success:
            self.stdout.write(self.style.SUCCESS(f"✅ Session '{session_id}' terminated successfully."))
        else:
            raise CommandError(f"Failed to terminate session '{session_id}'.")

    def handle_terminate_all(self, options: dict):
        email = options.get('email')
        user_id = options.get('user_id')
        tenant_id = self.get_tenant_id(options)
        all_system = options.get('all_system')

        session_service = SessionService()

        if email or user_id:
            user = self.get_user(options)
            count = session_service.terminate_all_sessions(user)
            self.stdout.write(self.style.SUCCESS(f"✅ Terminated {count} active sessions for user {user.email}."))
            return

        if tenant_id:
            count = UserSession.objects.filter(tenant_id=tenant_id, status='active').update(status='revoked', logout_time=timezone.now())
            self.stdout.write(self.style.SUCCESS(f"✅ Terminated {count} active sessions across tenant {tenant_id}."))
            return

        if all_system:
            count = UserSession.objects.filter(status='active').update(status='revoked', logout_time=timezone.now())
            self.stdout.write(self.style.SUCCESS(f"✅ System-wide termination complete: {count} active sessions terminated."))
            return

        raise CommandError("Please specify --email, --user-id, --admin/--tenant-id, or --all-system.")

    def handle_cleanup(self, options: dict):
        days = options.get('days', 30)
        dry_run = options.get('dry_run')

        cutoff = timezone.now() - timedelta(days=days)
        expired_sessions_qs = UserSession.objects.filter(login_time__lt=cutoff)
        expired_bl_qs = SessionBlacklist.objects.filter(expires_at__lt=timezone.now())

        sess_count = expired_sessions_qs.count()
        bl_count = expired_bl_qs.count()

        if dry_run:
            self.stdout.write(self.style.WARNING(f"\n🔍 [DRY RUN] Cleanup Preview (Older than {days} days):"))
            self.stdout.write(f"  • Expired Sessions to Delete:   {sess_count}")
            self.stdout.write(f"  • Expired Blacklist Entries:    {bl_count}\n")
            return

        del_sess_count, _ = expired_sessions_qs.delete()
        del_bl_count, _ = expired_bl_qs.delete()

        self.stdout.write(self.style.SUCCESS(f"\n🧹 Session cleanup complete!"))
        self.stdout.write(f"  • Deleted old sessions:         {del_sess_count}")
        self.stdout.write(f"  • Deleted expired blacklist:    {del_bl_count}\n")

    def handle_blacklist(self, options: dict):
        view_only = options.get('view')
        token_id = options.get('token_id')
        user_email = options.get('user_email')
        reason = options.get('reason')
        hours = options.get('hours', 24)

        if view_only or not token_id:
            entries = SessionBlacklist.objects.select_related('user').all()[:50]
            self.stdout.write(self.style.SUCCESS(f"\n🚫 JWT SESSION BLACKLIST ({entries.count()} entries)"))
            self.stdout.write("=" * 90)
            self.stdout.write(f"{'TOKEN ID (JTI)':<38} {'USER':<26} {'REASON':<20} {'EXPIRES'}")
            self.stdout.write("-" * 90)
            for b in entries:
                u_str = b.user.email if b.user else '-'
                exp_str = b.expires_at.strftime('%Y-%m-%d %H:%M') if b.expires_at else '-'
                self.stdout.write(f"{b.token_id:<38} {u_str[:24]:<26} {b.reason[:18]:<20} {exp_str}")
            self.stdout.write("=" * 90 + "\n")
            return

        user = None
        if user_email:
            user = User.objects.filter(email__iexact=user_email.strip()).first()

        expires = timezone.now() + timedelta(hours=hours)
        SessionBlacklist.objects.update_or_create(
            token_id=token_id,
            defaults={
                'token_type': 'access',
                'user': user,
                'reason': reason,
                'expires_at': expires
            }
        )
        self.stdout.write(self.style.SUCCESS(f"✅ Token '{token_id}' added to blacklist until {expires}."))

    def handle_stats(self, options: dict):
        tenant_id = self.get_tenant_id(options)
        qs = UserSession.objects.all()

        if tenant_id:
            qs = qs.filter(tenant_id=tenant_id)
            self.stdout.write(self.style.SUCCESS(f"\n📊 SESSION STATISTICS (Tenant: {tenant_id})"))
        else:
            self.stdout.write(self.style.SUCCESS("\n📊 GLOBAL SESSION STATISTICS"))

        total = qs.count()
        active = qs.filter(status='active', expires_at__gt=timezone.now()).count()
        revoked = qs.filter(status='revoked').count()
        expired = qs.filter(status='expired').count()
        logged_out = qs.filter(status='logged_out').count()

        desktops = qs.filter(device_type='desktop').count()
        mobiles = qs.filter(device_type='mobile').count()
        tablets = qs.filter(device_type='tablet').count()

        self.stdout.write("=" * 70)
        self.stdout.write(f"  • Total Sessions:         {total}")
        self.stdout.write(f"  • Active Sessions:        {active}")
        self.stdout.write(f"  • Revoked / Terminated:   {revoked}")
        self.stdout.write(f"  • Logged Out:             {logged_out}")
        self.stdout.write(f"  • Expired:                {expired}")
        self.stdout.write("-" * 70)
        self.stdout.write("  📱 Device Distribution:")
        self.stdout.write(f"     ↳ Desktop:             {desktops} ({(desktops/total*100):.1f}%)" if total else "     ↳ Desktop: 0")
        self.stdout.write(f"     ↳ Mobile:              {mobiles} ({(mobiles/total*100):.1f}%)" if total else "     ↳ Mobile: 0")
        self.stdout.write(f"     ↳ Tablet:              {tablets} ({(tablets/total*100):.1f}%)" if total else "     ↳ Tablet: 0")
        self.stdout.write("=" * 70 + "\n")
