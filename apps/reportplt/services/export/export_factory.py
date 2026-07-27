# apps/reportplt/services/export/export_factory.py
from typing import Dict, Any, Optional
from apps.reportplt.exceptions import ReportExportError
from apps.reportplt.constants import ReportFormat
from .pdf_exporter import PDFExporter
from .excel_exporter import ExcelExporter
from .csv_exporter import CSVExporter
from .json_exporter import JSONExporter
from .powerpoint_exporter import PowerPointExporter

class ExportFactory:
    _exporters = {
        ReportFormat.PDF: PDFExporter,
        ReportFormat.EXCEL: ExcelExporter,
        ReportFormat.CSV: CSVExporter,
        ReportFormat.JSON: JSONExporter,
        ReportFormat.PPTX: PowerPointExporter,
    }

    @classmethod
    def get_exporter(cls, format: str, config: Optional[Dict] = None):
        exporter_class = cls._exporters.get(format)
        if not exporter_class:
            raise ReportExportError(f"Unsupported export format: {format}")
        return exporter_class(config or {})

    @classmethod
    def export(cls, format: str, data: Dict[str, Any], report_name: str, config: Optional[Dict] = None) -> str:
        exporter = cls.get_exporter(format, config)
        return exporter.export(data, report_name)

    @classmethod
    def export_to_bytes(cls, format: str, data: Dict[str, Any], report_name: str, config: Optional[Dict] = None) -> bytes:
        exporter = cls.get_exporter(format, config)
        if hasattr(exporter, 'export_to_bytes'):
            return exporter.export_to_bytes(data, report_name)
        if hasattr(exporter, 'export_to_string'):
            return exporter.export_to_string(data, report_name)
        raise ReportExportError(f"Exporter {format} does not support byte export")

    @classmethod
    def get_supported_formats(cls) -> list:
        return list(cls._exporters.keys())

    @classmethod
    def get_format_extension(cls, format: str) -> str:
        extensions = {
            ReportFormat.PDF: '.pdf',
            ReportFormat.EXCEL: '.xlsx',
            ReportFormat.CSV: '.csv',
            ReportFormat.JSON: '.json',
            ReportFormat.PPTX: '.pptx',
            ReportFormat.HTML: '.html',
            ReportFormat.XML: '.xml',
        }
        return extensions.get(format, '.bin')

    @classmethod
    def get_format_mime_type(cls, format: str) -> str:
        mime_types = {
            ReportFormat.PDF: 'application/pdf',
            ReportFormat.EXCEL: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            ReportFormat.CSV: 'text/csv',
            ReportFormat.JSON: 'application/json',
            ReportFormat.PPTX: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            ReportFormat.HTML: 'text/html',
            ReportFormat.XML: 'application/xml',
        }
        return mime_types.get(format, 'application/octet-stream')

    @classmethod
    def register_exporter(cls, format: str, exporter_class):
        cls._exporters[format] = exporter_class

    @classmethod
    def unregister_exporter(cls, format: str):
        if format in cls._exporters:
            del cls._exporters[format]

class ExportHandler:
    def __init__(self, config: Optional[Dict] = None):
        self.config = config or {}

    def export_report(self, format: str, data: Dict[str, Any], report_name: str) -> str:
        return ExportFactory.export(format, data, report_name, self.config)

    def export_to_bytes(self, format: str, data: Dict[str, Any], report_name: str) -> bytes:
        return ExportFactory.export_to_bytes(format, data, report_name, self.config)

    def get_available_formats(self) -> list:
        return ExportFactory.get_supported_formats()

    def get_export_filename(self, format: str, report_name: str) -> str:
        extension = ExportFactory.get_format_extension(format)
        from datetime import datetime
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        sanitized_name = ''.join(c for c in report_name if c.isalnum() or c in ' _-')[:50]
        return f"{sanitized_name}_{timestamp}{extension}"