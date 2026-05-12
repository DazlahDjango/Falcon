from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from apps.billing.models import Plan
from apps.billing.api.v1.serializers import PlanSerializer, PlanDetailSerializer, PlanListSerializer, PlanCompareSerializer
from apps.billing.api.v1.permission import CanViewBilling
from .base import BillingBaseViewSet
from apps.billing.services import PlanService

class PlanViewSet(BillingBaseViewSet):
    queryset = Plan.objects.filter(is_active=True, is_deleted=False)
    permission_classes = [IsAuthenticated]
    def get_serializer_class(self):
        if self.action == 'list':
            return PlanListSerializer
        if self.action == 'retrieve':
            return PlanDetailSerializer
        if self.action == 'compare':
            return PlanCompareSerializer
        return PlanSerializer
    def get_queryset(self):
        queryset = Plan.objects.filter(is_deleted=False)
        if not self.request.user or not self.request.user.is_authenticated:
            return queryset.filter(is_active=True)
        return queryset
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset().filter(is_active=True)
        serializer = PlanListSerializer(queryset, many=True)
        service = PlanService()
        recomended = service.get_recommended_plan()
        return Response({
            'plans': serializer.data,
            'recommended_plan_id': str(recomended.id) if recomended else None,
            'count': len(serializer.data)
        })
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = PlanDetailSerializer(instance)
        similar_plans = Plan.objects.filter(
            is_active=True,
            is_deleted=False,
        ).exclude(id=instance.id)[:3]
        return Response({
            'plan': serializer.data,
            'similar_plans': PlanListSerializer(similar_plans, many=True).data
        })
    @action(detail=False, methods=['post'], url_path='compare', url_name='compare')
    def compare(self, request):
        serializer = PlanCompareSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        plan_ids = serializer.validated_data['plan_ids']
        plans = []
        for plan_id in plan_ids:
            plan = get_object_or_404(Plan, id=plan_id, is_deleted=False)
            plans.append(plan)
        comparison = {
            'plans': [],
            'features': {}
        }
        for plan in plans:
            comparison['plans'].append({
                'id': str(plan.id),
                'name': plan.name,
                'plan_type': plan.plan_type,
                'price_monthly': float(plan.price_monthly),
                'price_yearly': float(plan.price_yearly),
                'currency': plan.currency,
                'trial_days': plan.trial_days,
                'is_recommended': plan.is_recommended
            })
            for feature in plan.features.filter(is_deleted=False):
                if feature.name not in comparison['features']:
                    comparison['features'][feature.name] = []
                comparison['features'][feature.name].append(feature.value or '—')
        for feature_name, values in comparison['features'].items():
            while len(values) < len(plans):
                values.append('—')
        return Response(comparison)
    @action(detail=True, methods=['post'])
    def features(self, request, pk=None):
        plan = self.get_object()
        service = PlanService()
        features = service.get_plan_features(plan)
        return Response({
            'plan_id': str(plan.id),
            'plan_name': plan.name,
            'features': features,
            'count': len(features)
        })