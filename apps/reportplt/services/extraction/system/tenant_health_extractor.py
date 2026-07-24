from typing import Dict, Any
from apps.reportplt.services.extraction.base_extractor import BaseDataExtractor
from apps.tenant.models import Organization, OrganizationSchema, OrganizationResource

class TenantHealthDataExtractor(BaseDataExtractor):
    def extract(self) -> Dict[str, Any]:
        org = Organization.objects.filter(id=self.tenant_id).first()
        schemas = OrganizationSchema.objects.filter(organization=org) if org else []
        resources = OrganizationResource.objects.filter(organization=org) if org else []
        return {
            'tenant_id': self.tenant_id,
            'organization_name': org.name if org else 'Unknown',
            'schema_count': len(schemas),
            'resource_count': len(resources)
        }
