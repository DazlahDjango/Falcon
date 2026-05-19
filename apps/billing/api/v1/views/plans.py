from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django.views.decorators.vary import vary_on_headers

from ....models import SubscriptionPlan
from ....services.audit.logger import audit_logger
from ..serializers import (
    PlanSerializer,
    PlanListSerializer,
    PlanDetailSerializer,
    PlanCreateSerializer,
    PlanUpdateSerializer,
)
from ..permissions import IsSuperAdmin, CanViewPlans
from ..throttles import BillingReportThrottle


class PlanViewSet(viewsets.ModelViewSet):
    """
    Plan ViewSet for subscription plans.
    
    Actions:
    - list: Get all active plans (public)
    - retrieve: Get plan details (public)
    - create: Create new plan (admin only)
    - update: Update plan (admin only)
    - partial_update: Partial update plan (admin only)
    - destroy: Delete plan (admin only)
    - popular: Get popular plan
    - compare: Compare multiple plans
    """
    
    queryset = SubscriptionPlan.objects.all()
    permission_classes = [IsAuthenticated]
    
    def get_permissions(self):
        """Set permissions based on action."""
        if self.action in ['list', 'retrieve', 'popular', 'compare']:
            permission_classes = [CanViewPlans]
        elif self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsSuperAdmin]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action == 'list':
            return PlanListSerializer
        elif self.action == 'retrieve':
            return PlanDetailSerializer
        elif self.action == 'create':
            return PlanCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return PlanUpdateSerializer
        return PlanSerializer
    
    def get_queryset(self):
        """Filter queryset based on user role and query params."""
        queryset = SubscriptionPlan.objects.all()
        
        # Only show active plans to non-admin users
        if not self.request.user.role == 'super_admin':
            queryset = queryset.filter(is_active=True)
        
        # Filter by plan type
        plan_type = self.request.query_params.get('plan_type')
        if plan_type:
            queryset = queryset.filter(plan_type=plan_type)
        
        # Filter by billing interval
        billing_interval = self.request.query_params.get('billing_interval')
        if billing_interval:
            queryset = queryset.filter(billing_interval=billing_interval)
        
        # Exclude trial from list by default
        exclude_trial = self.request.query_params.get('exclude_trial', 'true').lower() == 'true'
        if exclude_trial and not self.request.user.role == 'super_admin':
            queryset = queryset.exclude(plan_type='trial')
        
        return queryset.order_by('display_order', 'price')
    
    @method_decorator(cache_page(3600))  # Cache for 1 hour
    @method_decorator(vary_on_headers('Authorization'))
    @action(detail=False, methods=['get'])
    def popular(self, request):
        """Get the most popular plan (professional)."""
        popular_plan = SubscriptionPlan.objects.filter(
            plan_type='professional',
            is_active=True
        ).first()
        
        if not popular_plan:
            return Response(
                {'error': 'Popular plan not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = PlanDetailSerializer(popular_plan, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def compare(self, request):
        """
        Compare multiple plans.
        Expected payload: {"plan_ids": ["id1", "id2", ...]}
        """
        plan_ids = request.data.get('plan_ids', [])
        
        if not plan_ids:
            return Response(
                {'error': 'plan_ids required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if len(plan_ids) > 5:
            return Response(
                {'error': 'Cannot compare more than 5 plans at once'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        plans = SubscriptionPlan.objects.filter(id__in=plan_ids, is_active=True)
        
        if len(plans) != len(plan_ids):
            return Response(
                {'error': 'One or more plans not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = PlanSerializer(plans, many=True, context={'request': request})
        
        # Generate comparison data
        comparison = {
            'plans': serializer.data,
            'features_matrix': self._build_features_matrix(plans)
        }
        
        return Response(comparison)
    
    def _build_features_matrix(self, plans):
        """Build feature comparison matrix."""
        features = [
            'max_users', 'max_kpis', 'custom_branding', 'api_access',
            'sso_enabled', 'advanced_analytics', 'audit_logs',
            'custom_reports', 'priority_support'
        ]
        
        matrix = []
        for feature in features:
            row = {
                'feature': feature,
                'label': feature.replace('_', ' ').title(),
                'plans': {}
            }
            for plan in plans:
                if feature in ['max_users', 'max_kpis']:
                    value = getattr(plan, feature)
                    row['plans'][str(plan.id)] = 'Unlimited' if value == -1 else value
                else:
                    row['plans'][str(plan.id)] = getattr(plan, feature, False)
            matrix.append(row)
        
        return matrix
    
    def perform_create(self, serializer):
        """Create plan with audit logging."""
        instance = serializer.save()
        audit_logger.log(
            user=self.request.user,
            tenant_id=self.request.user.tenant_id,
            action='create',
            resource_type='plan',
            resource_id=instance.id,
            after={'name': instance.name, 'plan_type': instance.plan_type},
            request=self.request
        )
    
    def perform_update(self, serializer):
        """Update plan with audit logging."""
        before = self.get_object()
        instance = serializer.save()
        audit_logger.log_model_change(
            user=self.request.user,
            instance=instance,
            action='update',
            before_state={'name': before.name, 'price': before.price},
            request=self.request
        )
    
    def perform_destroy(self, instance):
        """Delete plan with audit logging."""
        audit_logger.log(
            user=self.request.user,
            tenant_id=self.request.user.tenant_id,
            action='delete',
            resource_type='plan',
            resource_id=instance.id,
            before={'name': instance.name, 'plan_type': instance.plan_type},
            request=self.request
        )
        instance.soft_delete()