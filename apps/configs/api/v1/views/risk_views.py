from rest_framework import viewsets
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter
from apps.configs.models import RiskAssessment
from apps.configs.api.v1.serializers import RiskAssessmentSerializer
from apps.configs.api.v1.permissions import IsSuperAdmin, IsConfigAccess
from apps.configs.api.v1.throttles import ConfigReadThrottle
from apps.configs.api.v1.filters import RiskAssessmentFilter

class RiskAssessmentViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = RiskAssessment.objects.all().select_related('app')
    serializer_class = RiskAssessmentSerializer
    permission_classes = [IsConfigAccess]
    throttle_classes = [ConfigReadThrottle]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = RiskAssessmentFilter
    ordering_fields = ['risk_score', 'assessed_at', 'expires_at']
    ordering = ['-risk_score', '-assessed_at']

    def get_queryset(self):
        qs = super().get_queryset()
        current_only = self.request.query_params.get('current_only', 'true')
        if current_only.lower() == 'true':
            from django.utils import timezone
            return qs.filter(expires_at__gt=timezone.now())
        return qs