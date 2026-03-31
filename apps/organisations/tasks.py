"""
Celery tasks for organisations app
"""

from celery import shared_task
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)


@shared_task
def provision_new_organisation(organisation_id):
    """
    Async task to provision a new organisation
    - Create default departments
    - Set up default roles
    - Create default KPI templates
    - Send welcome email
    """
    from .models.organisation import Organisation
    
    try:
        org = Organisation.objects.get(id=organisation_id)
        logger.info(f"Starting provisioning for organisation: {org.name}")
        
        # TODO: Implement actual provisioning logic
        # 1. Create default departments
        # 2. Set up default roles and permissions
        # 3. Create default KPI templates based on sector
        # 4. Send welcome email
        
        return f"Successfully provisioned organisation: {org.name}"
    except Organisation.DoesNotExist:
        error_msg = f"Organisation {organisation_id} not found"
        logger.error(error_msg)
        return error_msg


@shared_task
def check_expiring_subscriptions():
    """
    Check for subscriptions expiring in the next 30 days
    Send reminder emails
    """
    from .models.subscription import Subscription
    
    now = timezone.now()
    expiry_threshold = now + timezone.timedelta(days=30)
    
    expiring_subs = Subscription.objects.filter(
        end_date__lte=expiry_threshold,
        end_date__gt=now,
        status='active'
    )
    
    logger.info(f"Found {expiring_subs.count()} expiring subscriptions")
    
    for sub in expiring_subs:
        # TODO: Send reminder email
        logger.info(f"Subscription for {sub.organisation.name} expires on {sub.end_date}")
        pass
    
    return f"Checked {expiring_subs.count()} expiring subscriptions"


@shared_task
def process_subscription_renewals():
    """
    Process auto-renewing subscriptions
    """
    from .models.subscription import Subscription
    
    today = timezone.now().date()
    
    # Find subscriptions that expire today and are set to auto-renew
    renewing_subs = Subscription.objects.filter(
        end_date__date=today,
        auto_renew=True,
        status='active'
    )
    
    logger.info(f"Processing {renewing_subs.count()} renewals")
    
    for sub in renewing_subs:
        # TODO: Process renewal via Stripe
        logger.info(f"Processing renewal for {sub.organisation.name}")
        pass
    
    return f"Processed {renewing_subs.count()} renewals"


@shared_task
def cleanup_expired_trials():
    """
    Clean up expired trial organisations
    """
    from .models.organisation import Organisation
    from .constants import OrganisationStatus
    
    expired_trials = Organisation.objects.filter(
        status=OrganisationStatus.TRIAL,
        subscription__trial_end_date__lt=timezone.now()
    )
    
    count = expired_trials.count()
    
    for org in expired_trials:
        org.status = OrganisationStatus.EXPIRED
        org.save()
        logger.info(f"Expired trial for organisation: {org.name}")
    
    return f"Cleaned up {count} expired trials"