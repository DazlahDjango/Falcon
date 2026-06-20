from __future__ import annotations
import uuid
import logging
from decimal import Decimal
from typing import Any, Dict, List, Optional
from django.core.cache import cache
from django.db.models import Avg, Count, Q, Sum, F
from django.utils import timezone
from django.core.exceptions import ValidationError
from apps.kpi.models import (
    DepartmentRollup,
    KPISummary,
    MonthlyActual,
    OrganizationHealth,
    Score,
    TrafficLight,
    AggregatedScore,
    KPI
)
from apps.structure.models import Department

logger = logging.getLogger(__name__)

CACHE_TTL = 3600
CACHE_PREFIX = "kpi_analytics"


def _looks_like_uuid(value: str) -> bool:
    try:
        uuid.UUID(str(value))
        return True
    except (ValueError, TypeError):
        return False


def department_name_map(tenant_id: str, department_ids: List[str]) -> Dict[str, str]:
    if not department_ids:
        return {}
    ids = [d for d in department_ids if d]
    if not ids:
        return {}
    return {
        str(d.id): d.name
        for d in Department.objects.filter(
            tenant_id=tenant_id,
            id__in=ids,
            is_active=True
        ).only('id', 'name')
    }


def resolve_department_name(tenant_id: str, department_id: Optional[str], fallback: str = '') -> str:
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
    name = row.get('department_name', '')
    if not name or _looks_like_uuid(name):
        row = {**row, 'department_name': resolve_department_name(tenant_id, dept_id, name)}
    return row


def compute_department_rollups_live(
    tenant_id: str,
    year: int,
    month: int,
) -> List[Dict[str, Any]]:
    cache_key = f"{CACHE_PREFIX}:dept_rollups_live:{tenant_id}:{year}:{month}"
    cached = cache.get(cache_key)
    if cached:
        return cached

    base_qs = Score.objects.filter(
        tenant_id=tenant_id,
        year=year,
        month=month,
        kpi__department_id__isnull=False,
    ).select_related('kpi').prefetch_related('traffic_lights')

    dept_ids = list(base_qs.values_list('kpi__department_id', flat=True).distinct())
    if not dept_ids:
        return []

    names = department_name_map(tenant_id, dept_ids)
    rollups: List[Dict[str, Any]] = []

    for dept_id in dept_ids:
        scores = base_qs.filter(kpi__department_id=dept_id)
        if not scores.exists():
            continue

        overall = scores.aggregate(avg=Avg('score'))['avg'] or Decimal('0')
        employee_count = scores.values('user_id').distinct().count()

        greens = yellows = reds = 0
        for score in scores:
            tl = score.traffic_lights.first()
            if not tl:
                continue
            if tl.status == 'GREEN':
                greens += 1
            elif tl.status == 'YELLOW':
                yellows += 1
            elif tl.status == 'RED':
                reds += 1

        total_tl = greens + yellows + reds or 1
        rollup = {
            'department_id': str(dept_id),
            'department_name': names.get(str(dept_id), 'Unknown Department'),
            'tenant_id': tenant_id,
            'year': year,
            'month': month,
            'overall_score': round(float(overall), 2),
            'employee_count': employee_count,
            'green_percentage': round((greens / total_tl) * 100, 2),
            'yellow_percentage': round((yellows / total_tl) * 100, 2),
            'red_percentage': round((reds / total_tl) * 100, 2),
        }
        rollups.append(rollup)

    rollups.sort(key=lambda r: r['overall_score'], reverse=True)
    cache.set(cache_key, rollups, CACHE_TTL)
    return rollups


def get_department_rollups(
    tenant_id: str,
    year: int,
    month: int,
    prefer_mv: bool = True
) -> List[Dict[str, Any]]:
    cache_key = f"{CACHE_PREFIX}:dept_rollups:{tenant_id}:{year}:{month}"
    cached = cache.get(cache_key)
    if cached:
        return cached

    if prefer_mv:
        mv_data = list(DepartmentRollup.objects.filter(
            tenant_id=tenant_id,
            year=year,
            month=month
        ).values())
        if mv_data:
            cache.set(cache_key, mv_data, CACHE_TTL)
            return mv_data

    result = compute_department_rollups_live(tenant_id, year, month)
    cache.set(cache_key, result, CACHE_TTL)
    return result


def compute_organization_health_live(
    tenant_id: str,
    year: int,
    month: int,
) -> Dict[str, Any]:
    cache_key = f"{CACHE_PREFIX}:org_health_live:{tenant_id}:{year}:{month}"
    cached = cache.get(cache_key)
    if cached:
        return cached

    scores = Score.objects.filter(
        tenant_id=tenant_id,
        year=year,
        month=month
    ).prefetch_related('traffic_lights')

    total_kpis = scores.count()
    if total_kpis == 0:
        result = {
            'tenant_id': str(tenant_id),
            'year': year,
            'month': month,
            'overall_health_score': 0.0,
            'kpi_completion_rate': 0.0,
            'validation_compliance_rate': 0.0,
            'red_kpi_count': 0,
            'total_kpi_count': 0,
            'active_employees': 0,
            'risk_level': 'UNKNOWN',
            'source': 'live',
        }
        cache.set(cache_key, result, CACHE_TTL)
        return result

    avg_score = scores.aggregate(avg=Avg('score'))['avg'] or 0
    red_kpis = TrafficLight.objects.filter(
        score__tenant_id=tenant_id,
        score__year=year,
        score__month=month,
        status='RED'
    ).count()

    actuals = MonthlyActual.objects.filter(
        tenant_id=tenant_id,
        year=year,
        month=month
    )
    total_expected = actuals.count()
    validated = actuals.filter(status='APPROVED').count()
    validation_rate = (validated / total_expected * 100) if total_expected > 0 else 100

    active_employees = scores.values('user_id').distinct().count()

    overall_score = float(avg_score)
    if overall_score >= 85:
        risk_level = 'LOW'
    elif overall_score >= 60:
        risk_level = 'MEDIUM'
    else:
        risk_level = 'HIGH'

    result = {
        'tenant_id': str(tenant_id),
        'year': year,
        'month': month,
        'overall_health_score': round(overall_score, 2),
        'kpi_completion_rate': round(overall_score, 2),
        'validation_compliance_rate': round(validation_rate, 2),
        'red_kpi_count': red_kpis,
        'total_kpi_count': total_kpis,
        'active_employees': active_employees,
        'risk_level': risk_level,
        'source': 'live',
    }
    cache.set(cache_key, result, CACHE_TTL)
    return result


def get_organization_health(
    tenant_id: str,
    year: int,
    month: int
) -> Dict[str, Any]:
    cache_key = f"{CACHE_PREFIX}:org_health:{tenant_id}:{year}:{month}"
    cached = cache.get(cache_key)
    if cached:
        return cached

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
            'overall_health_score': float(health.overall_health_score),
            'kpi_completion_rate': float(health.kpi_completion_rate),
            'validation_compliance_rate': float(health.validation_compliance_rate),
            'red_kpi_count': health.red_kpi_count,
            'total_kpi_count': health.total_kpi_count,
            'active_employees': health.active_employees,
            'risk_level': 'MEDIUM',
            'source': 'materialized_view',
        }
        cache.set(cache_key, result, CACHE_TTL)
        return result

    result = compute_organization_health_live(tenant_id, year, month)
    cache.set(cache_key, result, CACHE_TTL)
    return result


def compute_kpi_summaries_live(
    tenant_id: str,
    year: int,
    month: int,
) -> List[Dict[str, Any]]:
    cache_key = f"{CACHE_PREFIX}:kpi_summaries_live:{tenant_id}:{year}:{month}"
    cached = cache.get(cache_key)
    if cached:
        return cached

    kpi_ids = Score.objects.filter(
        tenant_id=tenant_id,
        year=year,
        month=month
    ).values_list('kpi_id', flat=True).distinct()

    summaries = []
    for kpi_id in kpi_ids:
        scores = Score.objects.filter(
            tenant_id=tenant_id,
            year=year,
            month=month,
            kpi_id=kpi_id
        ).select_related('kpi').prefetch_related('traffic_lights')

        if not scores.exists():
            continue

        kpi = scores.first().kpi
        avg_score = scores.aggregate(avg=Avg('score'))['avg'] or Decimal('0')

        greens = yellows = reds = 0
        for s in scores:
            tl = s.traffic_lights.first()
            if not tl:
                continue
            if tl.status == 'GREEN':
                greens += 1
            elif tl.status == 'YELLOW':
                yellows += 1
            elif tl.status == 'RED':
                reds += 1

        avg_float = float(avg_score)
        if avg_float >= 90:
            health_status = 'EXCELLENT'
        elif avg_float >= 75:
            health_status = 'GOOD'
        elif avg_float >= 50:
            health_status = 'FAIR'
        else:
            health_status = 'POOR'

        summaries.append({
            'kpi_id': str(kpi_id),
            'kpi_name': kpi.name,
            'kpi_code': kpi.code,
            'year': year,
            'month': month,
            'average_score': round(avg_float, 2),
            'green_count': greens,
            'yellow_count': yellows,
            'red_count': reds,
            'total_users': scores.values('user_id').distinct().count(),
            'health_status': health_status,
        })

    summaries.sort(key=lambda x: x['average_score'], reverse=True)
    cache.set(cache_key, summaries, CACHE_TTL)
    return summaries


def get_kpi_summaries(
    tenant_id: str,
    year: int,
    month: int,
    prefer_mv: bool = True
) -> List[Dict[str, Any]]:
    cache_key = f"{CACHE_PREFIX}:kpi_summaries:{tenant_id}:{year}:{month}"
    cached = cache.get(cache_key)
    if cached:
        return cached

    if prefer_mv:
        mv_data = list(KPISummary.objects.filter(
            tenant_id=tenant_id,
            year=year,
            month=month
        ).select_related('kpi').values(
            'kpi__id',
            'kpi__name',
            'kpi__code',
            'average_score',
            'green_count',
            'yellow_count',
            'red_count',
            'total_users'
        ))
        if mv_data:
            result = []
            for item in mv_data:
                avg = float(item['average_score']) if item['average_score'] else 0
                if avg >= 90:
                    health = 'EXCELLENT'
                elif avg >= 75:
                    health = 'GOOD'
                elif avg >= 50:
                    health = 'FAIR'
                else:
                    health = 'POOR'
                result.append({
                    'kpi_id': item['kpi__id'],
                    'kpi_name': item['kpi__name'],
                    'kpi_code': item['kpi__code'],
                    'year': year,
                    'month': month,
                    'average_score': round(avg, 2),
                    'green_count': item['green_count'],
                    'yellow_count': item['yellow_count'],
                    'red_count': item['red_count'],
                    'total_users': item['total_users'],
                    'health_status': health,
                })
            cache.set(cache_key, result, CACHE_TTL)
            return result

    result = compute_kpi_summaries_live(tenant_id, year, month)
    cache.set(cache_key, result, CACHE_TTL)
    return result


def get_organization_health_history(
    tenant_id: str,
    months_back: int = 12
) -> List[Dict[str, Any]]:
    cache_key = f"{CACHE_PREFIX}:org_health_history:{tenant_id}:{months_back}"
    cached = cache.get(cache_key)
    if cached:
        return cached

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

    cache.set(cache_key, history, CACHE_TTL // 2)
    return history


def build_executive_dashboard(
    tenant_id: str,
    year: int,
    month: int,
) -> Dict[str, Any]:
    cache_key = f"{CACHE_PREFIX}:exec_dashboard:{tenant_id}:{year}:{month}"
    cached = cache.get(cache_key)
    if cached:
        return cached

    health = get_organization_health(tenant_id, year, month)
    rollups = get_department_rollups(tenant_id, year, month)

    department_rankings = []
    for idx, r in enumerate(rollups[:15]):
        department_rankings.append({
            'department_id': r.get('department_id'),
            'department': r.get('department_name', 'Unknown'),
            'score': r.get('overall_score', 0),
            'rank': idx + 1,
        })

    tl_qs = TrafficLight.objects.filter(
        score__tenant_id=tenant_id,
        score__year=year,
        score__month=month,
    )
    green_count = tl_qs.filter(status='GREEN').count()
    yellow_count = tl_qs.filter(status='YELLOW').count()
    red_count = tl_qs.filter(status='RED').count()
    total_tl = green_count + yellow_count + red_count
    red_pct = (red_count / total_tl * 100) if total_tl > 0 else 0

    total_kpis = Score.objects.filter(
        tenant_id=tenant_id,
        year=year,
        month=month
    ).count()

    history = get_organization_health_history(tenant_id, months_back=6)
    trend_data = [
        {
            'period': f"{h['year']}-{h['month']:02d}",
            'score': h['overall_health_score'],
        }
        for h in reversed(history)
    ]

    result = {
        'tenant_id': tenant_id,
        'period': f"{year}-{month:02d}",
        'overall_health': health.get('overall_health_score', 0),
        'red_kpi_count': health.get('red_kpi_count', 0),
        'red_kpi_percentage': round(red_pct, 2),
        'validation_compliance': health.get('validation_compliance_rate', 0),
        'kpi_completion_rate': health.get('kpi_completion_rate', 0),
        'department_rankings': department_rankings,
        'trend_data': trend_data,
        'total_kpis': total_kpis or health.get('total_kpi_count', 0),
        'green_count': green_count,
        'yellow_count': yellow_count,
        'red_count': red_count,
        'active_employees': health.get('active_employees', 0),
        'risk_indicators': {
            'risk_level': health.get('risk_level', 'MEDIUM'),
            'data_source': health.get('source', 'live'),
        },
        'organization_health': health,
    }

    cache.set(cache_key, result, CACHE_TTL // 2)
    return result


def invalidate_analytics_cache(tenant_id: str, year: int = None, month: int = None) -> None:
    patterns = [
        f"{CACHE_PREFIX}:*:{tenant_id}:*",
    ]
    if year and month:
        patterns.append(f"{CACHE_PREFIX}:*:{tenant_id}:{year}:{month}")
        patterns.append(f"{CACHE_PREFIX}:*:{tenant_id}:{year}:*")

    for pattern in patterns:
        keys = cache.keys(pattern) if hasattr(cache, 'keys') else []
        for key in keys:
            cache.delete(key)