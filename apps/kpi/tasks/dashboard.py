import logging
from celery import shared_task
from django.utils import timezone
from django.db import connection
from typing import Dict, List
from apps.accounts.models import User
from apps.kpi.models import RefreshTracker
from apps.kpi.services import IndividualDashboard, ManagerDashboard, ExecutiveDashboard
logger = logging.getLogger(__name__)

@shared_task(bind=True)
def refresh_materialized_views_task(self, tenant_id: str) -> None:
    logger.info(f"Refreshing materialized views for tenant {tenant_id}")
    try:
        with connection.cursor() as cursor:
            cursor.execute("REFRESH MATERIALIZED VIEW CONCURRENTLY kpi_summary_mv")
            cursor.execute("REFRESH MATERIALIZED VIEW CONCURRENTLY department_rollup_mv")
            cursor.execute("REFRESH MATERIALIZED VIEW CONCURRENTLY organization_health_mv")
            RefreshTracker.objects.update_or_create(
                tenant_id=tenant_id,
                view_name='kpi_summary',
                defaults={'last_refresh': timezone.now(), 'status': 'SUCCESS'}
            )
            logger.info(f"Materialized views refreshed for tenant {tenant_id}")
    except Exception as e:
        logger.exception(f"Materialized view refresh failed: {e}")
        raise

@shared_task(bind=True)
def precompute_dashboard_cache_task(self, tenant_id: str, year: int, month: int) -> Dict:
    logger.info(f"Precomputing dashboard cache for tenant {tenant_id}, period {year}-{month:02d}")
    users = User.objects.filter(tenant_id=tenant_id, is_active=True)
    individual_dashboard = IndividualDashboard()
    manager_dashboard = ManagerDashboard()
    executive_dashboard = ExecutiveDashboard()
    processed = {
        'individual': 0,
        'manager': 0,
        'executive': 0
    }
    for user in users:
        individual_dashboard.get_dashboard(str(user.id), year, month)
        processed['individual'] += 1
        if user.get_direct_reports().exists():
            manager_dashboard.get_dashboard(str(user.id), year, month)
            processed['manager'] += 1
    executive_dashboard.get_dashboard(tenant_id, year, month)
    processed['executive'] = 1
    logger.info(f"Dashboard cache precomputed: {processed}")
    return processed