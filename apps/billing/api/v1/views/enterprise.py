from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from ....models import TenantSubscriptionOverride, Subscription, SubscriptionPlan
from ..serializers import TenantOverrideSerializer, TenantOverrideCreateSerializer, TenantOverrideUpdateSerializer, DynamicPlanSerializer, DynamicFeatureSerializer
from ....services.subscription.enterprise_override import EnterpriseOverrideService
from ....services.subscription.plan_management import DynamicPlanManagementService
from ..permissions import IsSuperAdmin

class EnterpriseOverrideViewSet(viewsets.ModelViewSet):
    queryset = TenantSubscriptionOverride.objects.filter(is_deleted=False)
    serializer_class = TenantOverrideSerializer
    permission_classes = [IsSuperAdmin]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return TenantOverrideCreateSerializer
        if self.action in ['update', 'partial_update']:
            return TenantOverrideUpdateSerializer
        return TenantOverrideSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        tenant_id = serializer.validated_data['tenant_id']
        plan = get_object_or_404(SubscriptionPlan, id=serializer.validated_data['plan_id'])
        subscription = Subscription.objects.get_current_for_tenant(tenant_id)
        service = EnterpriseOverrideService()
        override = service.create_override(tenant_id=tenant_id, subscription=subscription, plan=plan, approved_by=request.user.id, custom_price_monthly=serializer.validated_data.get('custom_price_monthly'), custom_price_yearly=serializer.validated_data.get('custom_price_yearly'), override_features=serializer.validated_data.get('override_features', {}), valid_until=serializer.validated_data.get('valid_until'), discount_percentage=float(serializer.validated_data['discount_percentage']) if serializer.validated_data.get('discount_percentage') else None)
        return Response(TenantOverrideSerializer(override).data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'], url_path='active/(?P<tenant_id>[^/.]+)')
    def get_active_override(self, request, tenant_id=None):
        subscription = Subscription.objects.get_current_for_tenant(tenant_id)
        if not subscription:
            return Response({'has_override': False})
        service = EnterpriseOverrideService()
        override = service.get_active_override(tenant_id, subscription)
        if override:
            return Response(TenantOverrideSerializer(override).data)
        return Response({'has_override': False})
    
    @action(detail=False, methods=['post'], url_path='expire')
    def expire_overrides(self, request):
        service = EnterpriseOverrideService()
        count = service.expire_overrides()
        return Response({'expired_count': count})
    
    @action(detail=False, methods=['post'], url_path='dynamic-plans/create')
    def create_dynamic_plan(self, request):
        serializer = DynamicPlanSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        service = DynamicPlanManagementService()
        plan = service.create_plan(serializer.validated_data, created_by=request.user.id)
        from ..serializers import PlanDetailSerializer
        return Response(PlanDetailSerializer(plan).data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['put'], url_path='dynamic-plans/(?P<plan_id>[^/.]+)')
    def update_dynamic_plan(self, request, plan_id=None):
        serializer = DynamicPlanSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        service = DynamicPlanManagementService()
        plan = service.update_plan(plan_id, serializer.validated_data, updated_by=request.user.id)
        from ..serializers import PlanDetailSerializer
        return Response(PlanDetailSerializer(plan).data)
    
    @action(detail=False, methods=['get'], url_path='dynamic-plans/all')
    def list_dynamic_plans(self, request):
        service = DynamicPlanManagementService()
        plans = service.get_all_plans(include_inactive=request.user.is_superuser)
        return Response(plans)