from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.utils import timezone
from datetime import timedelta
from django.conf import settings
from ..serializers import BillingPortalAccessSerializer, BillingPortalResponseSerializer
from ....services.decorators import tenant_isolation
from ..permissions import IsAuthenticated


class BillingPortalView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        tenant_id = request.tenant_id if hasattr(request, 'tenant_id') else request.user.tenant_id
        serializer = BillingPortalAccessSerializer(data=request.data, context={'tenant_id': tenant_id})
        serializer.is_valid(raise_exception=True)
        from apps.tenant.models import Organization
        tenant = Organization.objects.get(id=tenant_id)
        portal_url = f"{getattr(settings, 'BASE_URL', '')}/billing/portal/session?tenant={tenant_id}"
        return Response(BillingPortalResponseSerializer({'portal_url': portal_url, 'session_id': str(tenant_id), 'expires_at': timezone.now() + timedelta(hours=1)}).data)
    
    def get(self, request):
        tenant_id = request.tenant_id if hasattr(request, 'tenant_id') else request.user.tenant_id
        from ....models import Subscription
        subscription = Subscription.objects.get_current_for_tenant(tenant_id)
        if not subscription:
            return Response({'error': 'No active subscription'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'subscription_id': str(subscription.id), 'subscription_code': subscription.subscription_code, 'plan': subscription.plan.name, 'status': subscription.status, 'current_period_end': subscription.current_period_end})