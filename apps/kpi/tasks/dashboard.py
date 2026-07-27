import logging
from celery import shared_task
from django.utils import timezone
from django.db import connection
from typing import Dict
logger = logging.getLogger(__name__)

@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def refresh_materialized_views_task(self, tenant_id: str) -> Dict:
    from apps.kpi.models import RefreshTracker
    from apps.tenant.context import set_current_tenant_id, clear_current_tenant_id

    set_current_tenant_id(tenant_id)
    logger.info(f"Refreshing materialized views for tenant {tenant_id}")
    views = ['kpi_summary_mv', 'department_rollup_mv', 'organization_health_mv']
    results = {}

    try:
        with connection.cursor() as cursor:
            for view in views:
                try:
                    cursor.execute(f"REFRESH MATERIALIZED VIEW CONCURRENTLY {view};")
                    results[view] = 'SUCCESS'
                    logger.info(f"Refreshed {view} for tenant {tenant_id}")
                except Exception as e:
                    results[view] = f"FAILED: {str(e)}"
                    logger.warning(f"Failed to refresh {view}: {e}")

            RefreshTracker.objects.update_or_create(
                tenant_id=tenant_id,
                view_name='kpi_summary',
                defaults={'last_refresh': timezone.now(), 'status': 'SUCCESS'}
            )
        return {'status': 'SUCCESS', 'results': results}
    except Exception as e:
        logger.exception(f"Materialized view refresh failed: {e}")
        raise self.retry(exc=e)
    finally:
        clear_current_tenant_id()


@shared_task(bind=True)
def precompute_dashboard_cache_task(self, tenant_id: str, year: int, month: int) -> Dict:
    from apps.accounts.models import User
    from apps.kpi.services import IndividualDashboard, ManagerDashboard, ExecutiveDashboard
    from apps.tenant.context import set_current_tenant_id, clear_current_tenant_id

    set_current_tenant_id(tenant_id)
    logger.info(f"Precomputing dashboard cache for tenant {tenant_id}, period {year}-{month:02d}")

    processed = {'individual': 0, 'manager': 0, 'executive': 0}
    try:
        users = User.objects.filter(tenant_id=tenant_id, is_active=True)
        individual_dashboard = IndividualDashboard()
        manager_dashboard = ManagerDashboard()
        executive_dashboard = ExecutiveDashboard()

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
    except Exception as e:
        logger.exception(f"Precompute failed: {e}")
        return {'status': 'FAILED', 'error': str(e), 'processed': processed}
    finally:
        clear_current_tenant_id()