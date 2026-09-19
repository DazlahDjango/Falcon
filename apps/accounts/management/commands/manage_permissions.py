"""
================================================================================
Falcon PMS - RBAC & Permissions Management Command
================================================================================
Usage:
  python manage.py manage_permissions list [--category <cat>] [--level <lvl>]
  python manage.py manage_permissions roles [--role <role_code>]
  python manage.py manage_permissions user-info --email <user_email>
  python manage.py manage_permissions grant --email <user_email> --perms <p1,p2> [--super-admin-override]
  python manage.py manage_permissions revoke --email <user_email> --perms <p1,p2>
  python manage.py manage_permissions clear --email <user_email>
  python manage.py manage_permissions purge-cache [--email <user_email>] [--all]
================================================================================
"""

import sys
from django.core.management.base import BaseCommand
from django.core.cache import cache
from apps.accounts.models import User, Role
from apps.accounts.services.authorization.rbac import RBACService
from apps.accounts.constants import (
    ROLE_DEFAULT_PERMISSIONS,
    PREDEFINED_PERMISSIONS_DATA,
    SYSTEM_RESTRICTED_CATEGORIES,
    TENANT_ASSIGNABLE_CATEGORIES,
    UserRoles,
    PermissionCategories,
    PermissionLevels,
    CacheKeys,
)

if sys.platform.startswith('win') and hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass


class Command(BaseCommand):
    help = "Manage Falcon PMS RBAC permissions, role baselines, user overrides, and cache."

    def add_arguments(self, parser):
        subparsers = parser.add_subparsers(dest="subcommand", help="Permissions action to perform")

        # Subcommand: list
        list_parser = subparsers.add_parser("list", help="List all catalog permissions")
        list_parser.add_argument("--category", type=str, help="Filter by category (kpi, review, user, config, etc.)")
        list_parser.add_argument("--level", type=str, help="Filter by level (global, tenant, department, team, self)")
        list_parser.add_argument("--system-only", action="store_true", help="Only show system-restricted apps")

        # Subcommand: roles
        roles_parser = subparsers.add_parser("roles", help="Inspect role default permissions")
        roles_parser.add_argument("--role", type=str, help="Specific role code (e.g. client_admin, staff)")

        # Subcommand: user-info
        user_parser = subparsers.add_parser("user-info", help="Inspect a user's permissions breakdown")
        user_parser.add_argument("--email", type=str, required=True, help="User email address")

        # Subcommand: grant
        grant_parser = subparsers.add_parser("grant", help="Grant custom permissions to a user")
        grant_parser.add_argument("--email", type=str, required=True, help="User email address")
        grant_parser.add_argument("--perms", type=str, required=True, help="Comma-separated permission codenames")
        grant_parser.add_argument("--super-admin-override", action="store_true", help="Authorize as Super Admin")

        # Subcommand: revoke
        revoke_parser = subparsers.add_parser("revoke", help="Revoke default/custom permissions from a user")
        revoke_parser.add_argument("--email", type=str, required=True, help="User email address")
        revoke_parser.add_argument("--perms", type=str, required=True, help="Comma-separated permission codenames")

        # Subcommand: clear
        clear_parser = subparsers.add_parser("clear", help="Clear all custom permission overrides for a user")
        clear_parser.add_argument("--email", type=str, required=True, help="User email address")

        # Subcommand: purge-cache
        purge_parser = subparsers.add_parser("purge-cache", help="Invalidate Redis permissions cache")
        purge_parser.add_argument("--email", type=str, help="User email address")
        purge_parser.add_argument("--all", action="store_true", help="Purge permission cache for all users")

    def handle(self, *args, **options):
        subcommand = options.get("subcommand")
        rbac = RBACService()

        if not subcommand:
            self.stdout.write(self.style.WARNING("Please provide a subcommand. Use --help for available commands."))
            return

        if subcommand == "list":
            self._handle_list(options)
        elif subcommand == "roles":
            self._handle_roles(options, rbac)
        elif subcommand == "user-info":
            self._handle_user_info(options, rbac)
        elif subcommand == "grant":
            self._handle_grant(options, rbac)
        elif subcommand == "revoke":
            self._handle_revoke(options, rbac)
        elif subcommand == "clear":
            self._handle_clear(options, rbac)
        elif subcommand == "purge-cache":
            self._handle_purge_cache(options, rbac)

    def _handle_list(self, options):
        cat_filter = options.get("category")
        lvl_filter = options.get("level")
        sys_only = options.get("system_only")

        perms = list(PREDEFINED_PERMISSIONS_DATA)
        if cat_filter:
            perms = [p for p in perms if p.get("category") == cat_filter]
        if lvl_filter:
            perms = [p for p in perms if p.get("level") == lvl_filter]
        if sys_only:
            perms = [p for p in perms if p.get("category") in SYSTEM_RESTRICTED_CATEGORIES]

        self.stdout.write(self.style.SUCCESS(f"\nCatalog Permissions ({len(perms)} items):"))
        self.stdout.write("-" * 80)
        self.stdout.write(f"{'Codename':<28} | {'Category':<12} | {'Level':<10} | {'Scope / Access'}")
        self.stdout.write("-" * 80)
        for p in perms:
            cat = p.get('category', '')
            lvl = p.get('level', '')
            is_sys = cat in SYSTEM_RESTRICTED_CATEGORIES or lvl == PermissionLevels.GLOBAL
            scope_label = "[SYSTEM] Super Admin Only" if is_sys else "[TENANT] Business App"
            self.stdout.write(f"{p['codename']:<28} | {cat:<12} | {lvl:<10} | {scope_label}")
        self.stdout.write("-" * 80)

    def _handle_roles(self, options, rbac):
        role_filter = options.get("role")
        roles_to_show = [role_filter] if role_filter else [
            UserRoles.SUPER_ADMIN,
            UserRoles.CLIENT_ADMIN,
            UserRoles.HR_ADMIN,
            UserRoles.EXECUTIVE,
            UserRoles.SUPERVISOR,
            UserRoles.STAFF,
            UserRoles.READ_ONLY,
        ]

        self.stdout.write(self.style.SUCCESS("\nRole Baseline Permissions Matrix:"))
        self.stdout.write("=" * 80)
        for r_code in roles_to_show:
            if r_code == UserRoles.SUPER_ADMIN:
                defaults = [p['codename'] for p in PREDEFINED_PERMISSIONS_DATA]
            else:
                defaults = rbac.get_role_default_permissions(r_code)
            self.stdout.write(self.style.MIGRATE_HEADING(f"\nRole: {r_code.upper()} ({len(defaults)} permissions)"))
            self.stdout.write("-" * 80)
            formatted_perms = ", ".join(defaults) if defaults else "None"
            self.stdout.write(formatted_perms)
        self.stdout.write("\n" + "=" * 80)

    def _handle_user_info(self, options, rbac):
        email = options.get("email")
        user = User.objects.filter(email=email, is_deleted=False).first()
        if not user:
            self.stdout.write(self.style.ERROR(f"[ERROR] User with email '{email}' not found."))
            return

        details = rbac.get_user_permission_details(user)
        self.stdout.write(self.style.SUCCESS(f"\nPermissions Breakdown for: {user.email}"))
        self.stdout.write("=" * 80)
        self.stdout.write(f"Role:                {user.role} ({details.get('role_display')})")
        self.stdout.write(f"Tenant ID:           {user.tenant_id or 'Global / None'}")
        self.stdout.write(f"Role Baseline Count: {len(details.get('role_defaults', []))}")
        self.stdout.write(f"Granted Overrides:   {details.get('granted') or 'None'}")
        self.stdout.write(f"Revoked Overrides:   {details.get('revoked') or 'None'}")
        self.stdout.write(f"Total Effective:     {len(details.get('effective', []))} permissions")
        self.stdout.write("-" * 80)
        self.stdout.write("Effective Permissions:")
        self.stdout.write(", ".join(details.get('effective', [])))
        self.stdout.write("=" * 80)

    def _handle_grant(self, options, rbac):
        email = options.get("email")
        perms = [p.strip() for p in options.get("perms", "").split(",") if p.strip()]
        super_override = options.get("super_admin_override")

        user = User.objects.filter(email=email, is_deleted=False).first()
        if not user:
            self.stdout.write(self.style.ERROR(f"[ERROR] User with email '{email}' not found."))
            return

        assigner = User.objects.filter(role=UserRoles.SUPER_ADMIN, is_deleted=False).first() if super_override else None

        current = getattr(user, 'custom_permission_overrides', {}) or {}
        existing_granted = set(current.get('granted', []))
        existing_revoked = set(current.get('revoked', []))

        new_granted = list(existing_granted | set(perms))
        new_revoked = list(existing_revoked - set(perms))

        success, msg = rbac.assign_user_permission_override(
            user=user,
            granted=new_granted,
            revoked=new_revoked,
            assigned_by=assigner
        )
        if success:
            self.stdout.write(self.style.SUCCESS(f"[SUCCESS] Successfully granted permissions {perms} to {user.email}"))
        else:
            self.stdout.write(self.style.ERROR(f"[ERROR] Failed to grant permissions: {msg}"))

    def _handle_revoke(self, options, rbac):
        email = options.get("email")
        perms = [p.strip() for p in options.get("perms", "").split(",") if p.strip()]

        user = User.objects.filter(email=email, is_deleted=False).first()
        if not user:
            self.stdout.write(self.style.ERROR(f"[ERROR] User with email '{email}' not found."))
            return

        current = getattr(user, 'custom_permission_overrides', {}) or {}
        existing_granted = set(current.get('granted', []))
        existing_revoked = set(current.get('revoked', []))

        new_granted = list(existing_granted - set(perms))
        new_revoked = list(existing_revoked | set(perms))

        success, msg = rbac.assign_user_permission_override(
            user=user,
            granted=new_granted,
            revoked=new_revoked
        )
        if success:
            self.stdout.write(self.style.SUCCESS(f"[SUCCESS] Successfully revoked permissions {perms} from {user.email}"))
        else:
            self.stdout.write(self.style.ERROR(f"[ERROR] Failed to revoke permissions: {msg}"))

    def _handle_clear(self, options, rbac):
        email = options.get("email")
        user = User.objects.filter(email=email, is_deleted=False).first()
        if not user:
            self.stdout.write(self.style.ERROR(f"[ERROR] User with email '{email}' not found."))
            return

        success, msg = rbac.assign_user_permission_override(
            user=user,
            granted=[],
            revoked=[]
        )
        if success:
            self.stdout.write(self.style.SUCCESS(f"[SUCCESS] Successfully cleared all overrides for {user.email} (restored to role baseline)"))
        else:
            self.stdout.write(self.style.ERROR(f"[ERROR] Failed to clear overrides: {msg}"))

    def _handle_purge_cache(self, options, rbac):
        email = options.get("email")
        purge_all = options.get("all")

        if email:
            user = User.objects.filter(email=email, is_deleted=False).first()
            if not user:
                self.stdout.write(self.style.ERROR(f"[ERROR] User with email '{email}' not found."))
                return
            rbac.clear_user_permission_cache(user.id)
            self.stdout.write(self.style.SUCCESS(f"[SUCCESS] Invalidated permissions cache for user: {user.email}"))
        elif purge_all:
            users = User.objects.filter(is_deleted=False)
            for u in users:
                rbac.clear_user_permission_cache(u.id)
            self.stdout.write(self.style.SUCCESS(f"[SUCCESS] Invalidated permissions cache for all {users.count()} users."))
        else:
            self.stdout.write(self.style.WARNING("Please specify either --email <email> or --all"))
