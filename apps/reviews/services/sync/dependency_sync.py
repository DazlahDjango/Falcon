"""
Recalculate review-related data when Structure / Accounts / KPI change.
"""

import logging
from typing import Optional

from apps.reviews.services.settings import ReviewsSettingsService
from apps.reviews.services.sync.resource_sync import ReviewsResourceSyncService
from apps.reviews.services.realtime import ReviewsEventBroadcaster

logger = logging.getLogger(__name__)


class ReviewsDependencySyncService:
    @classmethod
    def on_department_changed(cls, tenant_id, department_id: Optional[str] = None) -> None:
        if not ReviewsSettingsService.get_section('dependencies').get('sync_structure_on_change', True):
            return
        metrics = ReviewsResourceSyncService.build_dashboard_metrics(
            tenant_id, broadcast=True,
        )
        ReviewsEventBroadcaster.dependency_sync(
            tenant_id=str(tenant_id),
            source='structure',
            payload={'department_id': department_id, 'departments': metrics.get('departments')},
        )

    @classmethod
    def on_user_changed(cls, tenant_id, user_id: Optional[str] = None) -> None:
        if not ReviewsSettingsService.get_section('dependencies').get('sync_accounts_on_change', True):
            return
        metrics = ReviewsResourceSyncService.build_dashboard_metrics(
            tenant_id, broadcast=True,
        )
        ReviewsEventBroadcaster.dependency_sync(
            tenant_id=str(tenant_id),
            source='accounts',
            payload={'user_id': user_id, 'users': metrics.get('users')},
        )

    @classmethod
    def on_kpi_score_changed(
        cls,
        tenant_id,
        user_id: Optional[str] = None,
        *,
        recalculate_final_ratings: bool = False,
    ) -> None:
        deps = ReviewsSettingsService.get_section('dependencies')
        if not deps.get('sync_kpi_on_change', True):
            return
        avg = ReviewsResourceSyncService.avg_kpi_score(tenant_id)
        ReviewsEventBroadcaster.dependency_sync(
            tenant_id=str(tenant_id),
            source='kpi',
            payload={'user_id': user_id, 'avg_kpi_score': avg},
        )
        if recalculate_final_ratings and deps.get('recalculate_on_kpi_change', True):
            cls._recalculate_open_final_ratings(tenant_id, user_id)

    @classmethod
    def _recalculate_open_final_ratings(cls, tenant_id, user_id: Optional[str]) -> None:
        try:
            from apps.reviews.models import FinalRating
            from apps.reviews.services.assessment.final_rating_service import FinalRatingService
            qs = FinalRating.objects.filter(
                tenant_id=tenant_id,
                status__in=['draft', 'submitted', 'under_review'],
            )
            if user_id:
                qs = qs.filter(employee_id=user_id)
            for fr in qs[:50]:
                try:
                    FinalRatingService.recalculate_kpi_component(fr.id)
                except Exception as exc:
                    logger.debug('KPI recalc skip %s: %s', fr.id, exc)
        except Exception as exc:
            logger.warning('Final rating KPI recalc failed: %s', exc)

    @classmethod
    def sync_all_for_tenant(cls, tenant_id, *, broadcast: bool = True) -> dict:
        return ReviewsResourceSyncService.build_dashboard_metrics(
            tenant_id, broadcast=broadcast,
        )
