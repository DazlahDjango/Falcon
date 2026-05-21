from datetime import timedelta

from django.db.models import Count
from django.utils import timezone
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter

from apps.accounts.models import LoginAttempt
from apps.accounts.api.v1.serializers.security import (
    LoginAttemptSerializer, LockoutSummarySerializer, TenantPolicySerializer,
)
from apps.accounts.api.v1.permissions.policy import IsSecurityConsoleAccess
from apps.accounts.services.policy import AccountsPolicyService
from .base import BaseReadOnlyViewset


class LoginAttemptViewSet(BaseReadOnlyViewset):
    """Failed/success login attempts for security console (tenant-scoped)."""

    queryset = LoginAttempt.objects.all()
    serializer_class = LoginAttemptSerializer
    permission_classes = [IsSecurityConsoleAccess]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['result', 'failure_reason', 'identifier', 'ip_address']
    ordering_fields = ['attempted_at']
    ordering = ['-attempted_at']

    def get_queryset(self):
        qs = LoginAttempt.objects.all()
        if not self.request.user.is_superuser:
            qs = qs.filter(user__tenant_id=self.request.user.tenant_id)
        hours = int(self.request.query_params.get('hours', 24))
        cutoff = timezone.now() - timedelta(hours=hours)
        return qs.filter(attempted_at__gte=cutoff)


class TenantPolicyView(APIView):
    permission_classes = [IsSecurityConsoleAccess]

    def get(self, request):
        client_id = str(request.user.tenant_id)
        if request.query_params.get('sync') == '1':
            pref = AccountsPolicyService.sync_tenant(client_id)
        else:
            from apps.accounts.models import TenantPreference
            pref, _ = TenantPreference.objects.get_or_create(
                client_id=client_id, defaults={'tenant_id': client_id},
            )
        policy = AccountsPolicyService.get_tenant_policy(client_id, use_cache=False)
        data = {
            'policy': policy,
            'policy_version': pref.policy_version,
            'client_id': client_id,
        }
        return Response(TenantPolicySerializer(data).data)


class LockoutSummaryView(APIView):
    permission_classes = [IsSecurityConsoleAccess]

    def get(self, request):
        qs = LoginAttempt.objects.all()
        if not request.user.is_superuser:
            qs = qs.filter(user__tenant_id=request.user.tenant_id)

        now = timezone.now()
        cutoff_15 = now - timedelta(minutes=15)
        cutoff_24 = now - timedelta(hours=24)

        failures_15 = qs.filter(
            attempted_at__gte=cutoff_15, result=LoginAttempt.FAILURE,
        ).count()
        locked_24 = qs.filter(
            attempted_at__gte=cutoff_24, result=LoginAttempt.LOCKED,
        ).count()
        ip_failures = (
            qs.filter(attempted_at__gte=cutoff_24, result=LoginAttempt.FAILURE)
            .values('ip_address')
            .distinct()
            .count()
        )
        top_ids = list(
            qs.filter(attempted_at__gte=cutoff_24, result=LoginAttempt.FAILURE)
            .values('identifier')
            .annotate(count=Count('id'))
            .order_by('-count')[:10]
        )

        lockout = AccountsPolicyService.get_lockout_config(str(request.user.tenant_id))
        payload = {
            'failures_last_15m': failures_15,
            'locked_attempts_last_24h': locked_24,
            'unique_ips_with_failures': ip_failures,
            'top_failure_identifiers': [
                {'identifier': row['identifier'], 'count': row['count']} for row in top_ids
            ],
            'lockout_policy': lockout,
        }
        return Response(LockoutSummarySerializer(payload).data)
