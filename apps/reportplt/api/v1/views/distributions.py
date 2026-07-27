from rest_framework import viewsets
from apps.reportplt.models import DistributionList
from apps.reportplt.api.v1.serializers import DistributionListSerializer
from apps.reportplt.api.v1.permissions import HasReportingAccess

class DistributionListViewSet(viewsets.ModelViewSet):
    queryset = DistributionList.objects.not_deleted()
    serializer_class = DistributionListSerializer
    permission_classes = [HasReportingAccess]

    def get_queryset(self):
        tenant_id = getattr(self.request.user, 'tenant_id', None)
        return DistributionList.objects.not_deleted().filter(tenant_id=tenant_id)

    def perform_create(self, serializer):
        serializer.save(tenant_id=self.request.user.tenant_id, created_by=self.request.user)
