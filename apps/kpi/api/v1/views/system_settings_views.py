# system_settings.py
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from apps.accounts.api.v1.permissions.policy import IsSuperAdminOrReadOnly
from apps.accounts.api.v1.permissions import IsSuperAdmin
from apps.kpi.api.v1.serializers.system_settings import KpiSystemSettingsSerializer
from apps.kpi.services.settings import KpiSettingsService


class KpiSystemSettingsView(APIView):
    permission_classes = [IsSuperAdminOrReadOnly]

    def get(self, request):
        record = KpiSettingsService.get_record()
        serializer = KpiSystemSettingsSerializer(record)
        return Response(serializer.data)

    def patch(self, request):
        record = KpiSettingsService.get_record()
        serializer = KpiSystemSettingsSerializer(
            record, data=request.data, partial=True, context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        record = serializer.save()
        return Response(KpiSystemSettingsSerializer(record).data)


class KpiSystemSettingsResetView(APIView):
    permission_classes = [IsSuperAdmin]

    def post(self, request):
        record = KpiSettingsService.reset_to_defaults(user_id=str(request.user.id))
        serializer = KpiSystemSettingsSerializer(record)
        return Response(serializer.data, status=status.HTTP_200_OK)