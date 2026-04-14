import logging
from django.core.cache import cache
from celery import shared_task
from datetime import timedelta
from django.utils import timezone
from ..models import CalculationLog
logger = logging.getLogger(__name__)

@shared_task(bind=True)
def cleanup_old_calculation_logs_task(self, days_to_keep: int = 30) -> int:
    cutoff = timezone.now() - timedelta(days=days_to_keep)
    deleted = CalculationLog.objects.filter(triggered_at__lt=cutoff).delete()[0]
    logger.info(f"Deleted {deleted} old calculation logs")
    return deleted

@shared_task(bind=True)
def cleanup_expired_cache_task(self) -> None:
    cache.delete_pattern("kpi:dashboard:*")
    logger.info("Expired cache cleaned up")
