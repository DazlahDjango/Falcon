import logging
from celery import shared_task
from typing import Dict, List
from django.core.cache import cache
logger = logging.getLogger(__name__)

class CascadeLock:
    def __init__(self, target_id: str, timeout: int = 300):
        self.lock_key = f"kpi:cascade_lock:{target_id}"
        self.timeout = timeout

    def acquire(self) -> bool:
        return cache.add(self.lock_key, "locked", self.timeout)

    def release(self) -> None:
        cache.delete(self.lock_key)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def cascade_organization_target_task(self, org_target_id: str, rule_id: str, targets: List[Dict], user_id: str) -> Dict:
    from apps.accounts.models import User
    from apps.kpi.services import TargetCascader

    lock = CascadeLock(org_target_id)
    try:
        if not lock.acquire():
            logger.warning(f"Cascade already in progress for {org_target_id}")
            return {'status': 'SKIPPED', 'reason': 'Already in progress'}

        user = User.objects.get(id=user_id)
        cascader = TargetCascader()
        result = cascader.cascade_from_organization(org_target_id, rule_id, targets, user)

        logger.info(f"Cascade completed for org target {org_target_id}: {len(result)} mappings")
        return {'status': 'SUCCESS', 'cascade_maps': len(result)}
    except Exception as e:
        logger.exception(f"Cascade failed for {org_target_id}: {e}")
        raise self.retry(exc=e)
    finally:
        lock.release()