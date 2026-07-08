from decimal import Decimal
from typing import List, Dict
from django.db.models import Sum, Avg, Q, Count
from django.db import transaction
from apps.kpi.models import AggregatedScore, Score, KPIWeight, TrafficLight, MonthlyActual
from apps.structure.models import Unit, Department, ReportingLine  # Changed Team to Unit
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


class UnitAggregator:  # Changed from TeamAggregator
    def __init__(self):
        self.weighted_avg = WeightedAverageFormula()
    
    def aggregate_for_unit(self, unit_id: str, unit_name: str, tenant_id: str, member_ids: List[str], year: int, month: int, force: bool = False) -> Decimal:
        # Check if already aggregated
        if not force:
            existing = AggregatedScore.objects.filter(
                level='UNIT',  # Changed from TEAM
                entity_id=unit_id,
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
        unit_score = sum(scores_list) / len(scores_list)
        # Store aggregated score
        with transaction.atomic():
            AggregatedScore.objects.update_or_create(
                tenant_id=tenant_id,
                level='UNIT',  # Changed from TEAM
                entity_id=unit_id,
                year=year,
                month=month,
                defaults={
                    'entity_name': unit_name,
                    'aggregated_score': unit_score,
                    'member_count': len(member_ids),
                    'kpi_count': individual_scores.aggregate(total=Sum('kpi_count'))['total'] or 0,
                    'calculation_method': 'average'
                }
            )
        return unit_score
    
    def get_unit_distribution(self, unit_id: str, year: int, month: int) -> Dict[str, any]:
        unit_aggregate = AggregatedScore.objects.filter(
            level='UNIT',  # Changed from TEAM
            entity_id=unit_id,
            year=year,
            month=month
        ).first()
        if not unit_aggregate:
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
            'unit_score': unit_aggregate.aggregated_score,  # Changed from team_score
            'member_count': unit_aggregate.member_count,
            'distribution': distribution,
            'top_performers': self._get_top_performers(unit_id, year, month, limit=3),
            'needs_attention': self._get_needs_attention(unit_id, year, month, limit=3)
        }
    
    def _get_top_performers(self, unit_id: str, year: int, month: int, limit: int = 3) -> List[Dict]:
        return AggregatedScore.objects.filter(
            level='INDIVIDUAL',
            year=year,
            month=month
        ).order_by('-aggregated_score')[:limit].values('entity_name', 'aggregated_score')
    
    def _get_needs_attention(self, unit_id: str, year: int, month: int, limit: int = 3) -> List[Dict]:
        return AggregatedScore.objects.filter(
            level='INDIVIDUAL',
            year=year,
            month=month,
            aggregated_score__lt=50
        ).order_by('aggregated_score')[:limit].values('entity_name', 'aggregated_score')


class DepartmentAggregator:
    def aggregate_for_department(self, dept_id: str, dept_name: str, tenant_id: str, unit_ids: List[str], year: int, month: int, force: bool = False) -> Decimal:
        if not force:
            existing = AggregatedScore.objects.filter(
                level='DEPARTMENT',
                entity_id=dept_id,
                year=year,
                month=month
            ).first()
            if existing:
                return existing.aggregated_score
        unit_scores = AggregatedScore.objects.filter(
            level='UNIT',  # Changed from TEAM
            entity_id__in=unit_ids,
            year=year,
            month=month
        )
        if not unit_scores:
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
            for unit in unit_scores:
                scores_list.append(unit.aggregated_score)
                weights.append(unit.member_count)
            total_weight = sum(weights)
            if total_weight > 0:
                dept_score = sum(s * w for s, w in zip(scores_list, weights)) / total_weight
            else:
                dept_score = Decimal('0')
            member_count = unit_scores.aggregate(total=Sum('member_count'))['total'] or 0
            kpi_count = unit_scores.aggregate(total=Sum('kpi_count'))['total'] or 0
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
        self.unit = UnitAggregator()  # Changed from team
        self.department = DepartmentAggregator()
        self.organization = OrganizationAggregator()
    
    def aggregate_for_user(self, user_id: str, year: int, month: int, force: bool = False) -> Decimal:
        return self.individual.aggregate_for_user(user_id, year, month, force)
    
    def aggregate_for_units(self, tenant_id: str, year: int, month: int, force: bool = False) -> Dict:
        """Aggregate for all units in the tenant."""
        units = Unit.objects.filter(tenant_id=tenant_id, is_active=True)
        results = {}
        for unit in units:
            member_ids = self._get_unit_member_ids(unit.id)
            score = self.unit.aggregate_for_unit(
                str(unit.id), unit.name, tenant_id, member_ids, year, month, force
            )
            results[str(unit.id)] = score
        return results
    
    def _get_unit_member_ids(self, unit_id: str) -> List[str]:
        """Get all member IDs for a unit."""
        from apps.structure.models import Employment
        employments = Employment.objects.filter(
            unit_id=unit_id,
            is_current=True,
            is_active=True,
            is_deleted=False
        )
        return [str(emp.user_id) for emp in employments]
    
    def aggregate_for_departments(self, tenant_id: str, year: int, month: int, force: bool = False) -> Dict:
        results = {}
        departments = Department.objects.filter(tenant_id=tenant_id, is_active=True)
        for dept in departments:
            unit_ids = self._get_department_unit_ids(dept.id)
            score = self.department.aggregate_for_department(
                str(dept.id), dept.name, tenant_id, unit_ids, year, month, force
            )
            results[str(dept.id)] = score
        return results
    
    def _get_department_unit_ids(self, department_id: str) -> List[str]:
        """Get all unit IDs for a department."""
        units = Unit.objects.filter(
            department_id=department_id,
            is_active=True,
            is_deleted=False
        )
        return [str(unit.id) for unit in units]
    
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
        direct_reports = ReportingLine.objects.filter(
            manager_id=user_id,
            is_active=True,
            is_deleted=False
        ).select_related('employee')
        reports_data = []
        for report in direct_reports:
            report_score = self.aggregate_for_user(report.employee_id, year, month)
            reports_data.append({
                'user_id': str(report.employee.id),
                'name': report.employee.get_full_name() if hasattr(report.employee, 'get_full_name') else str(report.employee.id),
                'score': report_score,
                'traffic_light': self._get_traffic_light(report_score)
            })
        return {
            'user_id': user_id,
            'user_score': user_score,
            'user_traffic_light': self._get_traffic_light(user_score),
            'direct_reports': reports_data,
            'team_count': len(reports_data),  # Keeping as team_count for compatibility
            'avg_team_score': sum(r['score'] for r in reports_data) / len(reports_data) if reports_data else 0
        }
    
    def get_full_org_hierarchy(self, tenant_id: str, year: int, month: int) -> Dict:
        # Get organization health
        org_score = self.aggregate_for_organization(tenant_id, year, month)
        # Get departments
        departments = Department.objects.filter(tenant_id=tenant_id, is_active=True)
        dept_data = []
        for dept in departments:
            unit_ids = self._get_department_unit_ids(dept.id)
            dept_score = self.department.aggregate_for_department(
                str(dept.id), dept.name, tenant_id, unit_ids, year, month
            )
            # Get units in department
            units = Unit.objects.filter(department=dept, is_active=True, is_deleted=False)
            unit_data = []
            for unit in units:
                member_ids = self._get_unit_member_ids(unit.id)
                unit_score = self.unit.aggregate_for_unit(
                    str(unit.id), unit.name, tenant_id, member_ids, year, month
                )
                unit_data.append({
                    'id': str(unit.id),
                    'name': unit.name,
                    'score': unit_score,
                    'traffic_light': self._get_traffic_light(unit_score)
                })
            dept_data.append({
                'id': str(dept.id),
                'name': dept.name,
                'score': dept_score,
                'traffic_light': self._get_traffic_light(dept_score),
                'units': unit_data  # Changed from teams
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