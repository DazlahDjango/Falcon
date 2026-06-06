import logging
from celery import shared_task
from typing import Dict, Optional
from django.core.cache import cache
logger = logging.getLogger(__name__)

class CalculationLock:
    def __init__(self, tenant_id: str, year: int, month: int, timeout: int = 300):
        self.lock_key = f"kpi:calc_lock:{tenant_id}:{year}:{month}"
        self.timeout = timeout

    def acquire(self) -> bool:
        return cache.add(self.lock_key, "locked", self.timeout)

    def release(self) -> None:
        cache.delete(self.lock_key)


def invalidate_user_dashboards(user_id: str) -> None:
    try:
        cache.delete_pattern(f"kpi_dashboard:*{user_id}*")
    except Exception:
        pass


def invalidate_aggregation_cache(level: str, tenant_id: str) -> None:
    try:
        cache.delete_pattern(f"kpi_aggregation:{level}:{tenant_id}*")
    except Exception:
        pass


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def calculate_kpi_score_task(self, user_id: str, year: int, month: int, force: bool = False) -> Dict:
    from apps.kpi.services import ScoreCalculator

    logger.info(f"Starting KPI score calculation for user_id={user_id}, period {year}-{month:02d}")
    try:
        calculator = ScoreCalculator()
        result = calculator.calculate_user(user_id, year, month, force)
        logger.info(f"Score calculation complete for user {user_id}: {result.get('score_count', 0)} scores")
        invalidate_user_dashboards(user_id)
        return result
    except Exception as e:
        logger.exception(f"Score calculation failed for user {user_id}: {e}")
        raise self.retry(exc=e)


@shared_task(bind=True, max_retries=3, default_retry_delay=120)
def calculate_period_scores_task(self, tenant_id: str, year: int, month: int, force: bool = False) -> Dict:
    from apps.kpi.services import ScoreCalculator

    logger.info(f"Calculating period scores for tenant {tenant_id}, period {year}-{month:02d}")
    lock = CalculationLock(tenant_id, year, month)

    try:
        if not lock.acquire():
            logger.warning(f"Calculation already in progress for {tenant_id}-{year}-{month}")
            return {'status': 'SKIPPED', 'reason': 'Already in progress'}

        calculator = ScoreCalculator()
        result = calculator.calculate_period(tenant_id, year, month, force)
        logger.info(f"Period calculation complete: {result.get('users_processed', 0)} users")
        return result
    except Exception as e:
        logger.exception(f"Period calculation failed: {e}")
        raise self.retry(exc=e)
    finally:
        lock.release()


@shared_task(bind=True, max_retries=2, default_retry_delay=30)
def update_traffic_light_task(self, score_id: str) -> Optional[Dict]:
    from apps.kpi.models import Score, TrafficLight
    from apps.kpi.engine.traffic_light import TrafficLightEvaluator

    try:
        score = Score.objects.select_related('kpi', 'user').get(id=score_id)
        evaluator = TrafficLightEvaluator()
        traffic = evaluator.evaluate(score.score)

        tl, created = TrafficLight.objects.update_or_create(
            score=score,
            defaults={
                'status': traffic['status'],
                'score_value': score.score,
                'green_threshold': traffic['green_threshold'],
                'yellow_threshold': traffic['yellow_threshold'],
            }
        )
        logger.info(f"Traffic light updated for score {score_id}: {traffic['status']}")
        return {'score_id': score_id, 'status': traffic['status'], 'created': created}
    except Score.DoesNotExist:
        logger.warning(f"Score {score_id} not found for traffic light update")
        return None
    except Exception as e:
        logger.exception(f"Traffic light update failed: {e}")
        raise self.retry(exc=e)


@shared_task(bind=True, max_retries=2, default_retry_delay=60)
def update_aggregated_scores_task(self, tenant_id: str, year: int, month: int) -> Dict:
    from apps.kpi.services import ScoreAggregator

    logger.info(f"Aggregating scores for tenant {tenant_id}, period {year}-{month:02d}")
    try:
        aggregator = ScoreAggregator()
        teams_result = aggregator.aggregate_teams(tenant_id, year, month)
        depts_result = aggregator.aggregate_departments(tenant_id, year, month)
        org_score = aggregator.aggregate_organization(tenant_id, year, month)

        invalidate_aggregation_cache('TEAM', tenant_id)
        invalidate_aggregation_cache('DEPARTMENT', tenant_id)

        return {
            'teams': len(teams_result) if teams_result else 0,
            'departments': len(depts_result) if depts_result else 0,
            'organization_score': float(org_score) if org_score else 0
        }
    except Exception as e:
        logger.exception(f"Aggregation failed: {e}")
        raise self.retry(exc=e)