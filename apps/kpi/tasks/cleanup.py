from typing import Dict
import logging
from django.core.cache import cache
from celery import shared_task
from datetime import timedelta
from django.utils import timezone

logger = logging.getLogger(__name__)


@shared_task(bind=True)
def cleanup_old_calculation_logs_task(self, days_to_keep: int = 30) -> Dict:
    from apps.kpi.models import CalculationLog

    try:
        cutoff = timezone.now() - timedelta(days=days_to_keep)
        deleted, _ = CalculationLog.objects.filter(triggered_at__lt=cutoff).delete()
        logger.info(f"Deleted {deleted} old calculation logs")
        return {'status': 'SUCCESS', 'deleted': deleted}
    except Exception as e:
        logger.exception(f"Cleanup failed: {e}")
        return {'status': 'FAILED', 'error': str(e)}


@shared_task(bind=True)
def cleanup_expired_cache_task(self) -> Dict:
    from apps.kpi.utils.cache_keys import safe_delete_pattern
    try:
        safe_delete_pattern("kpi:dashboard:*")
        safe_delete_pattern("kpi:aggregation:*")
        logger.info("Expired cache cleaned up")
        return {'status': 'SUCCESS'}
    except Exception as e:
        logger.exception(f"Cache cleanup failed: {e}")
        return {'status': 'FAILED', 'error': str(e)}