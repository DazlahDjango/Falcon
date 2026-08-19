from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from ....models import Subscription, SubscriptionPlan
from ..serializers import SubscriptionSerializer, SubscriptionListSerializer, SubscriptionDetailSerializer, SubscriptionCreateSerializer, SubscriptionUpdateSerializer, SubscriptionCancelSerializer, SubscriptionRenewSerializer
from ....services import SubscriptionLifecycleService, TrialService, PlanChangeService, UsageTrackingService
from ....services.decorators import audit_log
from ..permissions import IsSuperAdmin, IsClientAdmin, IsAuthenticated

class SubscriptionViewSet(viewsets.ModelViewSet):
    queryset = Subscription.objects.filter(is_deleted=False)
    serializer_class = SubscriptionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_permissions(self):
        if self.action in ['destroy', 'cancel_immediate', 'admin_cancel']:
            self.permission_classes = [IsSuperAdmin]
        elif self.action in ['list', 'retrieve']:
            self.permission_classes = [IsAuthenticated]
        else:
            self.permission_classes = [IsClientAdmin]
        return super().get_permissions()
    
    def get_serializer_class(self):
        if self.action == 'list':
            return SubscriptionListSerializer
        if self.action == 'retrieve':
            return SubscriptionDetailSerializer
        if self.action == 'create':
            return SubscriptionCreateSerializer
        if self.action in ['update', 'partial_update']:
            return SubscriptionUpdateSerializer
        return SubscriptionSerializer
    
    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or user.role == 'super_admin':
            qs = super().get_queryset()
            tenant_id = self.request.query_params.get('tenant_id')
            if tenant_id:
                qs = qs.filter(tenant_id=tenant_id)
            return qs
        if hasattr(self.request, 'tenant_id'):
            return super().get_queryset().filter(tenant_id=self.request.tenant_id)
        return super().get_queryset().filter(tenant_id=user.tenant_id)
    
    @audit_log('create', 'subscription')
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'tenant_id': request.tenant_id if hasattr(request, 'tenant_id') else request.user.tenant_id, 'request': request})
        serializer.is_valid(raise_exception=True)
        plan = SubscriptionPlan.objects.get_by_id(serializer.validated_data['plan_id'])
        lifecycle = SubscriptionLifecycleService()
        subscription = lifecycle.create_subscription(tenant_id=request.tenant_id if hasattr(request, 'tenant_id') else request.user.tenant_id, plan=plan, trial_days=serializer.validated_data.get('trial_days', 14))
        return Response(SubscriptionDetailSerializer(subscription).data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'], url_path='cancel')
    def cancel_subscription(self, request, pk=None):
        subscription = self.get_object()
        serializer = SubscriptionCancelSerializer(data=request.data, context={'subscription': subscription})
        serializer.is_valid(raise_exception=True)
        lifecycle = SubscriptionLifecycleService()
        result = lifecycle.cancel_subscription(subscription, at_period_end=serializer.validated_data['at_period_end'])
        return Response(SubscriptionDetailSerializer(result).data)
    
    @action(detail=True, methods=['post'], url_path='cancel-immediate')
    def cancel_immediate(self, request, pk=None):
        subscription = self.get_object()
        lifecycle = SubscriptionLifecycleService()
        result = lifecycle.cancel_subscription(subscription, at_period_end=False)
        return Response(SubscriptionDetailSerializer(result).data)
    
    @action(detail=True, methods=['post'], url_path='renew')
    def renew_subscription(self, request, pk=None):
        subscription = self.get_object()
        serializer = SubscriptionRenewSerializer(data=request.data, context={'subscription': subscription})
        serializer.is_valid(raise_exception=True)
        lifecycle = SubscriptionLifecycleService()
        result = lifecycle.renew_subscription(subscription)
        return Response(SubscriptionDetailSerializer(result).data)
    
    @action(detail=True, methods=['post'], url_path='upgrade/(?P<new_plan_id>[^/.]+)')
    def upgrade_plan(self, request, pk=None, new_plan_id=None):
        subscription = self.get_object()
        new_plan = get_object_or_404(SubscriptionPlan, id=new_plan_id, is_active=True)
        immediate = request.data.get('immediate', True)
        service = PlanChangeService()
        result = service.upgrade_plan(subscription, new_plan, immediate=immediate)
        return Response(SubscriptionDetailSerializer(result).data)
    
    @action(detail=True, methods=['post'], url_path='downgrade/(?P<new_plan_id>[^/.]+)')
    def downgrade_plan(self, request, pk=None, new_plan_id=None):
        subscription = self.get_object()
        new_plan = get_object_or_404(SubscriptionPlan, id=new_plan_id, is_active=True)
        immediate = request.data.get('immediate', False)
        service = PlanChangeService()
        result = service.downgrade_plan(subscription, new_plan, immediate=immediate)
        return Response(SubscriptionDetailSerializer(result).data)
    
    @action(detail=False, methods=['get'], url_path='current')
    def current_subscription(self, request):
        tenant_id = request.tenant_id if hasattr(request, 'tenant_id') else request.user.tenant_id
        subscription = Subscription.objects.get_current_for_tenant(tenant_id)
        if not subscription:
            return Response({'has_active_subscription': False}, status=status.HTTP_200_OK)
        return Response(SubscriptionDetailSerializer(subscription).data)
    
    @action(detail=True, methods=['get'], url_path='usage')
    def get_usage(self, request, pk=None):
        subscription = self.get_object()
        service = UsageTrackingService()
        usage = service.get_usage_summary(subscription)
        return Response(usage)
    
    @action(detail=True, methods=['post'], url_path='extend-trial')
    def extend_trial(self, request, pk=None):
        subscription = self.get_object()
        extra_days = request.data.get('extra_days', 7)
        service = TrialService()
        if not service.can_extend_trial(subscription):
            return Response({'error': 'Trial cannot be extended'}, status=status.HTTP_400_BAD_REQUEST)
        result = service.extend_trial(subscription, extra_days)
        return Response(SubscriptionDetailSerializer(result).data)
    
    @action(detail=False, methods=['post'], url_path='admin/cancel')
    def admin_cancel(self, request):
        tenant_id = request.data.get('tenant_id')
        reason = request.data.get('reason', 'Admin action')
        subscription = Subscription.objects.get_current_for_tenant(tenant_id)
        if not subscription:
            return Response({'error': 'No active subscription found'}, status=status.HTTP_404_NOT_FOUND)
        lifecycle = SubscriptionLifecycleService()
        result = lifecycle.cancel_subscription(subscription, at_period_end=False)
        return Response({'status': 'cancelled', 'subscription_id': str(result.id)})