# apps/reportplt/services/generation/report_generator.py
import uuid
import json
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime
from django.db import connection
from django.utils import timezone
from django.core.cache import cache
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
from apps.reportplt.services.extraction import ConfigsUnifiedExtractor, TenantUnifiedExtractor, KPIUnifiedExtractor, StructureUnifiedExtractor, AccountsUnifiedExtractor, BillingUnifiedExtractor, ReviewsUnifiedExtractor
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

    def generate_report(self, report_id: str, params: Optional[Dict] = None, async_mode: bool = False) -> Dict[str, Any]:
        try:
            try:
                report = Report.objects.get(id=report_id)
            except (Report.DoesNotExist, ValueError):
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
                execution.mark_completed(row_count=len(aggregated.get('rows', [])), data_size=len(str(result)))
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

    def _fetch_report_data(self, report: Report, params: Optional[Dict]) -> Dict[str, Any]:
        try:
            if report.data_source == 'tasks':
                return self._fetch_task_data(report, params)
            elif report.data_source == 'pip':
                return self._fetch_pip_data(report, params)
            elif report.data_source == 'combined':
                return self._fetch_combined_data(report, params)
            elif report.data_source == 'configs' or report.report_type in [
                'backup_audit', 'dr_compliance', 'health_sla', 'maintenance_audit',
                'kms_security', 'system_audit', 'tenant_quota', 'risk_matrix', 'configs_system'
            ]:
                return self._fetch_configs_data(report, params)
            elif report.data_source == 'tenant' or report.report_type in [
                'tenant_lifecycle', 'tenant_resource_quota', 'tenant_schema_health',
                'tenant_domain_ssl', 'tenant_backup_audit', 'tenant_executive_summary', 'tenant_platform'
            ]:
                return self._fetch_tenant_data(report, params)
            elif report.data_source == 'kpi' or report.report_type in [
                'kpi_individual_scorecard', 'kpi_departmental_heatmap', 'kpi_cascade_tree',
                'kpi_red_alerts', 'kpi_validation_compliance', 'kpi_executive_summary', 'kpi_performance'
            ]:
                return self._fetch_kpi_engine_data(report, params)
            elif report.data_source == 'structure' or report.report_type in [
                'structure_org_chart', 'structure_span_of_control', 'structure_interim_delegation',
                'structure_cost_center_allocation', 'structure_security_sensitivity', 'structure_executive_summary', 'structure_summary'
            ]:
                return self._fetch_structure_data(report, params)
            elif report.data_source == 'accounts' or report.report_type in [
                'accounts_user_directory', 'accounts_login_security', 'accounts_mfa_compliance',
                'accounts_audit_trail', 'accounts_role_permission_audit', 'accounts_session_activity',
                'accounts_password_hygiene', 'accounts_security_anomalies', 'accounts_executive_summary'
            ]:
                return self._fetch_accounts_data(report, params)
            elif report.data_source == 'billing' or report.report_type in [
                'billing_subscription_summary', 'billing_revenue_financial', 'billing_payment_transactions',
                'billing_usage_quota_audit', 'billing_dunning_recovery', 'billing_executive_summary',
                'billing_summary', 'billing_usage'
            ]:
                return self._fetch_billing_data(report, params)
            elif report.data_source == 'reviews' or report.report_type in [
                'reviews_individual_summary', 'reviews_cycle_compliance', 'reviews_organization_performance',
                'reviews_calibration_impact', 'reviews_pip_tracker', 'reviews_executive_summary',
                'reviews_summary'
            ]:
                return self._fetch_reviews_data(report, params)
            else:
                raise DataSourceError(f"Unsupported data source: {report.data_source}")
        except Exception as e:
            raise DataSourceError(f"Failed to fetch data: {str(e)}")

    def _fetch_configs_data(self, report: Report, params: Optional[Dict]) -> Dict[str, Any]:
        filters = report.filters or {}
        if params:
            filters.update(params)
        extractor = ConfigsUnifiedExtractor(tenant_id=report.tenant_id, filters=filters)
        return extractor.extract()

    def _fetch_tenant_data(self, report: Report, params: Optional[Dict]) -> Dict[str, Any]:
        filters = report.filters or {}
        if params:
            filters.update(params)
        extractor = TenantUnifiedExtractor(tenant_id=report.tenant_id, filters=filters)
        return extractor.extract()

    def _fetch_kpi_engine_data(self, report: Report, params: Optional[Dict]) -> Dict[str, Any]:
        filters = report.filters or {}
        if params:
            filters.update(params)
        extractor = KPIUnifiedExtractor(tenant_id=report.tenant_id, filters=filters)
        return extractor.extract()

    def _fetch_structure_data(self, report: Report, params) -> Dict[str, Any]:
        filters = report.filters or {}
        if params:
            filters.update(params)
        extractor = StructureUnifiedExtractor(tenant_id=report.tenant_id, filters=filters)
        return extractor.extract()

    def _fetch_accounts_data(self, report: Report, params) -> Dict[str, Any]:
        filters = report.filters or {}
        if params:
            filters.update(params)
        extractor = AccountsUnifiedExtractor(tenant_id=report.tenant_id, filters=filters)
        return extractor.extract()

    def _fetch_billing_data(self, report: Report, params) -> Dict[str, Any]:
        filters = report.filters or {}
        if params:
            filters.update(params)
        extractor = BillingUnifiedExtractor(tenant_id=report.tenant_id, filters=filters)
        return extractor.extract()

    def _fetch_reviews_data(self, report: Report, params) -> Dict[str, Any]:
        filters = report.filters or {}
        if params:
            filters.update(params)
        extractor = ReviewsUnifiedExtractor(tenant_id=report.tenant_id, filters=filters)
        return extractor.extract()



    def _fetch_kpi_data(self, report: Report, params: Optional[Dict]) -> Dict[str, Any]:
        try:
            kpis = KPI.objects.filter(tenant_id=report.tenant_id)
            if report.allowed_departments:
                kpis = kpis.filter(department_id__in=report.allowed_departments)
            kpi_list = []
            for kpi in kpis[:1000]:
                entries = MonthlyActual.objects.filter(kpi=kpi).order_by('-period')
                if entries.exists():
                    latest = entries.first()
                    kpi_list.append({
                        'id': str(kpi.id),
                        'name': kpi.name,
                        'description': kpi.description,
                        'target': kpi.target,
                        'actual': latest.actual if latest else 0,
                        'progress': latest.progress if latest else 0,
                        'status': latest.status if latest else 'Pending',
                        'department': kpi.department.name if kpi.department else None,
                        'category': kpi.category,
                        'type': kpi.kpi_type,
                        'unit': kpi.unit,
                        'period': latest.period.isoformat() if latest and latest.period else None
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
                    'responses': [{'question': r.competency.name, 'answer': r.comment, 'score': float(r.raw_score)} for r in ratings[:10]]
                })
            return {'type': 'reviews', 'count': len(review_list), 'reviews': review_list}
        except Exception as e:
            raise DataSourceError(f"Review data fetch failed: {str(e)}")

    def _fetch_task_data(self, report: Report, params: Optional[Dict]) -> Dict[str, Any]:
        from apps.tasks_module.models import Task
        try:
            tasks = Task.objects.filter(tenant_id=report.tenant_id)
            if params and params.get('status'):
                tasks = tasks.filter(status=params['status'])
            task_list = []
            for task in tasks[:500]:
                task_list.append({
                    'id': str(task.id),
                    'title': task.title,
                    'description': task.description,
                    'status': task.status,
                    'priority': task.priority,
                    'assigned_to': task.assigned_to.get_full_name() if task.assigned_to else None,
                    'created_by': task.created_by.get_full_name() if task.created_by else None,
                    'due_date': task.due_date.isoformat() if task.due_date else None,
                    'progress': task.progress
                })
            return {'type': 'tasks', 'count': len(task_list), 'tasks': task_list}
        except Exception as e:
            raise DataSourceError(f"Task data fetch failed: {str(e)}")

    def _fetch_pip_data(self, report: Report, params: Optional[Dict]) -> Dict[str, Any]:
        from apps.reviews.models import PerformanceImprovementPlan
        try:
            pips = PerformanceImprovementPlan.objects.filter(tenant_id=report.tenant_id)
            pip_list = []
            for pip in pips[:500]:
                pip_list.append({
                    'id': str(pip.id),
                    'employee': pip.employee.get_full_name() if pip.employee else None,
                    'manager': pip.manager.get_full_name() if pip.manager else None,
                    'status': pip.status,
                    'start_date': pip.start_date.isoformat() if pip.start_date else None,
                    'end_date': pip.end_date.isoformat() if pip.end_date else None,
                    'improvement_areas': pip.improvement_areas,
                    'actions': pip.actions
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

    def _build_report_result(self, report: Report, data: Dict, charts: List[Dict], pivots: List[Dict]) -> Dict[str, Any]:
        result = {
            'report_name': report.name,
            'report_type': report.report_type,
            'generated_at': timezone.now().isoformat(),
            'executive_summary': self._generate_executive_summary(data),
            'metrics': data.get('summary', {}),
            'kpis': data.get('kpis', []),
            'charts': charts,
            'tables': pivots,
            'status': 'completed',
            'row_count': len(data.get('kpis', []))
        }
        if report.include_executive_summary:
            result['executive_summary'] = self._generate_executive_summary(data)
        return result

    def _generate_executive_summary(self, data: Dict) -> str:
        summary = data.get('summary', {})
        if not summary:
            return "No summary data available."
        total = summary.get('total', 0)
        on_track = summary.get('on_track', 0)
        at_risk = summary.get('at_risk', 0)
        off_track = summary.get('off_track', 0)
        completion = summary.get('completion_rate', 0)
        return f"Total KPIs: {total}. On Track: {on_track} ({round(on_track/total*100 if total else 0, 1)}%), At Risk: {at_risk} ({round(at_risk/total*100 if total else 0, 1)}%), Off Track: {off_track} ({round(off_track/total*100 if total else 0, 1)}%). Overall completion rate: {completion}%."

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
        except Report.DoesNotExist:
            raise ReportNotFoundError(f"Report with ID {report_id} not found")