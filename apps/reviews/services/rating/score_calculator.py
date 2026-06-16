import logging
from decimal import Decimal
from django.contrib.contenttypes.models import ContentType
from ...models import CompetencyRating
from ..base_service import BaseReviewService
logger = logging.getLogger(__name__)

class ScoreCalculator(BaseReviewService):
    @staticmethod
    def calculate_weighted_score(kpi_score, competency_score, mission_score, task_score, weights):
        total = 0.0
        total_weight = 0
        if kpi_score is not None and weights.get('kpi', 0) > 0:
            total += float(kpi_score) * (float(weights['kpi']) / 100)
            total_weight += float(weights['kpi'])
        if competency_score is not None and weights.get('competency', 0) > 0:
            total += float(competency_score) * (float(weights['competency']) / 100)
            total_weight += float(weights['competency'])
        if mission_score is not None and weights.get('mission', 0) > 0:
            total += float(mission_score) * (float(weights['mission']) / 100)
            total_weight += float(weights['mission'])
        if task_score is not None and weights.get('task', 0) > 0:
            total += float(task_score) * (float(weights['task']) / 100)
            total_weight += float(weights['task'])
        if total_weight > 0 and total_weight < 100:
            total = total * (100 / total_weight)
        return round(total, 2)
    @staticmethod
    def calculate_avg_competency_score(parent_object):
        ratings = CompetencyRating.objects.filter(content_type=ContentType.objects.get_for_model(parent_object), object_id=str(parent_object.id), raw_score__isnull=False)
        if not ratings.exists():
            return None
        total = sum(float(r.raw_score) for r in ratings)
        count = ratings.count()
        avg_raw = total / count
        percentage = (avg_raw / 5) * 100
        return round(percentage, 2)
    @staticmethod
    def calculate_competency_percentage_score(parent_object, rating_scale):
        ratings = CompetencyRating.objects.filter(content_type=ContentType.objects.get_for_model(parent_object), object_id=str(parent_object.id), raw_score__isnull=False)
        if not ratings.exists():
            return None
        total_pct = 0
        count = 0
        for rating in ratings:
            pct = rating_scale.normalize_score(rating.raw_score)
            if pct:
                total_pct += pct
                count += 1
        return round(total_pct / count, 2) if count > 0 else None
    @staticmethod
    def calculate_kpi_score_for_period(employee, start_date, end_date):
        try:
            from apps.reviews.services.aggregation.kpi_aggregator import KPIAggregator
            return KPIAggregator.get_kpi_score_for_period(employee=employee, start_date=start_date, end_date=end_date)
        except Exception as e:
            logger.warning(f"KPI aggregator not available: {e}")
            return None
    @staticmethod
    def calculate_overall_score_from_ratings(ratings, rating_scale):
        if not ratings.exists():
            return None
        total = 0
        count = 0
        for rating in ratings:
            if rating.raw_score:
                pct = rating_scale.normalize_score(rating.raw_score)
                total += pct
                count += 1
        return round(total / count, 2) if count > 0 else None