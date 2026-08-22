# apps/reportplt/services/orchestrator.py
import time
import logging
from typing import Dict, Any, Optional
from django.db import transaction
from apps.reportplt.models import Report, ReportAudit
from apps.reportplt.constants import ReportFormat, ReportStatus
from apps.reportplt.services.dtos import ReportPayloadDTO, ExportResultDTO
from apps.reportplt.services.generation.report_generator import ReportGenerator
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

logger = logging.getLogger(__name__)

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
        'pdf': PDFDocumentRenderer,
        'excel': ExcelDocumentRenderer,
        'csv': CSVDocumentRenderer,
        'json': JSONDocumentRenderer,
    }

    @classmethod
    @transaction.atomic
    def generate_report(cls, report_id: str, params: Optional[Dict[str, Any]] = None, user: Any = None) -> ReportPayloadDTO:
        """Atomic orchestrator method to extract, process, render, and log report execution."""
        start_time = time.time()
        generator = ReportGenerator(user=user)
        res = generator.generate_report(report_id, params=params)
        
        duration = time.time() - start_time
        
        # Log Audit
        try:
            report_obj = Report.objects.filter(id=report_id).first()
            if report_obj:
                ReportAudit.log_action(
                    user=user or getattr(report_obj, 'owner', None),
                    action='generate',
                    report=report_obj,
                    details={'duration_seconds': duration, 'status': res.get('status')}
                )
        except Exception as audit_err:
            logger.warning(f"Audit log creation failed in ReportEngineService: {audit_err}")

        payload_data = res.get('data', {})
        return ReportPayloadDTO(
            report_id=str(report_id),
            report_name=payload_data.get('report_name', 'Report'),
            report_type=payload_data.get('report_type', 'custom'),
            data=payload_data,
            metrics=payload_data.get('metrics', {}),
            charts=payload_data.get('charts', []),
            tables=payload_data.get('tables', []),
            executive_summary=payload_data.get('executive_summary', ''),
            row_count=payload_data.get('row_count', 0),
            status=res.get('status', 'completed'),
            execution_id=res.get('execution_id')
        )
