# apps/reportplt/services/templates/prebuilt_templates.py
import json
from typing import Dict, Any, List, Optional
from django.db import transaction
from apps.reportplt.models import ReportTemplate
from apps.reportplt.constants import TemplateType, SectorType, ReportCategory, WidgetType

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

    def get_all_prebuilt_templates(self) -> List[Dict[str, Any]]:
        return self.templates

    def get_prebuilt_template_by_id(self, template_id: str) -> Optional[Dict[str, Any]]:
        for template in self.templates:
            if template.get('name') == template_id:
                return template
        return None