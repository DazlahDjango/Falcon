from __future__ import annotations
import uuid
from decimal import Decimal
from typing import Any, Dict, List, Optional
from django.core.cache import cache
from django.db.models import Avg
from django.utils import timezone
from apps.kpi.models import (
    DepartmentRollup,
    KPISummary,
    MonthlyActual,
    OrganizationHealth,
    Score,
    TrafficLight,
    AggregatedScore
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


def get_department_rollups(tenant_id: str, year: int, month: int, prefer_mv: bool = True) -> List[Dict]:
    """Get department rollups for a period"""
    cache_key = f"dept_rollups_{tenant_id}_{year}_{month}"
    cached = cache.get(cache_key)
    if cached:
        return cached

    if prefer_mv:
        mv_data = DepartmentRollup.objects.filter(
            tenant_id=tenant_id,
            year=year,
            month=month
        ).values()
        if mv_data.exists():
            result = list(mv_data)
            cache.set(cache_key, result, 3600)
            return result

    # Live calculation from aggregated scores
    dept_scores = AggregatedScore.objects.filter(
        level='DEPARTMENT',
        tenant_id=tenant_id,
        year=year,
        month=month
    ).values('entity_id', 'entity_name', 'aggregated_score', 'member_count')

    result = []
    for dept in dept_scores:
        result.append({
            'department_id': dept['entity_id'],
            'department_name': dept['entity_name'],
            'overall_score': dept['aggregated_score'],
            'member_count': dept['member_count'],
            'green_percentage': 0,  # Would need additional calculation
            'yellow_percentage': 0,
            'red_percentage': 0,
            'employee_count': dept['member_count']
        })

    cache.set(cache_key, result, 3600)
    return result



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


def get_organization_health(tenant_id: str, year: int, month: int) -> Dict:
    """Get organization health for a period"""
    cache_key = f"org_health_{tenant_id}_{year}_{month}"
    cached = cache.get(cache_key)
    if cached:
        return cached

    # Try materialized view first
    health = OrganizationHealth.objects.filter(
        tenant_id=tenant_id,
        year=year,
        month=month
    ).first()

    if health:
        result = {
            'tenant_id': str(health.tenant_id),
            'year': health.year,
            'month': health.month,
            'overall_health_score': health.overall_health_score,
            'kpi_completion_rate': health.kpi_completion_rate,
            'validation_compliance_rate': health.validation_compliance_rate,
            'red_kpi_count': health.red_kpi_count,
            'total_kpi_count': health.total_kpi_count,
            'active_employees': health.active_employees,
            'source': 'materialized_view'
        }
        cache.set(cache_key, result, 3600)
        return result

    # Live calculation
    scores = Score.objects.filter(
        tenant_id=tenant_id,
        year=year,
        month=month
    )
    total_kpis = scores.count()
    red_kpis = scores.filter(score__lt=50).count()

    actuals = MonthlyActual.objects.filter(
        tenant_id=tenant_id,
        year=year,
        month=month
    )
    total_expected = actuals.count()
    validated = actuals.filter(status='APPROVED').count()
    validation_rate = (validated / total_expected * 100) if total_expected > 0 else 0

    avg_score = scores.aggregate(avg=Avg('score'))['avg'] or 0

    result = {
        'tenant_id': tenant_id,
        'year': year,
        'month': month,
        'overall_health_score': round(avg_score, 2),
        'kpi_completion_rate': round(avg_score, 2),
        'validation_compliance_rate': round(validation_rate, 2),
        'red_kpi_count': red_kpis,
        'total_kpi_count': total_kpis,
        'active_employees': 0,
        'source': 'live'
    }
    cache.set(cache_key, result, 3600)
    return result



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


def get_kpi_summaries(tenant_id: str, year: int, month: int, prefer_mv: bool = True) -> List[Dict]:
    """Get KPI summaries for a period"""
    cache_key = f"kpi_summaries_{tenant_id}_{year}_{month}"
    cached = cache.get(cache_key)
    if cached:
        return cached

    if prefer_mv:
        mv_data = KPISummary.objects.filter(
            tenant_id=tenant_id,
            year=year,
            month=month
        ).values(
            'kpi__id', 'kpi__name', 'kpi__code',
            'average_score', 'green_count', 'yellow_count',
            'red_count', 'total_users'
        )
        if mv_data.exists():
            result = list(mv_data)
            cache.set(cache_key, result, 3600)
            return result

    # Live calculation
    scores = Score.objects.filter(
        tenant_id=tenant_id,
        year=year,
        month=month
    ).select_related('kpi')

    kpi_data = {}
    for score in scores:
        kpi_id = str(score.kpi_id)
        if kpi_id not in kpi_data:
            kpi_data[kpi_id] = {
                'kpi__id': kpi_id,
                'kpi__name': score.kpi.name,
                'kpi__code': score.kpi.code,
                'scores': [],
                'green_count': 0,
                'yellow_count': 0,
                'red_count': 0,
            }
        kpi_data[kpi_id]['scores'].append(score.score)
        if score.score >= 90:
            kpi_data[kpi_id]['green_count'] += 1
        elif score.score >= 50:
            kpi_data[kpi_id]['yellow_count'] += 1
        else:
            kpi_data[kpi_id]['red_count'] += 1

    result = []
    for data in kpi_data.values():
        avg_score = sum(data['scores']) / len(data['scores']) if data['scores'] else 0
        result.append({
            'kpi__id': data['kpi__id'],
            'kpi__name': data['kpi__name'],
            'kpi__code': data['kpi__code'],
            'average_score': round(avg_score, 2),
            'green_count': data['green_count'],
            'yellow_count': data['yellow_count'],
            'red_count': data['red_count'],
            'total_users': len(data['scores'])
        })

    cache.set(cache_key, result, 3600)
    return result


def get_organization_health_history(tenant_id: str, months_back: int = 12) -> List[Dict]:
    """Get organization health history for trend analysis"""
    history = []
    now = timezone.now()

    for i in range(months_back):
        year = now.year
        month = now.month - i
        if month < 1:
            month += 12
            year -= 1

        health = get_organization_health(tenant_id, year, month)
        health['period'] = f"{year}-{month:02d}"
        history.append(health)

    return history


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
