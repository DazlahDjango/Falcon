# apps/reviews/services/calibration/outlier_detector.py
"""
Detect inconsistent or outlier ratings for calibration
"""

from statistics import mean, stdev
from django.db.models import Avg, Count

from ...models import FinalRating
from ..base_service import BaseReviewService


class OutlierDetector(BaseReviewService):
    """
    Detects rating outliers and inconsistencies for calibration
    """
    
    @staticmethod
    def get_department_statistics(review_cycle):
        """
        Get rating statistics by department.
        
        Args:
            review_cycle: ReviewCycle object
        
        Returns:
            dict: Statistics per department
        """
        ratings = FinalRating.objects.filter(
            review_cycle=review_cycle,
            final_score__isnull=False,
            status__in=['calibrated', 'approved', 'locked']
        ).select_related('employee__department')
        
        dept_stats = {}
        
        for rating in ratings:
            dept_name = rating.employee.department.name if rating.employee.department else 'No Department'
            
            if dept_name not in dept_stats:
                dept_stats[dept_name] = {
                    'scores': [],
                    'count': 0,
                    'avg': 0,
                    'std_dev': 0,
                    'min': None,
                    'max': None
                }
            
            dept_stats[dept_name]['scores'].append(float(rating.final_score))
            dept_stats[dept_name]['count'] += 1
            
            # Update min/max
            if dept_stats[dept_name]['min'] is None or rating.final_score < dept_stats[dept_name]['min']:
                dept_stats[dept_name]['min'] = float(rating.final_score)
            
            if dept_stats[dept_name]['max'] is None or rating.final_score > dept_stats[dept_name]['max']:
                dept_stats[dept_name]['max'] = float(rating.final_score)
        
        # Calculate averages and standard deviations
        for dept_name, stats in dept_stats.items():
            if stats['scores']:
                stats['avg'] = round(mean(stats['scores']), 2)
                if len(stats['scores']) > 1:
                    stats['std_dev'] = round(stdev(stats['scores']), 2)
        
        return dept_stats
    
    @staticmethod
    def get_manager_statistics(review_cycle):
        """
        Get rating statistics by manager (who gave the ratings).
        
        Args:
            review_cycle: ReviewCycle object
        
        Returns:
            dict: Statistics per manager
        """
        ratings = FinalRating.objects.filter(
            review_cycle=review_cycle,
            final_score__isnull=False,
            supervisor_review__supervisor__isnull=False
        ).select_related('supervisor_review__supervisor')
        
        manager_stats = {}
        
        for rating in ratings:
            manager = rating.supervisor_review.supervisor
            manager_name = manager.email if manager else 'Unknown'
            
            if manager_name not in manager_stats:
                manager_stats[manager_name] = {
                    'scores': [],
                    'count': 0,
                    'avg': 0,
                    'ratings_given': []
                }
            
            manager_stats[manager_name]['scores'].append(float(rating.final_score))
            manager_stats[manager_name]['count'] += 1
        
        # Calculate averages
        for manager_name, stats in manager_stats.items():
            if stats['scores']:
                stats['avg'] = round(mean(stats['scores']), 2)
        
        return manager_stats
    
    @staticmethod
    def find_outliers(review_cycle, std_dev_threshold=1.5):
        """
        Find outlier ratings that need calibration attention.
        
        Args:
            review_cycle: ReviewCycle object
            std_dev_threshold: Standard deviation threshold (default 1.5)
        
        Returns:
            list: Outlier ratings with details
        """
        dept_stats = OutlierDetector.get_department_statistics(review_cycle)
        outliers = []
        
        ratings = FinalRating.objects.filter(
            review_cycle=review_cycle,
            final_score__isnull=False,
            status__in=['pending', 'calibrated']
        ).select_related('employee__department', 'supervisor_review__supervisor')
        
        for rating in ratings:
            dept_name = rating.employee.department.name if rating.employee.department else 'No Department'
            dept_stat = dept_stats.get(dept_name, {})
            
            is_outlier = False
            reason = []
            
            # Check department average deviation
            if dept_stat.get('avg'):
                avg = dept_stat['avg']
                std = dept_stat.get('std_dev', 0)
                score = float(rating.final_score)
                
                if std > 0:
                    z_score = abs(score - avg) / std
                    if z_score > std_dev_threshold:
                        is_outlier = True
                        reason.append(f"Score deviates {z_score:.1f} standard deviations from department average")
            
            # Check if severely low or high
            if rating.final_score < 40:
                is_outlier = True
                reason.append("Score is critically low (<40%)")
            
            if rating.final_score > 95:
                is_outlier = True
                reason.append("Score is exceptionally high (>95%)")
            
            if is_outlier:
                outliers.append({
                    'employee': rating.employee.email,
                    'department': dept_name,
                    'manager': rating.supervisor_review.supervisor.email if rating.supervisor_review and rating.supervisor_review.supervisor else 'Unknown',
                    'score': float(rating.final_score),
                    'rating_id': rating.id,
                    'reasons': reason
                })
        
        return outliers
    
    @staticmethod
    def find_inconsistent_managers(review_cycle):
        """
        Find managers whose ratings are consistently different from department averages.
        
        Args:
            review_cycle: ReviewCycle object
        
        Returns:
            list: Managers with inconsistent ratings
        """
        manager_stats = OutlierDetector.get_manager_statistics(review_cycle)
        dept_stats = OutlierDetector.get_department_statistics(review_cycle)
        
        inconsistent_managers = []
        
        for manager_name, stats in manager_stats.items():
            if stats.get('avg'):
                # Compare to overall cycle average
                all_ratings = FinalRating.objects.filter(
                    review_cycle=review_cycle,
                    final_score__isnull=False
                )
                all_scores = [float(r.final_score) for r in all_ratings]
                overall_avg = mean(all_scores) if all_scores else 0
                
                manager_avg = stats['avg']
                
                if abs(manager_avg - overall_avg) > 15:
                    inconsistent_managers.append({
                        'manager': manager_name,
                        'average_rating': manager_avg,
                        'overall_average': round(overall_avg, 2),
                        'deviation': round(manager_avg - overall_avg, 2),
                        'employees_count': stats['count']
                    })
        
        return inconsistent_managers
    
    @staticmethod
    def get_calibration_recommendations(review_cycle):
        """
        Get recommendations for which ratings need calibration.
        
        Args:
            review_cycle: ReviewCycle object
        
        Returns:
            dict: Recommendations with priorities
        """
        outliers = OutlierDetector.find_outliers(review_cycle)
        inconsistent_managers = OutlierDetector.find_inconsistent_managers(review_cycle)
        
        recommendations = {
            'high_priority': [],
            'medium_priority': [],
            'low_priority': []
        }
        
        # High priority: Critical outliers
        for outlier in outliers:
            if outlier['score'] < 40 or outlier['score'] > 95:
                recommendations['high_priority'].append(outlier)
            else:
                recommendations['medium_priority'].append(outlier)
        
        # Add inconsistent managers
        for manager in inconsistent_managers:
            recommendations['high_priority'].append({
                'type': 'manager_bias',
                'manager': manager['manager'],
                'deviation': manager['deviation'],
                'recommendation': f"Manager's average rating {manager['deviation']:+.1f}% from company average. Review all ratings from this manager."
            })
        
        return recommendations