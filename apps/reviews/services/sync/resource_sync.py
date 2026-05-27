import logging
from datetime import date
from decimal import Decimal
from typing import Any, Dict, List, Optional

from django.core.cache import cache
from django.db.models import Avg
from django.utils import timezone

from apps.reviews.services.availability.circuit_breaker import get_breaker
from apps.reviews.services.realtime import ReviewsEventBroadcaster

logger = logging.getLogger(__name__)

CACHE_PREFIX = 'reviews:metrics:'
CACHE_TTL = 120


class ReviewsResourceSyncService:
    @classmethod
    def _breaker(cls, name: str):
        return get_breaker(f'reviews_sync_{name}')

    @classmethod
    def count_departments(cls, tenant_id) -> int:
        def _fetch():
            from apps.structure.models import Department
            return Department.objects.filter(
                tenant_id=tenant_id, is_deleted=False,
            ).count()

        def _fallback():
            return 0

        return cls._breaker('structure').call(_fetch, _fallback)

    @classmethod
    def count_users(cls, tenant_id) -> int:
        def _fetch():
            from apps.accounts.models import User
            return User.objects.filter(
                tenant_id=tenant_id, is_active=True, is_deleted=False,
            ).count()

        return cls._breaker('accounts').call(_fetch, lambda: 0)

    @classmethod
    def avg_kpi_score(
        cls,
        tenant_id,
        *,
        year: Optional[int] = None,
        month: Optional[int] = None,
    ) -> Optional[float]:
        """Average KPI Score % for tenant in period."""

        def _fetch():
            from apps.kpi.models.calculation import Score
            now = timezone.now()
            y = year or now.year
            m = month or now.month
            agg = Score.objects.filter(
                tenant_id=tenant_id,
                year=y,
                month=m,
            ).aggregate(avg=Avg('score'))
            val = agg.get('avg')
            return float(val) if val is not None else None

        return cls._breaker('kpi').call(_fetch, lambda: None)

    @classmethod
    def kpi_scores_for_user(
        cls,
        user_id,
        tenant_id,
        start_date: date,
        end_date: date,
    ) -> List[Dict[str, Any]]:
        def _fetch():
            from apps.kpi.models.calculation import Score
            qs = Score.objects.filter(
                tenant_id=tenant_id,
                user_id=user_id,
            )
            if start_date.year == end_date.year:
                qs = qs.filter(
                    year__gte=start_date.year,
                    year__lte=end_date.year,
                    month__gte=start_date.month,
                    month__lte=end_date.month,
                )
            return [
                {
                    'year': s.year,
                    'month': s.month,
                    'score': float(s.score),
                    'kpi_id': str(s.kpi_id),
                }
                for s in qs.order_by('year', 'month')[:24]
            ]

        return cls._breaker('kpi').call(_fetch, lambda: [])

    @classmethod
    def review_cycle_stats(cls, tenant_id) -> Dict[str, int]:
        from apps.reviews.models import ReviewCycle, SelfAssessment, SupervisorReview
        active = ReviewCycle.objects.filter(tenant_id=tenant_id, status='active').count()
        pending_sa = SelfAssessment.objects.filter(
            tenant_id=tenant_id, status__in=['draft', 'submitted'],
        ).count()
        pending_sr = SupervisorReview.objects.filter(
            tenant_id=tenant_id, status__in=['draft', 'submitted'],
        ).count()
        return {
            'active_cycles': active,
            'pending_self_assessments': pending_sa,
            'pending_supervisor_reviews': pending_sr,
        }

    @classmethod
    def build_dashboard_metrics(cls, tenant_id, *, broadcast: bool = False) -> Dict[str, Any]:
        now = timezone.now()
        metrics = {
            'tenant_id': str(tenant_id),
            'departments': cls.count_departments(tenant_id),
            'users': cls.count_users(tenant_id),
            'avg_kpi_score': cls.avg_kpi_score(tenant_id, year=now.year, month=now.month),
            'synced_at': now.isoformat(),
            **cls.review_cycle_stats(tenant_id),
        }
        cache.set(f'{CACHE_PREFIX}{tenant_id}', metrics, CACHE_TTL)
        if broadcast:
            ReviewsEventBroadcaster.dashboard_metrics(tenant_id=str(tenant_id), metrics=metrics)
        return metrics

    @classmethod
    def get_cached_metrics(cls, tenant_id) -> Dict[str, Any]:
        cached = cache.get(f'{CACHE_PREFIX}{tenant_id}')
        if cached:
            return cached
        return cls.build_dashboard_metrics(tenant_id)
