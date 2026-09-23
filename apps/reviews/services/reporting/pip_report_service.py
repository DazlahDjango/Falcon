from django.utils import timezone
from django.db.models import Count, Q, Avg
from datetime import date, datetime, timedelta

from ...models import PIP, PIPAction, PIPReview
from ..base_service import BaseReviewService


def _to_date(val):
    if not val:
        return None
    if isinstance(val, date) and not isinstance(val, datetime):
        return val
    if isinstance(val, datetime):
        return val.date()
    if isinstance(val, str):
        try:
            return date.fromisoformat(val.split('T')[0])
        except Exception:
            return None
    return None


def _to_iso(val):
    if not val:
        return None
    if hasattr(val, 'isoformat'):
        return val.isoformat()
    return str(val)


class PIPReportService(BaseReviewService):
    """
    Generates reports and analytics for Performance Improvement Plans
    """
    
    @staticmethod
    def get_pip_details(pip_id):
        """
        Get detailed PIP report for a single PIP.
        
        Args:
            pip_id: ID of PIP instance
        
        Returns:
            dict: Detailed PIP report
        """
        pip = PIP.objects.get(id=pip_id)
        
        # Get actions
        actions = pip.actions.all()
        total_actions = actions.count()
        completed_actions = actions.filter(status='completed').count()
        pending_actions = actions.filter(status='pending').count()
        missed_actions = actions.filter(status='missed').count()
        
        # Get reviews
        reviews = pip.reviews.all().order_by('-review_date')
        
        # Calculate progress
        today = timezone.now().date()
        s_date = _to_date(pip.start_date) or today
        e_date = _to_date(pip.end_date) or (today + timedelta(days=30))
        
        total_days = max(1, (e_date - s_date).days)
        elapsed_days = (today - s_date).days if today > s_date else 0
        remaining_days = max(0, (e_date - today).days) if today < e_date else 0
        
        return {
            'pip': {
                'id': pip.id,
                'title': pip.title,
                'severity': pip.get_severity_display(),
                'status': pip.get_status_display(),
                'start_date': _to_iso(pip.start_date),
                'end_date': _to_iso(pip.end_date),
                'extended_to_date': _to_iso(pip.extended_to_date),
            },
            'employee': {
                'id': str(pip.employee.id),
                'name': pip.employee.get_full_name(),
                'email': pip.employee.email,
                'position': getattr(getattr(pip.employee, 'position', None), 'title', str(getattr(pip.employee, 'position', '') or '')) or None,
                'department': getattr(getattr(pip.employee, 'department', None), 'name', str(getattr(pip.employee, 'department', '') or '')) or None,
            },
            'owner': {
                'id': str(pip.owner.id),
                'name': pip.owner.get_full_name(),
                'email': pip.owner.email,
            },
            'improvement': {
                'areas': pip.improvement_areas,
                'success_criteria': pip.success_criteria,
                'consequences_if_failed': pip.consequences_if_failed,
                'consequences_if_successful': pip.consequences_if_successful,
            },
            'actions': {
                'total': total_actions,
                'completed': completed_actions,
                'pending': pending_actions,
                'missed': missed_actions,
                'completion_percentage': round((completed_actions / total_actions) * 100, 1) if total_actions > 0 else 0,
                'list': [
                    {
                        'title': action.title,
                        'priority': action.get_priority_display(),
                        'due_date': _to_iso(action.due_date),
                        'status': action.get_status_display(),
                        'completed_at': _to_iso(action.completed_at),
                        'requires_evidence': action.requires_evidence,
                        'has_evidence': bool(action.evidence),
                    }
                    for action in actions
                ]
            },
            'reviews': [
                {
                    'date': _to_iso(review.review_date),
                    'rating': review.get_rating_display(),
                    'summary': review.summary,
                    'accomplishments': review.accomplishments,
                    'challenges': review.challenges,
                    'action_items': review.action_items,
                    'employee_attended': review.employee_attended,
                }
                for review in reviews
            ],
            'progress': {
                'total_days': total_days,
                'elapsed_days': elapsed_days,
                'remaining_days': remaining_days,
                'completion_percentage': round((completed_actions / total_actions) * 100, 2) if total_actions > 0 else 0,
                'days_remaining_percentage': round((remaining_days / total_days) * 100, 2) if total_days > 0 else 0,
                'is_on_track': missed_actions == 0 and remaining_days > 0,
                'needs_attention': missed_actions > 0 or (remaining_days < 14 and completed_actions < total_actions),
            },
            'outcome': {
                'result': pip.get_outcome_display() if pip.outcome else 'In Progress',
                'notes': pip.outcome_notes,
                'completed_at': _to_iso(pip.completed_at),
            }
        }
    
    @staticmethod
    def get_organization_pip_summary(tenant, status=None):
        """
        Get summary of all PIPs in an organization.
        
        Args:
            tenant: Client instance or UUID
            status: Optional status filter
        
        Returns:
            dict: Organization PIP summary
        """
        tid = getattr(tenant, 'id', tenant)
        queryset = PIP.objects.filter(tenant_id=tid)
        
        if status:
            queryset = queryset.filter(status=status)
        
        total = queryset.count()
        
        # Count by severity
        severity_counts = {
            'minor': queryset.filter(severity='minor').count(),
            'moderate': queryset.filter(severity='moderate').count(),
            'severe': queryset.filter(severity='severe').count(),
            'critical': queryset.filter(severity='critical').count(),
        }
        
        # Count by department
        department_counts = {}
        for pip in queryset.select_related('employee'):
            dept_name = str(pip.employee.department) if pip.employee.department else 'No Department'
            department_counts[dept_name] = department_counts.get(dept_name, 0) + 1
        
        # Count by outcome
        outcome_counts = {
            'successful': queryset.filter(outcome='successful').count(),
            'extended': queryset.filter(outcome='extended').count(),
            'failed': queryset.filter(outcome='failed').count(),
            'terminated': queryset.filter(outcome='terminated').count(),
            'resigned': queryset.filter(outcome='resigned').count(),
            'pending': queryset.filter(outcome__isnull=True).count(),
        }
        
        # Active PIPs summary (draft or submitted)
        active_pips = queryset.filter(status__in=['draft', 'submitted', 'active'])
        active_count = active_pips.count()
        
        # Overdue PIPs
        today = timezone.now().date()
        overdue_pips = active_pips.filter(end_date__lt=today).count()
        
        # PIPs ending soon (within 14 days)
        soon_date = today + timedelta(days=14)
        ending_soon = active_pips.filter(end_date__lte=soon_date, end_date__gte=today).count()
        
        # Average completion rate for successful PIPs
        successful_pips = queryset.filter(outcome='successful')
        avg_completion_rate = 0
        if successful_pips.exists():
            total_completion_rates = []
            for pip in successful_pips.prefetch_related('actions'):
                total_actions = pip.actions.count()
                if total_actions > 0:
                    completed = pip.actions.filter(status='completed').count()
                    total_completion_rates.append((completed / total_actions) * 100)
            if total_completion_rates:
                avg_completion_rate = round(sum(total_completion_rates) / len(total_completion_rates), 1)
        
        return {
            'total_pips': total,
            'active_pips': active_count,
            'overdue_pips': overdue_pips,
            'ending_soon_pips': ending_soon,
            'by_severity': severity_counts,
            'by_department': department_counts,
            'by_outcome': outcome_counts,
            'success_rate': round((outcome_counts['successful'] / total) * 100, 1) if total > 0 else 0,
            'average_completion_rate': round(avg_completion_rate, 1) if avg_completion_rate else 0,
        }
    
    @staticmethod
    def get_manager_pip_report(manager):
        """
        Get PIP report for a manager (all PIPs they own).
        
        Args:
            manager: User instance
        
        Returns:
            dict: Manager's PIP report
        """
        pips = PIP.objects.filter(owner=manager)
        active_pips = pips.filter(status__in=['draft', 'submitted', 'active'])
        
        return {
            'manager': {
                'id': manager.id,
                'name': manager.get_full_name(),
                'email': manager.email,
            },
            'summary': {
                'total_pips': pips.count(),
                'active_pips': active_pips.count(),
                'completed_pips': pips.filter(status='completed').count(),
                'successful_pips': pips.filter(outcome='successful').count(),
                'failed_pips': pips.filter(outcome='failed').count(),
                'overdue_pips': active_pips.filter(end_date__lt=timezone.now().date()).count(),
            },
            'active_pip_details': [
                {
                    'id': pip.id,
                    'employee': pip.employee.get_full_name(),
                    'title': pip.title,
                    'severity': pip.get_severity_display(),
                    'start_date': _to_iso(pip.start_date),
                    'end_date': _to_iso(pip.end_date),
                    'days_remaining': (pip.end_date - timezone.now().date()).days if pip.end_date else 0,
                    'actions_completed': pip.actions.filter(status='completed').count(),
                    'total_actions': pip.actions.count(),
                }
                for pip in active_pips.order_by('end_date')
            ],
        }
    
    @staticmethod
    def get_pip_trends(tenant, months=6):
        """
        Get PIP trends over time.
        
        Args:
            tenant: Client instance or UUID
            months: Number of months to look back
        
        Returns:
            dict: Monthly trend data
        """
        tid = getattr(tenant, 'id', tenant)
        today = timezone.now().date()
        trends = []
        
        for i in range(months):
            month_start = today.replace(day=1) - timedelta(days=30 * i)
            month_end = (month_start + timedelta(days=32)).replace(day=1) - timedelta(days=1)
            
            month_pips = PIP.objects.filter(
                tenant_id=tid,
                created_at__date__gte=month_start,
                created_at__date__lte=month_end
            )
            
            trends.append({
                'month': month_start.strftime('%B %Y'),
                'created': month_pips.count(),
                'completed': month_pips.filter(status='completed').count(),
                'successful': month_pips.filter(outcome='successful').count(),
                'failed': month_pips.filter(outcome='failed').count(),
            })
        
        return trends