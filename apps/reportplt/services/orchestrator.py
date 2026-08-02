import time
from typing import Dict, Any
from django.db import transaction
from apps.reportplt.models import GeneratedReport, ReportAuditLog
from apps.reportplt.constants import ExportFormat, GenerationStatus, AuditActionType
from apps.reportplt.services.extraction import (
    KPIDataExtractor,
    ReviewsDataExtractor,
    UnifiedPerformanceExtractor,
    StructureDataExtractor,
    AuditDataExtractor,
    TenantHealthDataExtractor,
    BillingDataExtractor,
    ConfigsUnifiedExtractor,
    ConfigsBackupExtractor,
    ConfigsDRExtractor,
    ConfigsHealthExtractor,
    ConfigsMaintenanceExtractor,
    ConfigsSecurityExtractor,
    TenantUnifiedExtractor,
    TenantLifecycleExtractor,
    TenantQuotaExtractor,
    TenantSchemaExtractor,
    TenantDomainExtractor,
    TenantBackupExtractor,
    KPIUnifiedExtractor,
    KPIIndividualScorecardExtractor,
    KPIDepartmentalHeatmapExtractor,
    KPICascadeTreeExtractor,
    KPIRedAlertsExtractor,
    KPIValidationComplianceExtractor,
    StructureUnifiedExtractor,
    StructureOrgChartExtractor,
    StructureSpanOfControlExtractor,
    StructureInterimDelegationExtractor,
    StructureCostCenterAllocationExtractor,
    StructureSecuritySensitivityExtractor,
    AccountsUnifiedExtractor,
    AccountsUserDirectoryExtractor,
    AccountsLoginSecurityExtractor,
    AccountsMFAComplianceExtractor,
    AccountsAuditTrailExtractor,
    AccountsRolePermissionAuditExtractor,
    AccountsSessionActivityExtractor,
    AccountsPasswordHygieneExtractor,
    AccountsSecurityAnomaliesExtractor,
    BillingUnifiedExtractor,
    BillingSubscriptionSummaryExtractor,
    BillingRevenueFinancialExtractor,
    BillingPaymentTransactionsExtractor,
    BillingUsageQuotaAuditExtractor,
    BillingDunningRecoveryExtractor,
    ReviewsUnifiedExtractor,
    ReviewsIndividualSummaryExtractor,
    ReviewsCycleComplianceExtractor,
    ReviewsOrganizationPerformanceExtractor,
    ReviewsCalibrationImpactExtractor,
    ReviewsPIPTrackerExtractor
)
from apps.reportplt.services.rendering import (
    PDFDocumentRenderer,
    ExcelDocumentRenderer,
    CSVDocumentRenderer,
    JSONDocumentRenderer
)

class ReportEngineService:
    EXTRACTORS = {
        'kpi_performance': KPIUnifiedExtractor,
        'reviews_summary': ReviewsDataExtractor,
        'unified_performance_360': UnifiedPerformanceExtractor,
        'structure_summary': StructureUnifiedExtractor,
        'audit_trail': AuditDataExtractor,
        'tenant_health': TenantHealthDataExtractor,
        'billing_usage': BillingDataExtractor,
        'configs_system': ConfigsUnifiedExtractor,
        'backup_audit': ConfigsBackupExtractor,
        'dr_compliance': ConfigsDRExtractor,
        'health_sla': ConfigsHealthExtractor,
        'maintenance_audit': ConfigsMaintenanceExtractor,
        'kms_security': ConfigsSecurityExtractor,
        'system_audit': ConfigsSecurityExtractor,
        'tenant_quota': ConfigsBackupExtractor,
        'risk_matrix': ConfigsSecurityExtractor,
        'tenant_platform': TenantUnifiedExtractor,
        'tenant_lifecycle': TenantLifecycleExtractor,
        'tenant_resource_quota': TenantQuotaExtractor,
        'tenant_schema_health': TenantSchemaExtractor,
        'tenant_domain_ssl': TenantDomainExtractor,
        'tenant_backup_audit': TenantBackupExtractor,
        'tenant_executive_summary': TenantUnifiedExtractor,
        'kpi_individual_scorecard': KPIIndividualScorecardExtractor,
        'kpi_departmental_heatmap': KPIDepartmentalHeatmapExtractor,
        'kpi_cascade_tree': KPICascadeTreeExtractor,
        'kpi_red_alerts': KPIRedAlertsExtractor,
        'kpi_validation_compliance': KPIValidationComplianceExtractor,
        'kpi_executive_summary': KPIUnifiedExtractor,
        'structure_org_chart': StructureOrgChartExtractor,
        'structure_span_of_control': StructureSpanOfControlExtractor,
        'structure_interim_delegation': StructureInterimDelegationExtractor,
        'structure_cost_center_allocation': StructureCostCenterAllocationExtractor,
        'structure_security_sensitivity': StructureSecuritySensitivityExtractor,
        'structure_executive_summary': StructureUnifiedExtractor,
        'accounts_user_directory': AccountsUserDirectoryExtractor,
        'accounts_login_security': AccountsLoginSecurityExtractor,
        'accounts_mfa_compliance': AccountsMFAComplianceExtractor,
        'accounts_audit_trail': AccountsAuditTrailExtractor,
        'accounts_role_permission_audit': AccountsRolePermissionAuditExtractor,
        'accounts_session_activity': AccountsSessionActivityExtractor,
        'accounts_password_hygiene': AccountsPasswordHygieneExtractor,
        'accounts_security_anomalies': AccountsSecurityAnomaliesExtractor,
        'accounts_executive_summary': AccountsUnifiedExtractor,
        'billing_subscription_summary': BillingSubscriptionSummaryExtractor,
        'billing_revenue_financial': BillingRevenueFinancialExtractor,
        'billing_usage_quota_audit': BillingUsageQuotaAuditExtractor,
        'billing_dunning_recovery': BillingDunningRecoveryExtractor,
        'billing_executive_summary': BillingUnifiedExtractor,
        'billing_summary': BillingUnifiedExtractor,
        'reviews_individual_summary': ReviewsIndividualSummaryExtractor,
        'reviews_cycle_compliance': ReviewsCycleComplianceExtractor,
        'reviews_organization_performance': ReviewsOrganizationPerformanceExtractor,
        'reviews_calibration_impact': ReviewsCalibrationImpactExtractor,
        'reviews_pip_tracker': ReviewsPIPTrackerExtractor,
        'reviews_executive_summary': ReviewsUnifiedExtractor,
    }

    RENDERERS = {
        ExportFormat.PDF: PDFDocumentRenderer,
        ExportFormat.EXCEL: ExcelDocumentRenderer,
        ExportFormat.CSV: CSVDocumentRenderer,
        ExportFormat.JSON: JSONDocumentRenderer,
    }

    @classmethod
    @transaction.atomic
    def generate_report(cls, report_id: str) -> GeneratedReport:
        report = GeneratedReport.objects.select_for_update().get(id=report_id)
        start_time = time.time()
        try:
            report.status = GenerationStatus.PROCESSING
            report.save(update_fields=['status'])
            extractor_cls = cls.EXTRACTORS.get(report.report_type, KPIDataExtractor)
            extractor = extractor_cls(tenant_id=report.tenant_id, filters=report.filters_used)
            raw_data = extractor.extract()
            renderer_cls = cls.RENDERERS.get(report.format, PDFDocumentRenderer)
            renderer = renderer_cls(title=report.title, data=raw_data)
            file_bytes = renderer.render()
            execution_time_ms = int((time.time() - start_time) * 1000)
            file_ext = report.format
            file_name = f"{report.report_type}_{report.id}.{file_ext}"
            report.mark_completed(file_name, file_bytes, execution_time_ms=execution_time_ms)
            ReportAuditLog.objects.create(
                tenant_id=report.tenant_id,
                generated_report=report,
                template_code=report.report_type,
                action=AuditActionType.GENERATE,
                actor=report.created_by,
                sensitivity_level=report.sensitivity_level,
                details={'execution_time_ms': execution_time_ms, 'status': 'success'}
            )
            return report
        except Exception as e:
            report.mark_failed(str(e))
            ReportAuditLog.objects.create(
                tenant_id=report.tenant_id,
                generated_report=report,
                template_code=report.report_type,
                action=AuditActionType.EXPORT_FAIL,
                actor=report.created_by,
                sensitivity_level=report.sensitivity_level,
                details={'error': str(e)}
            )
            raise e
