"""
Live KPI analytics from operational tables (Scores, Actuals, structure.Department).

Used when materialized views are empty or stale, and to resolve department display names.
"""
from __future__ import annotations

import uuid
from decimal import Decimal
from typing import Any, Dict, List, Optional

from django.db.models import Avg
from django.utils import timezone

from apps.kpi.models import (
    DepartmentRollup,
    KPISummary,
    MonthlyActual,
    OrganizationHealth,
    Score,
    TrafficLight,
)
from apps.structure.models import Department


def _looks_like_uuid(value: str) -> bool:
    try:
        uuid.UUID(str(value))
        return True
    except (ValueError, TypeError):
        return False


def department_name_map(tenant_id, department_ids: List) -> Dict[str, str]:
    ids = [d for d in department_ids if d]
    if not ids:
        return {}
    return {
        str(d.id): d.name
        for d in Department.objects.filter(tenant_id=tenant_id, id__in=ids, is_active=True)
    }


def resolve_department_name(tenant_id, department_id, fallback: str = '') -> str:
    if not department_id:
        return fallback or 'Unassigned'
    name = department_name_map(tenant_id, [department_id]).get(str(department_id))
    if name:
        return name
    if fallback and not _looks_like_uuid(fallback):
        return fallback
    return 'Unassigned'


def enrich_department_rollup_row(tenant_id: str, row: Dict[str, Any]) -> Dict[str, Any]:
    dept_id = row.get('department_id')
    name = row.get('department_name') or ''
    if not name or _looks_like_uuid(name):
        row = {**row, 'department_name': resolve_department_name(tenant_id, dept_id, name)}
    return row


def compute_department_rollups_live(
    tenant_id: str, year: int, month: int,
) -> List[Dict[str, Any]]:
    """Aggregate scores by KPI department with structure.Department names."""
    base_qs = Score.objects.filter(
        tenant_id=tenant_id,
        year=year,
        month=month,
        kpi__department_id__isnull=False,
    )
    dept_ids = list(
        base_qs.values_list('kpi__department_id', flat=True).distinct()
    )
    if not dept_ids:
        return []

    names = department_name_map(tenant_id, dept_ids)
    rollups: List[Dict[str, Any]] = []

    for dept_id in dept_ids:
        scores = base_qs.filter(kpi__department_id=dept_id).select_related('traffic_light')
        if not scores.exists():
            continue
        overall = scores.aggregate(avg=Avg('score'))['avg'] or Decimal('0')
        employee_count = scores.values('user_id').distinct().count()
        greens = yellows = reds = 0
        for score in scores:
            tl = getattr(score, 'traffic_light', None)
            if not tl:
                continue
            if tl.status == 'GREEN':
                greens += 1
            elif tl.status == 'YELLOW':
                yellows += 1
            elif tl.status == 'RED':
                reds += 1
        total_tl = greens + yellows + reds or 1
        rollups.append({
            'department_id': str(dept_id),
            'department_name': names.get(str(dept_id), 'Unknown Department'),
            'tenant_id': tenant_id,
            'year': year,
            'month': month,
            'overall_score': round(float(overall), 2),
            'employee_count': employee_count,
            'green_percentage': round(greens / total_tl * 100, 2),
            'yellow_percentage': round(yellows / total_tl * 100, 2),
            'red_percentage': round(reds / total_tl * 100, 2),
        })

    rollups.sort(key=lambda r: r['overall_score'], reverse=True)
    return rollups


def get_department_rollups(
    tenant_id: str, year: int, month: int, *, prefer_mv: bool = True,
) -> List[Dict[str, Any]]:
    rows: List[Dict[str, Any]] = []
    if prefer_mv:
        mv_rows = DepartmentRollup.objects.filter(
            tenant_id=tenant_id, year=year, month=month,
        ).order_by('-overall_score')
        if mv_rows.exists():
            for r in mv_rows:
                rows.append(enrich_department_rollup_row(tenant_id, {
                    'department_id': str(r.department_id),
                    'department_name': r.department_name,
                    'tenant_id': str(r.tenant_id),
                    'year': r.year,
                    'month': r.month,
                    'overall_score': float(r.overall_score),
                    'employee_count': r.employee_count,
                    'green_percentage': float(r.green_percentage),
                    'yellow_percentage': float(r.yellow_percentage),
                    'red_percentage': float(r.red_percentage),
                }))
            return rows

    return compute_department_rollups_live(tenant_id, year, month)


def compute_organization_health_live(
    tenant_id: str, year: int, month: int,
) -> Dict[str, Any]:
    from apps.kpi.engine.aggregator import OrganizationAggregator

    summary = OrganizationAggregator().get_organization_health_summary(
        tenant_id, year, month,
    )
    total_scores = Score.objects.filter(
        tenant_id=tenant_id, year=year, month=month,
    ).count()
    active_employees = Score.objects.filter(
        tenant_id=tenant_id, year=year, month=month,
    ).values('user_id').distinct().count()

    total_expected = MonthlyActual.objects.filter(
        tenant_id=tenant_id, year=year, month=month,
    ).count()
    completion = (
        (total_scores / total_expected * 100) if total_expected > 0 else 0
    )

    return {
        'tenant_id': str(tenant_id),
        'year': year,
        'month': month,
        'overall_health_score': round(float(summary['overall_health_score']), 2),
        'kpi_completion_rate': round(float(completion), 2),
        'validation_compliance_rate': float(summary['validation_compliance_rate']),
        'red_kpi_count': summary['red_kpi_count'],
        'total_kpi_count': total_scores,
        'active_employees': active_employees,
        'risk_level': summary.get('risk_level', 'MEDIUM'),
        'source': 'live',
    }


def get_organization_health(
    tenant_id: str, year: int, month: int, *, prefer_mv: bool = True,
) -> Dict[str, Any]:
    if prefer_mv:
        record = OrganizationHealth.objects.filter(
            tenant_id=tenant_id, year=year, month=month,
        ).first()
        if not record:
            record = OrganizationHealth.objects.filter(tenant_id=tenant_id).order_by(
                '-year', '-month',
            ).first()
        if record:
            return {
                'tenant_id': str(record.tenant_id),
                'year': record.year,
                'month': record.month,
                'overall_health_score': float(record.overall_health_score),
                'kpi_completion_rate': float(record.kpi_completion_rate),
                'validation_compliance_rate': float(record.validation_compliance_rate),
                'red_kpi_count': record.red_kpi_count,
                'total_kpi_count': record.total_kpi_count,
                'active_employees': record.active_employees,
                'risk_level': _risk_from_score(record.overall_health_score),
                'source': 'materialized_view',
            }

    return compute_organization_health_live(tenant_id, year, month)


def _risk_from_score(score) -> str:
    s = float(score)
    if s >= 85:
        return 'LOW'
    if s >= 60:
        return 'MEDIUM'
    return 'HIGH'


def compute_kpi_summaries_live(
    tenant_id: str, year: int, month: int,
) -> List[Dict[str, Any]]:
    """Per-KPI rollup from live scores when kpi_summary_mv has no rows."""
    summaries = []
    kpi_ids = Score.objects.filter(
        tenant_id=tenant_id, year=year, month=month,
    ).values_list('kpi_id', flat=True).distinct()

    for kpi_id in kpi_ids:
        scores = Score.objects.filter(
            tenant_id=tenant_id, year=year, month=month, kpi_id=kpi_id,
        ).select_related('kpi', 'traffic_light')
        if not scores.exists():
            continue
        kpi = scores.first().kpi
        avg = scores.aggregate(avg=Avg('score'))['avg'] or Decimal('0')
        greens = yellows = reds = 0
        for s in scores:
            tl = getattr(s, 'traffic_light', None)
            if not tl:
                continue
            if tl.status == 'GREEN':
                greens += 1
            elif tl.status == 'YELLOW':
                yellows += 1
            elif tl.status == 'RED':
                reds += 1
        avg_f = float(avg)
        if avg_f >= 90:
            health = 'EXCELLENT'
        elif avg_f >= 75:
            health = 'GOOD'
        elif avg_f >= 50:
            health = 'FAIR'
        else:
            health = 'POOR'
        summaries.append({
            'kpi': str(kpi_id),
            'kpi_name': kpi.name,
            'kpi_code': kpi.code,
            'year': year,
            'month': month,
            'average_score': round(avg_f, 2),
            'green_count': greens,
            'yellow_count': yellows,
            'red_count': reds,
            'total_users': scores.values('user_id').distinct().count(),
            'health_status': health,
        })
    summaries.sort(key=lambda x: x['average_score'], reverse=True)
    return summaries


def get_kpi_summaries(
    tenant_id: str, year: int, month: int, *, prefer_mv: bool = True,
) -> List[Dict[str, Any]]:
    if prefer_mv:
        qs = KPISummary.objects.filter(tenant_id=tenant_id, year=year, month=month)
        if qs.exists():
            return list(qs.select_related('kpi'))
    return compute_kpi_summaries_live(tenant_id, year, month)


def get_organization_health_history(
    tenant_id: str, months_back: int = 12,
) -> List[Dict[str, Any]]:
    from apps.kpi.utils.date_utils import get_previous_period

    now = timezone.now()
    periods = []
    y, m = now.year, now.month
    for _ in range(months_back):
        y, m = get_previous_period(y, m)
        periods.append(get_organization_health(tenant_id, y, m))
    return periods


def build_executive_dashboard(
    tenant_id: str, year: int, month: int,
) -> Dict[str, Any]:
    """Executive payload: organization-health + department rollups (live-backed)."""
    health = get_organization_health(tenant_id, year, month)
    rollups = get_department_rollups(tenant_id, year, month)

    department_rankings = [
        {
            'department_id': r['department_id'],
            'department': r['department_name'],
            'score': r['overall_score'],
            'rank': idx + 1,
        }
        for idx, r in enumerate(rollups[:15])
    ]

    tl_qs = TrafficLight.objects.filter(
        score__tenant_id=tenant_id,
        score__year=year,
        score__month=month,
    )
    green_count = tl_qs.filter(status='GREEN').count()
    yellow_count = tl_qs.filter(status='YELLOW').count()
    red_count = tl_qs.filter(status='RED').count()
    total_tl = green_count + yellow_count + red_count
    total_kpis = Score.objects.filter(
        tenant_id=tenant_id, year=year, month=month,
    ).count()
    red_pct = (red_count / total_tl * 100) if total_tl > 0 else 0

    history = get_organization_health_history(tenant_id, months_back=6)
    trend_data = [
        {
            'period': f"{h['year']}-{h['month']:02d}",
            'score': h['overall_health_score'],
        }
        for h in reversed(history)
    ]

    return {
        'tenant_id': tenant_id,
        'period': f"{year}-{month:02d}",
        'overall_health': health['overall_health_score'],
        'red_kpi_count': health['red_kpi_count'],
        'red_kpi_percentage': round(red_pct, 2),
        'validation_compliance': health['validation_compliance_rate'],
        'kpi_completion_rate': health['kpi_completion_rate'],
        'department_rankings': department_rankings,
        'trend_data': trend_data,
        'total_kpis': total_kpis or health['total_kpi_count'],
        'green_count': green_count,
        'yellow_count': yellow_count,
        'red_count': red_count,
        'active_employees': health['active_employees'],
        'risk_indicators': {
            'risk_level': health.get('risk_level', 'MEDIUM'),
            'data_source': health.get('source', 'live'),
        },
        'organization_health': health,
    }
