from django.db.models.signals import post_save
from django.dispatch import receiver
from .models.organisation import Organisation
from .services.provisioning import OrganisationProvisioningService

@receiver(post_save, sender=Organisation)
def auto_provision_organisation(sender, instance, created, **kwargs):
    """
    Automatically sets up a new organisation when created.
    """
    if created:
        OrganisationProvisioningService.setup_new_organisation(instance)
