# apps/reportplt/services/extraction/production/reviews_extractor.py
"""
Reviews Reporting Extractors — real-data extraction for the Falcon PMS reporting pipeline.

Contract (matches KPI extractor shape so the ReportGenerator / ChartRenderer /
PivotBuilder / DataAggregator all work unchanged):

    {
        'status': 'Completed' | 'Failed',
        'source': 'reviews',
        'extracted_at': ISO8601,
        'metrics': {...},            # flat scalars
        'charts': [...],             # ChartRenderer-ready
        'tables': [...],             # PivotBuilder-ready
        'executive_summary': str,
        'kpis': [...],               # synthetic rows so ChartRenderer/PivotBuilder
                                     # don't no-op (they look for data['kpis'])
        'raw_data': {...},           # full nested payload
        'errors': [...],             # per-extractor soft failures, never silent
    }

Role-aware scoping
------------------
All extractors accept filters:
    - scope: 'auto' | 'self' | 'team' | 'department' | 'organization'
      'auto' derives from actor role (staff -> self, manager -> team,
      HR/admin/exec -> organization).
    - actor_id: UUID of the requesting user. Required when scope != 'organization'.
    - cycle_id: UUID of the ReviewCycle. Falls back to newest open cycle.
    - year: int. Used as a fallback cycle selector if cycle_id is absent.

Resolved filters are put on self.resolved_filters and echoed in raw_data.

Tenant safety
-------------
Every model query filters tenant_id where the model has that field.
CalibrationRating, CalibrationAgendaItem, CalibrationComment are NOT
tenant-scoped at the model level (they're plain models.Model). We filter them
via their tenant-scoped parents (calibration_session__tenant_id, etc.).

Field bug fixes vs previous draft
---------------------------------
- CalibrationRating.adjustment_amount does not exist. Computed in Python
  from before_score/after_score (or read from the service that already does
  this: CalibrationReportService.get_cycle_calibration_summary).
- PromotionRecommendation.recommendation does not exist. Uses status.
- PIP status does not have 'active'/'extended'. Uses ReviewStatusMixin
  Status values; 'extended' is a PIP.Outcome, not a status.
- CalibrationRating has no tenant_id. Filtered via calibration_session.
"""

import logging
from decimal import Decimal, InvalidOperation
from typing import Any, Dict, Iterable, List, Optional

from django.db.models import Avg, Count, Q, StdDev, Sum
from django.utils import timezone

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

# Which ReviewCycle statuses count as "open" for auto-selection.
OPEN_CYCLE_STATUSES = ['draft', 'submitted', 'under_review']

# Which ReviewStatusMixin statuses count as an active PIP.
# (The model does NOT have 'active' or 'extended' statuses.)
ACTIVE_PIP_STATUSES = ['draft', 'submitted', 'under_review']

# Manager-ish role names that should default to team scope, not self scope.
MANAGER_ROLES = {
    'manager', 'supervisor', 'team_lead', 'team lead', 'lead',
    'section_lead', 'unit_lead', 'director', 'head',
}

# Roles that default to full-tenant organization scope.
ORG_ROLES = {
    'hr_admin', 'hr admin', 'hr', 'people_ops', 'people ops',
    'admin', 'client_admin', 'super_admin', 'superadmin',
    'executive', 'ceo', 'coo', 'cfo', 'cto', 'dashboard_champion',
}


# ---------------------------------------------------------------------------
# Shared helpers
# ---------------------------------------------------------------------------

def _get_user_info_map(user_ids: List[Any], tenant_id: Optional[str] = None) -> Dict[str, Dict[str, Any]]:
    """
    Bulk resolve user UUIDs into display info. No N+1.
    Returns { '<uuid>': {id, full_name, email, role, position_title,
                          department_name, division_name} }.
    """
    from apps.accounts.models import User

    valid_ids = [uid for uid in user_ids if uid]
    if not valid_ids:
        return {}

    users = User.objects.filter(id__in=valid_ids)
    if tenant_id:
        users = users.filter(tenant_id=tenant_id)

    result: Dict[str, Dict[str, Any]] = {}

    # Try to enrich via Employment (structure app) — optional.
    emp_map: Dict[str, Any] = {}
    try:
        from apps.structure.models import Employment
        employments = Employment.objects.filter(
            user_id__in=valid_ids, is_current=True, is_active=True,
        ).select_related('position', 'position__department', 'position__division')
        if tenant_id:
            employments = employments.filter(tenant_id=tenant_id)
        emp_map = {str(e.user_id): e for e in employments}
    except Exception:
        # Structure app not available or field mismatch — degrade gracefully.
        emp_map = {}

    for u in users:
        uid = str(u.id)
        emp = emp_map.get(uid)
        pos = emp.position if emp else None

        full_name = ''
        try:
            full_name = (u.get_full_name() or '').strip()
        except Exception:
            full_name = ''
        if not full_name:
            full_name = getattr(u, 'username', '') or getattr(u, 'email', '') or uid

        # User.department is a CharField per Reviews comments; prefer the
        # Employment-driven department name if available.
        dept_name = ''
        if pos and getattr(pos, 'department', None):
            dept_name = getattr(pos.department, 'name', '') or ''
        if not dept_name:
            dept_name = getattr(u, 'department', '') or ''

        div_name = ''
        if pos and getattr(pos, 'division', None):
            div_name = getattr(pos.division, 'name', '') or ''

        result[uid] = {
            'id': uid,
            'full_name': full_name,
            'email': getattr(u, 'email', '') or '',
            'role': getattr(u, 'role', '') or '',
            'position_title': getattr(pos, 'title', '') if pos else '',
            'department_name': dept_name,
            'division_name': div_name,
        }
    return result


def _to_float(value, default: Optional[float] = 0.0) -> Optional[float]:
    if value is None:
        return default
    try:
        if isinstance(value, Decimal):
            return float(value)
        return float(value)
    except (TypeError, ValueError, InvalidOperation):
        return default


def _round(value, digits: int = 2, default: Optional[float] = None) -> Optional[float]:
    if value is None:
        return default
    try:
        return round(float(value), digits)
    except (TypeError, ValueError):
        return default


def _safe_divide(numerator, denominator, default: float = 0.0) -> float:
    try:
        if not denominator:
            return default
        return float(numerator) / float(denominator)
    except (TypeError, ValueError, ZeroDivisionError):
        return default


def _pct(numerator, denominator, digits: int = 1) -> float:
    return round(_safe_divide(numerator, denominator) * 100.0, digits)


# ---------------------------------------------------------------------------
# Base extractor
# ---------------------------------------------------------------------------

class ReviewsBaseExtractor:
    """
    Shared machinery:
      - resolve tenant
      - resolve cycle (explicit cycle_id, else year, else newest open cycle)
      - resolve role-based scope (self / team / department / organization)
      - shape() to emit the standard payload
    """

    report_type: str = 'reviews_generic'
    title: str = 'Reviews Report'

    def __init__(self, tenant_id: Optional[str] = None, filters: Optional[Dict] = None):
        self.tenant_id = str(tenant_id) if tenant_id else None
        self.filters = dict(filters or {})
        self.errors: List[Dict[str, Any]] = []
        self.resolved_scope: Dict[str, Any] = {
            'scope': 'organization',
            'actor_id': None,
            'actor_role': None,
            'user_ids': [],
        }
        self.cycle = None

    # -------- cycle resolution ---------------------------------------------

    def _resolve_cycle(self):
        """Pick the ReviewCycle this report is about. Never raises."""
        from apps.reviews.models import ReviewCycle

        qs = ReviewCycle.objects.all()
        if self.tenant_id:
            qs = qs.filter(tenant_id=self.tenant_id)

        cycle_id = self.filters.get('cycle_id')
        if cycle_id:
            cycle = qs.filter(id=cycle_id).first()
            if cycle:
                return cycle
            self._error('cycle', f'cycle_id={cycle_id} not found in tenant; falling back')

        year = self.filters.get('year')
        if year:
            try:
                year_int = int(year)
                cycle = qs.filter(start_date__year=year_int).order_by('-start_date').first()
                if cycle:
                    return cycle
                cycle = qs.filter(end_date__year=year_int).order_by('-start_date').first()
                if cycle:
                    return cycle
            except (TypeError, ValueError):
                self._error('cycle', f'invalid year filter: {year!r}')

        # Newest open cycle, else newest cycle.
        cycle = qs.filter(status__in=OPEN_CYCLE_STATUSES).order_by('-start_date').first()
        if cycle:
            return cycle
        return qs.order_by('-start_date').first()

    # -------- scope resolution ---------------------------------------------

    def _resolve_scope(self):
        """
        Determine the set of user IDs whose reviews are in scope.
        Falls back to organization scope on any resolution failure.
        """
        from apps.accounts.models import User

        scope = str(self.filters.get('scope') or 'auto').lower()
        actor_id = self.filters.get('actor_id') or self.filters.get('user_id')

        actor = None
        if actor_id:
            actor_qs = User.objects.filter(id=actor_id)
            if self.tenant_id:
                actor_qs = actor_qs.filter(tenant_id=self.tenant_id)
            actor = actor_qs.first()

        if scope == 'auto':
            if actor is None:
                scope = 'organization'
            else:
                role = str(getattr(actor, 'role', '') or '').lower()
                if getattr(actor, 'is_superuser', False) or role in ORG_ROLES:
                    scope = 'organization'
                elif role in MANAGER_ROLES:
                    scope = 'team'
                else:
                    # A plain manager-link (direct_reports) trumps role string.
                    if hasattr(actor, 'direct_reports') and actor.direct_reports.exists():
                        scope = 'team'
                    else:
                        scope = 'self'

        user_ids: List[str] = []

        if scope == 'self':
            if actor is None:
                self._error('scope', "scope='self' requires actor_id")
                scope = 'organization'
            else:
                user_ids = [str(actor.id)]

        elif scope == 'team':
            if actor is None:
                self._error('scope', "scope='team' requires actor_id")
                scope = 'organization'
            else:
                report_ids = set()
                try:
                    if hasattr(actor, 'get_direct_reports'):
                        report_ids.update(
                            str(x) for x in actor.get_direct_reports().values_list('id', flat=True)
                        )
                    elif hasattr(actor, 'direct_reports'):
                        report_ids.update(
                            str(x) for x in actor.direct_reports.values_list('id', flat=True)
                        )
                except Exception as e:
                    self._error('scope', f'direct_reports lookup failed: {e}')

                # Include the manager themselves so their own review shows up too.
                report_ids.add(str(actor.id))
                user_ids = list(report_ids)

                if len(user_ids) <= 1:
                    self._error('scope', 'no direct reports found; falling back to self scope')

        elif scope == 'department':
            dept_id = self.filters.get('department_id')
            if not dept_id:
                # Derive from actor's department if possible.
                if actor is not None:
                    dept_id = getattr(actor, 'department_id', None) or getattr(actor, 'department', None)
                if dept_id and hasattr(dept_id, 'id'):
                    dept_id = dept_id.id
            if not dept_id:
                self._error('scope', "scope='department' requires department_id")
                scope = 'organization'
            else:
                try:
                    dept_users = User.objects.filter(tenant_id=self.tenant_id) if self.tenant_id else User.objects.all()
                    dept_users = dept_users.filter(department_id=dept_id, is_active=True)
                    user_ids = [str(x) for x in dept_users.values_list('id', flat=True)]
                except Exception as e:
                    self._error('scope', f'department user lookup failed: {e}')
                    scope = 'organization'

        # organization: leave user_ids empty (means "all in tenant")

        self.resolved_scope = {
            'scope': scope,
            'actor_id': str(actor.id) if actor else None,
            'actor_role': (getattr(actor, 'role', '') if actor else None),
            'user_ids': user_ids,
        }

    # -------- payload shaping ----------------------------------------------

    def _shape(
        self,
        *,
        metrics: Dict[str, Any],
        charts: Optional[List[Dict]] = None,
        tables: Optional[List[Dict]] = None,
        executive_summary: str = '',
        raw_data: Optional[Dict] = None,
        kpis: Optional[List[Dict]] = None,
    ) -> Dict[str, Any]:
        """
        Emit the standard payload. The ReportGenerator will lift `metrics`,
        `executive_summary`, `charts`, `tables`, and `kpis` off this dict.
        """
        cycle = self.cycle
        return {
            'status': 'Completed' if not self.errors else 'CompletedWithErrors',
            'source': 'reviews',
            'report_type': self.report_type,
            'title': self.title,
            'extracted_at': timezone.now().isoformat(),
            'cycle': {
                'id': str(cycle.id) if cycle else None,
                'name': getattr(cycle, 'name', None) if cycle else None,
                'status': getattr(cycle, 'status', None) if cycle else None,
            },
            'scope': self.resolved_scope,
            'metrics': metrics or {},
            'charts': charts or [],
            'tables': tables or [],
            'kpis': kpis or [],
            'executive_summary': executive_summary or self._default_summary(metrics),
            'raw_data': raw_data or {},
            'errors': list(self.errors),
        }

    def _default_summary(self, metrics: Dict[str, Any]) -> str:
        cycle_name = getattr(self.cycle, 'name', 'the current cycle') if self.cycle else 'the current cycle'
        return f"{self.title} generated for {cycle_name}."

    def _error(self, where: str, message: str) -> None:
        self.errors.append({'where': where, 'message': str(message)})
        logger.warning('[reviews_extractor:%s] %s: %s', self.report_type, where, message)

    def _apply_user_scope(self, qs, field: str = 'employee_id'):
        """Apply resolved user_ids to a queryset. No-op for organization scope."""
        ids = self.resolved_scope.get('user_ids') or []
        if ids:
            return qs.filter(**{f'{field}__in': ids})
        return qs

    # -------- lifecycle -----------------------------------------------------

    def extract(self) -> Dict[str, Any]:
        raise NotImplementedError


# ---------------------------------------------------------------------------
# 1. Individual Summary
# ---------------------------------------------------------------------------

class ReviewsIndividualSummaryExtractor(ReviewsBaseExtractor):
    """Per-employee scorecard across a cycle, respecting role scope."""

    report_type = 'reviews_individual_summary'
    title = 'Individual Review Scorecards'

    def extract(self) -> Dict[str, Any]:
        from apps.reviews.models import FinalRating

        self.cycle = self._resolve_cycle()
        self._resolve_scope()

        if not self.cycle:
            return self._shape(
                metrics={'total_evaluated_employees': 0},
                executive_summary='No review cycle found for the given filters.',
                raw_data={'cycle_found': False},
            )

        qs = FinalRating.objects.filter(review_cycle=self.cycle)
        if self.tenant_id:
            qs = qs.filter(tenant_id=self.tenant_id)
        qs = self._apply_user_scope(qs, 'employee_id')
        qs = qs.select_related('employee', 'review_cycle')

        total = qs.count()

        # Bulk-resolve user info once.
        user_ids = list(qs.values_list('employee_id', flat=True))
        user_map = _get_user_info_map(user_ids, self.tenant_id)

        rows: List[Dict[str, Any]] = []
        kpi_rows: List[Dict[str, Any]] = []
        distribution: Dict[str, int] = {}
        score_sum = 0.0
        score_count = 0
        promotion_ready = 0
        pip_flagged = 0

        for r in qs.order_by('-final_score'):
            emp = r.employee
            emp_id = str(emp.id) if emp else ''
            info = user_map.get(emp_id, {})

            final_score = _to_float(r.final_score)
            kpi_score = _to_float(r.kpi_score)
            comp_score = _to_float(r.competency_score)

            label = r.final_rating_label or 'Not Rated'
            distribution[label] = distribution.get(label, 0) + 1

            if final_score is not None and r.final_score is not None:
                score_sum += final_score
                score_count += 1

            if getattr(r, 'promotion_recommended', False):
                promotion_ready += 1
            if getattr(r, 'pip_recommended', False):
                pip_flagged += 1

            row = {
                'rating_id': str(r.id),
                'employee_id': emp_id,
                'employee_name': info.get('full_name', '') or (emp.get_full_name() if emp else 'Unknown'),
                'employee_email': info.get('email', '') or (getattr(emp, 'email', '') if emp else ''),
                'position_title': info.get('position_title', ''),
                'department': info.get('department_name', ''),
                'division': info.get('division_name', ''),
                'kpi_score': kpi_score,
                'competency_score': comp_score,
                'final_score': final_score,
                'rating_label': label,
                'rating_color': r.final_rating_color or 'gray',
                'status': r.status,
                'coefficient_applied': _to_float(r.coefficient_applied, default=1.0),
                'promotion_recommended': bool(getattr(r, 'promotion_recommended', False)),
                'pip_recommended': bool(getattr(r, 'pip_recommended', False)),
            }
            rows.append(row)

            # Synthetic KPI-shaped row so ChartRenderer/PivotBuilder don't no-op.
            kpi_rows.append({
                'id': emp_id or str(r.id),
                'name': row['employee_name'],
                'department': row['department'] or 'Unassigned',
                'category': label,
                'status': self._status_from_score(final_score),
                'progress': final_score if final_score is not None else 0.0,
                'target': 100.0,
                'actual': final_score if final_score is not None else 0.0,
                'period': self.cycle.name,
            })

        avg_final = _round(_safe_divide(score_sum, score_count), 2)

        metrics = {
            'total_evaluated_employees': total,
            'average_final_score': avg_final,
            'promotion_ready_count': promotion_ready,
            'pip_flagged_count': pip_flagged,
            'rating_distribution': distribution,
        }

        charts = [
            {
                'type': 'bar',
                'title': 'Top Employees by Final Score',
                'data': {
                    'labels': [r['employee_name'][:18] for r in rows[:10]],
                    'values': [r['final_score'] for r in rows[:10]],
                    'colors': ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
                               '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16'],
                },
            },
            {
                'type': 'pie',
                'title': 'Rating Distribution',
                'data': {
                    'labels': list(distribution.keys()),
                    'values': list(distribution.values()),
                    'colors': ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#94a3b8'],
                },
            },
        ]

        tables = [
            {
                'title': 'Individual Review Scorecards',
                'columns': ['Employee', 'Department', 'KPI', 'Competency', 'Final', 'Rating', 'Status'],
                'rows': [
                    [r['employee_name'], r['department'], r['kpi_score'], r['competency_score'],
                     r['final_score'], r['rating_label'], r['status']]
                    for r in rows[:100]
                ],
            },
        ]

        summary = (
            f"Evaluated {total} employees in {self.cycle.name} with an average final score of "
            f"{avg_final if avg_final is not None else 'n/a'}%. "
            f"{promotion_ready} promotion recommendation(s); {pip_flagged} PIP flag(s)."
        )

        return self._shape(
            metrics=metrics,
            charts=charts,
            tables=tables,
            executive_summary=summary,
            raw_data={
                'cycle_id': str(self.cycle.id),
                'scope': self.resolved_scope,
                'scorecards': rows,
            },
            kpis=kpi_rows,
        )

    @staticmethod
    def _status_from_score(score: Optional[float]) -> str:
        if score is None:
            return 'Pending'
        if score >= 80:
            return 'On Track'
        if score >= 60:
            return 'At Risk'
        return 'Off Track'


# ---------------------------------------------------------------------------
# 2. Cycle Compliance
# ---------------------------------------------------------------------------

class ReviewsCycleComplianceExtractor(ReviewsBaseExtractor):
    """Submission / approval / lock compliance and department-level matrix."""

    report_type = 'reviews_cycle_compliance'
    title = 'Review Cycle Compliance'

    def extract(self) -> Dict[str, Any]:
        from apps.reviews.models import FinalRating, SelfAssessment, SupervisorReview
        from apps.reviews.services.cycle.cycle_service import CycleService

        self.cycle = self._resolve_cycle()
        self._resolve_scope()

        if not self.cycle:
            return self._shape(
                metrics={'total_participants': 0},
                executive_summary='No review cycle found for the given filters.',
                raw_data={'cycle_found': False},
            )

        # Delegate to CycleService where possible.
        progress: Dict[str, Any] = {}
        try:
            progress = CycleService.get_cycle_progress(self.cycle.id) or {}
        except Exception as e:
            self._error('CycleService.get_cycle_progress', e)

        # Scope-aware direct counts.
        self_qs = SelfAssessment.objects.filter(review_cycle=self.cycle)
        sup_qs = SupervisorReview.objects.filter(review_cycle=self.cycle)
        final_qs = FinalRating.objects.filter(review_cycle=self.cycle)
        if self.tenant_id:
            self_qs = self_qs.filter(tenant_id=self.tenant_id)
            sup_qs = sup_qs.filter(tenant_id=self.tenant_id)
            final_qs = final_qs.filter(tenant_id=self.tenant_id)
        self_qs = self._apply_user_scope(self_qs, 'employee_id')
        sup_qs = self._apply_user_scope(sup_qs, 'employee_id')
        final_qs = self._apply_user_scope(final_qs, 'employee_id')

        self_submitted = self_qs.filter(status='submitted').count()
        sup_approved = sup_qs.filter(status='approved').count()
        ratings_locked = final_qs.filter(status='locked').count()

        # Total participants = the union of employees appearing anywhere.
        participant_ids = set(self_qs.values_list('employee_id', flat=True))
        participant_ids |= set(sup_qs.values_list('employee_id', flat=True))
        participant_ids |= set(final_qs.values_list('employee_id', flat=True))
        total_participants = len(participant_ids) or int(progress.get('total_employees', 0) or 0)

        self_rate = _pct(self_submitted, total_participants)
        sup_rate = _pct(sup_approved, total_participants)
        overall_rate = _pct(ratings_locked, total_participants)

        # Department matrix (via final ratings, which have employee FK).
        dept_rows = []
        try:
            dept_matrix = (
                final_qs.filter(employee__department__isnull=False)
                .values('employee__department__name')
                .annotate(
                    total=Count('id'),
                    locked=Count('id', filter=Q(status='locked')),
                    avg_score=Avg('final_score'),
                )
                .order_by('-total')
            )
            for d in dept_matrix:
                total = d.get('total', 0) or 0
                locked = d.get('locked', 0) or 0
                dept_rows.append({
                    'department': d.get('employee__department__name') or 'Unassigned',
                    'total': total,
                    'locked': locked,
                    'completion_rate_pct': _pct(locked, total),
                    'avg_score': _round(d.get('avg_score'), 1, 0.0),
                })
        except Exception as e:
            # User.department may be a CharField; group via that instead.
            self._error('department_matrix', e)

        metrics = {
            'cycle_name': self.cycle.name,
            'cycle_status': self.cycle.status,
            'start_date': self.cycle.start_date.isoformat() if self.cycle.start_date else None,
            'end_date': self.cycle.end_date.isoformat() if self.cycle.end_date else None,
            'total_participants': total_participants,
            'self_submitted': self_submitted,
            'supervisor_approved': sup_approved,
            'ratings_locked': ratings_locked,
            'self_completion_rate_pct': self_rate,
            'supervisor_completion_rate_pct': sup_rate,
            'overall_completion_rate_pct': overall_rate,
        }

        charts = [
            {
                'type': 'pie',
                'title': 'Cycle Completion by Stage',
                'data': {
                    'labels': ['Self Submitted', 'Supervisor Approved', 'Ratings Locked',
                               'Remaining'],
                    'values': [
                        self_submitted,
                        sup_approved,
                        ratings_locked,
                        max(total_participants - ratings_locked, 0),
                    ],
                    'colors': ['#3b82f6', '#10b981', '#8b5cf6', '#94a3b8'],
                },
            },
        ]

        tables = [
            {
                'title': 'Cycle Stage Completion',
                'columns': ['Stage', 'Completed', 'Total', 'Rate %'],
                'rows': [
                    ['Self Assessment Submitted', self_submitted, total_participants, self_rate],
                    ['Supervisor Review Approved', sup_approved, total_participants, sup_rate],
                    ['Final Ratings Locked', ratings_locked, total_participants, overall_rate],
                ],
            },
        ]
        if dept_rows:
            tables.append({
                'title': 'Department Compliance',
                'columns': ['Department', 'Total', 'Locked', 'Completion %', 'Avg Score'],
                'rows': [
                    [d['department'], d['total'], d['locked'], d['completion_rate_pct'], d['avg_score']]
                    for d in dept_rows
                ],
            })

        summary = (
            f"Cycle {self.cycle.name}: {overall_rate}% overall completion "
            f"({ratings_locked}/{total_participants} ratings locked). "
            f"Self-assessment: {self_rate}%, Supervisor approval: {sup_rate}%."
        )

        return self._shape(
            metrics=metrics,
            charts=charts,
            tables=tables,
            executive_summary=summary,
            raw_data={
                'cycle_id': str(self.cycle.id),
                'cycle_progress_service': progress,
                'department_compliance': dept_rows,
            },
            kpis=[],
        )


# ---------------------------------------------------------------------------
# 3. Organization Performance
# ---------------------------------------------------------------------------

class ReviewsOrganizationPerformanceExtractor(ReviewsBaseExtractor):
    """Tenant strategic performance: bell curve, competency strengths/weaknesses, dept ranking."""

    report_type = 'reviews_organization_performance'
    title = 'Organization Performance'

    def extract(self) -> Dict[str, Any]:
        from apps.reviews.models import FinalRating, CompetencyRating

        self.cycle = self._resolve_cycle()
        # Organization performance is intentionally tenant-wide; scope is ignored
        # except to record it.
        self._resolve_scope()

        if not self.cycle:
            return self._shape(
                metrics={'total_rated_employees': 0},
                executive_summary='No review cycle found for the given filters.',
                raw_data={'cycle_found': False},
            )

        qs = FinalRating.objects.filter(review_cycle=self.cycle)
        if self.tenant_id:
            qs = qs.filter(tenant_id=self.tenant_id)

        total_rated = qs.count()
        agg = qs.aggregate(
            overall=Avg('final_score'),
            kpi=Avg('kpi_score'),
            competency=Avg('competency_score'),
            std_dev=StdDev('final_score'),
        )

        avg_overall = _round(agg.get('overall'), 1, 0.0)
        avg_kpi = _round(agg.get('kpi'), 1, 0.0)
        avg_competency = _round(agg.get('competency'), 1, 0.0)
        std_dev = _round(agg.get('std_dev'), 1, 0.0)

        # Rating distribution
        dist_qs = (
            qs.values('final_rating_label', 'final_rating_color')
            .annotate(count=Count('id'))
            .order_by('-count')
        )
        distribution = []
        for d in dist_qs:
            count = d.get('count', 0) or 0
            distribution.append({
                'label': d.get('final_rating_label') or 'Not Rated',
                'color': d.get('final_rating_color') or 'gray',
                'count': count,
                'percentage': _pct(count, total_rated),
            })

        # Competency strengths / weaknesses
        comp_qs = CompetencyRating.objects.filter(
            supervisor_review__review_cycle=self.cycle,
            raw_score__isnull=False,
        )
        if self.tenant_id:
            comp_qs = comp_qs.filter(tenant_id=self.tenant_id)

        strongest, weakest = [], []
        if comp_qs.exists():
            comp_avgs = list(
                comp_qs.values('competency__name')
                .annotate(avg_score=Avg('raw_score'))
                .order_by('-avg_score')
            )
            for item in comp_avgs[:5]:
                s = _to_float(item.get('avg_score'), 0.0) or 0.0
                strongest.append({
                    'name': item.get('competency__name'),
                    'score': _round(s, 2, 0.0),
                    'percentage': _round(_safe_divide(s, 5.0) * 100, 1, 0.0),
                })
            for item in comp_avgs[-5:]:
                s = _to_float(item.get('avg_score'), 0.0) or 0.0
                weakest.append({
                    'name': item.get('competency__name'),
                    'score': _round(s, 2, 0.0),
                    'percentage': _round(_safe_divide(s, 5.0) * 100, 1, 0.0),
                })
            # Reverse weakest so lowest appears first.
            weakest.reverse()

        # Department ranking
        dept_rows = []
        try:
            dept_qs = (
                qs.filter(employee__department__isnull=False)
                .values('employee__department__name')
                .annotate(avg_score=Avg('final_score'), count=Count('id'))
                .order_by('-avg_score')
            )
            for d in dept_qs:
                score = _round(d.get('avg_score'), 1, 0.0) or 0.0
                dept_rows.append({
                    'department': d.get('employee__department__name') or 'Unassigned',
                    'count': d.get('count', 0) or 0,
                    'avg_score': score,
                    'variance': _round(score - (avg_overall or 0.0), 1, 0.0),
                })
        except Exception as e:
            self._error('dept_ranking', e)

        metrics = {
            'cycle_name': self.cycle.name,
            'total_rated_employees': total_rated,
            'avg_overall_score': avg_overall,
            'avg_kpi_score': avg_kpi,
            'avg_competency_score': avg_competency,
            'std_dev': std_dev,
            'strongest_competencies': strongest,
            'weakest_competencies': weakest,
        }

        charts = [
            {
                'type': 'bar',
                'title': 'Rating Distribution',
                'data': {
                    'labels': [d['label'] for d in distribution],
                    'values': [d['count'] for d in distribution],
                    'colors': [d['color'] or '#2563eb' for d in distribution],
                },
            },
            {
                'type': 'bar',
                'title': 'Department Average Score',
                'data': {
                    'labels': [d['department'][:18] for d in dept_rows[:8]],
                    'values': [d['avg_score'] for d in dept_rows[:8]],
                    'colors': ['#2563eb', '#10b981', '#f59e0b', '#ef4444',
                               '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'],
                },
            },
        ]

        tables = [
            {
                'title': 'Rating Distribution',
                'columns': ['Rating Label', 'Count', 'Percentage'],
                'rows': [[d['label'], d['count'], f"{d['percentage']}%"] for d in distribution],
            },
            {
                'title': 'Department Rankings',
                'columns': ['Department', 'Employees', 'Avg Score', 'Variance'],
                'rows': [[d['department'], d['count'], d['avg_score'], d['variance']] for d in dept_rows],
            },
        ]

        summary = (
            f"Organization performance for {self.cycle.name}: average final score "
            f"{avg_overall}% (KPI {avg_kpi}%, Competency {avg_competency}%, std dev {std_dev}). "
            f"{total_rated} employees rated."
        )

        return self._shape(
            metrics=metrics,
            charts=charts,
            tables=tables,
            executive_summary=summary,
            raw_data={
                'cycle_id': str(self.cycle.id),
                'rating_distribution': distribution,
                'department_rankings': dept_rows,
            },
            kpis=[],
        )


# ---------------------------------------------------------------------------
# 4. Calibration Impact
# ---------------------------------------------------------------------------

class ReviewsCalibrationImpactExtractor(ReviewsBaseExtractor):
    """Before/after calibration shifts, outliers, manager bias flags."""

    report_type = 'reviews_calibration_impact'
    title = 'Calibration Impact'

    def extract(self) -> Dict[str, Any]:
        from apps.reviews.models import CalibrationRating, CalibrationSession

        self.cycle = self._resolve_cycle()
        self._resolve_scope()

        # Cycle-scoped calibration sessions.
        sessions_qs = CalibrationSession.objects.all()
        if self.tenant_id:
            sessions_qs = sessions_qs.filter(tenant_id=self.tenant_id)
        if self.cycle:
            sessions_qs = sessions_qs.filter(review_cycle=self.cycle)

        total_sessions = sessions_qs.count()
        completed_sessions = sessions_qs.filter(outcome='completed').count()

        # CalibrationRating has NO tenant_id — filter via the session relation.
        adj_qs = CalibrationRating.objects.select_related(
            'calibration_session', 'final_rating', 'adjusted_by',
        )
        if self.tenant_id:
            adj_qs = adj_qs.filter(calibration_session__tenant_id=self.tenant_id)
        if self.cycle:
            adj_qs = adj_qs.filter(calibration_session__review_cycle=self.cycle)

        # Compute adjustment_amount in Python — the field does not exist on the model.
        total_adjustments = 0
        increases = 0
        decreases = 0
        no_change = 0
        adjustment_values: List[float] = []

        for adj in adj_qs:
            before = _to_float(adj.before_score, None)
            after = _to_float(adj.after_score, None)
            if before is None or after is None:
                continue
            total_adjustments += 1
            delta = after - before
            adjustment_values.append(delta)
            if delta > 0:
                increases += 1
            elif delta < 0:
                decreases += 1
            else:
                no_change += 1

        avg_adjustment = _round(_safe_divide(sum(adjustment_values), len(adjustment_values)), 2, 0.0)

        # Outlier report via service (correctness guaranteed by service).
        outliers: Dict[str, Any] = {}
        if self.cycle:
            try:
                from apps.reviews.services.calibration.outlier_detector import OutlierDetector
                outliers = {
                    'outliers': OutlierDetector.find_outliers(self.cycle),
                    'inconsistent_managers': OutlierDetector.find_inconsistent_managers(self.cycle),
                    'department_statistics': OutlierDetector.get_department_statistics(self.cycle),
                }
            except Exception as e:
                self._error('OutlierDetector', e)

        session_rows = [
            {
                'id': str(s.id),
                'name': s.name,
                'session_type': getattr(s, 'session_type', ''),
                'scheduled_date': s.scheduled_date.isoformat() if s.scheduled_date else None,
                'status': s.status,
                'outcome': getattr(s, 'outcome', ''),
                'facilitator': s.facilitator.email if s.facilitator else None,
                'adjustments_count': adj_qs.filter(calibration_session=s).count(),
            }
            for s in sessions_qs.order_by('-scheduled_date')[:100]
        ]

        outlier_list = outliers.get('outliers') or []
        bias_list = outliers.get('inconsistent_managers') or []

        metrics = {
            'cycle_name': self.cycle.name if self.cycle else None,
            'total_calibration_sessions': total_sessions,
            'completed_sessions': completed_sessions,
            'total_adjustments_made': total_adjustments,
            'score_increases_count': increases,
            'score_decreases_count': decreases,
            'no_change_count': no_change,
            'avg_adjustment_amount': avg_adjustment,
            'outlier_count': len(outlier_list),
            'inconsistent_manager_count': len(bias_list),
        }

        charts = [
            {
                'type': 'pie',
                'title': 'Calibration Adjustment Direction',
                'data': {
                    'labels': ['Increased', 'Decreased', 'No Change'],
                    'values': [increases, decreases, no_change],
                    'colors': ['#10b981', '#ef4444', '#94a3b8'],
                },
            },
        ]

        tables = [
            {
                'title': 'Calibration Sessions',
                'columns': ['Session', 'Type', 'Scheduled', 'Status', 'Outcome',
                            'Facilitator', 'Adjustments'],
                'rows': [
                    [s['name'], s['session_type'], s['scheduled_date'], s['status'],
                     s['outcome'], s['facilitator'], s['adjustments_count']]
                    for s in session_rows
                ],
            },
        ]
        if outlier_list:
            tables.append({
                'title': 'Calibration Outliers',
                'columns': ['Employee', 'Department', 'Manager', 'Score', 'Reasons'],
                'rows': [
                    [o.get('employee'), o.get('department'), o.get('manager'),
                     o.get('score'), '; '.join(o.get('reasons') or [])]
                    for o in outlier_list[:50]
                ],
            })

        summary = (
            f"{total_sessions} calibration session(s) ({completed_sessions} completed) with "
            f"{total_adjustments} adjustment(s); average shift {avg_adjustment:+.2f}. "
            f"{len(outlier_list)} outlier(s), {len(bias_list)} manager bias flag(s)."
        )

        return self._shape(
            metrics=metrics,
            charts=charts,
            tables=tables,
            executive_summary=summary,
            raw_data={
                'cycle_id': str(self.cycle.id) if self.cycle else None,
                'sessions': session_rows,
                'outliers': outliers,
            },
            kpis=[],
        )


# ---------------------------------------------------------------------------
# 5. PIP Tracker
# ---------------------------------------------------------------------------

class ReviewsPIPTrackerExtractor(ReviewsBaseExtractor):
    """Organization-wide PIP health, actions, outcomes, trends."""

    report_type = 'reviews_pip_tracker'
    title = 'PIP Tracker'

    def extract(self) -> Dict[str, Any]:
        from apps.reviews.models import PIP, PIPAction

        self.cycle = self._resolve_cycle()
        self._resolve_scope()

        qs = PIP.objects.all()
        if self.tenant_id:
            qs = qs.filter(tenant_id=self.tenant_id)
        if self.cycle:
            qs = qs.filter(review_cycle=self.cycle)

        # Apply scope via employee.
        ids = self.resolved_scope.get('user_ids') or []
        if ids:
            qs = qs.filter(employee_id__in=ids)

        total_pips = qs.count()
        active_pips = qs.filter(status__in=ACTIVE_PIP_STATUSES).count()
        successful_pips = qs.filter(outcome='successful').count()
        failed_pips = qs.filter(outcome='failed').count()
        extended_pips = qs.filter(outcome='extended').count()
        terminated_pips = qs.filter(outcome='terminated').count()

        # Actions scoped via the PIP queryset.
        actions_qs = PIPAction.objects.filter(pip__in=qs)
        total_actions = actions_qs.count()
        completed_actions = actions_qs.filter(status='completed').count()
        missed_actions = actions_qs.filter(status='missed').count()
        pending_actions = actions_qs.filter(status='pending').count()
        in_progress_actions = actions_qs.filter(status='in_progress').count()

        pip_success_rate = _pct(successful_pips, successful_pips + failed_pips)
        action_completion_rate = _pct(completed_actions, total_actions)

        # Trends via service if available.
        trends: List[Dict[str, Any]] = []
        try:
            from apps.reviews.services.reporting.pip_report_service import PIPReportService
            if self.tenant_id:
                from apps.tenant.models import Organization
                tenant_obj = Organization.objects.filter(id=self.tenant_id).first()
                if tenant_obj:
                    trends = PIPReportService.get_pip_trends(tenant_obj, months=6) or []
        except Exception as e:
            self._error('PIPReportService.get_pip_trends', e)

        # PIP list.
        user_ids = list(qs.values_list('employee_id', flat=True))
        user_ids += list(qs.values_list('owner_id', flat=True))
        user_map = _get_user_info_map([u for u in user_ids if u], self.tenant_id)

        pip_rows = []
        for p in qs.select_related('employee', 'owner').order_by('-start_date')[:200]:
            emp_info = user_map.get(str(p.employee_id), {})
            owner_info = user_map.get(str(p.owner_id), {}) if p.owner_id else {}
            pip_rows.append({
                'id': str(p.id),
                'title': p.title,
                'employee_name': emp_info.get('full_name', ''),
                'employee_email': emp_info.get('email', ''),
                'owner_name': owner_info.get('full_name', ''),
                'severity': getattr(p, 'severity', ''),
                'status': p.status,
                'outcome': p.outcome or 'in_progress',
                'start_date': p.start_date.isoformat() if p.start_date else None,
                'end_date': p.end_date.isoformat() if p.end_date else None,
            })

        metrics = {
            'total_pips': total_pips,
            'active_pips': active_pips,
            'successful_pips': successful_pips,
            'failed_pips': failed_pips,
            'extended_pips': extended_pips,
            'terminated_pips': terminated_pips,
            'pip_success_rate_pct': pip_success_rate,
            'total_action_items': total_actions,
            'completed_action_items': completed_actions,
            'pending_action_items': pending_actions,
            'in_progress_action_items': in_progress_actions,
            'missed_action_items': missed_actions,
            'action_completion_rate_pct': action_completion_rate,
        }

        charts = [
            {
                'type': 'pie',
                'title': 'PIP Action Status',
                'data': {
                    'labels': ['Completed', 'In Progress', 'Pending', 'Missed'],
                    'values': [completed_actions, in_progress_actions, pending_actions, missed_actions],
                    'colors': ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'],
                },
            },
        ]
        if trends:
            charts.append({
                'type': 'line',
                'title': 'PIP Trends (6 months)',
                'data': {
                    'labels': [t.get('month', '') for t in trends],
                    'values': [t.get('created', 0) for t in trends],
                    'colors': ['#2563eb'],
                },
            })

        tables = [
            {
                'title': 'PIP Registry',
                'columns': ['Title', 'Employee', 'Owner', 'Severity', 'Status', 'Outcome',
                            'Start', 'End'],
                'rows': [
                    [r['title'], r['employee_name'], r['owner_name'], r['severity'],
                     r['status'], r['outcome'], r['start_date'], r['end_date']]
                    for r in pip_rows
                ],
            },
        ]

        summary = (
            f"{total_pips} PIP(s) — {active_pips} active, {successful_pips} successful, "
            f"{failed_pips} failed (success rate {pip_success_rate}%). "
            f"Action completion {action_completion_rate}% "
            f"({completed_actions}/{total_actions})."
        )

        return self._shape(
            metrics=metrics,
            charts=charts,
            tables=tables,
            executive_summary=summary,
            raw_data={
                'cycle_id': str(self.cycle.id) if self.cycle else None,
                'pips': pip_rows,
                'trends': trends,
            },
            kpis=[],
        )


# ---------------------------------------------------------------------------
# 6. Unified
# ---------------------------------------------------------------------------

class ReviewsUnifiedExtractor(ReviewsBaseExtractor):
    """
    Master extractor. Composes the five sub-extractors and emits a single
    top-level payload the ReportGenerator can consume directly.
    """

    report_type = 'reviews_executive_summary'
    title = 'Reviews Executive Summary'

    def extract(self) -> Dict[str, Any]:
        self.cycle = self._resolve_cycle()
        self._resolve_scope()

        # Give every sub-extractor the resolved cycle + scope so they don't
        # re-resolve independently (and disagree).
        shared_filters = dict(self.filters)
        if self.cycle:
            shared_filters['cycle_id'] = str(self.cycle.id)
        shared_filters['scope'] = self.resolved_scope['scope']
        if self.resolved_scope['actor_id']:
            shared_filters['actor_id'] = self.resolved_scope['actor_id']

        sub_results: Dict[str, Any] = {}
        sub_errors: List[Dict[str, Any]] = []

        sub_extractors = {
            'individual_summary': ReviewsIndividualSummaryExtractor,
            'cycle_compliance': ReviewsCycleComplianceExtractor,
            'organization_performance': ReviewsOrganizationPerformanceExtractor,
            'calibration_impact': ReviewsCalibrationImpactExtractor,
            'pip_tracker': ReviewsPIPTrackerExtractor,
        }

        for key, cls in sub_extractors.items():
            try:
                inst = cls(self.tenant_id, shared_filters)
                sub_results[key] = inst.extract()
                if inst.errors:
                    sub_errors.extend([{'sub': key, **e} for e in inst.errors])
            except Exception as e:
                logger.exception('[ReviewsUnifiedExtractor] sub-extractor %s failed', key)
                sub_errors.append({'sub': key, 'where': 'extract', 'message': str(e)})
                sub_results[key] = {
                    'status': 'Failed',
                    'metrics': {},
                    'charts': [],
                    'tables': [],
                    'executive_summary': f'{key} failed: {e}',
                    'raw_data': {},
                    'errors': [{'where': 'extract', 'message': str(e)}],
                }

        ind = sub_results.get('individual_summary', {})
        comp = sub_results.get('cycle_compliance', {})
        perf = sub_results.get('organization_performance', {})
        cal = sub_results.get('calibration_impact', {})
        pip = sub_results.get('pip_tracker', {})

        ind_m = ind.get('metrics', {}) or {}
        comp_m = comp.get('metrics', {}) or {}
        perf_m = perf.get('metrics', {}) or {}
        cal_m = cal.get('metrics', {}) or {}
        pip_m = pip.get('metrics', {}) or {}

        # Talent Health Score — same formula as previous draft, but sourced from
        # the corrected metrics.
        completion_pct = _to_float(comp_m.get('overall_completion_rate_pct'), 0.0) or 0.0
        perf_pct = _to_float(perf_m.get('avg_overall_score'), 0.0) or 0.0
        pip_success_pct = _to_float(pip_m.get('pip_success_rate_pct'), 0.0) or 0.0
        active_pips = int(pip_m.get('active_pips', 0) or 0)

        talent_health_score = round(
            (completion_pct * 0.30)
            + (perf_pct * 0.30)
            + (pip_success_pct * 0.20)
            + (max(0.0, 100.0 - active_pips * 5) * 0.20),
            2,
        )

        metrics = {
            'cycle_name': self.cycle.name if self.cycle else None,
            'cycle_status': self.cycle.status if self.cycle else None,
            'scope': self.resolved_scope['scope'],
            'total_evaluated_employees': ind_m.get('total_evaluated_employees', 0),
            'total_participants': comp_m.get('total_participants', 0),
            'overall_completion_rate_pct': completion_pct,
            'self_completion_rate_pct': comp_m.get('self_completion_rate_pct', 0.0),
            'supervisor_completion_rate_pct': comp_m.get('supervisor_completion_rate_pct', 0.0),
            'avg_overall_score': perf_pct,
            'avg_kpi_score': perf_m.get('avg_kpi_score', 0.0),
            'avg_competency_score': perf_m.get('avg_competency_score', 0.0),
            'std_dev': perf_m.get('std_dev', 0.0),
            'total_rated_employees': perf_m.get('total_rated_employees', 0),
            'promotion_ready_count': ind_m.get('promotion_ready_count', 0),
            'pip_flagged_count': ind_m.get('pip_flagged_count', 0),
            'active_pips': active_pips,
            'pip_success_rate_pct': pip_success_pct,
            'total_pips': pip_m.get('total_pips', 0),
            'calibration_sessions_count': cal_m.get('total_calibration_sessions', 0),
            'calibration_adjustments_count': cal_m.get('total_adjustments_made', 0),
            'outlier_count': cal_m.get('outlier_count', 0),
            'talent_health_score': talent_health_score,
        }

        # Top-level charts: status pie + top-10 employees + dept bar.
        charts: List[Dict[str, Any]] = []
        if ind.get('charts'):
            charts.append(ind['charts'][0])
        if perf.get('charts'):
            charts.append(perf['charts'][0])
        if comp.get('charts'):
            charts.append(comp['charts'][0])
        if pip.get('charts'):
            charts.append(pip['charts'][0])

        # Top-level tables: scorecards + departments + PIPs.
        tables: List[Dict[str, Any]] = []
        for src in (ind, comp, perf, cal, pip):
            for t in (src.get('tables') or []):
                tables.append(t)

        # kpis: flatten the synthetic list so ChartRenderer/PivotBuilder see rows.
        kpis: List[Dict[str, Any]] = list(ind.get('kpis') or [])

        summary = (
            f"Executive reviews summary for {metrics['cycle_name'] or 'the current cycle'}: "
            f"Talent Health {talent_health_score}%. "
            f"{metrics['total_evaluated_employees']} employees evaluated; "
            f"completion {completion_pct}%, avg score {perf_pct}%, "
            f"KPI {metrics['avg_kpi_score']}%, competency {metrics['avg_competency_score']}%. "
            f"{metrics['active_pips']} active PIP(s); "
            f"{metrics['calibration_sessions_count']} calibration session(s); "
            f"{metrics['promotion_ready_count']} promotion recommendation(s)."
        )

        return {
            'status': 'Completed' if not sub_errors else 'CompletedWithErrors',
            'source': 'reviews',
            'report_type': self.report_type,
            'title': self.title,
            'extracted_at': timezone.now().isoformat(),
            'cycle': {
                'id': str(self.cycle.id) if self.cycle else None,
                'name': self.cycle.name if self.cycle else None,
                'status': self.cycle.status if self.cycle else None,
            },
            'scope': self.resolved_scope,
            'metrics': metrics,
            'charts': charts,
            'tables': tables,
            'kpis': kpis,
            'executive_summary': summary,
            'individual_summary': ind,
            'cycle_compliance': comp,
            'organization_performance': perf,
            'calibration_impact': cal,
            'pip_tracker': pip,
            'raw_data': {
                'individual_summary': ind.get('raw_data', {}),
                'cycle_compliance': comp.get('raw_data', {}),
                'organization_performance': perf.get('raw_data', {}),
                'calibration_impact': cal.get('raw_data', {}),
                'pip_tracker': pip.get('raw_data', {}),
            },
            'errors': sub_errors,
        }


# Aliases
ReviewsDataExtractor = ReviewsUnifiedExtractor


# ---------------------------------------------------------------------------
# Report type dispatch map
# ---------------------------------------------------------------------------

REVIEWS_EXTRACTOR_MAP = {
    'reviews_individual_summary':       ReviewsIndividualSummaryExtractor,
    'reviews_cycle_compliance':         ReviewsCycleComplianceExtractor,
    'reviews_organization_performance': ReviewsOrganizationPerformanceExtractor,
    'reviews_calibration_impact':       ReviewsCalibrationImpactExtractor,
    'reviews_pip_tracker':              ReviewsPIPTrackerExtractor,
    'reviews_executive_summary':        ReviewsUnifiedExtractor,
    'reviews_summary':                  ReviewsUnifiedExtractor,
}


def get_reviews_extractor(report_type: str, tenant_id=None, filters=None):
    """Factory for ReportGenerator dispatch."""
    cls = REVIEWS_EXTRACTOR_MAP.get(report_type, ReviewsUnifiedExtractor)
    return cls(tenant_id=tenant_id, filters=filters)