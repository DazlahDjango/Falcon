"""
Contact model for organisation contacts
"""

from django.db import models
from .base import BaseTenantModel
from .organisation import Organisation
from apps.organisations.managers import ContactManager


class Contact(BaseTenantModel):
    """
    Manages specific contact points for an organization.
    """
    objects = ContactManager()

    organisation = models.ForeignKey(
        Organisation,
        on_delete=models.CASCADE,
        related_name='contacts'
    )

    CONTACT_TYPE_CHOICES = [
        ('primary', 'Primary Contact'),
        ('billing', 'Billing Contact'),
        ('technical', 'Technical Contact'),
        ('admin', 'Administrative Contact'),
        ('legal', 'Legal Contact'),
        ('support', 'Support Contact'),
    ]

    contact_type = models.CharField(
        max_length=20, choices=CONTACT_TYPE_CHOICES, db_index=True)
    name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True)
    position = models.CharField(
        max_length=100, blank=True, help_text="Job position/title")
    is_primary = models.BooleanField(default=False, db_index=True)
    receives_notifications = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Contact"
        verbose_name_plural = "Contacts"
        ordering = ['-is_primary', 'contact_type', 'name']
        indexes = [
            models.Index(fields=['organisation', 'contact_type']),
            models.Index(fields=['organisation', 'is_primary']),
        ]

    def __str__(self):
        return f"{self.name} ({self.get_contact_type_display()})"

    def save(self, *args, **kwargs):
        """Ensure only one primary contact per organisation per type"""
        if self.is_primary:
            Contact.objects.filter(
                organisation=self.organisation,
                contact_type=self.contact_type,
                is_primary=True
            ).exclude(pk=self.pk).update(is_primary=False)
        super().save(*args, **kwargs)
