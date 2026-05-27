from decimal import Decimal
from django.contrib.contenttypes.models import ContentType
from ...models import CompetencyRating
from ..base_service import BaseReviewService
import logging

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
        try:
            from apps.reviews.services.aggregation.kpi_aggregator import KPIAggregator
            score = KPIAggregator.get_kpi_score_for_period(
                employee=employee,
                start_date=start_date,
                end_date=end_date
            )
            
            return score
            
        except ImportError as e:
            logger.warning(f"KPI aggregator not available: {e}")
            return None
        except Exception as e:
            logger.error(f"Error calculating KPI score for period: {e}")
            return None
    
    @staticmethod
    def calculate_kpi_scores_for_multiple_periods(employee, periods):
        try:
            from apps.reviews.services.aggregation.kpi_aggregator import KPIAggregator
            
            results = {}
            for idx, period in enumerate(periods):
                score = KPIAggregator.get_kpi_score_for_period(
                    employee=employee,
                    start_date=period['start_date'],
                    end_date=period['end_date']
                )
                results[idx] = score
            
            return results
            
        except Exception as e:
            logger.error(f"Error calculating KPI scores for multiple periods: {e}")
            return {}
    
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
    
    @staticmethod
    def calculate_review_cycle_scores(review_cycle, employees=None):
        """
        Calculate scores for all employees in a review cycle.
        
        Args:
            review_cycle: ReviewCycle instance
            employees: Optional list of specific employees
        
        Returns:
            dict: {employee_id: {'kpi_score', 'competency_score', 'total_score'}}
        """
        from ...models import FinalRating, SupervisorReview, SelfAssessment
        
        results = {}
        
        # Get employees for this cycle
        if employees is None:
            # Get employees from self_assessments or supervisor_reviews
            employees = set()
            for sa in review_cycle.self_assessments.all():
                employees.add(sa.employee)
            for sr in review_cycle.supervisor_reviews.all():
                employees.add(sr.employee)
            employees = list(employees)
        
        for employee in employees:
            try:
                # Get or create final rating
                final_rating, created = FinalRating.objects.get_or_create(
                    review_cycle=review_cycle,
                    employee=employee,
                    defaults={
                        'tenant_id': review_cycle.tenant_id,
                        'rating_scale': review_cycle.rating_scale,
                        'status': 'pending'
                    }
                )
                
                # Get KPI score for the review period
                kpi_score = ScoreCalculator.calculate_kpi_score_for_period(
                    employee=employee,
                    start_date=review_cycle.start_date,
                    end_date=review_cycle.end_date
                )
                
                # Get competency score from supervisor review
                try:
                    supervisor_review = SupervisorReview.objects.get(
                        review_cycle=review_cycle,
                        employee=employee
                    )
                    competency_score = ScoreCalculator.calculate_avg_competency_score(supervisor_review)
                except SupervisorReview.DoesNotExist:
                    competency_score = None
                
                # Calculate total weighted score
                total_score = ScoreCalculator.calculate_weighted_score(
                    kpi_score=kpi_score,
                    competency_score=competency_score,
                    mission_score=None,  # Placeholder for mission score
                    task_score=None,     # Placeholder for task score
                    weights={
                        'kpi': review_cycle.kpi_weight,
                        'competency': review_cycle.competency_weight,
                        'mission': review_cycle.mission_weight,
                        'task': review_cycle.task_weight
                    }
                )
                
                results[employee.id] = {
                    'kpi_score': kpi_score,
                    'competency_score': competency_score,
                    'total_score': total_score,
                    'final_rating_id': str(final_rating.id) if final_rating else None
                }
                
            except Exception as e:
                logger.error(f"Error calculating scores for employee {employee.id}: {e}")
                results[employee.id] = {
                    'kpi_score': None,
                    'competency_score': None,
                    'total_score': None,
                    'error': str(e)
                }
        
        return results
    
    @staticmethod
    def calculate_period_comparison(employee, current_period, previous_period):
        """
        Calculate score comparison between two periods.
        
        Args:
            employee: User object
            current_period: Dict with 'start_date', 'end_date', 'name'
            previous_period: Dict with 'start_date', 'end_date', 'name'
        
        Returns:
            dict: Comparison results
        """
        try:
            from apps.reviews.services.aggregation.kpi_aggregator import KPIAggregator
            
            # Get scores for both periods
            current_kpi = KPIAggregator.get_kpi_score_for_period(
                employee=employee,
                start_date=current_period['start_date'],
                end_date=current_period['end_date']
            )
            
            previous_kpi = KPIAggregator.get_kpi_score_for_period(
                employee=employee,
                start_date=previous_period['start_date'],
                end_date=previous_period['end_date']
            )
            
            # Calculate changes
            kpi_change = None
            if current_kpi is not None and previous_kpi is not None:
                kpi_change = round(current_kpi - previous_kpi, 2)
                kpi_percent_change = round((kpi_change / previous_kpi) * 100, 2) if previous_kpi != 0 else None
            else:
                kpi_percent_change = None
            
            return {
                'employee_id': str(employee.id),
                'employee_name': employee.get_full_name(),
                'current_period': {
                    'name': current_period.get('name', 'Current'),
                    'kpi_score': current_kpi
                },
                'previous_period': {
                    'name': previous_period.get('name', 'Previous'),
                    'kpi_score': previous_kpi
                },
                'comparison': {
                    'kpi_change': kpi_change,
                    'kpi_percent_change': kpi_percent_change,
                    'trend': 'up' if kpi_change and kpi_change > 0 else 'down' if kpi_change and kpi_change < 0 else 'stable'
                }
            }
            
        except Exception as e:
            logger.error(f"Error calculating period comparison: {e}")
            return {
                'employee_id': str(employee.id),
                'error': str(e)
            }