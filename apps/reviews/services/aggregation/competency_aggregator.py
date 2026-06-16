import logging
from django.contrib.contenttypes.models import ContentType
from ...models import CompetencyRating, SelfAssessment, SupervisorReview
from ..base_service import BaseReviewService
logger = logging.getLogger(__name__)

class CompetencyAggregator(BaseReviewService):
    @staticmethod
    def get_self_ratings(self_assessment):
        return CompetencyRating.objects.filter(content_type=ContentType.objects.get_for_model(SelfAssessment), object_id=str(self_assessment.id)).select_related('competency')
    @staticmethod
    def get_supervisor_ratings(supervisor_review):
        return CompetencyRating.objects.filter(content_type=ContentType.objects.get_for_model(SupervisorReview), object_id=str(supervisor_review.id)).select_related('competency')
    @staticmethod
    def get_combined_ratings(self_assessment, supervisor_review):
        self_ratings = {r.competency_id: r for r in CompetencyAggregator.get_self_ratings(self_assessment)}
        supervisor_ratings = {r.competency_id: r for r in CompetencyAggregator.get_supervisor_ratings(supervisor_review)}
        all_competency_ids = set(self_ratings.keys()) | set(supervisor_ratings.keys())
        combined = []
        for comp_id in all_competency_ids:
            self_rating = self_ratings.get(comp_id)
            supervisor_rating = supervisor_ratings.get(comp_id)
            combined.append({'competency_id': comp_id, 'competency_name': self_rating.competency.name if self_rating else supervisor_rating.competency.name, 'self_score': float(self_rating.raw_score) if self_rating and self_rating.raw_score else None, 'supervisor_score': float(supervisor_rating.raw_score) if supervisor_rating and supervisor_rating.raw_score else None, 'self_comment': self_rating.comment if self_rating else None, 'supervisor_comment': supervisor_rating.comment if supervisor_rating else None, 'gap': self_rating.raw_score - supervisor_rating.raw_score if self_rating and self_rating.raw_score and supervisor_rating and supervisor_rating.raw_score else None})
        return combined
    @staticmethod
    def calculate_competency_averages(review_cycle, department_id=None):
        queryset = SupervisorReview.objects.filter(review_cycle=review_cycle, status='approved')
        if department_id:
            queryset = queryset.filter(employee__department_id=department_id)
        competency_scores = {}
        for review in queryset:
            ratings = CompetencyAggregator.get_supervisor_ratings(review)
            for rating in ratings:
                comp_name = rating.competency.name
                if comp_name not in competency_scores:
                    competency_scores[comp_name] = []
                if rating.raw_score:
                    competency_scores[comp_name].append(float(rating.raw_score))
        averages = {}
        for comp_name, scores in competency_scores.items():
            if scores:
                avg_raw = sum(scores) / len(scores)
                avg_pct = (avg_raw / 5) * 100
                averages[comp_name] = {'average_raw': round(avg_raw, 2), 'average_percentage': round(avg_pct, 2), 'count': len(scores)}
        return averages
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
    def get_rating_gap_analysis(self_assessment, supervisor_review):
        combined = CompetencyAggregator.get_combined_ratings(self_assessment, supervisor_review)
        gaps = []
        for item in combined:
            if item['gap'] is not None:
                gaps.append({'competency': item['competency_name'], 'self_score': item['self_score'], 'supervisor_score': item['supervisor_score'], 'gap': item['gap'], 'absolute_gap': abs(item['gap'])})
        if not gaps:
            return None
        gaps_sorted = sorted(gaps, key=lambda x: x['absolute_gap'], reverse=True)
        return {'total_competencies': len(gaps), 'average_gap': round(sum(g['gap'] for g in gaps) / len(gaps), 2), 'largest_gaps': gaps_sorted[:3], 'over_rated': [g for g in gaps if g['gap'] > 0], 'under_rated': [g for g in gaps if g['gap'] < 0]}