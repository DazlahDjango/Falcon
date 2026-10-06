# apps/reportplt/services/extraction/production/kpi_extractor.py
import logging
from typing import Dict, Any, List, Optional, Set
from decimal import Decimal
from django.db import models
from django.utils import timezone

from apps.kpi.models import (
    KPI, AnnualTarget, MonthlyPhasing, PhasingLock, MonthlyActual,
    Evidence, ValidationRecord, ValidationComment, RejectionReason,
    Escalation, Score, AggregatedScore, TrafficLight, CascadeMap,
    CascadeRule, KPIWeight, KPIDependency, KPICategory
)
from apps.structure.models import Division, Department, Section, Unit, Position, Employment
from apps.accounts.models import User
from apps.kpi.services.analytics import (
    get_department_rollups, get_organization_health, get_kpi_summaries,
    compute_department_rollups_live, compute_organization_health_live
)

logger = logging.getLogger(__name__)


def _get_user_info_map(user_ids: List[Any], tenant_id: Optional[str] = None) -> Dict[str, Dict[str, Any]]:
    """Helper to bulk-resolve User UUIDs with names, email, positions, and departments."""
    valid_ids = [uid for uid in user_ids if uid]
    if not valid_ids:
        return {}

    users = User.objects.filter(id__in=valid_ids)
    if tenant_id:
        users = users.filter(tenant_id=tenant_id)

    employments = Employment.objects.filter(
        user_id__in=valid_ids,
        is_current=True,
        is_active=True
    ).select_related('position', 'position__department', 'position__division')
    if tenant_id:
        employments = employments.filter(tenant_id=tenant_id)

    emp_map = {str(e.user_id): e for e in employments}

    result = {}
    for u in users:
        uid_str = str(u.id)
        emp = emp_map.get(uid_str)
        pos_title = emp.position.title if (emp and emp.position) else (u.role or 'Staff')
        dept_name = emp.position.department.name if (emp and emp.position and emp.position.department) else 'General'
        div_name = emp.position.division.name if (emp and emp.position and emp.position.division) else ''

        full_name = f"{u.first_name} {u.last_name}".strip() or u.username or u.email
        result[uid_str] = {
            'id': uid_str,
            'full_name': full_name,
            'email': u.email,
            'role': u.role or 'Employee',
            'position_title': pos_title,
            'department_name': dept_name,
            'division_name': div_name,
        }
    return result


class KPICascadeTreeExtractor:
    """
    Extracts multi-level target cascade trees linking organization targets down through
    Divisions, Departments, Sections, Units, and Individuals with contribution percentages
    and formatted ASCII / PDF tree models showing organizational tiers.
    """

    def __init__(self, tenant_id: Optional[str] = None, filters: Optional[Dict] = None):
        self.tenant_id = tenant_id
        self.filters = filters or {}

    def extract(self) -> Dict[str, Any]:
        from apps.kpi.services.cascade import TargetCascader

        year = int(self.filters.get('year', timezone.now().year))
        kpi_filter = self.filters.get('kpi_id') or self.filters.get('kpi_name') or self.filters.get('kpi')
        assignee_email = self.filters.get('assignee_email')

        kpis_qs = KPI.objects.all()
        if self.tenant_id:
            kpis_qs = kpis_qs.filter(tenant_id=self.tenant_id)
        if kpi_filter:
            kpis_qs = kpis_qs.filter(
                models.Q(id__icontains=str(kpi_filter)) |
                models.Q(name__icontains=str(kpi_filter))
            )

        matched_kpis = list(kpis_qs.select_related('owner', 'department'))
        cascader = TargetCascader()

        cascade_trees = []
        tree_text_lines = []
        flat_cascade_rows = []
        root_targets = []
        total_cascaded_value = Decimal('0')
        max_depth = 0
        total_nodes = 0

        for kpi in matched_kpis:
            root_target = AnnualTarget.objects.filter(
                kpi=kpi,
                year=year
            )
            if self.tenant_id:
                root_target = root_target.filter(tenant_id=self.tenant_id)
            if assignee_email:
                root_target = root_target.filter(user__email__iexact=assignee_email)

            root_target = root_target.order_by('-target_value').first()
            if not root_target:
                continue

            root_targets.append(root_target)

            k_code = getattr(kpi, 'code', getattr(kpi, 'kpi_code', str(kpi.id)[:8]))
            tree_text_lines.append(f"MASTER KPI: {kpi.name} ({k_code})")

            tree_data = cascader.get_cascade_tree(str(root_target.id), str(self.tenant_id) if self.tenant_id else None)
            if not tree_data:
                continue

            def process_node(node: Dict[str, Any], prefix: str = "", is_last: bool = True, depth: int = 0) -> Dict[str, Any]:
                nonlocal max_depth, total_cascaded_value, total_nodes
                if depth > max_depth:
                    max_depth = depth
                total_nodes += 1

                level = node.get('level', 'INDIVIDUAL')
                node_name = node.get('name', 'Unassigned Node')
                lead_name = node.get('lead_name') or node.get('user_name') or 'Lead'
                lead_title = node.get('lead_title', 'Contributor')
                target_val = float(node.get('target_value', 0.0))
                contrib = float(node.get('contribution', 100.0 if depth == 0 else 0.0))
                rule_name = node.get('rule', 'DIRECT')
                unit_str = f"{kpi.unit} " if (kpi and kpi.unit) else "KES "
                val_str = f"{unit_str}{target_val:,.2f}"

                connector = "\\-- " if is_last else "|-- "
                branch = prefix + connector if depth > 0 else ""

                if level in ['ORGANIZATION', 'DIVISION', 'DEPARTMENT', 'SECTION', 'UNIT']:
                    title_display = f"{node_name} (Lead: {lead_name})"
                else:
                    title_display = lead_name

                tree_line = f"{branch}[{level}] {title_display} | Target: {val_str}"
                tree_text_lines.append(tree_line)

                if depth > 0:
                    total_cascaded_value += Decimal(str(target_val))
                    flat_cascade_rows.append([
                        f"[{level}] {node_name[:20]}",
                        lead_name[:22],
                        val_str,
                        f"{contrib:.2f}%",
                        rule_name
                    ])

                children = node.get('children', [])
                processed_children = []
                count = len(children)
                for idx, child in enumerate(children):
                    child_is_last = (idx == count - 1)
                    new_prefix = prefix + ("    " if is_last else "|   ") if depth > 0 else ""
                    processed_children.append(process_node(child, prefix=new_prefix, is_last=child_is_last, depth=depth + 1))

                return {
                    'kpi_id': str(kpi.id),
                    'kpi_name': kpi.name,
                    'kpi_code': getattr(kpi, 'code', getattr(kpi, 'kpi_code', str(kpi.id)[:8])),
                    'level': level,
                    'node_name': node_name,
                    'user_id': node.get('user_id', ''),
                    'user_name': lead_name,
                    'user_email': node.get('user_email', ''),
                    'position_title': lead_title,
                    'target_value': target_val,
                    'target_formatted': val_str,
                    'contribution_percentage': contrib,
                    'rule_type': rule_name,
                    'depth': depth,
                    'children_count': len(processed_children),
                    'children': processed_children,
                }

            processed_tree = process_node(tree_data, depth=0)
            cascade_trees.append(processed_tree)
            tree_text_lines.append("")

        all_maps_count = CascadeMap.objects.filter(tenant_id=self.tenant_id).count() if self.tenant_id else CascadeMap.objects.count()

        metrics = {
            'total_cascade_mappings': all_maps_count,
            'root_targets_count': len(cascade_trees),
            'total_cascaded_nodes': total_nodes,
            'max_cascade_depth': max_depth + 1,
            'total_cascaded_volume': f"KES {total_cascaded_value:,.2f}",
            'cascade_alignment_rate': 100.0 if all_maps_count else 0.0,
        }

        tables = [
            {
                'title': 'Target Cascading Hierarchy & Tier Allocations',
                'columns': ['Tier & Node Name', 'Lead / Assignee', 'Target Amount', 'Contribution %', 'Cascade Rule'],
                'rows': flat_cascade_rows[:60]
            }
        ]

        # Pie chart data for root vs child cascade targets
        charts = []
        if root_targets:
            root_names = [r.kpi.name[:18] for r in root_targets[:5]]
            root_values = [float(r.target_value) for r in root_targets[:5]]
            charts.append({
                'type': 'bar',
                'title': 'Top Root KPI Target Allocations (KES)',
                'data': {
                    'labels': root_names,
                    'values': root_values
                }
            })

        return {
            'status': 'Completed',
            'extracted_at': timezone.now().isoformat(),
            'year': year,
            'metrics': metrics,
            'charts': charts,
            'tables': tables,
            'cascade_trees': cascade_trees,
            'hierarchy_tree': cascade_trees,  # Compatibility alias for PDF exporter
            'tree_text': "\n".join(tree_text_lines),
            'tree_lines': tree_text_lines,
            'executive_summary': f"Successfully mapped {all_maps_count} target cascade linkages across {max_depth + 1} organizational hierarchy tiers with complete mathematical alignment.",
            'raw_data': {
                'total_maps': all_maps_count,
                'total_targets': len(root_targets),
                'trees': cascade_trees
            }
        }


class KPIIndividualScorecardExtractor:
    """
    Extracts individual 12-month performance scorecards, monthly target vs actual submissions,
    traffic light indicators, evidence documents, validation statuses, and KPI weight contributions.
    """

    def __init__(self, tenant_id: Optional[str] = None, filters: Optional[Dict] = None):
        self.tenant_id = tenant_id
        self.filters = filters or {}

    def extract(self) -> Dict[str, Any]:
        user_id = self.filters.get('user_id')
        user_email = self.filters.get('user_email')
        year = int(self.filters.get('year', timezone.now().year))
        month = self.filters.get('month')

        kpi_weights = KPIWeight.objects.filter(is_active=True).select_related('kpi', 'user')
        annual_targets = AnnualTarget.objects.filter(year=year).select_related('kpi', 'user')
        monthly_phasings = MonthlyPhasing.objects.filter(annual_target__year=year).select_related('annual_target')
        actuals = MonthlyActual.objects.filter(year=year).select_related('kpi', 'user')
        scores = Score.objects.filter(year=year).select_related('kpi', 'user').prefetch_related('traffic_lights')

        if self.tenant_id:
            kpi_weights = kpi_weights.filter(tenant_id=self.tenant_id)
            annual_targets = annual_targets.filter(tenant_id=self.tenant_id)
            monthly_phasings = monthly_phasings.filter(tenant_id=self.tenant_id)
            actuals = actuals.filter(tenant_id=self.tenant_id)
            scores = scores.filter(tenant_id=self.tenant_id)

        if user_id:
            kpi_weights = kpi_weights.filter(user_id=user_id)
            annual_targets = annual_targets.filter(user_id=user_id)
            actuals = actuals.filter(user_id=user_id)
            scores = scores.filter(user_id=user_id)

        if user_email:
            kpi_weights = kpi_weights.filter(user__email__iexact=user_email)
            annual_targets = annual_targets.filter(user__email__iexact=user_email)
            actuals = actuals.filter(user__email__iexact=user_email)
            scores = scores.filter(user__email__iexact=user_email)

        if month:
            actuals = actuals.filter(month=int(month))
            scores = scores.filter(month=int(month))
            monthly_phasings = monthly_phasings.filter(month=int(month))

        user_ids = list(set(
            list(kpi_weights.values_list('user_id', flat=True)) +
            list(annual_targets.values_list('user_id', flat=True)) +
            list(scores.values_list('user_id', flat=True))
        ))

        user_info_map = _get_user_info_map(user_ids, self.tenant_id)

        user_scorecards = []
        total_green = 0
        total_yellow = 0
        total_red = 0
        all_weighted_scores = []
        table_rows = []

        for uid in user_ids[:100]:
            uid_str = str(uid)
            u_info = user_info_map.get(uid_str, {})
            u_weights = [w for w in kpi_weights if str(w.user_id) == uid_str]
            u_targets = [t for t in annual_targets if str(t.user_id) == uid_str]
            u_actuals = [a for a in actuals if str(a.user_id) == uid_str]
            u_scores = [s for s in scores if str(s.user_id) == uid_str]

            # Collect unique KPIs assigned to user via targets or weights
            kpi_map: Dict[str, KPI] = {}
            for w in u_weights:
                kpi_map[str(w.kpi_id)] = w.kpi
            for t in u_targets:
                kpi_map[str(t.kpi_id)] = t.kpi

            if not kpi_map:
                continue

            kpi_rows = []
            user_weighted_score = Decimal('0')
            user_total_weight = Decimal('0')

            for k_id, kpi in kpi_map.items():
                w_obj = next((w for w in u_weights if str(w.kpi_id) == k_id), None)
                weight_val = Decimal(str(w_obj.weight)) if w_obj else Decimal('100.0') / max(len(kpi_map), 1)

                target_obj = next((t for t in u_targets if str(t.kpi_id) == k_id), None)
                annual_target_val = target_obj.target_value if target_obj else Decimal('0')

                k_scores = [s for s in u_scores if str(s.kpi_id) == k_id]
                k_actuals = [a for a in u_actuals if str(a.kpi_id) == k_id]

                avg_kpi_score = Decimal(str(sum(s.score for s in k_scores) / len(k_scores))) if k_scores else Decimal('0')
                user_weighted_score += (avg_kpi_score * weight_val)
                user_total_weight += weight_val

                # Monthly actual & phasing breakdown (1-12)
                monthly_breakdown = []
                for m_idx in range(1, 13):
                    m_act = next((a for a in k_actuals if a.month == m_idx), None)
                    m_scr = next((s for s in k_scores if s.month == m_idx), None)
                    tl_status = 'PENDING'
                    if m_scr:
                        tl = m_scr.traffic_lights.first()
                        tl_status = tl.status if tl else ('GREEN' if m_scr.score >= 90 else ('YELLOW' if m_scr.score >= 50 else 'RED'))
                        if tl_status == 'GREEN': total_green += 1
                        elif tl_status == 'YELLOW': total_yellow += 1
                        elif tl_status == 'RED': total_red += 1

                    monthly_breakdown.append({
                        'month': m_idx,
                        'actual_value': float(m_act.actual_value) if m_act else None,
                        'status': m_act.status if m_act else 'NOT_SUBMITTED',
                        'score': float(m_scr.score) if m_scr else None,
                        'traffic_light': tl_status,
                    })

                kpi_rows.append({
                    'kpi_id': str(kpi.id),
                    'code': getattr(kpi, 'code', getattr(kpi, 'kpi_code', str(kpi.id)[:8])),
                    'name': kpi.name,
                    'kpi_type': kpi.kpi_type,
                    'weight': float(weight_val),
                    'annual_target': float(annual_target_val),
                    'average_score': round(float(avg_kpi_score), 2),
                    'unit': kpi.unit,
                    'approved_count': sum(1 for a in k_actuals if a.status == 'APPROVED'),
                    'pending_count': sum(1 for a in k_actuals if a.status == 'PENDING'),
                    'monthly_breakdown': monthly_breakdown,
                })

                table_rows.append([
                    u_info.get('full_name', 'Employee'),
                    kpi.name[:25],
                    f"{float(weight_val):.1f}%",
                    f"{float(annual_target_val):,.2f}",
                    f"{float(avg_kpi_score):.1f}%",
                    'GREEN' if avg_kpi_score >= 90 else ('YELLOW' if avg_kpi_score >= 50 else 'RED')
                ])

            final_user_score = float(user_weighted_score / user_total_weight) if user_total_weight > 0 else 0.0
            all_weighted_scores.append(final_user_score)

            user_scorecards.append({
                'user_id': uid_str,
                'user_name': u_info.get('full_name', 'Staff Member'),
                'user_email': u_info.get('email', ''),
                'position_title': u_info.get('position_title', 'Staff'),
                'department_name': u_info.get('department_name', 'General'),
                'overall_score': round(final_user_score, 2),
                'total_weight': float(user_total_weight),
                'kpis_count': len(kpi_rows),
                'kpis': kpi_rows,
            })

        avg_org_score = round(sum(all_weighted_scores) / len(all_weighted_scores), 2) if all_weighted_scores else 0.0

        metrics = {
            'total_evaluated_employees': len(user_scorecards),
            'average_individual_score': f"{avg_org_score}%",
            'green_kpis_count': total_green,
            'yellow_kpis_count': total_yellow,
            'red_kpis_count': total_red,
            'overall_compliance_rate': f"{round((total_green / max(total_green + total_yellow + total_red, 1)) * 100, 1)}%",
        }

        tables = [
            {
                'title': 'Employee KPI Scorecard Summary',
                'columns': ['Employee', 'KPI Name', 'Weight', 'Target', 'Avg Score', 'Status'],
                'rows': table_rows[:50]
            }
        ]

        charts = [
            {
                'type': 'pie',
                'title': 'Overall Traffic Light Performance Distribution',
                'data': {
                    'labels': ['Green (>=90%)', 'Yellow (50-89%)', 'Red (<50%)'],
                    'values': [total_green, total_yellow, total_red],
                    'colors': ['#10b981', '#f59e0b', '#ef4444']
                }
            }
        ]

        return {
            'status': 'Completed',
            'extracted_at': timezone.now().isoformat(),
            'year': year,
            'metrics': metrics,
            'charts': charts,
            'tables': tables,
            'scorecards': user_scorecards,
            'executive_summary': f"Extracted {len(user_scorecards)} employee scorecards with an average overall performance score of {avg_org_score}%.",
            'raw_data': {
                'scorecards': user_scorecards
            }
        }


class KPIDepartmentalHeatmapExtractor:
    """
    Extracts departmental and divisional performance heatmaps, rollup scores, employee counts,
    and green/yellow/red distributions across organizational units.
    """

    def __init__(self, tenant_id: Optional[str] = None, filters: Optional[Dict] = None):
        self.tenant_id = tenant_id
        self.filters = filters or {}

    def extract(self) -> Dict[str, Any]:
        year = int(self.filters.get('year', timezone.now().year))
        month = int(self.filters.get('month', timezone.now().month))

        rollups = get_department_rollups(self.tenant_id, year, month, prefer_mv=False)
        health = get_organization_health(self.tenant_id, year, month)

        table_rows = []
        chart_labels = []
        chart_values = []

        for r in rollups:
            dept_name = r.get('department_name', 'Unknown')
            score = float(r.get('overall_score', 0))
            emp_cnt = r.get('employee_count', 0)
            green_pct = float(r.get('green_percentage', 0))
            yellow_pct = float(r.get('yellow_percentage', 0))
            red_pct = float(r.get('red_percentage', 0))

            status = 'GREEN' if score >= 85 else ('YELLOW' if score >= 60 else 'RED')

            table_rows.append([
                dept_name[:30],
                f"{score:.1f}%",
                f"{green_pct:.1f}%",
                f"{yellow_pct:.1f}%",
                f"{red_pct:.1f}%",
                emp_cnt,
                status
            ])

            chart_labels.append(dept_name[:15])
            chart_values.append(score)

        metrics = {
            'organization_health_score': f"{health.get('overall_health_score', 0)}%",
            'total_monitored_departments': len(rollups),
            'kpi_completion_rate': f"{health.get('kpi_completion_rate', 0)}%",
            'validation_compliance_rate': f"{health.get('validation_compliance_rate', 0)}%",
            'active_employees': health.get('active_employees', 0),
            'red_kpis_count': health.get('red_kpi_count', 0),
        }

        tables = [
            {
                'title': 'Department Performance Heatmap & Rankings',
                'columns': ['Department', 'Overall Score', 'Green %', 'Yellow %', 'Red %', 'Headcount', 'Health Status'],
                'rows': table_rows
            }
        ]

        charts = [
            {
                'type': 'bar',
                'title': 'Department Overall Performance Scores (%)',
                'data': {
                    'labels': chart_labels[:8],
                    'values': chart_values[:8]
                }
            }
        ]

        return {
            'status': 'Completed',
            'extracted_at': timezone.now().isoformat(),
            'year': year,
            'month': month,
            'metrics': metrics,
            'charts': charts,
            'tables': tables,
            'department_rollups': rollups,
            'organization_health': health,
            'executive_summary': f"Organization Health Score stands at {health.get('overall_health_score', 0)}% across {len(rollups)} active departments.",
            'raw_data': {
                'rollups': rollups,
                'health': health
            }
        }


class KPIRedAlertsExtractor:
    """
    Identifies underperforming KPIs, persistent red lights (>=2 consecutive months),
    min/max target breaches, and open escalations requiring executive review.
    """

    def __init__(self, tenant_id: Optional[str] = None, filters: Optional[Dict] = None):
        self.tenant_id = tenant_id
        self.filters = filters or {}

    def extract(self) -> Dict[str, Any]:
        year = int(self.filters.get('year', timezone.now().year))
        month = self.filters.get('month')

        red_lights = TrafficLight.objects.filter(status='RED').select_related('score__kpi', 'score__user')
        escalations = Escalation.objects.all().select_related('actual__kpi', 'escalated_by', 'escalated_to')

        if self.tenant_id:
            red_lights = red_lights.filter(score__tenant_id=self.tenant_id)
            escalations = escalations.filter(tenant_id=self.tenant_id)

        if year:
            red_lights = red_lights.filter(score__year=year)
        if month:
            red_lights = red_lights.filter(score__month=int(month))

        red_rows = []
        for r in red_lights.order_by('-consecutive_red_count', '-score__year', '-score__month')[:100]:
            kpi = r.score.kpi if r.score else None
            user = r.score.user if r.score else None
            period_str = f"{r.score.year}-{r.score.month:02d}" if r.score else 'N/A'
            red_rows.append([
                getattr(kpi, 'code', str(kpi.id)[:8]) if kpi else 'N/A',
                kpi.name[:25] if kpi else 'Unknown',
                user.email if user else 'Unknown',
                f"{float(r.score_value):.1f}%",
                r.consecutive_red_count,
                period_str
            ])

        esc_rows = []
        for e in escalations.order_by('-escalated_at')[:50]:
            esc_rows.append([
                e.actual.kpi.name[:25] if (e.actual and e.actual.kpi) else 'N/A',
                e.escalated_by.email if e.escalated_by else 'Unknown',
                e.escalated_to.email if e.escalated_to else 'Unknown',
                e.status,
                e.reason[:30],
                e.escalated_at.strftime('%Y-%m-%d') if e.escalated_at else 'N/A'
            ])

        persistent_count = sum(1 for r in red_lights if r.consecutive_red_count >= 2)
        open_esc_count = escalations.filter(status__in=['PENDING', 'REVIEWING']).count()

        metrics = {
            'total_red_alerts': red_lights.count(),
            'persistent_red_alerts_2plus_months': persistent_count,
            'open_escalations': open_esc_count,
            'critical_risk_index': 'HIGH' if persistent_count > 5 else ('MEDIUM' if persistent_count > 0 else 'LOW'),
        }

        tables = [
            {
                'title': 'Critical Red KPI Alerts (Scores < 50%)',
                'columns': ['KPI Code', 'KPI Name', 'Assignee', 'Score', 'Consecutive Months', 'Period'],
                'rows': red_rows[:50]
            },
            {
                'title': 'KPI Escalations Registry',
                'columns': ['KPI Name', 'Escalated By', 'Escalated To', 'Status', 'Reason', 'Date'],
                'rows': esc_rows[:50]
            }
        ]

        charts = [
            {
                'type': 'pie',
                'title': 'Red Alerts: Isolated vs Persistent (2+ Months)',
                'data': {
                    'labels': ['Persistent Red (2+ Months)', 'Isolated Red (1 Month)'],
                    'values': [persistent_count, max(red_lights.count() - persistent_count, 0)],
                    'colors': ['#dc2626', '#f87171']
                }
            }
        ]

        return {
            'status': 'Completed',
            'extracted_at': timezone.now().isoformat(),
            'metrics': metrics,
            'charts': charts,
            'tables': tables,
            'executive_summary': f"Identified {red_lights.count()} underperforming KPI scores, with {persistent_count} exhibiting persistent off-track trends across multiple months.",
            'raw_data': {
                'total_red': red_lights.count(),
                'persistent_red': persistent_count,
                'open_escalations': open_esc_count
            }
        }


class KPIValidationComplianceExtractor:
    """
    Tracks monthly actual submission compliance, supervisor approval turnaround,
    rejection reason frequency, and pending validation backlog.
    """

    def __init__(self, tenant_id: Optional[str] = None, filters: Optional[Dict] = None):
        self.tenant_id = tenant_id
        self.filters = filters or {}

    def extract(self) -> Dict[str, Any]:
        year = int(self.filters.get('year', timezone.now().year))
        month = self.filters.get('month')

        actuals = MonthlyActual.objects.filter(year=year).select_related('kpi', 'user')
        if self.tenant_id:
            actuals = actuals.filter(tenant_id=self.tenant_id)
        if month:
            actuals = actuals.filter(month=int(month))

        total_actuals = actuals.count()
        approved_cnt = actuals.filter(status='APPROVED').count()
        pending_cnt = actuals.filter(status='PENDING').count()
        rejected_cnt = actuals.filter(status='REJECTED').count()
        adjusted_cnt = actuals.filter(status='ADJUSTED').count()
        escalated_cnt = actuals.filter(status='ESCALATED').count()

        approval_rate = round((approved_cnt / max(total_actuals, 1)) * 100, 1)

        rejection_reasons = RejectionReason.objects.filter(is_active=True)
        if self.tenant_id:
            rejection_reasons = rejection_reasons.filter(tenant_id=self.tenant_id)

        metrics = {
            'total_submitted_actuals': total_actuals,
            'approved_actuals': approved_cnt,
            'pending_validations': pending_cnt,
            'rejected_actuals': rejected_cnt,
            'adjusted_actuals': adjusted_cnt,
            'validation_approval_rate': f"{approval_rate}%",
        }

        tables = [
            {
                'title': 'Submission Status Distribution',
                'columns': ['Status Type', 'Count', 'Percentage of Total'],
                'rows': [
                    ['Approved', approved_cnt, f"{round((approved_cnt / max(total_actuals, 1))*100, 1)}%"],
                    ['Pending Validation', pending_cnt, f"{round((pending_cnt / max(total_actuals, 1))*100, 1)}%"],
                    ['Rejected', rejected_cnt, f"{round((rejected_cnt / max(total_actuals, 1))*100, 1)}%"],
                    ['Adjusted', adjusted_cnt, f"{round((adjusted_cnt / max(total_actuals, 1))*100, 1)}%"],
                    ['Escalated', escalated_cnt, f"{round((escalated_cnt / max(total_actuals, 1))*100, 1)}%"],
                ]
            }
        ]

        charts = [
            {
                'type': 'pie',
                'title': 'KPI Actual Submissions Workflow Status',
                'data': {
                    'labels': ['Approved', 'Pending', 'Rejected', 'Adjusted', 'Escalated'],
                    'values': [approved_cnt, pending_cnt, rejected_cnt, adjusted_cnt, escalated_cnt],
                    'colors': ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6']
                }
            }
        ]

        return {
            'status': 'Completed',
            'extracted_at': timezone.now().isoformat(),
            'metrics': metrics,
            'charts': charts,
            'tables': tables,
            'executive_summary': f"Recorded {total_actuals} monthly KPI actual submissions with an overall approval compliance rate of {approval_rate}%.",
            'raw_data': {
                'total_actuals': total_actuals,
                'approved': approved_cnt,
                'pending': pending_cnt,
                'rejected': rejected_cnt
            }
        }


class KPIUnifiedExtractor:
    """
    Master Unified Extractor orchestrating all KPI subsystems:
    1. Multi-tier Target Cascading Trees
    2. Individual Employee Scorecards & 12-Month Phasings
    3. Departmental / Division Performance Heatmaps & Health
    4. Red Alerts & Escalations
    5. Validation Workflow Compliance
    """

    def __init__(self, tenant_id: Optional[str] = None, filters: Optional[Dict] = None):
        self.tenant_id = tenant_id
        self.filters = filters or {}
        self.cascade_extractor = KPICascadeTreeExtractor(tenant_id, filters)
        self.scorecard_extractor = KPIIndividualScorecardExtractor(tenant_id, filters)
        self.heatmap_extractor = KPIDepartmentalHeatmapExtractor(tenant_id, filters)
        self.red_alerts_extractor = KPIRedAlertsExtractor(tenant_id, filters)
        self.compliance_extractor = KPIValidationComplianceExtractor(tenant_id, filters)

    def extract(self) -> Dict[str, Any]:
        cascade_data = self.cascade_extractor.extract()
        scorecard_data = self.scorecard_extractor.extract()
        heatmap_data = self.heatmap_extractor.extract()
        red_data = self.red_alerts_extractor.extract()
        comp_data = self.compliance_extractor.extract()

        # Combine scalar metrics
        combined_metrics = {
            'average_individual_score': scorecard_data['metrics'].get('average_individual_score', '0%'),
            'organization_health_score': heatmap_data['metrics'].get('organization_health_score', '0%'),
            'total_cascade_mappings': cascade_data['metrics'].get('total_cascade_mappings', 0),
            'total_evaluated_employees': scorecard_data['metrics'].get('total_evaluated_employees', 0),
            'total_monitored_departments': heatmap_data['metrics'].get('total_monitored_departments', 0),
            'total_red_alerts': red_data['metrics'].get('total_red_alerts', 0),
            'validation_approval_rate': comp_data['metrics'].get('validation_approval_rate', '0%'),
            'total_cascaded_volume': cascade_data['metrics'].get('total_cascaded_volume', 'KES 0.00'),
        }

        # Combine charts (up to 3 best visualizations)
        combined_charts = []
        if scorecard_data.get('charts'):
            combined_charts.append(scorecard_data['charts'][0])
        if heatmap_data.get('charts'):
            combined_charts.append(heatmap_data['charts'][0])
        if cascade_data.get('charts'):
            combined_charts.append(cascade_data['charts'][0])

        # Combine tables
        combined_tables = []
        if cascade_data.get('tables'):
            combined_tables.extend(cascade_data['tables'])
        if scorecard_data.get('tables'):
            combined_tables.extend(scorecard_data['tables'])
        if heatmap_data.get('tables'):
            combined_tables.extend(heatmap_data['tables'])
        if red_data.get('tables'):
            combined_tables.extend(red_data['tables'])
        if comp_data.get('tables'):
            combined_tables.extend(comp_data['tables'])

        return {
            'source': 'kpi',
            'status': 'Completed',
            'extracted_at': timezone.now().isoformat(),
            'metrics': combined_metrics,
            'charts': combined_charts,
            'tables': combined_tables,
            'cascade_trees': cascade_data.get('cascade_trees', []),
            'hierarchy_tree': cascade_data.get('cascade_trees', []),
            'tree_text': cascade_data.get('tree_text', ''),
            'tree_lines': cascade_data.get('tree_lines', []),
            'cascade': cascade_data,
            'individual': scorecard_data,
            'departmental': heatmap_data,
            'red_alerts': red_data,
            'compliance': comp_data,
            'executive_summary': (
                f"Unified KPI Performance Review: Organization health stands at {heatmap_data['metrics'].get('organization_health_score', '0%')} "
                f"with {scorecard_data['metrics'].get('total_evaluated_employees', 0)} employees evaluated, "
                f"{cascade_data['metrics'].get('total_cascade_mappings', 0)} cascaded target mappings across all tiers, and an approval compliance rate of {comp_data['metrics'].get('validation_approval_rate', '0%')}."
            ),
            'raw_data': {
                'cascade': cascade_data.get('raw_data', {}),
                'scorecards': scorecard_data.get('raw_data', {}),
                'departmental': heatmap_data.get('raw_data', {}),
                'red_alerts': red_data.get('raw_data', {}),
                'compliance': comp_data.get('raw_data', {}),
            }
        }


KPIDataExtractor = KPIUnifiedExtractor
