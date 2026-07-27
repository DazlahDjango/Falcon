from rest_framework import viewsets
from apps.reportplt.models import ReportPreset
from apps.reportplt.api.v1.serializers import ReportPresetSerializer
from apps.reportplt.api.v1.permissions import HasReportingAccess

class ReportPresetViewSet(viewsets.ModelViewSet):
    queryset = ReportPreset.objects.not_deleted()
    serializer_class = ReportPresetSerializer
    permission_classes = [HasReportingAccess]

    def get_queryset(self):
        tenant_id = getattr(self.request.user, 'tenant_id', None)
        return ReportPreset.objects.not_deleted().filter(tenant_id=tenant_id)

    def perform_create(self, serializer):
        serializer.save(tenant_id=self.request.user.tenant_id, created_by=self.request.user)
