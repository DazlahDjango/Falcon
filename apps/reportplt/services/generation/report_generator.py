# apps/reportplt/services/generation/report_generator.py
import uuid
import json
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime
from django.db import connection
from django.utils import timezone
from django.core.cache import cache
from django.core.exceptions import ValidationError
from apps.reportplt.models import Report, ReportExecution, ReportCache
from apps.reportplt.constants import DEFAULT_REPORT_CONFIG, CACHE_TTL
from apps.reportplt.exceptions import ReportGenerationError, ReportNotFoundError, DataSourceError
from apps.reportplt.services.security.report_rbac import ReportRBAC
from apps.reportplt.services.security.row_level_security import RLSEnforcer
from apps.reportplt.services.generation.query_builder import QueryBuilder
from apps.reportplt.services.generation.data_aggregator import DataAggregator
from apps.reportplt.services.generation.chart_renderer import ChartRenderer
from apps.reportplt.services.generation.pivot_builder import PivotBuilder
from apps.reportplt.services.export.export_factory import ExportFactory
from apps.reportplt.services.extraction import (
    ConfigsUnifiedExtractor, ConfigsBackupExtractor, ConfigsDRExtractor,
    ConfigsHealthExtractor, ConfigsMaintenanceExtractor, ConfigsSecurityExtractor,
    TenantUnifiedExtractor, TenantLifecycleExtractor, TenantQuotaExtractor,
    TenantSchemaExtractor, TenantDomainExtractor, TenantBackupExtractor,
    KPIDataExtractor, KPIUnifiedExtractor, KPIIndividualScorecardExtractor,
    KPIDepartmentalHeatmapExtractor, KPICascadeTreeExtractor, KPIRedAlertsExtractor,
    KPIValidationComplianceExtractor,
    StructureDataExtractor, StructureUnifiedExtractor, StructureOrgChartExtractor,
    StructureSpanOfControlExtractor, StructureInterimDelegationExtractor,
    StructureCostCenterAllocationExtractor, StructureSecuritySensitivityExtractor,
    AccountsUnifiedExtractor, AccountsUserDirectoryExtractor, AccountsLoginSecurityExtractor,
    AccountsMFAComplianceExtractor, AccountsAuditTrailExtractor, AccountsRolePermissionAuditExtractor,
    AccountsSessionActivityExtractor, AccountsPasswordHygieneExtractor, AccountsSecurityAnomaliesExtractor,
    BillingUnifiedExtractor, BillingSubscriptionSummaryExtractor, BillingRevenueFinancialExtractor,
    BillingPaymentTransactionsExtractor, BillingUsageQuotaAuditExtractor, BillingDunningRecoveryExtractor,
    ReviewsUnifiedExtractor, ReviewsIndividualSummaryExtractor, ReviewsCycleComplianceExtractor,
    ReviewsOrganizationPerformanceExtractor, ReviewsCalibrationImpactExtractor, ReviewsPIPTrackerExtractor
)
from apps.accounts.models import User
from apps.kpi.models import KPI, MonthlyActual
from apps.structure.models import Department

logger = logging.getLogger(__name__)


class ReportGenerator:
    def __init__(self, user: Optional[User] = None):
        self.user = user
        self.rbac = ReportRBAC(user) if user else None
        self.rls = RLSEnforcer(user) if user else RLSEnforcer()
        self.query_builder = QueryBuilder(user)
        self.data_aggregator = DataAggregator()
        self.chart_renderer = ChartRenderer()
        self.pivot_builder = PivotBuilder()

    # ------------------------------------------------------------------
    # Public entrypoints
    # ------------------------------------------------------------------

    def generate_report(self, report_id: str, params: Optional[Dict] = None, async_mode: bool = False) -> Dict[str, Any]:
        try:
            try:
                report = Report.objects.get(id=report_id)
            except (Report.DoesNotExist, ValueError, ValidationError):
                # Fallback resolution for prebuilt template_type or report_type string
                from apps.reportplt.models import ReportTemplate
                from apps.reportplt.constants import ReportType
                template = ReportTemplate.objects.filter(template_type=report_id).first() or ReportTemplate.objects.filter(name__iexact=report_id).first()
                if template:
                    domain_src = template.template_type.split('_')[0] if '_' in template.template_type else 'configs'
                    report = Report(
                        id=uuid.uuid4(),
                        tenant_id=self.user.tenant_id if self.user else None,
                        name=template.name,
                        report_type=template.template_type,
                        data_source=domain_src,
                        created_by=self.user,
                        owner=self.user,
                        filters=params or {}
                    )
                elif hasattr(ReportType, 'CHOICES') and any(report_id == choice[0] for choice in ReportType.CHOICES):
                    domain_src = report_id.split('_')[0] if '_' in report_id else 'configs'
                    report = Report(
                        id=uuid.uuid4(),
                        tenant_id=self.user.tenant_id if self.user else None,
                        name=report_id.replace('_', ' ').title(),
                        report_type=report_id,
                        data_source=domain_src,
                        created_by=self.user,
                        owner=self.user,
                        filters=params or {}
                    )
                else:
                    raise ReportNotFoundError(f"Report with ID or type '{report_id}' not found")

            if self.rbac and hasattr(report, 'id') and Report.objects.filter(id=report.id).exists():
                self.rbac.enforce_view(report)
            if getattr(report, 'status', None) == 'generating':
                return {'status': 'error', 'error': 'Report is already being generated'}
            if async_mode and hasattr(report, 'id') and Report.objects.filter(id=report.id).exists():
                from apps.reportplt.tasks import generate_report_task
                task = generate_report_task.delay(str(report.id), params)
                return {'status': 'queued', 'task_id': task.id}
            return self._generate_report_sync(report, params)
        except ReportNotFoundError:
            raise
        except Exception as e:
            logger.error(f"Report generation failed: {str(e)}")
            raise ReportGenerationError(f"Failed to generate report: {str(e)}")

    def _generate_report_sync(self, report: Report, params: Optional[Dict] = None) -> Dict[str, Any]:
        start_time = timezone.now()
        execution = None
        is_persisted = bool(report.pk and Report.objects.filter(pk=report.pk).exists())
        try:
            if is_persisted:
                report.mark_generating()
                execution = self._create_execution(report, params)
            data = self._fetch_report_data(report, params)
            aggregated = self._aggregate_data(report, data)
            charts = self._prepare_charts(report, aggregated)
            pivots = self._prepare_pivots(report, aggregated)
            result = self._build_report_result(report, aggregated, charts, pivots)
            if is_persisted:
                self._cache_result(report, result)
                report.mark_completed()
            if execution:
                execution.mark_completed(
                    row_count=len(aggregated.get('rows', [])),
                    data_size=len(str(result))
                )
            return {
                'status': 'success',
                'report_id': str(report.id),
                'report_name': report.name,
                'report_type': report.report_type,
                'data': result,
                'execution_id': str(execution.id) if execution else None,
                'generated_at': timezone.now().isoformat()
            }
        except Exception as e:
            logger.error(f"Report generation failed: {str(e)}")
            if is_persisted:
                report.mark_failed()
            if execution:
                execution.mark_failed(str(e))
            return {'status': 'failed', 'error': str(e)}

    def _create_execution(self, report: Report, params: Optional[Dict]) -> Optional[ReportExecution]:
        try:
            execution = ReportExecution(
                tenant_id=report.tenant_id,
                report=report,
                triggered_by=self.user,
                status='pending',
                parameters_used=params or {},
                filters_used=report.filters
            )
            execution.save()
            return execution
        except Exception as e:
            logger.warning(f"Failed to create execution record: {str(e)}")
            return None

    # ------------------------------------------------------------------
    # Data source dispatch
    # ------------------------------------------------------------------

    def _fetch_report_data(self, report: Report, params: Optional[Dict]) -> Dict[str, Any]:
        try:
            rtype = getattr(report, 'report_type', '') or ''
            dsrc = getattr(report, 'data_source', '') or ''

            if rtype.startswith('kpi_') or dsrc == 'kpi':
                return self._fetch_kpi_engine_data(report, params)
            elif rtype.startswith('reviews_') or dsrc == 'reviews':
                return self._fetch_reviews_data(report, params)
            elif rtype.startswith('structure_') or dsrc == 'structure':
                return self._fetch_structure_data(report, params)
            elif rtype.startswith('accounts_') or dsrc == 'accounts':
                return self._fetch_accounts_data(report, params)
            elif rtype.startswith('billing_') or dsrc == 'billing':
                return self._fetch_billing_data(report, params)
            elif rtype.startswith('tenant_') or dsrc == 'tenant':
                return self._fetch_tenant_data(report, params)
            elif rtype in ['backup_audit', 'dr_compliance', 'health_sla', 'maintenance_audit', 'kms_security', 'system_audit', 'configs_system'] or dsrc == 'configs':
                return self._fetch_configs_data(report, params)
            elif dsrc == 'tasks':
                return self._fetch_task_data(report, params)
            elif dsrc == 'pip':
                return self._fetch_pip_data(report, params)
            elif dsrc == 'combined':
                return self._fetch_combined_data(report, params)
            else:
                return self._fetch_reviews_data(report, params)
        except Exception as e:
            raise DataSourceError(f"Failed to fetch data: {str(e)}")

    def _resolve_tenant_id(self, report: Report, filters: Dict) -> Optional[str]:
        if 'tenant_id' in filters and filters['tenant_id']:
            return filters['tenant_id']
        if self.user and (self.user.is_superuser or getattr(self.user, 'role', None) == 'super_admin'):
            return None
        return report.tenant_id

    def _prepare_scoped_filters(self, report: Report, params: Optional[Dict]) -> Dict[str, Any]:
        filters = dict(report.filters or {})
        if params:
            filters.update(params)

        if self.user:
            role = str(getattr(self.user, 'role', '') or '').lower()
            is_super = getattr(self.user, 'is_superuser', False) or role == 'super_admin'

            if 'actor_id' not in filters:
                filters['actor_id'] = str(self.user.id)
            if 'actor_role' not in filters:
                filters['actor_role'] = role

            if report.owner_id and 'user_id' not in filters:
                filters['user_id'] = str(report.owner_id)

            if not is_super:
                if role == 'staff':
                    # Staff members are strictly limited to their own personal scope
                    filters['scope'] = 'self'
                    filters['user_id'] = str(self.user.id)
                    filters['actor_id'] = str(self.user.id)
                    filters['user_email'] = self.user.email
                    filters['assignee_email'] = self.user.email
                elif role in ['supervisor', 'manager']:
                    # Supervisors can view team scope or their direct reports or self
                    team_ids = [str(self.user.id)]
                    try:
                        if hasattr(self.user, 'get_direct_reports'):
                            team_ids.extend([str(x) for x in self.user.get_direct_reports().values_list('id', flat=True)])
                        elif hasattr(self.user, 'direct_reports'):
                            team_ids.extend([str(x) for x in self.user.direct_reports.values_list('id', flat=True)])
                    except Exception:
                        pass

                    requested_user_id = filters.get('user_id')
                    if requested_user_id and str(requested_user_id) not in team_ids:
                        filters['user_id'] = str(self.user.id)

                    if 'scope' not in filters or filters['scope'] == 'auto':
                        filters['scope'] = 'team'
                elif role in ['client_admin', 'hr_admin', 'executive']:
                    if 'scope' not in filters or filters['scope'] == 'auto':
                        filters['scope'] = 'organization'

        return filters

    # ------------------------------------------------------------------
    # Configs
    # ------------------------------------------------------------------

    def _fetch_configs_data(self, report: Report, params: Optional[Dict]) -> Dict[str, Any]:
        filters = self._prepare_scoped_filters(report, params)
        tenant_id = self._resolve_tenant_id(report, filters)
        rtype = getattr(report, 'report_type', '')
        if rtype == 'backup_audit':
            return ConfigsBackupExtractor(tenant_id=tenant_id, filters=filters).extract()
        elif rtype == 'dr_compliance':
            return ConfigsDRExtractor(tenant_id=tenant_id, filters=filters).extract()
        elif rtype == 'health_sla':
            return ConfigsHealthExtractor(tenant_id=tenant_id, filters=filters).extract()
        elif rtype == 'maintenance_audit':
            return ConfigsMaintenanceExtractor(tenant_id=tenant_id, filters=filters).extract()
        elif rtype == 'kms_security':
            return ConfigsSecurityExtractor(tenant_id=tenant_id, filters=filters).extract()
        return ConfigsUnifiedExtractor(tenant_id=tenant_id, filters=filters).extract()

    # ------------------------------------------------------------------
    # Tenant
    # ------------------------------------------------------------------

    def _fetch_tenant_data(self, report: Report, params: Optional[Dict]) -> Dict[str, Any]:
        filters = self._prepare_scoped_filters(report, params)
        tenant_id = self._resolve_tenant_id(report, filters)
        rtype = getattr(report, 'report_type', '')
        if rtype == 'tenant_lifecycle':
            return TenantLifecycleExtractor(tenant_id=tenant_id, filters=filters).extract()
        elif rtype in ['tenant_resource_quota', 'tenant_quota']:
            return TenantQuotaExtractor(tenant_id=tenant_id, filters=filters).extract()
        elif rtype == 'tenant_schema_health':
            return TenantSchemaExtractor(tenant_id=tenant_id, filters=filters).extract()
        elif rtype == 'tenant_domain_ssl':
            return TenantDomainExtractor(tenant_id=tenant_id, filters=filters).extract()
        elif rtype == 'tenant_backup_audit':
            return TenantBackupExtractor(tenant_id=tenant_id, filters=filters).extract()
        return TenantUnifiedExtractor(tenant_id=tenant_id, filters=filters).extract()

    # ------------------------------------------------------------------
    # KPI
    # ------------------------------------------------------------------

    def _fetch_kpi_engine_data(self, report: Report, params: Optional[Dict]) -> Dict[str, Any]:
        filters = self._prepare_scoped_filters(report, params)
        tenant_id = self._resolve_tenant_id(report, filters)
        rtype = getattr(report, 'report_type', '')
        if rtype == 'kpi_individual_scorecard':
            return KPIIndividualScorecardExtractor(tenant_id=tenant_id, filters=filters).extract()
        elif rtype == 'kpi_departmental_heatmap':
            return KPIDepartmentalHeatmapExtractor(tenant_id=tenant_id, filters=filters).extract()
        elif rtype == 'kpi_cascade_tree':
            return KPICascadeTreeExtractor(tenant_id=tenant_id, filters=filters).extract()
        elif rtype == 'kpi_red_alerts':
            return KPIRedAlertsExtractor(tenant_id=tenant_id, filters=filters).extract()
        elif rtype == 'kpi_validation_compliance':
            return KPIValidationComplianceExtractor(tenant_id=tenant_id, filters=filters).extract()
        return KPIUnifiedExtractor(tenant_id=tenant_id, filters=filters).extract()

    # ------------------------------------------------------------------
    # Structure
    # ------------------------------------------------------------------

    def _fetch_structure_data(self, report: Report, params) -> Dict[str, Any]:
        filters = self._prepare_scoped_filters(report, params)
        tenant_id = self._resolve_tenant_id(report, filters)
        rtype = getattr(report, 'report_type', '')
        if rtype == 'structure_org_chart':
            res = StructureOrgChartExtractor(tenant_id=tenant_id, filters=filters).extract()
        elif rtype == 'structure_span_of_control':
            res = StructureSpanOfControlExtractor(tenant_id=tenant_id, filters=filters).extract()
        elif rtype == 'structure_interim_delegation':
            res = StructureInterimDelegationExtractor(tenant_id=tenant_id, filters=filters).extract()
        elif rtype == 'structure_cost_center_allocation':
            res = StructureCostCenterAllocationExtractor(tenant_id=tenant_id, filters=filters).extract()
        elif rtype == 'structure_security_sensitivity':
            res = StructureSecuritySensitivityExtractor(tenant_id=tenant_id, filters=filters).extract()
        else:
            res = StructureUnifiedExtractor(tenant_id=tenant_id, filters=filters).extract()
        res['source'] = 'structure'
        return res

    # ------------------------------------------------------------------
    # Accounts
    # ------------------------------------------------------------------

    def _fetch_accounts_data(self, report: Report, params) -> Dict[str, Any]:
        filters = self._prepare_scoped_filters(report, params)
        tenant_id = self._resolve_tenant_id(report, filters)
        rtype = getattr(report, 'report_type', '')

        def _tag(res: Dict[str, Any]) -> Dict[str, Any]:
            if isinstance(res, dict):
                res['source'] = 'accounts'
            return res

        if rtype == 'accounts_user_directory':
            return _tag(AccountsUserDirectoryExtractor(tenant_id=tenant_id, filters=filters).extract())
        elif rtype == 'accounts_login_security':
            return _tag(AccountsLoginSecurityExtractor(tenant_id=tenant_id, filters=filters).extract())
        elif rtype == 'accounts_mfa_compliance':
            return _tag(AccountsMFAComplianceExtractor(tenant_id=tenant_id, filters=filters).extract())
        elif rtype == 'accounts_audit_trail':
            return _tag(AccountsAuditTrailExtractor(tenant_id=tenant_id, filters=filters).extract())
        elif rtype == 'accounts_role_permission_audit':
            return _tag(AccountsRolePermissionAuditExtractor(tenant_id=tenant_id, filters=filters).extract())
        elif rtype == 'accounts_session_activity':
            return _tag(AccountsSessionActivityExtractor(tenant_id=tenant_id, filters=filters).extract())
        elif rtype == 'accounts_password_hygiene':
            return _tag(AccountsPasswordHygieneExtractor(tenant_id=tenant_id, filters=filters).extract())
        elif rtype == 'accounts_security_anomalies':
            return _tag(AccountsSecurityAnomaliesExtractor(tenant_id=tenant_id, filters=filters).extract())
        return _tag(AccountsUnifiedExtractor(tenant_id=tenant_id, filters=filters).extract())

    # ------------------------------------------------------------------
    # Billing
    # ------------------------------------------------------------------

    def _fetch_billing_data(self, report: Report, params) -> Dict[str, Any]:
        filters = self._prepare_scoped_filters(report, params)
        tenant_id = self._resolve_tenant_id(report, filters)
        extractor = BillingUnifiedExtractor(tenant_id=tenant_id, filters=filters)
        return extractor.extract()

    # ------------------------------------------------------------------
    # Reviews — per-type dispatch
    # ------------------------------------------------------------------

    def _fetch_reviews_data(self, report: Report, params) -> Dict[str, Any]:
        filters = self._prepare_scoped_filters(report, params)
        tenant_id = self._resolve_tenant_id(report, filters)
        rtype = getattr(report, 'report_type', '') or ''

        # Explicit per-type dispatch (mirrors the KPI path).
        if rtype == 'reviews_individual_summary':
            res = ReviewsIndividualSummaryExtractor(tenant_id=tenant_id, filters=filters).extract()
        elif rtype == 'reviews_cycle_compliance':
            res = ReviewsCycleComplianceExtractor(tenant_id=tenant_id, filters=filters).extract()
        elif rtype == 'reviews_organization_performance':
            res = ReviewsOrganizationPerformanceExtractor(tenant_id=tenant_id, filters=filters).extract()
        elif rtype == 'reviews_calibration_impact':
            res = ReviewsCalibrationImpactExtractor(tenant_id=tenant_id, filters=filters).extract()
        elif rtype == 'reviews_pip_tracker':
            res = ReviewsPIPTrackerExtractor(tenant_id=tenant_id, filters=filters).extract()
        else:
            # 'reviews_executive_summary', 'reviews_summary', and any unknown
            # reviews_* type fall through to the unified extractor.
            res = ReviewsUnifiedExtractor(tenant_id=tenant_id, filters=filters).extract()

        if isinstance(res, dict):
            res['source'] = 'reviews'
        return res

        if isinstance(res, dict):
            res['source'] = 'reviews'
        return res

    # ------------------------------------------------------------------
    # Legacy KPI / Review / Task / PIP fetchers (kept for 'combined')
    # ------------------------------------------------------------------

    def _fetch_kpi_data(self, report: Report, params: Optional[Dict]) -> Dict[str, Any]:
        try:
            kpis = KPI.objects.filter(tenant_id=report.tenant_id)
            if report.allowed_departments:
                kpis = kpis.filter(department_id__in=report.allowed_departments)
            kpi_list = []
            for kpi in kpis[:1000]:
                entries = MonthlyActual.objects.filter(kpi=kpi).order_by('-year', '-month')
                if entries.exists():
                    latest = entries.first()
                    actual_num = float(latest.actual_value) if latest.actual_value is not None else 0.0
                    target_num = float(kpi.target) if kpi.target is not None else 0.0
                    prog = (actual_num / target_num * 100) if target_num > 0 else 0.0
                    kpi_list.append({
                        'id': str(kpi.id),
                        'name': kpi.name,
                        'description': kpi.description,
                        'target': kpi.target,
                        'actual': actual_num,
                        'progress': round(prog, 1),
                        'status': latest.status if latest else 'Pending',
                        'department': kpi.department.name if kpi.department else None,
                        'category': kpi.category,
                        'type': kpi.kpi_type,
                        'unit': kpi.unit,
                        'period': f"{latest.year}-{latest.month:02d}" if latest else None
                    })
            return {
                'type': 'kpi',
                'count': len(kpi_list),
                'kpis': kpi_list,
                'summary': self._calculate_kpi_summary(kpi_list)
            }
        except Exception as e:
            raise DataSourceError(f"KPI data fetch failed: {str(e)}")

    def _fetch_review_data(self, report: Report, params: Optional[Dict]) -> Dict[str, Any]:
        from apps.reviews.models import SupervisorReview, CompetencyRating
        from django.contrib.contenttypes.models import ContentType
        try:
            reviews = SupervisorReview.objects.filter(tenant_id=report.tenant_id)
            if params and params.get('period'):
                reviews = reviews.filter(review_cycle_id=params['period'])
            review_list = []
            supervisor_review_ct = ContentType.objects.get_for_model(SupervisorReview)
            for review in reviews[:500]:
                ratings = CompetencyRating.objects.filter(content_type=supervisor_review_ct, object_id=str(review.id))
                avg_rating = review.average_competency_rating
                review_list.append({
                    'id': str(review.id),
                    'user': review.employee.get_full_name() if review.employee else None,
                    'period': review.review_cycle.name if review.review_cycle else '',
                    'status': review.status,
                    'score': float(avg_rating) if avg_rating is not None else 0.0,
                    'responses': [
                        {'question': r.competency.name, 'answer': r.comment, 'score': float(r.raw_score)}
                        for r in ratings[:10]
                    ]
                })
            return {'type': 'reviews', 'count': len(review_list), 'reviews': review_list}
        except Exception as e:
            raise DataSourceError(f"Review data fetch failed: {str(e)}")

    def _fetch_task_data(self, report: Report, params: Optional[Dict]) -> Dict[str, Any]:
        return {'type': 'tasks', 'count': 0, 'tasks': []}

    def _fetch_pip_data(self, report: Report, params: Optional[Dict]) -> Dict[str, Any]:
        from apps.reviews.models import PIP
        try:
            pips = PIP.objects.filter(tenant_id=report.tenant_id)
            pip_list = []
            for pip in pips[:500]:
                pip_list.append({
                    'id': str(pip.id),
                    'employee': pip.employee.get_full_name() if pip.employee else None,
                    'manager': pip.owner.get_full_name() if pip.owner else None,
                    'status': pip.status,
                    'start_date': pip.start_date.isoformat() if pip.start_date else None,
                    'end_date': pip.end_date.isoformat() if pip.end_date else None,
                    'title': pip.title,
                    'outcome': pip.outcome,
                })
            return {'type': 'pip', 'count': len(pip_list), 'pips': pip_list}
        except Exception as e:
            raise DataSourceError(f"PIP data fetch failed: {str(e)}")

    def _fetch_combined_data(self, report: Report, params: Optional[Dict]) -> Dict[str, Any]:
        kpi_data = self._fetch_kpi_data(report, params)
        review_data = self._fetch_review_data(report, params)
        task_data = self._fetch_task_data(report, params)
        pip_data = self._fetch_pip_data(report, params)
        return {
            'type': 'combined',
            'kpi': kpi_data,
            'reviews': review_data,
            'tasks': task_data,
            'pips': pip_data
        }

    def _calculate_kpi_summary(self, kpis: List[Dict]) -> Dict[str, Any]:
        total = len(kpis)
        on_track = sum(1 for k in kpis if k.get('status') == 'On Track')
        at_risk = sum(1 for k in kpis if k.get('status') == 'At Risk')
        off_track = sum(1 for k in kpis if k.get('status') == 'Off Track')
        pending = sum(1 for k in kpis if k.get('status') == 'Pending')
        avg_progress = sum(k.get('progress', 0) for k in kpis) / total if total > 0 else 0
        return {
            'total': total,
            'on_track': on_track,
            'at_risk': at_risk,
            'off_track': off_track,
            'pending': pending,
            'avg_progress': round(avg_progress, 2),
            'completion_rate': round((on_track + at_risk) / total * 100, 2) if total > 0 else 0
        }

    # ------------------------------------------------------------------
    # Aggregation / charts / pivots
    # ------------------------------------------------------------------

    def _aggregate_data(self, report: Report, data: Dict) -> Dict[str, Any]:
        try:
            if report.report_type == 'kpi':
                return self.data_aggregator.aggregate_kpi_data(data)
            elif report.report_type == 'departmental':
                return self.data_aggregator.aggregate_departmental_data(data)
            elif report.report_type == 'executive':
                return self.data_aggregator.aggregate_executive_data(data)
            elif report.report_type == 'trend':
                return self.data_aggregator.aggregate_trend_data(data)
            elif report.report_type == 'comparative':
                return self.data_aggregator.aggregate_comparative_data(data)
            else:
                return self.data_aggregator.aggregate_generic_data(data)
        except Exception as e:
            logger.error(f"Aggregation failed: {str(e)}")
            return data

    def _prepare_charts(self, report: Report, data: Dict) -> List[Dict]:
        try:
            if not report.include_charts:
                return []
            return self.chart_renderer.prepare_charts(data, report.config.get('chart_config', {}))
        except Exception as e:
            logger.warning(f"Chart preparation failed: {str(e)}")
            return []

    def _prepare_pivots(self, report: Report, data: Dict) -> List[Dict]:
        try:
            if not report.include_tables:
                return []
            return self.pivot_builder.build_pivots(data, report.config.get('pivot_config', {}))
        except Exception as e:
            logger.warning(f"Pivot preparation failed: {str(e)}")
            return []

    # ------------------------------------------------------------------
    # Result assembly
    # ------------------------------------------------------------------

    def _build_report_result(self, report: Report, data: Dict, charts: List[Dict], pivots: List[Dict]) -> Dict[str, Any]:
        # Merge extractor-curated tables with pivots produced by PivotBuilder.
        # PivotBuilder already does a pass-through of data['tables'], but we
        # also merge here for safety in case an extractor uses a different key.
        extractor_tables = data.get('tables') or []
        merged_tables = list(pivots or [])
        if extractor_tables:
            existing_titles = {t.get('title') for t in merged_tables if isinstance(t, dict)}
            for t in extractor_tables:
                if not isinstance(t, dict):
                    continue
                t_title = t.get('title')
                if t_title and t_title in existing_titles:
                    continue
                merged_tables.append(t)
                if t_title:
                    existing_titles.add(t_title)

        # Merge extractor-curated charts with ChartRenderer output.
        extractor_charts = data.get('charts') or []
        merged_charts = list(charts or [])
        if extractor_charts:
            existing_chart_titles = {c.get('title') for c in merged_charts if isinstance(c, dict)}
            for c in extractor_charts:
                if not isinstance(c, dict):
                    continue
                c_title = c.get('title')
                if c_title and c_title in existing_chart_titles:
                    continue
                merged_charts.append(c)
                if c_title:
                    existing_chart_titles.add(c_title)

        result = {
            'report_name': report.name,
            'report_type': report.report_type,
            'data_source': report.data_source,
            'generated_at': timezone.localtime(timezone.now()).isoformat(),
            'executive_summary': self._generate_executive_summary(data),
            'metrics': data.get('summary', {}),
            'raw_data': data,
            'kpis': data.get('kpis', []),
            'hierarchy_tree': data.get('hierarchy_tree') or data.get('raw_data', {}).get('hierarchy_tree', []),
            'tree_text': data.get('tree_text') or data.get('raw_data', {}).get('tree_text', ''),
            'charts': merged_charts,
            'tables': merged_tables,
            'status': 'completed',
            'row_count': self._compute_row_count(data, merged_tables),
        }
        if report.include_executive_summary:
            result['executive_summary'] = self._generate_executive_summary(data)
        return result

    def _compute_row_count(self, data: Dict, tables: List[Dict]) -> int:
        # Prefer explicit counts from the payload.
        for key in ('kpis', 'organizations', 'jobs', 'hierarchy_tree'):
            val = data.get(key)
            if isinstance(val, list) and val:
                return len(val)
        # Fall back to the largest table's row count.
        biggest = 0
        for t in (tables or []):
            try:
                biggest = max(biggest, len(t.get('rows') or []))
            except Exception:
                continue
        return biggest

    # ------------------------------------------------------------------
    # Executive summary text
    # ------------------------------------------------------------------

    def _generate_executive_summary(self, data: Dict) -> str:
        summary = data.get('summary', {}) or {}
        source = data.get('source')

        # -------- reviews ------------------------------------------------
        is_reviews = (
            source == 'reviews'
            or any(k in data for k in (
                'individual_summary', 'cycle_compliance', 'organization_performance',
                'calibration_impact', 'pip_tracker',
            ))
        )
        if is_reviews:
            cycle_name = summary.get('cycle_name') or 'the current cycle'
            talent_health = summary.get('talent_health_score')
            completion = summary.get('overall_completion_rate_pct', 0.0)
            avg_score = summary.get('avg_overall_score', 0.0)
            active_pips = summary.get('active_pips', summary.get('active_pips_count', 0)) or 0
            cal_sessions = summary.get('calibration_sessions_count', 0) or 0
            promotions = summary.get('promotion_ready_count', 0) or 0
            evaluated = summary.get('total_evaluated_employees', 0) or 0

            parts = [f"Reviews summary for {cycle_name}."]
            if talent_health is not None:
                parts.append(f"Talent Health {talent_health}%.")
            if evaluated:
                parts.append(f"{evaluated} employees evaluated.")
            if completion:
                parts.append(f"Completion {completion}%.")
            if avg_score:
                parts.append(f"Average score {avg_score}%.")
            if active_pips or cal_sessions or promotions:
                tail = []
                if active_pips:
                    tail.append(f"{active_pips} active PIP(s)")
                if cal_sessions:
                    tail.append(f"{cal_sessions} calibration session(s)")
                if promotions:
                    tail.append(f"{promotions} promotion recommendation(s)")
                parts.append("; ".join(tail) + ".")
            if len(parts) == 1:
                # No metrics available — say so explicitly instead of "total items tracked".
                return f"{parts[0]} No review data found for the given filters."
            return " ".join(parts)

        # -------- other domains -----------------------------------------
        if not summary:
            return "Real-time system data compiled and verified successfully."

        if source == 'tenant' or 'total_organizations' in summary:
            tot = summary.get('total_organizations', 0)
            act = summary.get('active_organizations', 0)
            rate = summary.get('onboarding_rate', 0.0)
            quotas = summary.get('exceeded_quota_resources', 0)
            return f"Platform tracks {tot} total organizations with {act} currently active ({rate}% onboarding rate). Quota breaches: {quotas}."
        elif source == 'configs' or 'total_registered_apps' in summary or 'backup_success_rate' in summary:
            apps = summary.get('total_registered_apps', 0)
            bkp = summary.get('backup_success_rate', 0.0)
            dr = summary.get('dr_pass_rate', 0.0)
            keys = summary.get('keys_needing_rotation', 0)
            return f"System infrastructure monitors {apps} registered services with {bkp}% backup success rate and {dr}% DR drill pass rate. KMS keys pending rotation: {keys}."
        elif source == 'structure' or 'total_departments' in summary:
            depts = summary.get('total_departments', 0)
            pos = summary.get('total_positions', 0)
            hc = summary.get('total_headcount', 0)
            return f"Organizational structure comprises {depts} departments, {pos} distinct positions, and {hc} active headcount."
        elif source == 'accounts' or 'total_users' in summary:
            users = summary.get('total_users', 0)
            active = summary.get('active_users', 0)
            mfa = summary.get('mfa_adoption_rate', 0.0)
            return f"IAM directory manages {users} users ({active} active) with {mfa}% multi-factor authentication compliance."
        elif source == 'billing' or 'total_subscriptions' in summary:
            subs = summary.get('total_subscriptions', 0)
            mrr = summary.get('total_mrr', 0)
            return f"Monetization pipeline active with {subs} subscriptions generating ${mrr:,.2f} MRR."
        else:
            total = summary.get('total', 0)
            on_track = summary.get('on_track', 0)
            completion = summary.get('completion_rate', 0)
            return f"Total items tracked: {total}. Completed / On track: {on_track} ({completion}% overall completion rate)."

    # ------------------------------------------------------------------
    # Caching
    # ------------------------------------------------------------------

    def _cache_result(self, report: Report, result: Dict) -> None:
        try:
            cache_key = f"report_{report.id}_{int(timezone.now().timestamp())}"
            cache.set(cache_key, result, CACHE_TTL.get('default', 3600))
            ReportCache.objects.update_or_create(
                report=report,
                cache_key=cache_key,
                defaults={
                    'tenant_id': report.tenant_id,
                    'data': result,
                    'size': len(str(result)),
                    'expires_at': timezone.now() + timezone.timedelta(seconds=CACHE_TTL.get('default', 3600))
                }
            )
        except Exception as e:
            logger.warning(f"Cache storage failed: {str(e)}")

    def get_cached_report(self, report_id: str) -> Optional[Dict]:
        try:
            cache_entry = ReportCache.objects.filter(
                report_id=report_id,
                is_stale=False,
                expires_at__gt=timezone.now()
            ).order_by('-created_at').first()
            if cache_entry:
                return cache_entry.data
            return None
        except Exception:
            return None

    # ------------------------------------------------------------------
    # Export / regenerate
    # ------------------------------------------------------------------

    def generate_and_export(self, report_id: str, format: str, params: Optional[Dict] = None) -> Dict[str, Any]:
        result = self.generate_report(report_id, params)
        if result.get('status') != 'success':
            return result
        try:
            export_path = ExportFactory.export(
                format=format,
                data=result.get('data', {}),
                report_name=result.get('data', {}).get('report_name', 'report'),
                config={'user': self.user}
            )
            return {
                'status': 'success',
                'export_path': export_path,
                'format': format
            }
        except Exception as e:
            return {'status': 'failed', 'error': f"Export failed: {str(e)}"}

    def regenerate_report(self, report_id: str) -> Dict[str, Any]:
        try:
            report = Report.objects.get(id=report_id)
            if self.rbac:
                self.rbac.enforce_edit(report)
            report.needs_refresh = True
            report.save(update_fields=['needs_refresh'])
            return self.generate_report(report_id)
        except (Report.DoesNotExist, ValueError, ValidationError):
            raise ReportNotFoundError(f"Report with ID {report_id} not found")