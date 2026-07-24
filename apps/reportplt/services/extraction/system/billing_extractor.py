from typing import Dict, Any
from apps.reportplt.services.extraction.base_extractor import BaseDataExtractor

class BillingDataExtractor(BaseDataExtractor):
    def extract(self) -> Dict[str, Any]:
        return {
            'tenant_id': self.tenant_id,
            'billing_status': 'active',
            'allocated_seats': 100,
            'used_seats': 45
        }
