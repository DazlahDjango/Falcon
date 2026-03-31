"""
Contact views for organisations API
"""

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend

from apps.organisations.models import Contact
from apps.organisations.api.v1.serializers.tenant import ContactSerializer
from apps.organisations.api.v1.permissions import IsClientAdmin


class ContactViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Contact model
    """
    serializer_class = ContactSerializer
    permission_classes = [IsAuthenticated, IsClientAdmin]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['contact_type', 'is_primary']
    
    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return Contact.objects.all()
        return Contact.objects.filter(organisation=user.organisation)