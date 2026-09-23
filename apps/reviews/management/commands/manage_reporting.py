# apps/reviews/management/commands/manage_reporting.py
"""
Comprehensive Management Command for Falcon PMS Strategic Reporting & Analytics.
Handles:
- Employee Reports: employee-summary
- Organization & Cycle Reports: org-summary, cycle-stats
- Program Reports: pip-summary, calibration-summary
- Data Export: export (CSV/JSON)

Usage:
    python manage.py manage_reporting employee-summary --employee staff@falcon.com --cycle-id <cycle_id>
    python manage.py manage_reporting org-summary --cycle-id <cycle_id> [--tenant-id <tenant_id>]
    python manage.py manage_reporting cycle-stats --cycle-id <cycle_id>
    python manage.py manage_reporting pip-summary --tenant-id <tenant_id>
    python manage.py manage_reporting calibration-summary --session-id <session_id>
    python manage.py manage_reporting export --cycle-id <cycle_id> --output ratings.csv --format csv
"""

import os
import sys
import csv
import json
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
from django.db.models import Q, Avg, Count

from apps.accounts.models import User
from apps.tenant.models import Organization
from apps.reviews.models import ReviewCycle, FinalRating, SelfAssessment, SupervisorReview, CalibrationSession, PIP
from apps.reviews.services.reporting.review_summary_service import ReviewSummaryService
from apps.reviews.services.reporting.organization_report_service import OrganizationReportService
from apps.reviews.services.reporting.pip_report_service import PIPReportService
from apps.reviews.services.reporting.calibration_report_service import CalibrationReportService
from apps.reviews.services.cycle.cycle_service import CycleService


class Command(BaseCommand):
    help = 'Comprehensive management command for Falcon PMS Performance Reports, Analytics, and Exports.'

    def add_arguments(self, parser):
        subparsers = parser.add_subparsers(dest='action', required=True, help='Action to perform')

        # ---------------- EMPLOYEE SUMMARY ----------------
        emp_p = subparsers.add_parser('employee-summary', help='Generate comprehensive employee review summary')
        emp_p.add_argument('--employee', '-e', type=str, required=True, help='Employee email')
        emp_p.add_argument('--cycle-id', '-c', type=str, required=True, help='Review Cycle UUID')

        # ---------------- ORG SUMMARY ----------------
        org_p = subparsers.add_parser('org-summary', help='Generate strategic organization performance summary')
        org_p.add_argument('--cycle-id', '-c', type=str, required=True, help='Review Cycle UUID')
        org_p.add_argument('--tenant-id', '-t', type=str, help='Tenant ID')
        org_p.add_argument('--admin', '-a', type=str, help='Admin email')

        # ---------------- CYCLE STATS ----------------
        cyc_p = subparsers.add_parser('cycle-stats', help='Generate cycle health & progress analytics')
        cyc_p.add_argument('--cycle-id', '-c', type=str, required=True, help='Review Cycle UUID')

        # ---------------- PIP SUMMARY ----------------
        pip_p = subparsers.add_parser('pip-summary', help='Generate organization-wide PIP health summary')
        pip_p.add_argument('--tenant-id', '-t', type=str, help='Tenant ID')
        pip_p.add_argument('--admin', '-a', type=str, help='Admin email')

        # ---------------- CALIBRATION SUMMARY ----------------
        cal_p = subparsers.add_parser('calibration-summary', help='Generate calibration session summary report')
        cal_p.add_argument('--session-id', '-i', type=str, required=True, help='Calibration Session UUID')

        # ---------------- EXPORT ----------------
        exp_p = subparsers.add_parser('export', help='Export cycle ratings and reviews to CSV or JSON')
        exp_p.add_argument('--cycle-id', '-c', type=str, required=True, help='Review Cycle UUID')
        exp_p.add_argument('--output', '-o', type=str, required=True, help='Output file path')
        exp_p.add_argument('--format', choices=['csv', 'json'], default='csv', help='Format (csv/json)')

    def handle(self, *args, **options):
        with connection.cursor() as cursor:
            cursor.execute('SET search_path TO "public"')

        action = options['action']
        handler_map = {
            'employee-summary': self.handle_employee_summary,
            'org-summary': self.handle_org_summary,
            'cycle-stats': self.handle_cycle_stats,
            'pip-summary': self.handle_pip_summary,
            'calibration-summary': self.handle_calibration_summary,
            'export': self.handle_export,
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

    def handle_employee_summary(self, options):
        emp_email = options['employee']
        cycle_id = options['cycle_id']

        try:
            employee = User.objects.get(email__iexact=emp_email, is_deleted=False)
            cycle = ReviewCycle.objects.get(id=cycle_id)
        except Exception as e:
            raise CommandError(f"Error: {e}")

        summary = ReviewSummaryService.get_employee_summary(employee, cycle)

        self.stdout.write(self.style.MIGRATE_HEADING(
            f"\n{'=' * 85}\n[EMPLOYEE PERFORMANCE SUMMARY] {employee.email} ({cycle.name})\n{'=' * 85}"
        ))
        
        scores = summary.get('scores', {})
        self.stdout.write(f"  * KPI Score (70%):         {scores.get('kpi_score', 'N/A')}")
        self.stdout.write(f"  * Competency Score (30%):  {scores.get('competency_score', 'N/A')}")
        self.stdout.write(f"  * Calibrated Final Score:  {scores.get('final_score', 'N/A')}")
        self.stdout.write(f"  * Rating Tier:             {scores.get('final_rating_label', 'Unrated')}")

        rec = summary.get('recommendations', {})
        self.stdout.write(f"\n  --- Recommendations ---")
        self.stdout.write(f"  * Supervisor Recommendation: {rec.get('supervisor_recommendation', 'None')}")
        self.stdout.write(f"  * Promotion Recommended:     {rec.get('promotion_recommended', False)}")
        self.stdout.write(f"  * PIP Recommended:           {rec.get('pip_recommended', False)}")

        self.stdout.write("=" * 85 + "\n")

    def handle_org_summary(self, options):
        cycle_id = options['cycle_id']
        try:
            cycle = ReviewCycle.objects.get(id=cycle_id)
        except ReviewCycle.DoesNotExist:
            raise CommandError(f"ReviewCycle '{cycle_id}' not found.")

        tenant_id = self._resolve_tenant_id(options) or cycle.tenant_id
        summary = OrganizationReportService.get_organization_summary(cycle.id, tenant_id)

        if 'error' in summary:
            raise CommandError(summary['error'])

        self.stdout.write(self.style.MIGRATE_HEADING(
            f"\n{'=' * 85}\n[ORGANIZATION STRATEGIC REPORT] {cycle.name}\n{'=' * 85}"
        ))
        comp = summary.get('completion_metrics', {})
        self.stdout.write(f"  * Total Eligible Participants: {comp.get('total_employees', 0)}")
        self.stdout.write(f"  * Self-Assessment Rate:        {comp.get('self_assessment_rate', 0)}%")
        self.stdout.write(f"  * Supervisor Review Rate:      {comp.get('supervisor_review_rate', 0)}%")
        self.stdout.write(f"  * Overall Finalized Rate:      {comp.get('overall_completion_rate', 0)}%")

        perf = summary.get('overall_performance', {})
        self.stdout.write(f"\n  --- Overall Score Averages ---")
        self.stdout.write(f"  * Average Final Score:         {perf.get('avg_overall', 0)}")
        self.stdout.write(f"  * Average KPI Component:       {perf.get('avg_kpi', 0)}")
        self.stdout.write(f"  * Average Competency Score:    {perf.get('avg_competency', 0)}")
        self.stdout.write(f"  * Score Standard Deviation:    {perf.get('std_dev', 0)}")

        self.stdout.write("=" * 85 + "\n")

    def handle_cycle_stats(self, options):
        cycle_id = options['cycle_id']
        try:
            cycle = ReviewCycle.objects.get(id=cycle_id)
        except ReviewCycle.DoesNotExist:
            raise CommandError(f"ReviewCycle '{cycle_id}' not found.")

        prog = CycleService.get_cycle_progress(str(cycle.id))

        self.stdout.write(self.style.MIGRATE_HEADING(
            f"\n{'=' * 80}\n[CYCLE HEALTH & PROGRESS] {cycle.name}\n{'=' * 80}"
        ))
        self.stdout.write(f"  * Start Date:            {cycle.start_date}")
        self.stdout.write(f"  * End Date:              {cycle.end_date}")
        self.stdout.write(f"  * Status:                {cycle.status}")
        self.stdout.write(f"  * Total Employees:       {prog.get('total_employees', 0)}")
        self.stdout.write(f"  * Self-Assessments:      {prog.get('self_assessment', {}).get('submitted', 0)} ({prog.get('self_assessment', {}).get('percentage', 0)}%)")
        self.stdout.write(f"  * Supervisor Reviews:    {prog.get('supervisor_review', {}).get('completed', 0)} ({prog.get('supervisor_review', {}).get('percentage', 0)}%)")
        self.stdout.write(f"  * Final Ratings Locked:  {prog.get('final_rating', {}).get('locked', 0)} ({prog.get('final_rating', {}).get('percentage', 0)}%)")
        self.stdout.write(f"  * Overall Completion:    {prog.get('overall_completion_percentage', 0)}%")
        self.stdout.write("=" * 80 + "\n")

    def handle_pip_summary(self, options):
        tenant_id = self._resolve_tenant_id(options)
        if not tenant_id:
            raise CommandError("Please specify tenant via --tenant-id or --admin.")

        summary = PIPReportService.get_organization_pip_summary(tenant_id)

        self.stdout.write(self.style.MIGRATE_HEADING(
            f"\n{'=' * 80}\n[ORGANIZATION PIP HEALTH SUMMARY]\n{'=' * 80}"
        ))
        self.stdout.write(f"  * Total PIPs Created:    {summary.get('total_pips', 0)}")
        self.stdout.write(f"  * Active PIPs:           {summary.get('active_pips', 0)}")
        self.stdout.write(f"  * Overdue PIPs:          {summary.get('overdue_pips', 0)}")
        self.stdout.write(f"  * Ending Soon (14 days): {summary.get('ending_soon_pips', 0)}")
        self.stdout.write(f"  * Success Rate:          {summary.get('success_rate', 0)}%")
        self.stdout.write(f"  * Avg Milestone Progress:{summary.get('average_completion_rate', 0)}%")
        self.stdout.write("=" * 80 + "\n")

    def handle_calibration_summary(self, options):
        session_id = options['session_id']
        try:
            session = CalibrationSession.objects.get(id=session_id)
        except CalibrationSession.DoesNotExist:
            raise CommandError(f"CalibrationSession '{session_id}' not found.")

        report = CalibrationReportService.get_calibration_session_report(session)

        self.stdout.write(self.style.MIGRATE_HEADING(
            f"\n{'=' * 80}\n[CALIBRATION IMPACT SUMMARY] {session.name}\n{'=' * 80}"
        ))
        self.stdout.write(f"  * Status:                {report.get('session_status')}")
        self.stdout.write(f"  * Total Evaluated:       {report.get('total_ratings_reviewed', 0)}")
        self.stdout.write(f"  * Total Calibrated:      {report.get('total_adjustments_made', 0)}")
        self.stdout.write(f"  * Upward Adjustments:    {report.get('upward_adjustments_count', 0)}")
        self.stdout.write(f"  * Downward Adjustments:  {report.get('downward_adjustments_count', 0)}")
        self.stdout.write(f"  * Average Score Shift:   {report.get('average_score_shift', 0):.2f}")
        self.stdout.write("=" * 80 + "\n")

    def handle_export(self, options):
        cycle_id = options['cycle_id']
        output_path = options['output']
        out_fmt = options.get('format', 'csv')

        try:
            cycle = ReviewCycle.objects.get(id=cycle_id)
        except ReviewCycle.DoesNotExist:
            raise CommandError(f"ReviewCycle '{cycle_id}' not found.")

        ratings = FinalRating.objects.filter(review_cycle=cycle).select_related('employee')
        count = ratings.count()

        data = []
        for r in ratings:
            data.append({
                'id': str(r.id),
                'cycle_name': cycle.name,
                'employee_email': r.employee.email,
                'employee_name': f"{r.employee.first_name} {r.employee.last_name}".strip(),
                'kpi_score': float(r.kpi_score) if r.kpi_score is not None else '',
                'competency_score': float(r.competency_score) if r.competency_score is not None else '',
                'coefficient_applied': float(r.coefficient_applied) if r.coefficient_applied is not None else 1.0,
                'final_score': float(r.final_score) if r.final_score is not None else '',
                'rating_label': r.final_rating_label or '',
                'promotion_recommended': r.promotion_recommended,
                'pip_recommended': r.pip_recommended,
                'status': r.status,
            })

        os.makedirs(os.path.dirname(os.path.abspath(output_path)) or '.', exist_ok=True)

        if out_fmt == 'csv':
            with open(output_path, 'w', newline='', encoding='utf-8') as f:
                if data:
                    writer = csv.DictWriter(f, fieldnames=data[0].keys())
                    writer.writeheader()
                    writer.writerows(data)
        elif out_fmt == 'json':
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, default=str)

        self.stdout.write(self.style.SUCCESS(
            f"[SUCCESS] Exported {count} ratings for cycle '{cycle.name}' to '{output_path}' ({out_fmt.upper()})."
        ))
