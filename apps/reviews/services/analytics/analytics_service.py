# apps/reviews/services/analytics/analytics_service.py
"""
Analytics Service - Core analytics calculations for company, departments, managers
"""
from django.db import models
from decimal import Decimal
from django.db.models import Avg, Count, Q, Sum
from django.utils import timezone
from datetime import timedelta

from typing import Dict, List, Optional, Any

from ...models import (
    ReviewCycle, FinalRating, SelfAssessment, SupervisorReview,
    PIP, CompetencyRating, PromotionRecommendation, AnalyticsSnapshot
)
from ...constants import AnalyticsThresholds, AnalyticsPeriod, AnalyticsCacheKeys
from ..base_service import BaseReviewService
from ...utils import (
    get_date_range_for_period, calculate_percentage_change, 
    calculate_trend, calculate_standard_deviation, get_rating_distribution
)
from django.core.cache import cache


class AnalyticsService(BaseReviewService):
    """
    Handles all analytics calculations for company, departments, and managers
    """
    
    @staticmethod
    def get_company_analytics(tenant, period=AnalyticsPeriod.MONTHLY):
        """
        Get company-wide performance analytics.
        
        Args:
            tenant: Client object or UUID
            period: Time period for analytics
        
        Returns:
            dict: Company analytics data
        """
        tid = getattr(tenant, 'id', tenant)
        cache_key = AnalyticsCacheKeys.COMPANY_METRICS.format(tenant_id=tid)
        cached_data = cache.get(cache_key)
        if cached_data:
            return cached_data
        
        # Get date range
        end_date = timezone.now().date()
        start_date, _ = get_date_range_for_period(period, end_date)
        
        # Get cycles in period
        cycles = ReviewCycle.objects.filter(
            tenant_id=tid,
            end_date__gte=start_date,
            end_date__lte=end_date
        )
        
        # Get final ratings in period
        ratings = FinalRating.objects.filter(
            tenant_id=tid,
            final_score__isnull=False
        )
        if cycles.exists():
            ratings = ratings.filter(review_cycle__in=cycles)
        
        # Basic metrics
        total_ratings = ratings.count()
        average_score = ratings.aggregate(avg=Avg('final_score'))['avg'] or 0
        
        # Get previous period for comparison
        prev_end_date = start_date - timedelta(days=1)
        prev_start_date, _ = get_date_range_for_period(period, prev_end_date)
        
        prev_cycles = ReviewCycle.objects.filter(
            tenant_id=tid,
            end_date__gte=prev_start_date,
            end_date__lte=prev_end_date
        )
        prev_ratings = FinalRating.objects.filter(
            tenant_id=tid,
            final_score__isnull=False
        )
        if prev_cycles.exists():
            prev_ratings = prev_ratings.filter(review_cycle__in=prev_cycles)
        else:
            prev_ratings = prev_ratings.none()
            
        prev_average = prev_ratings.aggregate(avg=Avg('final_score'))['avg'] or 0
        
        # Rating distribution
        distribution = get_rating_distribution(ratings)
        
        # Trend calculation
        trend = AnalyticsService._calculate_company_trend(tenant, period)
        
        # Promotion and PIP metrics
        promotions = PromotionRecommendation.objects.filter(
            tenant_id=tid,
            status='approved'
        ).count()
        
        active_pips = PIP.objects.filter(
            tenant_id=tid,
            status__in=['draft', 'submitted', 'active']
        ).count()
        
        completed_pips = PIP.objects.filter(
            tenant_id=tid,
            status='completed'
        ).count()
        
        # Calculate change percentages
        score_change = float(average_score) - float(prev_average)
        score_change_percent = calculate_percentage_change(average_score, prev_average)
        
        result = {
            'period': period,
            'start_date': start_date.isoformat(),
            'end_date': end_date.isoformat(),
            'total_cycles': cycles.count(),
            'total_ratings': total_ratings,
            'average_score': round(float(average_score), 2),
            'previous_average_score': round(float(prev_average), 2),
            'score_change': round(float(score_change), 2),
            'score_change_percent': score_change_percent,
            'trend': trend,
            'rating_distribution': distribution,
            'promotions_count': promotions,
            'active_pips': active_pips,
            'completed_pips': completed_pips,
            'pip_success_rate': round((completed_pips / active_pips) * 100, 1) if active_pips > 0 else 0.0,
        }
        
        # Cache for 1 hour
        cache.set(cache_key, result, 3600)
        
        return result
    
    @staticmethod
    def _calculate_company_trend(tenant, period, months=6):
        """
        Calculate company performance trend over time.
        
        Args:
            tenant: Client object or UUID
            period: Period type
            months: Number of months to look back
        
        Returns:
            dict: Trend data with monthly scores
        """
        tid = getattr(tenant, 'id', tenant)
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=30 * months)
        
        # Get monthly aggregates
        monthly_data = []
        current_date = start_date
        
        while current_date <= end_date:
            month_start = current_date.replace(day=1)
            if current_date.month == 12:
                month_end = current_date.replace(year=current_date.year + 1, month=1, day=1) - timedelta(days=1)
            else:
                month_end = current_date.replace(month=current_date.month + 1, day=1) - timedelta(days=1)
            
            # Get cycles ending in this month
            cycles = ReviewCycle.objects.filter(
                tenant_id=tid,
                end_date__gte=month_start,
                end_date__lte=month_end
            )
            
            ratings = FinalRating.objects.filter(
                tenant_id=tid,
                final_score__isnull=False
            )
            if cycles.exists():
                ratings = ratings.filter(review_cycle__in=cycles)
            else:
                ratings = ratings.filter(created_at__date__gte=month_start, created_at__date__lte=month_end)
            
            avg_score = ratings.aggregate(avg=Avg('final_score'))['avg'] or 0
            
            monthly_data.append({
                'month': month_start.strftime('%B %Y'),
                'score': round(float(avg_score), 2),
                'ratings_count': ratings.count()
            })
            
            # Move to next month
            if current_date.month == 12:
                current_date = current_date.replace(year=current_date.year + 1, month=1, day=1)
            else:
                current_date = current_date.replace(month=current_date.month + 1, day=1)
        
        scores = [m['score'] for m in monthly_data if m['score'] > 0]
        trend_direction = calculate_trend(scores) if scores else {'direction': 'stable', 'change_percent': 0.0}
        
        return {
            'data': monthly_data,
            'direction': trend_direction['direction'],
            'change_percent': trend_direction['change_percent']
        }
    
    @staticmethod
    def get_department_analytics(tenant, department_id=None, period=AnalyticsPeriod.MONTHLY):
        """
        Get department-level analytics.
        
        Args:
            tenant: Client object or UUID
            department_id: Optional specific department ID
            period: Time period
        
        Returns:
            dict: Department analytics data
        """
        from apps.structure.models import Department, Employment
        from apps.accounts.models import User
        
        tid = getattr(tenant, 'id', tenant)
        cache_key = AnalyticsCacheKeys.DEPARTMENT_METRICS.format(tenant_id=tid, dept_id=department_id or 'all')
        cached_data = cache.get(cache_key)
        if cached_data:
            return cached_data
        
        # Get date range
        end_date = timezone.now().date()
        start_date, _ = get_date_range_for_period(period, end_date)
        
        departments = Department.objects.filter(tenant_id=tid, is_deleted=False)
        if department_id:
            departments = departments.filter(id=department_id)
        
        dept_analytics = []
        all_scores = []
        
        for dept in departments:
            # Get employees in department via Employment or User direct match
            user_ids = list(Employment.objects.filter(
                tenant_id=tid,
                position__department=dept,
                is_current=True,
                is_active=True,
                is_deleted=False
            ).values_list('user_id', flat=True))
            
            employees = User.objects.filter(
                Q(id__in=user_ids) | Q(department=dept.name) | Q(department=str(dept.id)),
                tenant_id=tid,
                is_active=True
            )
            
            # Get final ratings for these employees
            ratings = FinalRating.objects.filter(
                tenant_id=tid,
                employee__in=employees,
                final_score__isnull=False
            )
            
            avg_score = ratings.aggregate(avg=Avg('final_score'))['avg'] or 0
            scores_list = [float(r.final_score) for r in ratings if r.final_score]
            
            dept_analytics.append({
                'id': str(dept.id),
                'name': dept.name,
                'employee_count': employees.count(),
                'average_score': round(float(avg_score), 2),
                'ratings_count': ratings.count(),
                'std_dev': calculate_standard_deviation(scores_list),
                'promotions': PromotionRecommendation.objects.filter(
                    tenant_id=tid,
                    employee__in=employees,
                    status='approved'
                ).count(),
                'pips': PIP.objects.filter(
                    tenant_id=tid,
                    employee__in=employees,
                    status__in=['draft', 'submitted', 'active']
                ).count(),
            })
            all_scores.extend(scores_list)
        
        # Rank departments
        dept_analytics.sort(key=lambda x: x['average_score'], reverse=True)
        
        result = {
            'period': period,
            'total_departments': len(dept_analytics),
            'company_average': round(sum(all_scores) / len(all_scores), 2) if all_scores else 0.0,
            'best_performing_department': dept_analytics[0] if dept_analytics else None,
            'worst_performing_department': dept_analytics[-1] if dept_analytics else None,
            'departments': dept_analytics
        }
        
        cache.set(cache_key, result, 3600)
        
        return result
    
    @staticmethod
    def get_manager_analytics(tenant, period=AnalyticsPeriod.MONTHLY):
        """
        Get manager effectiveness analytics.
        
        Args:
            tenant: Client object or UUID
            period: Time period
        
        Returns:
            dict: Manager analytics data
        """
        tid = getattr(tenant, 'id', tenant)
        cache_key = AnalyticsCacheKeys.MANAGER_METRICS.format(tenant_id=tid, manager_id='all')
        cached_data = cache.get(cache_key)
        if cached_data:
            return cached_data
        
        # Get date range
        end_date = timezone.now().date()
        start_date, _ = get_date_range_for_period(period, end_date)
        
        from apps.accounts.models import User
        
        managers = User.objects.filter(
            tenant_id=tid,
            role__in=['supervisor', 'executive', 'client_admin', 'hr_admin', 'super_admin'],
            is_active=True
        )
        
        # Get company average for comparison
        company_avg = FinalRating.objects.filter(
            tenant_id=tid,
            final_score__isnull=False
        ).aggregate(avg=Avg('final_score'))['avg'] or 0
        
        manager_analytics = []
        
        for manager in managers:
            # Get direct reports
            direct_reports = manager.direct_reports.filter(is_active=True)
            if not direct_reports.exists():
                continue
            
            # Get ratings for direct reports
            ratings = FinalRating.objects.filter(
                tenant_id=tid,
                employee__in=direct_reports,
                final_score__isnull=False
            )
            
            avg_score = ratings.aggregate(avg=Avg('final_score'))['avg'] or 0
            
            # Calculate rating inflation/deflation
            inflation = float(avg_score) - float(company_avg)
            inflation_percent = (inflation / float(company_avg)) * 100 if float(company_avg) > 0 else 0.0
            
            manager_analytics.append({
                'id': str(manager.id),
                'name': manager.get_full_name() or manager.email,
                'team_size': direct_reports.count(),
                'average_rating': round(float(avg_score), 2),
                'company_average': round(float(company_avg), 2),
                'inflation': round(inflation, 2),
                'inflation_percent': round(inflation_percent, 1),
                'rating_inflated': inflation_percent > AnalyticsThresholds.RATING_INFLATION,
                'rating_deflated': inflation_percent < -AnalyticsThresholds.RATING_DEFLATION,
                'timely_reviews': SupervisorReview.objects.filter(
                    supervisor=manager,
                    submitted_at__isnull=False
                ).count(),
                'late_reviews': SupervisorReview.objects.filter(
                    supervisor=manager,
                    submitted_at__isnull=False,
                    submitted_at__date__gt=models.F('review_cycle__supervisor_review_deadline')
                ).count(),
            })
        
        # Rank managers by average rating
        manager_analytics.sort(key=lambda x: x['average_rating'], reverse=True)
        
        # Identify outliers
        inflated_managers = [m for m in manager_analytics if m['rating_inflated']]
        deflated_managers = [m for m in manager_analytics if m['rating_deflated']]
        
        result = {
            'period': period,
            'total_managers': len(manager_analytics),
            'company_average': round(float(company_avg), 2),
            'inflated_managers': inflated_managers,
            'deflated_managers': deflated_managers,
            'top_managers': manager_analytics[:5],
            'bottom_managers': manager_analytics[-5:] if len(manager_analytics) > 5 else [],
            'all_managers': manager_analytics
        }
        
        cache.set(cache_key, result, 3600)
        
        return result
    
    @staticmethod
    def refresh_analytics_snapshot(tenant, snapshot_type='company'):
        """
        Refresh analytics snapshot for a tenant.
        
        Args:
            tenant: Client object or UUID
            snapshot_type: 'company', 'departments', or 'managers'
        
        Returns:
            AnalyticsSnapshot object
        """
        from ...models import AnalyticsSnapshot
        
        tid = getattr(tenant, 'id', tenant)
        snapshot_date = timezone.now().date()
        
        if snapshot_type == 'company':
            company_data = AnalyticsService.get_company_analytics(tenant)
            
            snapshot, created = AnalyticsSnapshot.objects.update_or_create(
                tenant_id=tid,
                snapshot_type='company',
                period='daily',
                defaults={
                    'company_average_score': company_data.get('average_score'),
                    'total_reviews_completed': company_data.get('total_ratings', 0),
                    'rating_distribution': company_data.get('rating_distribution'),
                }
            )
        
        elif snapshot_type == 'departments':
            dept_data = AnalyticsService.get_department_analytics(tenant)
            
            for dept in dept_data.get('departments', []):
                AnalyticsSnapshot.objects.update_or_create(
                    tenant_id=tid,
                    snapshot_type='department',
                    department_id=dept['id'],
                    period='daily',
                    defaults={
                        'team_average_score': dept.get('average_score'),
                        'total_reviews_completed': dept.get('ratings_count', 0),
                    }
                )
            snapshot = None
        
        elif snapshot_type == 'managers':
            manager_data = AnalyticsService.get_manager_analytics(tenant)
            
            for mgr in manager_data.get('all_managers', []):
                AnalyticsSnapshot.objects.update_or_create(
                    tenant_id=tid,
                    snapshot_type='manager',
                    manager_id=mgr['id'],
                    period='daily',
                    defaults={
                        'team_average_score': mgr.get('average_rating'),
                        'total_reviews_completed': mgr.get('timely_reviews', 0),
                    }
                )
            snapshot = None
        
        else:
            snapshot = None
        
        return snapshot