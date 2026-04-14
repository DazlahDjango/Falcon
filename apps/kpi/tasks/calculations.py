import logging
from celery import shared_task
from typing import Dict
from apps.kpi.models import Score, TrafficLight
from apps.kpi.services import ScoreCalculator, ScoreAggregator
from apps.kpi.engine import TrafficLightEvaluator
from apps.kpi.utils import retry_on_failure, invalidate_user_dashboards, CalculationLock, invalidate_aggregation_cache
from ..exceptions import LockAcquisitionError
logger = logging.getLogger(__name__)

@shared_task(bind=True, max_retries=3, default_retry_delay=60)
@retry_on_failure(max_retries=3, delay=60, backoff_multiplier=2)
def calculate_kpi_score_task(self, user_id: str, year: int, month: int, force: bool = False) -> Dict:
    logger.info(f"Starting KPI score calculation for user_id={user_id}, period {year}-{month:02d}")
    try:
        calculator = ScoreCalculator()
        result = calculator.calculate_user(user_id, year, month, force)
        logger.info(f"Score calculation complete for user {user_id}: {result.get('score_count', 0)} scores")
        invalidate_user_dashboards(user_id)
        return result
    except Exception as e:
        logger.exception(f"Score calculation failed for user {user_id}: {e}")
        return self.retry(exc=e)
    
@shared_task(bind=True, max_retries=3, default_retry_delay=120)
def calculate_period_scores_task(self, tenant_id: str, year: int, month: int, force: bool = False) -> Dict:
    logger.info(f"Calculating period scores for tenant {tenant_id}, period {year}-{month:02d}")
    lock = CalculationLock(tenant_id, year, month)
    try:
        lock.acquire()
        calculator = ScoreCalculator()
        result = calculator.calculate_period(tenant_id, year, month, force)
        logger.info(f"Period calculation complete: {result.get('users_processed', 0)} users")
        return result
    except LockAcquisitionError:
        logger.warning(f"Calculation already in progress for {tenant_id}-{year}-{month}")
        return {'status': 'SKIPPED', 'reason': 'Already in progress'}
    finally:
        lock.release()

@shared_task(bind=True)
def update_traffic_light_task(self, score_id: str) -> None:
    try:
        score = Score.objects.select_related('kpi').get(id=score_id)
        evaluator = TrafficLightEvaluator()
        traffic = evaluator.evaluate(score.score)
        TrafficLight.objects.update_or_create(
            score=score,
            defaults={
                'status': traffic['status'],
                'score_value': score.score,
                'green_threshold': traffic['green_threshold'],
                'yellow_threshold': traffic['yellow_threshold'],
            }
        )
        logger.info(f"Traffic light updated for score {score_id}: {traffic['status']}")
    except Score.DoesNotExist:
        logger.warning(f"Score {score_id} not found for traffic light update")

@shared_task(bind=True)
def update_aggregated_scores_task(self, tenant_id: str, year: int, month: int) -> Dict:
    logger.info(f"Aggregating scores for tenant {tenant_id}, period {year}-{month:02d}")
    try:
        aggregator = ScoreAggregator()
        teams_result = aggregator.aggregate_team(tenant_id, year, month)
        logger.info(f"Aggregated {len(teams_result)} teams")
        depts_result = aggregator.aggregate_department(tenant_id, year, month)
        logger.info(f"Aggregated {len(depts_result)} departments")
        org_score = aggregator.aggregate_organization(tenant_id, year, month)
        logger.info(f"Organization aggregated score: {org_score}")
        invalidate_aggregation_cache('TEAM', tenant_id)
        invalidate_aggregation_cache('DEPARTMENT', tenant_id)
        return {
            'teams': len(teams_result),
            'departments': len(depts_result),
            'organization_score': float(org_score)
        }
    except Exception as e:
        logger.exception(f"Aggregation failed: {e}")
        raise