import logging
from datetime import timedelta
from django.utils import timezone
from celery import shared_task
from django.db import transaction
from django.core.cache import cache
from .models import Organization, OrganizationDomain, OrganizationResource, ResourceUsageSnapshot
from .constants import OrganizationStatus

logger = logging.getLogger(__name__)


@shared_task(name='organization.provision_organization', bind=True, max_retries=3, default_retry_delay=60)
def provision_organization(self, organization_id):
    """
    Async provisioning entry point. Delegates to ProvisioningService.
    Retries on transient failures; FAILED status is set by the service on hard failure.
    """
    try:
        from .services import ProvisioningService
        from .constants import OrganizationStatus

        org = Organization.objects.get(id=organization_id, is_deleted=False)

        if org.is_provisioned:
            logger.info("Organization %s already provisioned — skipping", organization_id)
            return True

        if org.status == OrganizationStatus.PROVISIONING:
            logger.warning("Organization %s already provisioning — skipping duplicate task", organization_id)
            return False

        if org.status not in (OrganizationStatus.PENDING, OrganizationStatus.FAILED):
            logger.warning(
                "Organization %s status is %s — cannot provision",
                organization_id, org.status,
            )
            return False

        from celery import chain
        # Trigger modular step execution pipeline
        chain(
            create_schema_step_task.s(organization_id),
            apply_migrations_step_task.s(organization_id),
            seed_initial_data_step_task.s(organization_id),
            notify_provisioning_complete_task.s(organization_id)
        ).apply_async(link_error=rollback_provisioning_task.s(organization_id))
        logger.info("Organization %s provisioning chain dispatched", organization_id)
        return True
    except Exception as exc:
        logger.error("Provision failed for %s: %s", organization_id, exc)
        try:
            raise self.retry(exc=exc)
        except self.MaxRetriesExceededError:
            logger.error("Max retries exceeded for organization %s provisioning", organization_id)
            return False

@shared_task(name='organization.create_schema_step')
def create_schema_step_task(organization_id):
    from .services import ProvisioningService
    ProvisioningService().create_schema_step(organization_id)
    return organization_id

@shared_task(name='organization.apply_migrations_step')
def apply_migrations_step_task(organization_id):
    from .services import ProvisioningService
    ProvisioningService().apply_migrations_step(organization_id)
    return organization_id

@shared_task(name='organization.seed_initial_data_step')
def seed_initial_data_step_task(organization_id):
    from .services import ProvisioningService
    ProvisioningService().seed_initial_data_step(organization_id)
    return organization_id

@shared_task(name='organization.notify_provisioning_complete')
def notify_provisioning_complete_task(organization_id):
    from .services import ProvisioningService
    ProvisioningService().notify_provisioning_complete_step(organization_id)
    return True

@shared_task(name='organization.rollback_provisioning')
def rollback_provisioning_task(request, exc, traceback, organization_id):
    from .services import ProvisioningService
    logger.error("Provisioning rollback triggered for org %s due to error: %s", organization_id, exc)
    try:
        org = Organization.objects.get(id=organization_id)
        ProvisioningService()._rollback_provisioning(organization_id, org.schema_name, str(exc))
    except Exception as e:
        logger.error("Failed to execute rollback for org %s: %s", organization_id, e)



@shared_task(name='organization.verify_domain')
def verify_domain(domain_id):
    try:
        from .services import DomainService
        domain = OrganizationDomain.objects.get(id=domain_id, is_deleted=False)
        service = DomainService()
        result = service.verify_domain(domain_id)
        if result.status == 'ACTIVE':
            logger.info(f"Domain {domain.domain} verified")
            return True
        logger.warning(f"Domain {domain.domain} verification failed")
        return False
    except Exception as e:
        logger.error(f"Domain verification failed {domain_id}: {str(e)}")
        return False


@shared_task(name='organization.initialize_schema')
def initialize_schema(schema_id):
    try:
        from .services import SchemaService
        service = SchemaService()
        service.provision_schema(schema_id)
        logger.info(f"Schema {schema_id} initialized")
        return True
    except Exception as e:
        logger.error(f"Schema init failed {schema_id}: {str(e)}")
        return False


@shared_task(name='organization.suspend_organization')
def suspend_organization(organization_id):
    try:
        org = Organization.objects.get(id=organization_id, is_deleted=False)
        org.status = 'SUSPENDED'
        org.is_active = False
        org.save(update_fields=['status', 'is_active'])
        cache.delete(f"organization_{organization_id}")
        logger.info(f"Organization {organization_id} suspended")
        return True
    except Exception as e:
        logger.error(f"Suspend failed {organization_id}: {str(e)}")
        return False


@shared_task(name='organization.activate_organization')
def activate_organization(organization_id):
    try:
        org = Organization.objects.get(id=organization_id, is_deleted=False)
        org.status = 'ACTIVE'
        org.is_active = True
        org.save(update_fields=['status', 'is_active'])
        logger.info(f"Organization {organization_id} activated")
        return True
    except Exception as e:
        logger.error(f"Activation failed {organization_id}: {str(e)}")
        return False


@shared_task(name='organization.reset_daily_api_counts')
def reset_daily_api_counts():
    """Reset API_CALLS_PER_DAY counters for all organizations with audit log."""
    try:
        from .services import ResourceService
        service = ResourceService()
        result = service.reset_daily_limits()
        logger.info(f"Daily API reset: {result}")
        return result
    except Exception as e:
        logger.error(f"API reset failed: {str(e)}")
        return {'error': str(e)}


@shared_task(name='organization.check_quota_warnings')
def check_quota_warnings():
    """
    Scan all resources and fire quota warning signals for any that have crossed
    80/90/100% thresholds since the last run. Delegates to ResourceService._fire_alerts().
    """
    try:
        from .services import ResourceService
        service = ResourceService()
        warnings = 0
        resources = OrganizationResource.objects.filter(
            is_deleted=False, limit_value__gt=0
        ).select_related('organization')
        for resource in resources:
            old_80 = resource.alert_80_sent_at
            old_90 = resource.alert_90_sent_at
            old_100 = resource.alert_100_sent_at
            service._fire_alerts(resource, resource.organization_id)
            resource.refresh_from_db()
            if (resource.alert_80_sent_at != old_80
                    or resource.alert_90_sent_at != old_90
                    or resource.alert_100_sent_at != old_100):
                warnings += 1
        logger.info(f"Quota warning scan complete: {warnings} new alerts fired")
        return {'warnings_fired': warnings}
    except Exception as e:
        logger.error(f"Quota check failed: {str(e)}")
        return {'error': str(e)}


@shared_task(name='organization.sync_resource_limits_from_billing')
def sync_resource_limits_from_billing():
    """
    Periodic task: re-sync all OrganizationResource.limit_value from billing
    plans and enterprise overrides. Run every 6 hours via Celery Beat.
    """
    try:
        from .services import ResourceService
        service = ResourceService()
        result = service.sync_limits_from_billing()
        logger.info(f"Billing sync task complete: {result}")
        return result
    except Exception as e:
        logger.error(f"Billing sync task failed: {str(e)}")
        return {'error': str(e)}


@shared_task(name='organization.take_resource_snapshots')
def take_resource_snapshots(snapshot_type='daily'):
    """
    Periodic task: write ResourceUsageSnapshot for every active resource.
    Run hourly for 'hourly' type, daily for 'daily' type.
    """
    try:
        from .services import ResourceService
        service = ResourceService()
        result = service.take_all_snapshots(snapshot_type=snapshot_type)
        logger.info(f"Snapshot task complete ({snapshot_type}): {result}")
        return result
    except Exception as e:
        logger.error(f"Snapshot task failed: {str(e)}")
        return {'error': str(e)}


@shared_task(name='organization.forecast_resource_exhaustion')
def forecast_resource_exhaustion():
    """
    Periodic task: compute projected exhaustion for all resources and fire
    pre-emptive quota_warning signals when exhaustion is predicted within 14 days.
    Run daily.
    """
    try:
        from .services import ResourceService
        from .signals.resource_signals import resource_quota_warning
        service = ResourceService()
        alerted = 0
        resources = OrganizationResource.objects.filter(
            is_deleted=False, limit_value__gt=0
        )
        for resource in resources:
            trend = ResourceUsageSnapshot.objects.trend_values(
                resource.organization_id, resource.resource_type, days=7
            )
            projected = service._project_exhaustion(trend, resource)
            if projected is not None and 0 < projected <= 14:
                resource_quota_warning.send(
                    sender=OrganizationResource,
                    resource=resource,
                    organization_id=resource.organization_id,
                    level='forecast',
                    percentage=resource.percentage_used,
                    projected_days=projected,
                )
                alerted += 1
                logger.info(
                    f"Forecast alert: {resource.resource_type} for org "
                    f"{resource.organization_id} → exhausted in ~{projected} days"
                )
        logger.info(f"Forecast task complete: {alerted} pre-emptive alerts")
        return {'forecast_alerts': alerted}
    except Exception as e:
        logger.error(f"Forecast task failed: {str(e)}")
        return {'error': str(e)}


@shared_task(name='organization.detect_stuck_provisioning')
def detect_stuck_provisioning_task(timeout_minutes=15):
    """Scan and recover organizations stuck in PROVISIONING state."""
    try:
        from .services import ProvisioningService
        service = ProvisioningService()
        recovered = service.detect_stuck_provisioning_tasks(timeout_minutes=timeout_minutes)
        logger.info(f"Stuck provisioning cleanup: {recovered} organizations recovered.")
        return {'recovered_count': recovered}
    except Exception as e:
        logger.error(f"Stuck provisioning task failed: {str(e)}")
        return {'error': str(e)}


@shared_task(name='organization.cleanup_idle_connections')
def cleanup_idle_connections_task(idle_minutes=30):
    """Periodic task: close database connections idle for > idle_minutes."""
    try:
        from .services import ConnectionService
        service = ConnectionService()
        closed_count = service.close_idle_connections(idle_minutes=idle_minutes)
        logger.info(f"Idle connection cleanup: {closed_count} idle connection records closed.")
        return {'closed_count': closed_count}
    except Exception as e:
        logger.error(f"Idle connection cleanup task failed: {str(e)}")
        return {'error': str(e)}


@shared_task(name='organization.auto_renew_ssl_certificates')
def auto_renew_ssl_certificates_task(days_before_expiry=30):
    """Periodic task: auto-renew self-signed or CA SSL certificates expiring within days_before_expiry."""
    try:
        from .services import DomainService
        service = DomainService()
        expiring_domains = OrganizationDomain.objects.filter(
            status='ACTIVE',
            is_deleted=False,
            ssl_expires_at__lte=timezone.now() + timedelta(days=days_before_expiry)
        )
        renewed_count = 0
        for domain in expiring_domains:
            try:
                service.renew_ssl(domain.id)
                renewed_count += 1
                logger.info(f"Auto-renewed SSL for domain: {domain.domain}")
            except Exception as exc:
                logger.error(f"Auto-renewal failed for domain {domain.domain}: {exc}")

        return {'renewed_count': renewed_count}
    except Exception as e:
        logger.error(f"SSL auto-renewal task failed: {str(e)}")
        return {'error': str(e)}


@shared_task(name='organization.run_daily_maintenance')
def run_daily_maintenance():
    """Orchestrate all daily maintenance tasks."""
    try:
        results = {
            'api_reset': reset_daily_api_counts.delay().get(timeout=60),
            'quota_warnings': check_quota_warnings.delay().get(timeout=120),
            'snapshots': take_resource_snapshots.delay('daily').get(timeout=120),
            'forecast': forecast_resource_exhaustion.delay().get(timeout=120),
            'stuck_provisioning': detect_stuck_provisioning_task.delay().get(timeout=120),
            'idle_connections': cleanup_idle_connections_task.delay().get(timeout=120),
            'ssl_renewals': auto_renew_ssl_certificates_task.delay().get(timeout=120),
        }
        logger.info("Daily maintenance completed")
        return results
    except Exception as e:
        logger.error(f"Maintenance failed: {str(e)}")
        return {'error': str(e)}