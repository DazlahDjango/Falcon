# apps/reviews/management/commands/manage_aggregation.py
"""
Comprehensive Management Command for Falcon PMS Rating Aggregations & Formulas.
Handles:
- Ratings Management: list, info, recalculate, approve, lock, unlock
- Multipliers: apply-coefficient
- Analysis: distribution

Usage:
    python manage.py manage_aggregation list --cycle-id <cycle_id>
    python manage.py manage_aggregation info --rating-id <rating_id>
    python manage.py manage_aggregation recalculate --cycle-id <cycle_id> [--employee staff@falcon.com]
    python manage.py manage_aggregation approve --rating-id <rating_id> --admin hr@falcon.com
    python manage.py manage_aggregation lock --rating-id <rating_id>
    python manage.py manage_aggregation unlock --rating-id <rating_id> --reason "Administrative recalculation"
    python manage.py manage_aggregation apply-coefficient --rating-id <rating_id> --coefficient 1.05
    python manage.py manage_aggregation distribution --cycle-id <cycle_id>
"""

import sys
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
from django.db.models import Q, Avg, Min, Max, Count

from apps.accounts.models import User
from apps.reviews.models import ReviewCycle, FinalRating, SupervisorReview
from apps.reviews.services.assessment.final_rating_service import FinalRatingService


class Command(BaseCommand):
    help = 'Comprehensive management command for Final Rating Aggregations, Approvals, Locks, and Distributions.'

    def add_arguments(self, parser):
        subparsers = parser.add_subparsers(dest='action', required=True, help='Action to perform')

        # ---------------- LIST ----------------
        list_p = subparsers.add_parser('list', help='List final ratings with filters')
        list_p.add_argument('--cycle-id', '-c', type=str, help='Review Cycle UUID')
        list_p.add_argument('--tenant-id', '-t', type=str, help='Tenant ID')
        list_p.add_argument('--admin', '-a', type=str, help='Admin email')
        list_p.add_argument('--status', '-s', type=str, choices=['pending', 'calibrated', 'approved', 'locked', 'appealed', 'revised'], help='Status')
        list_p.add_argument('--employee', '-e', type=str, help='Employee email filter')
        list_p.add_argument('--min-score', type=float, help='Minimum final score')
        list_p.add_argument('--max-score', type=float, help='Maximum final score')
        list_p.add_argument('--limit', '-l', type=int, default=50, help='Max items to show')

        # ---------------- INFO ----------------
        info_p = subparsers.add_parser('info', help='Display detailed final rating breakdown')
        info_p.add_argument('--rating-id', '-r', type=str, required=True, help='Final Rating UUID')

        # ---------------- RECALCULATE ----------------
        recalc_p = subparsers.add_parser('recalculate', help='Recalculate 70/30 aggregation for an employee or all in cycle')
        recalc_p.add_argument('--cycle-id', '-c', type=str, required=True, help='Review Cycle UUID')
        recalc_p.add_argument('--employee', '-e', type=str, help='Optional specific employee email')

        # ---------------- APPROVE ----------------
        appr_p = subparsers.add_parser('approve', help='Approve final rating')
        appr_p.add_argument('--rating-id', '-r', type=str, required=True, help='Final Rating UUID')
        appr_p.add_argument('--admin', '-a', type=str, required=True, help='Approver admin email')

        # ---------------- LOCK / UNLOCK ----------------
        lock_p = subparsers.add_parser('lock', help='Lock final rating to prevent modifications')
        lock_p.add_argument('--rating-id', '-r', type=str, required=True, help='Final Rating UUID')

        unlock_p = subparsers.add_parser('unlock', help='Unlock final rating for administrative edits')
        unlock_p.add_argument('--rating-id', '-r', type=str, required=True, help='Final Rating UUID')
        unlock_p.add_argument('--reason', type=str, default='Administrative unlock', help='Unlock reason')

        # ---------------- APPLY COEFFICIENT ----------------
        coeff_p = subparsers.add_parser('apply-coefficient', help='Apply custom difficulty coefficient multiplier')
        coeff_p.add_argument('--rating-id', '-r', type=str, required=True, help='Final Rating UUID')
        coeff_p.add_argument('--coefficient', type=float, required=True, help='Coefficient multiplier (e.g. 1.05)')

        # ---------------- DISTRIBUTION ----------------
        dist_p = subparsers.add_parser('distribution', help='Show performance rating distribution & bell curve for cycle')
        dist_p.add_argument('--cycle-id', '-c', type=str, required=True, help='Review Cycle UUID')

    def handle(self, *args, **options):
        with connection.cursor() as cursor:
            cursor.execute('SET search_path TO "public"')

        action = options['action']
        handler_map = {
            'list': self.handle_list,
            'info': self.handle_info,
            'recalculate': self.handle_recalculate,
            'approve': self.handle_approve,
            'lock': self.handle_lock,
            'unlock': self.handle_unlock,
            'apply-coefficient': self.handle_apply_coefficient,
            'distribution': self.handle_distribution,
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
        cycle_id = options.get('cycle_id')
        tenant_id = self._resolve_tenant_id(options)
        status = options.get('status')
        emp_email = options.get('employee')
        min_score = options.get('min_score')
        max_score = options.get('max_score')
        limit = options.get('limit', 50)

        qs = FinalRating.objects.filter(deleted_at__isnull=True).select_related('employee', 'review_cycle').order_by('-final_score')
        if cycle_id:
            qs = qs.filter(review_cycle_id=cycle_id)
        if tenant_id:
            qs = qs.filter(tenant_id=tenant_id)
        if status:
            qs = qs.filter(status=status)
        if emp_email:
            qs = qs.filter(employee__email__icontains=emp_email)
        if min_score is not None:
            qs = qs.filter(final_score__gte=min_score)
        if max_score is not None:
            qs = qs.filter(final_score__lte=max_score)

        total = qs.count()
        ratings = list(qs[:limit])

        self.stdout.write(self.style.MIGRATE_HEADING(
            f"\n{'=' * 105}\n[FINAL RATINGS] (Showing {len(ratings)} of {total})\n{'=' * 105}"
        ))

        header = f"{'Employee':<28} {'Cycle':<18} {'KPI':<7} {'Comp':<7} {'Final':<8} {'Label':<20} {'Status':<10}"
        self.stdout.write(self.style.NOTICE(header))
        self.stdout.write("-" * 105)

        for r in ratings:
            kpi_str = f"{r.kpi_score:.1f}" if r.kpi_score is not None else "-"
            cmp_str = f"{r.competency_score:.1f}" if r.competency_score is not None else "-"
            fnl_str = f"{r.final_score:.1f}" if r.final_score is not None else "-"
            lbl_str = r.final_rating_label or "Unrated"

            st_style = self.style.SUCCESS if r.status in ['approved', 'locked'] else self.style.WARNING
            self.stdout.write(
                f"{r.employee.email[:26]:<28} {r.review_cycle.name[:16]:<18} "
                f"{kpi_str:<7} {cmp_str:<7} {fnl_str:<8} {lbl_str[:18]:<20} {st_style(r.status):<19}"
            )

        self.stdout.write("=" * 105 + "\n")

    def handle_info(self, options):
        rating_id = options['rating_id']
        try:
            r = FinalRating.objects.select_related('employee', 'review_cycle', 'rating_scale', 'approved_by').get(id=rating_id)
        except FinalRating.DoesNotExist:
            raise CommandError(f"FinalRating '{rating_id}' not found.")

        self.stdout.write(self.style.MIGRATE_HEADING(
            f"\n{'=' * 80}\n[FINAL RATING DETAILS] {r.employee.email} ({r.review_cycle.name})\n{'=' * 80}"
        ))
        self.stdout.write(f"  * ID:                      {r.id}")
        self.stdout.write(f"  * Status:                  {r.get_status_display()} ({r.status})")
        self.stdout.write(f"  * Rating Scale:            {r.rating_scale.name if r.rating_scale else 'Default'}")
        self.stdout.write(f"  * Rating Label:            {r.final_rating_label or 'Unrated'}")
        self.stdout.write(f"\n  --- Score Breakdown ---")
        self.stdout.write(f"  * KPI Component (70%):     {r.kpi_score if r.kpi_score is not None else 'N/A'}")
        self.stdout.write(f"  * Competency Score (30%):  {r.competency_score if r.competency_score is not None else 'N/A'}")
        self.stdout.write(f"  * Raw Total Score:         {r.raw_total_score if r.raw_total_score is not None else 'N/A'}")
        self.stdout.write(f"  * Difficulty Coefficient:  {r.coefficient_applied}x")
        self.stdout.write(f"  * Adjusted Score:          {r.adjusted_score if r.adjusted_score is not None else 'N/A'}")
        self.stdout.write(f"  * Calibration Adjustment:  {r.calibration_adjustment or 0:+.2f} ({r.calibration_adjustment_reason or 'None'})")
        self.stdout.write(f"  * Final Weighted Score:    {r.final_score if r.final_score is not None else 'N/A'}")
        self.stdout.write(f"\n  --- Actions & Outcomes ---")
        self.stdout.write(f"  * Promotion Recommended:   {r.promotion_recommended} (Target: {r.promotion_target_role or 'N/A'})")
        self.stdout.write(f"  * PIP Recommended:         {r.pip_recommended} (Reason: {r.pip_reason or 'N/A'})")
        self.stdout.write(f"  * Approved By:             {r.approved_by.email if r.approved_by else 'Pending'}")
        self.stdout.write(f"  * Approved At:             {r.approved_at or 'Pending'}")
        self.stdout.write("=" * 80 + "\n")

    def handle_recalculate(self, options):
        cycle_id = options['cycle_id']
        emp_email = options.get('employee')

        try:
            cycle = ReviewCycle.objects.get(id=cycle_id)
        except ReviewCycle.DoesNotExist:
            raise CommandError(f"ReviewCycle '{cycle_id}' not found.")

        reviews_qs = SupervisorReview.objects.filter(review_cycle=cycle)
        if emp_email:
            reviews_qs = reviews_qs.filter(employee__email__iexact=emp_email)

        count = 0
        with transaction.atomic():
            for rev in reviews_qs:
                try:
                    FinalRatingService.create_or_update_from_review(str(rev.id))
                    count += 1
                except Exception as e:
                    self.stdout.write(self.style.WARNING(f"  * Skip review {rev.id}: {e}"))

        self.stdout.write(self.style.SUCCESS(f"[SUCCESS] Recalculated ratings for {count} evaluation(s) in cycle '{cycle.name}'."))

    def handle_approve(self, options):
        rating_id = options['rating_id']
        admin_email = options['admin']

        try:
            admin_user = User.objects.get(email__iexact=admin_email, is_deleted=False)
        except User.DoesNotExist:
            raise CommandError(f"Admin user '{admin_email}' not found.")

        try:
            r = FinalRatingService.approve_final_rating(rating_id, approved_by=admin_user)
            self.stdout.write(self.style.SUCCESS(f"[SUCCESS] Final rating '{r.id}' for '{r.employee.email}' approved."))
        except Exception as e:
            raise CommandError(f"Approval failed: {e}")

    def handle_lock(self, options):
        rating_id = options['rating_id']
        try:
            r = FinalRatingService.lock_final_rating(rating_id)
            self.stdout.write(self.style.SUCCESS(f"[SUCCESS] Final rating '{r.id}' for '{r.employee.email}' locked."))
        except Exception as e:
            raise CommandError(f"Lock failed: {e}")

    def handle_unlock(self, options):
        rating_id = options['rating_id']
        reason = options.get('reason', 'Administrative unlock')

        try:
            r = FinalRating.objects.get(id=rating_id)
            r.status = 'approved'
            r.notes = f"{r.notes}\nUnlocked on {timezone.now()}: {reason}".strip()
            r.save(update_fields=['status', 'notes'])
            self.stdout.write(self.style.SUCCESS(f"[SUCCESS] Final rating '{r.id}' unlocked (restored to approved status)."))
        except FinalRating.DoesNotExist:
            raise CommandError(f"FinalRating '{rating_id}' not found.")

    def handle_apply_coefficient(self, options):
        rating_id = options['rating_id']
        coeff_val = Decimal(str(options['coefficient']))

        try:
            r = FinalRating.objects.get(id=rating_id)
            r.coefficient_applied = coeff_val
            if r.raw_total_score is not None:
                r.adjusted_score = round(r.raw_total_score * coeff_val, 2)
                r.final_score = r.adjusted_score
                if r.rating_scale:
                    level = r.rating_scale.get_level_by_percentage(float(r.final_score))
                    if level:
                        r.final_rating_label = level.get('label', '')
                        r.final_rating_color = level.get('color', 'gray')
            r.save()
            self.stdout.write(self.style.SUCCESS(
                f"[SUCCESS] Applied coefficient {coeff_val}x to rating '{r.id}'. Adjusted Final Score: {r.final_score} ({r.final_rating_label})"
            ))
        except FinalRating.DoesNotExist:
            raise CommandError(f"FinalRating '{rating_id}' not found.")

    def handle_distribution(self, options):
        cycle_id = options['cycle_id']
        try:
            cycle = ReviewCycle.objects.get(id=cycle_id)
        except ReviewCycle.DoesNotExist:
            raise CommandError(f"ReviewCycle '{cycle_id}' not found.")

        stats = FinalRatingService.get_cycle_statistics(cycle)

        self.stdout.write(self.style.MIGRATE_HEADING(
            f"\n{'=' * 80}\n[PERFORMANCE DISTRIBUTION & BELL CURVE] {cycle.name}\n{'=' * 80}"
        ))
        self.stdout.write(f"Total Evaluated: {stats.get('total', 0)}")
        self.stdout.write(f"Average Score:   {stats.get('average_score', 'N/A')}")
        self.stdout.write(f"Score Range:     Min: {stats.get('min_score', 'N/A')} | Max: {stats.get('max_score', 'N/A')}")
        self.stdout.write(f"Promotions Nominated: {stats.get('promotion_count', 0)}")
        self.stdout.write(f"PIPs Recommended:     {stats.get('pip_count', 0)}\n")

        self.stdout.write(self.style.NOTICE(f"{'Performance Tier':<28} {'Count':<8} {'Percentage':<12} {'Visual Distribution'}"))
        self.stdout.write("-" * 80)

        dist = stats.get('distribution', {})
        total = stats.get('total', 0)
        for label, count in dist.items():
            pct = (count / total * 100) if total > 0 else 0
            bar = "█" * int(pct // 4)
            self.stdout.write(f"{label[:26]:<28} {count:<8} {pct:5.1f}%      {bar}")

        self.stdout.write("=" * 80 + "\n")
