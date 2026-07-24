from typing import Dict, Any
from django.db.models import Avg, Count
from apps.reportplt.services.extraction.base_extractor import BaseDataExtractor
from apps.reviews.models import ReviewCycle, FinalRating, PIP

class ReviewsDataExtractor(BaseDataExtractor):
    def extract(self) -> Dict[str, Any]:
        cycle_id = self.filters.get('cycle_id')
        cycles = ReviewCycle.objects.filter(tenant_id=self.tenant_id)
        if cycle_id:
            cycles = cycles.filter(id=cycle_id)
        active_cycle = cycles.first()
        if not active_cycle:
            return {'summary': {}, 'details': []}
        ratings = FinalRating.objects.filter(tenant_id=self.tenant_id, review_cycle=active_cycle)
        avg_scores = ratings.aggregate(
            overall=Avg('final_score'),
            kpi=Avg('kpi_score'),
            competency=Avg('competency_score')
        )
        distribution = ratings.values('final_rating_label').annotate(count=Count('id'))
        pips = PIP.objects.filter(tenant_id=self.tenant_id, review_cycle=active_cycle)
        return {
            'cycle_name': active_cycle.name,
            'summary': {
                'total_ratings': ratings.count(),
                'avg_overall_score': float(round(avg_scores['overall'] or 0.0, 2)),
                'avg_kpi_score': float(round(avg_scores['kpi'] or 0.0, 2)),
                'avg_competency_score': float(round(avg_scores['competency'] or 0.0, 2)),
                'pip_count': pips.count()
            },
            'rating_distribution': list(distribution)
        }
