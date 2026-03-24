from django.db import transaction
from apps.organisations.models.organisation import Organisation
from apps.organisations.models.subscription import Subscription
from apps.organisations.models.settings import OrganisationSettings
from apps.organisations.models.domain import Domain
from apps.organisations.models.department import Department

class TenantProvisioningService:
    @staticmethod
    def provision_new_tenant(name, slug, domain_name):
        """
        Creates the complete core suite for a new Organisation/Tenant.
        Sets up the Tenant record, an initial Starter subscription, default settings,
        a primary domain mapping, and the root 'Head Office' Department.
        """
        with transaction.atomic():
            # 1. Core Tenant
            org = Organisation.objects.create(name=name, slug=slug)
            
            # 2. Add default subscription
            Subscription.objects.create(organisation=org, plan_type='STARTER')
            
            # 3. Add default settings
            OrganisationSettings.objects.create(organisation=org)
            
            # 4. Bind primary domain
            Domain.objects.create(organisation=org, domain_name=domain_name, is_primary=True)
            
            # 5. Create default Root Department
            Department.objects.create(
                organisation=org, 
                name="Head Office", 
                description="Default Root Department"
            )
            
            return org
