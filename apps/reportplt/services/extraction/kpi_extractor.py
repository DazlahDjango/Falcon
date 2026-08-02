from typing import Dict, Any
from apps.reportplt.services.extraction.base_extractor import BaseDataExtractor

class KPIDataExtractor(BaseDataExtractor):
    """
    Extracts KPI definitions, targets, actuals, and calculated performance scores
    for report compilation.
    """

    def extract() -> Dict[str, Any]:
        pass

    def extract(self) -> Dict[str, Any]:
        from apps.kpi.models import KPI, MonthlyActual, Score
        
        kpis = KPI.objects.filter(tenant_id=self.tenant_id, is_active=True)
        actuals = MonthlyActual.objects.filter(tenant_id=self.tenant_id, status='APPROVED')
        scores = Score.objects.filter(tenant_id=self.tenant_id)
        
        if 'year' in self.filters:
            actuals = actuals.filter(year=self.filters['year'])
            scores = scores.filter(year=self.filters['year'])

        return {
            'tenant_id': self.tenant_id,
            'kpis_count': kpis.count(),
            'actuals_count': actuals.count(),
            'scores_count': scores.count(),
            'data': {
                'kpis': list(kpis.values('id', 'name', 'code', 'unit', 'kpi_type')),
                'scores': list(scores.values('id', 'user_id', 'kpi_id', 'score', 'year', 'month'))
            }
        }
