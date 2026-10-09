"""
Comprehensive Management Command for Falcon PMS Login Attempts & Rate Limiting Management.
Handles:
- Clearing login attempts from database with granular filters (all, email, ip, days, failed-only)
- Unlocking locked accounts (individual or system-wide)
- Clearing django-axes access attempts and logs
- Clearing Django/Redis cache rate-limit and throttle buckets
- Viewing recent login attempts and security statistics

Usage Examples:
    python manage.py manage_login_attempts clear --all
    python manage.py manage_login_attempts clear --all --unlock --clear-axes --clear-cache
    python manage.py manage_login_attempts clear --email user@example.com --unlock
    python manage.py manage_login_attempts clear --ip 127.0.0.1
    python manage.py manage_login_attempts clear --days 30
    python manage.py manage_login_attempts clear --failed-only
    python manage.py manage_login_attempts unlock --email user@example.com
    python manage.py manage_login_attempts unlock --all
    python manage.py manage_login_attempts list --limit 20
    python manage.py manage_login_attempts list --email user@example.com --result failure
    python manage.py manage_login_attempts stats
"""

import sys
from datetime import timedelta
from typing import Optional, List, Dict

if sys.stdout.encoding != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

from django.core.management.base import BaseCommand, CommandError
from django.core.cache import cache
from django.db import transaction
from django.utils import timezone

from apps.accounts.models import User, LoginAttempt


class Command(BaseCommand):
    help = 'Comprehensive management command for login attempts, rate limit flushing, and account lockout management.'

    def add_arguments(self, parser):
        subparsers = parser.add_subparsers(dest='action', required=True, help='Login attempt action to perform')

        # ---------------- CLEAR ----------------
        clear_parser = subparsers.add_parser('clear', help='Clear login attempts from the database and reset rate limits')
        clear_parser.add_argument('--all', action='store_true', help='Clear ALL login attempts in the database')
        clear_parser.add_argument('--email', '-e', type=str, help='Clear attempts matching a specific email / identifier')
        clear_parser.add_argument('--ip', type=str, help='Clear attempts matching a specific IP address')
        clear_parser.add_argument('--days', '-d', type=int, help='Clear attempts older than N days')
        clear_parser.add_argument('--failed-only', action='store_true', help='Clear only failed/locked attempts')
        clear_parser.add_argument('--unlock', action='store_true', help='Also reset login attempts and lockouts for target/all users')
        clear_parser.add_argument('--clear-axes', action='store_true', help='Also clear django-axes AccessAttempt and AccessLog tables')
        clear_parser.add_argument('--clear-cache', action='store_true', help='Also flush Django/Redis throttle and rate-limit cache')

        # ---------------- UNLOCK ----------------
        unlock_parser = subparsers.add_parser('unlock', help='Unlock locked user accounts and reset failure counters')
        unlock_parser.add_argument('--email', '-e', type=str, help='Email of user to unlock')
        unlock_parser.add_argument('--user-id', '-u', type=str, help='UUID of user to unlock')
        unlock_parser.add_argument('--all', action='store_true', help='Unlock all locked users system-wide')

        # ---------------- LIST ----------------
        list_parser = subparsers.add_parser('list', help='List recent login attempts with optional filters')
        list_parser.add_argument('--email', '-e', type=str, help='Filter by email / identifier')
        list_parser.add_argument('--ip', type=str, help='Filter by IP address')
        list_parser.add_argument('--result', '-r', type=str, choices=['success', 'failure', 'locked'], help='Filter by result')
        list_parser.add_argument('--reason', type=str, help='Filter by failure reason')
        list_parser.add_argument('--limit', '-l', type=int, default=25, help='Max records to display (default: 25)')

        # ---------------- STATS ----------------
        subparsers.add_parser('stats', help='Display security metrics and summary for login attempts')

    def handle(self, *args, **options):
        action = options['action']

        if action == 'clear':
            self._handle_clear(options)
        elif action == 'unlock':
            self._handle_unlock(options)
        elif action == 'list':
            self._handle_list(options)
        elif action == 'stats':
            self._handle_stats(options)
        else:
            raise CommandError(f"Unknown action: {action}")

    # =========================================================================
    # CLEAR ACTION
    # =========================================================================
    def _handle_clear(self, options):
        clear_all = options.get('all')
        email = options.get('email')
        ip = options.get('ip')
        days = options.get('days')
        failed_only = options.get('failed_only')
        unlock = options.get('unlock')
        clear_axes = options.get('clear_axes')
        clear_cache = options.get('clear_cache')

        if not any([clear_all, email, ip, days is not None, failed_only, unlock, clear_axes, clear_cache]):
            self.stdout.write(self.style.WARNING(
                "No filter specified. Please specify --all, --email, --ip, --days, --unlock, etc.\n"
                "Run with -h for help."
            ))
            return

        qs = LoginAttempt.objects.all()

        if email:
            email_clean = email.lower().strip()
            qs = qs.filter(identifier=email_clean)
        if ip:
            qs = qs.filter(ip_address=ip.strip())
        if days is not None:
            cutoff = timezone.now() - timedelta(days=days)
            qs = qs.filter(attempted_at__lt=cutoff)
        if failed_only:
            qs = qs.filter(result__in=[LoginAttempt.FAILURE, LoginAttempt.LOCKED])

        deleted_count = 0
        if clear_all or email or ip or days is not None or failed_only:
            deleted_count, _ = qs.delete()
            self.stdout.write(self.style.SUCCESS(f"[SUCCESS] Deleted {deleted_count} login attempt record(s)."))

        # Unlock users
        if unlock:
            if email:
                users_updated = User.objects.filter(email__iexact=email.strip()).update(
                    login_attempts=0,
                    locked_until=None
                )
                self.stdout.write(self.style.SUCCESS(f"[SUCCESS] Reset lockout and failed attempts for user: {email}"))
            else:
                users_updated = User.objects.filter(login_attempts__gt=0).update(
                    login_attempts=0,
                    locked_until=None
                )
                # Also reset any users with locked_until set
                users_locked = User.objects.filter(locked_until__isnull=False).update(
                    locked_until=None,
                    login_attempts=0
                )
                self.stdout.write(self.style.SUCCESS(f"[SUCCESS] Reset lockout state for {users_updated + users_locked} user(s)."))

        # Clear axes
        if clear_axes or clear_all:
            try:
                from axes.models import AccessAttempt, AccessLog
                axes_attempts, _ = AccessAttempt.objects.all().delete()
                axes_logs, _ = AccessLog.objects.all().delete()
                self.stdout.write(self.style.SUCCESS(f"[SUCCESS] Deleted {axes_attempts} axes attempt(s) and {axes_logs} axes log(s)."))
            except Exception as e:
                self.stdout.write(self.style.WARNING(f"[NOTICE] Axes table cleanup: {e}"))

        # Clear cache
        if clear_cache or clear_all:
            cache.clear()
            self.stdout.write(self.style.SUCCESS("[SUCCESS] Cleared Django and rate-limiting cache."))

    # =========================================================================
    # UNLOCK ACTION
    # =========================================================================
    def _handle_unlock(self, options):
        email = options.get('email')
        user_id = options.get('user_id')
        unlock_all = options.get('all')

        if not any([email, user_id, unlock_all]):
            raise CommandError("Please specify --email, --user-id, or --all to unlock users.")

        if unlock_all:
            count = User.objects.filter(login_attempts__gt=0).update(login_attempts=0, locked_until=None)
            locked_count = User.objects.filter(locked_until__isnull=False).update(locked_until=None, login_attempts=0)
            self.stdout.write(self.style.SUCCESS(f"[SUCCESS] Unlocked all accounts: {count + locked_count} user(s) reset."))
            return

        if email:
            user = User.objects.filter(email__iexact=email.strip()).first()
            if not user:
                raise CommandError(f"User with email '{email}' not found.")
        elif user_id:
            user = User.objects.filter(id=user_id.strip()).first()
            if not user:
                raise CommandError(f"User with UUID '{user_id}' not found.")
        else:
            return

        user.login_attempts = 0
        user.locked_until = None
        user.save(update_fields=['login_attempts', 'locked_until'])
        self.stdout.write(self.style.SUCCESS(f"[SUCCESS] Successfully unlocked account for: {user.email} (ID: {user.id})"))

    # =========================================================================
    # LIST ACTION
    # =========================================================================
    def _handle_list(self, options):
        email = options.get('email')
        ip = options.get('ip')
        result = options.get('result')
        reason = options.get('reason')
        limit = options.get('limit', 25)

        qs = LoginAttempt.objects.select_related('user').all().order_by('-attempted_at')

        if email:
            qs = qs.filter(identifier__icontains=email.strip())
        if ip:
            qs = qs.filter(ip_address__icontains=ip.strip())
        if result:
            qs = qs.filter(result=result)
        if reason:
            qs = qs.filter(failure_reason__icontains=reason.strip())

        total = qs.count()
        records = list(qs[:limit])

        if not records:
            self.stdout.write(self.style.WARNING("No login attempts found matching the specified filters."))
            return

        self.stdout.write("\n" + "=" * 110)
        self.stdout.write(f" RECENT LOGIN ATTEMPTS (Showing {len(records)} of {total} records)")
        self.stdout.write("=" * 110)
        self.stdout.write(f"{'Attempted At':<22} | {'Identifier':<30} | {'IP Address':<16} | {'Result':<10} | {'Reason':<20}")
        self.stdout.write("-" * 110)

        for r in records:
            dt_str = r.attempted_at.strftime('%Y-%m-%d %H:%M:%S') if r.attempted_at else 'N/A'
            ident = (r.identifier or 'N/A')[:28]
            ip_str = (r.ip_address or 'N/A')[:15]
            res_str = r.result or 'N/A'
            reason_str = (r.failure_reason or '-')[:20]

            if r.result == LoginAttempt.SUCCESS:
                res_formatted = self.style.SUCCESS(f"{res_str:<10}")
            elif r.result == LoginAttempt.LOCKED:
                res_formatted = self.style.ERROR(f"{res_str:<10}")
            else:
                res_formatted = self.style.WARNING(f"{res_str:<10}")

            self.stdout.write(f"{dt_str:<22} | {ident:<30} | {ip_str:<16} | {res_formatted} | {reason_str:<20}")

        self.stdout.write("=" * 110 + "\n")

    # =========================================================================
    # STATS ACTION
    # =========================================================================
    def _handle_stats(self, options):
        total_attempts = LoginAttempt.objects.count()
        success_count = LoginAttempt.objects.filter(result=LoginAttempt.SUCCESS).count()
        failure_count = LoginAttempt.objects.filter(result=LoginAttempt.FAILURE).count()
        locked_count = LoginAttempt.objects.filter(result=LoginAttempt.LOCKED).count()

        cutoff_24h = timezone.now() - timedelta(hours=24)
        attempts_24h = LoginAttempt.objects.filter(attempted_at__gte=cutoff_24h).count()
        failures_24h = LoginAttempt.objects.filter(attempted_at__gte=cutoff_24h, result__in=[LoginAttempt.FAILURE, LoginAttempt.LOCKED]).count()

        locked_users_count = User.objects.filter(locked_until__isnull=False).filter(locked_until__gt=timezone.now()).count()
        users_with_failures = User.objects.filter(login_attempts__gt=0).count()

        from django.db.models import Count
        top_failed_ips = (
            LoginAttempt.objects.filter(result__in=[LoginAttempt.FAILURE, LoginAttempt.LOCKED])
            .values('ip_address')
            .annotate(count=Count('id'))
            .order_by('-count')[:5]
        )

        top_failed_idents = (
            LoginAttempt.objects.filter(result__in=[LoginAttempt.FAILURE, LoginAttempt.LOCKED])
            .values('identifier')
            .annotate(count=Count('id'))
            .order_by('-count')[:5]
        )

        self.stdout.write("\n" + "=" * 60)
        self.stdout.write(" LOGIN SECURITY & ATTEMPT STATISTICS")
        self.stdout.write("=" * 60)
        self.stdout.write(f" Total Attempts Recorded:     {total_attempts}")
        self.stdout.write(f"   - Successful:              {self.style.SUCCESS(str(success_count))}")
        self.stdout.write(f"   - Failed:                  {self.style.WARNING(str(failure_count))}")
        self.stdout.write(f"   - Locked:                  {self.style.ERROR(str(locked_count))}")
        self.stdout.write(f" Last 24 Hours Activity:      {attempts_24h} attempts ({failures_24h} failed)")
        self.stdout.write(f" Currently Locked Users:      {self.style.ERROR(str(locked_users_count))}")
        self.stdout.write(f" Users with Failed Count > 0: {users_with_failures}")

        if top_failed_ips:
            self.stdout.write("-" * 60)
            self.stdout.write(" Top Failed IP Addresses:")
            for item in top_failed_ips:
                self.stdout.write(f"   • {item['ip_address']:<25}: {item['count']} failures")

        if top_failed_idents:
            self.stdout.write("-" * 60)
            self.stdout.write(" Top Target Identifiers:")
            for item in top_failed_idents:
                self.stdout.write(f"   • {item['identifier']:<25}: {item['count']} failures")

        self.stdout.write("=" * 60 + "\n")
