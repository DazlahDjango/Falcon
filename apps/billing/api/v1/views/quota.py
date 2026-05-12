from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from apps.billing.api.v1.serializers import QuotaStatusSerializer, QuotaLimitSerializer
from apps.billing.api.v1.permission import CanViewQuota, CanManageBilling
from apps.billing.api.v1.views.base import BillingBaseViewSet
from apps.billing.services.quota_service import QuotaService

class QuotaViewSet(BillingBaseViewSet):
    permission_classes = [IsAuthenticated, CanViewQuota]
    def get_serializer_class(self):
        return QuotaStatusSerializer
    def retrieve(self, request, *args, **kwargs):
        tenant = self.get_tenant()
        if not tenant:
            return Response(
                {'error': 'No tenant associated with user'},
                status=status.HTTP_400_BAD_REQUEST
            )
        quota_service = QuotaService()
        status_data = quota_service.get_quota_status(tenant)
        if not status_data:
            return Response(
                {'error': 'No quota limits found for tenant'},
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = self.get_serializer(status_data)
        return Response(serializer.data)
    @action(detail=False, methods=['post'])
    def refresh(self, request):
        tenant = self.get_tenant()
        if not tenant:
            return Response(
                {'error': 'No tenant associated with user'},
                status=status.HTTP_400_BAD_REQUEST
            )
        if request.user.role not in ['super_admin', 'client_admin']:
            return Response(
                {'error': 'Only admins can refresh quotas'},
                status=status.HTTP_403_FORBIDDEN
            )
        quota_service = QuotaService()
        usage = quota_service.refresh_usage(tenant)
        return Response({
            'message': 'Quota usage refreshed successfully',
            'snapshot_date': usage.snapshot_date.isoformat(),
            'users': usage.current_users,
            'kpis': usage.current_kpis,
            'storage_mb': usage.current_storage_mb
        })
    @action(detail=False, methods=['get'])
    def limits(self, request):
        tenant = self.get_tenant()
        if not tenant:
            return Response(
                {'error': 'No tenant associated with user'},
                status=status.HTTP_400_BAD_REQUEST
            )
        quota_service = QuotaService()
        limits = quota_service.get_limits(tenant)
        if not limits:
            return Response(
                {'error': 'No quota limits found for tenant'},
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = QuotaLimitSerializer(limits)
        usage = quota_service.get_or_create_today_usage(tenant)
        return Response({
            'limits': serializer.data,
            'current_usage': {
                'users': usage.current_users,
                'admins': usage.current_admins,
                'kpis': usage.current_kpis,
                'storage_mb': usage.current_storage_mb,
                'api_calls_today': usage.api_calls_today
            }
        })