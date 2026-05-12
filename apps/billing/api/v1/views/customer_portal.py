from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
from apps.billing.api.v1.serializers import (
    CustomerPortalSerializer, CustomerPortalCreateSerializer
)
from apps.billing.api.v1.permission import CanManageBilling
from apps.billing.api.v1.views.base import BillingBaseViewSet
from apps.billing.services.customer_portal_service import CustomerPortalService
from apps.billing.exceptions import SubscriptionError

class CustomerPortalViewSet(BillingBaseViewSet):
    permission_classes = [IsAuthenticated, CanManageBilling]
    def get_serializer_class(self):
        return CustomerPortalCreateSerializer
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        tenant = self.get_tenant()
        if not tenant:
            return Response(
                {'error': 'No tenant associated with user'},
                status=status.HTTP_400_BAD_REQUEST
            )
        return_url = serializer.validated_data.get('return_url')
        if not return_url:
            return_url = f"{settings.FRONTEND_URL}/billing"
        portal_service = CustomerPortalService()
        try:
            portal_data = portal_service.create_portal_session(
                tenant=tenant,
                return_url=return_url
            )
            portal_serializer = CustomerPortalSerializer(portal_data)
            return Response(portal_serializer.data, status=status.HTTP_201_CREATED)
        except SubscriptionError as e:
            return self.handle_exception(e)
        except Exception as e:
            return Response(
                {'error': f'Failed to create portal session: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )