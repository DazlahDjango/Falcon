from django.db import models
from django.db.models import Q, Sum, Avg, Count, Min, Max, F
from django.db.models.functions import Coalesce
from decimal import Decimal
from .base import TenantAwareManager

class ScoreManager(TenantAwareManager):
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
    def for_period(self, year, month):
        return self.filter(year=year, month=month)
    def get_user_period_score(self, user_id, year, month):
        return self.filter(
            user_id=user_id,
            year=year,
            month=month
        ).aggregate(
            avg_score=Avg('score')
        )['avg_score'] or Decimal('0')
    def get_user_yearly_trend(self, user_id, year):
        return self.filter(
            user_id=user_id,
            year=year
        ).values('month').annotate(
            avg_score=Avg('score')
        ).order_by('month')
    def get_team_scores(self, user_ids, year, month):
        return self.filter(
            user_id__in=user_ids,
            year=year,
            month=month
        ).values('user_id').annotate(
            total_score=Avg('score')
        )
    def get_kpi_performance(self, kpi_id, year):
        return self.filter(
            kpi_id=kpi_id,
            year=year
        ).values('month').annotate(
            avg_score=Avg('score'),
            min_score=Min('score'),
            max_score=Max('score')
        ).order_by('month')
    def get_top_performers(self, year, month, limit=10):
        return self.filter(
            year=year,
            month=month
        ).values('user_id', 'user__email', 'user__profile__full_name').annotate(
            overall_score=Avg('score')
        ).order_by('-overall_score')[:limit]
    def get_bottom_performers(self, year, month, limit=10):
        return self.filter(
            year=year,
            month=month
        ).values('user_id', 'user__email', 'user__profile__full_name').annotate(
            overall_score=Avg('score')
        ).order_by('overall_score')[:limit]
    def get_score_distribution(self, year, month):
        return self.filter(year=year, month=month).aggregate(
            excellent=Count('id', filter=Q(score__gte=90)),
            good=Count('id', filter=Q(score__gte=75, score__lt=90)),
            average=Count('id', filter=Q(score__gte=50, score__lt=75)),
            poor=Count('id', filter=Q(score__lt=50)),
        )
    def calculate_weighted_user_score(self, user_id, year, month):
        result = self.filter(
            user_id=user_id,
            year=year,
            month=month,
            kpi__weights__is_active=True,
            kpi__weights__for_user=user_id,
            kpi__weights__efective_from__lte=f"{year}-{month:02d}-01"
        ).filter(
            Q(kpi__weights__effective_to__isnull=True) |
            Q(kpi__weights__effective_to__gte=f"{year}-{month:02d}-01")
        ).aggregate(weighted_sum=Sum(F('score') * F('kpi__weights__weight') / 100), total_weight=Sum('kpi__weights__weight'))
        weighted_sum = result['weighted_sum'] or Decimal('0')
        total_weight = result['total_weight'] or Decimal('0')
        if total_weight > 0:
            return weighted_sum / total_weight * 100
        return Decimal('0')
    
class AggregatedScoreManager(TenantAwareManager):
    def for_entity(self, level, entity_id, year=None, month=None):
        queryset = self.filter(level=level, entity_id=entity_id)
        if year:
            queryset = queryset.filter(year=year)
        if month:
            queryset = queryset.filter(month=month)
        return queryset
    def for_team(self, team_id, year=None, month=None):
        return self.for_entity('TEAM', team_id, year, month)
    def for_department(self, department_id, year=None, month=None):
        return self.for_entity('DEPARTMENT', department_id, year, month)
    def for_organization(self, tenant_id, year=None, month=None):
        return self.for_entity('ORGANIZATION', tenant_id, year, month)
    def get_entity_trend(self, level, entity_id):
        return self.filter(
            level=level,
            entity_id=entity_id
        ).values('year', 'month').annotate(
            score=Avg('aggregated_score')
        ).order_by('year', 'month')
    def get_organization_health(self, tenant_id, year, month):
        return self.filter(
            level='ORGANIZATION',
            entity_id=tenant_id,
            year=year,
            month=month
        ).first()
    def get_department_ranking(self, tenant_id, year, month):
        return self.filter(
            level='DEPARTMENT',
            tenant_id=tenant_id,
            year=year,
            month=month
        ).values('entity_id', 'entity_name', 'aggregated_score').order_by('-aggregated_score')
