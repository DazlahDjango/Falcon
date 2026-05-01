"""
Celery tasks for Tenant app.
Following the same pattern as Accounts tasks.
"""

import logging
from datetime import datetime, timedelta
from django.utils import timezone
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
from celery import shared_task
from django.db import transaction
from apps.tenant.models import Client, TenantBackup

logger = logging.getLogger(__name__)


# ============================================================================
# EMAIL TASKS
# ============================================================================

@shared_task(name='tenant.send_welcome_email')
def send_welcome_email(tenant_id, admin_email, admin_name):
    """
    Send welcome email to tenant admin after provisioning.
    """
    try:
        tenant = Client.objects.get(id=tenant_id, is_deleted=False)

        subject = f"Welcome to Falcon PMS - {tenant.name}"
        context = {
            'tenant': tenant,
            'admin_name': admin_name,
            'dashboard_url': f"{settings.FRONTEND_URL}/dashboard",
            'support_email': settings.DEFAULT_FROM_EMAIL,
            'setup_guide_url': f"{settings.FRONTEND_URL}/docs/setup"
        }

        html_content = render_to_string('tenant/email/welcome.html', context)
        text_content = f"Welcome {tenant.name}! Access your dashboard at {context['dashboard_url']}"

        send_mail(
            subject=subject,
            message=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[admin_email],
            html_message=html_content,
            fail_silently=False
        )

        logger.info(
            f"Welcome email sent to {admin_email} for tenant {tenant.name}")
        return True

    except Exception as e:
        logger.error(
            f"Failed to send welcome email to {admin_email}: {str(e)}")
        return False


@shared_task(name='tenant.send_backup_complete_email')
def send_backup_complete_email(tenant_id, backup_id, file_size_mb):
    """
    Send notification when tenant backup is complete.
    """
    try:
        tenant = Client.objects.get(id=tenant_id, is_deleted=False)
        backup = TenantBackup.objects.get(id=backup_id)

        subject = f"Backup Complete - {tenant.name}"
        context = {
            'tenant': tenant,
            'backup': backup,
            'file_size_mb': file_size_mb,
            'backup_url': f"{settings.FRONTEND_URL}/settings/backups",
            'support_email': settings.DEFAULT_FROM_EMAIL
        }

        html_content = render_to_string(
            'tenant/email/backup_complete.html', context)
        text_content = f"Backup for {tenant.name} completed. Size: {file_size_mb} MB"

        # Send to tenant admin (would need to get admin email)
        send_mail(
            subject=subject,
            message=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[
                tenant.contact_email] if tenant.contact_email else [],
            html_message=html_content,
            fail_silently=True
        )

        logger.info(f"Backup complete email sent for tenant {tenant.name}")
        return True

    except Exception as e:
        logger.error(f"Failed to send backup complete email: {str(e)}")
        return False


@shared_task(name='tenant.send_backup_failed_email')
def send_backup_failed_email(tenant_id, error_message):
    """
    Send alert when tenant backup fails.
    """
    try:
        tenant = Client.objects.get(id=tenant_id, is_deleted=False)

        subject = f"BACKUP FAILED - {tenant.name}"
        context = {
            'tenant': tenant,
            'error_message': error_message,
            'support_email': settings.DEFAULT_FROM_EMAIL,
            'retry_url': f"{settings.FRONTEND_URL}/settings/backups/retry"
        }

        html_content = render_to_string(
            'tenant/email/backup_failed.html', context)
        text_content = f"Backup failed for {tenant.name}: {error_message}"

        send_mail(
            subject=subject,
            message=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[
                tenant.contact_email] if tenant.contact_email else [],
            html_message=html_content,
            fail_silently=False
        )

        logger.info(f"Backup failed email sent for tenant {tenant.name}")
        return True

    except Exception as e:
        logger.error(f"Failed to send backup failed email: {str(e)}")
        return False


@shared_task(name='tenant.send_quota_warning_email')
def send_quota_warning_email(tenant_id, resource_type, current, limit):
    """
    Send warning when tenant approaches resource limit.
    """
    try:
        from apps.tenant.models import Tenant

        tenant = Client .objects.get(id=tenant_id, is_deleted=False)

        percentage = (current / limit) * 100 if limit > 0 else 0

        subject = f"Quota Warning - {tenant.name}"
        context = {
            'tenant': tenant,
            'resource_type': resource_type,
            'current': current,
            'limit': limit,
            'percentage': round(percentage, 1),
            'upgrade_url': f"{settings.FRONTEND_URL}/settings/billing",
            'support_email': settings.DEFAULT_FROM_EMAIL
        }

        html_content = render_to_string(
            'tenant/email/quota_warning.html', context)
        text_content = f"{tenant.name} is at {percentage:.1f}% of {resource_type} limit"

        send_mail(
            subject=subject,
            message=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[
                tenant.contact_email] if tenant.contact_email else [],
            html_message=html_content,
            fail_silently=True
        )

        logger.info(f"Quota warning email sent for tenant {tenant.name}")
        return True

    except Exception as e:
        logger.error(f"Failed to send quota warning email: {str(e)}")
        return False


# ============================================================================
# PROVISIONING TASKS
# ============================================================================

@shared_task(name='tenant.provision_tenant')
def provision_tenant(tenant_id):
    """
    Provision a new tenant - create schema, run migrations, seed data.
    """
    try:
        from apps.tenant.models import Client
        from apps.tenant.services.provisioning.provisioner import TenantProvisioner
        from apps.tenant.constants import TenantStatus

        tenant = Client.objects.get(id=tenant_id, is_deleted=False)

        if tenant.status != TenantStatus.PENDING:
            logger.warning(f"Tenant {tenant_id} is not pending")
            return False

        provisioner = TenantProvisioner(tenant_id)
        provisioner.provision()

        logger.info(f"Tenant {tenant_id} provisioned successfully")

        # Send welcome email to tenant admin
        if tenant.contact_email:
            send_welcome_email.delay(
                tenant_id, tenant.contact_email, tenant.name)

        return True

    except Exception as e:
        logger.error(f"Failed to provision tenant {tenant_id}: {str(e)}")
        return False


@shared_task(name='tenant.suspend_tenant')
def suspend_tenant(tenant_id):
    """
    Suspend a tenant - block access.
    """
    try:
        from apps.tenant.models import Tenant
        from apps.tenant.constants import TenantStatus

        tenant = Tenant.objects.get(id=tenant_id, is_deleted=False)
        tenant.status = TenantStatus.SUSPENDED
        tenant.save(update_fields=['status'])

        # Clear cache
        from django.core.cache import cache
        cache.delete(f"tenant_{tenant_id}")

        logger.info(f"Tenant {tenant_id} suspended")
        return True

    except Exception as e:
        logger.error(f"Failed to suspend tenant {tenant_id}: {str(e)}")
        return False


@shared_task(name='tenant.activate_tenant')
def activate_tenant(tenant_id):
    """
    Activate a suspended tenant.
    """
    try:
        from apps.tenant.models import Tenant
        from apps.tenant.constants import TenantStatus

        tenant = Tenant.objects.get(id=tenant_id, is_deleted=False)
        tenant.status = TenantStatus.ACTIVE
        tenant.save(update_fields=['status'])

        logger.info(f"Tenant {tenant_id} activated")
        return True

    except Exception as e:
        logger.error(f"Failed to activate tenant {tenant_id}: {str(e)}")
        return False


# ============================================================================
# DOMAIN TASKS
# ============================================================================

@shared_task(name='tenant.verify_domain')
def verify_domain(domain_id):
    """
    Verify domain ownership via DNS.
    """
    try:
        from apps.tenant.models import CustomDomain
        from apps.tenant.services.domain.dns_validator import DNSValidator
        from apps.tenant.services.domain.domain_service import DomainService

        domain = CustomDomain.objects.get(id=domain_id, is_deleted=False)

        validator = DNSValidator()
        service = DomainService()

        is_verified = validator.verify_domain(
            domain.domain, str(domain.verification_token))

        if is_verified:
            service.verify_domain(domain_id)
            logger.info(f"Domain {domain.domain} verified")
            return True

        logger.warning(f"Domain {domain.domain} verification pending")
        return False

    except Exception as e:
        logger.error(f"Failed to verify domain {domain_id}: {str(e)}")
        return False


# ============================================================================
# BACKUP TASKS
# ============================================================================

@shared_task(name='tenant.backup_tenant')
def backup_tenant(tenant_id):
    """
    Create backup for a single tenant.
    """
    try:
        from apps.tenant.models import Tenant
        from apps.tenant.services.backup.backup_manager import BackupManager

        tenant = Tenant.objects.get(id=tenant_id, is_deleted=False)
        manager = BackupManager()
        backup = manager.create_backup(tenant_id, backup_type='full')

        # Send notification
        if backup.file_size_mb:
            send_backup_complete_email.delay(
                tenant_id, backup.id, backup.file_size_mb)

        logger.info(f"Backup created for tenant {tenant_id}")
        return True

    except Exception as e:
        logger.error(f"Failed to backup tenant {tenant_id}: {str(e)}")
        send_backup_failed_email.delay(tenant_id, str(e))
        return False


@shared_task(name='tenant.backup_all_tenants')
def backup_all_tenants():
    """
    Backup all active tenants (scheduled task).
    """
    try:
        from apps.tenant.models import Tenant
        from apps.tenant.constants import TenantStatus

        tenants = Tenant.objects.filter(
            status=TenantStatus.ACTIVE, is_deleted=False)

        success_count = 0
        fail_count = 0

        for tenant in tenants:
            result = backup_tenant.delay(str(tenant.id))
            if result:
                success_count += 1
            else:
                fail_count += 1

        logger.info(
            f"Backup scheduled for {success_count} tenants, {fail_count} failed")
        return {'success': success_count, 'failed': fail_count}

    except Exception as e:
        logger.error(f"Failed to backup all tenants: {str(e)}")
        return {'error': str(e)}


# ============================================================================
# CLEANUP TASKS
# ============================================================================

@shared_task(name='tenant.cleanup_expired_backups')
def cleanup_expired_backups():
    """
    Delete expired backups.
    """
    try:
        from apps.tenant.services.backup.retention_policy import RetentionPolicy

        policy = RetentionPolicy()
        result = policy.cleanup_expired_backups()

        logger.info(f"Cleaned up {result.get('deleted', 0)} expired backups")
        return result

    except Exception as e:
        logger.error(f"Failed to cleanup expired backups: {str(e)}")
        return {'error': str(e)}


@shared_task(name='tenant.reset_daily_api_counts')
def reset_daily_api_counts():
    """
    Reset daily API call counts for all tenants.
    """
    try:
        from apps.tenant.models import Tenant

        count = Tenant.objects.filter(
            current_api_calls_today__gt=0
        ).update(
            current_api_calls_today=0,
            last_api_reset=timezone.now()
        )

        logger.info(f"Reset API counts for {count} tenants")
        return {'reset': count}

    except Exception as e:
        logger.error(f"Failed to reset API counts: {str(e)}")
        return {'error': str(e)}


@shared_task(name='tenant.cleanup_failed_provisioning')
def cleanup_failed_provisioning(days_old=1):
    """
    Clean up tenants that failed provisioning.
    """
    try:
        from apps.tenant.models import Tenant
        from apps.tenant.constants import TenantStatus

        cutoff = timezone.now() - timedelta(days=days_old)

        failed_tenants = Tenant.objects.filter(
            status=TenantStatus.FAILED,
            created_at__lt=cutoff,
            is_deleted=False
        )

        count = failed_tenants.count()
        failed_tenants.delete()

        logger.info(f"Cleaned up {count} failed provisioning tenants")
        return {'deleted': count}

    except Exception as e:
        logger.error(f"Failed to cleanup failed provisioning: {str(e)}")
        return {'error': str(e)}


# ============================================================================
# MONITORING TASKS
# ============================================================================

@shared_task(name='tenant.check_tenant_health')
def check_tenant_health():
    """
    Check health of all tenants (scheduled monitoring).
    """
    try:
        from apps.tenant.models import Tenant
        from apps.tenant.services.monitoring.health_check import HealthCheck

        health = HealthCheck()
        results = health.check_all_tenants()

        degraded = results.get('degraded_tenants', 0)

        if degraded > 0:
            logger.warning(f"Found {degraded} degraded tenants")

            # Send alert to super admins
            for tenant in results.get('tenants', []):
                if tenant.get('status') == 'degraded':
                    logger.warning(
                        f"Tenant {tenant.get('tenant_name')} is degraded")

        return results

    except Exception as e:
        logger.error(f"Failed to check tenant health: {str(e)}")
        return {'error': str(e)}


@shared_task(name='tenant.check_quota_warnings')
def check_quota_warnings():
    """
    Check for tenants near quota limits and send warnings.
    """
    try:
        from apps.tenant.models import TenantResource

        warnings_sent = 0

        resources = TenantResource.objects.filter(is_deleted=False)

        for resource in resources:
            if resource.limit_value > 0:
                percentage = (resource.current_value /
                              resource.limit_value) * 100

                if percentage >= 80:
                    send_quota_warning_email.delay(
                        resource.tenant_id,
                        resource.resource_type,
                        resource.current_value,
                        resource.limit_value
                    )
                    warnings_sent += 1

        logger.info(f"Sent {warnings_sent} quota warnings")
        return {'warnings_sent': warnings_sent}

    except Exception as e:
        logger.error(f"Failed to check quota warnings: {str(e)}")
        return {'error': str(e)}


# ============================================================================
# MAINTENANCE TASKS
# ============================================================================

@shared_task(name='tenant.run_daily_maintenance')
def run_daily_maintenance():
    """
    Run all daily maintenance tasks.
    """
    try:
        results = {
            'api_reset': reset_daily_api_counts.delay().get(timeout=60),
            'backup_cleanup': cleanup_expired_backups.delay().get(timeout=60),
            'health_check': check_tenant_health.delay().get(timeout=60),
            'quota_warnings': check_quota_warnings.delay().get(timeout=60),
        }

        logger.info("Daily maintenance completed")
        return results

    except Exception as e:
        logger.error(f"Daily maintenance failed: {str(e)}")
        return {'error': str(e)}


@shared_task(name='tenant.run_weekly_maintenance')
def run_weekly_maintenance():
    """
    Run all weekly maintenance tasks.
    """
    try:
        from apps.tenant.services.domain.ssl_manager import SSLManager

        manager = SSLManager()
        ssl_results = manager.renew_expiring_certificates(
            days_before_expiry=30)

        results = {
            'ssl_renewal': ssl_results,
            'backup_all': backup_all_tenants.delay().get(timeout=300),
            'cleanup_failed': cleanup_failed_provisioning.delay().get(timeout=60),
        }

        logger.info("Weekly maintenance completed")
        return results

    except Exception as e:
        logger.error(f"Weekly maintenance failed: {str(e)}")
        return {'error': str(e)}
