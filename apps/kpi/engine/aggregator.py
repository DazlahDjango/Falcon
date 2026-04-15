from decimal import Decimal
from typing import List, Dict
from django.db.models import Sum, Avg, Q, Count
from django.db import transaction
from apps.kpi.models import AggregatedScore, Score, KPIWeight, TrafficLight, MonthlyActual
from apps.organisations.models import Organisation, Team, Department, Hierarchy
from .formulas import WeightedAverageFormula

class IndividualAggregator:
    def aggregate_for_user(self, user_id: str, year: int, month: int, force: bool = False) -> Decimal:
        # Check if already aggregated
        if not force:
            existing = AggregatedScore.objects.filter(
                level='INDIVIDUAL',
                entity_id=user_id,
                year=year,
                month=month
            ).first()
            if existing:
                return existing.aggregated_score
        # Get scores with weights
        scores_with_weights = self._get_scores_with_weights(user_id, year, month)
        if not scores_with_weights:
            return Decimal('0')
        # Calculate weighted average
        total_weighted = sum(s['score'] * s['weight'] for s in scores_with_weights)
        total_weight = sum(s['weight'] for s in scores_with_weights)
        if total_weight == 0:
            return Decimal('0')
        aggregated_score = total_weighted / total_weight
        # Store aggregated score
        with transaction.atomic():
            AggregatedScore.objects.update_or_create(
                tenant_id=scores_with_weights[0].get('tenant_id') if scores_with_weights else None,
                level='INDIVIDUAL',
                entity_id=user_id,
                year=year,
                month=month,
                defaults={
                    'entity_name': user_id,  # Will be updated with actual name
                    'aggregated_score': aggregated_score,
                    'member_count': 1,
                    'kpi_count': len(scores_with_weights),
                    'calculation_method': 'weighted_average'
                }
            )
        return aggregated_score
    def _get_scores_with_weights(self, user_id: str, year: int, month: int) -> List[Dict]:
        """Get scores with their weights."""
        scores = Score.objects.filter(
            user_id=user_id,
            year=year,
            month=month
        ).select_related('kpi')
        result = []
        for score in scores:
            weight = KPIWeight.objects.filter(
                kpi=score.kpi,
                user_id=user_id,
                is_active=True,
                effective_from__lte=f"{year}-{month:02d}-01"
            ).filter(
                Q(effective_to__isnull=True) | Q(effective_to__gte=f"{year}-{month:02d}-01")
            ).first()
            weight_value = weight.weight if weight else Decimal('0')
            result.append({
                'score': score.score,
                'weight': weight_value,
                'kpi_id': str(score.kpi.id),
                'tenant_id': score.tenant_id
            })
        return result


class TeamAggregator:
    def __init__(self):
        self.weighted_avg = WeightedAverageFormula()
    def aggregate_for_team(self, team_id: str, team_name: str, tenant_id: str, member_ids: List[str], year: int, month: int, force: bool = False) -> Decimal:        
        # Check if already aggregated
        if not force:
            existing = AggregatedScore.objects.filter(
                level='TEAM',
                entity_id=team_id,
                year=year,
                month=month
            ).first()
            if existing:
                return existing.aggregated_score
        # Get individual scores
        individual_scores = AggregatedScore.objects.filter(
            level='INDIVIDUAL',
            entity_id__in=member_ids,
            year=year,
            month=month
        )
        if not individual_scores:
            return Decimal('0')
        # Calculate average
        scores_list = [s.aggregated_score for s in individual_scores]
        team_score = sum(scores_list) / len(scores_list)
        # Store aggregated score
        with transaction.atomic():
            AggregatedScore.objects.update_or_create(
                tenant_id=tenant_id,
                level='TEAM',
                entity_id=team_id,
                year=year,
                month=month,
                defaults={
                    'entity_name': team_name,
                    'aggregated_score': team_score,
                    'member_count': len(member_ids),
                    'kpi_count': individual_scores.aggregate(total=Sum('kpi_count'))['total'] or 0,
                    'calculation_method': 'average'
                }
            )
        return team_score
    def get_team_distribution(self, team_id: str, year: int, month: int) -> Dict[str, any]:
        team_aggregate = AggregatedScore.objects.filter(
            level='TEAM',
            entity_id=team_id,
            year=year,
            month=month
        ).first()
        if not team_aggregate:
            return {}
        individual_scores = AggregatedScore.objects.filter(
            level='INDIVIDUAL',
            year=year,
            month=month
        ).select_related('score')
        traffic_counts = TrafficLight.objects.filter(
            score__user_id__in=individual_scores.values_list('entity_id', flat=True),
            score__year=year,
            score__month=month
        ).values('status').annotate(count=Count('id'))
        distribution = {'GREEN': 0, 'YELLOW': 0, 'RED': 0}
        for item in traffic_counts:
            distribution[item['status']] = item['count']
        return {
            'team_score': team_aggregate.aggregated_score,
            'member_count': team_aggregate.member_count,
            'distribution': distribution,
            'top_performers': self._get_top_performers(team_id, year, month, limit=3),
            'needs_attention': self._get_needs_attention(team_id, year, month, limit=3)
        }
    def _get_top_performers(self, team_id: str, year: int, month: int, limit: int = 3) -> List[Dict]:
        return AggregatedScore.objects.filter(
            level='INDIVIDUAL',
            year=year,
            month=month
        ).order_by('-aggregated_score')[:limit].values('entity_name', 'aggregated_score')
    def _get_needs_attention(self, team_id: str, year: int, month: int, limit: int = 3) -> List[Dict]:
        return AggregatedScore.objects.filter(
            level='INDIVIDUAL',
            year=year,
            month=month,
            aggregated_score__lt=50
        ).order_by('aggregated_score')[:limit].values('entity_name', 'aggregated_score')
    
class DepartmentAggregator:
    def aggregate_for_department(self, dept_id: str, dept_name: str, tenant_id: str, team_ids: List[str], year: int, month: int, force: bool = False) -> Decimal:
        if not force:
            existing = AggregatedScore.objects.filter(
                level='DEPARTMENT',
                entity_id=dept_id,
                year=year,
                month=month
            ).first()
            if existing:
                return existing.aggregated_score()
        team_scores = AggregatedScore.objects.filter(
            level='TEAM',
            entity_id__in=team_ids,
            year=year,
            month=month
        )
        if not team_scores:
            individual_scores = AggregatedScore.objects.filter(
                level='INDIVIDUAL',
                year=year,
                month=month
            )
            if not individual_scores:
                return Decimal('0')
            scores_list = [s.aggregated_score for s in individual_scores]
            dept_score = sum(scores_list) / len(scores_list)
            member_count = len(individual_scores)
            kpi_count = individual_scores.aggregate(total=Sum('kpi_count'))['total'] or 0
        else:
            scores_list = []
            weights = []
            for team in team_scores:
                scores_list.append(team.aggregated_score)
                weights.append(team.member_count)
            total_weight = sum(weights)
            if total_weight > 0:
                dept_score = sum(s * w for s, w in zip(scores_list, weights)) / total_weight
            else:
                dept_score = Decimal('0')
            member_count = team_scores.aggregate(total=Sum('member_count'))['total'] or 0
            kpi_count = team_scores.aggregate(total=Sum('kpi_count'))['total'] or 0
        with transaction.atomic():
            AggregatedScore.objects.update_or_create(
                tenant_id=tenant_id,
                level='DEPARTMENT',
                entity_id=dept_id,
                year=year,
                month=month,
                defaults={
                    'entity_name': dept_name,
                    'aggregated_score': dept_score,
                    'member_count': member_count,
                    'kpi_count': kpi_count,
                    'calculation_method': 'weighted_average'
                }
            )
        return dept_score
    def get_department_ranking(self, tenant_id: str, year: int, month: int) -> List[Dict]:
        return AggregatedScore.objects.filter(
            level='DEPARTMENT',
            tenant_id=tenant_id,
            year=year,
            month=month
        ).values('entity_id', 'entity_name', 'aggregated_score').order_by('-aggregated_score')

class OrganizationAggregator:
    def aggregate_for_organization(self, tenant_id: str, tenant_name: str, year: int, month: int, force: bool = False) -> Decimal:
        if not force:
            existing = AggregatedScore.objects.filter(
                level='ORGANIZATION',
                entity_id=tenant_id,
                year=year,
                month=month
            ).first()
            if existing:
                return existing.aggregated_score
        # Get department scores
        dept_scores = AggregatedScore.objects.filter(
            level='DEPARTMENT',
            tenant_id=tenant_id,
            year=year,
            month=month
        )
        if not dept_scores:
            # Fall back to individual aggregation
            individual_scores = AggregatedScore.objects.filter(
                level='INDIVIDUAL',
                tenant_id=tenant_id,
                year=year,
                month=month
            )
            if not individual_scores:
                return Decimal('0')
            org_score = individual_scores.aggregate(avg=Avg('aggregated_score'))['avg'] or Decimal('0')
            member_count = individual_scores.count()
            kpi_count = individual_scores.aggregate(total=Sum('kpi_count'))['total'] or 0
        else:
            # Weighted by department size
            scores_list = [s.aggregated_score for s in dept_scores]
            weights = [s.member_count for s in dept_scores]
            
            total_weight = sum(weights)
            if total_weight > 0:
                org_score = sum(s * w for s, w in zip(scores_list, weights)) / total_weight
            else:
                org_score = Decimal('0')
            member_count = dept_scores.aggregate(total=Sum('member_count'))['total'] or 0
            kpi_count = dept_scores.aggregate(total=Sum('kpi_count'))['total'] or 0
        # Store aggregated score
        with transaction.atomic():
            AggregatedScore.objects.update_or_create(
                tenant_id=tenant_id,
                level='ORGANIZATION',
                entity_id=tenant_id,
                year=year,
                month=month,
                defaults={
                    'entity_name': tenant_name,
                    'aggregated_score': org_score,
                    'member_count': member_count,
                    'kpi_count': kpi_count,
                    'calculation_method': 'weighted_average'
                }
            )
        return org_score
    def get_organization_health_summary(self, tenant_id: str, year: int, month: int) -> Dict:
        org_score = self.aggregate_for_organization(tenant_id, '', year, month)
        # Get department breakdown
        dept_scores = AggregatedScore.objects.filter(
            level='DEPARTMENT',
            tenant_id=tenant_id,
            year=year,
            month=month
        ).values('entity_name', 'aggregated_score')
        red_count = TrafficLight.objects.filter(
            score__tenant_id=tenant_id,
            score__year=year,
            score__month=month,
            status='RED'
        ).count()
        total_kpis = Score.objects.filter(
            tenant_id=tenant_id,
            year=year,
            month=month
        ).count()
        red_percentage = (red_count / total_kpis * 100) if total_kpis > 0 else 0
        # Validation compliance
        total_expected = MonthlyActual.objects.filter(
            tenant_id=tenant_id,
            year=year,
            month=month
        ).count()
        validated = MonthlyActual.objects.filter(
            tenant_id=tenant_id,
            year=year,
            month=month,
            status='APPROVED'
        ).count()
        compliance_rate = (validated / total_expected * 100) if total_expected > 0 else 0
        return {
            'overall_health_score': org_score,
            'red_kpi_count': red_count,
            'red_kpi_percentage': round(red_percentage, 2),
            'validation_compliance_rate': round(compliance_rate, 2),
            'department_breakdown': list(dept_scores),
            'risk_level': self._get_risk_level(org_score, red_percentage)
        }
    def _get_risk_level(self, health_score: Decimal, red_percentage: Decimal) -> str:
        """Determine organization risk level."""
        if health_score >= 85 and red_percentage < 10:
            return 'LOW'
        elif health_score >= 60 and red_percentage < 25:
            return 'MEDIUM'
        else:
            return 'HIGH'

class HierarchyAggregator:
    def __init__(self):
        self.individual = IndividualAggregator()
        self.team = TeamAggregator()
        self.department = DepartmentAggregator()
        self.organization = OrganizationAggregator()
    def aggregate_for_user(self, user_id: str, year: int, month: int, force: bool = False) -> Decimal:
        return self.individual.aggregate_for_user(user_id, year, month, force)
    def aggregate_for_teams(self, tenant_id: str, year: int, month: int, force: bool = False) -> Dict:
        results = {}
        teams = Team.objects.filter(tenant_id=tenant_id, is_active=True)
        for team in teams:
            member_ids = team.get_member_ids()
            score = self.team.aggregate_for_team(
                str(team.id), team.name, tenant_id, member_ids, year, month, force
            )
            results[str(team.id)] = score
        return results
    def aggregate_for_departments(self, tenant_id: str, year: int, month: int, force: bool = False) -> Dict:
        results = {}
        departments = Department.objects.filter(tenant_id=tenant_id, is_active=True)
        for dept in departments:
            team_ids = dept.get_team_ids()
            score = self.department.aggregate_for_department(
                str(dept.id), dept.name, tenant_id, team_ids, year, month, force
            )
            results[str(dept.id)] = score
        return results
    def aggregate_for_organization(self, tenant_id: str, year: int, month: int, 
                                    tenant_name: str = "", force: bool = False) -> Decimal:
        """Aggregate for the entire organization."""
        return self.organization.aggregate_for_organization(
            tenant_id, tenant_name, year, month, force
        )
    def get_hierarchy_dashboard(self, user_id: str, year: int, month: int) -> Dict:
        # Get user's own score
        user_score = self.aggregate_for_user(user_id, year, month)
        
        # Get direct reports
        direct_reports = Hierarchy.objects.filter(
            manager_id=user_id
        ).select_related('employee')
        reports_data = []
        for report in direct_reports:
            report_score = self.aggregate_for_user(report.employee_id, year, month)
            reports_data.append({
                'user_id': str(report.employee.id),
                'name': report.employee.get_full_name(),
                'score': report_score,
                'traffic_light': self._get_traffic_light(report_score)
            })
        return {
            'user_id': user_id,
            'user_score': user_score,
            'user_traffic_light': self._get_traffic_light(user_score),
            'direct_reports': reports_data,
            'team_count': len(reports_data),
            'avg_team_score': sum(r['score'] for r in reports_data) / len(reports_data) if reports_data else 0
        }
    def get_full_org_hierarchy(self, tenant_id: str, year: int, month: int) -> Dict:
        # Get organization health
        org_score = self.aggregate_for_organization(tenant_id, year, month)
        # Get departments
        departments = Department.objects.filter(tenant_id=tenant_id, is_active=True)
        dept_data = []
        for dept in departments:
            dept_score = self.department.aggregate_for_department(
                str(dept.id), dept.name, tenant_id, dept.get_team_ids(), year, month
            )
            # Get teams in department
            teams = Team.objects.filter(department=dept, is_active=True)
            team_data = []
            for team in teams:
                team_score = self.team.aggregate_for_team(
                    str(team.id), team.name, tenant_id, team.get_member_ids(), year, month
                )
                team_data.append({
                    'id': str(team.id),
                    'name': team.name,
                    'score': team_score,
                    'traffic_light': self._get_traffic_light(team_score)
                })
            dept_data.append({
                'id': str(dept.id),
                'name': dept.name,
                'score': dept_score,
                'traffic_light': self._get_traffic_light(dept_score),
                'teams': team_data
            })
        return {
            'tenant_id': tenant_id,
            'organization_score': org_score,
            'organization_traffic_light': self._get_traffic_light(org_score),
            'departments': dept_data
        }
    def _get_traffic_light(self, score: Decimal) -> str:
        if score >= 90:
            return 'GREEN'
        elif score >= 50:
            return 'YELLOW'
        return 'RED'
    
