# apps/reviews/management/commands/manage_template.py
"""
Comprehensive Management Command for Falcon PMS Review Templates & Difficulty Coefficients.
Handles:
- Templates: list-templates, info-template, create-template, duplicate-template, set-default-template
- Coefficients: list-coefficients, info-coefficient, create-coefficient, toggle-coefficient

Usage:
    python manage.py manage_template list-templates --tenant-id <tenant_id>
    python manage.py manage_template info-template --template-id <template_id>
    python manage.py manage_template create-template --name "Engineering Review" --tenant-id <tenant_id> --sections strengths weaknesses goals
    python manage.py manage_template duplicate-template --template-id <template_id> --new-name "Engineering Review 2027"
    python manage.py manage_template set-default-template --template-id <template_id>
    python manage.py manage_template list-coefficients --tenant-id <tenant_id>
    python manage.py manage_template info-coefficient --coefficient-id <coefficient_id>
    python manage.py manage_template create-coefficient --tenant-id <tenant_id> --type user --user staff@falcon.com --value 1.05 --reason "Challenging deployment duties"
"""

import sys
from datetime import datetime, date
from decimal import Decimal
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
from apps.tenant.models import Organization
from apps.structure.models import Department, Position, Division
from apps.reviews.models import ReviewTemplate, Coefficient


class Command(BaseCommand):
    help = 'Comprehensive management command for Review Templates and Difficulty Coefficients.'

    def add_arguments(self, parser):
        subparsers = parser.add_subparsers(dest='action', required=True, help='Action to perform')

        # ---------------- LIST TEMPLATES ----------------
        list_tmpl_p = subparsers.add_parser('list-templates', help='List review templates')
        list_tmpl_p.add_argument('--tenant-id', '-t', type=str, help='Tenant ID')
        list_tmpl_p.add_argument('--admin', '-a', type=str, help='Admin email')
        list_tmpl_p.add_argument('--limit', '-l', type=int, default=50, help='Max items to show')

        # ---------------- INFO TEMPLATE ----------------
        info_tmpl_p = subparsers.add_parser('info-template', help='Display review template details')
        info_tmpl_p.add_argument('--template-id', '-i', type=str, required=True, help='Template UUID')

        # ---------------- CREATE TEMPLATE ----------------
        create_tmpl_p = subparsers.add_parser('create-template', help='Create a review template')
        create_tmpl_p.add_argument('--name', '-n', type=str, required=True, help='Template name')
        create_tmpl_p.add_argument('--tenant-id', '-t', type=str, help='Tenant ID')
        create_tmpl_p.add_argument('--admin', '-a', type=str, help='Admin email')
        create_tmpl_p.add_argument('--description', '-d', type=str, default='', help='Template description')
        create_tmpl_p.add_argument('--sections', nargs='*', default=['strengths', 'weaknesses', 'goals'], help='Included section types')

        # ---------------- DUPLICATE TEMPLATE ----------------
        dup_tmpl_p = subparsers.add_parser('duplicate-template', help='Clone an existing review template')
        dup_tmpl_p.add_argument('--template-id', '-i', type=str, required=True, help='Source template UUID')
        dup_tmpl_p.add_argument('--new-name', '-n', type=str, required=True, help='New cloned template name')

        # ---------------- SET DEFAULT TEMPLATE ----------------
        def_tmpl_p = subparsers.add_parser('set-default-template', help='Set template as default')
        def_tmpl_p.add_argument('--template-id', '-i', type=str, required=True, help='Template UUID')

        # ---------------- LIST COEFFICIENTS ----------------
        list_coef_p = subparsers.add_parser('list-coefficients', help='List difficulty coefficients')
        list_coef_p.add_argument('--tenant-id', '-t', type=str, help='Tenant ID')
        list_coef_p.add_argument('--admin', '-a', type=str, help='Admin email')
        list_coef_p.add_argument('--type', choices=[c[0] for c in Coefficient.CoefficientType.choices], help='Target type')
        list_coef_p.add_argument('--limit', '-l', type=int, default=50, help='Max items to show')

        # ---------------- INFO COEFFICIENT ----------------
        info_coef_p = subparsers.add_parser('info-coefficient', help='Display coefficient details')
        info_coef_p.add_argument('--coefficient-id', '-i', type=str, required=True, help='Coefficient UUID')

        # ---------------- CREATE COEFFICIENT ----------------
        create_coef_p = subparsers.add_parser('create-coefficient', help='Create difficulty coefficient multiplier')
        create_coef_p.add_argument('--tenant-id', '-t', type=str, help='Tenant ID')
        create_coef_p.add_argument('--admin', '-a', type=str, help='Admin email')
        create_coef_p.add_argument('--type', type=str, required=True, choices=[c[0] for c in Coefficient.CoefficientType.choices], help='Target level')
        create_coef_p.add_argument('--user', '-u', type=str, help='Target user email (if type=individual)')
        create_coef_p.add_argument('--department', help='Target department ID or name')
        create_coef_p.add_argument('--position', help='Target position ID or title')
        create_coef_p.add_argument('--value', '-v', type=float, required=True, help='Coefficient multiplier (e.g. 1.05)')
        create_coef_p.add_argument('--reason', '-r', type=str, required=True, help='Justification reason')
        create_coef_p.add_argument('--valid-from', type=str, help='Valid from date (YYYY-MM-DD, defaults to today)')

    def handle(self, *args, **options):
        with connection.cursor() as cursor:
            cursor.execute('SET search_path TO "public"')

        action = options['action']
        handler_map = {
            'list-templates': self.handle_list_templates,
            'info-template': self.handle_info_template,
            'create-template': self.handle_create_template,
            'duplicate-template': self.handle_duplicate_template,
            'set-default-template': self.handle_set_default_template,
            'list-coefficients': self.handle_list_coefficients,
            'info-coefficient': self.handle_info_coefficient,
            'create-coefficient': self.handle_create_coefficient,
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
                    raise CommandError(f"Admin '{admin_email}' has no tenant_id. Please specify --tenant-id.")
            except User.DoesNotExist:
                raise CommandError(f"Admin user with email '{admin_email}' not found.")
        return tenant_id

    # =========================================================================
    # HANDLERS
    # =========================================================================

    def handle_list_templates(self, options):
        tenant_id = self._resolve_tenant_id(options)
        limit = options.get('limit', 50)

        qs = ReviewTemplate.objects.filter(deleted_at__isnull=True).order_by('-created_at')
        if tenant_id:
            qs = qs.filter(tenant_id=tenant_id)

        total = qs.count()
        templates = list(qs[:limit])

        self.stdout.write(self.style.MIGRATE_HEADING(
            f"\n{'=' * 95}\n[REVIEW TEMPLATES] (Showing {len(templates)} of {total})\n{'=' * 95}"
        ))

        header = f"{'Template Name':<32} {'Tenant':<24} {'Sections Count':<16} {'ID':<15}"
        self.stdout.write(self.style.NOTICE(header))
        self.stdout.write("-" * 95)

        for t in templates:
            sec_count = len(t.included_sections) if t.included_sections else 0
            tenant_name = t.tenant.name if t.tenant else "System"
            self.stdout.write(
                f"{t.name[:30]:<32} {tenant_name[:22]:<24} {sec_count:<16} {str(t.id)[:13]}.."
            )

        self.stdout.write("=" * 95 + "\n")

    def handle_info_template(self, options):
        tmpl_id = options['template_id']
        try:
            t = ReviewTemplate.objects.select_related('tenant').get(id=tmpl_id)
        except ReviewTemplate.DoesNotExist:
            raise CommandError(f"Template '{tmpl_id}' not found.")

        self.stdout.write(self.style.MIGRATE_HEADING(
            f"\n{'=' * 75}\n[REVIEW TEMPLATE] {t.name}\n{'=' * 75}"
        ))
        self.stdout.write(f"  * ID:                 {t.id}")
        self.stdout.write(f"  * Tenant:             {t.tenant.name if t.tenant else 'Global'}")
        self.stdout.write(f"  * Description:        {t.description or 'None'}")
        self.stdout.write(f"  * Included Sections:  {', '.join(t.included_sections) if t.included_sections else 'None'}")
        self.stdout.write(f"  * Required Sections:  {', '.join(t.required_sections) if t.required_sections else 'None'}")
        self.stdout.write(f"  * Custom Sections:    {len(t.custom_sections) if t.custom_sections else 0} custom defined")
        self.stdout.write("=" * 75 + "\n")

    def handle_create_template(self, options):
        tenant_id = self._resolve_tenant_id(options)
        if not tenant_id:
            raise CommandError("Please specify tenant via --tenant-id or --admin.")

        try:
            tenant = Organization.objects.get(id=tenant_id)
        except Organization.DoesNotExist:
            raise CommandError(f"Tenant '{tenant_id}' not found.")

        name = options['name']
        sections = options.get('sections', [])
        desc = options.get('description', '')

        t = ReviewTemplate.objects.create(
            tenant=tenant,
            tenant_id=tenant.id,
            name=name,
            description=desc,
            included_sections=sections,
            status='approved'
        )

        self.stdout.write(self.style.SUCCESS(
            f"\n[SUCCESS] Review template '{t.name}' (ID: {t.id}) created for tenant '{tenant.name}'."
        ))

    def handle_duplicate_template(self, options):
        tmpl_id = options['template_id']
        new_name = options['new_name']

        try:
            source = ReviewTemplate.objects.get(id=tmpl_id)
        except ReviewTemplate.DoesNotExist:
            raise CommandError(f"Template '{tmpl_id}' not found.")

        cloned = ReviewTemplate.objects.create(
            tenant=source.tenant,
            tenant_id=source.tenant_id,
            name=new_name,
            description=f"Cloned from {source.name}",
            included_sections=source.included_sections,
            required_sections=source.required_sections,
            custom_sections=source.custom_sections,
            status='draft'
        )

        self.stdout.write(self.style.SUCCESS(
            f"[SUCCESS] Cloned template '{source.name}' into new template '{cloned.name}' (ID: {cloned.id})."
        ))

    def handle_set_default_template(self, options):
        tmpl_id = options['template_id']
        try:
            t = ReviewTemplate.objects.get(id=tmpl_id)
            t.status = 'approved'
            t.save(update_fields=['status'])
            self.stdout.write(self.style.SUCCESS(f"[SUCCESS] Template '{t.name}' is now active/default."))
        except ReviewTemplate.DoesNotExist:
            raise CommandError(f"Template '{tmpl_id}' not found.")

    def handle_list_coefficients(self, options):
        tenant_id = self._resolve_tenant_id(options)
        c_type = options.get('type')
        limit = options.get('limit', 50)

        qs = Coefficient.objects.filter(deleted_at__isnull=True).select_related('division', 'department', 'position', 'user').order_by('-created_at')
        if tenant_id:
            qs = qs.filter(tenant_id=tenant_id)
        if c_type:
            qs = qs.filter(coefficient_type=c_type)

        total = qs.count()
        coefficients = list(qs[:limit])

        self.stdout.write(self.style.MIGRATE_HEADING(
            f"\n{'=' * 95}\n[DIFFICULTY COEFFICIENTS] (Showing {len(coefficients)} of {total})\n{'=' * 95}"
        ))

        header = f"{'Target':<32} {'Type':<16} {'Multiplier':<12} {'Active':<8} {'ID':<15}"
        self.stdout.write(self.style.NOTICE(header))
        self.stdout.write("-" * 95)

        for c in coefficients:
            target_str = str(c)[:30]
            val_str = f"{c.value}x"
            act_str = "Yes" if c.is_active else "No"
            self.stdout.write(f"{target_str:<32} {c.coefficient_type:<16} {val_str:<12} {act_str:<8} {str(c.id)[:13]}..")

        self.stdout.write("=" * 95 + "\n")

    def handle_info_coefficient(self, options):
        coef_id = options['coefficient_id']
        try:
            c = Coefficient.objects.get(id=coef_id)
        except Coefficient.DoesNotExist:
            raise CommandError(f"Coefficient '{coef_id}' not found.")

        self.stdout.write(self.style.MIGRATE_HEADING(
            f"\n{'=' * 75}\n[COEFFICIENT] {str(c)}\n{'=' * 75}"
        ))
        self.stdout.write(f"  * ID:              {c.id}")
        self.stdout.write(f"  * Type:            {c.get_coefficient_type_display()} ({c.coefficient_type})")
        self.stdout.write(f"  * Multiplier Value:{c.value}x")
        self.stdout.write(f"  * Reason:          {c.reason}")
        self.stdout.write(f"  * Valid From:      {c.valid_from}")
        self.stdout.write(f"  * Valid To:        {c.valid_to or 'Indefinite'}")
        self.stdout.write(f"  * Is Active:       {c.is_active}")
        self.stdout.write("=" * 75 + "\n")

    def handle_create_coefficient(self, options):
        tenant_id = self._resolve_tenant_id(options)
        if not tenant_id:
            raise CommandError("Please specify tenant via --tenant-id or --admin.")

        try:
            tenant = Organization.objects.get(id=tenant_id)
        except Organization.DoesNotExist:
            raise CommandError(f"Tenant '{tenant_id}' not found.")

        c_type = options['type']
        value = Decimal(str(options['value']))
        reason = options['reason']
        valid_from_str = options.get('valid_from')
        valid_from = date.fromisoformat(valid_from_str) if valid_from_str else timezone.now().date()

        user_target = None
        dept_target = None
        pos_target = None

        if c_type == 'individual':
            user_email = options.get('user')
            if not user_email:
                raise CommandError("Please provide --user email for individual coefficient.")
            user_target = User.objects.get(email__iexact=user_email, is_deleted=False)
        elif c_type == 'department':
            dept_arg = options.get('department')
            if not dept_arg:
                raise CommandError("Please provide --department ID or name.")
            dept_target = Department.objects.filter(Q(id=dept_arg) | Q(name__iexact=dept_arg)).first()
            if not dept_target:
                raise CommandError(f"Department '{dept_arg}' not found.")
        elif c_type == 'position':
            pos_arg = options.get('position')
            if not pos_arg:
                raise CommandError("Please provide --position ID or title.")
            pos_target = Position.objects.filter(Q(id=pos_arg) | Q(title__iexact=pos_arg)).first()
            if not pos_target:
                raise CommandError(f"Position '{pos_arg}' not found.")

        c = Coefficient.objects.create(
            tenant=tenant,
            tenant_id=tenant.id,
            coefficient_type=c_type,
            user=user_target,
            department=dept_target,
            position=pos_target,
            value=value,
            reason=reason,
            valid_from=valid_from,
            is_active=True
        )

        self.stdout.write(self.style.SUCCESS(
            f"[SUCCESS] Created Coefficient {c.value}x (ID: {c.id}) for target: {str(c)}."
        ))
