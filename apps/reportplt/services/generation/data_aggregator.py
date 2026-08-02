# apps/reportplt/services/generation/data_aggregator.py
from typing import Dict, Any, List, Optional
from collections import defaultdict
from django.db.models import Avg, Sum, Count, Min, Max
from datetime import datetime

class DataAggregator:
    def __init__(self):
        self.groupings = {}
        self.calculations = {}

    def aggregate_kpi_data(self, data: Dict) -> Dict[str, Any]:
        kpis = data.get('kpis', [])
        if not kpis:
            return data
        summary = {
            'total': len(kpis),
            'on_track': sum(1 for k in kpis if k.get('status') == 'On Track'),
            'at_risk': sum(1 for k in kpis if k.get('status') == 'At Risk'),
            'off_track': sum(1 for k in kpis if k.get('status') == 'Off Track'),
            'pending': sum(1 for k in kpis if k.get('status') == 'Pending'),
            'avg_progress': sum(k.get('progress', 0) for k in kpis) / len(kpis) if kpis else 0,
            'max_progress': max((k.get('progress', 0) for k in kpis), default=0),
            'min_progress': min((k.get('progress', 0) for k in kpis), default=0),
            'total_target': sum(k.get('target', 0) for k in kpis),
            'total_actual': sum(k.get('actual', 0) for k in kpis)
        }
        summary['completion_rate'] = round(
            (summary['on_track'] + summary['at_risk']) / summary['total'] * 100, 2
        ) if summary['total'] > 0 else 0
        by_department = self._group_by(kpis, 'department')
        by_category = self._group_by(kpis, 'category')
        by_status = self._group_by(kpis, 'status')
        return {
            **data,
            'summary': summary,
            'aggregations': {
                'by_department': by_department,
                'by_category': by_category,
                'by_status': by_status
            }
        }

    def aggregate_departmental_data(self, data: Dict) -> Dict[str, Any]:
        kpis = data.get('kpis', [])
        if not kpis:
            return data
        dept_stats = defaultdict(lambda: {'count': 0, 'progress': 0, 'on_track': 0, 'at_risk': 0, 'off_track': 0})
        for kpi in kpis:
            dept = kpi.get('department', 'Unassigned')
            dept_stats[dept]['count'] += 1
            dept_stats[dept]['progress'] += kpi.get('progress', 0)
            status = kpi.get('status', '')
            if status == 'On Track':
                dept_stats[dept]['on_track'] += 1
            elif status == 'At Risk':
                dept_stats[dept]['at_risk'] += 1
            elif status == 'Off Track':
                dept_stats[dept]['off_track'] += 1
        for dept, stats in dept_stats.items():
            stats['avg_progress'] = round(stats['progress'] / stats['count'], 2) if stats['count'] > 0 else 0
            stats['completion_rate'] = round(
                (stats['on_track'] + stats['at_risk']) / stats['count'] * 100, 2
            ) if stats['count'] > 0 else 0
        return {
            **data,
            'department_summary': dict(dept_stats),
            'department_count': len(dept_stats)
        }

    def aggregate_executive_data(self, data: Dict) -> Dict[str, Any]:
        result = self.aggregate_kpi_data(data)
        summary = result.get('summary', {})
        if data.get('type') == 'combined':
            kpi_summary = data.get('kpi', {}).get('summary', {})
            review_count = data.get('reviews', {}).get('count', 0)
            task_count = data.get('tasks', {}).get('count', 0)
            pip_count = data.get('pips', {}).get('count', 0)
            summary['review_count'] = review_count
            summary['task_count'] = task_count
            summary['pip_count'] = pip_count
            summary['total_items'] = summary.get('total', 0) + review_count + task_count + pip_count
        return result

    def aggregate_trend_data(self, data: Dict) -> Dict[str, Any]:
        kpis = data.get('kpis', [])
        if not kpis:
            return data
        period_data = defaultdict(list)
        for kpi in kpis:
            period = kpi.get('period', '')
            if period:
                period_data[period].append(kpi.get('progress', 0))
        trend = []
        for period, values in sorted(period_data.items()):
            trend.append({
                'period': period,
                'avg_progress': sum(values) / len(values) if values else 0,
                'count': len(values),
                'max': max(values) if values else 0,
                'min': min(values) if values else 0
            })
        return {
            **data,
            'trend': trend,
            'trend_summary': {
                'periods': len(trend),
                'avg_trend': sum(t['avg_progress'] for t in trend) / len(trend) if trend else 0
            }
        }

    def aggregate_comparative_data(self, data: Dict) -> Dict[str, Any]:
        kpis = data.get('kpis', [])
        if not kpis:
            return data
        by_department = self._group_by(kpis, 'department')
        by_category = self._group_by(kpis, 'category')
        rankings = sorted(kpis, key=lambda x: x.get('progress', 0), reverse=True)
        return {
            **data,
            'comparisons': {
                'by_department': by_department,
                'by_category': by_category,
                'top_performers': rankings[:10],
                'bottom_performers': rankings[-10:] if len(rankings) > 10 else rankings,
                'average_score': sum(k.get('progress', 0) for k in kpis) / len(kpis) if kpis else 0
            }
        }

    def aggregate_configs_data(self, data: Dict) -> Dict[str, Any]:
        summary = data.get('summary', {})
        backup_summary = data.get('backup', {}).get('summary', {})
        dr_summary = data.get('disaster_recovery', {}).get('summary', {})
        health_summary = data.get('health', {}).get('summary', {})
        maintenance_summary = data.get('maintenance', {}).get('summary', {})
        security_summary = data.get('security', {}).get('summary', {})
        
        combined_summary = {
            **summary,
            'backup_success_rate': backup_summary.get('success_rate', 0.0),
            'total_backup_original_gb': backup_summary.get('total_original_gb', 0.0),
            'total_backup_compressed_gb': backup_summary.get('total_compressed_gb', 0.0),
            'dr_drill_pass_rate': dr_summary.get('drill_pass_rate', 0.0),
            'avg_achieved_rto_minutes': dr_summary.get('avg_achieved_rto_minutes', 0.0),
            'avg_achieved_rpo_minutes': dr_summary.get('avg_achieved_rpo_minutes', 0.0),
            'platform_uptime_percent': health_summary.get('uptime_percent', 0.0),
            'avg_latency_ms': health_summary.get('avg_latency_ms', 0.0),
            'total_downtime_minutes': maintenance_summary.get('total_downtime_minutes', 0.0),
            'keys_needing_rotation': security_summary.get('keys_needing_rotation', 0),
        }
        return {
            **data,
            'summary': combined_summary
        }

    def aggregate_tenant_data(self, data: Dict) -> Dict[str, Any]:
        summary = data.get('summary', {})
        lifecycle_summary = data.get('lifecycle', {}).get('summary', {})
        quota_summary = data.get('quota', {}).get('summary', {})
        schema_summary = data.get('schema', {}).get('summary', {})
        domain_summary = data.get('domain', {}).get('summary', {})
        backup_summary = data.get('backup', {}).get('summary', {})

        combined_summary = {
            **summary,
            'total_organizations': lifecycle_summary.get('total_organizations', 0),
            'active_organizations': lifecycle_summary.get('active_organizations', 0),
            'onboarding_rate': lifecycle_summary.get('onboarding_rate', 0.0),
            'exceeded_quota_resources': quota_summary.get('exceeded_count', 0),
            'total_schema_size_mb': schema_summary.get('total_size_mb', 0.0),
            'active_schemas': schema_summary.get('active_schemas', 0),
            'ssl_expiring_soon': domain_summary.get('ssl_expiring_in_30_days', 0),
            'tenant_backup_success_rate': backup_summary.get('success_rate', 0.0),
        }
        return {
            **data,
            'summary': combined_summary
        }

    def aggregate_kpi_engine_data(self, data: Dict) -> Dict[str, Any]:
        summary = data.get('summary', {})
        indiv_summary = data.get('individual', {}).get('summary', {})
        dept_summary = data.get('departmental', {}).get('summary', {})
        cascade_summary = data.get('cascade', {}).get('summary', {})
        red_summary = data.get('red_alerts', {}).get('summary', {})
        comp_summary = data.get('compliance', {}).get('summary', {})

        combined_summary = {
            **summary,
            'average_organization_score': indiv_summary.get('average_organization_score', 0.0),
            'total_departments': dept_summary.get('total_departments', 0),
            'total_cascade_mappings': cascade_summary.get('total_cascade_mappings', 0),
            'total_red_alerts': red_summary.get('total_red_alerts', 0),
            'approval_rate': comp_summary.get('approval_rate', 0.0),
        }
        return {
            **data,
            'summary': combined_summary
        }

    def aggregate_structure_data(self, data: Dict) -> Dict[str, Any]:
        summary = data.get('summary', {})
        chart_summary = data.get('org_chart', {}).get('summary', {})
        span_summary = data.get('span_of_control', {}).get('summary', {})
        interim_summary = data.get('interim_delegation', {}).get('summary', {})
        cost_summary = data.get('cost_center_allocation', {}).get('summary', {})

        combined_summary = {
            **summary,
            'total_divisions': chart_summary.get('total_divisions', 0),
            'total_departments': chart_summary.get('total_departments', 0),
            'total_active_employees': chart_summary.get('total_active_employees', 0),
            'total_managers': span_summary.get('total_managers', 0),
            'overloaded_managers_count': span_summary.get('overloaded_managers_count', 0),
            'active_interim_assignments': interim_summary.get('total_active_interim_assignments', 0),
            'total_budget_allocated': cost_summary.get('total_budget_allocated', 0.0),
        }
        return {
            **data,
            'summary': combined_summary
        }

    def aggregate_generic_data(self, data: Dict) -> Dict[str, Any]:
        if data.get('source') == 'configs':
            return self.aggregate_configs_data(data)
        if data.get('source') == 'tenant' or 'lifecycle' in data:
            return self.aggregate_tenant_data(data)
        if data.get('source') == 'kpi' or 'individual' in data:
            return self.aggregate_kpi_engine_data(data)
        if data.get('source') == 'structure' or 'org_chart' in data:
            return self.aggregate_structure_data(data)
        if data.get('source') == 'accounts' or 'user_directory' in data:
            return self.aggregate_accounts_data(data)
        if data.get('source') == 'billing' or 'subscription_summary' in data:
            return self.aggregate_billing_data(data)
        if data.get('source') == 'reviews' or 'individual_summary' in data:
            return self.aggregate_reviews_data(data)
        if 'kpis' in data:
            return self.aggregate_kpi_data(data)
        return data

    def aggregate_accounts_data(self, data: Dict) -> Dict[str, Any]:
        summary = data.get('summary', {})
        user_summary = data.get('user_directory', {}).get('summary', {})
        mfa_summary = data.get('mfa_compliance', {}).get('summary', {})
        login_summary = data.get('login_security', {}).get('summary', {})
        session_summary = data.get('session_activity', {}).get('summary', {})
        password_summary = data.get('password_hygiene', {}).get('summary', {})
        anomaly_summary = data.get('security_anomalies', {}).get('summary', {})
        audit_summary = data.get('audit_trail', {}).get('summary', {})
        role_summary = data.get('role_permission', {}).get('summary', {})

        total_users = user_summary.get('total_users', 0)
        mfa_rate = mfa_summary.get('mfa_adoption_rate', 0.0)
        login_success = login_summary.get('success_rate', 0.0)

        security_score = 0.0
        if total_users > 0:
            security_score = round(
                (mfa_rate * 0.40) +
                (login_success * 0.30) +
                (max(0, 100 - anomaly_summary.get('anomalous_users_count', 0)) * 0.15) +
                (max(0, 100 - password_summary.get('age_buckets', {}).get('over_90_days', 0) / max(total_users, 1) * 100) * 0.15),
                2
            )

        aggregated_summary = {
            **summary,
            'security_score': security_score,
            'total_roles_defined': role_summary.get('total_roles_defined', 0),
            'total_permissions': role_summary.get('total_system_permissions', 0),
            'role_changes_last_30d': role_summary.get('role_changes_last_30d', 0),
        }

        return {
            **data,
            'summary': aggregated_summary,
        }

    def aggregate_billing_data(self, data: Dict) -> Dict[str, Any]:
        summary = data.get('summary', {})
        sub_summary = data.get('subscription_summary', {}).get('summary', {})
        rev_summary = data.get('revenue_financial', {}).get('summary', {})
        tx_summary = data.get('payment_transactions', {}).get('summary', {})
        usage_summary = data.get('usage_quota', {}).get('summary', {})
        dunning_summary = data.get('dunning_recovery', {}).get('summary', {})

        payment_rate = rev_summary.get('payment_rate_pct', 0.0)
        recovery_rate = dunning_summary.get('recovery_rate_pct', 0.0)
        total_subs = sub_summary.get('total_subscriptions', 0)
        active_subs = sub_summary.get('active_count', 0)
        active_ratio = (active_subs / max(total_subs, 1)) * 100

        health_score = round(
            (payment_rate * 0.35) +
            (recovery_rate * 0.25) +
            (active_ratio * 0.20) +
            (max(0, 100 - usage_summary.get('alert_100_breached_count', 0)) * 0.20),
            2
        )

        aggregated_summary = {
            **summary,
            'financial_health_score': health_score,
            'mrr': sub_summary.get('mrr', 0.0),
            'arr': sub_summary.get('arr', 0.0),
            'gross_revenue': rev_summary.get('gross_revenue', 0.0),
            'net_revenue': rev_summary.get('net_revenue', 0.0),
            'vat_tax_collected': rev_summary.get('vat_tax_collected', 0.0),
            'outstanding_amount': rev_summary.get('outstanding_amount', 0.0),
            'transaction_success_rate': tx_summary.get('success_rate_pct', 0.0),
        }

        return {
            **data,
            'summary': aggregated_summary,
        }

    def aggregate_reviews_data(self, data: Dict) -> Dict[str, Any]:
        summary = data.get('summary', {})
        comp_summary = data.get('cycle_compliance', {}).get('summary', {})
        perf_summary = data.get('organization_performance', {}).get('summary', {})
        cal_summary = data.get('calibration_impact', {}).get('summary', {})
        pip_summary = data.get('pip_tracker', {}).get('summary', {})

        completion_pct = comp_summary.get('overall_completion_rate_pct', 0.0)
        perf_score = perf_summary.get('avg_overall_score', 0.0)
        pip_recovery_pct = pip_summary.get('pip_success_rate_pct', 0.0)

        talent_health_score = round(
            (completion_pct * 0.30) +
            (perf_score * 0.30) +
            (pip_recovery_pct * 0.20) +
            (max(0, 100 - pip_summary.get('active_pips', 0) * 5) * 0.20),
            2
        )

        aggregated_summary = {
            **summary,
            'talent_health_score': talent_health_score,
            'overall_completion_rate_pct': completion_pct,
            'avg_overall_score': perf_score,
            'avg_kpi_score': perf_summary.get('avg_kpi_score', 0.0),
            'avg_competency_score': perf_summary.get('avg_competency_score', 0.0),
            'active_pips_count': pip_summary.get('active_pips', 0),
            'pip_success_rate_pct': pip_recovery_pct,
            'calibration_adjustments_count': cal_summary.get('total_adjustments_made', 0),
        }

        return {
            **data,
            'summary': aggregated_summary,
        }

    def _group_by(self, items: List[Dict], key: str) -> Dict[str, Any]:
        grouped = defaultdict(list)
        for item in items:
            value = item.get(key, 'Unknown')
            grouped[value].append(item)
        result = {}
        for group, items_list in grouped.items():
            result[group] = {
                'count': len(items_list),
                'progress': sum(i.get('progress', 0) for i in items_list),
                'avg_progress': sum(i.get('progress', 0) for i in items_list) / len(items_list) if items_list else 0
            }
        return result

    def aggregate_by_field(self, data: List[Dict], field: str, agg_type: str = 'sum') -> Dict:
        result = defaultdict(float)
        for item in data:
            key = item.get(field, 'Unknown')
            value = item.get('value', 0)
            if agg_type == 'sum':
                result[key] += value
            elif agg_type == 'count':
                result[key] += 1
            elif agg_type == 'avg':
                result[key] = (result.get(key, 0) + value) / 2
        return dict(result)

    def aggregate_time_series(self, data: List[Dict], date_field: str, value_field: str) -> List[Dict]:
        time_series = defaultdict(list)
        for item in data:
            date = item.get(date_field)
            if date:
                time_series[date].append(item.get(value_field, 0))
        return [
            {'date': date, 'avg': sum(vals) / len(vals), 'sum': sum(vals), 'count': len(vals)}
            for date, vals in sorted(time_series.items())
        ]