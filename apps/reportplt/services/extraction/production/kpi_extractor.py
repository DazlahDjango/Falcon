# apps/reportplt/services/extraction/production/kpi_extractor.py
import logging
from typing import Dict, Any, List, Optional
from decimal import Decimal
from django.db import models
from django.utils import timezone
from apps.kpi.models import (
    KPI, AnnualTarget, MonthlyPhasing, MonthlyActual, Evidence,
    ValidationRecord, RejectionReason, Escalation, Score, TrafficLight,
    CascadeMap, CascadeRule, KPIWeight
)
from apps.structure.models import Department
from apps.accounts.models import User

logger = logging.getLogger(__name__)


class KPIIndividualScorecardExtractor:
    """Extracts individual 12-month performance scorecards, targets vs actuals, evidence documents, and validation statuses."""

    def __init__(self, tenant_id: Optional[str] = None, filters: Optional[Dict] = None):
        self.tenant_id = tenant_id
        self.filters = filters or {}

    def extract(self) -> Dict[str, Any]:
        user_id = self.filters.get('user_id')
        year = int(self.filters.get('year', timezone.now().year))
        month = self.filters.get('month')
        period_type = self.filters.get('period_type', 'annual')

        kpi_weights = KPIWeight.objects.filter(is_active=True)
        actuals = MonthlyActual.objects.filter(year=year)
        scores = Score.objects.filter(year=year)

        if self.tenant_id:
            kpi_weights = kpi_weights.filter(tenant_id=self.tenant_id)
            actuals = actuals.filter(tenant_id=self.tenant_id)
            scores = scores.filter(tenant_id=self.tenant_id)

        if user_id:
            kpi_weights = kpi_weights.filter(user_id=user_id)
            actuals = actuals.filter(user_id=user_id)
            scores = scores.filter(user_id=user_id)

        if month:
            actuals = actuals.filter(month=int(month))
            scores = scores.filter(month=int(month))

        user_scorecards = []
        user_ids = list(kpi_weights.values_list('user_id', flat=True).distinct())

        for uid in user_ids[:100]:
            u_weights = kpi_weights.filter(user_id=uid).select_related('kpi', 'user')
            u_actuals = actuals.filter(user_id=uid)
            u_scores = scores.filter(user_id=uid).select_related('kpi')

            if not u_weights.exists():
                continue

            user_obj = u_weights.first().user
            user_name = user_obj.get_full_name() if user_obj else 'Unknown User'
            user_email = user_obj.email if user_obj else ''

            kpi_rows = []
            total_weighted_score = Decimal('0')
            total_weight = Decimal('0')

            for w in u_weights:
                kpi = w.kpi
                w_val = w.weight
                k_scores = u_scores.filter(kpi=kpi)
                avg_score = k_scores.aggregate(avg=models.Avg('score'))['avg'] or Decimal('0')

                total_weighted_score += (avg_score * w_val)
                total_weight += w_val

                # Fetch evidence attached to actuals
                k_actuals = u_actuals.filter(kpi=kpi)
                evidence_count = Evidence.objects.filter(actual__in=k_actuals).count()

                kpi_rows.append({
                    'kpi_id': str(kpi.id),
                    'code': kpi.code,
                    'name': kpi.name,
                    'kpi_type': kpi.kpi_type,
                    'weight': float(w_val),
                    'score': float(avg_score),
                    'unit': kpi.unit,
                    'approved_actuals_count': k_actuals.filter(status='APPROVED').count(),
                    'pending_actuals_count': k_actuals.filter(status='PENDING').count(),
                    'evidence_count': evidence_count,
                })

            overall_score = float(total_weighted_score / total_weight) if total_weight > 0 else 0.0

            user_scorecards.append({
                'user_id': str(uid),
                'user_name': user_name,
                'user_email': user_email,
                'overall_score': round(overall_score, 2),
                'total_weight': float(total_weight),
                'kpis': kpi_rows,
            })

        return {
            'summary': {
                'year': year,
                'period_type': period_type,
                'total_users': len(user_scorecards),
                'average_organization_score': round(sum(u['overall_score'] for u in user_scorecards) / len(user_scorecards), 2) if user_scorecards else 0.0,
            },
            'scorecards': user_scorecards,
        }


class KPIDepartmentalHeatmapExtractor:
    """Extracts departmental and unit performance rollups, average team scores, and traffic light distribution."""

    def __init__(self, tenant_id: Optional[str] = None, filters: Optional[Dict] = None):
        self.tenant_id = tenant_id
        self.filters = filters or {}

    def extract(self) -> Dict[str, Any]:
        year = int(self.filters.get('year', timezone.now().year))
        month = self.filters.get('month')

        departments = Department.objects.filter(is_active=True)
        scores = Score.objects.filter(year=year)

        if self.tenant_id:
            scores = scores.filter(tenant_id=self.tenant_id)

        if month:
            scores = scores.filter(month=int(month))

        dept_list = []

        for dept in departments[:100]:
            # Get KPIs belonging to this department
            dept_kpi_ids = KPI.objects.filter(department=dept, is_active=True).values_list('id', flat=True)
            dept_scores = scores.filter(kpi_id__in=dept_kpi_ids)

            total_scores = dept_scores.count()
            avg_score = dept_scores.aggregate(avg=models.Avg('score'))['avg'] or Decimal('0')

            green_count = dept_scores.filter(score__gte=90).count()
            yellow_count = dept_scores.filter(score__gte=50, score__lt=90).count()
            red_count = dept_scores.filter(score__lt=50).count()

            dept_list.append({
                'department_id': str(dept.id),
                'department_name': dept.name,
                'department_code': dept.code,
                'kpi_count': len(dept_kpi_ids),
                'average_score': round(float(avg_score), 2),
                'green_count': green_count,
                'yellow_count': yellow_count,
                'red_count': red_count,
                'total_monitored_scores': total_scores,
                'health_status': 'GREEN' if avg_score >= 90 else ('YELLOW' if avg_score >= 50 else 'RED'),
            })

        return {
            'summary': {
                'year': year,
                'total_departments': len(dept_list),
                'overall_average_score': round(sum(d['average_score'] for d in dept_list) / len(dept_list), 2) if dept_list else 0.0,
            },
            'departments': dept_list,
        }


class KPICascadeTreeExtractor:
    """Extracts target cascading trees linking parent targets to child targets with contribution percentages."""

    def __init__(self, tenant_id: Optional[str] = None, filters: Optional[Dict] = None):
        self.tenant_id = tenant_id
        self.filters = filters or {}

    def extract(self) -> Dict[str, Any]:
        maps = CascadeMap.objects.all().select_related(
            'parent_target', 'child_target', 'cascade_rule',
            'organization_target', 'department_target', 'individual_target'
        )

        if self.tenant_id:
            maps = maps.filter(tenant_id=self.tenant_id)

        total_cascades = maps.count()
        cascade_list = []

        for m in maps.order_by('-created_at')[:200]:
            cascade_list.append({
                'id': str(m.id),
                'parent_target_id': str(m.parent_target_id) if m.parent_target_id else (str(m.organization_target_id) if m.organization_target_id else 'Org Target'),
                'child_target_id': str(m.child_target_id) if m.child_target_id else (str(m.individual_target_id) if m.individual_target_id else 'Individual Target'),
                'cascade_rule': m.cascade_rule.name if m.cascade_rule else 'Default Rule',
                'contribution_percentage': float(m.contribution_percentage),
            })

        return {
            'summary': {
                'total_cascade_mappings': total_cascades,
            },
            'cascades': cascade_list,
        }


class KPIRedAlertsExtractor:
    """Identifies underperforming KPIs (score < 50%), consecutive red alert counts, and open escalations."""

    def __init__(self, tenant_id: Optional[str] = None, filters: Optional[Dict] = None):
        self.tenant_id = tenant_id
        self.filters = filters or {}

    def extract(self) -> Dict[str, Any]:
        year = int(self.filters.get('year', timezone.now().year))
        red_lights = TrafficLight.objects.filter(status='RED').select_related('score__kpi', 'score__user')
        escalations = Escalation.objects.filter(status__in=['PENDING', 'REVIEWING']).select_related('actual__kpi', 'escalated_by', 'escalated_to')

        if self.tenant_id:
            red_lights = red_lights.filter(tenant_id=self.tenant_id)
            escalations = escalations.filter(tenant_id=self.tenant_id)

        red_list = []
        for r in red_lights.order_by('-score__year', '-score__month')[:100]:
            kpi = r.score.kpi if r.score else None
            user = r.score.user if r.score else None
            red_list.append({
                'id': str(r.id),
                'kpi_code': kpi.code if kpi else 'N/A',
                'kpi_name': kpi.name if kpi else 'Unknown KPI',
                'user_name': user.get_full_name() if user else 'Unknown',
                'score_value': float(r.score_value),
                'consecutive_red_count': r.consecutive_red_count,
                'period': f"{r.score.year}-{r.score.month:02d}" if r.score else 'N/A',
            })

        escalation_list = []
        for e in escalations.order_by('-escalated_at')[:100]:
            escalation_list.append({
                'id': str(e.id),
                'kpi_name': e.actual.kpi.name if e.actual and e.actual.kpi else 'Unknown',
                'escalated_by': e.escalated_by.get_full_name() if e.escalated_by else 'Unknown',
                'escalated_to': e.escalated_to.get_full_name() if e.escalated_to else 'Unknown',
                'reason': e.reason,
                'status': e.status,
                'escalated_at': e.escalated_at.isoformat() if e.escalated_at else None,
            })

        return {
            'summary': {
                'total_red_alerts': len(red_list),
                'persistent_red_alerts': sum(1 for r in red_list if r['consecutive_red_count'] >= 2),
                'open_escalations': len(escalation_list),
            },
            'red_alerts': red_list,
            'escalations': escalation_list,
        }


class KPIValidationComplianceExtractor:
    """Tracks submission compliance, supervisor approval turnaround, rejection reasons, and pending queues."""

    def __init__(self, tenant_id: Optional[str] = None, filters: Optional[Dict] = None):
        self.tenant_id = tenant_id
        self.filters = filters or {}

    def extract(self) -> Dict[str, Any]:
        year = int(self.filters.get('year', timezone.now().year))
        actuals = MonthlyActual.objects.filter(year=year)
        validations = ValidationRecord.objects.all()
        rejection_reasons = RejectionReason.objects.filter(is_active=True)

        if self.tenant_id:
            actuals = actuals.filter(tenant_id=self.tenant_id)
            validations = validations.filter(tenant_id=self.tenant_id)
            rejection_reasons = rejection_reasons.filter(tenant_id=self.tenant_id)

        total_actuals = actuals.count()
        approved_actuals = actuals.filter(status='APPROVED').count()
        pending_actuals = actuals.filter(status='PENDING').count()
        rejected_actuals = actuals.filter(status='REJECTED').count()
        adjusted_actuals = actuals.filter(status='ADJUSTED').count()

        approval_rate = round((approved_actuals / total_actuals * 100), 2) if total_actuals > 0 else 0.0

        reason_summary = {}
        for r in rejection_reasons:
            reason_summary[r.reason] = {
                'category': r.get_category_display(),
                'description': r.description,
            }

        return {
            'summary': {
                'year': year,
                'total_submitted_actuals': total_actuals,
                'approved_actuals': approved_actuals,
                'pending_actuals': pending_actuals,
                'rejected_actuals': rejected_actuals,
                'adjusted_actuals': adjusted_actuals,
                'approval_rate': approval_rate,
            },
            'rejection_reasons': reason_summary,
        }


class KPIUnifiedExtractor:
    """Master Unified Extractor orchestrating real-data KPI extractions across individual, unit, and organization levels."""

    def __init__(self, tenant_id: Optional[str] = None, filters: Optional[Dict] = None):
        self.tenant_id = tenant_id
        self.filters = filters or {}
        self.individual_extractor = KPIIndividualScorecardExtractor(tenant_id, filters)
        self.heatmap_extractor = KPIDepartmentalHeatmapExtractor(tenant_id, filters)
        self.cascade_extractor = KPICascadeTreeExtractor(tenant_id, filters)
        self.red_alerts_extractor = KPIRedAlertsExtractor(tenant_id, filters)
        self.compliance_extractor = KPIValidationComplianceExtractor(tenant_id, filters)

    def extract(self) -> Dict[str, Any]:
        indiv_data = self.individual_extractor.extract()
        heatmap_data = self.heatmap_extractor.extract()
        cascade_data = self.cascade_extractor.extract()
        red_data = self.red_alerts_extractor.extract()
        comp_data = self.compliance_extractor.extract()

        return {
            'source': 'kpi',
            'extracted_at': timezone.now().isoformat(),
            'individual': indiv_data,
            'departmental': heatmap_data,
            'cascade': cascade_data,
            'red_alerts': red_data,
            'compliance': comp_data,
            'summary': {
                'average_organization_score': indiv_data['summary']['average_organization_score'],
                'total_departments': heatmap_data['summary']['total_departments'],
                'total_cascade_mappings': cascade_data['summary']['total_cascade_mappings'],
                'total_red_alerts': red_data['summary']['total_red_alerts'],
                'approval_rate': comp_data['summary']['approval_rate'],
            }
        }


KPIDataExtractor = KPIUnifiedExtractor
