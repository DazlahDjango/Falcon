# apps/reviews/management/commands/manage_promotion.py
"""
Comprehensive Management Command for Falcon PMS Promotion Pipeline.
Handles:
- Promotion Actions: list, info, create, approve, reject, hold, complete
- Metrics: stats

Usage:
    python manage.py manage_promotion list --tenant-id <tenant_id>
    python manage.py manage_promotion info --promotion-id <promotion_id>
    python manage.py manage_promotion create --employee staff@falcon.com --cycle-id <cycle_id> --role "Lead Engineer" --priority high --justification "Exceptional performance"
    python manage.py manage_promotion approve --promotion-id <promotion_id> --admin hr@falcon.com
    python manage.py manage_promotion reject --promotion-id <promotion_id> --admin hr@falcon.com --reason "Budget constraints"
    python manage.py manage_promotion hold --promotion-id <promotion_id> --notes "Pending executive committee review"
    python manage.py manage_promotion complete --promotion-id <promotion_id> --salary 120000
    python manage.py manage_promotion stats --tenant-id <tenant_id>
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
from apps.reviews.models import ReviewCycle, FinalRating, PromotionRecommendation
from apps.reviews.services.promotion.promotion_service import PromotionService


class Command(BaseCommand):
    help = 'Comprehensive management command for Promotion Recommendations and Workflow.'

    def add_arguments(self, parser):
        subparsers = parser.add_subparsers(dest='action', required=True, help='Action to perform')

        # ---------------- LIST ----------------
        list_p = subparsers.add_parser('list', help='List promotion recommendations')
        list_p.add_argument('--tenant-id', '-t', type=str, help='Tenant ID')
        list_p.add_argument('--admin', '-a', type=str, help='Admin email')
        list_p.add_argument('--cycle-id', '-c', type=str, help='Review Cycle UUID')
        list_p.add_argument('--status', '-s', type=str, choices=['pending', 'approved', 'rejected', 'on_hold', 'completed'], help='Status')
        list_p.add_argument('--priority', choices=[p[0] for p in PromotionRecommendation.Priority.choices], help='Priority')
        list_p.add_argument('--employee', '-e', type=str, help='Employee email')
        list_p.add_argument('--limit', '-l', type=int, default=50, help='Max items to show')

        # ---------------- INFO ----------------
        info_p = subparsers.add_parser('info', help='Display detailed promotion profile')
        info_p.add_argument('--promotion-id', '-p', type=str, required=True, help='Promotion UUID')

        # ---------------- CREATE ----------------
        create_p = subparsers.add_parser('create', help='Create a new promotion recommendation')
        create_p.add_argument('--employee', '-e', type=str, required=True, help='Employee email')
        create_p.add_argument('--cycle-id', '-c', type=str, required=True, help='Review Cycle UUID')
        create_p.add_argument('--role', '-r', type=str, required=True, help='Recommended target role')
        create_p.add_argument('--priority', type=str, default='medium', choices=[p[0] for p in PromotionRecommendation.Priority.choices], help='Priority')
        create_p.add_argument('--justification', '-j', type=str, required=True, help='Promotion justification')
        create_p.add_argument('--proposed-salary', type=float, help='Proposed salary')
        create_p.add_argument('--recommender', type=str, help='Recommender user email')

        # ---------------- APPROVE ----------------
        appr_p = subparsers.add_parser('approve', help='Approve promotion recommendation')
        appr_p.add_argument('--promotion-id', '-p', type=str, required=True, help='Promotion UUID')
        appr_p.add_argument('--admin', '-a', type=str, required=True, help='Approver email')
        appr_p.add_argument('--notes', type=str, default='', help='Approval notes')

        # ---------------- REJECT ----------------
        rej_p = subparsers.add_parser('reject', help='Reject promotion recommendation')
        rej_p.add_argument('--promotion-id', '-p', type=str, required=True, help='Promotion UUID')
        rej_p.add_argument('--admin', '-a', type=str, required=True, help='Rejecter email')
        rej_p.add_argument('--reason', '-r', type=str, required=True, help='Rejection reason')

        # ---------------- HOLD ----------------
        hold_p = subparsers.add_parser('hold', help='Put promotion on hold')
        hold_p.add_argument('--promotion-id', '-p', type=str, required=True, help='Promotion UUID')
        hold_p.add_argument('--notes', type=str, default='', help='Hold reason notes')

        # ---------------- COMPLETE ----------------
        comp_p = subparsers.add_parser('complete', help='Mark promotion completed/effectuated')
        comp_p.add_argument('--promotion-id', '-p', type=str, required=True, help='Promotion UUID')
        comp_p.add_argument('--date', type=str, help='Effective promotion date (YYYY-MM-DD)')
        comp_p.add_argument('--salary', type=float, help='Final accepted salary')

        # ---------------- STATS ----------------
        stats_p = subparsers.add_parser('stats', help='Show promotion pipeline statistics')
        stats_p.add_argument('--tenant-id', '-t', type=str, help='Tenant ID')
        stats_p.add_argument('--admin', '-a', type=str, help='Admin email')

    def handle(self, *args, **options):
        with connection.cursor() as cursor:
            cursor.execute('SET search_path TO "public"')

        action = options['action']
        handler_map = {
            'list': self.handle_list,
            'info': self.handle_info,
            'create': self.handle_create,
            'approve': self.handle_approve,
            'reject': self.handle_reject,
            'hold': self.handle_hold,
            'complete': self.handle_complete,
            'stats': self.handle_stats,
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

    def handle_list(self, options):
        tenant_id = self._resolve_tenant_id(options)
        cycle_id = options.get('cycle_id')
        status = options.get('status')
        priority = options.get('priority')
        emp_email = options.get('employee')
        limit = options.get('limit', 50)

        qs = PromotionRecommendation.objects.filter(deleted_at__isnull=True).select_related('employee', 'review_cycle').order_by('-recommended_date')
        if tenant_id:
            qs = qs.filter(tenant_id=tenant_id)
        if cycle_id:
            qs = qs.filter(review_cycle_id=cycle_id)
        if status:
            qs = qs.filter(status=status)
        if priority:
            qs = qs.filter(priority=priority)
        if emp_email:
            qs = qs.filter(employee__email__icontains=emp_email)

        total = qs.count()
        promos = list(qs[:limit])

        self.stdout.write(self.style.MIGRATE_HEADING(
            f"\n{'=' * 105}\n[PROMOTION NOMINATIONS] (Showing {len(promos)} of {total})\n{'=' * 105}"
        ))

        header = f"{'Employee':<28} {'Current Role':<20} {'Recommended Role':<24} {'Priority':<10} {'Status':<12}"
        self.stdout.write(self.style.NOTICE(header))
        self.stdout.write("-" * 105)

        for p in promos:
            st_style = self.style.SUCCESS if p.status in ['approved', 'completed'] else (self.style.WARNING if p.status == 'rejected' else self.style.NOTICE)
            self.stdout.write(
                f"{p.employee.email[:26]:<28} {p.current_role[:18]:<20} "
                f"{p.recommended_role[:22]:<24} {p.priority:<10} {st_style(p.status):<21}"
            )

        self.stdout.write("=" * 105 + "\n")

    def handle_info(self, options):
        promo_id = options['promotion_id']
        try:
            p = PromotionRecommendation.objects.select_related('employee', 'review_cycle', 'approved_by').get(id=promo_id)
        except PromotionRecommendation.DoesNotExist:
            raise CommandError(f"Promotion '{promo_id}' not found.")

        self.stdout.write(self.style.MIGRATE_HEADING(
            f"\n{'=' * 80}\n[PROMOTION PROFILE] {p.employee.email} -> {p.recommended_role}\n{'=' * 80}"
        ))
        self.stdout.write(f"  * ID:                      {p.id}")
        self.stdout.write(f"  * Status:                  {p.get_status_display()} ({p.status})")
        self.stdout.write(f"  * Priority:                {p.get_priority_display()} ({p.priority})")
        self.stdout.write(f"  * Review Cycle:            {p.review_cycle.name}")
        self.stdout.write(f"  * Current Role:            {p.current_role}")
        self.stdout.write(f"  * Recommended Role:        {p.recommended_role}")
        self.stdout.write(f"  * Justification:           {p.justification}")
        self.stdout.write(f"  * Recommended Date:        {p.recommended_date}")
        self.stdout.write(f"  * Target Date:             {p.target_promotion_date or 'N/A'}")
        self.stdout.write(f"  * Actual Date:             {p.actual_promotion_date or 'N/A'}")
        self.stdout.write(f"  * Proposed Salary:         {f'${p.proposed_salary:,.2f}' if p.proposed_salary else 'N/A'}")
        self.stdout.write(f"  * Approved By:             {p.approved_by.email if p.approved_by else 'Pending'}")
        self.stdout.write(f"  * Approved At:             {p.approved_at or 'Pending'}")
        if p.rejection_reason:
            self.stdout.write(f"  * Rejection Reason:        {p.rejection_reason}")
        if p.status_notes:
            self.stdout.write(f"  * Status Notes:            {p.status_notes}")
        self.stdout.write("=" * 80 + "\n")

    def handle_create(self, options):
        emp_email = options['employee']
        cycle_id = options['cycle_id']
        role = options['role']
        priority = options.get('priority', 'medium')
        justification = options['justification']
        proposed_salary = options.get('proposed_salary')
        rec_email = options.get('recommender')

        try:
            employee = User.objects.get(email__iexact=emp_email, is_deleted=False)
            cycle = ReviewCycle.objects.get(id=cycle_id)
            recommender = User.objects.filter(email__iexact=rec_email, is_deleted=False).first() if rec_email else None
        except Exception as e:
            raise CommandError(f"Error: {e}")

        emp_title = getattr(employee, 'title', None) or getattr(employee, 'position', '') or 'Staff'

        promo = PromotionRecommendation.objects.create(
            tenant_id=cycle.tenant_id,
            employee=employee,
            review_cycle=cycle,
            recommended_by=recommender,
            current_role=str(emp_title),
            recommended_role=role,
            priority=priority,
            justification=justification,
            proposed_salary=Decimal(str(proposed_salary)) if proposed_salary else None,
            status='pending'
        )

        self.stdout.write(self.style.SUCCESS(
            f"\n[SUCCESS] Promotion recommendation created!\n"
            f"  * ID:               {promo.id}\n"
            f"  * Employee:         {employee.email}\n"
            f"  * Recommended Role: {role}\n"
            f"  * Priority:         {priority}\n"
        ))

    def handle_approve(self, options):
        promo_id = options['promotion_id']
        admin_email = options['admin']
        notes = options.get('notes', '')

        try:
            admin = User.objects.get(email__iexact=admin_email, is_deleted=False)
            promo = PromotionService.approve_promotion(promo_id, approved_by=admin, notes=notes)
            self.stdout.write(self.style.SUCCESS(
                f"[SUCCESS] Promotion '{promo.id}' for '{promo.employee.email}' approved by '{admin.email}'."
            ))
        except Exception as e:
            raise CommandError(f"Failed to approve promotion: {e}")

    def handle_reject(self, options):
        promo_id = options['promotion_id']
        admin_email = options['admin']
        reason = options['reason']

        try:
            admin = User.objects.get(email__iexact=admin_email, is_deleted=False)
            promo = PromotionService.reject_promotion(promo_id, rejected_by=admin, reason=reason)
            self.stdout.write(self.style.SUCCESS(
                f"[SUCCESS] Promotion '{promo.id}' rejected by '{admin.email}'."
            ))
        except Exception as e:
            raise CommandError(f"Failed to reject promotion: {e}")

    def handle_hold(self, options):
        promo_id = options['promotion_id']
        notes = options.get('notes', '')

        try:
            promo = PromotionRecommendation.objects.get(id=promo_id)
            promo.status = 'on_hold'
            promo.status_notes = notes
            promo.save(update_fields=['status', 'status_notes'])
            self.stdout.write(self.style.SUCCESS(f"[SUCCESS] Promotion '{promo.id}' placed on hold."))
        except PromotionRecommendation.DoesNotExist:
            raise CommandError(f"Promotion '{promo_id}' not found.")

    def handle_complete(self, options):
        promo_id = options['promotion_id']
        date_str = options.get('date')
        salary = options.get('salary')

        try:
            act_date = date.fromisoformat(date_str) if date_str else timezone.now().date()
            new_salary = Decimal(str(salary)) if salary else None
            promo = PromotionService.mark_completed(promo_id, actual_date=act_date, new_salary=new_salary)
            self.stdout.write(self.style.SUCCESS(
                f"[SUCCESS] Promotion '{promo.id}' marked as completed. Effective: {promo.actual_promotion_date}"
            ))
        except Exception as e:
            raise CommandError(f"Failed to complete promotion: {e}")

    def handle_stats(self, options):
        tenant_id = self._resolve_tenant_id(options)
        if not tenant_id:
            raise CommandError("Please specify tenant via --tenant-id or --admin.")

        try:
            tenant = Organization.objects.get(id=tenant_id)
        except Organization.DoesNotExist:
            raise CommandError(f"Tenant '{tenant_id}' not found.")

        stats = PromotionService.get_promotion_statistics(tenant)

        self.stdout.write(self.style.MIGRATE_HEADING(
            f"\n{'=' * 80}\n[PROMOTION METRICS DASHBOARD] Tenant: {tenant.name}\n{'=' * 80}"
        ))
        self.stdout.write(f"  * Pending Review:   {stats.get('total_pending', 0)}")
        self.stdout.write(f"  * Total Approved:   {stats.get('total_approved', 0)}")
        self.stdout.write(f"  * Total Completed:  {stats.get('total_completed', 0)}")
        self.stdout.write(f"  * Total Rejected:   {stats.get('total_rejected', 0)}")
        self.stdout.write(f"  * Avg Timeline:     {stats.get('average_timeline_days', 'N/A')} days")
        self.stdout.write("=" * 80 + "\n")
