from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from ....models import Subscription, UsageRecord
from ..serializers import UsageTrackSerializer, UsageSummarySerializer, UsageRecordSerializer
from ....services.usage.service import UsageTrackingService
from ....services.decorators import tenant_isolation, audit_log
from ..permissions import IsClientAdmin, IsAuthenticated

class UsageViewSet(viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated]
    
    def get_permissions(self):
        if self.action in ['track', 'summary']:
            self.permission_classes = [IsClientAdmin]
        else:
            self.permission_classes = [IsAuthenticated]
        return super().get_permissions()
    
    @action(detail=False, methods=['post'], url_path='track')
    @audit_log('track', 'usage')
    def track_usage(self, request):
        serializer = UsageTrackSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        tenant_id = request.tenant_id if hasattr(request, 'tenant_id') else request.user.tenant_id
        subscription = Subscription.objects.get_current_for_tenant(tenant_id)
        if not subscription or not subscription.is_active:
            return Response({'error': 'No active subscription'}, status=status.HTTP_402_PAYMENT_REQUIRED)
        service = UsageTrackingService()
        result = service.track_usage(tenant_id, subscription, serializer.validated_data['usage_type'], serializer.validated_data.get('delta', 1))
        return Response(result)
    
    @action(detail=False, methods=['get'], url_path='summary')
    def usage_summary(self, request):
        tenant_id = request.tenant_id if hasattr(request, 'tenant_id') else request.user.tenant_id
        subscription = Subscription.objects.get_current_for_tenant(tenant_id)
        if not subscription:
            return Response({'has_active_subscription': False})
        service = UsageTrackingService()
        usage = service.get_usage_summary(subscription)
        return Response({'subscription_id': str(subscription.id), 'period_start': subscription.current_period_start, 'period_end': subscription.current_period_end, 'days_remaining': subscription.days_until_expiry, 'usage': usage, 'alerts': []})
    
    @action(detail=False, methods=['get'], url_path='limits')
    def current_limits(self, request):
        tenant_id = request.tenant_id if hasattr(request, 'tenant_id') else request.user.tenant_id
        subscription = Subscription.objects.get_current_for_tenant(tenant_id)
        if not subscription:
            return Response({'error': 'No active subscription'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'plan': subscription.plan.name, 'plan_type': subscription.plan.plan_type, 'limits': {'max_users': subscription.plan.max_users, 'max_kpis': subscription.plan.max_kpis, 'max_departments': subscription.plan.max_departments, 'max_storage_mb': subscription.plan.max_storage_mb, 'api_rate_limit': 1000, 'custom_branding': subscription.plan.custom_branding, 'api_access': subscription.plan.api_access, 'sso_enabled': subscription.plan.sso_enabled, 'advanced_analytics': subscription.plan.advanced_analytics, 'priority_support': subscription.plan.priority_support}})