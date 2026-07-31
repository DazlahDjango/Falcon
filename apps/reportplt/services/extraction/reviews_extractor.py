from typing import Dict, Any
from apps.reportplt.services.extraction.base_extractor import BaseDataExtractor

class ReviewsDataExtractor(BaseDataExtractor):
    """
    Extracts Performance Review cycles, supervisor evaluations, calibration 9-box grids,
    and PIP records for reporting.
    """

    def extract(self) -> Dict[str, Any]:
        from apps.reviews.models import ReviewCycle, SupervisorReview, CalibrationSession, PIP
        
        cycles = ReviewCycle.objects.filter(tenant_id=self.tenant_id)
        reviews = SupervisorReview.objects.filter(tenant_id=self.tenant_id)
        pips = PIP.objects.filter(tenant_id=self.tenant_id)
        
        if 'cycle_id' in self.filters:
            reviews = reviews.filter(cycle_id=self.filters['cycle_id'])

        return {
            'tenant_id': self.tenant_id,
            'cycles_count': cycles.count(),
            'reviews_count': reviews.count(),
            'pips_count': pips.count(),
            'data': {
                'cycles': list(cycles.values('id', 'name', 'status', 'start_date', 'end_date')),
                'pips': list(pips.values('id', 'employee_id', 'status', 'start_date', 'target_end_date'))
            }
        }
