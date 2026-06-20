# apps/reviews/services/analytics/insight_service.py
"""
Insight Service - Generates actionable insights from analytics data
"""

from django.utils import timezone
from datetime import timedelta
from typing import List, Dict

from ...models import FinalRating, PIP, ReviewCycle, CompetencyRating
from ...constants import InsightType, RiskLevel, AnalyticsThresholds
from ..base_service import BaseReviewService


class InsightService(BaseReviewService):
    """
    Generates actionable insights from review data.
    Identifies trends, issues, and opportunities.
    """
    
    @staticmethod
    def generate_company_insights(tenant):
        """
        Generate company-level insights.
        
        Args:
            tenant: Client object
        
        Returns:
            list: Insight objects
        """
        insights = []
        
        # Get company analytics
        from .analytics_service import AnalyticsService
        company_data = AnalyticsService.get_company_analytics(tenant)
        
        # Check for significant score drop
        score_change = company_data.get('score_change', 0)
        if score_change < -5:
            insights.append({
                'type': InsightType.WARNING,
                'title': 'Performance Decline Detected',
                'message': f'Company average score dropped by {abs(score_change):.1f}% compared to previous period.',
                'recommendation': 'Review department performance and identify areas for improvement.',
                'priority': 'high',
                'created_at': timezone.now().isoformat()
            })
        elif score_change > 5:
            insights.append({
                'type': InsightType.POSITIVE,
                'title': 'Performance Improvement',
                'message': f'Company average score increased by {score_change:.1f}% compared to previous period.',
                'recommendation': 'Identify successful practices and share across departments.',
                'priority': 'medium',
                'created_at': timezone.now().isoformat()
            })
        
        # Check rating distribution
        distribution = company_data.get('rating_distribution', {})
        unsatisfactory = distribution.get('unsatisfactory', 0)
        total = sum([distribution.get(k, 0) for k in ['outstanding', 'exceeds', 'meets', 'needs_work', 'unsatisfactory']])
        
        if total > 0 and (unsatisfactory / total) > 0.2:
            insights.append({
                'type': InsightType.WARNING,
                'title': 'High Rate of Unsatisfactory Ratings',
                'message': f'{unsatisfactory} employees ({round((unsatisfactory/total)*100)}%) received unsatisfactory ratings.',
                'recommendation': 'Review PIP process and provide additional training.',
                'priority': 'high',
                'created_at': timezone.now().isoformat()
            })
        
        # Check promotion rate
        promotions = company_data.get('promotions_count', 0)
        total_ratings = company_data.get('total_ratings', 1)
        promotion_rate = (promotions / total_ratings) * 100 if total_ratings > 0 else 0
        
        if promotion_rate < 10:
            insights.append({
                'type': InsightType.WARNING,
                'title': 'Low Promotion Rate',
                'message': f'Only {promotions} employees ({promotion_rate:.1f}%) were promoted this period.',
                'recommendation': 'Review promotion criteria and identify barriers to advancement.',
                'priority': 'medium',
                'created_at': timezone.now().isoformat()
            })
        
        # Check PIP success rate
        pip_success_rate = company_data.get('pip_success_rate', 0)
        if 0 < pip_success_rate < 50:
            insights.append({
                'type': InsightType.NEGATIVE,
                'title': 'Low PIP Success Rate',
                'message': f'Only {pip_success_rate:.0f}% of PIPs were successfully completed.',
                'recommendation': 'Review PIP structure and provide additional support to employees.',
                'priority': 'high',
                'created_at': timezone.now().isoformat()
            })
        
        return insights
    
    @staticmethod
    def generate_department_insights(tenant):
        """
        Generate department-level insights.
        
        Args:
            tenant: Client object
        
        Returns:
            list: Insight objects
        """
        insights = []
        
        from .analytics_service import AnalyticsService
        dept_data = AnalyticsService.get_department_analytics(tenant)
        
        company_avg = dept_data.get('company_average', 0)
        
        for dept in dept_data.get('departments', []):
            dept_avg = dept.get('average_score', 0)
            diff = dept_avg - company_avg
            
            if diff < -10:
                insights.append({
                    'type': InsightType.WARNING,
                    'title': f'{dept["name"]} Department Underperforming',
                    'message': f'Department average ({dept_avg:.1f}%) is {abs(diff):.1f}% below company average ({company_avg:.1f}%).',
                    'recommendation': 'Conduct department review and identify performance issues.',
                    'priority': 'high',
                    'created_at': timezone.now().isoformat()
                })
            elif diff > 10:
                insights.append({
                    'type': InsightType.POSITIVE,
                    'title': f'{dept["name"]} Department Excelling',
                    'message': f'Department average ({dept_avg:.1f}%) is {diff:.1f}% above company average.',
                    'recommendation': 'Recognize achievements and share best practices.',
                    'priority': 'low',
                    'created_at': timezone.now().isoformat()
                })
        
        return insights
    
    @staticmethod
    def generate_skill_gap_insights(tenant):
        """
        Generate skill gap insights from competency data.
        
        Args:
            tenant: Client object
        
        Returns:
            list: Insight objects
        """
        insights = []
        
        # Get competency ratings
        ratings = CompetencyRating.objects.filter(
            competency__tenant=tenant,
            raw_score__isnull=False
        ).select_related('competency')
        
        if not ratings.exists():
            return insights
        
        # Calculate average per competency
        competency_scores = {}
        for rating in ratings:
            comp_name = rating.competency.name
            if comp_name not in competency_scores:
                competency_scores[comp_name] = []
            competency_scores[comp_name].append(float(rating.raw_score))
        
        # Normalize to percentage (assuming 5-point scale)
        competency_averages = {}
        for comp_name, scores in competency_scores.items():
            avg_raw = sum(scores) / len(scores)
            avg_pct = (avg_raw / 5) * 100
            competency_averages[comp_name] = round(avg_pct, 1)
        
        # Find weakest and strongest competencies
        sorted_comp = sorted(competency_averages.items(), key=lambda x: x[1])
        
        weakest = sorted_comp[:3] if len(sorted_comp) >= 3 else sorted_comp
        strongest = sorted_comp[-3:] if len(sorted_comp) >= 3 else sorted_comp
        
        if weakest:
            weak_names = ', '.join([w[0] for w in weakest])
            weak_scores = ', '.join([f"{w[1]}%" for w in weakest])
            insights.append({
                'type': InsightType.WARNING,
                'title': 'Skill Gaps Identified',
                'message': f'Lowest-rated competencies: {weak_names} ({weak_scores})',
                'recommendation': 'Provide targeted training in these areas.',
                'priority': 'high',
                'created_at': timezone.now().isoformat(),
                'data': {'weakest': weakest, 'strongest': strongest}
            })
        
        if strongest:
            strong_names = ', '.join([s[0] for s in strongest])
            insights.append({
                'type': InsightType.POSITIVE,
                'title': 'Key Strengths',
                'message': f'Highest-rated competencies: {strong_names}',
                'recommendation': 'Leverage these strengths across the organization.',
                'priority': 'low',
                'created_at': timezone.now().isoformat()
            })
        
        return insights
    
    @staticmethod
    def get_all_insights(tenant):
        """
        Get all insights for a tenant.
        
        Args:
            tenant: Client object
        
        Returns:
            dict: Categorized insights
        """
        cache_key = f'reviews:analytics:insights:{tenant.id}'
        
        # Try cache
        from django.core.cache import cache
        cached = cache.get(cache_key)
        if cached:
            return cached
        
        # Generate insights
        insights = {
            'company': InsightService.generate_company_insights(tenant),
            'departments': InsightService.generate_department_insights(tenant),
            'skill_gaps': InsightService.generate_skill_gap_insights(tenant),
            'generated_at': timezone.now().isoformat()
        }
        
        # Cache for 6 hours
        cache.set(cache_key, insights, 21600)
        
        return insights