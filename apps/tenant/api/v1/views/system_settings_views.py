from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from apps.accounts.api.v1.permissions.policy import IsSuperAdminOrReadOnly
from apps.accounts.api.v1.permissions import IsSuperAdmin
from apps.tenant.api.v1.serializers.system_settings import TenantSystemSettingsSerializer
from apps.tenant.services.settings import TenantSettingsService
from apps.tenant.services.realtime import TenantEventBroadcaster


class TenantSystemSettingsView(APIView):
    permission_classes = [IsSuperAdminOrReadOnly]

    def get(self, request):
        record = TenantSettingsService.get_record()
        return Response(TenantSystemSettingsSerializer(record).data)

    def patch(self, request):
        record = TenantSettingsService.get_record()
        serializer = TenantSystemSettingsSerializer(
            record, data=request.data, partial=True, context={'request': request},
        )
        serializer.is_valid(raise_exception=True)
        record = serializer.save()
        TenantEventBroadcaster.policy_updated(version=record.version)
        return Response(TenantSystemSettingsSerializer(record).data)

    def put(self, request):
        return self.patch(request)


class TenantSystemSettingsResetView(APIView):
    permission_classes = [IsSuperAdmin]

    def post(self, request):
        record = TenantSettingsService.reset_to_defaults(user_id=str(request.user.id))
        TenantEventBroadcaster.policy_updated(version=record.version)
        return Response(
            TenantSystemSettingsSerializer(record).data,
            status=status.HTTP_200_OK,
        )
