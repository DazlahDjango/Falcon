"""
================================================================================
Falcon PMS - Comprehensive Profile & Structure Synchronization Management Command
================================================================================
Handles:
- Structure auto-synchronization: fill/sync department, title, manager, employee_type, cost_center, employee_id
- Detailed Single-User Profile Info: View 100% completion metrics, structure levels, personal & contact data
- Profile Auditing & Listing: List profiles with completion %, search & filter by tenant / admin
- Recalculate Completion: Compute profile completion scores across tenant or system-wide
- Profile Updates: CLI update of personal, contact, and preference details

Usage Examples:
    # Fill structure data for single user
    python manage.py manage_profile fill-structure --email careen@falcontech.com

    # Fill structure data for all users under an admin's tenant
    python manage.py manage_profile fill-structure --admin careen@falcontech.com

    # Fill structure data for all users in a specific tenant
    python manage.py manage_profile fill-structure --tenant-id 275adb1f-8e12-46ee-b394-ea42d41b10c9

    # Fill structure data system-wide
    python manage.py manage_profile fill-structure --all

    # Inspect single user detailed profile & completion status
    python manage.py manage_profile info --email careen@falcontech.com
    python manage.py manage_profile info --user-id <user_uuid>

    # List profiles with completion & structure status
    python manage.py manage_profile list --admin careen@falcontech.com
    python manage.py manage_profile list --incomplete

    # Recalculate profile completion metrics
    python manage.py manage_profile completion --admin careen@falcontech.com

    # Update personal profile data
    python manage.py manage_profile update --email careen@falcontech.com --work-phone "+254700000000" --city "Nairobi"
================================================================================
"""

import sys
import json
from typing import Optional, List, Dict

if sys.platform.startswith('win') and hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.db.models import Q

from apps.accounts.models import User, Profile
from apps.accounts.services.profile.profile_manager import profile_service
from apps.accounts.services.structure_sync import (
    sync_user_profile_from_employment,
    backfill_all_structure_user_profiles,
)


class Command(BaseCommand):
    help = 'Comprehensive management command for user profiles and Structure App auto-synchronization.'

    def add_arguments(self, parser):
        subparsers = parser.add_subparsers(dest='action', required=True, help='Profile action to perform')

        # ---------------- FILL / SYNC STRUCTURE ----------------
        sync_parser = subparsers.add_parser(
            'fill-structure',
            aliases=['sync-structure', 'sync'],
            help='Auto-fill structure data (department, title, manager, employee_type, cost_center, employee_id) from Structure App'
        )
        sync_parser.add_argument('--email', '-e', type=str, help='Target single user email')
        sync_parser.add_argument('--user-id', '-u', type=str, help='Target single user UUID')
        sync_parser.add_argument('--tenant-id', '-t', type=str, help='Target tenant ID')
        sync_parser.add_argument('--admin', '-a', type=str, help='Admin email (resolves tenant ID to target tenant users)')
        sync_parser.add_argument('--all', action='store_true', help='Target all users system-wide across all tenants')
        sync_parser.add_argument('--force', action='store_true', help='Force resync even if profile structure fields are already populated')

        # ---------------- INFO ----------------
        info_parser = subparsers.add_parser('info', aliases=['show', 'view'], help='Display detailed profile data and 100%% completion breakdown')
        info_parser.add_argument('--email', '-e', type=str, help='User email address')
        info_parser.add_argument('--user-id', '-u', type=str, help='User UUID')
        info_parser.add_argument('--admin', '-a', type=str, help='Admin user email to view')

        # ---------------- LIST ----------------
        list_parser = subparsers.add_parser('list', help='List profiles with structure and completion status')
        list_parser.add_argument('--tenant-id', '-t', type=str, help='Filter by tenant ID')
        list_parser.add_argument('--admin', '-a', type=str, help='Filter by admin\'s tenant ID')
        list_parser.add_argument('--role', '-r', type=str, help='Filter by user role')
        list_parser.add_argument('--search', '-q', type=str, help='Search term (email, name, department, title)')
        list_parser.add_argument('--incomplete', action='store_true', help='Show only users with completion percentage < 100%')
        list_parser.add_argument('--limit', '-l', type=int, default=50, help='Maximum records to show (default 50)')

        # ---------------- COMPLETION AUDIT ----------------
        comp_parser = subparsers.add_parser('completion', help='Audit and recalculate profile completion metrics')
        comp_parser.add_argument('--email', '-e', type=str, help='Audit single user profile completion')
        comp_parser.add_argument('--tenant-id', '-t', type=str, help='Audit completion for specific tenant ID')
        comp_parser.add_argument('--admin', '-a', type=str, help='Audit completion for admin\'s tenant ID')
        comp_parser.add_argument('--all', action='store_true', help='Audit profile completion system-wide')

        # ---------------- UPDATE PROFILE ----------------
        update_parser = subparsers.add_parser('update', help='Update personal or contact profile details for a user')
        update_parser.add_argument('--email', '-e', type=str, required=True, help='User email address')
        update_parser.add_argument('--first-name', type=str, help='First name')
        update_parser.add_argument('--last-name', type=str, help='Last name')
        update_parser.add_argument('--phone', type=str, help='Phone number')
        update_parser.add_argument('--work-phone', type=str, help='Work phone number')
        update_parser.add_argument('--mobile-phone', type=str, help='Mobile phone number')
        update_parser.add_argument('--alt-email', type=str, help='Alternative email address')
        update_parser.add_argument('--bio', type=str, help='Profile biography')
        update_parser.add_argument('--address', type=str, help='Physical address')
        update_parser.add_argument('--city', type=str, help='City')
        update_parser.add_argument('--country', type=str, help='Country')
        update_parser.add_argument('--timezone', type=str, help='Timezone (e.g. Africa/Nairobi)')
        update_parser.add_argument('--theme', choices=['light', 'dark'], help='UI theme preference')

    def handle(self, *args, **options):
        action = options.get('action')
        if action in ['fill-structure', 'sync-structure', 'sync']:
            self._handle_fill_structure(options)
        elif action in ['info', 'show', 'view']:
            self._handle_info(options)
        elif action == 'list':
            self._handle_list(options)
        elif action == 'completion':
            self._handle_completion(options)
        elif action == 'update':
            self._handle_update(options)
        else:
            raise CommandError(f"Unknown action: {action}")

    # =========================================================================
    # HELPER: RESOLVE USERS / TENANT
    # =========================================================================
    def _resolve_users(self, options) -> List[User]:
        email = options.get('email')
        user_id = options.get('user_id')
        tenant_id = options.get('tenant_id')
        admin_email = options.get('admin')
        target_all = options.get('all', False)

        if email:
            user = User.objects.filter(email=email, is_deleted=False).first()
            if not user:
                raise CommandError(f"User with email '{email}' not found.")
            return [user]

        if user_id:
            user = User.objects.filter(id=user_id, is_deleted=False).first()
            if not user:
                raise CommandError(f"User with UUID '{user_id}' not found.")
            return [user]

        if admin_email:
            admin_user = User.objects.filter(email=admin_email, is_deleted=False).first()
            if not admin_user:
                raise CommandError(f"Admin user with email '{admin_email}' not found.")
            if admin_user.is_superuser:
                # If admin is superuser and no tenant_id explicitly assigned, return all users or admin user
                self.stdout.write(self.style.NOTICE(f"Admin '{admin_email}' is Super Admin. Filtering users system-wide."))
                return list(User.objects.filter(is_deleted=False))
            
            resolved_tenant = admin_user.tenant_id
            if not resolved_tenant:
                raise CommandError(f"Admin user '{admin_email}' has no tenant ID assigned.")
            return list(User.objects.filter(tenant_id=resolved_tenant, is_deleted=False))

        if tenant_id:
            return list(User.objects.filter(tenant_id=tenant_id, is_deleted=False))

        if target_all:
            return list(User.objects.filter(is_deleted=False))

        raise CommandError("Please specify --email, --user-id, --admin, --tenant-id, or --all.")

    # =========================================================================
    # ACTION: FILL / SYNC STRUCTURE DATA
    # =========================================================================
    def _handle_fill_structure(self, options):
        users = self._resolve_users(options)
        force = options.get('force', False)
        
        self.stdout.write(self.style.MIGRATE_HEADING(f"\n=== Filling Structure Data for {len(users)} User(s) ==="))
        
        synced_count = 0
        updated_details = []

        for user in users:
            # First try structure app employment sync
            synced_user = sync_user_profile_from_employment(user.id)
            profile = profile_service.get_profile(user)

            # If user has no structure employment mapping (e.g. Super Admin or system admin),
            # check if default structure fallback is appropriate to achieve 100% completeness
            was_updated = False
            user_updates = []
            profile_updates = []

            if not user.department:
                if user.is_superuser:
                    user.department = 'Executive Management'
                    user_updates.append('department')
                elif user.role == 'client_admin':
                    user.department = 'Administration'
                    user_updates.append('department')
                elif user.role == 'manager':
                    user.department = 'Management Unit'
                    user_updates.append('department')

            if not user.title or not profile.title:
                title_val = user.title or profile.title
                if not title_val:
                    if user.is_superuser:
                        title_val = 'Super Administrator'
                    elif user.role == 'client_admin':
                        title_val = 'Client Administrator'
                    elif user.role == 'manager':
                        title_val = 'Unit Manager'
                    elif user.role == 'champion':
                        title_val = 'System Champion'
                    else:
                        title_val = 'Staff Member'
                
                if user.title != title_val:
                    user.title = title_val
                    user_updates.append('title')
                if profile.title != title_val:
                    profile.title = title_val
                    profile_updates.append('title')

            if not profile.employee_type:
                profile.employee_type = 'Full-time'
                profile_updates.append('employee_type')

            if not profile.cost_center:
                if user.is_superuser:
                    profile.cost_center = 'EXEC-001'
                elif user.tenant_id:
                    profile.cost_center = f"CC-{str(user.tenant_id)[:6].upper()}"
                else:
                    profile.cost_center = 'GEN-001'
                profile_updates.append('cost_center')

            if user_updates:
                user.save(update_fields=list(set(user_updates)))
                was_updated = True
            if profile_updates:
                profile.save(update_fields=list(set(profile_updates)))
                was_updated = True

            synced_count += 1
            completion = profile_service.get_profile_completion_percentage(user)
            
            status_symbol = "✓" if completion == 100 else "⚡"
            self.stdout.write(
                f"  [{status_symbol}] {user.email:<32} | Title: {(user.title or 'N/A'):<22} | Dept: {(user.department or 'N/A'):<22} | Completion: {completion}%"
            )
            updated_details.append({'email': user.email, 'completion': completion})

        self.stdout.write(self.style.SUCCESS(f"\nSuccessfully processed structure data sync for {synced_count} user(s).\n"))

    # =========================================================================
    # ACTION: SINGLE USER DETAILED INFO
    # =========================================================================
    def _handle_info(self, options):
        email = options.get('email') or options.get('admin')
        user_id = options.get('user_id')

        if not email and not user_id:
            raise CommandError("Please specify --email or --user-id or --admin to inspect user profile.")

        if email:
            user = User.objects.filter(email=email, is_deleted=False).first()
            if not user:
                raise CommandError(f"User with email '{email}' not found.")
        else:
            user = User.objects.filter(id=user_id, is_deleted=False).first()
            if not user:
                raise CommandError(f"User with UUID '{user_id}' not found.")

        profile = profile_service.get_profile(user)
        completion_pct = profile_service.get_profile_completion_percentage(user)

        # Build visual progress bar
        filled_blocks = int(completion_pct / 5)
        bar = "█" * filled_blocks + "░" * (20 - filled_blocks)
        
        status_tag = self.style.SUCCESS("COMPLETE (100%)") if completion_pct == 100 else self.style.WARNING(f"INCOMPLETE ({completion_pct}%)")

        self.stdout.write("\n" + "=" * 70)
        self.stdout.write(self.style.MIGRATE_HEADING(f" USER PROFILE & STRUCTURE CARD: {user.get_full_name() or user.email} "))
        self.stdout.write("=" * 70)

        self.stdout.write(f"\n  [COMPLETION STATUS]")
        self.stdout.write(f"  Score: [{bar}] {status_tag}")

        self.stdout.write(f"\n  [ACCOUNT IDENTITY]")
        self.stdout.write(f"  - User ID       : {user.id}")
        self.stdout.write(f"  - Email         : {user.email}")
        self.stdout.write(f"  - Username      : {user.username}")
        self.stdout.write(f"  - Full Name     : {user.get_full_name() or 'N/A'}")
        self.stdout.write(f"  - Role          : {user.role}")
        self.stdout.write(f"  - Is Active     : {user.is_active}")
        self.stdout.write(f"  - Is Superadmin : {user.is_superuser}")
        self.stdout.write(f"  - Tenant ID     : {user.tenant_id or 'System-wide (None)'}")

        self.stdout.write(f"\n  [STRUCTURE APP MAPPED METADATA]")
        self.stdout.write(f"  - Job Title     : {user.title or profile.title or 'N/A'}")
        self.stdout.write(f"  - Structure Lvl : {user.department or 'N/A'}")
        self.stdout.write(f"  - Manager       : {user.manager.email if user.manager else (profile.reports_to.email if profile.reports_to else 'N/A')}")
        self.stdout.write(f"  - Employee Type : {profile.employee_type or 'N/A'}")
        self.stdout.write(f"  - Cost Center   : {profile.cost_center or 'N/A'}")
        self.stdout.write(f"  - Employee ID   : {user.employee_id or 'N/A'}")

        self.stdout.write(f"\n  [PERSONAL & CONTACT DETAILS]")
        self.stdout.write(f"  - Work Phone    : {profile.work_phone or user.phone_number or 'N/A'}")
        self.stdout.write(f"  - Mobile Phone  : {profile.mobile_phone or 'N/A'}")
        self.stdout.write(f"  - Alt Email     : {profile.alternative_email or 'N/A'}")
        self.stdout.write(f"  - Location      : {profile.get_full_address() or 'N/A'}")
        self.stdout.write(f"  - Date of Birth : {profile.date_of_birth or 'N/A'}")
        self.stdout.write(f"  - Bio           : {profile.bio or 'N/A'}")

        self.stdout.write(f"\n  [SKILLS & CERTIFICATIONS]")
        self.stdout.write(f"  - Skills Count  : {len(profile.skills or [])} ({', '.join([s.get('name') for s in (profile.skills or [])[:5]]) or 'None'})")
        self.stdout.write(f"  - Certifications: {len(profile.certifications or [])} ({', '.join([c.get('name') for c in (profile.certifications or [])[:5]]) or 'None'})")

        self.stdout.write("\n" + "=" * 70 + "\n")

    # =========================================================================
    # ACTION: LIST PROFILES
    # =========================================================================
    def _handle_list(self, options):
        tenant_id = options.get('tenant_id')
        admin_email = options.get('admin')
        role = options.get('role')
        search = options.get('search')
        incomplete_only = options.get('incomplete', False)
        limit = options.get('limit', 50)

        qs = User.objects.filter(is_deleted=False).select_related('profile', 'manager')

        if admin_email:
            admin_user = User.objects.filter(email=admin_email, is_deleted=False).first()
            if not admin_user:
                raise CommandError(f"Admin user with email '{admin_email}' not found.")
            if not admin_user.is_superuser and admin_user.tenant_id:
                qs = qs.filter(tenant_id=admin_user.tenant_id)

        if tenant_id:
            qs = qs.filter(tenant_id=tenant_id)

        if role:
            qs = qs.filter(role=role)

        if search:
            qs = qs.filter(
                Q(email__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(department__icontains=search) |
                Q(title__icontains=search)
            )

        users = list(qs[:limit])

        self.stdout.write(self.style.MIGRATE_HEADING(f"\n{'EMAIL':<32} {'ROLE':<14} {'TITLE':<20} {'DEPARTMENT':<20} {'TYPE':<12} {'COMPLETION':<10}"))
        self.stdout.write("-" * 110)

        displayed_count = 0
        for user in users:
            profile = getattr(user, 'profile', None)
            comp = profile_service.get_profile_completion_percentage(user)
            
            if incomplete_only and comp == 100:
                continue

            emp_type = profile.employee_type if profile else 'N/A'
            dept = user.department or 'N/A'
            title = user.title or (profile.title if profile else 'N/A')

            comp_str = f"{comp}%"
            if comp == 100:
                comp_styled = self.style.SUCCESS(f"{comp_str:<10}")
            else:
                comp_styled = self.style.WARNING(f"{comp_str:<10}")

            self.stdout.write(f"{user.email:<32} {user.role:<14} {title[:18]:<20} {dept[:18]:<20} {emp_type[:10]:<12} {comp_styled}")
            displayed_count += 1

        self.stdout.write("-" * 110)
        self.stdout.write(self.style.SUCCESS(f"Total listed profiles: {displayed_count}\n"))

    # =========================================================================
    # ACTION: COMPLETION AUDIT
    # =========================================================================
    def _handle_completion(self, options):
        users = self._resolve_users(options)
        
        self.stdout.write(self.style.MIGRATE_HEADING(f"\n=== Profile Completion Audit for {len(users)} User(s) ==="))

        total_score = 0
        complete_100_count = 0

        for user in users:
            comp = profile_service.get_profile_completion_percentage(user)
            total_score += comp
            if comp == 100:
                complete_100_count += 1

        avg_score = round(total_score / len(users), 1) if users else 0

        self.stdout.write(f"Total Users Audited  : {len(users)}")
        self.stdout.write(f"Profiles at 100%     : {self.style.SUCCESS(str(complete_100_count))}")
        self.stdout.write(f"Incomplete Profiles  : {self.style.WARNING(str(len(users) - complete_100_count))}")
        self.stdout.write(f"Average Completion % : {self.style.NOTICE(f'{avg_score}%')}\n")

    # =========================================================================
    # ACTION: UPDATE PROFILE
    # =========================================================================
    def _handle_update(self, options):
        email = options.get('email')
        user = User.objects.filter(email=email, is_deleted=False).first()
        if not user:
            raise CommandError(f"User with email '{email}' not found.")

        data = {}
        fields = [
            'first_name', 'last_name', 'phone', 'work_phone', 'mobile_phone',
            'alt_email', 'bio', 'address', 'city', 'country', 'timezone', 'theme'
        ]

        for field in fields:
            val = options.get(field)
            if val is not None:
                if field == 'phone':
                    data['phone_number'] = val
                elif field == 'alt_email':
                    data['alternative_email'] = val
                else:
                    data[field] = val

        if not data:
            raise CommandError("No update parameters supplied. Provide at least one field to update.")

        success, msg = profile_service.update_profile(user, data)
        if not success:
            raise CommandError(msg)

        comp = profile_service.get_profile_completion_percentage(user)
        self.stdout.write(self.style.SUCCESS(f"Successfully updated profile for '{email}'. New Completion Score: {comp}%\n"))
