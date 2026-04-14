import logging
from celery import shared_task
from typing import Dict, List
from apps.accounts.models import User
from apps.kpi.models import MonthlyActual, Escalation
from apps.kpi.services import TargetCascader
from ..utils import CascadeLock
from ..exceptions import LockAcquisitionError
logger = logging.getLogger(__name__)

@shared_task(bind=True, max_retries=3)
def cascade_organization_target_task(self, org_target_id: str, rule_id: str, targets: List[Dict], user_id: str) -> Dict:
    lock = CascadeLock(org_target_id)
    try:
        lock.acquire()
        cascader = TargetCascader()
        user = User.objects.get(id=user_id)
        result = cascader.cascade_from_organization(org_target_id, rule_id, targets, user)
        logger.info(f"Cascade completed for org target {org_target_id}: {len(result)} mappings")
        return {'cascade_maps': len(result)}
    except LockAcquisitionError:
        logger.warning(f"Cascade already in progress for {org_target_id}")
        return {'status': 'SKIPPED', 'reason': 'Already in progress'}
    finally:
        lock.release()