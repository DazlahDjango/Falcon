"""
Registration view for new organisations
"""

from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.db import transaction
from datetime import timedelta
from django.utils import timezone

from apps.organisations.models import Organisation, Subscription, Plan
from apps.organisations.api.v1.serializers.tenant import OrganisationSerializer
from apps.organisations.constants import OrganisationStatus, SubscriptionStatus, PlanCode
from apps.organisations.tasks import provision_new_organisation


class OrganisationRegistrationView(generics.CreateAPIView):
    """
    Public endpoint for new organisation registration
    Creates a new organisation with a trial subscription
    """
    serializer_class = OrganisationSerializer
    permission_classes = [AllowAny]
    
    @transaction.atomic
    def create(self, request, *args, **kwargs):
        # Create the organisation
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Set initial status
        serializer.validated_data['status'] = OrganisationStatus.PENDING
        
        organisation = serializer.save()
        
        # Get the basic plan for trial
        basic_plan = Plan.objects.filter(code=PlanCode.BASIC, is_active=True).first()
        
        if basic_plan:
            # Create trial subscription
            Subscription.objects.create(
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
        
        # Trigger async provisioning
        provision_new_organisation.delay(str(organisation.id))
        
        return Response(
            {
                'message': 'Organisation created successfully',
                'organisation': OrganisationSerializer(organisation).data,
                'next_steps': 'Check your email for setup instructions'
            },
            status=status.HTTP_201_CREATED
        )