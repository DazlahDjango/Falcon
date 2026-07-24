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
    BillingDataExtractor
)
from apps.reportplt.services.rendering import (
    PDFDocumentRenderer,
    ExcelDocumentRenderer,
    CSVDocumentRenderer,
    JSONDocumentRenderer
)

class ReportEngineService:
    EXTRACTORS = {
        'kpi_performance': KPIDataExtractor,
        'reviews_summary': ReviewsDataExtractor,
        'unified_performance_360': UnifiedPerformanceExtractor,
        'structure_summary': StructureDataExtractor,
        'audit_trail': AuditDataExtractor,
        'tenant_health': TenantHealthDataExtractor,
        'billing_usage': BillingDataExtractor,
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
