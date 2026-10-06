# apps/reportplt/services/generation/pivot_builder.py
from typing import Dict, Any, List, Optional
from collections import defaultdict
from datetime import datetime


class PivotBuilder:
    def __init__(self, config: Optional[Dict] = None):
        self.config = config or {}

    # ------------------------------------------------------------------
    # Entry point
    # ------------------------------------------------------------------

    def build_pivots(self, data: Dict, pivot_config: Optional[Dict] = None) -> List[Dict]:
        pivots: List[Dict] = []
        config = pivot_config or self.config

        # Identify reviews payloads so we don't also run the KPI branch on
        # the synthetic kpis list some reviews extractors may include.
        is_reviews = (
            data.get('source') == 'reviews'
            or any(k in data for k in (
                'individual_summary',
                'cycle_compliance',
                'organization_performance',
                'calibration_impact',
                'pip_tracker',
            ))
        )

        # 1. Accounts Domain Tables
        if 'users' in data and data['users']:
            rows = []
            for u in data['users']:
                status = "Active" if u.get('is_active') else "Suspended"
                mfa = "Enabled" if u.get('mfa_enabled') else "Disabled"
                last_login = (u.get('last_login') or '')[:16].replace('T', ' ') if u.get('last_login') else 'Never'
                rows.append([
                    u.get('full_name') or '',
                    u.get('email') or '',
                    (u.get('role') or '').replace('_', ' ').title(),
                    u.get('department') or 'General',
                    status,
                    mfa,
                    last_login
                ])
            pivots.append({
                'title': 'User Directory Roster',
                'type': 'table',
                'columns': ['Full Name', 'Email', 'Role', 'Department', 'Status', 'MFA', 'Last Login'],
                'rows': rows
            })

        if 'role_mfa_breakdown' in data and data['role_mfa_breakdown']:
            rows = []
            for r in data['role_mfa_breakdown']:
                rows.append([
                    (r.get('role') or '').replace('_', ' ').title(),
                    str(r.get('total', 0)),
                    str(r.get('mfa_on', 0)),
                    f"{r.get('mfa_adoption_pct', 0.0)}%"
                ])
            pivots.append({
                'title': 'Role MFA Compliance Breakdown',
                'type': 'table',
                'columns': ['Role Name', 'Total Users', 'MFA Active', 'Adoption Rate'],
                'rows': rows
            })

        if 'at_risk_users' in data and data['at_risk_users']:
            rows = []
            for u in data['at_risk_users'][:20]:
                rows.append([
                    u.get('full_name') or '',
                    u.get('email') or '',
                    (u.get('role') or '').replace('_', ' ').title()
                ])
            pivots.append({
                'title': 'At-Risk Users (MFA Required but Inactive)',
                'type': 'table',
                'columns': ['Full Name', 'Email', 'Role'],
                'rows': rows
            })

        if 'recent_attempts' in data and data['recent_attempts']:
            rows = []
            for a in data['recent_attempts'][:25]:
                ts = (a.get('timestamp') or '')[:16].replace('T', ' ')
                rows.append([
                    a.get('identifier') or '',
                    ts,
                    a.get('ip_address') or '',
                    (a.get('result') or '').title(),
                    (a.get('failure_reason') or '').replace('_', ' ').title() or 'N/A'
                ])
            pivots.append({
                'title': 'Recent Login Security Attempts',
                'type': 'table',
                'columns': ['Identifier', 'Timestamp', 'IP Address', 'Result', 'Failure Reason'],
                'rows': rows
            })

        if 'recent_entries' in data and data['recent_entries']:
            rows = []
            for e in data['recent_entries'][:25]:
                ts = (e.get('timestamp') or '')[:16].replace('T', ' ')
                rows.append([
                    ts,
                    e.get('actor') or 'System',
                    e.get('action') or '',
                    (e.get('action_type') or '').title(),
                    (e.get('severity') or '').upper(),
                    e.get('ip_address') or ''
                ])
            pivots.append({
                'title': 'Recent Accounts & Security Audit Trail',
                'type': 'table',
                'columns': ['Timestamp', 'Actor', 'Action', 'Type', 'Severity', 'IP Address'],
                'rows': rows
            })

        if 'roles' in data and data['roles']:
            rows = []
            for r in data['roles'][:25]:
                rows.append([
                    r.get('code') or '',
                    r.get('name') or '',
                    "Yes" if r.get('is_system') else "No",
                    "Yes" if r.get('is_assignable') else "No",
                    str(r.get('permission_count', 0))
                ])
            pivots.append({
                'title': 'Role & Permission Coverage Matrix',
                'type': 'table',
                'columns': ['Role Code', 'Role Name', 'System Role', 'Assignable', 'Permissions'],
                'rows': rows
            })

        if 'recent_sessions' in data and data['recent_sessions']:
            rows = []
            for s in data['recent_sessions'][:25]:
                login_t = (s.get('login_time') or '')[:16].replace('T', ' ')
                rows.append([
                    s.get('user_email') or '',
                    s.get('ip_address') or '',
                    s.get('device_type') or 'Desktop',
                    s.get('browser') or '',
                    s.get('os') or '',
                    "Yes" if s.get('mfa_verified') else "No",
                    login_t
                ])
            pivots.append({
                'title': 'Active User Sessions Activity',
                'type': 'table',
                'columns': ['User Email', 'IP Address', 'Device', 'Browser', 'OS', 'MFA Verified', 'Login Time'],
                'rows': rows
            })

        if 'overdue_users' in data and data['overdue_users']:
            rows = []
            for u in data['overdue_users'][:25]:
                last_ch = (u.get('password_last_changed') or '')[:10] if u.get('password_last_changed') else 'Never'
                days = str(u.get('days_since_change')) if u.get('days_since_change') is not None else 'N/A'
                rows.append([
                    u.get('full_name') or '',
                    u.get('email') or '',
                    (u.get('role') or '').replace('_', ' ').title(),
                    last_ch,
                    days,
                    "Yes" if u.get('change_required') else "No"
                ])
            pivots.append({
                'title': 'Overdue Password Hygiene Accounts',
                'type': 'table',
                'columns': ['Full Name', 'Email', 'Role', 'Last Changed', 'Days Stale', 'Forced Reset'],
                'rows': rows
            })

        if 'critical_events' in data and data['critical_events']:
            rows = []
            for e in data['critical_events']:
                ts = (e.get('timestamp') or '')[:16].replace('T', ' ')
                rows.append([
                    ts,
                    e.get('actor') or 'System',
                    e.get('action') or '',
                    (e.get('severity') or '').upper(),
                    e.get('ip_address') or ''
                ])
            pivots.append({
                'title': 'Security Anomalies & Critical Threat Events',
                'type': 'table',
                'columns': ['Timestamp', 'Actor', 'Action', 'Severity', 'IP Address'],
                'rows': rows
            })

        # 2. Structure Domain Tables
        if 'divisions' in data and data['divisions']:
            rows = []
            for div in data['divisions']:
                rows.append([
                    div.get('code') or '',
                    div.get('name') or '',
                    div.get('director') or 'Not Assigned',
                    str(div.get('departments_count', 0)),
                    str(div.get('employee_count', 0))
                ])
            pivots.append({
                'title': 'Divisions & Leadership Rollup',
                'type': 'table',
                'columns': ['Division Code', 'Division Name', 'Division Director', 'Departments', 'Headcount'],
                'rows': rows
            })

        if 'departments' in data and data['departments']:
            rows = []
            for d in data['departments']:
                rows.append([
                    d.get('code') or '',
                    d.get('name') or '',
                    d.get('division_code') or 'N/A',
                    d.get('manager') or 'Not Assigned',
                    (d.get('sensitivity_level') or 'Internal').title(),
                    str(d.get('sections_count', 0)),
                    str(d.get('employee_count', 0))
                ])
            pivots.append({
                'title': 'Department Hierarchy & Headcount Roster',
                'type': 'table',
                'columns': ['Dept Code', 'Department Name', 'Division', 'Manager', 'Sensitivity', 'Sections', 'Headcount'],
                'rows': rows
            })

        if 'sections' in data and data['sections']:
            rows = []
            for s in data['sections']:
                rows.append([
                    s.get('code') or '',
                    s.get('name') or '',
                    s.get('department_code') or 'N/A',
                    s.get('section_lead') or 'Not Assigned',
                    str(s.get('units_count', 0)),
                    str(s.get('employee_count', 0))
                ])
            pivots.append({
                'title': 'Operational Sections & Leads',
                'type': 'table',
                'columns': ['Section Code', 'Section Name', 'Department', 'Section Lead', 'Units', 'Headcount'],
                'rows': rows
            })

        if 'units' in data and data['units']:
            rows = []
            for u in data['units']:
                rows.append([
                    u.get('code') or '',
                    u.get('name') or '',
                    u.get('section_code') or 'N/A',
                    u.get('unit_lead') or 'Not Assigned',
                    str(u.get('employee_count', 0))
                ])
            pivots.append({
                'title': 'Functional Units & Teams',
                'type': 'table',
                'columns': ['Unit Code', 'Unit Name', 'Section', 'Unit Lead', 'Headcount'],
                'rows': rows
            })

        if 'managers' in data and data['managers']:
            rows = []
            for m in data['managers']:
                mgr_disp = m.get('manager_name') or 'Manager'
                rows.append([
                    mgr_disp,
                    m.get('position_title') or 'N/A',
                    m.get('department_name') or 'N/A',
                    str(m.get('direct_reports_count', 0)),
                    str(m.get('total_reports_count', 0)),
                    "Yes" if m.get('is_executive') else "No",
                    "OVERLOADED" if m.get('is_overloaded') else "Normal"
                ])
            pivots.append({
                'title': 'Managerial Span of Control Audit',
                'type': 'table',
                'columns': ['Manager Name', 'Position Title', 'Department', 'Direct Reports', 'Total Reports', 'Executive', 'Span Status'],
                'rows': rows
            })

        if 'interim_assignments' in data and data['interim_assignments']:
            rows = []
            for ia in data['interim_assignments']:
                emp_disp = ia.get('employee_name') or ia.get('employee_user_id') or 'N/A'
                mgr_disp = ia.get('interim_manager_name') or ia.get('interim_manager_user_id') or 'N/A'
                days = f"{ia.get('days_remaining')} days" if ia.get('days_remaining') is not None else 'N/A'
                rows.append([
                    emp_disp,
                    mgr_disp,
                    (ia.get('reporting_type') or 'Direct').title(),
                    ia.get('effective_from') or 'N/A',
                    ia.get('effective_to') or 'N/A',
                    days,
                    "Current" if ia.get('is_current') else "Completed"
                ])
            pivots.append({
                'title': 'Active Interim Management & Delegations',
                'type': 'table',
                'columns': ['Employee', 'Acting Manager', 'Reporting Type', 'Effective From', 'Effective To', 'Remaining', 'Status'],
                'rows': rows
            })

        if 'cost_centers' in data and data['cost_centers']:
            rows = []
            for cc in data['cost_centers']:
                curr = cc.get('currency', 'USD')
                b_str = f"{curr} ${cc.get('budget_amount', 0):,.2f}" if curr == 'USD' else f"{curr} {cc.get('budget_amount', 0):,.2f}"
                rows.append([
                    cc.get('code') or '',
                    cc.get('name') or '',
                    (cc.get('category') or 'Operational').title(),
                    b_str,
                    str(cc.get('allocated_departments_count', 0))
                ])
            pivots.append({
                'title': 'Cost Center Budget & Department Allocations',
                'type': 'table',
                'columns': ['Cost Center Code', 'Cost Center Name', 'Category', 'Budget Amount', 'Depts Allocated'],
                'rows': rows
            })

        if 'locations' in data and data['locations']:
            rows = []
            for loc in data['locations']:
                rows.append([
                    loc.get('code') or '',
                    loc.get('name') or '',
                    (loc.get('location_type') or 'Branch').title(),
                    loc.get('city') or '',
                    loc.get('country') or ''
                ])
            pivots.append({
                'title': 'Organizational Locations & Hubs',
                'type': 'table',
                'columns': ['Location Code', 'Location Name', 'Type', 'City', 'Country'],
                'rows': rows
            })

        if 'sensitive_departments' in data and data['sensitive_departments']:
            rows = []
            for sd in data['sensitive_departments']:
                mgr_disp = sd.get('manager_name') or sd.get('manager_id') or 'Unassigned'
                rows.append([
                    sd.get('code') or '',
                    sd.get('name') or '',
                    (sd.get('sensitivity_level') or 'Confidential').upper(),
                    mgr_disp
                ])
            pivots.append({
                'title': 'Classified & Restricted Sensitivity Departments',
                'type': 'table',
                'columns': ['Dept Code', 'Department Name', 'Sensitivity Level', 'Department Manager'],
                'rows': rows
            })

        # 3. KPI Domain Tables (skip when this is a reviews payload)
        kpis = data.get('kpis', [])
        if kpis and not is_reviews:
            pivots.append(self._build_status_pivot(kpis))
            pivots.append(self._build_department_pivot(kpis))
            if data.get('aggregations', {}).get('by_department'):
                pivots.append(self._build_performance_pivot(data['aggregations']['by_department']))

        # 4. Reviews Domain Tables
        if is_reviews:
            pivots.extend(self._build_reviews_pivots(data, config))

        # 5. Pass-through: if the extractor already emitted curated tables,
        #    merge them in so callers don't lose them. Dedup by title.
        existing_titles = {p.get('title') for p in pivots}
        for t in (data.get('tables') or []):
            t_title = t.get('title')
            if t_title and t_title not in existing_titles:
                pivots.append(t)
                existing_titles.add(t_title)

        return pivots

    # ------------------------------------------------------------------
    # KPI helpers (unchanged)
    # ------------------------------------------------------------------

    def _build_status_pivot(self, kpis: List[Dict]) -> Dict:
        pivot_data = defaultdict(lambda: defaultdict(lambda: {'count': 0, 'progress': 0}))
        for kpi in kpis:
            dept = kpi.get('department', 'Unknown')
            status = kpi.get('status', 'Pending')
            pivot_data[dept][status]['count'] += 1
            pivot_data[dept][status]['progress'] += kpi.get('progress', 0)
        rows = []
        for dept, statuses in pivot_data.items():
            row = {'department': dept}
            for status in ['On Track', 'At Risk', 'Off Track', 'Pending']:
                stats = statuses.get(status, {'count': 0, 'progress': 0})
                row[f'{status}_count'] = stats['count']
                row[f'{status}_progress'] = round(stats['progress'] / stats['count'] if stats['count'] > 0 else 0, 2)
            row['total'] = sum(row.get(f'{s}_count', 0) for s in ['On Track', 'At Risk', 'Off Track', 'Pending'])
            rows.append(row)
        columns = ['Department'] + [f'{s}_count' for s in ['On Track', 'At Risk', 'Off Track', 'Pending']]
        columns += ['total']
        return {
            'title': 'Status Pivot by Department',
            'type': 'pivot',
            'columns': columns,
            'rows': [[row.get(col, 0) for col in columns] for row in rows],
            'data': rows
        }

    def _build_department_pivot(self, kpis: List[Dict]) -> Dict:
        pivot_data = defaultdict(lambda: defaultdict(lambda: {'count': 0, 'progress': 0}))
        for kpi in kpis:
            dept = kpi.get('department', 'Unknown')
            category = kpi.get('category', 'Uncategorized')
            pivot_data[dept][category]['count'] += 1
            pivot_data[dept][category]['progress'] += kpi.get('progress', 0)
        rows = []
        categories = sorted(set(c for v in pivot_data.values() for c in v.keys()))
        for dept, categories_data in pivot_data.items():
            row = {'department': dept}
            for cat in categories:
                stats = categories_data.get(cat, {'count': 0, 'progress': 0})
                row[f'{cat}_count'] = stats['count']
                row[f'{cat}_avg_progress'] = round(stats['progress'] / stats['count'] if stats['count'] > 0 else 0, 2)
            rows.append(row)
        columns = ['Department'] + [f'{cat}_count' for cat in categories] + [f'{cat}_avg_progress' for cat in categories]
        return {
            'title': 'Department-Category Pivot',
            'type': 'pivot',
            'columns': columns,
            'rows': [[row.get(col, 0) for col in columns] for row in rows],
            'data': rows
        }

    def _build_performance_pivot(self, dept_data: Dict) -> Dict:
        rows = []
        for dept, stats in dept_data.items():
            rows.append({
                'department': dept,
                'total_kpis': stats.get('count', 0),
                'avg_progress': round(stats.get('avg_progress', 0), 2),
                'on_track': stats.get('on_track', 0),
                'at_risk': stats.get('at_risk', 0),
                'off_track': stats.get('off_track', 0),
                'completion_rate': round(
                    (stats.get('on_track', 0) + stats.get('at_risk', 0)) / stats.get('count', 1) * 100, 2
                ) if stats.get('count', 0) > 0 else 0
            })
        rows.sort(key=lambda x: x['avg_progress'], reverse=True)
        columns = ['Department', 'Total KPIs', 'Avg Progress', 'On Track', 'At Risk', 'Off Track', 'Completion Rate']
        return {
            'title': 'Department Performance Summary',
            'type': 'table',
            'columns': columns,
            'rows': [[row.get(col.lower().replace(' ', '_'), 0) for col in columns] for row in rows],
            'data': rows
        }

    # ------------------------------------------------------------------
    # Reviews domain
    # ------------------------------------------------------------------

    def _build_reviews_pivots(self, data: Dict, config: Dict) -> List[Dict]:
        """
        Emit tables for each reviews sub-section. Reads from both nested
        `metrics` (extractor output) and `raw_data` (curated lists). Never
        falls through to KPI pivots.
        """
        pivots: List[Dict] = []
        pivots.extend(self._reviews_individual_pivots(data, config))
        pivots.extend(self._reviews_compliance_pivots(data, config))
        pivots.extend(self._reviews_performance_pivots(data, config))
        pivots.extend(self._reviews_calibration_pivots(data, config))
        pivots.extend(self._reviews_pip_pivots(data, config))
        pivots.extend(self._reviews_executive_pivots(data, config))
        return pivots

    # -------- reviews: individual summary --------------------------------

    def _reviews_individual_pivots(self, data: Dict, config: Dict) -> List[Dict]:
        pivots: List[Dict] = []
        ind = data.get('individual_summary') or {}
        raw = ind.get('raw_data') or {}
        metrics = ind.get('metrics') or ind.get('summary') or {}
        scorecards = raw.get('scorecards') or ind.get('individual_scorecards') or []

        if scorecards:
            rows = []
            for s in scorecards[:200]:
                rows.append([
                    s.get('employee_name') or '',
                    s.get('department') or '',
                    s.get('position_title') or '',
                    s.get('kpi_score') if s.get('kpi_score') is not None else '',
                    s.get('competency_score') if s.get('competency_score') is not None else '',
                    s.get('final_score') if s.get('final_score') is not None else '',
                    s.get('rating_label') or '',
                    s.get('status') or '',
                ])
            pivots.append({
                'title': 'Individual Review Scorecards',
                'type': 'table',
                'columns': ['Employee', 'Department', 'Position', 'KPI Score',
                            'Competency Score', 'Final Score', 'Rating', 'Status'],
                'rows': rows,
            })

        rating_dist = metrics.get('rating_distribution') or {}
        if not rating_dist and scorecards:
            for s in scorecards:
                lbl = s.get('rating_label') or 'Not Rated'
                rating_dist[lbl] = rating_dist.get(lbl, 0) + 1
        if rating_dist:
            total = sum(rating_dist.values()) or 1
            rows = [
                [label, count, f"{round(count / total * 100, 1)}%"]
                for label, count in sorted(rating_dist.items(), key=lambda kv: kv[1], reverse=True)
            ]
            pivots.append({
                'title': 'Rating Distribution',
                'type': 'table',
                'columns': ['Rating Label', 'Count', 'Percentage'],
                'rows': rows,
            })

        return pivots

    # -------- reviews: cycle compliance ----------------------------------

    def _reviews_compliance_pivots(self, data: Dict, config: Dict) -> List[Dict]:
        pivots: List[Dict] = []
        comp = data.get('cycle_compliance') or {}
        raw = comp.get('raw_data') or {}
        metrics = comp.get('metrics') or comp.get('summary') or {}

        if metrics:
            total = metrics.get('total_participants') or 0
            stages = [
                ('Self Assessment Submitted', metrics.get('self_submitted', 0),
                 metrics.get('self_completion_rate_pct', 0.0)),
                ('Supervisor Review Approved', metrics.get('supervisor_approved', 0),
                 metrics.get('supervisor_completion_rate_pct', 0.0)),
                ('Final Ratings Locked', metrics.get('ratings_locked', 0),
                 metrics.get('overall_completion_rate_pct', 0.0)),
            ]
            rows = [[label, count, total, f"{rate}%"] for label, count, rate in stages]
            pivots.append({
                'title': 'Cycle Stage Completion',
                'type': 'table',
                'columns': ['Stage', 'Completed', 'Total', 'Rate %'],
                'rows': rows,
            })

        dept_rows = raw.get('department_compliance') or []
        if dept_rows:
            rows = []
            for d in dept_rows:
                rows.append([
                    d.get('department') or 'Unassigned',
                    d.get('total', 0),
                    d.get('locked', 0),
                    f"{d.get('completion_rate_pct', 0.0)}%",
                    d.get('avg_score', 0.0),
                ])
            pivots.append({
                'title': 'Department Compliance Matrix',
                'type': 'table',
                'columns': ['Department', 'Total', 'Locked', 'Completion %', 'Avg Score'],
                'rows': rows,
            })

        return pivots

    # -------- reviews: organization performance --------------------------

    def _reviews_performance_pivots(self, data: Dict, config: Dict) -> List[Dict]:
        pivots: List[Dict] = []
        perf = data.get('organization_performance') or {}
        raw = perf.get('raw_data') or {}
        metrics = perf.get('metrics') or perf.get('summary') or {}

        dept_rankings = raw.get('department_rankings') or []
        if dept_rankings:
            rows = []
            for d in sorted(dept_rankings, key=lambda x: x.get('avg_score') or 0, reverse=True):
                rows.append([
                    d.get('department') or 'Unassigned',
                    d.get('count', 0),
                    d.get('avg_score', 0.0),
                    d.get('variance', 0.0),
                ])
            pivots.append({
                'title': 'Department Performance Rankings',
                'type': 'table',
                'columns': ['Department', 'Employees', 'Avg Score', 'Variance'],
                'rows': rows,
            })

        distribution = raw.get('rating_distribution') or []
        if distribution:
            rows = [[d.get('label') or 'Not Rated', d.get('count', 0),
                     f"{d.get('percentage', 0.0)}%"] for d in distribution]
            pivots.append({
                'title': 'Organization Rating Distribution',
                'type': 'table',
                'columns': ['Rating Label', 'Count', 'Percentage'],
                'rows': rows,
            })

        strongest = metrics.get('strongest_competencies') or []
        weakest = metrics.get('weakest_competencies') or []
        if strongest or weakest:
            rows = []
            for c in strongest:
                rows.append([c.get('name') or '', c.get('score', 0.0),
                             f"{c.get('percentage', 0.0)}%", 'Strongest'])
            for c in weakest:
                rows.append([c.get('name') or '', c.get('score', 0.0),
                             f"{c.get('percentage', 0.0)}%", 'Weakest'])
            pivots.append({
                'title': 'Competency Strengths & Weaknesses',
                'type': 'table',
                'columns': ['Competency', 'Avg Raw Score', 'Normalized %', 'Category'],
                'rows': rows,
            })

        return pivots

    # -------- reviews: calibration impact --------------------------------

    def _reviews_calibration_pivots(self, data: Dict, config: Dict) -> List[Dict]:
        pivots: List[Dict] = []
        cal = data.get('calibration_impact') or {}
        raw = cal.get('raw_data') or {}
        metrics = cal.get('metrics') or cal.get('summary') or {}

        sessions = raw.get('sessions') or []
        if sessions:
            rows = []
            for s in sessions:
                rows.append([
                    s.get('name') or '',
                    s.get('session_type') or '',
                    s.get('scheduled_date') or '',
                    s.get('status') or '',
                    s.get('outcome') or '',
                    s.get('facilitator') or '',
                    s.get('adjustments_count', 0),
                ])
            pivots.append({
                'title': 'Calibration Sessions',
                'type': 'table',
                'columns': ['Session', 'Type', 'Scheduled', 'Status', 'Outcome',
                            'Facilitator', 'Adjustments'],
                'rows': rows,
            })

        # Adjustment summary (from metrics).
        if metrics:
            inc = metrics.get('score_increases_count', 0) or 0
            dec = metrics.get('score_decreases_count', 0) or 0
            flat = metrics.get('no_change_count', 0) or 0
            if inc + dec + flat > 0:
                total = inc + dec + flat
                rows = [
                    ['Score Increases', inc, f"{round(inc / total * 100, 1)}%"],
                    ['Score Decreases', dec, f"{round(dec / total * 100, 1)}%"],
                    ['No Change', flat, f"{round(flat / total * 100, 1)}%"],
                ]
                pivots.append({
                    'title': 'Calibration Adjustment Summary',
                    'type': 'table',
                    'columns': ['Direction', 'Count', 'Percentage'],
                    'rows': rows,
                })

        outliers = (raw.get('outliers') or {}).get('outliers') or []
        if outliers:
            rows = []
            for o in outliers[:100]:
                reasons = o.get('reasons') or []
                rows.append([
                    o.get('employee') or '',
                    o.get('department') or '',
                    o.get('manager') or '',
                    o.get('score', 0.0),
                    '; '.join(reasons) if reasons else '',
                ])
            pivots.append({
                'title': 'Calibration Outliers',
                'type': 'table',
                'columns': ['Employee', 'Department', 'Manager', 'Score', 'Reasons'],
                'rows': rows,
            })

        inconsistent = (raw.get('outliers') or {}).get('inconsistent_managers') or []
        if inconsistent:
            rows = []
            for m in inconsistent:
                rows.append([
                    m.get('manager') or '',
                    m.get('average_rating', 0.0),
                    m.get('overall_average', 0.0),
                    m.get('deviation', 0.0),
                    m.get('employees_count', 0),
                ])
            pivots.append({
                'title': 'Manager Rating Bias Flags',
                'type': 'table',
                'columns': ['Manager', 'Avg Rating', 'Overall Avg', 'Deviation', 'Employees'],
                'rows': rows,
            })

        return pivots

    # -------- reviews: PIP tracker ---------------------------------------

    def _reviews_pip_pivots(self, data: Dict, config: Dict) -> List[Dict]:
        pivots: List[Dict] = []
        pip = data.get('pip_tracker') or {}
        raw = pip.get('raw_data') or {}
        metrics = pip.get('metrics') or pip.get('summary') or {}

        pips = raw.get('pips') or []
        if pips:
            rows = []
            for p in pips:
                rows.append([
                    p.get('title') or '',
                    p.get('employee_name') or '',
                    p.get('owner_name') or '',
                    p.get('severity') or '',
                    p.get('status') or '',
                    p.get('outcome') or '',
                    p.get('start_date') or '',
                    p.get('end_date') or '',
                ])
            pivots.append({
                'title': 'PIP Registry',
                'type': 'table',
                'columns': ['Title', 'Employee', 'Owner', 'Severity', 'Status',
                            'Outcome', 'Start', 'End'],
                'rows': rows,
            })

        if metrics:
            summary_rows = [
                ['Total PIPs', metrics.get('total_pips', 0)],
                ['Active PIPs', metrics.get('active_pips', 0)],
                ['Successful', metrics.get('successful_pips', 0)],
                ['Extended', metrics.get('extended_pips', 0)],
                ['Failed', metrics.get('failed_pips', 0)],
                ['Terminated', metrics.get('terminated_pips', 0)],
                ['Success Rate', f"{metrics.get('pip_success_rate_pct', 0.0)}%"],
                ['Total Action Items', metrics.get('total_action_items', 0)],
                ['Completed Actions', metrics.get('completed_action_items', 0)],
                ['Missed Actions', metrics.get('missed_action_items', 0)],
                ['Action Completion Rate', f"{metrics.get('action_completion_rate_pct', 0.0)}%"],
            ]
            pivots.append({
                'title': 'PIP Summary Statistics',
                'type': 'table',
                'columns': ['Metric', 'Value'],
                'rows': summary_rows,
            })

        trends = raw.get('trends') or []
        if trends:
            rows = []
            for t in trends:
                rows.append([
                    t.get('month') or '',
                    t.get('created', 0),
                    t.get('completed', 0),
                    t.get('successful', 0),
                    t.get('failed', 0),
                ])
            pivots.append({
                'title': 'PIP Trends',
                'type': 'table',
                'columns': ['Month', 'Created', 'Completed', 'Successful', 'Failed'],
                'rows': rows,
            })

        return pivots

    # -------- reviews: executive rollup ----------------------------------

    def _reviews_executive_pivots(self, data: Dict, config: Dict) -> List[Dict]:
        """
        Only for the unified payload — a single top-level summary table so
        executive reports have one condensed view.
        """
        pivots: List[Dict] = []
        metrics = data.get('metrics') or {}
        if not metrics:
            return pivots

        # Only emit if it's clearly a unified reviews payload (has most of
        # the aggregate keys).
        if 'talent_health_score' not in metrics:
            return pivots

        key_labels = [
            ('talent_health_score', 'Talent Health Score'),
            ('total_evaluated_employees', 'Employees Evaluated'),
            ('total_participants', 'Total Participants'),
            ('overall_completion_rate_pct', 'Overall Completion %'),
            ('self_completion_rate_pct', 'Self-Assessment Completion %'),
            ('supervisor_completion_rate_pct', 'Supervisor Completion %'),
            ('avg_overall_score', 'Average Overall Score'),
            ('avg_kpi_score', 'Average KPI Score'),
            ('avg_competency_score', 'Average Competency Score'),
            ('std_dev', 'Standard Deviation'),
            ('active_pips', 'Active PIPs'),
            ('pip_success_rate_pct', 'PIP Success Rate %'),
            ('calibration_sessions_count', 'Calibration Sessions'),
            ('calibration_adjustments_count', 'Calibration Adjustments'),
            ('outlier_count', 'Calibration Outliers'),
            ('promotion_ready_count', 'Promotion Recommendations'),
        ]
        rows = []
        for key, label in key_labels:
            val = metrics.get(key)
            if val is None:
                continue
            if isinstance(val, str) and val.endswith('%'):
                display = val
            elif 'pct' in key or 'rate' in key or 'score' in key:
                display = f"{val}%"
            else:
                display = val
            rows.append([label, display])

        if rows:
            pivots.append({
                'title': 'Executive Reviews Summary',
                'type': 'table',
                'columns': ['Metric', 'Value'],
                'rows': rows,
            })

        return pivots

    # ------------------------------------------------------------------
    # Generic cross-tab helpers (unchanged)
    # ------------------------------------------------------------------

    def build_cross_tab(self, data: List[Dict], row_field: str, col_field: str, value_field: str, agg_type: str = 'sum') -> Dict:
        pivot = defaultdict(lambda: defaultdict(float))
        row_labels = set()
        col_labels = set()
        for item in data:
            row = item.get(row_field, 'Unknown')
            col = item.get(col_field, 'Unknown')
            value = item.get(value_field, 0)
            row_labels.add(row)
            col_labels.add(col)
            if agg_type == 'sum':
                pivot[row][col] += value
            elif agg_type == 'count':
                pivot[row][col] += 1
            elif agg_type == 'avg':
                pivot[row][col] = (pivot[row][col] + value) / 2
        sorted_rows = sorted(row_labels)
        sorted_cols = sorted(col_labels)
        result = {
            'row_labels': sorted_rows,
            'col_labels': sorted_cols,
            'data': [[pivot[row].get(col, 0) for col in sorted_cols] for row in sorted_rows],
            'totals': {
                'rows': [sum(pivot[row].values()) for row in sorted_rows],
                'cols': [sum(pivot[row].get(col, 0) for row in sorted_rows) for col in sorted_cols]
            }
        }
        return result

    def build_summary_table(self, data: List[Dict], group_by: str, value_fields: List[str], aggs: Optional[List[str]] = None) -> Dict:
        aggs = aggs or ['sum', 'avg', 'count']
        grouped = defaultdict(lambda: {field: [] for field in value_fields})
        for item in data:
            key = item.get(group_by, 'Unknown')
            for field in value_fields:
                grouped[key][field].append(item.get(field, 0))
        rows = []
        for key, values in grouped.items():
            row = {'group': key}
            for field in value_fields:
                vals = values[field]
                if 'sum' in aggs:
                    row[f'{field}_sum'] = sum(vals)
                if 'avg' in aggs:
                    row[f'{field}_avg'] = sum(vals) / len(vals) if vals else 0
                if 'count' in aggs:
                    row[f'{field}_count'] = len(vals)
                if 'min' in aggs:
                    row[f'{field}_min'] = min(vals) if vals else 0
                if 'max' in aggs:
                    row[f'{field}_max'] = max(vals) if vals else 0
            rows.append(row)
        return {
            'group_by': group_by,
            'value_fields': value_fields,
            'aggregations': aggs,
            'data': rows
        }

    def pivot_to_table_data(self, pivot_data: Dict) -> Dict:
        row_labels = pivot_data.get('row_labels', [])
        col_labels = pivot_data.get('col_labels', [])
        data = pivot_data.get('data', [])
        if not row_labels or not col_labels:
            return {'columns': [], 'rows': []}
        columns = ['Row Label'] + col_labels
        rows = []
        for i, row in enumerate(row_labels):
            row_data = [row]
            row_data.extend(data[i] if i < len(data) else [0] * len(col_labels))
            rows.append(row_data)
        return {
            'columns': columns,
            'rows': rows,
            'totals': pivot_data.get('totals', {})
        }