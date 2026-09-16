"""
Helper service for strict personal vs team scoping across KPI subsystems:
- My KPIs vs Team KPIs
- My Actual Submissions vs Team Actual Submissions
- My Targets & Phasing vs Team Targets & Phasing
"""
from django.db.models import Q
from apps.kpi.models import KPI, AnnualTarget, MonthlyPhasing, MonthlyActual


def get_direct_report_ids(user):
    """
    Resolve all active direct report user IDs for a user using both:
    1. Direct manager link on User model (manager_id)
    2. Reporting line in structural position hierarchy (position__reports_to)
    3. Management chain team members
    """
    if not user or not user.is_authenticated:
        return []

    report_ids = set()

    # 1. Accounts user model direct reports
    if hasattr(user, 'get_direct_reports'):
        try:
            report_ids.update(user.get_direct_reports().values_list('id', flat=True))
        except Exception:
            pass

    # 2. Structural position reporting line
    try:
        from apps.structure.models import Employment
        emp = Employment.objects.filter(user_id=user.id, is_current=True).first()
        if emp and emp.position:
            sub_user_ids = Employment.objects.filter(
                position__reports_to=emp.position,
                is_current=True,
                is_active=True
            ).values_list('user_id', flat=True)
            report_ids.update(sub_user_ids)
    except Exception:
        pass

    # 3. Management chain team IDs
    if hasattr(user, 'get_team_ids'):
        try:
            team_ids = user.get_team_ids()
            if team_ids:
                report_ids.update(team_ids)
        except Exception:
            pass

    # Ensure manager themselves is excluded from their direct reports
    report_ids.discard(user.id)
    return list(report_ids)


def get_my_kpis_queryset(user, base_qs=None):
    """
    For a manager/employee: returns ONLY their own personal KPIs.
    Excludes any KPI that was cascaded to team members where the manager has no personal target.
    """
    if base_qs is None:
        base_qs = KPI.objects.all()

    direct_report_ids = get_direct_report_ids(user)
    team_cascaded_away = (
        (Q(annual_targets__user_id__in=direct_report_ids) & ~Q(annual_targets__user=user) & ~Q(weights__user=user)) |
        (Q(annual_targets__child_cascades__child_target__user_id__in=direct_report_ids) & ~Q(annual_targets__user=user)) |
        (Q(sub_kpis__owner_id__in=direct_report_ids) & ~Q(annual_targets__user=user))
    )
    return base_qs.filter(
        Q(annual_targets__user=user) |
        Q(weights__user=user) |
        (Q(owner=user) & ~team_cascaded_away)
    ).distinct()


def get_team_kpis_queryset(user, base_qs=None):
    """
    For a manager: returns ALL KPIs belonging to their team members.
    Includes KPIs owned by direct reports, targets assigned to direct reports,
    child cascades, sub-KPIs, and weights.
    """
    if base_qs is None:
        base_qs = KPI.objects.all()

    direct_report_ids = get_direct_report_ids(user)
    managed_depts = getattr(user, 'managed_departments', [])

    if not direct_report_ids and not managed_depts:
        return base_qs.exclude(owner=user)

    personal_manager_only = Q(owner=user) & ~Q(annual_targets__user_id__in=direct_report_ids) & ~Q(weights__user_id__in=direct_report_ids)

    return base_qs.filter(
        Q(owner_id__in=direct_report_ids) |
        Q(annual_targets__user_id__in=direct_report_ids) |
        Q(annual_targets__child_cascades__child_target__user_id__in=direct_report_ids) |
        Q(weights__user_id__in=direct_report_ids) |
        Q(parent_kpi__owner=user) |
        Q(sub_kpis__owner_id__in=direct_report_ids) |
        (Q(department_id__in=managed_depts) & ~Q(owner=user))
    ).exclude(personal_manager_only).distinct()


def get_my_actuals_queryset(user, base_qs=None):
    """Returns only the manager's/user's own personal actual submissions."""
    if base_qs is None:
        base_qs = MonthlyActual.objects.all()
    return base_qs.filter(user_id=user.id)


def get_team_actuals_queryset(user, base_qs=None):
    """Returns all actual submissions submitted by all team members."""
    if base_qs is None:
        base_qs = MonthlyActual.objects.all()
    direct_report_ids = get_direct_report_ids(user)
    if direct_report_ids:
        return base_qs.filter(user_id__in=direct_report_ids).exclude(user_id=user.id)
    return base_qs.exclude(user_id=user.id)


def get_my_targets_queryset(user, base_qs=None):
    """Returns only the manager's/user's own personal annual targets."""
    if base_qs is None:
        base_qs = AnnualTarget.objects.all()
    return base_qs.filter(user=user)


def get_team_targets_queryset(user, base_qs=None):
    """Returns all annual targets assigned to team members."""
    if base_qs is None:
        base_qs = AnnualTarget.objects.all()
    direct_report_ids = get_direct_report_ids(user)
    if direct_report_ids:
        return base_qs.filter(user_id__in=direct_report_ids).exclude(user=user)
    return base_qs.exclude(user=user)


def get_my_phasing_queryset(user, base_qs=None):
    """Returns only the manager's/user's own monthly phasings."""
    if base_qs is None:
        base_qs = MonthlyPhasing.objects.all()
    return base_qs.filter(annual_target__user=user)


def get_team_phasing_queryset(user, base_qs=None):
    """Returns all monthly phasings of team members."""
    if base_qs is None:
        base_qs = MonthlyPhasing.objects.all()
    direct_report_ids = get_direct_report_ids(user)
    if direct_report_ids:
        return base_qs.filter(annual_target__user_id__in=direct_report_ids).exclude(annual_target__user=user)
    return base_qs.exclude(annual_target__user=user)
