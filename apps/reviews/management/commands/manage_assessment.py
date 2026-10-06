# apps/reviews/management/commands/manage_assessment.py
"""
Comprehensive Management Command for Falcon PMS Assessments (Self, Supervisor & 360 Feedback).
Handles:
- Self-Assessments: list-self, info-self, submit-self, reset-self
- Supervisor Reviews: list-supervisor, info-supervisor, create-supervisor, submit-supervisor, approve-supervisor, reset-supervisor
- Gap Analysis: compare
- 360 Feedback: request-360, list-360, generate-summary

Usage:
    python manage.py manage_assessment list-self --cycle-id <cycle_id>
    python manage.py manage_assessment info-self --assessment-id <id>
    python manage.py manage_assessment submit-self --assessment-id <id>
    python manage.py manage_assessment list-supervisor --cycle-id <cycle_id>
    python manage.py manage_assessment info-supervisor --review-id <id>
    python manage.py manage_assessment create-supervisor --cycle-id <cycle_id> --employee staff@falcon.com --supervisor sup@falcon.com
    python manage.py manage_assessment submit-supervisor --review-id <id>
    python manage.py manage_assessment approve-supervisor --review-id <id>
    python manage.py manage_assessment compare --cycle-id <cycle_id> --employee staff@falcon.com
    python manage.py manage_assessment request-360 --cycle-id <cycle_id> --subject staff@falcon.com --reviewer peer@falcon.com --type peer
    python manage.py manage_assessment list-360 --cycle-id <cycle_id> [--subject staff@falcon.com]
    python manage.py manage_assessment generate-summary --cycle-id <cycle_id> --subject staff@falcon.com
"""

import sys
from datetime import datetime
from typing import Optional, List, Dict

if sys.stdout.encoding != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

from django.core.management.base import BaseCommand, CommandError
from django.db import connection, transaction
from django.utils import timezone
from django.db.models import Q, Avg

from apps.accounts.models import User
from apps.reviews.models import (
    ReviewCycle,
    SelfAssessment,
    SupervisorReview,
    FeedbackRequest,
    FeedbackResponse,
    FeedbackSummary,
    CompetencyRating
)
from apps.reviews.services.assessment.self_assessment_service import SelfAssessmentService
from apps.reviews.services.assessment.supervisor_review_service import SupervisorReviewService
from apps.reviews.services.feedback.summary_service import SummaryService
from apps.reviews.services.feedback.feedback_service import FeedbackService


class Command(BaseCommand):
    help = 'Comprehensive management command for Self-Assessments, Supervisor Reviews, and 360 Feedback.'

    def add_arguments(self, parser):
        subparsers = parser.add_subparsers(dest='action', required=True, help='Action to perform')

        # ---------------- LIST SELF ----------------
        list_self_p = subparsers.add_parser('list-self', help='List self-assessments for a cycle or tenant')
        list_self_p.add_argument('--cycle-id', '-c', type=str, help='Review Cycle UUID')
        list_self_p.add_argument('--tenant-id', '-t', type=str, help='Tenant ID')
        list_self_p.add_argument('--admin', '-a', type=str, help='Admin email to inherit tenant')
        list_self_p.add_argument('--status', '-s', type=str, choices=['draft', 'submitted'], help='Status filter')
        list_self_p.add_argument('--search', '-q', type=str, help='Search employee email')
        list_self_p.add_argument('--limit', '-l', type=int, default=50, help='Max items to show')

        # ---------------- INFO SELF ----------------
        info_self_p = subparsers.add_parser('info-self', help='Display detailed self-assessment')
        info_self_p.add_argument('--assessment-id', '-i', type=str, required=True, help='Self-Assessment UUID')

        # ---------------- SUBMIT SELF ----------------
        submit_self_p = subparsers.add_parser('submit-self', help='Submit a self-assessment')
        submit_self_p.add_argument('--assessment-id', '-i', type=str, required=True, help='Self-Assessment UUID')

        # ---------------- RESET SELF ----------------
        reset_self_p = subparsers.add_parser('reset-self', help='Reset a self-assessment back to draft')
        reset_self_p.add_argument('--assessment-id', '-i', type=str, required=True, help='Self-Assessment UUID')

        # ---------------- LIST SUPERVISOR ----------------
        list_sup_p = subparsers.add_parser('list-supervisor', help='List supervisor reviews')
        list_sup_p.add_argument('--cycle-id', '-c', type=str, help='Review Cycle UUID')
        list_sup_p.add_argument('--tenant-id', '-t', type=str, help='Tenant ID')
        list_sup_p.add_argument('--admin', '-a', type=str, help='Admin email')
        list_sup_p.add_argument('--status', '-s', type=str, choices=['draft', 'submitted', 'approved', 'rejected'], help='Status filter')
        list_sup_p.add_argument('--supervisor', type=str, help='Supervisor email')
        list_sup_p.add_argument('--limit', '-l', type=int, default=50, help='Max items to show')

        # ---------------- INFO SUPERVISOR ----------------
        info_sup_p = subparsers.add_parser('info-supervisor', help='Display detailed supervisor review')
        info_sup_p.add_argument('--review-id', '-r', type=str, required=True, help='Supervisor Review UUID')

        # ---------------- CREATE SUPERVISOR ----------------
        create_sup_p = subparsers.add_parser('create-supervisor', help='Create a supervisor review record')
        create_sup_p.add_argument('--cycle-id', '-c', type=str, required=True, help='Review Cycle UUID')
        create_sup_p.add_argument('--employee', '-e', type=str, required=True, help='Employee email')
        create_sup_p.add_argument('--supervisor', '-s', type=str, required=True, help='Supervisor email')

        # ---------------- SUBMIT SUPERVISOR ----------------
        submit_sup_p = subparsers.add_parser('submit-supervisor', help='Submit a supervisor review')
        submit_sup_p.add_argument('--review-id', '-r', type=str, required=True, help='Supervisor Review UUID')

        # ---------------- APPROVE SUPERVISOR ----------------
        approve_sup_p = subparsers.add_parser('approve-supervisor', help='Approve a supervisor review')
        approve_sup_p.add_argument('--review-id', '-r', type=str, required=True, help='Supervisor Review UUID')
        approve_sup_p.add_argument('--approver', type=str, help='Approver email')

        # ---------------- RESET SUPERVISOR ----------------
        reset_sup_p = subparsers.add_parser('reset-supervisor', help='Reset supervisor review back to draft')
        reset_sup_p.add_argument('--review-id', '-r', type=str, required=True, help='Supervisor Review UUID')

        # ---------------- COMPARE ----------------
        comp_p = subparsers.add_parser('compare', help='Compare self-assessment vs supervisor evaluation')
        comp_p.add_argument('--cycle-id', '-c', type=str, required=True, help='Review Cycle UUID')
        comp_p.add_argument('--employee', '-e', type=str, required=True, help='Employee email')

        # ---------------- REQUEST 360 ----------------
        req_360_p = subparsers.add_parser('request-360', help='Send a 360-degree feedback request')
        req_360_p.add_argument('--cycle-id', '-c', type=str, required=True, help='Review Cycle UUID')
        req_360_p.add_argument('--subject', type=str, required=True, help='Subject employee email')
        req_360_p.add_argument('--reviewer', type=str, required=True, help='Reviewer email')
        req_360_p.add_argument('--type', type=str, default='peer', choices=[t[0] for t in FeedbackRequest.ReviewerType.choices], help='Reviewer type')
        req_360_p.add_argument('--requester', type=str, help='Requester email')

        # ---------------- LIST 360 ----------------
        list_360_p = subparsers.add_parser('list-360', help='List 360 feedback requests')
        list_360_p.add_argument('--cycle-id', '-c', type=str, required=True, help='Review Cycle UUID')
        list_360_p.add_argument('--subject', type=str, help='Filter by subject employee email')
        list_360_p.add_argument('--limit', '-l', type=int, default=50, help='Max items to show')

        # ---------------- GENERATE SUMMARY ----------------
        gen_sum_p = subparsers.add_parser('generate-summary', help='Generate 360 feedback summary for an employee')
        gen_sum_p.add_argument('--cycle-id', '-c', type=str, required=True, help='Review Cycle UUID')
        gen_sum_p.add_argument('--subject', type=str, required=True, help='Subject employee email')

    def handle(self, *args, **options):
        with connection.cursor() as cursor:
            cursor.execute('SET search_path TO "public"')

        action = options['action']
        handler_map = {
            'list-self': self.handle_list_self,
            'info-self': self.handle_info_self,
            'submit-self': self.handle_submit_self,
            'reset-self': self.handle_reset_self,
            'list-supervisor': self.handle_list_supervisor,
            'info-supervisor': self.handle_info_supervisor,
            'create-supervisor': self.handle_create_supervisor,
            'submit-supervisor': self.handle_submit_supervisor,
            'approve-supervisor': self.handle_approve_supervisor,
            'reset-supervisor': self.handle_reset_supervisor,
            'compare': self.handle_compare,
            'request-360': self.handle_request_360,
            'list-360': self.handle_list_360,
            'generate-summary': self.handle_generate_summary,
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

    def handle_list_self(self, options):
        cycle_id = options.get('cycle_id')
        tenant_id = self._resolve_tenant_id(options)
        status = options.get('status')
        search = options.get('search')
        limit = options.get('limit', 50)

        qs = SelfAssessment.objects.filter(deleted_at__isnull=True).select_related('employee', 'review_cycle').order_by('-created_at')
        if cycle_id:
            qs = qs.filter(review_cycle_id=cycle_id)
        if tenant_id:
            qs = qs.filter(tenant_id=tenant_id)
        if status:
            qs = qs.filter(status=status)
        if search:
            qs = qs.filter(Q(employee__email__icontains=search) | Q(employee__first_name__icontains=search))

        total_count = qs.count()
        items = list(qs[:limit])

        self.stdout.write(self.style.MIGRATE_HEADING(
            f"\n{'=' * 95}\n[SELF-ASSESSMENTS] (Showing {len(items)} of {total_count})\n{'=' * 95}"
        ))

        header = f"{'Employee Email':<32} {'Cycle Name':<24} {'Status':<12} {'Submitted At':<20} {'ID':<15}"
        self.stdout.write(self.style.NOTICE(header))
        self.stdout.write("-" * 95)

        for item in items:
            sub_date = item.submitted_at.strftime('%Y-%m-%d %H:%M') if item.submitted_at else "Not Submitted"
            st_style = self.style.SUCCESS if item.status == 'submitted' else self.style.WARNING
            self.stdout.write(
                f"{item.employee.email:<32} {item.review_cycle.name[:22]:<24} "
                f"{st_style(item.status):<21} {sub_date:<20} {str(item.id)[:13]}.."
            )

        self.stdout.write("=" * 95 + "\n")

    def handle_info_self(self, options):
        assessment_id = options['assessment_id']
        try:
            sa = SelfAssessment.objects.select_related('employee', 'review_cycle').get(id=assessment_id)
        except SelfAssessment.DoesNotExist:
            raise CommandError(f"SelfAssessment '{assessment_id}' not found.")

        self.stdout.write(self.style.MIGRATE_HEADING(f"\n{'=' * 75}\n[SELF-ASSESSMENT] {sa.employee.email} - {sa.review_cycle.name}\n{'=' * 75}"))
        self.stdout.write(f"  * ID:              {sa.id}")
        self.stdout.write(f"  * Status:          {sa.status}")
        self.stdout.write(f"  * Submitted At:    {sa.submitted_at or 'Pending'}")
        self.stdout.write(f"  * Avg Rating:      {sa.average_rating or 'N/A'}")
        self.stdout.write(f"  * Strengths:       {sa.strengths or 'None listed'}")
        self.stdout.write(f"  * Improvements:    {sa.areas_for_improvement or 'None listed'}")
        self.stdout.write(f"  * Achievements:    {sa.achievements or 'None listed'}")
        self.stdout.write(f"  * Aspirations:     {sa.career_aspirations or 'None listed'}")
        self.stdout.write(f"  * Overall Comment: {sa.overall_comment or 'None'}")
        self.stdout.write("=" * 75 + "\n")

    def handle_submit_self(self, options):
        assessment_id = options['assessment_id']
        try:
            sa = SelfAssessment.objects.get(id=assessment_id)
            sa.status = 'submitted'
            sa.submitted_at = timezone.now()
            sa.save(update_fields=['status', 'submitted_at'])
            self.stdout.write(self.style.SUCCESS(f"[SUCCESS] Self-Assessment '{assessment_id}' marked as submitted."))
        except SelfAssessment.DoesNotExist:
            raise CommandError(f"SelfAssessment '{assessment_id}' not found.")

    def handle_reset_self(self, options):
        assessment_id = options['assessment_id']
        try:
            sa = SelfAssessment.objects.get(id=assessment_id)
            sa.status = 'draft'
            sa.submitted_at = None
            sa.save(update_fields=['status', 'submitted_at'])
            self.stdout.write(self.style.SUCCESS(f"[SUCCESS] Self-Assessment '{assessment_id}' reset to draft."))
        except SelfAssessment.DoesNotExist:
            raise CommandError(f"SelfAssessment '{assessment_id}' not found.")

    def handle_list_supervisor(self, options):
        cycle_id = options.get('cycle_id')
        tenant_id = self._resolve_tenant_id(options)
        status = options.get('status')
        supervisor = options.get('supervisor')
        limit = options.get('limit', 50)

        qs = SupervisorReview.objects.filter(deleted_at__isnull=True).select_related('employee', 'supervisor', 'review_cycle').order_by('-created_at')
        if cycle_id:
            qs = qs.filter(review_cycle_id=cycle_id)
        if tenant_id:
            qs = qs.filter(tenant_id=tenant_id)
        if status:
            qs = qs.filter(status=status)
        if supervisor:
            qs = qs.filter(supervisor__email__iexact=supervisor)

        total_count = qs.count()
        items = list(qs[:limit])

        self.stdout.write(self.style.MIGRATE_HEADING(
            f"\n{'=' * 105}\n[SUPERVISOR REVIEWS] (Showing {len(items)} of {total_count})\n{'=' * 105}"
        ))

        header = f"{'Employee':<28} {'Supervisor':<28} {'Cycle':<20} {'Status':<12} {'Recommendation':<15}"
        self.stdout.write(self.style.NOTICE(header))
        self.stdout.write("-" * 105)

        for item in items:
            rec = item.get_recommendation_display() if item.recommendation else 'None'
            self.stdout.write(
                f"{item.employee.email[:26]:<28} {item.supervisor.email[:26]:<28} "
                f"{item.review_cycle.name[:18]:<20} {item.status:<12} {rec[:14]:<15}"
            )

        self.stdout.write("=" * 105 + "\n")

    def handle_info_supervisor(self, options):
        review_id = options['review_id']
        try:
            sr = SupervisorReview.objects.select_related('employee', 'supervisor', 'review_cycle').get(id=review_id)
        except SupervisorReview.DoesNotExist:
            raise CommandError(f"SupervisorReview '{review_id}' not found.")

        self.stdout.write(self.style.MIGRATE_HEADING(f"\n{'=' * 80}\n[SUPERVISOR REVIEW] {sr.employee.email} by {sr.supervisor.email}\n{'=' * 80}"))
        self.stdout.write(f"  * ID:                     {sr.id}")
        self.stdout.write(f"  * Review Cycle:           {sr.review_cycle.name}")
        self.stdout.write(f"  * Status:                 {sr.status}")
        self.stdout.write(f"  * Recommendation:         {sr.get_recommendation_display()}")
        self.stdout.write(f"  * Bonus Recommendation:   {sr.get_bonus_recommendation_display()}")
        self.stdout.write(f"  * Promotion Readiness:    {sr.promotion_readiness} (Target: {sr.promotion_target_role or 'N/A'})")
        self.stdout.write(f"  * Override KPI Score:     {sr.override_kpi_score or 'None'}")
        self.stdout.write(f"  * Performance Summary:    {sr.performance_summary or 'None'}")
        self.stdout.write(f"  * Strengths Observed:     {sr.strengths_observed or 'None'}")
        self.stdout.write(f"  * Development Areas:      {sr.development_areas or 'None'}")
        self.stdout.write(f"  * Overall Comment:        {sr.overall_comment or 'None'}")
        self.stdout.write("=" * 80 + "\n")

    def handle_create_supervisor(self, options):
        cycle_id = options['cycle_id']
        emp_email = options['employee']
        sup_email = options['supervisor']

        try:
            cycle = ReviewCycle.objects.get(id=cycle_id)
            emp = User.objects.get(email__iexact=emp_email, is_deleted=False)
            sup = User.objects.get(email__iexact=sup_email, is_deleted=False)
        except Exception as e:
            raise CommandError(f"Error finding cycle or users: {e}")

        review, created = SupervisorReview.objects.get_or_create(
            review_cycle=cycle,
            employee=emp,
            defaults={
                'supervisor': sup,
                'tenant_id': cycle.tenant_id,
                'status': 'draft'
            }
        )

        msg = "Created new" if created else "Found existing"
        self.stdout.write(self.style.SUCCESS(f"[SUCCESS] {msg} Supervisor Review (ID: {review.id}) for {emp.email} by {sup.email}."))

    def handle_submit_supervisor(self, options):
        review_id = options['review_id']
        try:
            sr = SupervisorReview.objects.get(id=review_id)
            sr.status = 'submitted'
            sr.submitted_at = timezone.now()
            sr.save(update_fields=['status', 'submitted_at'])
            self.stdout.write(self.style.SUCCESS(f"[SUCCESS] Supervisor Review '{review_id}' marked as submitted."))
        except SupervisorReview.DoesNotExist:
            raise CommandError(f"SupervisorReview '{review_id}' not found.")

    def handle_approve_supervisor(self, options):
        review_id = options['review_id']
        approver_email = options.get('approver')
        approver = None
        if approver_email:
            approver = User.objects.filter(email__iexact=approver_email).first()

        try:
            sr = SupervisorReview.objects.get(id=review_id)
            sr.status = 'approved'
            sr.reviewed_at = timezone.now()
            if approver:
                sr.reviewed_by = approver
            sr.save(update_fields=['status', 'reviewed_at', 'reviewed_by'])
            self.stdout.write(self.style.SUCCESS(f"[SUCCESS] Supervisor Review '{review_id}' approved."))
        except SupervisorReview.DoesNotExist:
            raise CommandError(f"SupervisorReview '{review_id}' not found.")

    def handle_reset_supervisor(self, options):
        review_id = options['review_id']
        try:
            sr = SupervisorReview.objects.get(id=review_id)
            sr.status = 'draft'
            sr.submitted_at = None
            sr.reviewed_at = None
            sr.save(update_fields=['status', 'submitted_at', 'reviewed_at'])
            self.stdout.write(self.style.SUCCESS(f"[SUCCESS] Supervisor Review '{review_id}' reset to draft."))
        except SupervisorReview.DoesNotExist:
            raise CommandError(f"SupervisorReview '{review_id}' not found.")

    def handle_compare(self, options):
        cycle_id = options['cycle_id']
        emp_email = options['employee']

        try:
            cycle = ReviewCycle.objects.get(id=cycle_id)
            emp = User.objects.get(email__iexact=emp_email, is_deleted=False)
        except Exception as e:
            raise CommandError(f"Error: {e}")

        sa = SelfAssessment.objects.filter(review_cycle=cycle, employee=emp).first()
        sr = SupervisorReview.objects.filter(review_cycle=cycle, employee=emp).first()

        self.stdout.write(self.style.MIGRATE_HEADING(
            f"\n{'=' * 80}\n[EVALUATION GAP ANALYSIS] {emp.email} (Cycle: {cycle.name})\n{'=' * 80}"
        ))

        sa_avg = sa.average_rating if sa else None
        sr_avg = sr.average_competency_rating if sr else None

        self.stdout.write(f"  * Self Assessment Status:    {sa.status if sa else 'None'}")
        self.stdout.write(f"  * Supervisor Review Status:  {sr.status if sr else 'None'}")
        self.stdout.write(f"  * Self Score (Avg):          {f'{sa_avg:.2f}' if sa_avg else 'N/A'}")
        self.stdout.write(f"  * Supervisor Score (Avg):    {f'{sr_avg:.2f}' if sr_avg else 'N/A'}")

        if sa_avg is not None and sr_avg is not None:
            gap = float(sr_avg) - float(sa_avg)
            gap_str = f"+{gap:.2f}" if gap > 0 else f"{gap:.2f}"
            gap_style = self.style.SUCCESS if gap >= 0 else self.style.WARNING
            self.stdout.write(f"  * Gap (Supervisor - Self):   {gap_style(gap_str)}")

        self.stdout.write("=" * 80 + "\n")

    def handle_request_360(self, options):
        cycle_id = options['cycle_id']
        subj_email = options['subject']
        rev_email = options['reviewer']
        rev_type = options.get('type', 'peer')
        req_email = options.get('requester')

        try:
            cycle = ReviewCycle.objects.get(id=cycle_id)
            subject = User.objects.get(email__iexact=subj_email, is_deleted=False)
            reviewer = User.objects.get(email__iexact=rev_email, is_deleted=False)
            requested_by = User.objects.filter(email__iexact=req_email, is_deleted=False).first() if req_email else None
        except Exception as e:
            raise CommandError(f"Error looking up records: {e}")

        req, created = FeedbackRequest.objects.get_or_create(
            review_cycle=cycle,
            subject=subject,
            reviewer=reviewer,
            defaults={
                'reviewer_type': rev_type,
                'requested_by': requested_by,
                'tenant_id': cycle.tenant_id,
                'status': 'submitted'
            }
        )

        msg = "Sent" if created else "Existing"
        self.stdout.write(self.style.SUCCESS(f"[SUCCESS] {msg} 360 Feedback Request (ID: {req.id}) for subject '{subject.email}' to reviewer '{reviewer.email}' ({rev_type})."))

    def handle_list_360(self, options):
        cycle_id = options['cycle_id']
        subj_email = options.get('subject')
        limit = options.get('limit', 50)

        qs = FeedbackRequest.objects.filter(review_cycle_id=cycle_id, deleted_at__isnull=True).select_related('subject', 'reviewer').order_by('-created_at')
        if subj_email:
            qs = qs.filter(subject__email__iexact=subj_email)

        total = qs.count()
        items = list(qs[:limit])

        self.stdout.write(self.style.MIGRATE_HEADING(
            f"\n{'=' * 95}\n[360 FEEDBACK REQUESTS] (Showing {len(items)} of {total})\n{'=' * 95}"
        ))

        header = f"{'Subject Email':<28} {'Reviewer Email':<28} {'Type':<14} {'Status':<12} {'ID':<15}"
        self.stdout.write(self.style.NOTICE(header))
        self.stdout.write("-" * 95)

        for item in items:
            self.stdout.write(
                f"{item.subject.email[:26]:<28} {item.reviewer.email[:26]:<28} "
                f"{item.reviewer_type:<14} {item.status:<12} {str(item.id)[:13]}.."
            )

        self.stdout.write("=" * 95 + "\n")

    def handle_generate_summary(self, options):
        cycle_id = options['cycle_id']
        subj_email = options['subject']

        try:
            cycle = ReviewCycle.objects.get(id=cycle_id)
            subject = User.objects.get(email__iexact=subj_email, is_deleted=False)
        except Exception as e:
            raise CommandError(f"Error: {e}")

        try:
            summary = SummaryService.generate_summary(subject=subject, review_cycle=cycle)
            self.stdout.write(self.style.SUCCESS(
                f"\n[SUCCESS] Generated 360 Feedback Summary for '{subject.email}' in cycle '{cycle.name}'!\n"
                f"  * Average Score:       {summary.average_score}\n"
                f"  * Responses Count:     {summary.response_count}\n"
                f"  * Competencies Evaluated: {len(summary.competency_scores) if summary.competency_scores else 0}\n"
            ))
        except Exception as e:
            raise CommandError(f"Failed to generate 360 summary: {e}")
