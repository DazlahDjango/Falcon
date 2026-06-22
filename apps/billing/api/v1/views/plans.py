from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django.core.cache import cache
from ....models import SubscriptionPlan
from ..serializers import PlanSerializer, PlanListSerializer, PlanDetailSerializer, PlanCreateSerializer, PlanUpdateSerializer
from ....services import DynamicPlanManagementService
from ....services.decorators import circuit_breaker, idempotent
from ..permissions import IsSuperAdmin, IsAuthenticated

class PlanViewSet(viewsets.ModelViewSet):
    queryset = SubscriptionPlan.objects.filter(is_deleted=False)
    serializer_class = PlanSerializer
    permission_classes = [IsAuthenticated]
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'sync_to_paystack']:
            self.permission_classes = [IsSuperAdmin]
        elif self.action in ['list', 'retrieve']:
            self.permission_classes = [IsAuthenticated]
        return super().get_permissions()
    
    def get_serializer_class(self):
        if self.action == 'list':
            return PlanListSerializer
        if self.action == 'retrieve':
            return PlanDetailSerializer
        if self.action == 'create':
            return PlanCreateSerializer
        if self.action in ['update', 'partial_update']:
            return PlanUpdateSerializer
        return PlanSerializer
    
    def get_queryset(self):
        user = self.request.user
        queryset = super().get_queryset()
        if user and (user.is_superuser or user.role == 'super_admin'):
            return queryset
        return queryset.filter(is_active=True)
    
    def list(self, request, *args, **kwargs):
        cache_key = f"plans_list_{request.user.id}"
        cached = cache.get(cache_key)
        if cached:
            return Response(cached)
        response = super().list(request, *args, **kwargs)
        cache.set(cache_key, response.data, 300)
        return response
    
    @action(detail=True, methods=['post'], url_path='sync-to-paystack')
    def sync_to_paystack(self, request, pk=None):
        plan = self.get_object()
        service = DynamicPlanManagementService()
        service._sync_to_paystack(plan)
        return Response({'status': 'synced', 'plan_code': plan.paystack_plan_code})
    
    @action(detail=False, methods=['get'], url_path='public')
    def public_plans(self, request):
        cache_key = 'public_plans_v2'
        cached = cache.get(cache_key)
        if cached:
            return Response(cached)
        plans = SubscriptionPlan.objects.filter(is_active=True, is_deleted=False).exclude(plan_type='trial').order_by('display_order', 'price')
        serializer = PlanDetailSerializer(plans, many=True)
        cache.set(cache_key, serializer.data, 3600)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path='comparison')
    def plan_comparison(self, request):
        try:
            plans = SubscriptionPlan.objects.filter(is_active=True, is_deleted=False).exclude(plan_type='trial').order_by('display_order', 'price')
            result = []
            for plan in plans:
                # Get features safely
                if hasattr(plan, 'features_list_display'):
                    features = plan.features_list_display
                elif plan.features_list:
                    features = plan.features_list
                else:
                    features = []
                
                result.append({
                    'id': str(plan.id),
                    'name': plan.name,
                    'plan_type': plan.plan_type,
                    'price_monthly': plan.price,
                    'price_monthly_display': f"{plan.currency} {plan.price/100:.2f}",
                    'price_yearly': plan.yearly_price,
                    'price_yearly_display': f"{plan.currency} {plan.yearly_price/100:.2f}" if plan.yearly_price else None,
                    'max_users': plan.max_users,
                    'max_kpis': plan.max_kpis,
                    'features': features,
                    'is_popular': plan.plan_type == 'professional'
                })
            return Response(result)
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({'error': str(e), 'traceback': traceback.format_exc()}, status=500)