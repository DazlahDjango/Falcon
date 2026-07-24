from typing import Dict, Any
from django.db.models import Avg
from django.utils import timezone
from apps.reportplt.services.extraction.base_extractor import BaseDataExtractor
from apps.kpi.models import KPI, Score

class KPIDataExtractor(BaseDataExtractor):
    def extract(self) -> Dict[str, Any]:
        year = self.filters.get('year', timezone.now().year)
        month = self.filters.get('month', timezone.now().month)
        kpis = KPI.objects.filter(tenant_id=self.tenant_id, is_active=True)
        scores = Score.objects.filter(tenant_id=self.tenant_id, year=year, month=month)
        avg_score = scores.aggregate(avg=Avg('score'))['avg'] or 0.0
        green_count = scores.filter(score__gte=90).count()
        yellow_count = scores.filter(score__gte=50, score__lt=90).count()
        red_count = scores.filter(score__lt=50).count()
        detail_list = []
        for kpi in kpis:
            kpi_scores = scores.filter(kpi=kpi)
            kpi_avg = kpi_scores.aggregate(avg=Avg('score'))['avg'] or 0.0
            detail_list.append({
                'id': str(kpi.id),
                'code': kpi.code,
                'name': kpi.name,
                'average_score': float(round(kpi_avg, 2)),
                'total_evaluations': kpi_scores.count()
            })
        return {
            'period': f"{year}-{month:02d}",
            'summary': {
                'total_kpis': kpis.count(),
                'average_score': float(round(avg_score, 2)),
                'green_count': green_count,
                'yellow_count': yellow_count,
                'red_count': red_count
            },
            'details': detail_list
        }
