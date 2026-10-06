# apps/reportplt/services/generation/chart_renderer.py
from typing import Dict, Any, List, Optional
from collections import defaultdict
import json


class ChartRenderer:
    def __init__(self, config: Optional[Dict] = None):
        self.config = config or {}
        self.default_colors = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']

    # ------------------------------------------------------------------
    # Entry point
    # ------------------------------------------------------------------

    def prepare_charts(self, data: Dict, chart_config: Optional[Dict] = None) -> List[Dict]:
        charts: List[Dict] = []
        config = chart_config or self.config

        summary = data.get('summary', {}) or {}
        source = data.get('source')

        # Identify which domain this payload belongs to. Reviews payloads
        # surface nested sub-payloads (individual_summary, cycle_compliance,
        # organization_performance, calibration_impact, pip_tracker) rather
        # than a flat `kpis` list, so we must not fall through to the KPI
        # branch for them.
        is_reviews = (
            source == 'reviews'
            or 'individual_summary' in data
            or 'cycle_compliance' in data
            or 'organization_performance' in data
            or 'calibration_impact' in data
            or 'pip_tracker' in data
        )

        # 1. Accounts Domain Charts
        role_dist = summary.get('role_distribution') or data.get('role_distribution')
        if role_dist:
            labels = [(r.get('role') or 'Unknown').replace('_', ' ').title() for r in role_dist[:6]]
            values = [r.get('count') or r.get('user_count') or 0 for r in role_dist[:6]]
            if sum(values) > 0:
                charts.append({
                    'type': 'bar',
                    'title': 'User Role Distribution',
                    'data': {
                        'labels': labels,
                        'values': values,
                        'colors': self._get_color_range(len(labels))
                    }
                })

        # MFA Adoption Breakdown
        if 'mfa_enabled_count' in summary:
            mfa_on = summary.get('mfa_enabled_count', 0)
            mfa_off = summary.get('non_mfa_users', 0)
            if mfa_on + mfa_off > 0:
                charts.append({
                    'type': 'pie',
                    'title': 'MFA Adoption Overview',
                    'data': {
                        'labels': ['MFA Enabled', 'Non-MFA (Vulnerable)'],
                        'values': [mfa_on, mfa_off],
                        'colors': ['#10b981', '#ef4444']
                    }
                })

        # Login Security Success vs Failure
        if 'successes' in summary and 'failures' in summary:
            succ = summary.get('successes', 0)
            fail = summary.get('failures', 0)
            lock = summary.get('lockouts', 0)
            if succ + fail + lock > 0:
                charts.append({
                    'type': 'pie',
                    'title': 'Login Attempts Security Breakdown',
                    'data': {
                        'labels': ['Success', 'Failure', 'Locked Out'],
                        'values': [succ, fail, lock],
                        'colors': ['#10b981', '#f59e0b', '#ef4444']
                    }
                })

        # Audit Action Breakdown
        action_bd = summary.get('action_breakdown') or data.get('action_breakdown')
        if action_bd:
            labels = [(a.get('action_type') or 'General').title() for a in action_bd[:6]]
            values = [a.get('count', 0) for a in action_bd[:6]]
            if sum(values) > 0:
                charts.append({
                    'type': 'bar',
                    'title': 'Audit Events by Action Category',
                    'data': {
                        'labels': labels,
                        'values': values,
                        'colors': self._get_color_range(len(labels))
                    }
                })

        # Device Breakdown
        device_bd = summary.get('device_breakdown') or data.get('device_breakdown')
        if device_bd:
            labels = [(d.get('device_type') or 'Desktop').title() for d in device_bd[:5]]
            values = [d.get('count', 0) for d in device_bd[:5]]
            if sum(values) > 0:
                charts.append({
                    'type': 'pie',
                    'title': 'Active Sessions by Device Type',
                    'data': {
                        'labels': labels,
                        'values': values,
                        'colors': self._get_color_range(len(labels))
                    }
                })

        # Password Age Buckets
        age_b = summary.get('age_buckets')
        if age_b and isinstance(age_b, dict):
            labels = ['0-30 Days', '30-60 Days', '60-90 Days', '>90 Days (Stale)']
            values = [
                age_b.get('0_to_30_days', 0),
                age_b.get('30_to_60_days', 0),
                age_b.get('60_to_90_days', 0),
                age_b.get('over_90_days', 0)
            ]
            if sum(values) > 0:
                charts.append({
                    'type': 'bar',
                    'title': 'Password Age & Stale Hygiene Distribution',
                    'data': {
                        'labels': labels,
                        'values': values,
                        'colors': ['#10b981', '#3b82f6', '#f59e0b', '#ef4444']
                    }
                })

        # 2. Structure Domain Charts
        depts = data.get('departments', [])
        if depts:
            sorted_depts = sorted(depts, key=lambda d: d.get('employee_count', 0), reverse=True)[:6]
            labels = [(d.get('name') or 'Dept')[:18] for d in sorted_depts]
            values = [d.get('employee_count', 0) for d in sorted_depts]
            if sum(values) > 0:
                charts.append({
                    'type': 'bar',
                    'title': 'Top Departments by Employee Headcount',
                    'data': {
                        'labels': labels,
                        'values': values,
                        'colors': self._get_color_range(len(labels))
                    }
                })

        divs = data.get('divisions', [])
        if divs:
            sorted_divs = sorted(divs, key=lambda d: d.get('employee_count', 0), reverse=True)[:6]
            labels = [(d.get('name') or 'Division')[:18] for d in sorted_divs]
            values = [d.get('employee_count', 0) for d in sorted_divs]
            if sum(values) > 0:
                charts.append({
                    'type': 'pie',
                    'title': 'Division Headcount Distribution',
                    'data': {
                        'labels': labels,
                        'values': values,
                        'colors': self._get_color_range(len(labels))
                    }
                })

        sens_bd = summary.get('sensitivity_breakdown') or data.get('sensitivity_breakdown')
        if sens_bd and isinstance(sens_bd, dict):
            labels = ['Public', 'Internal', 'Confidential', 'Restricted']
            values = [
                sens_bd.get('public', 0),
                sens_bd.get('internal', 0),
                sens_bd.get('confidential', 0),
                sens_bd.get('restricted', 0)
            ]
            if sum(values) > 0:
                charts.append({
                    'type': 'pie',
                    'title': 'Department Security Sensitivity Scope',
                    'data': {
                        'labels': labels,
                        'values': values,
                        'colors': ['#10b981', '#3b82f6', '#f59e0b', '#ef4444']
                    }
                })

        ccs = data.get('cost_centers', [])
        if ccs:
            sorted_ccs = sorted(ccs, key=lambda c: c.get('budget_amount', 0), reverse=True)[:6]
            labels = [(c.get('name') or 'Cost Center')[:18] for c in sorted_ccs]
            values = [c.get('budget_amount', 0) for c in sorted_ccs]
            if sum(values) > 0:
                charts.append({
                    'type': 'bar',
                    'title': 'Top Cost Center Budget Allocations ($)',
                    'data': {
                        'labels': labels,
                        'values': values,
                        'colors': self._get_color_range(len(labels))
                    }
                })

        mgrs = data.get('managers', [])
        if mgrs:
            sorted_mgrs = sorted(mgrs, key=lambda m: m.get('direct_reports_count', 0), reverse=True)[:6]
            labels = [(m.get('manager_name') or m.get('position_title') or 'Manager')[:18] for m in sorted_mgrs]
            values = [m.get('direct_reports_count', 0) for m in sorted_mgrs]
            if sum(values) > 0:
                charts.append({
                    'type': 'bar',
                    'title': 'Managerial Direct Reports (Span of Control)',
                    'data': {
                        'labels': labels,
                        'values': values,
                        'colors': self._get_color_range(len(labels))
                    }
                })

        # 3. KPI Domain Charts (skip when this is a reviews payload)
        kpis = data.get('kpis', [])
        if kpis and not is_reviews:
            charts.append(self._prepare_status_chart(kpis, config))
            charts.append(self._prepare_progress_chart(kpis, config))
            if data.get('aggregations', {}).get('by_department'):
                charts.append(self._prepare_department_chart(data['aggregations']['by_department'], config))
            if data.get('aggregations', {}).get('by_category'):
                charts.append(self._prepare_category_chart(data['aggregations']['by_category'], config))
            if data.get('trend'):
                charts.append(self._prepare_trend_chart(data['trend'], config))

        # 4. Reviews Domain Charts
        if is_reviews:
            charts.extend(self._prepare_reviews_charts(data, config))

        return charts

    # ------------------------------------------------------------------
    # KPI helpers
    # ------------------------------------------------------------------

    def _prepare_status_chart(self, kpis: List[Dict], config: Dict) -> Dict:
        status_counts = {'On Track': 0, 'At Risk': 0, 'Off Track': 0, 'Pending': 0}
        for kpi in kpis:
            status = kpi.get('status', 'Pending')
            status_counts[status] = status_counts.get(status, 0) + 1
        colors = {'On Track': '#10b981', 'At Risk': '#f59e0b', 'Off Track': '#ef4444', 'Pending': '#94a3b8'}
        return {
            'type': 'pie',
            'title': 'KPI Status Distribution',
            'data': {
                'labels': list(status_counts.keys()),
                'values': list(status_counts.values()),
                'colors': [colors.get(k, '#94a3b8') for k in status_counts.keys()]
            },
            'config': {
                'show_legend': True,
                'show_percentage': True,
                'responsive': True
            }
        }

    def _prepare_progress_chart(self, kpis: List[Dict], config: Dict) -> Dict:
        top_kpis = sorted(kpis, key=lambda x: x.get('progress', 0), reverse=True)[:10]
        return {
            'type': 'bar',
            'title': 'Top 10 KPIs by Progress',
            'data': {
                'labels': [k.get('name', '')[:20] for k in top_kpis],
                'values': [k.get('progress', 0) for k in top_kpis],
                'colors': self._get_color_range(len(top_kpis))
            },
            'config': {
                'show_values': True,
                'horizontal': False,
                'show_legend': False
            }
        }

    def _prepare_department_chart(self, dept_data: Dict, config: Dict) -> Dict:
        sorted_depts = sorted(dept_data.items(), key=lambda x: x[1].get('avg_progress', 0), reverse=True)
        return {
            'type': 'bar',
            'title': 'Department Performance',
            'data': {
                'labels': [d[0] for d in sorted_depts],
                'values': [d[1].get('avg_progress', 0) for d in sorted_depts],
                'colors': self._get_color_range(len(sorted_depts))
            },
            'config': {
                'show_values': True,
                'horizontal': True,
                'show_legend': False
            }
        }

    def _prepare_category_chart(self, category_data: Dict, config: Dict) -> Dict:
        sorted_cats = sorted(category_data.items(), key=lambda x: x[1].get('count', 0), reverse=True)
        return {
            'type': 'bar',
            'title': 'KPI Distribution by Category',
            'data': {
                'labels': [c[0] for c in sorted_cats],
                'values': [c[1].get('count', 0) for c in sorted_cats],
                'colors': self._get_color_range(len(sorted_cats))
            },
            'config': {
                'show_values': True,
                'horizontal': False,
                'show_legend': False
            }
        }

    def _prepare_trend_chart(self, trend_data: List[Dict], config: Dict) -> Dict:
        sorted_trend = sorted(trend_data, key=lambda x: x.get('period', ''))
        return {
            'type': 'line',
            'title': 'Performance Trend Over Time',
            'data': {
                'labels': [t.get('period', '') for t in sorted_trend],
                'values': [t.get('avg_progress', 0) for t in sorted_trend],
                'colors': ['#2563eb']
            },
            'config': {
                'show_values': False,
                'show_area': True,
                'show_legend': False,
                'smooth': True
            }
        }

    # ------------------------------------------------------------------
    # Reviews domain helpers
    # ------------------------------------------------------------------

    def _prepare_reviews_charts(self, data: Dict, config: Dict) -> List[Dict]:
        """
        Reviews reports produce up to five sub-payloads:
            individual_summary, cycle_compliance, organization_performance,
            calibration_impact, pip_tracker
        Each may carry its own `metrics` and `raw_data`. Emit one chart per
        section where data exists; never fall through to KPI charts.
        """
        charts: List[Dict] = []

        charts.extend(self._reviews_individual_charts(data, config))
        charts.extend(self._reviews_compliance_charts(data, config))
        charts.extend(self._reviews_performance_charts(data, config))
        charts.extend(self._reviews_calibration_charts(data, config))
        charts.extend(self._reviews_pip_charts(data, config))

        # If this is a unified reviews payload with top-level metrics, add a
        # Talent Health gauge-style indicator as a bar chart so downstream
        # renderers can display it without a dedicated gauge type.
        metrics = data.get('metrics') or {}
        talent_health = metrics.get('talent_health_score')
        if talent_health is not None:
            try:
                th_val = float(talent_health)
            except (TypeError, ValueError):
                th_val = None
            if th_val is not None:
                charts.append({
                    'type': 'bar',
                    'title': 'Talent Health Score',
                    'data': {
                        'labels': ['Talent Health'],
                        'values': [th_val],
                        'colors': ['#10b981' if th_val >= 75 else '#f59e0b' if th_val >= 50 else '#ef4444']
                    },
                    'config': {'show_values': True, 'show_legend': False}
                })

        return charts

    # -------- reviews: individual summary --------------------------------

    def _reviews_individual_charts(self, data: Dict, config: Dict) -> List[Dict]:
        charts: List[Dict] = []

        ind = data.get('individual_summary') or {}
        # Support both the direct extractor output and the nested unified form.
        raw = ind.get('raw_data') or {}
        scorecards = raw.get('scorecards') or ind.get('individual_scorecards') or []
        metrics = ind.get('metrics') or ind.get('summary') or {}

        if scorecards:
            # Top 10 employees by final score
            scored = [s for s in scorecards if s.get('final_score') is not None]
            top = sorted(scored, key=lambda s: s.get('final_score') or 0, reverse=True)[:10]
            if top:
                charts.append({
                    'type': 'bar',
                    'title': 'Top Employees by Final Score',
                    'data': {
                        'labels': [(s.get('employee_name') or 'Employee')[:20] for s in top],
                        'values': [s.get('final_score') or 0 for s in top],
                        'colors': self._get_color_range(len(top))
                    },
                    'config': {'show_values': True, 'show_legend': False}
                })

            # Average KPI vs Competency across the scope
            kpi_vals = [s.get('kpi_score') for s in scored if s.get('kpi_score') is not None]
            comp_vals = [s.get('competency_score') for s in scored if s.get('competency_score') is not None]
            if kpi_vals or comp_vals:
                avg_kpi = round(sum(kpi_vals) / len(kpi_vals), 2) if kpi_vals else 0
                avg_comp = round(sum(comp_vals) / len(comp_vals), 2) if comp_vals else 0
                charts.append({
                    'type': 'bar',
                    'title': 'Average KPI vs Competency Score',
                    'data': {
                        'labels': ['KPI Score', 'Competency Score'],
                        'values': [avg_kpi, avg_comp],
                        'colors': ['#2563eb', '#10b981']
                    },
                    'config': {'show_values': True, 'show_legend': False}
                })

        # Rating distribution — from metrics dict (preferred) or derived from rows.
        rating_dist = metrics.get('rating_distribution') or {}
        if not rating_dist and scorecards:
            rating_dist = {}
            for s in scorecards:
                label = s.get('rating_label') or 'Not Rated'
                rating_dist[label] = rating_dist.get(label, 0) + 1
        if rating_dist and sum(rating_dist.values()) > 0:
            charts.append({
                'type': 'pie',
                'title': 'Final Rating Distribution',
                'data': {
                    'labels': list(rating_dist.keys()),
                    'values': list(rating_dist.values()),
                    'colors': ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#94a3b8']
                },
                'config': {'show_legend': True, 'show_percentage': True}
            })

        return charts

    # -------- reviews: cycle compliance ----------------------------------

    def _reviews_compliance_charts(self, data: Dict, config: Dict) -> List[Dict]:
        charts: List[Dict] = []

        comp = data.get('cycle_compliance') or {}
        metrics = comp.get('metrics') or comp.get('summary') or {}
        if not metrics:
            return charts

        # Stage completion bar chart
        stages = [
            ('Self Submitted', metrics.get('self_submitted', 0)),
            ('Supervisor Approved', metrics.get('supervisor_approved', 0)),
            ('Ratings Locked', metrics.get('ratings_locked', 0)),
        ]
        if any(v for _, v in stages):
            charts.append({
                'type': 'bar',
                'title': 'Cycle Stage Completion',
                'data': {
                    'labels': [s[0] for s in stages],
                    'values': [s[1] for s in stages],
                    'colors': ['#3b82f6', '#10b981', '#8b5cf6']
                },
                'config': {'show_values': True, 'show_legend': False}
            })

        # Completion rate pie (remaining vs locked)
        total = metrics.get('total_participants') or 0
        locked = metrics.get('ratings_locked') or 0
        if total > 0:
            remaining = max(total - locked, 0)
            charts.append({
                'type': 'pie',
                'title': 'Overall Cycle Progress',
                'data': {
                    'labels': ['Ratings Locked', 'Remaining'],
                    'values': [locked, remaining],
                    'colors': ['#10b981', '#94a3b8']
                },
                'config': {'show_legend': True, 'show_percentage': True}
            })

        # Department compliance bar (from raw_data department_compliance)
        raw = comp.get('raw_data') or {}
        dept_rows = raw.get('department_compliance') or []
        if dept_rows:
            top = sorted(dept_rows, key=lambda d: d.get('completion_rate_pct', 0), reverse=True)[:10]
            charts.append({
                'type': 'bar',
                'title': 'Department Completion Rate (%)',
                'data': {
                    'labels': [(d.get('department') or 'Dept')[:18] for d in top],
                    'values': [d.get('completion_rate_pct') or 0 for d in top],
                    'colors': self._get_color_range(len(top))
                },
                'config': {'show_values': True, 'horizontal': True, 'show_legend': False}
            })

        return charts

    # -------- reviews: organization performance --------------------------

    def _reviews_performance_charts(self, data: Dict, config: Dict) -> List[Dict]:
        charts: List[Dict] = []

        perf = data.get('organization_performance') or {}
        metrics = perf.get('metrics') or perf.get('summary') or {}
        raw = perf.get('raw_data') or {}

        # Department ranking bar
        dept_rankings = raw.get('department_rankings') or []
        if dept_rankings:
            top = sorted(dept_rankings, key=lambda d: d.get('avg_score') or 0, reverse=True)[:8]
            charts.append({
                'type': 'bar',
                'title': 'Department Average Final Score',
                'data': {
                    'labels': [(d.get('department') or 'Dept')[:18] for d in top],
                    'values': [d.get('avg_score') or 0 for d in top],
                    'colors': self._get_color_range(len(top))
                },
                'config': {'show_values': True, 'horizontal': True, 'show_legend': False}
            })

        # Rating distribution bell curve
        distribution = raw.get('rating_distribution') or []
        if distribution and any(d.get('count', 0) for d in distribution):
            charts.append({
                'type': 'bar',
                'title': 'Rating Distribution (Bell Curve)',
                'data': {
                    'labels': [(d.get('label') or 'Not Rated')[:20] for d in distribution],
                    'values': [d.get('count', 0) for d in distribution],
                    'colors': [d.get('color') or '#2563eb' for d in distribution]
                },
                'config': {'show_values': True, 'show_legend': False}
            })

        # Competency strengths vs weaknesses
        strongest = metrics.get('strongest_competencies') or []
        weakest = metrics.get('weakest_competencies') or []
        if strongest or weakest:
            seen: Dict[str, float] = {}
            for c in list(strongest) + list(weakest):
                name = c.get('name')
                if name and name not in seen:
                    seen[name] = float(c.get('percentage') or 0)
            ordered = sorted(seen.items(), key=lambda x: x[1], reverse=True)[:10]
            if ordered:
                charts.append({
                    'type': 'bar',
                    'title': 'Competency Averages (%)',
                    'data': {
                        'labels': [k[:22] for k, _ in ordered],
                        'values': [v for _, v in ordered],
                        'colors': self._get_color_range(len(ordered))
                    },
                    'config': {'show_values': True, 'horizontal': True, 'show_legend': False}
                })

        # Overall / KPI / Competency averages side-by-side
        avg_overall = metrics.get('avg_overall_score')
        avg_kpi = metrics.get('avg_kpi_score')
        avg_comp = metrics.get('avg_competency_score')
        if any(v is not None for v in (avg_overall, avg_kpi, avg_comp)):
            charts.append({
                'type': 'bar',
                'title': 'Organization Score Breakdown',
                'data': {
                    'labels': ['Overall', 'KPI', 'Competency'],
                    'values': [avg_overall or 0, avg_kpi or 0, avg_comp or 0],
                    'colors': ['#2563eb', '#8b5cf6', '#10b981']
                },
                'config': {'show_values': True, 'show_legend': False}
            })

        return charts

    # -------- reviews: calibration impact --------------------------------

    def _reviews_calibration_charts(self, data: Dict, config: Dict) -> List[Dict]:
        charts: List[Dict] = []

        cal = data.get('calibration_impact') or {}
        metrics = cal.get('metrics') or cal.get('summary') or {}
        if not metrics:
            return charts

        increases = metrics.get('score_increases_count', 0) or 0
        decreases = metrics.get('score_decreases_count', 0) or 0
        no_change = metrics.get('no_change_count', 0) or 0

        if increases + decreases + no_change > 0:
            charts.append({
                'type': 'pie',
                'title': 'Calibration Adjustment Direction',
                'data': {
                    'labels': ['Increased', 'Decreased', 'No Change'],
                    'values': [increases, decreases, no_change],
                    'colors': ['#10b981', '#ef4444', '#94a3b8']
                },
                'config': {'show_legend': True, 'show_percentage': True}
            })

        # Sessions status bar
        total_sessions = metrics.get('total_calibration_sessions', 0) or 0
        completed_sessions = metrics.get('completed_sessions', 0) or 0
        if total_sessions > 0:
            charts.append({
                'type': 'bar',
                'title': 'Calibration Sessions Status',
                'data': {
                    'labels': ['Completed', 'Other'],
                    'values': [completed_sessions, max(total_sessions - completed_sessions, 0)],
                    'colors': ['#10b981', '#f59e0b']
                },
                'config': {'show_values': True, 'show_legend': False}
            })

        # Outliers count
        outlier_count = metrics.get('outlier_count', 0) or 0
        bias_count = metrics.get('inconsistent_manager_count', 0) or 0
        if outlier_count or bias_count:
            charts.append({
                'type': 'bar',
                'title': 'Calibration Flags',
                'data': {
                    'labels': ['Score Outliers', 'Manager Bias Flags'],
                    'values': [outlier_count, bias_count],
                    'colors': ['#ef4444', '#f59e0b']
                },
                'config': {'show_values': True, 'show_legend': False}
            })

        return charts

    # -------- reviews: PIP tracker ---------------------------------------

    def _reviews_pip_charts(self, data: Dict, config: Dict) -> List[Dict]:
        charts: List[Dict] = []

        pip = data.get('pip_tracker') or {}
        metrics = pip.get('metrics') or pip.get('summary') or {}
        if not metrics:
            return charts

        # Action item status pie
        completed = metrics.get('completed_action_items', 0) or 0
        in_progress = metrics.get('in_progress_action_items', 0) or 0
        pending = metrics.get('pending_action_items', 0) or 0
        missed = metrics.get('missed_action_items', 0) or 0
        if completed + in_progress + pending + missed > 0:
            charts.append({
                'type': 'pie',
                'title': 'PIP Action Item Status',
                'data': {
                    'labels': ['Completed', 'In Progress', 'Pending', 'Missed'],
                    'values': [completed, in_progress, pending, missed],
                    'colors': ['#10b981', '#3b82f6', '#f59e0b', '#ef4444']
                },
                'config': {'show_legend': True, 'show_percentage': True}
            })

        # PIP outcomes bar
        successful = metrics.get('successful_pips', 0) or 0
        failed = metrics.get('failed_pips', 0) or 0
        extended = metrics.get('extended_pips', 0) or 0
        terminated = metrics.get('terminated_pips', 0) or 0
        active = metrics.get('active_pips', 0) or 0
        if any(v for v in (successful, failed, extended, terminated, active)):
            charts.append({
                'type': 'bar',
                'title': 'PIP Outcomes',
                'data': {
                    'labels': ['Active', 'Successful', 'Extended', 'Failed', 'Terminated'],
                    'values': [active, successful, extended, failed, terminated],
                    'colors': ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
                },
                'config': {'show_values': True, 'show_legend': False}
            })

        # Trends line chart
        raw = pip.get('raw_data') or {}
        trends = raw.get('trends') or []
        if trends:
            charts.append({
                'type': 'line',
                'title': 'PIP Creations Trend',
                'data': {
                    'labels': [t.get('month', '') for t in trends],
                    'values': [t.get('created', 0) for t in trends],
                    'colors': ['#2563eb']
                },
                'config': {'show_area': True, 'smooth': True, 'show_legend': False}
            })

        return charts

    # ------------------------------------------------------------------
    # Shared helpers
    # ------------------------------------------------------------------

    def _get_color_range(self, count: int) -> List[str]:
        if count <= len(self.default_colors):
            return self.default_colors[:count]
        colors = []
        for i in range(count):
            colors.append(self.default_colors[i % len(self.default_colors)])
        return colors

    # ------------------------------------------------------------------
    # Renderers (unchanged)
    # ------------------------------------------------------------------

    def render_chartjs_config(self, chart_data: Dict) -> Dict:
        chart_type = chart_data.get('type', 'bar')
        data = chart_data.get('data', {})
        config = chart_data.get('config', {})
        labels = data.get('labels', [])
        values = data.get('values', [])
        colors = data.get('colors', self.default_colors)
        if chart_type == 'pie':
            return {
                'type': 'pie',
                'data': {
                    'labels': labels,
                    'datasets': [{
                        'data': values,
                        'backgroundColor': colors,
                        'borderWidth': 1
                    }]
                },
                'options': {
                    'responsive': config.get('responsive', True),
                    'plugins': {
                        'legend': {'display': config.get('show_legend', True)},
                        'tooltip': {'callbacks': {'label': 'function(context) { return context.label + ": " + context.parsed + "%"; }'}}
                    }
                }
            }
        elif chart_type == 'bar':
            return {
                'type': 'bar',
                'data': {
                    'labels': labels,
                    'datasets': [{
                        'label': 'Progress (%)',
                        'data': values,
                        'backgroundColor': colors,
                        'borderRadius': 4
                    }]
                },
                'options': {
                    'responsive': config.get('responsive', True),
                    'indexAxis': 'y' if config.get('horizontal', False) else 'x',
                    'plugins': {
                        'legend': {'display': config.get('show_legend', False)}
                    },
                    'scales': {
                        'y': {'beginAtZero': True, 'max': 100}
                    }
                }
            }
        elif chart_type == 'line':
            return {
                'type': 'line',
                'data': {
                    'labels': labels,
                    'datasets': [{
                        'label': 'Trend',
                        'data': values,
                        'borderColor': colors[0] if colors else '#2563eb',
                        'backgroundColor': colors[0] if colors else '#2563eb',
                        'fill': config.get('show_area', False),
                        'tension': 0.4 if config.get('smooth', True) else 0
                    }]
                },
                'options': {
                    'responsive': config.get('responsive', True),
                    'plugins': {
                        'legend': {'display': config.get('show_legend', False)}
                    },
                    'scales': {
                        'y': {'beginAtZero': True, 'max': 100}
                    }
                }
            }
        return {'type': chart_type, 'data': {'labels': labels, 'datasets': [{'data': values}]}}

    def render_highcharts_config(self, chart_data: Dict) -> Dict:
        chart_type = chart_data.get('type', 'bar')
        data = chart_data.get('data', {})
        config = chart_data.get('config', {})
        labels = data.get('labels', [])
        values = data.get('values', [])
        colors = data.get('colors', self.default_colors)
        chart_map = {
            'pie': 'pie',
            'bar': 'bar',
            'line': 'line',
            'area': 'area'
        }
        return {
            'chart': {'type': chart_map.get(chart_type, 'column')},
            'title': {'text': chart_data.get('title', '')},
            'xAxis': {'categories': labels},
            'yAxis': {'title': {'text': 'Value'}, 'min': 0},
            'series': [{
                'name': chart_data.get('title', 'Data'),
                'data': values,
                'color': colors[0] if colors else '#2563eb'
            }],
            'plotOptions': {
                'series': {
                    'dataLabels': {'enabled': config.get('show_values', False)}
                }
            },
            'credits': {'enabled': False}
        }

    # ------------------------------------------------------------------
    # Dashboard widgets (unchanged)
    # ------------------------------------------------------------------

    def prepare_dashboard_widget_data(self, widget_type: str, data: Dict) -> Dict:
        if widget_type == 'kpi':
            return self._prepare_kpi_widget(data)
        elif widget_type == 'chart':
            return self._prepare_chart_widget(data)
        elif widget_type == 'table':
            return self._prepare_table_widget(data)
        elif widget_type == 'heatmap':
            return self._prepare_heatmap_widget(data)
        elif widget_type == 'gauge':
            return self._prepare_gauge_widget(data)
        else:
            return {'data': data}

    def _prepare_kpi_widget(self, data: Dict) -> Dict:
        summary = data.get('summary', {})
        return {
            'type': 'kpi',
            'data': {
                'total': summary.get('total', 0),
                'on_track': summary.get('on_track', 0),
                'at_risk': summary.get('at_risk', 0),
                'off_track': summary.get('off_track', 0),
                'completion_rate': summary.get('completion_rate', 0)
            }
        }

    def _prepare_chart_widget(self, data: Dict) -> Dict:
        kpis = data.get('kpis', [])
        if not kpis:
            return {'type': 'chart', 'data': {}}
        return self._prepare_status_chart(kpis, {})

    def _prepare_table_widget(self, data: Dict) -> Dict:
        kpis = data.get('kpis', [])
        return {
            'type': 'table',
            'data': {
                'columns': ['Name', 'Progress', 'Status', 'Department'],
                'rows': [
                    [k.get('name', ''), k.get('progress', 0), k.get('status', ''), k.get('department', '')]
                    for k in kpis[:20]
                ]
            }
        }

    def _prepare_heatmap_widget(self, data: Dict) -> Dict:
        dept_data = data.get('aggregations', {}).get('by_department', {})
        dept_names = list(dept_data.keys())
        values = [d.get('avg_progress', 0) for d in dept_data.values()]
        return {
            'type': 'heatmap',
            'data': {
                'labels': dept_names,
                'values': values,
                'min': 0,
                'max': 100
            }
        }

    def _prepare_gauge_widget(self, data: Dict) -> Dict:
        summary = data.get('summary', {})
        completion = summary.get('completion_rate', 0)
        return {
            'type': 'gauge',
            'data': {
                'value': completion,
                'min': 0,
                'max': 100,
                'target': 80,
                'thresholds': {'low': 50, 'medium': 80}
            }
        }