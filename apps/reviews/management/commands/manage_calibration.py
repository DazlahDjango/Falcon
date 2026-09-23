# apps/reviews/management/commands/manage_calibration.py
"""
Comprehensive Management Command for Falcon PMS Calibration Sessions & Outliers.
Handles:
- Calibration Session Actions: list, info, create, start, complete, cancel
- Rating Adjustments: add-rating, list-ratings
- Committee Comments: add-comment
- Anomaly Detection: outliers
- Reports: report

Usage:
    python manage.py manage_calibration list --cycle-id <cycle_id>
    python manage.py manage_calibration info --session-id <session_id>
    python manage.py manage_calibration create --cycle-id <cycle_id> --name "Eng Calibration" --facilitator hr@falcon.com --scheduled-date "2026-08-01 10:00"
    python manage.py manage_calibration start --session-id <session_id>
    python manage.py manage_calibration complete --session-id <session_id> --decisions "Approved all adjustments"
    python manage.py manage_calibration add-rating --session-id <session_id> --rating-id <final_rating_id> --admin hr@falcon.com --before 80 --after 85 --reason "Cross-team impact recognized"
    python manage.py manage_calibration add-comment --session-id <session_id> --author hr@falcon.com --comment "Discussion concluded."
    python manage.py manage_calibration outliers --cycle-id <cycle_id> [--threshold 1.5]
    python manage.py manage_calibration report --session-id <session_id>
"""

import sys
from datetime import datetime
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
from apps.reviews.models import (
    ReviewCycle,
    CalibrationSession,
    CalibrationRating,
    CalibrationComment,
    FinalRating
)
from apps.reviews.services.calibration.calibration_service import CalibrationService
from apps.reviews.services.calibration.outlier_detector import OutlierDetector
from apps.reviews.services.reporting.calibration_report_service import CalibrationReportService


class Command(BaseCommand):
    help = 'Comprehensive management command for Calibration Sessions, Rating Adjustments, and Outliers.'

    def add_arguments(self, parser):
        subparsers = parser.add_subparsers(dest='action', required=True, help='Action to perform')

        # ---------------- LIST ----------------
        list_p = subparsers.add_parser('list', help='List calibration sessions')
        list_p.add_argument('--cycle-id', '-c', type=str, help='Review Cycle UUID')
        list_p.add_argument('--tenant-id', '-t', type=str, help='Tenant ID')
        list_p.add_argument('--admin', '-a', type=str, help='Admin email')
        list_p.add_argument('--status', '-s', type=str, choices=['draft', 'under_review', 'completed', 'cancelled'], help='Status')
        list_p.add_argument('--limit', '-l', type=int, default=50, help='Max items to show')

        # ---------------- INFO ----------------
        info_p = subparsers.add_parser('info', help='Display calibration session details')
        info_p.add_argument('--session-id', '-i', type=str, required=True, help='Calibration Session UUID')

        # ---------------- CREATE ----------------
        create_p = subparsers.add_parser('create', help='Create a new calibration session')
        create_p.add_argument('--cycle-id', '-c', type=str, required=True, help='Review Cycle UUID')
        create_p.add_argument('--name', '-n', type=str, required=True, help='Session name')
        create_p.add_argument('--facilitator', '-f', type=str, required=True, help='Facilitator user email')
        create_p.add_argument('--scheduled-date', '-d', type=str, required=True, help='Scheduled datetime (YYYY-MM-DD HH:MM)')
        create_p.add_argument('--session-type', type=str, default='final', choices=[t[0] for t in CalibrationSession.SessionType.choices], help='Session type')
        create_p.add_argument('--agenda', type=str, default='', help='Session agenda')
        create_p.add_argument('--participants', nargs='*', default=[], help='List of participant emails')

        # ---------------- START ----------------
        start_p = subparsers.add_parser('start', help='Start a calibration session')
        start_p.add_argument('--session-id', '-i', type=str, required=True, help='Calibration Session UUID')

        # ---------------- COMPLETE ----------------
        comp_p = subparsers.add_parser('complete', help='Complete a calibration session')
        comp_p.add_argument('--session-id', '-i', type=str, required=True, help='Calibration Session UUID')
        comp_p.add_argument('--decisions', type=str, default='', help='Committee decisions summary')

        # ---------------- CANCEL ----------------
        cancel_p = subparsers.add_parser('cancel', help='Cancel a calibration session')
        cancel_p.add_argument('--session-id', '-i', type=str, required=True, help='Calibration Session UUID')

        # ---------------- ADD RATING ----------------
        add_rat_p = subparsers.add_parser('add-rating', help='Apply a calibrated score adjustment to an employee')
        add_rat_p.add_argument('--session-id', '-i', type=str, required=True, help='Calibration Session UUID')
        add_rat_p.add_argument('--rating-id', '-r', type=str, required=True, help='Final Rating UUID')
        add_rat_p.add_argument('--admin', '-a', type=str, required=True, help='Email of user making adjustment')
        add_rat_p.add_argument('--before', type=float, required=True, help='Pre-calibration score')
        add_rat_p.add_argument('--after', type=float, required=True, help='Post-calibration score')
        add_rat_p.add_argument('--reason', type=str, required=True, help='Adjustment justification')

        # ---------------- ADD COMMENT ----------------
        add_cmt_p = subparsers.add_parser('add-comment', help='Add a committee comment to session')
        add_cmt_p.add_argument('--session-id', '-i', type=str, required=True, help='Calibration Session UUID')
        add_cmt_p.add_argument('--author', type=str, required=True, help='Author email')
        add_cmt_p.add_argument('--comment', type=str, required=True, help='Comment text')

        # ---------------- OUTLIERS ----------------
        out_p = subparsers.add_parser('outliers', help='Detect performance score anomalies & outliers for a cycle')
        out_p.add_argument('--cycle-id', '-c', type=str, required=True, help='Review Cycle UUID')
        out_p.add_argument('--threshold', type=float, default=1.5, help='Z-score standard deviation threshold (default 1.5)')

        # ---------------- REPORT ----------------
        rep_p = subparsers.add_parser('report', help='Generate calibration session report')
        rep_p.add_argument('--session-id', '-i', type=str, required=True, help='Calibration Session UUID')

    def handle(self, *args, **options):
        with connection.cursor() as cursor:
            cursor.execute('SET search_path TO "public"')

        action = options['action']
        handler_map = {
            'list': self.handle_list,
            'info': self.handle_info,
            'create': self.handle_create,
            'start': self.handle_start,
            'complete': self.handle_complete,
            'cancel': self.handle_cancel,
            'add-rating': self.handle_add_rating,
            'add-comment': self.handle_add_comment,
            'outliers': self.handle_outliers,
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
        cycle_id = options.get('cycle_id')
        tenant_id = self._resolve_tenant_id(options)
        status = options.get('status')
        limit = options.get('limit', 50)

        qs = CalibrationSession.objects.filter(deleted_at__isnull=True).select_related('review_cycle', 'facilitator').order_by('-scheduled_date')
        if cycle_id:
            qs = qs.filter(review_cycle_id=cycle_id)
        if tenant_id:
            qs = qs.filter(tenant_id=tenant_id)
        if status:
            qs = qs.filter(status=status)

        total = qs.count()
        sessions = list(qs[:limit])

        self.stdout.write(self.style.MIGRATE_HEADING(
            f"\n{'=' * 105}\n[CALIBRATION SESSIONS] (Showing {len(sessions)} of {total})\n{'=' * 105}"
        ))

        header = f"{'Session Name':<30} {'Cycle':<20} {'Facilitator':<24} {'Status':<14} {'ID':<15}"
        self.stdout.write(self.style.NOTICE(header))
        self.stdout.write("-" * 105)

        for s in sessions:
            fac = s.facilitator.email if s.facilitator else 'N/A'
            st_style = self.style.SUCCESS if s.status == 'completed' else (self.style.NOTICE if s.status == 'under_review' else self.style.WARNING)
            self.stdout.write(
                f"{s.name[:28]:<30} {s.review_cycle.name[:18]:<20} "
                f"{fac[:22]:<24} {st_style(s.status):<23} {str(s.id)[:13]}.."
            )

        self.stdout.write("=" * 105 + "\n")

    def handle_info(self, options):
        session_id = options['session_id']
        try:
            session = CalibrationSession.objects.select_related('review_cycle', 'facilitator').get(id=session_id)
        except CalibrationSession.DoesNotExist:
            raise CommandError(f"CalibrationSession '{session_id}' not found.")

        adjustments = session.rating_adjustments.all().select_related('final_rating__employee', 'adjusted_by')
        comments = session.comments.all().select_related('author')
        participants = session.participants.all()

        self.stdout.write(self.style.MIGRATE_HEADING(
            f"\n{'=' * 85}\n[CALIBRATION SESSION] {session.name} ({session.review_cycle.name})\n{'=' * 85}"
        ))
        self.stdout.write(f"  * ID:              {session.id}")
        self.stdout.write(f"  * Status:          {session.get_status_display()} ({session.status})")
        self.stdout.write(f"  * Facilitator:     {session.facilitator.email if session.facilitator else 'N/A'}")
        self.stdout.write(f"  * Scheduled Date:  {session.scheduled_date}")
        self.stdout.write(f"  * Actual Start:    {session.actual_start_time or 'Not started'}")
        self.stdout.write(f"  * Actual End:      {session.actual_end_time or 'Not finished'}")
        self.stdout.write(f"  * Participants:    {', '.join([p.email for p in participants]) or 'None'}")
        self.stdout.write(f"  * Agenda:          {session.agenda or 'None'}")
        self.stdout.write(f"  * Decisions:       {session.decisions or 'None'}")

        self.stdout.write(f"\n  --- Rating Adjustments ({adjustments.count()}) ---")
        for adj in adjustments:
            diff = adj.after_score - adj.before_score
            diff_str = f"+{diff:.2f}" if diff > 0 else f"{diff:.2f}"
            self.stdout.write(f"  * {adj.final_rating.employee.email}: {adj.before_score} -> {adj.after_score} ({diff_str}) | Reason: {adj.adjustment_reason}")

        self.stdout.write(f"\n  --- Committee Comments ({comments.count()}) ---")
        for c in comments:
            auth = c.author.email if c.author else 'System'
            self.stdout.write(f"  * [{c.created_at.strftime('%H:%M')}] {auth}: {c.comment}")

        self.stdout.write("=" * 85 + "\n")

    def handle_create(self, options):
        cycle_id = options['cycle_id']
        name = options['name']
        fac_email = options['facilitator']
        sched_str = options['scheduled_date']
        session_type = options['session_type']
        agenda = options['agenda']
        participant_emails = options.get('participants', [])

        try:
            cycle = ReviewCycle.objects.get(id=cycle_id)
            fac = User.objects.get(email__iexact=fac_email, is_deleted=False)
            sched_dt = datetime.fromisoformat(sched_str)
        except Exception as e:
            raise CommandError(f"Error validating input: {e}")

        participants = list(User.objects.filter(email__in=participant_emails, is_deleted=False))

        session = CalibrationService.create_session(
            review_cycle=cycle,
            name=name,
            facilitator=fac,
            participants=participants,
            data={
                'scheduled_date': sched_dt,
                'session_type': session_type,
                'agenda': agenda,
            }
        )

        self.stdout.write(self.style.SUCCESS(
            f"\n[SUCCESS] Calibration session '{session.name}' created!\n"
            f"  * ID:           {session.id}\n"
            f"  * Cycle:        {cycle.name}\n"
            f"  * Facilitator:  {fac.email}\n"
            f"  * Scheduled:    {session.scheduled_date}\n"
        ))

    def handle_start(self, options):
        session_id = options['session_id']
        try:
            s = CalibrationService.start_session(session_id)
            self.stdout.write(self.style.SUCCESS(f"[SUCCESS] Calibration session '{s.name}' started. Status: {s.status}"))
        except Exception as e:
            raise CommandError(f"Failed to start session: {e}")

    def handle_complete(self, options):
        session_id = options['session_id']
        decisions = options.get('decisions', '')
        try:
            s = CalibrationService.complete_session(session_id, decisions=decisions)
            self.stdout.write(self.style.SUCCESS(f"[SUCCESS] Calibration session '{s.name}' completed."))
        except Exception as e:
            raise CommandError(f"Failed to complete session: {e}")

    def handle_cancel(self, options):
        session_id = options['session_id']
        try:
            s = CalibrationSession.objects.get(id=session_id)
            s.status = 'cancelled'
            s.outcome = 'cancelled'
            s.save(update_fields=['status', 'outcome'])
            self.stdout.write(self.style.SUCCESS(f"[SUCCESS] Calibration session '{s.name}' cancelled."))
        except CalibrationSession.DoesNotExist:
            raise CommandError(f"CalibrationSession '{session_id}' not found.")

    def handle_add_rating(self, options):
        session_id = options['session_id']
        rating_id = options['rating_id']
        admin_email = options['admin']
        before_score = Decimal(str(options['before']))
        after_score = Decimal(str(options['after']))
        reason = options['reason']

        try:
            admin_user = User.objects.get(email__iexact=admin_email, is_deleted=False)
        except User.DoesNotExist:
            raise CommandError(f"User '{admin_email}' not found.")

        try:
            cal_rating = CalibrationService.add_rating_adjustment(
                session_id=session_id,
                final_rating_id=rating_id,
                adjusted_by=admin_user,
                before_score=before_score,
                after_score=after_score,
                reason=reason
            )
            self.stdout.write(self.style.SUCCESS(
                f"[SUCCESS] Calibrated score for '{cal_rating.final_rating.employee.email}' updated from {before_score} to {after_score}."
            ))
        except Exception as e:
            raise CommandError(f"Failed to add calibrated rating: {e}")

    def handle_add_comment(self, options):
        session_id = options['session_id']
        author_email = options['author']
        comment_text = options['comment']

        try:
            session = CalibrationSession.objects.get(id=session_id)
            author = User.objects.get(email__iexact=author_email, is_deleted=False)
        except Exception as e:
            raise CommandError(f"Error: {e}")

        c = CalibrationComment.objects.create(
            calibration_session=session,
            author=author,
            comment=comment_text
        )
        self.stdout.write(self.style.SUCCESS(f"[SUCCESS] Added comment (ID: {c.id}) to calibration session '{session.name}'."))

    def handle_outliers(self, options):
        cycle_id = options['cycle_id']
        threshold = options.get('threshold', 1.5)

        try:
            cycle = ReviewCycle.objects.get(id=cycle_id)
        except ReviewCycle.DoesNotExist:
            raise CommandError(f"ReviewCycle '{cycle_id}' not found.")

        outliers = OutlierDetector.find_outliers(cycle, std_dev_threshold=threshold)

        self.stdout.write(self.style.MIGRATE_HEADING(
            f"\n{'=' * 95}\n[CALIBRATION OUTLIER ANOMALIES] {cycle.name} (Threshold: {threshold} StdDev)\n{'=' * 95}"
        ))

        if not outliers:
            self.stdout.write(self.style.SUCCESS("No statistical score anomalies detected in this cycle."))
            return

        header = f"{'Employee':<30} {'Department':<20} {'Score':<10} {'Dept Avg':<10} {'Z-Score':<10} {'Type':<12}"
        self.stdout.write(self.style.NOTICE(header))
        self.stdout.write("-" * 95)

        for out in outliers:
            emp = out.get('employee', 'N/A')
            dept = out.get('department', 'N/A')
            score = f"{out.get('score', 0):.2f}"
            dept_avg = f"{out.get('dept_avg', 0):.2f}"
            z_score = f"{out.get('z_score', 0):.2f}"
            out_type = out.get('type', 'Unknown')

            type_style = self.style.SUCCESS if 'high' in out_type.lower() else self.style.WARNING
            self.stdout.write(f"{emp[:28]:<30} {dept[:18]:<20} {score:<10} {dept_avg:<10} {z_score:<10} {type_style(out_type):<12}")

        self.stdout.write("=" * 95 + "\n")

    def handle_report(self, options):
        session_id = options['session_id']
        try:
            session = CalibrationSession.objects.get(id=session_id)
        except CalibrationSession.DoesNotExist:
            raise CommandError(f"CalibrationSession '{session_id}' not found.")

        report = CalibrationReportService.get_calibration_session_report(session)

        self.stdout.write(self.style.MIGRATE_HEADING(
            f"\n{'=' * 80}\n[CALIBRATION REPORT] {session.name}\n{'=' * 80}"
        ))
        self.stdout.write(f"  * Session Status:       {report.get('session_status')}")
        self.stdout.write(f"  * Total Ratings:        {report.get('total_ratings_reviewed', 0)}")
        self.stdout.write(f"  * Total Adjustments:    {report.get('total_adjustments_made', 0)}")
        self.stdout.write(f"  * Average Shift:        {report.get('average_score_shift', 0):.2f}")
        self.stdout.write(f"  * Upward Adjustments:   {report.get('upward_adjustments_count', 0)}")
        self.stdout.write(f"  * Downward Adjustments: {report.get('downward_adjustments_count', 0)}")
        self.stdout.write("=" * 80 + "\n")
