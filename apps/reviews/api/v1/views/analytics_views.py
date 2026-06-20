# apps/reviews/api/v1/views/analytics_views.py
"""
API views for analytics data
Following the same pattern as base_views.py
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.core.cache import cache
from django.db import models
from django.utils import timezone

from apps.reviews.services.analytics.analytics_service import AnalyticsService
from apps.reviews.services.analytics.insight_service import InsightService
from apps.reviews.services.analytics.predictive_service import PredictiveService
from ..serializers.analytics_serializers import (
    CompanyAnalyticsSerializer,
    DepartmentAnalyticsSerializer,
    ManagerAnalyticsSerializer,
    InsightsSerializer,
    FlightRiskSerializer,
    AnalyticsPeriodSerializer,
    SkillGapAnalyticsSerializer,
)
from ..permissions.analytics_permissions import (
    CanViewCompanyAnalytics,
    CanViewDepartmentAnalytics,
    CanViewManagerAnalytics,
    CanViewInsights,
    CanViewPredictions,
)
from ..throttles.analytics_throttles import (
    AnalyticsThrottle,
    AnalyticsExportThrottle,
    AnalyticsRefreshThrottle
)
from .base_views import BaseActionViewSet


class CompanyAnalyticsView(APIView):
    """
    GET /api/v1/reviews/analytics/company/
    Get company-wide performance analytics.
    
    Query Parameters:
    - period: daily, weekly, monthly, quarterly, yearly (default: monthly)
    """
    
    permission_classes = [IsAuthenticated, CanViewCompanyAnalytics]
    throttle_classes = [AnalyticsThrottle]
    
    def get(self, request):
        """Get company analytics for the tenant"""
        tenant = request.user.tenant
        
        period = request.query_params.get('period', 'monthly')
        
        # Validate period
        period_serializer = AnalyticsPeriodSerializer(data={'period': period})
        if period_serializer.is_valid():
            period = period_serializer.validated_data['period']
        
        # Try cache
        cache_key = f'reviews:analytics:company:{tenant.id}:{period}'
        cached_response = cache.get(cache_key)
        
        if cached_response:
            return Response(cached_response)
        
        try:
            analytics = AnalyticsService.get_company_analytics(tenant, period)
            serializer = CompanyAnalyticsSerializer(analytics)
            
            # Cache for 1 hour
            cache.set(cache_key, serializer.data, 3600)
            
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class DepartmentAnalyticsView(APIView):
    """
    GET /api/v1/reviews/analytics/departments/
    Get department-level performance analytics.
    
    Query Parameters:
    - department_id: Optional specific department ID
    - period: daily, weekly, monthly, quarterly, yearly (default: monthly)
    """
    
    permission_classes = [IsAuthenticated, CanViewDepartmentAnalytics]
    throttle_classes = [AnalyticsThrottle]
    
    def get(self, request):
        """Get department analytics for the tenant"""
        tenant = request.user.tenant
        
        department_id = request.query_params.get('department_id')
        period = request.query_params.get('period', 'monthly')
        
        # Validate period
        period_serializer = AnalyticsPeriodSerializer(data={'period': period})
        if period_serializer.is_valid():
            period = period_serializer.validated_data['period']
        
        # Try cache
        cache_key = f'reviews:analytics:departments:{tenant.id}:{period}:{department_id or "all"}'
        cached_response = cache.get(cache_key)
        
        if cached_response:
            return Response(cached_response)
        
        try:
            analytics = AnalyticsService.get_department_analytics(
                tenant, 
                department_id, 
                period
            )
            serializer = DepartmentAnalyticsSerializer(analytics)
            
            # Cache for 1 hour
            cache.set(cache_key, serializer.data, 3600)
            
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ManagerAnalyticsView(APIView):
    """
    GET /api/v1/reviews/analytics/managers/
    Get manager effectiveness analytics.
    
    Query Parameters:
    - period: daily, weekly, monthly, quarterly, yearly (default: monthly)
    """
    
    permission_classes = [IsAuthenticated, CanViewManagerAnalytics]
    throttle_classes = [AnalyticsThrottle]
    
    def get(self, request):
        """Get manager analytics for the tenant"""
        tenant = request.user.tenant
        
        period = request.query_params.get('period', 'monthly')
        
        # Validate period
        period_serializer = AnalyticsPeriodSerializer(data={'period': period})
        if period_serializer.is_valid():
            period = period_serializer.validated_data['period']
        
        # Try cache
        cache_key = f'reviews:analytics:managers:{tenant.id}:{period}'
        cached_response = cache.get(cache_key)
        
        if cached_response:
            return Response(cached_response)
        
        try:
            analytics = AnalyticsService.get_manager_analytics(tenant, period)
            serializer = ManagerAnalyticsSerializer(analytics)
            
            # Cache for 1 hour
            cache.set(cache_key, serializer.data, 3600)
            
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class InsightsView(APIView):
    """
    GET /api/v1/reviews/analytics/insights/
    Get actionable insights from review data.
    """
    
    permission_classes = [IsAuthenticated, CanViewInsights]
    throttle_classes = [AnalyticsThrottle]
    
    def get(self, request):
        """Get insights for the tenant"""
        tenant = request.user.tenant
        
        # Try cache
        cache_key = f'reviews:analytics:insights:{tenant.id}'
        cached_insights = cache.get(cache_key)
        
        if cached_insights:
            return Response(cached_insights)
        
        try:
            insights = InsightService.get_all_insights(tenant)
            serializer = InsightsSerializer(insights)
            
            # Cache for 6 hours
            cache.set(cache_key, serializer.data, 21600)
            
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class PredictionsView(APIView):
    """
    GET /api/v1/reviews/analytics/predictions/
    Get flight risk predictions.
    
    Query Parameters:
    - limit: Maximum number of employees to return (default: 20)
    """
    
    permission_classes = [IsAuthenticated, CanViewPredictions]
    throttle_classes = [AnalyticsThrottle]
    
    def get(self, request):
        """Get flight risk predictions for the tenant"""
        tenant = request.user.tenant
        
        limit = request.query_params.get('limit', 20)
        
        # Try cache
        cache_key = f'reviews:analytics:predictions:{tenant.id}'
        cached_predictions = cache.get(cache_key)
        
        if cached_predictions:
            return Response(cached_predictions)
        
        try:
            predictions = PredictiveService.get_high_risk_employees(tenant, int(limit))
            serializer = FlightRiskSerializer(predictions)
            
            # Cache for 6 hours (predictions don't change often)
            cache.set(cache_key, serializer.data, 21600)
            
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class TrendAnalyticsView(APIView):
    """
    GET /api/v1/reviews/analytics/trends/
    Get performance trends over time.
    
    Query Parameters:
    - months: Number of months to look back (default: 6)
    - period: daily, weekly, monthly, quarterly, yearly (default: monthly)
    """
    
    permission_classes = [IsAuthenticated, CanViewCompanyAnalytics]
    throttle_classes = [AnalyticsThrottle]
    
    def get(self, request):
        """Get trend analytics for the tenant"""
        from datetime import timedelta
        from apps.reviews.models import FinalRating, ReviewCycle
        
        tenant = request.user.tenant
        
        months = int(request.query_params.get('months', 6))
        period = request.query_params.get('period', 'monthly')
        
        # Try cache
        cache_key = f'reviews:analytics:trends:{tenant.id}:{months}:{period}'
        cached_response = cache.get(cache_key)
        
        if cached_response:
            return Response(cached_response)
        
        try:
            end_date = timezone.now().date()
            start_date = end_date - timedelta(days=30 * months)
            
            trend_data = []
            current_date = start_date
            
            while current_date <= end_date:
                month_start = current_date.replace(day=1)
                if current_date.month == 12:
                    month_end = current_date.replace(year=current_date.year + 1, month=1, day=1) - timedelta(days=1)
                else:
                    month_end = current_date.replace(month=current_date.month + 1, day=1) - timedelta(days=1)
                
                cycles = ReviewCycle.objects.filter(
                    tenant=tenant,
                    status='completed',
                    end_date__gte=month_start,
                    end_date__lte=month_end
                )
                
                ratings = FinalRating.objects.filter(
                    tenant=tenant,
                    review_cycle__in=cycles,
                    final_score__isnull=False
                )
                
                avg_score = ratings.aggregate(avg=models.Avg('final_score'))['avg'] or 0
                
                trend_data.append({
                    'month': month_start.strftime('%B %Y'),
                    'score': round(float(avg_score), 2),
                    'ratings_count': ratings.count()
                })
                
                if current_date.month == 12:
                    current_date = current_date.replace(year=current_date.year + 1, month=1, day=1)
                else:
                    current_date = current_date.replace(month=current_date.month + 1, day=1)
            
            response_data = {
                'trend': trend_data,
                'period': period,
                'months': months,
                'generated_at': timezone.now().isoformat()
            }
            
            # Cache for 2 hours
            cache.set(cache_key, response_data, 7200)
            
            return Response(response_data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class SkillGapAnalyticsView(APIView):
    """
    GET /api/v1/reviews/analytics/skill-gaps/
    Get competency skill gap analysis.
    """
    
    permission_classes = [IsAuthenticated, CanViewCompanyAnalytics]
    throttle_classes = [AnalyticsThrottle]
    
    def get(self, request):
        """Get skill gap analysis for the tenant"""
        from apps.reviews.models import CompetencyRating
        
        tenant = request.user.tenant
        
        # Try cache
        cache_key = f'reviews:analytics:skill_gaps:{tenant.id}'
        cached_response = cache.get(cache_key)
        
        if cached_response:
            return Response(cached_response)
        
        try:
            ratings = CompetencyRating.objects.filter(
                competency__tenant=tenant,
                raw_score__isnull=False
            ).select_related('competency')
            
            competency_scores = {}
            for rating in ratings:
                comp_name = rating.competency.name
                if comp_name not in competency_scores:
                    competency_scores[comp_name] = []
                competency_scores[comp_name].append(float(rating.raw_score))
            
            competency_averages = {}
            for comp_name, scores in competency_scores.items():
                avg_raw = sum(scores) / len(scores)
                avg_pct = (avg_raw / 5) * 100
                competency_averages[comp_name] = round(avg_pct, 1)
            
            sorted_comp = sorted(competency_averages.items(), key=lambda x: x[1])
            
            response_data = {
                'weakest_competencies': [
                    {'name': name, 'score': score} 
                    for name, score in sorted_comp[:5]
                ],
                'strongest_competencies': [
                    {'name': name, 'score': score} 
                    for name, score in sorted_comp[-5:]
                ],
                'all_competencies': [
                    {'name': name, 'score': score} 
                    for name, score in sorted_comp
                ],
                'generated_at': timezone.now().isoformat()
            }
            
            serializer = SkillGapAnalyticsSerializer(response_data)
            
            # Cache for 6 hours
            cache.set(cache_key, serializer.data, 21600)
            
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class RefreshAnalyticsView(APIView):
    """
    POST /api/v1/reviews/analytics/refresh/
    Force refresh of analytics cache (Admin/HR only).
    """
    
    permission_classes = [IsAuthenticated, CanViewPredictions]  # Same as predictions (Admin/HR only)
    throttle_classes = [AnalyticsThrottle]
    
    def post(self, request):
        """Force refresh analytics cache"""
        from apps.reviews.tasks import refresh_analytics_cache, generate_daily_insights, refresh_predictions
        
        tenant = request.user.tenant
        
        # Trigger async refresh tasks
        refresh_analytics_cache.delay(str(tenant.id))
        generate_daily_insights.delay(str(tenant.id))
        refresh_predictions.delay(str(tenant.id))
        
        return Response({
            'message': 'Analytics refresh triggered',
            'tenant_id': str(tenant.id),
            'refreshed_at': timezone.now().isoformat()
        }, status=status.HTTP_202_ACCEPTED)