"""
Tenant Creator Service - Handles new organisation setup
"""

import logging
from django.db import transaction
from django.utils import timezone
from datetime import timedelta

from apps.organisations.models import (
    Organisation, Subscription, Plan, OrganisationSettings, Branding
)
from apps.organisations.constants import OrganisationStatus, SubscriptionStatus, PlanCode

logger = logging.getLogger(__name__)


class TenantCreatorService:
    """
    Service for creating and provisioning new tenant organisations
    """
    
    @classmethod
    @transaction.atomic
    def create_organisation(cls, data, user=None):
        """
        Create a new organisation with all necessary defaults
        
        Args:
            data: dict with organisation data (name, contact_email, sector, etc.)
            user: Optional user to associate as creator
        
        Returns:
            Organisation: The created organisation
        """
        # Create the organisation
        organisation = Organisation.objects.create(
            name=data.get('name'),
            contact_email=data.get('contact_email'),
            sector=data.get('sector', 'commercial'),
            status=OrganisationStatus.PENDING,
            is_active=True,
            **{k: v for k, v in data.items() if k in [
                'website', 'contact_phone', 'address', 'city', 'country',
                'industry', 'company_size', 'registration_number', 'tax_id'
            ]}
        )
        
        logger.info(f"Created organisation: {organisation.name} (ID: {organisation.id})")
        
        # Create default settings
        cls._create_default_settings(organisation)
        
        # Create default branding
        cls._create_default_branding(organisation)
        
        # Create trial subscription
        cls._create_trial_subscription(organisation)
        
        return organisation
    
    @classmethod
    def _create_default_settings(cls, organisation):
        """Create default settings for the organisation"""
        settings = OrganisationSettings.objects.create(
            organisation=organisation,
            theme_color='#3B82F6',
            secondary_color='#10B981',
            accent_color='#F59E0B',
            timezone='UTC',
            language='en',
            currency='USD',
            date_format='DD/MM/YYYY',
            review_cycle='annual',
            self_assessment_due_days=7,
            supervisor_review_due_days=14,
            modules_enabled={
                'kpi_tracking': True,
                'basic_reports': True,
                'pip': False,
                'tasks': False,
                '360_reviews': False,
            },
            rating_scale={'1': 'Poor', '2': 'Fair', '3': 'Good', '4': 'Very Good', '5': 'Excellent'},
            data_entry_deadline_day=5,
            fiscal_year_start=1,
            max_users=10,
            is_onboarding_complete=False,
        )
        logger.info(f"Created default settings for: {organisation.name}")
        return settings
    
    @classmethod
    def _create_default_branding(cls, organisation):
        """Create default branding for the organisation"""
        branding = Branding.objects.create(
            organisation=organisation,
            theme_color='#3B82F6',
            secondary_color='#10B981',
            accent_color='#F59E0B',
            font_family='Inter',
            is_white_labeled=False,
            powered_by_falcon=True,
        )
        logger.info(f"Created default branding for: {organisation.name}")
        return branding
    
    @classmethod
    def _create_trial_subscription(cls, organisation):
        """Create a trial subscription for the new organisation"""
        # Get the basic plan
        basic_plan = Plan.objects.filter(code=PlanCode.BASIC, is_active=True).first()
        
        if not basic_plan:
            logger.warning("No basic plan found for trial subscription")
            return None
        
        subscription = Subscription.objects.create(
            organisation=organisation,
            plan=basic_plan,
            plan_type=PlanCode.BASIC,
            status=SubscriptionStatus.TRIALING,
            start_date=timezone.now(),
            trial_end_date=timezone.now() + timedelta(days=14),
            end_date=timezone.now() + timedelta(days=14),
            auto_renew=False,
            is_active=True
        )
        logger.info(f"Created trial subscription for: {organisation.name} (expires in 14 days)")
        return subscription