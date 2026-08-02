# apps/reportplt/services/templates/prebuilt_templates.py
import json
from typing import Dict, Any, List, Optional
from django.db import transaction
from apps.reportplt.models import ReportTemplate
from apps.reportplt.constants import ReportType, TemplateType, SectorType, ReportCategory, WidgetType

class PrebuiltTemplates:
    def __init__(self):
        self.templates = self._get_prebuilt_templates()

    def _get_prebuilt_templates(self) -> List[Dict[str, Any]]:
        return [
            self._executive_dashboard(),
            self._departmental_scorecard(),
            self._kpi_report(),
            self._mission_status_report(),
            self._compliance_report(),
            self._trend_analysis(),
            self._comparative_analysis(),
            self._pip_report(),
            self._ngo_impact_report(),
            self._commercial_performance_report(),
            self._public_sector_service_report(),
            self._backup_execution_report_template(),
            self._dr_compliance_report_template(),
            self._health_sla_report_template(),
            self._maintenance_audit_report_template(),
            self._kms_security_report_template(),
            self._system_audit_report_template(),
            self._tenant_quota_report_template(),
            self._risk_matrix_report_template(),
            self._tenant_lifecycle_report_template(),
            self._tenant_quota_breach_report_template(),
            self._tenant_schema_health_report_template(),
            self._tenant_domain_ssl_report_template(),
            self._tenant_backup_report_template(),
            self._tenant_executive_report_template(),
            self._kpi_individual_scorecard_template(),
            self._kpi_departmental_heatmap_template(),
            self._kpi_cascade_tree_template(),
            self._kpi_red_alerts_template(),
            self._kpi_validation_compliance_template(),
            self._kpi_executive_summary_template(),
            self._structure_org_chart_template(),
            self._structure_span_of_control_template(),
            self._structure_interim_delegation_template(),
            self._structure_cost_center_allocation_template(),
            self._structure_security_sensitivity_template(),
            self._structure_executive_summary_template(),
            self._accounts_user_directory_template(),
            self._accounts_login_security_template(),
            self._accounts_mfa_compliance_template(),
            self._accounts_audit_trail_template(),
            self._accounts_role_permission_audit_template(),
            self._accounts_session_activity_template(),
            self._accounts_password_hygiene_template(),
            self._accounts_security_anomalies_template(),
            self._accounts_executive_summary_template(),
            self._billing_subscription_summary_template(),
            self._billing_revenue_financial_template(),
            self._billing_payment_transactions_template(),
            self._billing_usage_quota_audit_template(),
            self._billing_dunning_recovery_template(),
            self._billing_executive_summary_template(),
            self._reviews_individual_summary_template(),
            self._reviews_cycle_compliance_template(),
            self._reviews_organization_performance_template(),
            self._reviews_calibration_impact_template(),
            self._reviews_pip_tracker_template(),
            self._reviews_executive_summary_template(),
        ]

    def _executive_dashboard(self) -> Dict[str, Any]:
        return {
            'name': 'Executive Dashboard',
            'description': 'Comprehensive executive dashboard with key performance indicators, trends, and strategic insights',
            'template_type': TemplateType.EXECUTIVE,
            'category': ReportCategory.STRATEGIC,
            'sector': SectorType.ALL,
            'is_system': True,
            'is_published': True,
            'is_default': True,
            'is_popular': True,
            'has_prebuilt_charts': True,
            'has_dynamic_filters': True,
            'has_parameters': True,
            'layout_config': {
                'grid_columns': 12,
                'row_height': 100,
                'spacing': 10,
                'sections': ['overview', 'performance', 'trends', 'alerts']
            },
            'widget_config': {
                'widgets': [
                    {'type': WidgetType.KPI, 'title': 'Overall Performance', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Revenue vs Target', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Staff Utilization', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Client Satisfaction', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.CHART, 'title': 'Performance Trend', 'size': {'w': 6, 'h': 4}},
                    {'type': WidgetType.TABLE, 'title': 'Department Performance', 'size': {'w': 6, 'h': 4}},
                    {'type': WidgetType.HEATMAP, 'title': 'Department Heatmap', 'size': {'w': 6, 'h': 4}},
                    {'type': WidgetType.TREND, 'title': 'YoY Growth', 'size': {'w': 6, 'h': 4}},
                ]
            },
            'filter_config': {
                'filters': [
                    {'name': 'date_range', 'type': 'date_range', 'label': 'Date Range'},
                    {'name': 'department', 'type': 'dropdown', 'label': 'Department', 'multiple': True},
                    {'name': 'kpi_type', 'type': 'dropdown', 'label': 'KPI Type'},
                ]
            },
            'parameter_config': {
                'parameters': [
                    {'name': 'period', 'type': 'string', 'default': 'monthly', 'required': True},
                    {'name': 'year', 'type': 'number', 'default': 2026, 'required': True},
                ]
            },
            'chart_config': {
                'default_chart_type': 'line',
                'colors': ['#2563eb', '#10b981', '#f59e0b', '#ef4444'],
                'show_legend': True,
                'show_tooltip': True,
            },
            'table_config': {
                'responsive': True,
                'striped': True,
                'bordered': True,
                'hover': True,
                'sortable': True,
            },
            'style_config': {
                'theme': 'light',
                'font_family': 'Arial',
                'primary_color': '#2563eb',
                'secondary_color': '#64748b',
                'background_color': '#ffffff',
            },
            'export_config': {
                'formats': ['pdf', 'excel', 'pptx'],
                'include_watermark': True,
                'page_size': 'A4',
                'orientation': 'landscape',
            },
            'applicable_industries': ['all'],
            'org_size': 0,
        }

    def _departmental_scorecard(self) -> Dict[str, Any]:
        return {
            'name': 'Departmental Scorecard',
            'description': 'Department-level performance scorecard with KPIs, targets, and achievement status',
            'template_type': TemplateType.DEPARTMENTAL,
            'category': ReportCategory.OPERATIONAL,
            'sector': SectorType.ALL,
            'is_system': True,
            'is_published': True,
            'is_default': True,
            'is_popular': True,
            'has_prebuilt_charts': True,
            'has_dynamic_filters': True,
            'has_parameters': True,
            'layout_config': {
                'grid_columns': 12,
                'row_height': 100,
                'spacing': 10,
                'sections': ['overview', 'kpi_details', 'trends']
            },
            'widget_config': {
                'widgets': [
                    {'type': WidgetType.SUMMARY, 'title': 'Department Summary', 'size': {'w': 12, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Target Achievement', 'size': {'w': 4, 'h': 3}},
                    {'type': WidgetType.KPI, 'title': 'Overall Score', 'size': {'w': 4, 'h': 3}},
                    {'type': WidgetType.KPI, 'title': 'On Track KPIs', 'size': {'w': 4, 'h': 3}},
                    {'type': WidgetType.BAR, 'title': 'KPI Performance', 'size': {'w': 6, 'h': 4}},
                    {'type': WidgetType.TABLE, 'title': 'KPI Details', 'size': {'w': 6, 'h': 4}},
                    {'type': WidgetType.GAUGE, 'title': 'Progress Gauge', 'size': {'w': 4, 'h': 3}},
                    {'type': WidgetType.LIST, 'title': 'Action Items', 'size': {'w': 4, 'h': 3}},
                    {'type': WidgetType.MISSION, 'title': 'Mission Status', 'size': {'w': 4, 'h': 3}},
                ]
            },
            'filter_config': {
                'filters': [
                    {'name': 'date_range', 'type': 'date_range', 'label': 'Date Range'},
                    {'name': 'department', 'type': 'dropdown', 'label': 'Department', 'required': True},
                    {'name': 'team', 'type': 'dropdown', 'label': 'Team', 'multiple': True},
                ]
            },
            'parameter_config': {
                'parameters': [
                    {'name': 'department_id', 'type': 'string', 'required': True},
                    {'name': 'period', 'type': 'string', 'default': 'monthly'},
                ]
            },
            'chart_config': {
                'default_chart_type': 'bar',
                'colors': ['#2563eb', '#10b981', '#f59e0b', '#ef4444'],
                'show_values': True,
            },
            'table_config': {
                'responsive': True,
                'striped': True,
                'bordered': True,
                'sortable': True,
                'show_footer': True,
            },
            'style_config': {
                'theme': 'light',
                'font_family': 'Arial',
                'primary_color': '#2563eb',
            },
            'export_config': {
                'formats': ['pdf', 'excel'],
                'include_watermark': True,
                'page_size': 'A4',
            },
            'applicable_industries': ['all'],
            'org_size': 0,
        }

    def _kpi_report(self) -> Dict[str, Any]:
        return {
            'name': 'KPI Performance Report',
            'description': 'Detailed KPI performance report with targets, actuals, and variance analysis',
            'template_type': TemplateType.KPI,
            'category': ReportCategory.OPERATIONAL,
            'sector': SectorType.ALL,
            'is_system': True,
            'is_published': True,
            'is_default': True,
            'is_popular': True,
            'has_prebuilt_charts': True,
            'has_dynamic_filters': True,
            'has_parameters': True,
            'layout_config': {
                'grid_columns': 12,
                'row_height': 100,
                'spacing': 10,
                'sections': ['summary', 'details', 'trends']
            },
            'widget_config': {
                'widgets': [
                    {'type': WidgetType.KPI, 'title': 'Total KPIs', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'On Track', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'At Risk', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Off Track', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.TABLE, 'title': 'KPI Details', 'size': {'w': 12, 'h': 5}},
                    {'type': WidgetType.CHART, 'title': 'KPI Distribution', 'size': {'w': 6, 'h': 4}},
                    {'type': WidgetType.TREND, 'title': 'Performance Trend', 'size': {'w': 6, 'h': 4}},
                    {'type': WidgetType.HEATMAP, 'title': 'KPI Heatmap', 'size': {'w': 6, 'h': 4}},
                    {'type': WidgetType.PIE, 'title': 'Status Distribution', 'size': {'w': 6, 'h': 4}},
                ]
            },
            'filter_config': {
                'filters': [
                    {'name': 'date_range', 'type': 'date_range', 'label': 'Date Range'},
                    {'name': 'kpi_type', 'type': 'dropdown', 'label': 'KPI Type'},
                    {'name': 'status', 'type': 'multi_select', 'label': 'Status', 'options': ['On Track', 'At Risk', 'Off Track']},
                    {'name': 'department', 'type': 'dropdown', 'label': 'Department', 'multiple': True},
                ]
            },
            'parameter_config': {
                'parameters': [
                    {'name': 'period', 'type': 'string', 'default': 'monthly'},
                    {'name': 'year', 'type': 'number', 'default': 2026},
                ]
            },
            'chart_config': {
                'default_chart_type': 'bar',
                'colors': ['#10b981', '#f59e0b', '#ef4444'],
            },
            'table_config': {
                'responsive': True,
                'striped': True,
                'bordered': True,
                'sortable': True,
            },
            'style_config': {
                'theme': 'light',
                'font_family': 'Arial',
            },
            'export_config': {
                'formats': ['pdf', 'excel', 'csv'],
                'page_size': 'A4',
                'orientation': 'landscape',
            },
            'applicable_industries': ['all'],
            'org_size': 0,
        }

    def _mission_status_report(self) -> Dict[str, Any]:
        return {
            'name': 'Mission Status Report',
            'description': 'Strategic mission status report with performance analysis, challenges, and action plans',
            'template_type': TemplateType.MISSION,
            'category': ReportCategory.STRATEGIC,
            'sector': SectorType.ALL,
            'is_system': True,
            'is_published': True,
            'is_default': True,
            'is_popular': True,
            'has_prebuilt_charts': False,
            'has_dynamic_filters': True,
            'has_parameters': True,
            'layout_config': {
                'grid_columns': 12,
                'row_height': 100,
                'spacing': 10,
                'sections': ['executive_summary', 'kpi_status', 'challenges', 'action_plans']
            },
            'widget_config': {
                'widgets': [
                    {'type': WidgetType.SUMMARY, 'title': 'Executive Summary', 'size': {'w': 12, 'h': 2}},
                    {'type': WidgetType.MISSION, 'title': 'Mission Status', 'size': {'w': 12, 'h': 4}},
                    {'type': WidgetType.KPI, 'title': 'Overall Score', 'size': {'w': 4, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'KPIs On Track', 'size': {'w': 4, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'KPIs At Risk', 'size': {'w': 4, 'h': 2}},
                    {'type': WidgetType.TABLE, 'title': 'KPI Status', 'size': {'w': 12, 'h': 4}},
                    {'type': WidgetType.LIST, 'title': 'Key Challenges', 'size': {'w': 6, 'h': 3}},
                    {'type': WidgetType.LIST, 'title': 'Action Plans', 'size': {'w': 6, 'h': 3}},
                ]
            },
            'filter_config': {
                'filters': [
                    {'name': 'date_range', 'type': 'date_range', 'label': 'Date Range'},
                    {'name': 'department', 'type': 'dropdown', 'label': 'Department'},
                ]
            },
            'parameter_config': {
                'parameters': [
                    {'name': 'period', 'type': 'string', 'default': 'monthly'},
                    {'name': 'year', 'type': 'number', 'default': 2026},
                ]
            },
            'style_config': {
                'theme': 'light',
                'font_family': 'Arial',
            },
            'export_config': {
                'formats': ['pdf', 'pptx'],
                'page_size': 'A4',
                'orientation': 'portrait',
            },
            'applicable_industries': ['all'],
            'org_size': 0,
        }

    def _compliance_report(self) -> Dict[str, Any]:
        return {
            'name': 'Compliance Report',
            'description': 'Compliance status report with regulatory requirements tracking and risk assessment',
            'template_type': TemplateType.COMPLIANCE,
            'category': ReportCategory.COMPLIANCE,
            'sector': SectorType.ALL,
            'is_system': True,
            'is_published': True,
            'is_default': True,
            'is_popular': True,
            'has_prebuilt_charts': True,
            'has_dynamic_filters': True,
            'has_parameters': True,
            'layout_config': {
                'grid_columns': 12,
                'row_height': 100,
                'spacing': 10,
                'sections': ['overview', 'compliance_details', 'risk_assessment']
            },
            'widget_config': {
                'widgets': [
                    {'type': WidgetType.KPI, 'title': 'Compliance Rate', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Compliant', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Non-Compliant', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'At Risk', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.COMPLIANCE, 'title': 'Compliance Status', 'size': {'w': 12, 'h': 4}},
                    {'type': WidgetType.TABLE, 'title': 'Compliance Details', 'size': {'w': 12, 'h': 4}},
                    {'type': WidgetType.PIE, 'title': 'Compliance Distribution', 'size': {'w': 6, 'h': 4}},
                    {'type': WidgetType.HEATMAP, 'title': 'Risk Assessment', 'size': {'w': 6, 'h': 4}},
                ]
            },
            'filter_config': {
                'filters': [
                    {'name': 'date_range', 'type': 'date_range', 'label': 'Date Range'},
                    {'name': 'compliance_type', 'type': 'dropdown', 'label': 'Compliance Type'},
                    {'name': 'status', 'type': 'multi_select', 'label': 'Status', 'options': ['Compliant', 'Non-Compliant', 'At Risk']},
                ]
            },
            'parameter_config': {
                'parameters': [
                    {'name': 'period', 'type': 'string', 'default': 'quarterly'},
                    {'name': 'year', 'type': 'number', 'default': 2026},
                ]
            },
            'export_config': {
                'formats': ['pdf', 'excel'],
                'page_size': 'A4',
                'orientation': 'landscape',
            },
            'applicable_industries': ['financial', 'healthcare', 'government'],
            'org_size': 0,
        }

    def _trend_analysis(self) -> Dict[str, Any]:
        return {
            'name': 'Trend Analysis Report',
            'description': 'Comprehensive trend analysis with month-over-month and year-over-year comparisons',
            'template_type': TemplateType.TREND,
            'category': ReportCategory.OPERATIONAL,
            'sector': SectorType.ALL,
            'is_system': True,
            'is_published': True,
            'is_default': True,
            'is_popular': True,
            'has_prebuilt_charts': True,
            'has_dynamic_filters': True,
            'has_parameters': True,
            'layout_config': {
                'grid_columns': 12,
                'row_height': 100,
                'spacing': 10,
                'sections': ['overview', 'detailed_trends']
            },
            'widget_config': {
                'widgets': [
                    {'type': WidgetType.KPI, 'title': 'MoM Growth', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'YoY Growth', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Average Trend', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Volatility', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.TREND, 'title': 'Trend Overview', 'size': {'w': 12, 'h': 4}},
                    {'type': WidgetType.LINE, 'title': 'Historical Trend', 'size': {'w': 6, 'h': 4}},
                    {'type': WidgetType.AREA, 'title': 'Cumulative Trend', 'size': {'w': 6, 'h': 4}},
                    {'type': WidgetType.TABLE, 'title': 'Trend Data', 'size': {'w': 12, 'h': 4}},
                ]
            },
            'filter_config': {
                'filters': [
                    {'name': 'date_range', 'type': 'date_range', 'label': 'Date Range'},
                    {'name': 'metric', 'type': 'dropdown', 'label': 'Metric'},
                    {'name': 'granularity', 'type': 'dropdown', 'label': 'Granularity', 'options': ['Daily', 'Weekly', 'Monthly', 'Quarterly']},
                ]
            },
            'parameter_config': {
                'parameters': [
                    {'name': 'period', 'type': 'string', 'default': 'monthly'},
                    {'name': 'years_back', 'type': 'number', 'default': 3},
                ]
            },
            'export_config': {
                'formats': ['pdf', 'excel', 'pptx'],
                'page_size': 'A4',
                'orientation': 'landscape',
            },
            'applicable_industries': ['all'],
            'org_size': 0,
        }

    def _comparative_analysis(self) -> Dict[str, Any]:
        return {
            'name': 'Comparative Analysis Report',
            'description': 'Comparative analysis across departments, teams, and individuals',
            'template_type': TemplateType.COMPARATIVE,
            'category': ReportCategory.OPERATIONAL,
            'sector': SectorType.ALL,
            'is_system': True,
            'is_published': True,
            'is_default': True,
            'is_popular': True,
            'has_prebuilt_charts': True,
            'has_dynamic_filters': True,
            'has_parameters': True,
            'layout_config': {
                'grid_columns': 12,
                'row_height': 100,
                'spacing': 10,
                'sections': ['overview', 'comparisons', 'rankings']
            },
            'widget_config': {
                'widgets': [
                    {'type': WidgetType.KPI, 'title': 'Highest Performer', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Lowest Performer', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Average Score', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Range', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.BAR, 'title': 'Comparison Bar Chart', 'size': {'w': 6, 'h': 4}},
                    {'type': WidgetType.SCATTER, 'title': 'Performance Scatter', 'size': {'w': 6, 'h': 4}},
                    {'type': WidgetType.TABLE, 'title': 'Rankings Table', 'size': {'w': 12, 'h': 4}},
                    {'type': WidgetType.HEATMAP, 'title': 'Comparison Heatmap', 'size': {'w': 12, 'h': 4}},
                ]
            },
            'filter_config': {
                'filters': [
                    {'name': 'date_range', 'type': 'date_range', 'label': 'Date Range'},
                    {'name': 'compare_by', 'type': 'dropdown', 'label': 'Compare By', 'options': ['Department', 'Team', 'Individual', 'KPI']},
                    {'name': 'metric', 'type': 'dropdown', 'label': 'Metric'},
                ]
            },
            'parameter_config': {
                'parameters': [
                    {'name': 'period', 'type': 'string', 'default': 'monthly'},
                    {'name': 'year', 'type': 'number', 'default': 2026},
                ]
            },
            'export_config': {
                'formats': ['pdf', 'excel'],
                'page_size': 'A4',
                'orientation': 'landscape',
            },
            'applicable_industries': ['all'],
            'org_size': 0,
        }

    def _pip_report(self) -> Dict[str, Any]:
        return {
            'name': 'PIP Tracking Report',
            'description': 'Performance Improvement Plan tracking with status, progress, and outcomes',
            'template_type': TemplateType.PIP,
            'category': ReportCategory.HR,
            'sector': SectorType.ALL,
            'is_system': True,
            'is_published': True,
            'is_default': True,
            'is_popular': True,
            'has_prebuilt_charts': True,
            'has_dynamic_filters': True,
            'has_parameters': True,
            'layout_config': {
                'grid_columns': 12,
                'row_height': 100,
                'spacing': 10,
                'sections': ['overview', 'pip_details', 'progress_tracking']
            },
            'widget_config': {
                'widgets': [
                    {'type': WidgetType.KPI, 'title': 'Active PIPs', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Completed PIPs', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Success Rate', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'At Risk', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.PIP, 'title': 'PIP Status', 'size': {'w': 12, 'h': 4}},
                    {'type': WidgetType.TABLE, 'title': 'PIP Details', 'size': {'w': 12, 'h': 4}},
                    {'type': WidgetType.PIE, 'title': 'PIP Outcomes', 'size': {'w': 6, 'h': 4}},
                    {'type': WidgetType.TREND, 'title': 'PIP Trend', 'size': {'w': 6, 'h': 4}},
                ]
            },
            'filter_config': {
                'filters': [
                    {'name': 'date_range', 'type': 'date_range', 'label': 'Date Range'},
                    {'name': 'status', 'type': 'multi_select', 'label': 'Status', 'options': ['Active', 'Completed', 'Failed', 'At Risk']},
                    {'name': 'department', 'type': 'dropdown', 'label': 'Department', 'multiple': True},
                ]
            },
            'parameter_config': {
                'parameters': [
                    {'name': 'period', 'type': 'string', 'default': 'monthly'},
                    {'name': 'year', 'type': 'number', 'default': 2026},
                ]
            },
            'export_config': {
                'formats': ['pdf', 'excel'],
                'page_size': 'A4',
                'orientation': 'landscape',
            },
            'applicable_industries': ['all'],
            'org_size': 0,
        }

    def _ngo_impact_report(self) -> Dict[str, Any]:
        return {
            'name': 'NGO Impact Report',
            'description': 'Social impact report for NGOs with beneficiary metrics and outcome tracking',
            'template_type': TemplateType.CUSTOM,
            'category': ReportCategory.IMPACT,
            'sector': SectorType.NGO,
            'is_system': True,
            'is_published': True,
            'is_default': True,
            'is_popular': True,
            'has_prebuilt_charts': True,
            'has_dynamic_filters': True,
            'has_parameters': True,
            'layout_config': {
                'grid_columns': 12,
                'row_height': 100,
                'spacing': 10,
                'sections': ['impact_overview', 'beneficiary_metrics', 'outcomes']
            },
            'widget_config': {
                'widgets': [
                    {'type': WidgetType.KPI, 'title': 'Beneficiaries Reached', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Impact Score', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Programs Active', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Grant Utilization', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.CHART, 'title': 'Impact Metrics', 'size': {'w': 6, 'h': 4}},
                    {'type': WidgetType.TABLE, 'title': 'Beneficiary Data', 'size': {'w': 6, 'h': 4}},
                    {'type': WidgetType.GAUGE, 'title': 'Impact Gauge', 'size': {'w': 6, 'h': 4}},
                    {'type': WidgetType.TREND, 'title': 'Impact Trend', 'size': {'w': 6, 'h': 4}},
                ]
            },
            'filter_config': {
                'filters': [
                    {'name': 'date_range', 'type': 'date_range', 'label': 'Date Range'},
                    {'name': 'program', 'type': 'dropdown', 'label': 'Program', 'multiple': True},
                    {'name': 'region', 'type': 'dropdown', 'label': 'Region'},
                ]
            },
            'parameter_config': {
                'parameters': [
                    {'name': 'period', 'type': 'string', 'default': 'quarterly'},
                    {'name': 'year', 'type': 'number', 'default': 2026},
                ]
            },
            'export_config': {
                'formats': ['pdf', 'pptx'],
                'page_size': 'A4',
                'orientation': 'landscape',
            },
            'applicable_industries': ['ngo', 'nonprofit'],
            'org_size': 0,
        }

    def _commercial_performance_report(self) -> Dict[str, Any]:
        return {
            'name': 'Commercial Performance Report',
            'description': 'Commercial performance report with revenue, sales, and financial metrics',
            'template_type': TemplateType.CUSTOM,
            'category': ReportCategory.FINANCIAL,
            'sector': SectorType.COMMERCIAL,
            'is_system': True,
            'is_published': True,
            'is_default': True,
            'is_popular': True,
            'has_prebuilt_charts': True,
            'has_dynamic_filters': True,
            'has_parameters': True,
            'layout_config': {
                'grid_columns': 12,
                'row_height': 100,
                'spacing': 10,
                'sections': ['financial_overview', 'sales_performance', 'profitability']
            },
            'widget_config': {
                'widgets': [
                    {'type': WidgetType.KPI, 'title': 'Revenue', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Profit Margin', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Sales Growth', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Market Share', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.TREND, 'title': 'Revenue Trend', 'size': {'w': 6, 'h': 4}},
                    {'type': WidgetType.BAR, 'title': 'Revenue by Product', 'size': {'w': 6, 'h': 4}},
                    {'type': WidgetType.TABLE, 'title': 'Financial Summary', 'size': {'w': 12, 'h': 4}},
                    {'type': WidgetType.PIE, 'title': 'Revenue Distribution', 'size': {'w': 6, 'h': 4}},
                    {'type': WidgetType.GAUGE, 'title': 'Target Achievement', 'size': {'w': 6, 'h': 4}},
                ]
            },
            'filter_config': {
                'filters': [
                    {'name': 'date_range', 'type': 'date_range', 'label': 'Date Range'},
                    {'name': 'product_line', 'type': 'dropdown', 'label': 'Product Line', 'multiple': True},
                    {'name': 'region', 'type': 'dropdown', 'label': 'Region'},
                ]
            },
            'parameter_config': {
                'parameters': [
                    {'name': 'period', 'type': 'string', 'default': 'monthly'},
                    {'name': 'year', 'type': 'number', 'default': 2026},
                    {'name': 'currency', 'type': 'string', 'default': 'KES'},
                ]
            },
            'export_config': {
                'formats': ['pdf', 'excel', 'pptx'],
                'page_size': 'A4',
                'orientation': 'landscape',
            },
            'applicable_industries': ['commercial', 'corporate', 'smb'],
            'org_size': 0,
        }

    def _public_sector_service_report(self) -> Dict[str, Any]:
        return {
            'name': 'Public Sector Service Report',
            'description': 'Public sector service delivery report with compliance and citizen outcome metrics',
            'template_type': TemplateType.CUSTOM,
            'category': ReportCategory.COMPLIANCE,
            'sector': SectorType.PUBLIC,
            'is_system': True,
            'is_published': True,
            'is_default': True,
            'is_popular': True,
            'has_prebuilt_charts': True,
            'has_dynamic_filters': True,
            'has_parameters': True,
            'layout_config': {
                'grid_columns': 12,
                'row_height': 100,
                'spacing': 10,
                'sections': ['service_overview', 'compliance', 'citizen_outcomes']
            },
            'widget_config': {
                'widgets': [
                    {'type': WidgetType.KPI, 'title': 'Service Delivery Rate', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Compliance Rate', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Citizen Satisfaction', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Turnaround Time', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.COMPLIANCE, 'title': 'Compliance Status', 'size': {'w': 6, 'h': 4}},
                    {'type': WidgetType.CHART, 'title': 'Service Metrics', 'size': {'w': 6, 'h': 4}},
                    {'type': WidgetType.TABLE, 'title': 'Service Data', 'size': {'w': 12, 'h': 4}},
                    {'type': WidgetType.TREND, 'title': 'Service Trend', 'size': {'w': 6, 'h': 4}},
                    {'type': WidgetType.GAUGE, 'title': 'Citizen Satisfaction', 'size': {'w': 6, 'h': 4}},
                ]
            },
            'filter_config': {
                'filters': [
                    {'name': 'date_range', 'type': 'date_range', 'label': 'Date Range'},
                    {'name': 'service_type', 'type': 'dropdown', 'label': 'Service Type', 'multiple': True},
                    {'name': 'department', 'type': 'dropdown', 'label': 'Department'},
                ]
            },
            'parameter_config': {
                'parameters': [
                    {'name': 'period', 'type': 'string', 'default': 'quarterly'},
                    {'name': 'year', 'type': 'number', 'default': 2026},
                    {'name': 'region', 'type': 'string', 'default': 'National'},
                ]
            },
            'export_config': {
                'formats': ['pdf', 'excel'],
                'page_size': 'A4',
                'orientation': 'landscape',
            },
            'applicable_industries': ['public', 'government'],
            'org_size': 0,
        }

    def seed_prebuilt_templates(self, tenant_id: Optional[str] = None) -> List[ReportTemplate]:
        with transaction.atomic():
            created = []
            for template_data in self.templates:
                if tenant_id:
                    template_data['tenant_id'] = tenant_id
                else:
                    template_data['tenant_id'] = None
                template, created_flag = ReportTemplate.objects.get_or_create(
                    name=template_data['name'],
                    template_type=template_data['template_type'],
                    is_system=True,
                    defaults=template_data
                )
                if created_flag:
                    created.append(template)
            return created

    def get_template_by_type_and_sector(self, template_type: str, sector: str) -> Optional[ReportTemplate]:
        return ReportTemplate.objects.filter(
            template_type=template_type,
            sector__in=[sector, 'all'],
            is_system=True,
            is_published=True
        ).order_by('-is_default', '-created_at').first()

    def _backup_execution_report_template(self) -> Dict[str, Any]:
        return {
            'name': 'Backup Execution & Storage Utilization Report',
            'description': 'Full operational audit of multi-app backup jobs, compression ratios, SHA-256 checksum verifications, and storage tier distribution',
            'template_type': ReportType.BACKUP_AUDIT,
            'category': ReportCategory.OPERATIONAL,
            'sector': SectorType.ALL,
            'is_system': True,
            'is_published': True,
            'is_default': True,
            'is_popular': True,
            'has_prebuilt_charts': True,
            'has_dynamic_filters': True,
            'has_parameters': True,
            'layout_config': {'grid_columns': 12, 'row_height': 100},
            'widget_config': {
                'widgets': [
                    {'type': WidgetType.KPI, 'title': 'Backup Success Rate', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Total Bytes Backed Up', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Compression Efficiency', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Verified Artifacts', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.CHART, 'title': 'Backup Job Status Timeline', 'size': {'w': 6, 'h': 4}},
                    {'type': WidgetType.TABLE, 'title': 'Recent Backup Executions', 'size': {'w': 6, 'h': 4}},
                ]
            },
            'filter_config': {'filters': [{'name': 'days', 'type': 'number', 'default': 30}]},
            'parameter_config': {'parameters': [{'name': 'app_name', 'type': 'string', 'required': False}]},
            'chart_config': {'default_chart_type': 'bar', 'colors': ['#10b981', '#ef4444', '#f59e0b']},
            'table_config': {'responsive': True, 'striped': True, 'bordered': True},
            'style_config': {'theme': 'light', 'font_family': 'Arial'},
            'export_config': {'formats': ['pdf', 'excel', 'csv']},
            'applicable_industries': ['all'],
            'org_size': 0,
        }

    def _dr_compliance_report_template(self) -> Dict[str, Any]:
        return {
            'name': 'Disaster Recovery Readiness & RTO/RPO Compliance Report',
            'description': 'Audits planned vs achieved RTO and RPO targets, DR drill pass rates, and topological recovery order compliance',
            'template_type': ReportType.DR_COMPLIANCE,
            'category': ReportCategory.COMPLIANCE,
            'sector': SectorType.ALL,
            'is_system': True,
            'is_published': True,
            'is_default': True,
            'is_popular': True,
            'has_prebuilt_charts': True,
            'has_dynamic_filters': True,
            'has_parameters': True,
            'layout_config': {'grid_columns': 12, 'row_height': 100},
            'widget_config': {
                'widgets': [
                    {'type': WidgetType.KPI, 'title': 'DR Drill Pass Rate', 'size': {'w': 4, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Avg Achieved RTO (min)', 'size': {'w': 4, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Avg Achieved RPO (min)', 'size': {'w': 4, 'h': 2}},
                    {'type': WidgetType.TABLE, 'title': 'Disaster Recovery Plans & RTO/RPO Targets', 'size': {'w': 12, 'h': 4}},
                ]
            },
            'filter_config': {'filters': [{'name': 'days', 'type': 'number', 'default': 90}]},
            'parameter_config': {'parameters': []},
            'chart_config': {'default_chart_type': 'line', 'colors': ['#2563eb', '#10b981']},
            'table_config': {'responsive': True, 'striped': True, 'bordered': True},
            'style_config': {'theme': 'light', 'font_family': 'Arial'},
            'export_config': {'formats': ['pdf', 'excel']},
            'applicable_industries': ['all'],
            'org_size': 0,
        }

    def _health_sla_report_template(self) -> Dict[str, Any]:
        return {
            'name': 'Platform Health & Endpoint SLA Compliance Report',
            'description': 'Reports application endpoint uptime %, response time latency in ms, error rates, and system resource metrics',
            'template_type': ReportType.HEALTH_SLA,
            'category': ReportCategory.OPERATIONAL,
            'sector': SectorType.ALL,
            'is_system': True,
            'is_published': True,
            'is_default': True,
            'is_popular': True,
            'has_prebuilt_charts': True,
            'has_dynamic_filters': True,
            'has_parameters': True,
            'layout_config': {'grid_columns': 12, 'row_height': 100},
            'widget_config': {
                'widgets': [
                    {'type': WidgetType.KPI, 'title': 'Platform Uptime %', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Healthy Applications', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Avg Latency (ms)', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Avg Error Rate %', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.TABLE, 'title': 'App Endpoint Health Matrix', 'size': {'w': 12, 'h': 4}},
                ]
            },
            'filter_config': {'filters': []},
            'parameter_config': {'parameters': []},
            'chart_config': {'default_chart_type': 'line', 'colors': ['#10b981', '#ef4444']},
            'table_config': {'responsive': True, 'striped': True, 'bordered': True},
            'style_config': {'theme': 'light', 'font_family': 'Arial'},
            'export_config': {'formats': ['pdf', 'excel', 'csv']},
            'applicable_industries': ['all'],
            'org_size': 0,
        }

    def _maintenance_audit_report_template(self) -> Dict[str, Any]:
        return {
            'name': 'System Maintenance & Downtime Audit Report',
            'description': 'Tracks scheduled and emergency maintenance windows, actual vs scheduled downtime, and worker pause events',
            'template_type': ReportType.MAINTENANCE_AUDIT,
            'category': ReportCategory.OPERATIONAL,
            'sector': SectorType.ALL,
            'is_system': True,
            'is_published': True,
            'is_default': True,
            'is_popular': False,
            'has_prebuilt_charts': True,
            'has_dynamic_filters': True,
            'has_parameters': True,
            'layout_config': {'grid_columns': 12, 'row_height': 100},
            'widget_config': {
                'widgets': [
                    {'type': WidgetType.KPI, 'title': 'Total Downtime (min)', 'size': {'w': 4, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Completed Maintenance Windows', 'size': {'w': 4, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Active Windows', 'size': {'w': 4, 'h': 2}},
                    {'type': WidgetType.TABLE, 'title': 'Maintenance History', 'size': {'w': 12, 'h': 4}},
                ]
            },
            'filter_config': {'filters': [{'name': 'days', 'type': 'number', 'default': 30}]},
            'parameter_config': {'parameters': []},
            'chart_config': {'default_chart_type': 'bar', 'colors': ['#2563eb', '#f59e0b']},
            'table_config': {'responsive': True, 'striped': True, 'bordered': True},
            'style_config': {'theme': 'light', 'font_family': 'Arial'},
            'export_config': {'formats': ['pdf', 'excel']},
            'applicable_industries': ['all'],
            'org_size': 0,
        }

    def _kms_security_report_template(self) -> Dict[str, Any]:
        return {
            'name': 'Security, KMS Encryption & Key Rotation Report',
            'description': 'Audits cryptographic keys, KMS providers, key rotation age (>90 days), and encryption algorithms',
            'template_type': ReportType.KMS_SECURITY,
            'category': ReportCategory.COMPLIANCE,
            'sector': SectorType.ALL,
            'is_system': True,
            'is_published': True,
            'is_default': True,
            'is_popular': False,
            'has_prebuilt_charts': True,
            'has_dynamic_filters': True,
            'has_parameters': True,
            'layout_config': {'grid_columns': 12, 'row_height': 100},
            'widget_config': {
                'widgets': [
                    {'type': WidgetType.KPI, 'title': 'Active KMS Keys', 'size': {'w': 4, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Keys Needing Rotation (>90d)', 'size': {'w': 4, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Failed Audit Actions', 'size': {'w': 4, 'h': 2}},
                    {'type': WidgetType.TABLE, 'title': 'KMS Encryption Keys Matrix', 'size': {'w': 12, 'h': 4}},
                ]
            },
            'filter_config': {'filters': []},
            'parameter_config': {'parameters': []},
            'chart_config': {'default_chart_type': 'pie', 'colors': ['#10b981', '#ef4444', '#64748b']},
            'table_config': {'responsive': True, 'striped': True, 'bordered': True},
            'style_config': {'theme': 'light', 'font_family': 'Arial'},
            'export_config': {'formats': ['pdf', 'excel']},
            'applicable_industries': ['all'],
            'org_size': 0,
        }

    def _system_audit_report_template(self) -> Dict[str, Any]:
        return {
            'name': 'System Control-Plane Audit Trail Report',
            'description': 'Audit log report tracking all administrative control-plane actions, user roles, IP addresses, and outcomes',
            'template_type': ReportType.SYSTEM_AUDIT,
            'category': ReportCategory.COMPLIANCE,
            'sector': SectorType.ALL,
            'is_system': True,
            'is_published': True,
            'is_default': True,
            'is_popular': False,
            'has_prebuilt_charts': True,
            'has_dynamic_filters': True,
            'has_parameters': True,
            'layout_config': {'grid_columns': 12, 'row_height': 100},
            'widget_config': {
                'widgets': [
                    {'type': WidgetType.KPI, 'title': 'Total Audit Logs', 'size': {'w': 6, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Failed Action Count', 'size': {'w': 6, 'h': 2}},
                    {'type': WidgetType.TABLE, 'title': 'Control-Plane Audit Trail', 'size': {'w': 12, 'h': 4}},
                ]
            },
            'filter_config': {'filters': [{'name': 'days', 'type': 'number', 'default': 7}]},
            'parameter_config': {'parameters': []},
            'chart_config': {'default_chart_type': 'line', 'colors': ['#2563eb', '#ef4444']},
            'table_config': {'responsive': True, 'striped': True, 'bordered': True},
            'style_config': {'theme': 'light', 'font_family': 'Arial'},
            'export_config': {'formats': ['pdf', 'excel', 'csv']},
            'applicable_industries': ['all'],
            'org_size': 0,
        }

    def _tenant_quota_report_template(self) -> Dict[str, Any]:
        return {
            'name': 'Tenant Storage Quota & Capacity Forecasting Report',
            'description': 'Tracks tenant backup storage allocations, usage byte sizes, quota breach warnings (>80%), and restore limits',
            'template_type': ReportType.TENANT_QUOTA,
            'category': ReportCategory.FINANCIAL,
            'sector': SectorType.ALL,
            'is_system': True,
            'is_published': True,
            'is_default': True,
            'is_popular': False,
            'has_prebuilt_charts': True,
            'has_dynamic_filters': True,
            'has_parameters': True,
            'layout_config': {'grid_columns': 12, 'row_height': 100},
            'widget_config': {
                'widgets': [
                    {'type': WidgetType.TABLE, 'title': 'Tenant Backup Quota Allocation & Usage', 'size': {'w': 12, 'h': 4}},
                ]
            },
            'filter_config': {'filters': []},
            'parameter_config': {'parameters': []},
            'chart_config': {'default_chart_type': 'bar', 'colors': ['#2563eb', '#f59e0b']},
            'table_config': {'responsive': True, 'striped': True, 'bordered': True},
            'style_config': {'theme': 'light', 'font_family': 'Arial'},
            'export_config': {'formats': ['pdf', 'excel', 'csv']},
            'applicable_industries': ['all'],
            'org_size': 0,
        }

    def _risk_matrix_report_template(self) -> Dict[str, Any]:
        return {
            'name': 'System Risk & Vulnerability Matrix Report',
            'description': 'Aggregates platform risk assessment scores (0-100), risk level distributions, contributing factors, and expiration dates',
            'template_type': ReportType.RISK_MATRIX,
            'category': ReportCategory.STRATEGIC,
            'sector': SectorType.ALL,
            'is_system': True,
            'is_published': True,
            'is_default': True,
            'is_popular': False,
            'has_prebuilt_charts': True,
            'has_dynamic_filters': True,
            'has_parameters': True,
            'layout_config': {'grid_columns': 12, 'row_height': 100},
            'widget_config': {
                'widgets': [
                    {'type': WidgetType.KPI, 'title': 'High/Critical Risk Apps', 'size': {'w': 12, 'h': 2}},
                ]
            },
            'filter_config': {'filters': []},
            'parameter_config': {'parameters': []},
            'chart_config': {'default_chart_type': 'pie', 'colors': ['#ef4444', '#f59e0b', '#10b981']},
            'table_config': {'responsive': True, 'striped': True, 'bordered': True},
            'style_config': {'theme': 'light', 'font_family': 'Arial'},
            'export_config': {'formats': ['pdf', 'excel']},
            'applicable_industries': ['all'],
            'org_size': 0,
        }

    def _tenant_lifecycle_report_template(self) -> Dict[str, Any]:
        return {
            'name': 'Tenant Onboarding & Lifecycle Report',
            'description': 'Reports organization onboarding lifecycles, active vs suspended counts, subscription tier distributions, and onboarding rates',
            'template_type': ReportType.TENANT_LIFECYCLE,
            'category': ReportCategory.OPERATIONAL,
            'sector': SectorType.ALL,
            'is_system': True,
            'is_published': True,
            'is_default': True,
            'is_popular': True,
            'has_prebuilt_charts': True,
            'has_dynamic_filters': True,
            'has_parameters': True,
            'layout_config': {'grid_columns': 12, 'row_height': 100},
            'widget_config': {
                'widgets': [
                    {'type': WidgetType.KPI, 'title': 'Total Organizations', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Active Organizations', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Pending Onboarding', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Onboarding Rate %', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.CHART, 'title': 'Subscription Tier Breakdown', 'size': {'w': 6, 'h': 4}},
                    {'type': WidgetType.TABLE, 'title': 'Organization Directory & Lifecycles', 'size': {'w': 6, 'h': 4}},
                ]
            },
            'filter_config': {'filters': [{'name': 'days', 'type': 'number', 'default': 30}]},
            'parameter_config': {'parameters': []},
            'chart_config': {'default_chart_type': 'pie', 'colors': ['#2563eb', '#10b981', '#f59e0b', '#7c3aed']},
            'table_config': {'responsive': True, 'striped': True, 'bordered': True},
            'style_config': {'theme': 'light', 'font_family': 'Arial'},
            'export_config': {'formats': ['pdf', 'excel', 'csv']},
            'applicable_industries': ['all'],
            'org_size': 0,
        }

    def _tenant_quota_breach_report_template(self) -> Dict[str, Any]:
        return {
            'name': 'Tenant Resource Usage & Quota Breach Report',
            'description': 'Audits tenant resource limit allocations, current usage, 80% warning threshold breaches, and soft/hard ceiling blocks',
            'template_type': ReportType.TENANT_RESOURCE_QUOTA,
            'category': ReportCategory.FINANCIAL,
            'sector': SectorType.ALL,
            'is_system': True,
            'is_published': True,
            'is_default': True,
            'is_popular': True,
            'has_prebuilt_charts': True,
            'has_dynamic_filters': True,
            'has_parameters': True,
            'layout_config': {'grid_columns': 12, 'row_height': 100},
            'widget_config': {
                'widgets': [
                    {'type': WidgetType.KPI, 'title': 'Exceeded Quota Resources', 'size': {'w': 6, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Warning Level Resources (>80%)', 'size': {'w': 6, 'h': 2}},
                    {'type': WidgetType.TABLE, 'title': 'Exceeded Quota Resources Matrix', 'size': {'w': 12, 'h': 4}},
                ]
            },
            'filter_config': {'filters': []},
            'parameter_config': {'parameters': []},
            'chart_config': {'default_chart_type': 'bar', 'colors': ['#ef4444', '#f59e0b']},
            'table_config': {'responsive': True, 'striped': True, 'bordered': True},
            'style_config': {'theme': 'light', 'font_family': 'Arial'},
            'export_config': {'formats': ['pdf', 'excel', 'csv']},
            'applicable_industries': ['all'],
            'org_size': 0,
        }

    def _tenant_schema_health_report_template(self) -> Dict[str, Any]:
        return {
            'name': 'Tenant Schema & Migration Health Report',
            'description': 'Audits tenant database schemas, storage sizes (MB), table counts, active connections, and migration execution histories',
            'template_type': ReportType.TENANT_SCHEMA_HEALTH,
            'category': ReportCategory.OPERATIONAL,
            'sector': SectorType.ALL,
            'is_system': True,
            'is_published': True,
            'is_default': True,
            'is_popular': False,
            'has_prebuilt_charts': True,
            'has_dynamic_filters': True,
            'has_parameters': True,
            'layout_config': {'grid_columns': 12, 'row_height': 100},
            'widget_config': {
                'widgets': [
                    {'type': WidgetType.KPI, 'title': 'Active Schemas', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Total Schema Size (MB)', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Active DB Connections', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Completed Migrations', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.TABLE, 'title': 'Organization Database Schemas', 'size': {'w': 12, 'h': 4}},
                ]
            },
            'filter_config': {'filters': []},
            'parameter_config': {'parameters': []},
            'chart_config': {'default_chart_type': 'bar', 'colors': ['#2563eb', '#10b981']},
            'table_config': {'responsive': True, 'striped': True, 'bordered': True},
            'style_config': {'theme': 'light', 'font_family': 'Arial'},
            'export_config': {'formats': ['pdf', 'excel']},
            'applicable_industries': ['all'],
            'org_size': 0,
        }

    def _tenant_domain_ssl_report_template(self) -> Dict[str, Any]:
        return {
            'name': 'Tenant Domain & SSL Compliance Report',
            'description': 'Audits tenant domain verification statuses, primary domain assignments, and SSL certificate expiration countdowns',
            'template_type': ReportType.TENANT_DOMAIN_SSL,
            'category': ReportCategory.COMPLIANCE,
            'sector': SectorType.ALL,
            'is_system': True,
            'is_published': True,
            'is_default': True,
            'is_popular': False,
            'has_prebuilt_charts': True,
            'has_dynamic_filters': True,
            'has_parameters': True,
            'layout_config': {'grid_columns': 12, 'row_height': 100},
            'widget_config': {
                'widgets': [
                    {'type': WidgetType.KPI, 'title': 'Active Domains', 'size': {'w': 4, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Pending Verification', 'size': {'w': 4, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'SSL Expiring (<30 Days)', 'size': {'w': 4, 'h': 2}},
                    {'type': WidgetType.TABLE, 'title': 'Organization Custom Domains Matrix', 'size': {'w': 12, 'h': 4}},
                ]
            },
            'filter_config': {'filters': []},
            'parameter_config': {'parameters': []},
            'chart_config': {'default_chart_type': 'pie', 'colors': ['#10b981', '#f59e0b', '#ef4444']},
            'table_config': {'responsive': True, 'striped': True, 'bordered': True},
            'style_config': {'theme': 'light', 'font_family': 'Arial'},
            'export_config': {'formats': ['pdf', 'excel']},
            'applicable_industries': ['all'],
            'org_size': 0,
        }

    def _tenant_backup_report_template(self) -> Dict[str, Any]:
        return {
            'name': 'Tenant Data Backup Audit Report',
            'description': 'Reports tenant data backup execution history, success vs failure rates, file sizes (MB), and retention expiration',
            'template_type': ReportType.TENANT_BACKUP_AUDIT,
            'category': ReportCategory.OPERATIONAL,
            'sector': SectorType.ALL,
            'is_system': True,
            'is_published': True,
            'is_default': True,
            'is_popular': False,
            'has_prebuilt_charts': True,
            'has_dynamic_filters': True,
            'has_parameters': True,
            'layout_config': {'grid_columns': 12, 'row_height': 100},
            'widget_config': {
                'widgets': [
                    {'type': WidgetType.KPI, 'title': 'Backup Success Rate %', 'size': {'w': 4, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Total Backup Storage (MB)', 'size': {'w': 4, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Expired Backups', 'size': {'w': 4, 'h': 2}},
                    {'type': WidgetType.TABLE, 'title': 'Tenant Backup History', 'size': {'w': 12, 'h': 4}},
                ]
            },
            'filter_config': {'filters': []},
            'parameter_config': {'parameters': []},
            'chart_config': {'default_chart_type': 'line', 'colors': ['#10b981', '#ef4444']},
            'table_config': {'responsive': True, 'striped': True, 'bordered': True},
            'style_config': {'theme': 'light', 'font_family': 'Arial'},
            'export_config': {'formats': ['pdf', 'excel', 'csv']},
            'applicable_industries': ['all'],
            'org_size': 0,
        }

    def _tenant_executive_report_template(self) -> Dict[str, Any]:
        return {
            'name': 'Tenant Multi-Tenant Executive Summary',
            'description': 'Unified multi-tenant executive dashboard combining organization counts, quota status, schema sizes, SSL risks, and backups',
            'template_type': ReportType.TENANT_EXECUTIVE_SUMMARY,
            'category': ReportCategory.STRATEGIC,
            'sector': SectorType.ALL,
            'is_system': True,
            'is_published': True,
            'is_default': True,
            'is_popular': True,
            'has_prebuilt_charts': True,
            'has_dynamic_filters': True,
            'has_parameters': True,
            'layout_config': {'grid_columns': 12, 'row_height': 100},
            'widget_config': {
                'widgets': [
                    {'type': WidgetType.KPI, 'title': 'Total Organizations', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Active Organizations', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Quota Exceeded Count', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Backup Success Rate', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.TABLE, 'title': 'Platform Multi-Tenant Summary', 'size': {'w': 12, 'h': 4}},
                ]
            },
            'filter_config': {'filters': []},
            'parameter_config': {'parameters': []},
            'chart_config': {'default_chart_type': 'bar', 'colors': ['#2563eb', '#10b981', '#f59e0b']},
            'table_config': {'responsive': True, 'striped': True, 'bordered': True},
            'style_config': {'theme': 'light', 'font_family': 'Arial'},
            'export_config': {'formats': ['pdf', 'excel']},
            'applicable_industries': ['all'],
            'org_size': 0,
        }

    def _kpi_individual_scorecard_template(self) -> Dict[str, Any]:
        return {
            'name': 'Individual KPI Performance Scorecard',
            'description': 'Reports an individual staff member 12-month performance scorecard, phased targets vs approved actuals, weights, and evidence attachments',
            'template_type': ReportType.KPI_INDIVIDUAL_SCORECARD,
            'category': ReportCategory.OPERATIONAL,
            'sector': SectorType.ALL,
            'is_system': True,
            'is_published': True,
            'is_default': True,
            'is_popular': True,
            'has_prebuilt_charts': True,
            'has_dynamic_filters': True,
            'has_parameters': True,
            'layout_config': {'grid_columns': 12, 'row_height': 100},
            'widget_config': {
                'widgets': [
                    {'type': WidgetType.KPI, 'title': 'Overall Scorecard %', 'size': {'w': 4, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Approved Actuals Count', 'size': {'w': 4, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Evidence Files Attached', 'size': {'w': 4, 'h': 2}},
                    {'type': WidgetType.TABLE, 'title': 'Individual KPI Performance Matrix', 'size': {'w': 12, 'h': 4}},
                ]
            },
            'filter_config': {'filters': [{'name': 'year', 'type': 'number', 'default': 2026}, {'name': 'user_id', 'type': 'string'}]},
            'parameter_config': {'parameters': []},
            'chart_config': {'default_chart_type': 'bar', 'colors': ['#2563eb', '#10b981', '#f59e0b']},
            'table_config': {'responsive': True, 'striped': True, 'bordered': True},
            'style_config': {'theme': 'light', 'font_family': 'Arial'},
            'export_config': {'formats': ['pdf', 'excel', 'csv']},
            'applicable_industries': ['all'],
            'org_size': 0,
        }

    def _kpi_departmental_heatmap_template(self) -> Dict[str, Any]:
        return {
            'name': 'Departmental KPI Rollup & Heatmap',
            'description': 'Reports departmental and unit performance rollups, average team scores, and traffic light distribution',
            'template_type': ReportType.KPI_DEPARTMENTAL_HEATMAP,
            'category': ReportCategory.OPERATIONAL,
            'sector': SectorType.ALL,
            'is_system': True,
            'is_published': True,
            'is_default': True,
            'is_popular': True,
            'has_prebuilt_charts': True,
            'has_dynamic_filters': True,
            'has_parameters': True,
            'layout_config': {'grid_columns': 12, 'row_height': 100},
            'widget_config': {
                'widgets': [
                    {'type': WidgetType.KPI, 'title': 'Total Departments', 'size': {'w': 6, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Organization Average Score', 'size': {'w': 6, 'h': 2}},
                    {'type': WidgetType.TABLE, 'title': 'Departmental KPI Rollups & Heatmap', 'size': {'w': 12, 'h': 4}},
                ]
            },
            'filter_config': {'filters': [{'name': 'year', 'type': 'number', 'default': 2026}]},
            'parameter_config': {'parameters': []},
            'chart_config': {'default_chart_type': 'bar', 'colors': ['#10b981', '#f59e0b', '#ef4444']},
            'table_config': {'responsive': True, 'striped': True, 'bordered': True},
            'style_config': {'theme': 'light', 'font_family': 'Arial'},
            'export_config': {'formats': ['pdf', 'excel']},
            'applicable_industries': ['all'],
            'org_size': 0,
        }

    def _kpi_cascade_tree_template(self) -> Dict[str, Any]:
        return {
            'name': 'Chain of Command Target Cascading Tree',
            'description': 'Audits parent-to-child target cascading integrity, contribution percentages, and breakdown from organization down to individual levels',
            'template_type': ReportType.KPI_CASCADE_TREE,
            'category': ReportCategory.STRATEGIC,
            'sector': SectorType.ALL,
            'is_system': True,
            'is_published': True,
            'is_default': True,
            'is_popular': False,
            'has_prebuilt_charts': True,
            'has_dynamic_filters': True,
            'has_parameters': True,
            'layout_config': {'grid_columns': 12, 'row_height': 100},
            'widget_config': {
                'widgets': [
                    {'type': WidgetType.KPI, 'title': 'Total Cascade Mappings', 'size': {'w': 12, 'h': 2}},
                    {'type': WidgetType.TABLE, 'title': 'Chain of Command Target Cascade Mapping', 'size': {'w': 12, 'h': 4}},
                ]
            },
            'filter_config': {'filters': []},
            'parameter_config': {'parameters': []},
            'chart_config': {'default_chart_type': 'bar', 'colors': ['#7c3aed', '#2563eb']},
            'table_config': {'responsive': True, 'striped': True, 'bordered': True},
            'style_config': {'theme': 'light', 'font_family': 'Arial'},
            'export_config': {'formats': ['pdf', 'excel']},
            'applicable_industries': ['all'],
            'org_size': 0,
        }

    def _kpi_red_alerts_template(self) -> Dict[str, Any]:
        return {
            'name': 'KPI Underperformance & Red Alerts Audit',
            'description': 'Audits underperforming KPIs (score < 50%), consecutive red alert months (>=2), open escalations, and PIP recommendations',
            'template_type': ReportType.KPI_RED_ALERTS,
            'category': ReportCategory.COMPLIANCE,
            'sector': SectorType.ALL,
            'is_system': True,
            'is_published': True,
            'is_default': True,
            'is_popular': True,
            'has_prebuilt_charts': True,
            'has_dynamic_filters': True,
            'has_parameters': True,
            'layout_config': {'grid_columns': 12, 'row_height': 100},
            'widget_config': {
                'widgets': [
                    {'type': WidgetType.KPI, 'title': 'Total Red Alerts', 'size': {'w': 4, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Persistent Red Alerts (>=2 Months)', 'size': {'w': 4, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Open Escalations', 'size': {'w': 4, 'h': 2}},
                    {'type': WidgetType.TABLE, 'title': 'Underperforming KPIs & Escalations', 'size': {'w': 12, 'h': 4}},
                ]
            },
            'filter_config': {'filters': [{'name': 'year', 'type': 'number', 'default': 2026}]},
            'parameter_config': {'parameters': []},
            'chart_config': {'default_chart_type': 'pie', 'colors': ['#ef4444', '#f59e0b']},
            'table_config': {'responsive': True, 'striped': True, 'bordered': True},
            'style_config': {'theme': 'light', 'font_family': 'Arial'},
            'export_config': {'formats': ['pdf', 'excel', 'csv']},
            'applicable_industries': ['all'],
            'org_size': 0,
        }

    def _kpi_validation_compliance_template(self) -> Dict[str, Any]:
        return {
            'name': 'KPI Data Submission & Validation Compliance',
            'description': 'Tracks monthly actual submission compliance (by 5th of month), supervisor approval response rates, rejected entries, and pending queues',
            'template_type': ReportType.KPI_VALIDATION_COMPLIANCE,
            'category': ReportCategory.COMPLIANCE,
            'sector': SectorType.ALL,
            'is_system': True,
            'is_published': True,
            'is_default': True,
            'is_popular': False,
            'has_prebuilt_charts': True,
            'has_dynamic_filters': True,
            'has_parameters': True,
            'layout_config': {'grid_columns': 12, 'row_height': 100},
            'widget_config': {
                'widgets': [
                    {'type': WidgetType.KPI, 'title': 'Approval Rate %', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Approved Actuals', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Pending Validation', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Rejected Actuals', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.TABLE, 'title': 'Monthly Actual Submission & Validation Summary', 'size': {'w': 12, 'h': 4}},
                ]
            },
            'filter_config': {'filters': [{'name': 'year', 'type': 'number', 'default': 2026}]},
            'parameter_config': {'parameters': []},
            'chart_config': {'default_chart_type': 'bar', 'colors': ['#10b981', '#f59e0b', '#ef4444']},
            'table_config': {'responsive': True, 'striped': True, 'bordered': True},
            'style_config': {'theme': 'light', 'font_family': 'Arial'},
            'export_config': {'formats': ['pdf', 'excel', 'csv']},
            'applicable_industries': ['all'],
            'org_size': 0,
        }

    def _kpi_executive_summary_template(self) -> Dict[str, Any]:
        return {
            'name': 'Organization KPI Strategic Performance Summary',
            'description': 'Executive overview combining average organization scores, departmental health, target cascading metrics, red alerts, and validation compliance',
            'template_type': ReportType.KPI_EXECUTIVE_SUMMARY,
            'category': ReportCategory.STRATEGIC,
            'sector': SectorType.ALL,
            'is_system': True,
            'is_published': True,
            'is_default': True,
            'is_popular': True,
            'has_prebuilt_charts': True,
            'has_dynamic_filters': True,
            'has_parameters': True,
            'layout_config': {'grid_columns': 12, 'row_height': 100},
            'widget_config': {
                'widgets': [
                    {'type': WidgetType.KPI, 'title': 'Average Organization Score', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Monitored Departments', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Total Red Alerts', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Validation Approval Rate %', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.TABLE, 'title': 'Strategic Performance Executive Summary', 'size': {'w': 12, 'h': 4}},
                ]
            },
            'filter_config': {'filters': [{'name': 'year', 'type': 'number', 'default': 2026}]},
            'parameter_config': {'parameters': []},
            'chart_config': {'default_chart_type': 'bar', 'colors': ['#2563eb', '#10b981', '#f59e0b']},
            'table_config': {'responsive': True, 'striped': True, 'bordered': True},
            'style_config': {'theme': 'light', 'font_family': 'Arial'},
            'export_config': {'formats': ['pdf', 'excel']},
            'applicable_industries': ['all'],
            'org_size': 0,
        }

    def _structure_org_chart_template(self) -> Dict[str, Any]:
        return {
            'name': 'Organizational Chart & Hierarchy Tree',
            'description': 'Visualizes the 4-level org hierarchy (Division > Department > Section > Unit), materialized paths, headcounts per node, and managers per unit',
            'template_type': ReportType.STRUCTURE_ORG_CHART,
            'category': ReportCategory.OPERATIONAL,
            'sector': SectorType.ALL,
            'is_system': True,
            'is_published': True,
            'is_default': True,
            'is_popular': True,
            'has_prebuilt_charts': True,
            'has_dynamic_filters': True,
            'has_parameters': True,
            'layout_config': {'grid_columns': 12, 'row_height': 100},
            'widget_config': {
                'widgets': [
                    {'type': WidgetType.KPI, 'title': 'Total Divisions', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Total Departments', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Total Sections & Units', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Total Active Employees', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.TABLE, 'title': 'Division & Department Org Chart', 'size': {'w': 12, 'h': 4}},
                ]
            },
            'filter_config': {'filters': []},
            'parameter_config': {'parameters': []},
            'chart_config': {'default_chart_type': 'bar', 'colors': ['#2563eb', '#10b981', '#7c3aed', '#f59e0b']},
            'table_config': {'responsive': True, 'striped': True, 'bordered': True},
            'style_config': {'theme': 'light', 'font_family': 'Arial'},
            'export_config': {'formats': ['pdf', 'excel', 'csv']},
            'applicable_industries': ['all'],
            'org_size': 0,
        }

    def _structure_span_of_control_template(self) -> Dict[str, Any]:
        return {
            'name': 'Managerial Span of Control Audit',
            'description': 'Audits all managers for direct vs indirect report counts, highlights those exceeding the 50-direct-reports threshold, and ranks span-of-control distribution',
            'template_type': ReportType.STRUCTURE_SPAN_OF_CONTROL,
            'category': ReportCategory.OPERATIONAL,
            'sector': SectorType.ALL,
            'is_system': True,
            'is_published': True,
            'is_default': True,
            'is_popular': True,
            'has_prebuilt_charts': True,
            'has_dynamic_filters': True,
            'has_parameters': True,
            'layout_config': {'grid_columns': 12, 'row_height': 100},
            'widget_config': {
                'widgets': [
                    {'type': WidgetType.KPI, 'title': 'Total Managers', 'size': {'w': 4, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Overloaded Managers (>50 reports)', 'size': {'w': 4, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Average Direct Reports', 'size': {'w': 4, 'h': 2}},
                    {'type': WidgetType.TABLE, 'title': 'Manager Span of Control Details', 'size': {'w': 12, 'h': 4}},
                ]
            },
            'filter_config': {'filters': []},
            'parameter_config': {'parameters': []},
            'chart_config': {'default_chart_type': 'bar', 'colors': ['#10b981', '#f59e0b', '#ef4444']},
            'table_config': {'responsive': True, 'striped': True, 'bordered': True},
            'style_config': {'theme': 'light', 'font_family': 'Arial'},
            'export_config': {'formats': ['pdf', 'excel']},
            'applicable_industries': ['all'],
            'org_size': 0,
        }

    def _structure_interim_delegation_template(self) -> Dict[str, Any]:
        return {
            'name': 'Interim Manager & Delegation Audit',
            'description': 'Audits all active interim acting assignments, delegation periods, days remaining, and those expiring within 7 days requiring action',
            'template_type': ReportType.STRUCTURE_INTERIM_DELEGATION,
            'category': ReportCategory.COMPLIANCE,
            'sector': SectorType.ALL,
            'is_system': True,
            'is_published': True,
            'is_default': True,
            'is_popular': False,
            'has_prebuilt_charts': True,
            'has_dynamic_filters': True,
            'has_parameters': True,
            'layout_config': {'grid_columns': 12, 'row_height': 100},
            'widget_config': {
                'widgets': [
                    {'type': WidgetType.KPI, 'title': 'Active Interim Assignments', 'size': {'w': 6, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Expiring Within 7 Days', 'size': {'w': 6, 'h': 2}},
                    {'type': WidgetType.TABLE, 'title': 'Active Interim Acting Delegation Records', 'size': {'w': 12, 'h': 4}},
                ]
            },
            'filter_config': {'filters': []},
            'parameter_config': {'parameters': []},
            'chart_config': {'default_chart_type': 'pie', 'colors': ['#2563eb', '#f59e0b']},
            'table_config': {'responsive': True, 'striped': True, 'bordered': True},
            'style_config': {'theme': 'light', 'font_family': 'Arial'},
            'export_config': {'formats': ['pdf', 'excel', 'csv']},
            'applicable_industries': ['all'],
            'org_size': 0,
        }

    def _structure_cost_center_allocation_template(self) -> Dict[str, Any]:
        return {
            'name': 'Cost Center & Location Allocation Audit',
            'description': 'Reports cost center budget allocation splits by category (Operational, Capital, Project, Departmental, Shared) and geographic office hub distribution',
            'template_type': ReportType.STRUCTURE_COST_CENTER_ALLOCATION,
            'category': ReportCategory.FINANCIAL,
            'sector': SectorType.ALL,
            'is_system': True,
            'is_published': True,
            'is_default': True,
            'is_popular': False,
            'has_prebuilt_charts': True,
            'has_dynamic_filters': True,
            'has_parameters': True,
            'layout_config': {'grid_columns': 12, 'row_height': 100},
            'widget_config': {
                'widgets': [
                    {'type': WidgetType.KPI, 'title': 'Total Cost Centers', 'size': {'w': 4, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Total Budget Allocated', 'size': {'w': 4, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Total Office Locations', 'size': {'w': 4, 'h': 2}},
                    {'type': WidgetType.TABLE, 'title': 'Cost Center & Budget Allocation Summary', 'size': {'w': 12, 'h': 4}},
                ]
            },
            'filter_config': {'filters': []},
            'parameter_config': {'parameters': []},
            'chart_config': {'default_chart_type': 'pie', 'colors': ['#2563eb', '#10b981', '#f59e0b', '#7c3aed', '#ef4444']},
            'table_config': {'responsive': True, 'striped': True, 'bordered': True},
            'style_config': {'theme': 'light', 'font_family': 'Arial'},
            'export_config': {'formats': ['pdf', 'excel']},
            'applicable_industries': ['all'],
            'org_size': 0,
        }

    def _structure_security_sensitivity_template(self) -> Dict[str, Any]:
        return {
            'name': 'Department Sensitivity & Security Scope Audit',
            'description': 'Audits department sensitivity classifications (Public, Internal, Confidential, Restricted) and scope enforcement access levels for HR security compliance',
            'template_type': ReportType.STRUCTURE_SECURITY_SENSITIVITY,
            'category': ReportCategory.COMPLIANCE,
            'sector': SectorType.ALL,
            'is_system': True,
            'is_published': True,
            'is_default': True,
            'is_popular': False,
            'has_prebuilt_charts': True,
            'has_dynamic_filters': True,
            'has_parameters': True,
            'layout_config': {'grid_columns': 12, 'row_height': 100},
            'widget_config': {
                'widgets': [
                    {'type': WidgetType.KPI, 'title': 'Total Monitored Departments', 'size': {'w': 4, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Confidential & Restricted Departments', 'size': {'w': 4, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Public & Internal Departments', 'size': {'w': 4, 'h': 2}},
                    {'type': WidgetType.TABLE, 'title': 'Department Sensitivity Classification & Access Levels', 'size': {'w': 12, 'h': 4}},
                ]
            },
            'filter_config': {'filters': []},
            'parameter_config': {'parameters': []},
            'chart_config': {'default_chart_type': 'pie', 'colors': ['#10b981', '#2563eb', '#f59e0b', '#ef4444']},
            'table_config': {'responsive': True, 'striped': True, 'bordered': True},
            'style_config': {'theme': 'light', 'font_family': 'Arial'},
            'export_config': {'formats': ['pdf', 'excel']},
            'applicable_industries': ['all'],
            'org_size': 0,
        }

    def _structure_executive_summary_template(self) -> Dict[str, Any]:
        return {
            'name': 'Organizational Structure Executive Summary',
            'description': 'Executive overview of the complete organizational structure: hierarchy counts, employee distribution, managerial coverage, interim delegations, budget allocations, and security posture',
            'template_type': ReportType.STRUCTURE_EXECUTIVE_SUMMARY,
            'category': ReportCategory.STRATEGIC,
            'sector': SectorType.ALL,
            'is_system': True,
            'is_published': True,
            'is_default': True,
            'is_popular': True,
            'has_prebuilt_charts': True,
            'has_dynamic_filters': True,
            'has_parameters': True,
            'layout_config': {'grid_columns': 12, 'row_height': 100},
            'widget_config': {
                'widgets': [
                    {'type': WidgetType.KPI, 'title': 'Total Divisions', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Total Active Employees', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Total Managers', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Active Interim Assignments', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.TABLE, 'title': 'Organizational Structure Executive Overview', 'size': {'w': 12, 'h': 4}},
                ]
            },
            'filter_config': {'filters': []},
            'parameter_config': {'parameters': []},
            'chart_config': {'default_chart_type': 'bar', 'colors': ['#2563eb', '#10b981', '#f59e0b', '#7c3aed']},
            'table_config': {'responsive': True, 'striped': True, 'bordered': True},
            'style_config': {'theme': 'light', 'font_family': 'Arial'},
            'export_config': {'formats': ['pdf', 'excel']},
            'applicable_industries': ['all'],
            'org_size': 0,
        }

    def _accounts_user_directory_template(self) -> Dict[str, Any]:
        return {
            'name': 'User Directory & Roster Report',
            'description': 'Full user roster by role, department, and login status. Shows active, suspended, verified users, new joiners, and never-logged-in accounts. Scoped per tenant.',
            'template_type': ReportType.ACCOUNTS_USER_DIRECTORY,
            'category': ReportCategory.OPERATIONAL,
            'sector': SectorType.ALL,
            'is_system': True,
            'is_published': True,
            'is_default': True,
            'is_popular': True,
            'has_prebuilt_charts': True,
            'has_dynamic_filters': True,
            'has_parameters': True,
            'layout_config': {'grid_columns': 12, 'row_height': 100},
            'widget_config': {
                'widgets': [
                    {'type': WidgetType.KPI, 'title': 'Total Users', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Active Users', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Suspended Users', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'New Users (30d)', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.CHART, 'title': 'Role Distribution', 'size': {'w': 6, 'h': 4}},
                    {'type': WidgetType.CHART, 'title': 'Department Distribution', 'size': {'w': 6, 'h': 4}},
                    {'type': WidgetType.TABLE, 'title': 'User Directory', 'size': {'w': 12, 'h': 6}},
                ]
            },
            'filter_config': {'filters': [{'field': 'role', 'type': 'select'}, {'field': 'is_active', 'type': 'boolean'}, {'field': 'department', 'type': 'text'}]},
            'parameter_config': {'parameters': []},
            'chart_config': {'default_chart_type': 'pie', 'colors': ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#7c3aed']},
            'table_config': {'responsive': True, 'striped': True, 'bordered': True},
            'style_config': {'theme': 'light', 'font_family': 'Arial'},
            'export_config': {'formats': ['pdf', 'excel', 'csv']},
            'applicable_industries': ['all'],
            'org_size': 0,
        }

    def _accounts_login_security_template(self) -> Dict[str, Any]:
        return {
            'name': 'Login Security & Brute-Force Audit',
            'description': 'Login attempt analysis covering successes, failures, lockouts, failure reasons, and brute-force IP detection over configurable period.',
            'template_type': ReportType.ACCOUNTS_LOGIN_SECURITY,
            'category': ReportCategory.COMPLIANCE,
            'sector': SectorType.ALL,
            'is_system': True,
            'is_published': True,
            'is_default': True,
            'is_popular': True,
            'has_prebuilt_charts': True,
            'has_dynamic_filters': True,
            'has_parameters': True,
            'layout_config': {'grid_columns': 12, 'row_height': 100},
            'widget_config': {
                'widgets': [
                    {'type': WidgetType.KPI, 'title': 'Total Login Attempts', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Success Rate', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Failed Attempts', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Lockouts', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.CHART, 'title': 'Failure Reason Breakdown', 'size': {'w': 6, 'h': 4}},
                    {'type': WidgetType.TABLE, 'title': 'Suspicious IPs (High Failure)', 'size': {'w': 6, 'h': 4}},
                    {'type': WidgetType.TABLE, 'title': 'Recent Login Attempts', 'size': {'w': 12, 'h': 6}},
                ]
            },
            'filter_config': {'filters': [{'field': 'days', 'type': 'number', 'default': 30}]},
            'parameter_config': {'parameters': [{'name': 'days', 'type': 'integer', 'default': 30, 'min': 1, 'max': 90}]},
            'chart_config': {'default_chart_type': 'bar', 'colors': ['#10b981', '#ef4444', '#f59e0b', '#7c3aed']},
            'table_config': {'responsive': True, 'striped': True, 'bordered': True},
            'style_config': {'theme': 'dark', 'font_family': 'Arial'},
            'export_config': {'formats': ['pdf', 'excel', 'csv']},
            'applicable_industries': ['all'],
            'org_size': 0,
        }

    def _accounts_mfa_compliance_template(self) -> Dict[str, Any]:
        return {
            'name': 'MFA Adoption & Compliance Report',
            'description': 'Multi-factor authentication adoption report: MFA adoption rates by role, unprotected users, device type breakdown, backup code status, and at-risk accounts.',
            'template_type': ReportType.ACCOUNTS_MFA_COMPLIANCE,
            'category': ReportCategory.COMPLIANCE,
            'sector': SectorType.ALL,
            'is_system': True,
            'is_published': True,
            'is_default': True,
            'is_popular': True,
            'has_prebuilt_charts': True,
            'has_dynamic_filters': False,
            'has_parameters': False,
            'layout_config': {'grid_columns': 12, 'row_height': 100},
            'widget_config': {
                'widgets': [
                    {'type': WidgetType.KPI, 'title': 'MFA Adoption Rate', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'MFA Enabled Users', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'At-Risk (No MFA)', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Locked Devices', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.CHART, 'title': 'MFA Adoption by Role', 'size': {'w': 6, 'h': 4}},
                    {'type': WidgetType.CHART, 'title': 'Device Type Distribution', 'size': {'w': 6, 'h': 4}},
                    {'type': WidgetType.TABLE, 'title': 'At-Risk Users (MFA Required, Not Enrolled)', 'size': {'w': 12, 'h': 4}},
                ]
            },
            'filter_config': {'filters': []},
            'parameter_config': {'parameters': []},
            'chart_config': {'default_chart_type': 'bar', 'colors': ['#10b981', '#ef4444', '#f59e0b', '#2563eb']},
            'table_config': {'responsive': True, 'striped': True, 'bordered': True},
            'style_config': {'theme': 'light', 'font_family': 'Arial'},
            'export_config': {'formats': ['pdf', 'excel']},
            'applicable_industries': ['all'],
            'org_size': 0,
        }

    def _accounts_audit_trail_template(self) -> Dict[str, Any]:
        return {
            'name': 'Accounts Full Audit Trail Report',
            'description': 'Comprehensive audit trail of all accounts actions with action-type breakdown, severity distribution, top actors, security events, and recent audit entries.',
            'template_type': ReportType.ACCOUNTS_AUDIT_TRAIL,
            'category': ReportCategory.COMPLIANCE,
            'sector': SectorType.ALL,
            'is_system': True,
            'is_published': True,
            'is_default': True,
            'is_popular': False,
            'has_prebuilt_charts': True,
            'has_dynamic_filters': True,
            'has_parameters': True,
            'layout_config': {'grid_columns': 12, 'row_height': 100},
            'widget_config': {
                'widgets': [
                    {'type': WidgetType.KPI, 'title': 'Total Audit Events', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Unique Actors', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Security Events', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Period (Days)', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.CHART, 'title': 'Action Type Breakdown', 'size': {'w': 6, 'h': 4}},
                    {'type': WidgetType.CHART, 'title': 'Severity Distribution', 'size': {'w': 6, 'h': 4}},
                    {'type': WidgetType.TABLE, 'title': 'Top Actors', 'size': {'w': 6, 'h': 4}},
                    {'type': WidgetType.TABLE, 'title': 'Top Actions', 'size': {'w': 6, 'h': 4}},
                    {'type': WidgetType.TABLE, 'title': 'Recent Audit Entries', 'size': {'w': 12, 'h': 6}},
                ]
            },
            'filter_config': {'filters': [{'field': 'days', 'type': 'number', 'default': 30}, {'field': 'action_type', 'type': 'select'}, {'field': 'severity', 'type': 'select'}]},
            'parameter_config': {'parameters': [{'name': 'days', 'type': 'integer', 'default': 30, 'min': 1, 'max': 365}]},
            'chart_config': {'default_chart_type': 'bar', 'colors': ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#7c3aed']},
            'table_config': {'responsive': True, 'striped': True, 'bordered': True},
            'style_config': {'theme': 'light', 'font_family': 'Arial'},
            'export_config': {'formats': ['pdf', 'excel', 'csv']},
            'applicable_industries': ['all'],
            'org_size': 0,
        }

    def _accounts_role_permission_audit_template(self) -> Dict[str, Any]:
        return {
            'name': 'Role & Permission Coverage Audit',
            'description': 'RBAC audit showing role distribution by user count, permission coverage per role, permission categorization by level and category, and role change history.',
            'template_type': ReportType.ACCOUNTS_ROLE_PERMISSION_AUDIT,
            'category': ReportCategory.COMPLIANCE,
            'sector': SectorType.ALL,
            'is_system': True,
            'is_published': True,
            'is_default': True,
            'is_popular': False,
            'has_prebuilt_charts': True,
            'has_dynamic_filters': False,
            'has_parameters': False,
            'layout_config': {'grid_columns': 12, 'row_height': 100},
            'widget_config': {
                'widgets': [
                    {'type': WidgetType.KPI, 'title': 'Total Roles', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Total Permissions', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Role Changes (30d)', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.CHART, 'title': 'User Distribution by Role', 'size': {'w': 6, 'h': 4}},
                    {'type': WidgetType.CHART, 'title': 'Permissions by Category', 'size': {'w': 6, 'h': 4}},
                    {'type': WidgetType.TABLE, 'title': 'Role Details', 'size': {'w': 12, 'h': 4}},
                ]
            },
            'filter_config': {'filters': []},
            'parameter_config': {'parameters': []},
            'chart_config': {'default_chart_type': 'bar', 'colors': ['#2563eb', '#7c3aed', '#10b981', '#f59e0b']},
            'table_config': {'responsive': True, 'striped': True, 'bordered': True},
            'style_config': {'theme': 'light', 'font_family': 'Arial'},
            'export_config': {'formats': ['pdf', 'excel']},
            'applicable_industries': ['all'],
            'org_size': 0,
        }

    def _accounts_session_activity_template(self) -> Dict[str, Any]:
        return {
            'name': 'Active Session Activity Report',
            'description': 'Snapshot of all active user sessions: device type, browser, OS breakdown, MFA-verified session rate, trusted devices, and users with multiple concurrent sessions.',
            'template_type': ReportType.ACCOUNTS_SESSION_ACTIVITY,
            'category': ReportCategory.OPERATIONAL,
            'sector': SectorType.ALL,
            'is_system': True,
            'is_published': True,
            'is_default': True,
            'is_popular': False,
            'has_prebuilt_charts': True,
            'has_dynamic_filters': False,
            'has_parameters': False,
            'layout_config': {'grid_columns': 12, 'row_height': 100},
            'widget_config': {
                'widgets': [
                    {'type': WidgetType.KPI, 'title': 'Active Sessions', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'MFA-Verified Sessions', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Trusted Devices', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Multi-Session Users', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.CHART, 'title': 'Sessions by Device Type', 'size': {'w': 4, 'h': 4}},
                    {'type': WidgetType.CHART, 'title': 'Sessions by Browser', 'size': {'w': 4, 'h': 4}},
                    {'type': WidgetType.CHART, 'title': 'Sessions by OS', 'size': {'w': 4, 'h': 4}},
                    {'type': WidgetType.TABLE, 'title': 'Users with Multiple Sessions', 'size': {'w': 12, 'h': 4}},
                ]
            },
            'filter_config': {'filters': []},
            'parameter_config': {'parameters': []},
            'chart_config': {'default_chart_type': 'pie', 'colors': ['#2563eb', '#10b981', '#f59e0b', '#ef4444']},
            'table_config': {'responsive': True, 'striped': True, 'bordered': True},
            'style_config': {'theme': 'light', 'font_family': 'Arial'},
            'export_config': {'formats': ['pdf', 'excel']},
            'applicable_industries': ['all'],
            'org_size': 0,
        }

    def _accounts_password_hygiene_template(self) -> Dict[str, Any]:
        return {
            'name': 'Password Age & Hygiene Audit',
            'description': 'Password health audit: age bucket distribution (0-30, 30-60, 60-90, 90+ days), forced-change required users, never-changed passwords, and reset activity.',
            'template_type': ReportType.ACCOUNTS_PASSWORD_HYGIENE,
            'category': ReportCategory.COMPLIANCE,
            'sector': SectorType.ALL,
            'is_system': True,
            'is_published': True,
            'is_default': True,
            'is_popular': False,
            'has_prebuilt_charts': True,
            'has_dynamic_filters': False,
            'has_parameters': False,
            'layout_config': {'grid_columns': 12, 'row_height': 100},
            'widget_config': {
                'widgets': [
                    {'type': WidgetType.KPI, 'title': 'Change Required', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Never Changed', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Overdue (90+ days)', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Resets Last 30d', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.CHART, 'title': 'Password Age Distribution', 'size': {'w': 8, 'h': 4}},
                    {'type': WidgetType.TABLE, 'title': 'Overdue Users (90+ days)', 'size': {'w': 12, 'h': 6}},
                ]
            },
            'filter_config': {'filters': []},
            'parameter_config': {'parameters': []},
            'chart_config': {'default_chart_type': 'bar', 'colors': ['#10b981', '#f59e0b', '#ef4444', '#dc2626']},
            'table_config': {'responsive': True, 'striped': True, 'bordered': True},
            'style_config': {'theme': 'light', 'font_family': 'Arial'},
            'export_config': {'formats': ['pdf', 'excel', 'csv']},
            'applicable_industries': ['all'],
            'org_size': 0,
        }

    def _accounts_security_anomalies_template(self) -> Dict[str, Any]:
        return {
            'name': 'Security Anomaly & Threat Detection Report',
            'description': 'Statistical anomaly detection in user activity (mean+2σ), brute-force IP detection (10+ failures), critical audit events, after-hours access patterns, and permission denial counts.',
            'template_type': ReportType.ACCOUNTS_SECURITY_ANOMALIES,
            'category': ReportCategory.COMPLIANCE,
            'sector': SectorType.ALL,
            'is_system': True,
            'is_published': True,
            'is_default': True,
            'is_popular': True,
            'has_prebuilt_charts': True,
            'has_dynamic_filters': True,
            'has_parameters': True,
            'layout_config': {'grid_columns': 12, 'row_height': 100},
            'widget_config': {
                'widgets': [
                    {'type': WidgetType.KPI, 'title': 'Anomalous Users', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Brute-Force IPs', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Critical Events', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'After-Hours Access', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.TABLE, 'title': 'Anomalous Users (2σ+ Activity)', 'size': {'w': 6, 'h': 4}},
                    {'type': WidgetType.TABLE, 'title': 'Brute-Force IPs', 'size': {'w': 6, 'h': 4}},
                    {'type': WidgetType.TABLE, 'title': 'Critical Events', 'size': {'w': 12, 'h': 6}},
                ]
            },
            'filter_config': {'filters': [{'field': 'days', 'type': 'number', 'default': 30}]},
            'parameter_config': {'parameters': [{'name': 'days', 'type': 'integer', 'default': 30, 'min': 7, 'max': 90}]},
            'chart_config': {'default_chart_type': 'bar', 'colors': ['#ef4444', '#dc2626', '#f59e0b', '#7c3aed']},
            'table_config': {'responsive': True, 'striped': True, 'bordered': True},
            'style_config': {'theme': 'dark', 'font_family': 'Arial'},
            'export_config': {'formats': ['pdf', 'excel']},
            'applicable_industries': ['all'],
            'org_size': 0,
        }

    def _accounts_executive_summary_template(self) -> Dict[str, Any]:
        return {
            'name': 'IAM & Security Executive Summary',
            'description': 'Executive overview of the complete IAM posture: total users, MFA adoption rate, active sessions, login success rate, password hygiene score, security events, and anomaly count with a calculated security score.',
            'template_type': ReportType.ACCOUNTS_EXECUTIVE_SUMMARY,
            'category': ReportCategory.STRATEGIC,
            'sector': SectorType.ALL,
            'is_system': True,
            'is_published': True,
            'is_default': True,
            'is_popular': True,
            'has_prebuilt_charts': True,
            'has_dynamic_filters': False,
            'has_parameters': False,
            'layout_config': {'grid_columns': 12, 'row_height': 100},
            'widget_config': {
                'widgets': [
                    {'type': WidgetType.KPI, 'title': 'Total Users', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'MFA Adoption Rate', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Active Sessions', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Security Score', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Login Success Rate', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Security Events', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Anomalous Users', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Passwords Overdue', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.TABLE, 'title': 'IAM & Security Executive Overview', 'size': {'w': 12, 'h': 4}},
                ]
            },
            'filter_config': {'filters': []},
            'parameter_config': {'parameters': []},
            'chart_config': {'default_chart_type': 'bar', 'colors': ['#2563eb', '#10b981', '#f59e0b', '#ef4444']},
            'table_config': {'responsive': True, 'striped': True, 'bordered': True},
            'style_config': {'theme': 'light', 'font_family': 'Arial'},
            'export_config': {'formats': ['pdf', 'excel']},
            'applicable_industries': ['all'],
            'org_size': 0,
        }

    def _billing_subscription_summary_template(self) -> Dict[str, Any]:
        return {
            'name': 'Tenant Subscription & MRR/ARR Report',
            'description': 'Subscription distribution report: active, trialing, past due, and cancelled counts, plan breakdown, billing interval split, MRR, and ARR.',
            'template_type': ReportType.BILLING_SUBSCRIPTION_SUMMARY,
            'category': ReportCategory.STRATEGIC,
            'sector': SectorType.ALL,
            'is_system': True,
            'is_published': True,
            'is_default': True,
            'is_popular': True,
            'has_prebuilt_charts': True,
            'has_dynamic_filters': False,
            'has_parameters': False,
            'layout_config': {'grid_columns': 12, 'row_height': 100},
            'widget_config': {
                'widgets': [
                    {'type': WidgetType.KPI, 'title': 'Total Subscriptions', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Active Subscriptions', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Monthly Recurring Revenue (MRR)', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Annual Recurring Revenue (ARR)', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.CHART, 'title': 'Plan Distribution', 'size': {'w': 6, 'h': 4}},
                    {'type': WidgetType.CHART, 'title': 'Billing Interval Split', 'size': {'w': 6, 'h': 4}},
                    {'type': WidgetType.TABLE, 'title': 'Subscription Details', 'size': {'w': 12, 'h': 6}},
                ]
            },
            'filter_config': {'filters': []},
            'parameter_config': {'parameters': []},
            'chart_config': {'default_chart_type': 'pie', 'colors': ['#10b981', '#2563eb', '#f59e0b', '#ef4444']},
            'table_config': {'responsive': True, 'striped': True, 'bordered': True},
            'style_config': {'theme': 'light', 'font_family': 'Arial'},
            'export_config': {'formats': ['pdf', 'excel', 'csv']},
            'applicable_industries': ['all'],
            'org_size': 0,
        }

    def _billing_revenue_financial_template(self) -> Dict[str, Any]:
        return {
            'name': 'Revenue Ledger & Tax (VAT) Report',
            'description': 'Financial revenue ledger: gross revenue, VAT tax collected, net revenue, paid vs outstanding invoice breakdown over configurable period.',
            'template_type': ReportType.BILLING_REVENUE_FINANCIAL,
            'category': ReportCategory.STRATEGIC,
            'sector': SectorType.ALL,
            'is_system': True,
            'is_published': True,
            'is_default': True,
            'is_popular': True,
            'has_prebuilt_charts': True,
            'has_dynamic_filters': True,
            'has_parameters': True,
            'layout_config': {'grid_columns': 12, 'row_height': 100},
            'widget_config': {
                'widgets': [
                    {'type': WidgetType.KPI, 'title': 'Gross Revenue', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'VAT Tax Collected', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Net Revenue', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Outstanding Amount', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.CHART, 'title': 'Invoice Status Breakdown', 'size': {'w': 6, 'h': 4}},
                    {'type': WidgetType.TABLE, 'title': 'Recent Invoices', 'size': {'w': 12, 'h': 6}},
                ]
            },
            'filter_config': {'filters': [{'field': 'days', 'type': 'number', 'default': 30}]},
            'parameter_config': {'parameters': [{'name': 'days', 'type': 'integer', 'default': 30, 'min': 1, 'max': 365}]},
            'chart_config': {'default_chart_type': 'bar', 'colors': ['#10b981', '#f59e0b', '#ef4444', '#7c3aed']},
            'table_config': {'responsive': True, 'striped': True, 'bordered': True},
            'style_config': {'theme': 'light', 'font_family': 'Arial'},
            'export_config': {'formats': ['pdf', 'excel', 'csv']},
            'applicable_industries': ['all'],
            'org_size': 0,
        }

    def _billing_payment_transactions_template(self) -> Dict[str, Any]:
        return {
            'name': 'Payment Transactions & Method Audit',
            'description': 'Transaction processing audit: success rate, transaction type breakdown, payment channels (card, bank, mobile money), and recent transactions.',
            'template_type': ReportType.BILLING_PAYMENT_TRANSACTIONS,
            'category': ReportCategory.OPERATIONAL,
            'sector': SectorType.ALL,
            'is_system': True,
            'is_published': True,
            'is_default': True,
            'is_popular': False,
            'has_prebuilt_charts': True,
            'has_dynamic_filters': True,
            'has_parameters': True,
            'layout_config': {'grid_columns': 12, 'row_height': 100},
            'widget_config': {
                'widgets': [
                    {'type': WidgetType.KPI, 'title': 'Total Transactions', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Transaction Success Rate', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Successful Transactions', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Saved Payment Methods', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.CHART, 'title': 'Transaction Types', 'size': {'w': 6, 'h': 4}},
                    {'type': WidgetType.CHART, 'title': 'Payment Channels', 'size': {'w': 6, 'h': 4}},
                    {'type': WidgetType.TABLE, 'title': 'Recent Transactions', 'size': {'w': 12, 'h': 6}},
                ]
            },
            'filter_config': {'filters': [{'field': 'days', 'type': 'number', 'default': 30}]},
            'parameter_config': {'parameters': [{'name': 'days', 'type': 'integer', 'default': 30, 'min': 1, 'max': 90}]},
            'chart_config': {'default_chart_type': 'bar', 'colors': ['#10b981', '#2563eb', '#f59e0b', '#ef4444']},
            'table_config': {'responsive': True, 'striped': True, 'bordered': True},
            'style_config': {'theme': 'light', 'font_family': 'Arial'},
            'export_config': {'formats': ['pdf', 'excel', 'csv']},
            'applicable_industries': ['all'],
            'org_size': 0,
        }

    def _billing_usage_quota_audit_template(self) -> Dict[str, Any]:
        return {
            'name': 'Tenant Usage & Quota Breach Audit',
            'description': 'Feature consumption metering: users, KPIs, storage MB, API calls, and 80%/90%/100% threshold alert breach tracking across tenants.',
            'template_type': ReportType.BILLING_USAGE_QUOTA_AUDIT,
            'category': ReportCategory.COMPLIANCE,
            'sector': SectorType.ALL,
            'is_system': True,
            'is_published': True,
            'is_default': True,
            'is_popular': False,
            'has_prebuilt_charts': True,
            'has_dynamic_filters': False,
            'has_parameters': False,
            'layout_config': {'grid_columns': 12, 'row_height': 100},
            'widget_config': {
                'widgets': [
                    {'type': WidgetType.KPI, 'title': 'Monitored Metrics', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': '80% Soft Alerts Sent', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': '90% Warning Alerts', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': '100% Limit Breaches', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.CHART, 'title': 'Usage Type Utilization', 'size': {'w': 6, 'h': 4}},
                    {'type': WidgetType.TABLE, 'title': 'High Utilization Tenants (>80%)', 'size': {'w': 12, 'h': 6}},
                ]
            },
            'filter_config': {'filters': []},
            'parameter_config': {'parameters': []},
            'chart_config': {'default_chart_type': 'bar', 'colors': ['#2563eb', '#10b981', '#f59e0b', '#ef4444']},
            'table_config': {'responsive': True, 'striped': True, 'bordered': True},
            'style_config': {'theme': 'light', 'font_family': 'Arial'},
            'export_config': {'formats': ['pdf', 'excel']},
            'applicable_industries': ['all'],
            'org_size': 0,
        }

    def _billing_dunning_recovery_template(self) -> Dict[str, Any]:
        return {
            'name': 'Dunning Pipeline & Payment Recovery Report',
            'description': 'Dunning recovery audit: retry attempt counts, pending vs recovered retries, past-due subscriptions, and active grace periods.',
            'template_type': ReportType.BILLING_DUNNING_RECOVERY,
            'category': ReportCategory.OPERATIONAL,
            'sector': SectorType.ALL,
            'is_system': True,
            'is_published': True,
            'is_default': True,
            'is_popular': False,
            'has_prebuilt_charts': True,
            'has_dynamic_filters': False,
            'has_parameters': False,
            'layout_config': {'grid_columns': 12, 'row_height': 100},
            'widget_config': {
                'widgets': [
                    {'type': WidgetType.KPI, 'title': 'Total Retry Attempts', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Successful Recoveries', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Recovery Success Rate', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Subscriptions In Grace Period', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.TABLE, 'title': 'Past-Due Subscriptions Queue', 'size': {'w': 12, 'h': 6}},
                ]
            },
            'filter_config': {'filters': []},
            'parameter_config': {'parameters': []},
            'chart_config': {'default_chart_type': 'bar', 'colors': ['#10b981', '#f59e0b', '#ef4444', '#7c3aed']},
            'table_config': {'responsive': True, 'striped': True, 'bordered': True},
            'style_config': {'theme': 'dark', 'font_family': 'Arial'},
            'export_config': {'formats': ['pdf', 'excel']},
            'applicable_industries': ['all'],
            'org_size': 0,
        }

    def _billing_executive_summary_template(self) -> Dict[str, Any]:
        return {
            'name': 'Billing & Monetization Executive Summary',
            'description': 'Master executive financial dashboard: MRR, ARR, active subscribers, gross revenue, net revenue, payment success rate, dunning recovery rate, and Financial Health Score.',
            'template_type': ReportType.BILLING_EXECUTIVE_SUMMARY,
            'category': ReportCategory.STRATEGIC,
            'sector': SectorType.ALL,
            'is_system': True,
            'is_published': True,
            'is_default': True,
            'is_popular': True,
            'has_prebuilt_charts': True,
            'has_dynamic_filters': False,
            'has_parameters': False,
            'layout_config': {'grid_columns': 12, 'row_height': 100},
            'widget_config': {
                'widgets': [
                    {'type': WidgetType.KPI, 'title': 'MRR', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'ARR', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Active Subscriptions', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Financial Health Score', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Gross Revenue', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Net Revenue', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Payment Success Rate', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Recovery Success Rate', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.TABLE, 'title': 'Monetization & Financial Executive Overview', 'size': {'w': 12, 'h': 4}},
                ]
            },
            'filter_config': {'filters': []},
            'parameter_config': {'parameters': []},
            'chart_config': {'default_chart_type': 'bar', 'colors': ['#10b981', '#2563eb', '#f59e0b', '#ef4444']},
            'table_config': {'responsive': True, 'striped': True, 'bordered': True},
            'style_config': {'theme': 'light', 'font_family': 'Arial'},
            'export_config': {'formats': ['pdf', 'excel']},
            'applicable_industries': ['all'],
            'org_size': 0,
        }

    def _reviews_individual_summary_template(self) -> Dict[str, Any]:
        return {
            'name': 'Individual 360 Performance Scorecard Report',
            'description': 'Individual employee review scorecard: self vs supervisor rating comparison, KPI score, competency score, final rating, and review status.',
            'template_type': ReportType.REVIEWS_INDIVIDUAL_SUMMARY,
            'category': ReportCategory.OPERATIONAL,
            'sector': SectorType.ALL,
            'is_system': True,
            'is_published': True,
            'is_default': True,
            'is_popular': True,
            'has_prebuilt_charts': True,
            'has_dynamic_filters': True,
            'has_parameters': True,
            'layout_config': {'grid_columns': 12, 'row_height': 100},
            'widget_config': {
                'widgets': [
                    {'type': WidgetType.KPI, 'title': 'Total Evaluated Employees', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.TABLE, 'title': 'Individual Performance Scorecards', 'size': {'w': 12, 'h': 6}},
                ]
            },
            'filter_config': {'filters': [{'field': 'cycle_id', 'type': 'select'}, {'field': 'employee_id', 'type': 'select'}]},
            'parameter_config': {'parameters': []},
            'chart_config': {'default_chart_type': 'bar', 'colors': ['#2563eb', '#10b981', '#f59e0b', '#ef4444']},
            'table_config': {'responsive': True, 'striped': True, 'bordered': True},
            'style_config': {'theme': 'light', 'font_family': 'Arial'},
            'export_config': {'formats': ['pdf', 'excel', 'csv']},
            'applicable_industries': ['all'],
            'org_size': 0,
        }

    def _reviews_cycle_compliance_template(self) -> Dict[str, Any]:
        return {
            'name': 'Review Cycle Compliance & Completion Status',
            'description': 'Review cycle completion audit: self-assessment submission %, supervisor review approval %, locked final rating %, and department compliance matrix.',
            'template_type': ReportType.REVIEWS_CYCLE_COMPLIANCE,
            'category': ReportCategory.COMPLIANCE,
            'sector': SectorType.ALL,
            'is_system': True,
            'is_published': True,
            'is_default': True,
            'is_popular': True,
            'has_prebuilt_charts': True,
            'has_dynamic_filters': True,
            'has_parameters': False,
            'layout_config': {'grid_columns': 12, 'row_height': 100},
            'widget_config': {
                'widgets': [
                    {'type': WidgetType.KPI, 'title': 'Total Participants', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Self-Assessments Submitted %', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Supervisor Reviews Approved %', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Overall Completion Rate %', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.TABLE, 'title': 'Department Compliance Matrix', 'size': {'w': 12, 'h': 6}},
                ]
            },
            'filter_config': {'filters': [{'field': 'cycle_id', 'type': 'select'}]},
            'parameter_config': {'parameters': []},
            'chart_config': {'default_chart_type': 'bar', 'colors': ['#10b981', '#2563eb', '#f59e0b', '#7c3aed']},
            'table_config': {'responsive': True, 'striped': True, 'bordered': True},
            'style_config': {'theme': 'light', 'font_family': 'Arial'},
            'export_config': {'formats': ['pdf', 'excel', 'csv']},
            'applicable_industries': ['all'],
            'org_size': 0,
        }

    def _reviews_organization_performance_template(self) -> Dict[str, Any]:
        return {
            'name': 'Organization Strategic Review & Bell Curve Report',
            'description': 'Tenant-level strategic performance review: overall average score, KPI vs Competency average split, bell-curve score distribution, top/weakest competencies, and department rankings.',
            'template_type': ReportType.REVIEWS_ORGANIZATION_PERFORMANCE,
            'category': ReportCategory.STRATEGIC,
            'sector': SectorType.ALL,
            'is_system': True,
            'is_published': True,
            'is_default': True,
            'is_popular': True,
            'has_prebuilt_charts': True,
            'has_dynamic_filters': True,
            'has_parameters': False,
            'layout_config': {'grid_columns': 12, 'row_height': 100},
            'widget_config': {
                'widgets': [
                    {'type': WidgetType.KPI, 'title': 'Average Overall Score', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Average KPI Score', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Average Competency Score', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Total Rated Employees', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.CHART, 'title': 'Rating Distribution (Bell Curve)', 'size': {'w': 6, 'h': 4}},
                    {'type': WidgetType.TABLE, 'title': 'Department Performance Rankings', 'size': {'w': 6, 'h': 4}},
                ]
            },
            'filter_config': {'filters': [{'field': 'cycle_id', 'type': 'select'}]},
            'parameter_config': {'parameters': []},
            'chart_config': {'default_chart_type': 'bar', 'colors': ['#2563eb', '#10b981', '#f59e0b', '#ef4444']},
            'table_config': {'responsive': True, 'striped': True, 'bordered': True},
            'style_config': {'theme': 'light', 'font_family': 'Arial'},
            'export_config': {'formats': ['pdf', 'excel']},
            'applicable_industries': ['all'],
            'org_size': 0,
        }

    def _reviews_calibration_impact_template(self) -> Dict[str, Any]:
        return {
            'name': 'Calibration Session & Score Shift Impact Audit',
            'description': 'Calibration session audit: total calibration sessions, completed sessions, total adjustments, score increases vs decreases count, and average score shift.',
            'template_type': ReportType.REVIEWS_CALIBRATION_IMPACT,
            'category': ReportCategory.COMPLIANCE,
            'sector': SectorType.ALL,
            'is_system': True,
            'is_published': True,
            'is_default': True,
            'is_popular': False,
            'has_prebuilt_charts': True,
            'has_dynamic_filters': True,
            'has_parameters': False,
            'layout_config': {'grid_columns': 12, 'row_height': 100},
            'widget_config': {
                'widgets': [
                    {'type': WidgetType.KPI, 'title': 'Total Calibration Sessions', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Adjustments Made', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Score Increases', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Score Decreases', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.TABLE, 'title': 'Calibration Sessions Queue', 'size': {'w': 12, 'h': 6}},
                ]
            },
            'filter_config': {'filters': [{'field': 'cycle_id', 'type': 'select'}]},
            'parameter_config': {'parameters': []},
            'chart_config': {'default_chart_type': 'bar', 'colors': ['#10b981', '#f59e0b', '#ef4444', '#7c3aed']},
            'table_config': {'responsive': True, 'striped': True, 'bordered': True},
            'style_config': {'theme': 'dark', 'font_family': 'Arial'},
            'export_config': {'formats': ['pdf', 'excel']},
            'applicable_industries': ['all'],
            'org_size': 0,
        }

    def _reviews_pip_tracker_template(self) -> Dict[str, Any]:
        return {
            'name': 'Performance Improvement Plan (PIP) Tracker',
            'description': 'Organization-wide PIP tracking: active PIPs, successful vs failed outcomes, action item completion rate %, missed action items, and employee PIP roster.',
            'template_type': ReportType.REVIEWS_PIP_TRACKER,
            'category': ReportCategory.OPERATIONAL,
            'sector': SectorType.ALL,
            'is_system': True,
            'is_published': True,
            'is_default': True,
            'is_popular': True,
            'has_prebuilt_charts': True,
            'has_dynamic_filters': False,
            'has_parameters': False,
            'layout_config': {'grid_columns': 12, 'row_height': 100},
            'widget_config': {
                'widgets': [
                    {'type': WidgetType.KPI, 'title': 'Total PIPs', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Active PIPs', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'PIP Success Rate %', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Action Item Completion Rate %', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.TABLE, 'title': 'PIP Roster & Outcomes', 'size': {'w': 12, 'h': 6}},
                ]
            },
            'filter_config': {'filters': []},
            'parameter_config': {'parameters': []},
            'chart_config': {'default_chart_type': 'pie', 'colors': ['#ef4444', '#10b981', '#f59e0b', '#7c3aed']},
            'table_config': {'responsive': True, 'striped': True, 'bordered': True},
            'style_config': {'theme': 'light', 'font_family': 'Arial'},
            'export_config': {'formats': ['pdf', 'excel', 'csv']},
            'applicable_industries': ['all'],
            'org_size': 0,
        }

    def _reviews_executive_summary_template(self) -> Dict[str, Any]:
        return {
            'name': 'Strategic Performance & Talent Executive Summary',
            'description': 'Master Executive Performance Dashboard: overall score average, review completion rate %, promotion-ready count, active PIP count, PIP success rate %, and calculated Talent Health Score.',
            'template_type': ReportType.REVIEWS_EXECUTIVE_SUMMARY,
            'category': ReportCategory.STRATEGIC,
            'sector': SectorType.ALL,
            'is_system': True,
            'is_published': True,
            'is_default': True,
            'is_popular': True,
            'has_prebuilt_charts': True,
            'has_dynamic_filters': False,
            'has_parameters': False,
            'layout_config': {'grid_columns': 12, 'row_height': 100},
            'widget_config': {
                'widgets': [
                    {'type': WidgetType.KPI, 'title': 'Overall Completion Rate %', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Average Overall Score', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Talent Health Score', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Promotion Ready Count', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Active PIPs', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'PIP Success Rate %', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Calibration Sessions Count', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.KPI, 'title': 'Total Rated Employees', 'size': {'w': 3, 'h': 2}},
                    {'type': WidgetType.TABLE, 'title': 'Strategic Performance & Talent Executive Overview', 'size': {'w': 12, 'h': 4}},
                ]
            },
            'filter_config': {'filters': []},
            'parameter_config': {'parameters': []},
            'chart_config': {'default_chart_type': 'bar', 'colors': ['#2563eb', '#10b981', '#f59e0b', '#ef4444']},
            'table_config': {'responsive': True, 'striped': True, 'bordered': True},
            'style_config': {'theme': 'light', 'font_family': 'Arial'},
            'export_config': {'formats': ['pdf', 'excel']},
            'applicable_industries': ['all'],
            'org_size': 0,
        }

    def get_all_prebuilt_templates(self) -> List[Dict[str, Any]]:
        return self.templates

    def get_prebuilt_template_by_id(self, template_id: str) -> Optional[Dict[str, Any]]:
        for template in self.templates:
            if template.get('name') == template_id:
                return template
        return None