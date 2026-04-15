from django.db import models
from django.db.models import Q, Sum, Avg, F
from django.utils import timezone
from .base import TenantAwareManager, SoftDeleteManager

class MonthlyActualManager(TenantAwareManager):
    def pending(self):
        return self.filter(status='PENDING')
    def approved(self):
        return self.filter(status='APPROVED')
    def rejected(self):
        return self.filter(status='REJECTED')
    def for_user(self, user_id, year=None, month=None):
        queryset = self.filter(user_id=user_id)
        if year:
            queryset = queryset.filter(year=year)
        if month:
            queryset = queryset.filter(month=month)
        return queryset
    def for_kpi(self, kpi_id, year=None, month=None):
        queryset = self.filter(kpi_id=kpi_id)
        if year:
            queryset = queryset.filter(year=year)
        if month:
            queryset = queryset.filter(month=month)
        return queryset
    def for_manager_team(self, manager_id, year=None, month=None):
        from apps.organisations.models import Hierarchy
        direct_reports = Hierarchy.objects.filter(
            manager_id=manager_id
        ).values_list('employee_id', flat=True)
        queryset = self.filter(user_id__in=direct_reports)
        if year:
            queryset = queryset.filter(year=year)
        if month:
            queryset = queryset.filter(month=month)
        return queryset
    def by_period(self, year, month):
        return self.filter(year=year, month=month)
    def by_year(self, year):
        return self.filter(year=year)
    def missing_for_period(self, user_ids, year, month):
        submitted_users = self.filter(
            year=year,
            month=month,
            user_id__in=user_ids
        ).values_list('user_id', flat=True).distinct()
        missing = set(user_ids) - set(submitted_users)
        return missing
    def get_user_performance(self, user_id, year):
        return self.filter(
            user_id=user_id,
            year=year,
            status='APPROVED'
        ).values('month').annotate(
            total_actual=Sum('actual_value')
        ).order_by('month')
    def get_cumulative_actual(self, user_id, year, month):
        return self.filter(
            user_id=user_id,
            year=year,
            month__lte=month,
            status='APPROVED'
        ).aggregate(cumulative=Sum('actual_value'))['cumulative'] or 0
    def get_team_performance(self, manager_id, year, month):
        from django.db.models import Count
        return self.for_manager_team(manager_id, year, month).values(
            'user_id', 'user__email'
        ).annotate(
            total_actual=Sum('actual_value'),
            kpi_count=Count('id'),
            approved_count=Count('id', filter=Q(status='APPROVED')),
            pending_count=Count('id', filter=Q(status='PENDING')),
        )
    def needs_validation_alert(self, hours=48):
        cutoff = timezone.now() - timezone.timedelta(hours=hours)
        return self.filter(status='PENDING', submitted_at__lte=cutoff)
    def bulk_create_with_validation(self, actuals_list, user):
        from django.core.exceptions import ValidationError
        created = []
        errors = []
        for actual_data in actuals_list:
            try:
                actual = self.model(**actual_data)
                actual.full_clean()
                actual.submitted_by = user
                actual.save()
                created.append(actual)
            except Exception as e:
                errors.append({'data': actual_data, 'error': str(e)})
        return {'created': created, 'errors': errors}
    
class ActualHistoryManager(TenantAwareManager):
    def for_actual(self, actual_id):
        return self.filter(actual_id=actual_id)
    def by_user(self, user_id):
        return self.filter(performed_by_id=user_id)
    def by_action(self, action):
        return self.filter(action=action)
    def get_timeline(self, actual_id):
        return self.for_actual(actual_id).order_by('performed_at')