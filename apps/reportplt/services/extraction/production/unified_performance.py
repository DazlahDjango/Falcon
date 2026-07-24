from typing import Dict, Any
from django.db.models import Avg
from apps.reportplt.services.extraction.base_extractor import BaseDataExtractor
from apps.accounts.models import User
from apps.kpi.models import Score
from apps.reviews.models import FinalRating

class UnifiedPerformanceExtractor(BaseDataExtractor):
    def extract(self) -> Dict[str, Any]:
        users = User.objects.filter(tenant_id=self.tenant_id, is_active=True, is_deleted=False)
        user_matrices = []
        for user in users:
            kpi_avg = Score.objects.filter(tenant_id=self.tenant_id, user=user).aggregate(avg=Avg('score'))['avg'] or 0.0
            latest_rating = FinalRating.objects.filter(tenant_id=self.tenant_id, employee=user).order_by('-created_at').first()
            review_score = float(latest_rating.final_score) if latest_rating and latest_rating.final_score else 0.0
            rating_label = latest_rating.final_rating_label if latest_rating else 'Unrated'
            user_matrices.append({
                'user_id': str(user.id),
                'name': user.get_full_name() or user.username,
                'email': user.email,
                'role': user.role,
                'kpi_execution_score': float(round(kpi_avg, 2)),
                'review_appraisal_score': float(round(review_score, 2)),
                'rating_label': rating_label
            })
        return {
            'total_employees': len(user_matrices),
            'matrix': user_matrices
        }
