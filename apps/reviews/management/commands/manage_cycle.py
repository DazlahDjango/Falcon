# apps/reviews/management/commands/manage_cycle.py
"""
Comprehensive Management Command for Falcon PMS Review Cycles.
Handles:
- Cycle actions: list, info, create, activate, extend, close/complete, archive, unarchive, delete
- Progress & stats: progress, participants, stats

Usage:
    python manage.py manage_cycle list --tenant-id <tenant_id>
    python manage.py manage_cycle info --cycle-id <cycle_id>
    python manage.py manage_cycle create --name "Q3 2026 Review" --cycle-type quarterly --start-date 2026-07-01 --self-deadline 2026-07-15 --supervisor-deadline 2026-07-30 --final-deadline 2026-08-10 --end-date 2026-08-15 --admin admin@falcon.com
    python manage.py manage_cycle activate --cycle-id <cycle_id>
    python manage.py manage_cycle extend --cycle-id <cycle_id> --target self --days 7
    python manage.py manage_cycle complete --cycle-id <cycle_id>
    python manage.py manage_cycle archive --cycle-id <cycle_id>
    python manage.py manage_cycle unarchive --cycle-id <cycle_id>
    python manage.py manage_cycle progress --cycle-id <cycle_id>
    python manage.py manage_cycle participants --cycle-id <cycle_id>
    python manage.py manage_cycle delete --cycle-id <cycle_id> [--hard]
"""

import sys
from datetime import datetime, timedelta, date
from typing import Optional, List, Dict

if sys.stdout.encoding != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

from django.core.management.base import BaseCommand, CommandError
from django.db import connection, transaction
from django.utils import timezone
from django.db.models import Q, Count

from apps.accounts.models import User
from apps.reviews.models import ReviewCycle, RatingScale, SelfAssessment, SupervisorReview, FinalRating, Competency
from apps.reviews.services.cycle.cycle_service import CycleService


class Command(BaseCommand):
    help = 'Comprehensive management command for Review Cycle operations, progression, and lifecycle.'

    def add_arguments(self, parser):
        subparsers = parser.add_subparsers(dest='action', required=True, help='Action to perform')

        # ---------------- LIST ----------------
        list_p = subparsers.add_parser('list', help='List review cycles with filters')
        list_p.add_argument('--tenant-id', '-t', type=str, help='Filter by tenant ID')
        list_p.add_argument('--admin', '-a', type=str, help='Filter by admin user\'s tenant')
        list_p.add_argument('--status', '-s', type=str, choices=['draft', 'submitted', 'completed', 'archived', 'cancelled'], help='Filter by status')
        list_p.add_argument('--type', type=str, choices=[c[0] for c in ReviewCycle.CycleType.choices], help='Filter by cycle type')
        list_p.add_argument('--search', '-q', type=str, help='Search query (name, description)')
        list_p.add_argument('--limit', '-l', type=int, default=50, help='Maximum cycles to show (default 50)')

        # ---------------- INFO ----------------
        info_p = subparsers.add_parser('info', help='Display detailed cycle metadata, weights, and dates')
        info_p.add_argument('--cycle-id', '-c', type=str, required=True, help='Review Cycle UUID')

        # ---------------- CREATE ----------------
        create_p = subparsers.add_parser('create', help='Create a new review cycle')
        create_p.add_argument('--name', '-n', type=str, required=True, help='Cycle name (e.g. "Q3 2026 Review")')
        create_p.add_argument('--cycle-type', type=str, default='annual', choices=[c[0] for c in ReviewCycle.CycleType.choices], help='Cycle type (default: annual)')
        create_p.add_argument('--start-date', type=str, required=True, help='Start date (YYYY-MM-DD)')
        create_p.add_argument('--self-deadline', type=str, required=True, help='Self-assessment deadline (YYYY-MM-DD)')
        create_p.add_argument('--supervisor-deadline', type=str, required=True, help='Supervisor review deadline (YYYY-MM-DD)')
        create_p.add_argument('--final-deadline', type=str, required=True, help='Final approval deadline (YYYY-MM-DD)')
        create_p.add_argument('--end-date', type=str, required=True, help='Cycle end date (YYYY-MM-DD)')
        create_p.add_argument('--kpi-weight', type=float, default=70.0, help='KPI weight percentage (default: 70.0)')
        create_p.add_argument('--competency-weight', type=float, default=30.0, help='Competency weight percentage (default: 30.0)')
        create_p.add_argument('--scale-id', type=str, help='Rating Scale ID (defaults to default scale for tenant)')
        create_p.add_argument('--admin', '-a', type=str, help='Admin email to inherit tenant ID')
        create_p.add_argument('--tenant-id', '-t', type=str, help='Explicit tenant ID')
        create_p.add_argument('--description', '-d', type=str, default='', help='Cycle description')

        # ---------------- ACTIVATE ----------------
        act_p = subparsers.add_parser('activate', help='Activate a draft cycle and generate participant assessments')
        act_p.add_argument('--cycle-id', '-c', type=str, required=True, help='Review Cycle UUID')

        # ---------------- EXTEND ----------------
        ext_p = subparsers.add_parser('extend', help='Extend cycle deadlines by a specified number of days')
        ext_p.add_argument('--cycle-id', '-c', type=str, required=True, help='Review Cycle UUID')
        ext_p.add_argument('--target', type=str, choices=['self', 'supervisor', 'final', 'end', 'all'], default='all', help='Deadline target to extend')
        ext_p.add_argument('--days', type=int, default=7, help='Number of days to extend (default: 7)')

        # ---------------- COMPLETE / CLOSE ----------------
        comp_p = subparsers.add_parser('complete', help='Close/complete a cycle and process ratings')
        comp_p.add_argument('--cycle-id', '-c', type=str, required=True, help='Review Cycle UUID')

        # ---------------- ARCHIVE / UNARCHIVE ----------------
        arch_p = subparsers.add_parser('archive', help='Archive a completed review cycle')
        arch_p.add_argument('--cycle-id', '-c', type=str, required=True, help='Review Cycle UUID')

        unarch_p = subparsers.add_parser('unarchive', help='Restore an archived review cycle back to completed')
        unarch_p.add_argument('--cycle-id', '-c', type=str, required=True, help='Review Cycle UUID')

        # ---------------- PROGRESS ----------------
        prog_p = subparsers.add_parser('progress', help='Show detailed progress metrics for a cycle')
        prog_p.add_argument('--cycle-id', '-c', type=str, required=True, help='Review Cycle UUID')

        # ---------------- PARTICIPANTS ----------------
        part_p = subparsers.add_parser('participants', help='List participating employees and individual status')
        part_p.add_argument('--cycle-id', '-c', type=str, required=True, help='Review Cycle UUID')
        part_p.add_argument('--limit', '-l', type=int, default=50, help='Max participants to show')

        # ---------------- DELETE ----------------
        del_p = subparsers.add_parser('delete', help='Soft-delete or permanently remove a review cycle')
        del_p.add_argument('--cycle-id', '-c', type=str, required=True, help='Review Cycle UUID')
        del_p.add_argument('--hard', action='store_true', help='Permanently delete from database')

    def handle(self, *args, **options):
        with connection.cursor() as cursor:
            cursor.execute('SET search_path TO "public"')

        action = options['action']
        handler_map = {
            'list': self.handle_list,
            'info': self.handle_info,
            'create': self.handle_create,
            'activate': self.handle_activate,
            'extend': self.handle_extend,
            'complete': self.handle_complete,
            'archive': self.handle_archive,
            'unarchive': self.handle_unarchive,
            'progress': self.handle_progress,
            'participants': self.handle_participants,
            'delete': self.handle_delete,
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

    def _get_cycle(self, options: Dict) -> ReviewCycle:
        cycle_id = options.get('cycle_id')
        if not cycle_id:
            raise CommandError("Please specify --cycle-id.")
        try:
            return ReviewCycle.objects.get(id=cycle_id)
        except ReviewCycle.DoesNotExist:
            raise CommandError(f"Review Cycle with ID '{cycle_id}' not found.")

    # =========================================================================
    # HANDLERS
    # =========================================================================

    def handle_list(self, options):
        tenant_id = self._resolve_tenant_id(options)
        status = options.get('status')
        cycle_type = options.get('type')
        search = options.get('search')
        limit = options.get('limit', 50)

        qs = ReviewCycle.objects.filter(deleted_at__isnull=True).order_by('-start_date')
        if tenant_id:
            qs = qs.filter(tenant_id=tenant_id)
        if status:
            qs = qs.filter(status=status)
        if cycle_type:
            qs = qs.filter(cycle_type=cycle_type)
        if search:
            qs = qs.filter(Q(name__icontains=search) | Q(description__icontains=search))

        total_count = qs.count()
        cycles = list(qs[:limit])

        self.stdout.write(self.style.MIGRATE_HEADING(
            f"\n{'=' * 105}\n[REVIEW CYCLES] DIRECTORY (Showing {len(cycles)} of {total_count} matching cycles)\n{'=' * 105}"
        ))

        header = f"{'Cycle Name':<30} {'Type':<12} {'Status':<12} {'Start Date':<12} {'End Date':<12} {'KPI/Comp %':<12} {'ID':<15}"
        self.stdout.write(self.style.NOTICE(header))
        self.stdout.write("-" * 105)

        for c in cycles:
            status_style = self.style.SUCCESS if c.status in ['submitted', 'completed'] else self.style.WARNING
            weights = f"{int(c.kpi_weight)}/{int(c.competency_weight)}"
            row = (
                f"{c.name[:28]:<30} {c.get_cycle_type_display()[:10]:<12} "
                f"{status_style(c.status):<21} {str(c.start_date):<12} {str(c.end_date):<12} "
                f"{weights:<12} {str(c.id)[:13]}.."
            )
            self.stdout.write(row)

        self.stdout.write("=" * 105 + "\n")

    def handle_info(self, options):
        cycle = self._get_cycle(options)
        progress = CycleService.get_cycle_progress(str(cycle.id))

        self.stdout.write(self.style.MIGRATE_HEADING(f"\n{'=' * 80}\n[REVIEW CYCLE DETAILS] {cycle.name}\n{'=' * 80}"))
        self.stdout.write(f"  * ID:                    {cycle.id}")
        self.stdout.write(f"  * Tenant ID:             {cycle.tenant_id}")
        self.stdout.write(f"  * Cycle Type:            {cycle.get_cycle_type_display()} ({cycle.cycle_type})")
        self.stdout.write(f"  * Status:                {cycle.get_status_display()} ({cycle.status})")
        self.stdout.write(f"  * Rating Scale:          {cycle.rating_scale.name if cycle.rating_scale else 'N/A'}")
        self.stdout.write(f"  * Weight Configuration:  KPI: {cycle.kpi_weight}% | Competency: {cycle.competency_weight}% | Mission: {cycle.mission_weight}% | Task: {cycle.task_weight}%")
        self.stdout.write(f"  * Features:              Self-Assessments: {cycle.require_self_assessment} | 360 Feedback: {cycle.require_360_feedback} | Calibration: {cycle.enable_calibration}")
        self.stdout.write(f"\n  --- Key Milestones & Deadlines ---")
        self.stdout.write(f"  * Start Date:            {cycle.start_date}")
        self.stdout.write(f"  * Self-Assessment Due:   {cycle.self_assessment_deadline}")
        self.stdout.write(f"  * Supervisor Review Due: {cycle.supervisor_review_deadline}")
        self.stdout.write(f"  * Final Approval Due:    {cycle.final_approval_deadline}")
        self.stdout.write(f"  * Cycle End Date:        {cycle.end_date}")
        self.stdout.write(f"\n  --- Execution Progress ---")
        self.stdout.write(f"  * Total Participants:    {progress.get('total_employees', 0)}")
        self.stdout.write(f"  * Self-Assessments:      {progress.get('self_assessment', {}).get('submitted', 0)} submitted ({progress.get('self_assessment', {}).get('percentage', 0)}%)")
        self.stdout.write(f"  * Supervisor Reviews:    {progress.get('supervisor_review', {}).get('completed', 0)} completed ({progress.get('supervisor_review', {}).get('percentage', 0)}%)")
        self.stdout.write(f"  * Final Ratings Locked:  {progress.get('final_rating', {}).get('locked', 0)} locked ({progress.get('final_rating', {}).get('percentage', 0)}%)")
        self.stdout.write(f"  * Overall Completion:    {progress.get('overall_completion_percentage', 0)}%")
        self.stdout.write("=" * 80 + "\n")

    def handle_create(self, options):
        tenant_id = self._resolve_tenant_id(options)
        if not tenant_id:
            raise CommandError("Please specify tenant via --tenant-id or --admin.")

        scale_id = options.get('scale_id')
        if not scale_id:
            scale = RatingScale.objects.filter(tenant_id=tenant_id, is_active=True).first()
            if not scale:
                scale = RatingScale.objects.filter(is_active=True).first()
            if not scale:
                raise CommandError("No RatingScale found for tenant. Please create a RatingScale first.")
            scale_id = str(scale.id)
        else:
            scale = RatingScale.objects.get(id=scale_id)

        try:
            start_date = date.fromisoformat(options['start_date'])
            self_deadline = date.fromisoformat(options['self_deadline'])
            sup_deadline = date.fromisoformat(options['supervisor_deadline'])
            final_deadline = date.fromisoformat(options['final_deadline'])
            end_date = date.fromisoformat(options['end_date'])
        except ValueError as e:
            raise CommandError(f"Invalid date format: {e}. Please use YYYY-MM-DD.")

        cycle = ReviewCycle(
            tenant_id=tenant_id,
            name=options['name'],
            cycle_type=options['cycle_type'],
            description=options.get('description', ''),
            start_date=start_date,
            self_assessment_deadline=self_deadline,
            supervisor_review_deadline=sup_deadline,
            final_approval_deadline=final_deadline,
            end_date=end_date,
            kpi_weight=options['kpi_weight'],
            competency_weight=options['competency_weight'],
            rating_scale=scale,
            status='draft'
        )
        cycle.save()

        self.stdout.write(self.style.SUCCESS(
            f"\n[SUCCESS] Review Cycle created successfully!\n"
            f"  * ID:         {cycle.id}\n"
            f"  * Name:       {cycle.name}\n"
            f"  * Tenant ID:  {cycle.tenant_id}\n"
            f"  * Status:     {cycle.status}\n"
            f"  * Start Date: {cycle.start_date}\n"
            f"  * End Date:   {cycle.end_date}\n"
        ))

    def handle_activate(self, options):
        cycle = self._get_cycle(options)
        try:
            activated_cycle = CycleService.activate_cycle(str(cycle.id))
            self.stdout.write(self.style.SUCCESS(
                f"[SUCCESS] Activated Review Cycle '{activated_cycle.name}' (ID: {activated_cycle.id}). Status: {activated_cycle.status}"
            ))
        except Exception as e:
            raise CommandError(f"Failed to activate cycle: {e}")

    def handle_extend(self, options):
        cycle = self._get_cycle(options)
        target = options.get('target', 'all')
        days = options.get('days', 7)
        delta = timedelta(days=days)

        with transaction.atomic():
            if target in ['self', 'all']:
                cycle.self_assessment_deadline += delta
            if target in ['supervisor', 'all']:
                cycle.supervisor_review_deadline += delta
            if target in ['final', 'all']:
                cycle.final_approval_deadline += delta
            if target in ['end', 'all']:
                cycle.end_date += delta
            cycle.save()

        self.stdout.write(self.style.SUCCESS(
            f"\n[SUCCESS] Extended deadlines by {days} day(s) for cycle '{cycle.name}':\n"
            f"  * Self-Assessment Due:   {cycle.self_assessment_deadline}\n"
            f"  * Supervisor Review Due: {cycle.supervisor_review_deadline}\n"
            f"  * Final Approval Due:    {cycle.final_approval_deadline}\n"
            f"  * End Date:              {cycle.end_date}\n"
        ))

    def handle_complete(self, options):
        cycle = self._get_cycle(options)
        try:
            closed_cycle = CycleService.close_cycle(str(cycle.id))
            self.stdout.write(self.style.SUCCESS(
                f"[SUCCESS] Review Cycle '{closed_cycle.name}' completed and finalized successfully!"
            ))
        except Exception as e:
            raise CommandError(f"Failed to complete cycle: {e}")

    def handle_archive(self, options):
        cycle = self._get_cycle(options)
        try:
            archived = CycleService.archive_cycle(str(cycle.id))
            self.stdout.write(self.style.SUCCESS(f"[SUCCESS] Review Cycle '{archived.name}' archived."))
        except Exception as e:
            raise CommandError(f"Failed to archive cycle: {e}")

    def handle_unarchive(self, options):
        cycle = self._get_cycle(options)
        if cycle.status != 'archived':
            raise CommandError(f"Cycle is not archived (current status: {cycle.status}).")
        cycle.status = 'completed'
        cycle.save(update_fields=['status'])
        self.stdout.write(self.style.SUCCESS(f"[SUCCESS] Review Cycle '{cycle.name}' restored to 'completed'."))

    def handle_progress(self, options):
        cycle = self._get_cycle(options)
        prog = CycleService.get_cycle_progress(str(cycle.id))

        self.stdout.write(self.style.MIGRATE_HEADING(
            f"\n{'=' * 75}\n[CYCLE PROGRESS DASHBOARD] {cycle.name}\n{'=' * 75}"
        ))
        self.stdout.write(f"Total Eligible Employees: {prog.get('total_employees', 0)}")
        self.stdout.write(f"Overall Cycle Completion: {prog.get('overall_completion_percentage', 0)}%\n")

        self.stdout.write(f"1. Self-Assessments:")
        self.stdout.write(f"   Submitted: {prog['self_assessment']['submitted']} | Pending: {prog['self_assessment']['pending']} ({prog['self_assessment']['percentage']}%)")

        self.stdout.write(f"2. Supervisor Reviews:")
        self.stdout.write(f"   Completed: {prog['supervisor_review']['completed']} | Pending: {prog['supervisor_review']['pending']} ({prog['supervisor_review']['percentage']}%)")

        self.stdout.write(f"3. Final Ratings:")
        self.stdout.write(f"   Locked:    {prog['final_rating']['locked']} | Pending: {prog['final_rating']['pending']} ({prog['final_rating']['percentage']}%)")
        self.stdout.write("=" * 75 + "\n")

    def handle_participants(self, options):
        cycle = self._get_cycle(options)
        limit = options.get('limit', 50)
        employees = User.objects.filter(tenant_id=cycle.tenant_id, is_active=True, is_deleted=False).order_by('email')
        total = employees.count()
        employees_page = list(employees[:limit])

        self.stdout.write(self.style.MIGRATE_HEADING(
            f"\n{'=' * 95}\n[CYCLE PARTICIPANTS] {cycle.name} (Showing {len(employees_page)} of {total})\n{'=' * 95}"
        ))

        header = f"{'Employee Email':<32} {'Role':<14} {'Self-Assessment':<18} {'Supervisor Review':<20} {'Final Rating':<12}"
        self.stdout.write(self.style.NOTICE(header))
        self.stdout.write("-" * 95)

        for emp in employees_page:
            sa = SelfAssessment.objects.filter(review_cycle=cycle, employee=emp).first()
            sr = SupervisorReview.objects.filter(review_cycle=cycle, employee=emp).first()
            fr = FinalRating.objects.filter(review_cycle=cycle, employee=emp).first()

            sa_status = sa.status if sa else "Not Created"
            sr_status = sr.status if sr else "Not Created"
            fr_status = fr.status if fr else "Not Calculated"

            self.stdout.write(f"{emp.email:<32} {emp.role:<14} {sa_status:<18} {sr_status:<20} {fr_status:<12}")

        self.stdout.write("=" * 95 + "\n")

    def handle_delete(self, options):
        cycle = self._get_cycle(options)
        is_hard = options.get('hard', False)
        name = cycle.name

        if is_hard:
            cycle.delete()
            self.stdout.write(self.style.SUCCESS(f"[SUCCESS] Permanently deleted Review Cycle '{name}'."))
        else:
            cycle.deleted_at = timezone.now()
            cycle.status = 'cancelled'
            cycle.save(update_fields=['deleted_at', 'status'])
            self.stdout.write(self.style.SUCCESS(f"[SUCCESS] Soft-deleted Review Cycle '{name}'."))
