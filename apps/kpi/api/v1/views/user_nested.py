from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from ..serializers import KPIListSerializer, AnnualTargetSerializer, ScoreSerializer, MonthlyActualSerializer
from ....models import KPI, AnnualTarget, Score, MonthlyActual

User = get_user_model()

class UserViewSet(viewsets.ReadOnlyModelViewSet):
    """Simple user viewset for KPI nesting"""
    queryset = User.objects.all()
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        if hasattr(self.request, 'tenant') and self.request.tenant:
            return queryset.filter(tenant_id=self.request.tenant.id)
        return queryset

class UserKPIsViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = KPIListSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        user_id = self.kwargs.get('user_pk')
        return KPI.objects.filter(owner_id=user_id, is_active=True)

class UserTargetsViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = AnnualTargetSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        user_id = self.kwargs.get('user_pk')
        return AnnualTarget.objects.filter(user_id=user_id)

class UserScoresViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ScoreSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        user_id = self.kwargs.get('user_pk')
        return Score.objects.filter(user_id=user_id)

class UserActualsViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = MonthlyActualSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        user_id = self.kwargs.get('user_pk')
        return MonthlyActual.objects.filter(user_id=user_id)