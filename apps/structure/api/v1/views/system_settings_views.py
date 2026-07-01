from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from apps.accounts.api.v1.permissions.policy import IsSuperAdminOrReadOnly
from apps.accounts.api.v1.permissions import IsSuperAdmin
from apps.structure.api.v1.serializers.system_settings import StructureSystemSettingsSerializer
from apps.structure.services.settings import StructureSettingsService
from apps.structure.services.realtime import StructureEventBroadcaster


class StructureSystemSettingsView(APIView):
    permission_classes = [IsSuperAdminOrReadOnly]

    def get(self, request):
        record = StructureSettingsService.get_record()
        return Response(StructureSystemSettingsSerializer(record).data)

    def patch(self, request):
        record = StructureSettingsService.get_record()
        serializer = StructureSystemSettingsSerializer(
            record, data=request.data, partial=True, context={'request': request},
        )
        serializer.is_valid(raise_exception=True)
        record = serializer.save()
        StructureEventBroadcaster.policy_updated(version=record.version)
        return Response(StructureSystemSettingsSerializer(record).data)

    def put(self, request):
        return self.patch(request)


class StructureSystemSettingsResetView(APIView):
    permission_classes = [IsSuperAdmin]

    def post(self, request):
        record = StructureSettingsService.reset_to_defaults(user_id=str(request.user.id))
        StructureEventBroadcaster.policy_updated(version=record.version)
        return Response(
            StructureSystemSettingsSerializer(record).data,
            status=status.HTTP_200_OK,
        )