# apps/reviews/management/commands/manage_pip.py
"""
Comprehensive Management Command for Falcon PMS Performance Improvement Plans (PIPs).
Handles:
- PIP Actions: list, info, create, approve, extend, complete, cancel
- Actions & Milestones: add-action, complete-action, verify-action
- Checkpoint Reviews: add-review
- Reports: report

Usage:
    python manage.py manage_pip list --tenant-id <tenant_id>
    python manage.py manage_pip info --pip-id <pip_id>
    python manage.py manage_pip create --employee staff@falcon.com --owner sup@falcon.com --cycle-id <cycle_id> --title "Sales Performance Plan" --start-date 2026-08-01 --end-date 2026-09-30 --severity moderate --areas "Prospecting, Deal closing" --criteria "Reach 80% quota" --consequences "Termination"
    python manage.py manage_pip approve --pip-id <pip_id>
    python manage.py manage_pip extend --pip-id <pip_id> --to-date 2026-10-31 --reason "Medical leave extension"
    python manage.py manage_pip complete --pip-id <pip_id> --outcome successful --notes "Met all goals"
    python manage.py manage_pip add-action --pip-id <pip_id> --title "Complete Sales Training" --due-date 2026-08-15 --priority high
    python manage.py manage_pip complete-action --action-id <action_id>
    python manage.py manage_pip verify-action --action-id <action_id> --verifier hr@falcon.com
    python manage.py manage_pip add-review --pip-id <pip_id> --reviewer sup@falcon.com --rating satisfactory --summary "Good initial progress"
    python manage.py manage_pip report --pip-id <pip_id>
"""

import sys
from datetime import datetime, date
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
from apps.reviews.models import ReviewCycle, FinalRating, PIP, PIPAction, PIPReview
from apps.reviews.services.pip.pip_service import PIPService
from apps.reviews.services.reporting.pip_report_service import PIPReportService


class Command(BaseCommand):
    help = 'Comprehensive management command for Performance Improvement Plans (PIPs), Milestones, and Outcomes.'

    def add_arguments(self, parser):
        subparsers = parser.add_subparsers(dest='action', required=True, help='Action to perform')

        # ---------------- LIST ----------------
        list_p = subparsers.add_parser('list', help='List PIPs with filters')
        list_p.add_argument('--tenant-id', '-t', type=str, help='Tenant ID')
        list_p.add_argument('--admin', '-a', type=str, help='Admin email')
        list_p.add_argument('--cycle-id', '-c', type=str, help='Review Cycle UUID')
        list_p.add_argument('--employee', '-e', type=str, help='Employee email')
        list_p.add_argument('--owner', '-o', type=str, help='Owner/Supervisor email')
        list_p.add_argument('--status', '-s', type=str, choices=['draft', 'submitted', 'completed', 'cancelled'], help='Status')
        list_p.add_argument('--outcome', choices=[o[0] for o in PIP.Outcome.choices], help='Outcome filter')
        list_p.add_argument('--severity', choices=[s[0] for s in PIP.Severity.choices], help='Severity filter')
        list_p.add_argument('--limit', '-l', type=int, default=50, help='Max items to show')

        # ---------------- INFO ----------------
        info_p = subparsers.add_parser('info', help='Display detailed PIP profile, actions, and reviews')
        info_p.add_argument('--pip-id', '-p', type=str, required=True, help='PIP UUID')

        # ---------------- CREATE ----------------
        create_p = subparsers.add_parser('create', help='Create a new PIP')
        create_p.add_argument('--employee', '-e', type=str, required=True, help='Employee email')
        create_p.add_argument('--owner', '-o', type=str, required=True, help='Owner/Supervisor email')
        create_p.add_argument('--cycle-id', '-c', type=str, help='Review Cycle UUID')
        create_p.add_argument('--title', '-n', type=str, required=True, help='PIP Title')
        create_p.add_argument('--description', '-d', type=str, default='', help='PIP Description')
        create_p.add_argument('--severity', type=str, default='moderate', choices=[s[0] for s in PIP.Severity.choices], help='Severity')
        create_p.add_argument('--start-date', type=str, required=True, help='Start date (YYYY-MM-DD)')
        create_p.add_argument('--end-date', type=str, required=True, help='End date (YYYY-MM-DD)')
        create_p.add_argument('--areas', type=str, required=True, help='Improvement areas')
        create_p.add_argument('--criteria', type=str, required=True, help='Success criteria')
        create_p.add_argument('--consequences', type=str, required=True, help='Consequences if failed')

        # ---------------- APPROVE ----------------
        appr_p = subparsers.add_parser('approve', help='Approve / activate a drafted PIP')
        appr_p.add_argument('--pip-id', '-p', type=str, required=True, help='PIP UUID')

        # ---------------- EXTEND ----------------
        ext_p = subparsers.add_parser('extend', help='Extend PIP timeline')
        ext_p.add_argument('--pip-id', '-p', type=str, required=True, help='PIP UUID')
        ext_p.add_argument('--to-date', type=str, required=True, help='New end date (YYYY-MM-DD)')
        ext_p.add_argument('--reason', type=str, required=True, help='Extension reason')

        # ---------------- COMPLETE ----------------
        comp_p = subparsers.add_parser('complete', help='Conclude PIP with outcome')
        comp_p.add_argument('--pip-id', '-p', type=str, required=True, help='PIP UUID')
        comp_p.add_argument('--outcome', type=str, required=True, choices=[o[0] for o in PIP.Outcome.choices], help='PIP Outcome')
        comp_p.add_argument('--notes', type=str, default='', help='Final outcome notes')

        # ---------------- CANCEL ----------------
        cancel_p = subparsers.add_parser('cancel', help='Cancel PIP')
        cancel_p.add_argument('--pip-id', '-p', type=str, required=True, help='PIP UUID')

        # ---------------- ADD ACTION ----------------
        add_act_p = subparsers.add_parser('add-action', help='Add an action milestone to PIP')
        add_act_p.add_argument('--pip-id', '-p', type=str, required=True, help='PIP UUID')
        add_act_p.add_argument('--title', '-t', type=str, required=True, help='Action title')
        add_act_p.add_argument('--description', '-d', type=str, default='', help='Action description')
        add_act_p.add_argument('--due-date', type=str, required=True, help='Due date (YYYY-MM-DD)')
        add_act_p.add_argument('--priority', type=str, default='medium', choices=[pr[0] for pr in PIPAction.Priority.choices], help='Priority')
        add_act_p.add_argument('--requires-evidence', action='store_true', help='Requires evidence upload')

        # ---------------- COMPLETE ACTION ----------------
        comp_act_p = subparsers.add_parser('complete-action', help='Mark milestone action completed')
        comp_act_p.add_argument('--action-id', '-a', type=str, required=True, help='PIPAction ID')

        # ---------------- VERIFY ACTION ----------------
        ver_act_p = subparsers.add_parser('verify-action', help='Verify/approve completed action milestone')
        ver_act_p.add_argument('--action-id', '-a', type=str, required=True, help='PIPAction ID')
        ver_act_p.add_argument('--verifier', '-v', type=str, required=True, help='Verifier user email')

        # ---------------- ADD REVIEW ----------------
        add_rev_p = subparsers.add_parser('add-review', help='Add a periodic checkpoint review to PIP')
        add_rev_p.add_argument('--pip-id', '-p', type=str, required=True, help='PIP UUID')
        add_rev_p.add_argument('--reviewer', '-r', type=str, required=True, help='Reviewer email')
        add_rev_p.add_argument('--rating', type=str, required=True, choices=[r[0] for r in PIPReview.ReviewRating.choices], help='Progress rating')
        add_rev_p.add_argument('--summary', '-s', type=str, required=True, help='Review summary')
        add_rev_p.add_argument('--review-date', type=str, help='Review date (defaults to today)')

        # ---------------- REPORT ----------------
        rep_p = subparsers.add_parser('report', help='Generate detailed PIP progress report')
        rep_p.add_argument('--pip-id', '-p', type=str, required=True, help='PIP UUID')

    def handle(self, *args, **options):
        with connection.cursor() as cursor:
            cursor.execute('SET search_path TO "public"')

        action = options['action']
        handler_map = {
            'list': self.handle_list,
            'info': self.handle_info,
            'create': self.handle_create,
            'approve': self.handle_approve,
            'extend': self.handle_extend,
            'complete': self.handle_complete,
            'cancel': self.handle_cancel,
            'add-action': self.handle_add_action,
            'complete-action': self.handle_complete_action,
            'verify-action': self.handle_verify_action,
            'add-review': self.handle_add_review,
            'report': self.handle_report,
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
        emp_email = options.get('employee')
        owner_email = options.get('owner')
        status = options.get('status')
        outcome = options.get('outcome')
        severity = options.get('severity')
        limit = options.get('limit', 50)

        qs = PIP.objects.filter(deleted_at__isnull=True).select_related('employee', 'owner', 'review_cycle').order_by('-created_at')
        if tenant_id:
            qs = qs.filter(tenant_id=tenant_id)
        if cycle_id:
            qs = qs.filter(review_cycle_id=cycle_id)
        if emp_email:
            qs = qs.filter(employee__email__icontains=emp_email)
        if owner_email:
            qs = qs.filter(owner__email__icontains=owner_email)
        if status:
            qs = qs.filter(status=status)
        if outcome:
            qs = qs.filter(outcome=outcome)
        if severity:
            qs = qs.filter(severity=severity)

        total = qs.count()
        pips = list(qs[:limit])

        self.stdout.write(self.style.MIGRATE_HEADING(
            f"\n{'=' * 105}\n[PERFORMANCE IMPROVEMENT PLANS] (Showing {len(pips)} of {total})\n{'=' * 105}"
        ))

        header = f"{'Employee':<26} {'Owner/Manager':<26} {'Title':<20} {'Severity':<10} {'Status':<10} {'Outcome':<10}"
        self.stdout.write(self.style.NOTICE(header))
        self.stdout.write("-" * 105)

        for p in pips:
            st_style = self.style.SUCCESS if p.status == 'completed' else (self.style.NOTICE if p.status == 'submitted' else self.style.WARNING)
            out_str = p.outcome or "-"
            self.stdout.write(
                f"{p.employee.email[:24]:<26} {p.owner.email[:24]:<26} "
                f"{p.title[:18]:<20} {p.severity:<10} {st_style(p.status):<19} {out_str:<10}"
            )

        self.stdout.write("=" * 105 + "\n")

    def handle_info(self, options):
        pip_id = options['pip_id']
        try:
            p = PIP.objects.select_related('employee', 'owner', 'review_cycle').get(id=pip_id)
        except PIP.DoesNotExist:
            raise CommandError(f"PIP '{pip_id}' not found.")

        actions = p.actions.all().order_by('due_date')
        reviews = p.reviews.all().order_by('-review_date')

        self.stdout.write(self.style.MIGRATE_HEADING(
            f"\n{'=' * 85}\n[PIP PROFILE] {p.title} ({p.employee.email})\n{'=' * 85}"
        ))
        self.stdout.write(f"  * ID:                    {p.id}")
        self.stdout.write(f"  * Employee:              {p.employee.email}")
        self.stdout.write(f"  * Owner / Supervisor:    {p.owner.email}")
        self.stdout.write(f"  * Review Cycle:          {p.review_cycle.name if p.review_cycle else 'Ad-hoc'}")
        self.stdout.write(f"  * Severity:              {p.get_severity_display()} ({p.severity})")
        self.stdout.write(f"  * Status:                {p.get_status_display()} ({p.status})")
        self.stdout.write(f"  * Timeline:              {p.start_date} to {p.extended_to_date or p.end_date}")
        if p.extended_to_date:
            self.stdout.write(f"  * Extension Reason:      {p.extension_reason}")
        self.stdout.write(f"  * Improvement Areas:     {p.improvement_areas}")
        self.stdout.write(f"  * Success Criteria:      {p.success_criteria}")
        self.stdout.write(f"  * Consequences (Fail):   {p.consequences_if_failed}")
        self.stdout.write(f"  * Outcome:               {p.outcome or 'In Progress'}")
        if p.outcome_notes:
            self.stdout.write(f"  * Outcome Notes:         {p.outcome_notes}")

        self.stdout.write(f"\n  --- Action Milestones ({actions.count()}) ---")
        for act in actions:
            act_st = self.style.SUCCESS(act.status) if act.status == 'completed' else act.status
            self.stdout.write(f"  * [{act.priority.upper()}] {act.title} (Due: {act.due_date}) -- Status: {act_st}")

        self.stdout.write(f"\n  --- Checkpoint Reviews ({reviews.count()}) ---")
        for rev in reviews:
            self.stdout.write(f"  * [{rev.review_date}] {rev.reviewer.email}: {rev.get_rating_display()} - {rev.summary[:60]}")

        self.stdout.write("=" * 85 + "\n")

    def handle_create(self, options):
        emp_email = options['employee']
        owner_email = options['owner']
        cycle_id = options.get('cycle_id')

        try:
            employee = User.objects.get(email__iexact=emp_email, is_deleted=False)
            owner = User.objects.get(email__iexact=owner_email, is_deleted=False)
            cycle = ReviewCycle.objects.filter(id=cycle_id).first() if cycle_id else None
            start_date = date.fromisoformat(options['start_date'])
            end_date = date.fromisoformat(options['end_date'])
        except Exception as e:
            raise CommandError(f"Error parsing input: {e}")

        try:
            pip = PIPService.create_pip(
                employee=employee,
                owner=owner,
                review_cycle=cycle,
                data={
                    'title': options['title'],
                    'description': options.get('description', ''),
                    'severity': options['severity'],
                    'start_date': start_date,
                    'end_date': end_date,
                    'improvement_areas': options['areas'],
                    'success_criteria': options['criteria'],
                    'consequences_if_failed': options['consequences'],
                }
            )
            self.stdout.write(self.style.SUCCESS(
                f"\n[SUCCESS] Performance Improvement Plan created!\n"
                f"  * ID:       {pip.id}\n"
                f"  * Title:    {pip.title}\n"
                f"  * Employee: {employee.email}\n"
                f"  * Owner:    {owner.email}\n"
                f"  * Status:   {pip.status}\n"
            ))
        except Exception as e:
            raise CommandError(f"Failed to create PIP: {e}")

    def handle_approve(self, options):
        pip_id = options['pip_id']
        try:
            p = PIP.objects.get(id=pip_id)
            p.status = 'submitted'
            p.save(update_fields=['status'])
            self.stdout.write(self.style.SUCCESS(f"[SUCCESS] PIP '{p.title}' (ID: {p.id}) approved and activated."))
        except PIP.DoesNotExist:
            raise CommandError(f"PIP '{pip_id}' not found.")

    def handle_extend(self, options):
        pip_id = options['pip_id']
        to_date_str = options['to_date']
        reason = options['reason']

        try:
            to_date = date.fromisoformat(to_date_str)
            p = PIPService.update_pip(pip_id, {'extended_to_date': to_date, 'extension_reason': reason})
            self.stdout.write(self.style.SUCCESS(f"[SUCCESS] PIP '{p.title}' extended to {p.extended_to_date}."))
        except Exception as e:
            raise CommandError(f"Failed to extend PIP: {e}")

    def handle_complete(self, options):
        pip_id = options['pip_id']
        outcome = options['outcome']
        notes = options.get('notes', '')

        try:
            p = PIPService.complete_pip(pip_id, outcome=outcome, notes=notes)
            self.stdout.write(self.style.SUCCESS(
                f"[SUCCESS] PIP '{p.title}' completed with outcome '{p.outcome}'."
            ))
        except Exception as e:
            raise CommandError(f"Failed to complete PIP: {e}")

    def handle_cancel(self, options):
        pip_id = options['pip_id']
        try:
            p = PIP.objects.get(id=pip_id)
            p.status = 'cancelled'
            p.outcome = 'cancelled'
            p.save(update_fields=['status', 'outcome'])
            self.stdout.write(self.style.SUCCESS(f"[SUCCESS] PIP '{p.title}' cancelled."))
        except PIP.DoesNotExist:
            raise CommandError(f"PIP '{pip_id}' not found.")

    def handle_add_action(self, options):
        pip_id = options['pip_id']
        title = options['title']
        desc = options.get('description', '')
        due_date_str = options['due_date']
        priority = options.get('priority', 'medium')
        evidence = options.get('requires_evidence', False)

        try:
            p = PIP.objects.get(id=pip_id)
            due_date = date.fromisoformat(due_date_str)
        except Exception as e:
            raise CommandError(f"Error: {e}")

        act = PIPAction.objects.create(
            pip=p,
            title=title,
            description=desc,
            due_date=due_date,
            priority=priority,
            requires_evidence=evidence,
            status='pending'
        )

        self.stdout.write(self.style.SUCCESS(f"[SUCCESS] Action '{act.title}' (ID: {act.id}) added to PIP '{p.title}'."))

    def handle_complete_action(self, options):
        action_id = options['action_id']
        try:
            act = PIPAction.objects.get(id=action_id)
            act.status = 'completed'
            act.completed_at = timezone.now()
            act.save(update_fields=['status', 'completed_at'])
            self.stdout.write(self.style.SUCCESS(f"[SUCCESS] Action '{act.title}' marked as completed."))
        except PIPAction.DoesNotExist:
            raise CommandError(f"PIPAction '{action_id}' not found.")

    def handle_verify_action(self, options):
        action_id = options['action_id']
        verifier_email = options['verifier']

        try:
            act = PIPAction.objects.get(id=action_id)
            verifier = User.objects.get(email__iexact=verifier_email, is_deleted=False)
        except Exception as e:
            raise CommandError(f"Error: {e}")

        act.evidence_verified_by = verifier
        act.evidence_verified_at = timezone.now()
        act.status = 'completed'
        act.save(update_fields=['evidence_verified_by', 'evidence_verified_at', 'status'])
        self.stdout.write(self.style.SUCCESS(f"[SUCCESS] Action '{act.title}' verified by '{verifier.email}'."))

    def handle_add_review(self, options):
        pip_id = options['pip_id']
        rev_email = options['reviewer']
        rating = options['rating']
        summary = options['summary']
        rev_date_str = options.get('review_date')

        try:
            p = PIP.objects.get(id=pip_id)
            reviewer = User.objects.get(email__iexact=rev_email, is_deleted=False)
            rev_date = date.fromisoformat(rev_date_str) if rev_date_str else timezone.now().date()
        except Exception as e:
            raise CommandError(f"Error: {e}")

        review = PIPReview.objects.create(
            pip=p,
            reviewer=reviewer,
            employee=p.employee,
            review_date=rev_date,
            rating=rating,
            summary=summary
        )

        self.stdout.write(self.style.SUCCESS(
            f"[SUCCESS] Added checkpoint review (ID: {review.id}) with rating '{rating}' to PIP '{p.title}'."
        ))

    def handle_report(self, options):
        pip_id = options['pip_id']
        try:
            report = PIPReportService.get_pip_details(pip_id)
        except Exception as e:
            raise CommandError(f"Failed to load PIP report: {e}")

        self.stdout.write(self.style.MIGRATE_HEADING(
            f"\n{'=' * 80}\n[PIP PROGRESS REPORT] {report.get('title')}\n{'=' * 80}"
        ))
        self.stdout.write(f"  * Employee:              {report.get('employee_email')}")
        self.stdout.write(f"  * Status:                {report.get('status')} (Outcome: {report.get('outcome') or 'In Progress'})")
        self.stdout.write(f"  * Days Remaining:        {report.get('days_remaining', 0)}")
        self.stdout.write(f"  * Milestones Completed:  {report.get('completed_actions', 0)} / {report.get('total_actions', 0)} ({report.get('progress_percentage', 0)}%)")
        self.stdout.write(f"  * Total Checkpoints:     {len(report.get('reviews', []))}")
        self.stdout.write("=" * 80 + "\n")
