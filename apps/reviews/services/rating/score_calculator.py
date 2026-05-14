# apps/reviews/services/rating/score_calculator.py
"""
Score calculation engine for reviews
"""

from decimal import Decimal
from django.contrib.contenttypes.models import ContentType

from ...models import CompetencyRating
from ..base_service import BaseReviewService


class ScoreCalculator(BaseReviewService):
    """
    Handles all score calculations for reviews
    """
    
    @staticmethod
    def calculate_weighted_score(kpi_score, competency_score, mission_score, task_score, weights):
        """
        Calculate weighted total score.
        
        Args:
            kpi_score: KPI score (0-100)
            competency_score: Competency score (0-100)
            mission_score: Mission report score (0-100)
            task_score: Task completion score (0-100)
            weights: Dict with 'kpi', 'competency', 'mission', 'task' weights
        
        Returns:
            float: Weighted total score (0-100)
        """
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
        
        # Normalize if total weight is less than 100
        if total_weight > 0 and total_weight < 100:
            total = total * (100 / total_weight)
        
        return round(total, 2)
    
    @staticmethod
    def calculate_avg_competency_score(parent_object):
        """
        Calculate average competency score for a parent object.
        
        Args:
            parent_object: SelfAssessment or SupervisorReview instance
        
        Returns:
            float: Average score (0-100)
        """
        from ...models import SelfAssessment, SupervisorReview
        
        ratings = CompetencyRating.objects.filter(
            content_type=ContentType.objects.get_for_model(parent_object),
            object_id=str(parent_object.id),
            raw_score__isnull=False
        )
        
        if not ratings.exists():
            return None
        
        total = sum(float(r.raw_score) for r in ratings)
        count = ratings.count()
        
        # Assume max score is 5 for raw scores
        avg_raw = total / count
        # Convert to percentage (assuming 5-point scale)
        percentage = (avg_raw / 5) * 100
        
        return round(percentage, 2)
    
    @staticmethod
    def calculate_competency_percentage_score(parent_object, rating_scale):
        """
        Calculate competency score as percentage using rating scale.
        
        Args:
            parent_object: SelfAssessment or SupervisorReview instance
            rating_scale: RatingScale instance
        
        Returns:
            float: Percentage score (0-100)
        """
        ratings = CompetencyRating.objects.filter(
            content_type=ContentType.objects.get_for_model(parent_object),
            object_id=str(parent_object.id),
            raw_score__isnull=False
        )
        
        if not ratings.exists():
            return None
        
        # Get normalized scores using rating scale
        total_pct = 0
        count = 0
        
        for rating in ratings:
            pct = rating_scale.normalize_score(rating.raw_score)
            if pct:
                total_pct += pct
                count += 1
        
        if count == 0:
            return None
        
        return round(total_pct / count, 2)
    
    @staticmethod
    def calculate_kpi_score_for_period(employee, start_date, end_date):
        """
        Calculate KPI score for a date period.
        Fetches data from KPI app.
        
        Args:
            employee: User object
            start_date: Period start date
            end_date: Period end date
        
        Returns:
            float: Average KPI score (0-100)
        """
        # Placeholder - implement when KPI app is ready
        # This will call the KPI app's service
        try:
            from apps.kpi.services.kpi_aggregator import KPIAggregator
            return KPIAggregator.get_score_for_period(employee, start_date, end_date)
        except ImportError:
            # KPI app not ready yet
            return None
    
    @staticmethod
    def calculate_overall_score_from_ratings(ratings, rating_scale):
        """
        Calculate overall score from a list of competency ratings.
        
        Args:
            ratings: QuerySet of CompetencyRating objects
            rating_scale: RatingScale instance
        
        Returns:
            float: Overall percentage score
        """
        if not ratings.exists():
            return None
        
        total = 0
        count = 0
        
        for rating in ratings:
            if rating.raw_score:
                pct = rating_scale.normalize_score(rating.raw_score)
                total += pct
                count += 1
        
        if count == 0:
            return None
        
        return round(total / count, 2)