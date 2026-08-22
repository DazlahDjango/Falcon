# apps/reportplt/services/dtos.py
from dataclasses import dataclass, field
from typing import Dict, Any, List, Optional
from datetime import datetime

@dataclass
class ExtractionResultDTO:
    """Standardized DTO contract for data extractors across domains."""
    type: str
    count: int
    summary: Dict[str, Any] = field(default_factory=dict)
    details: List[Dict[str, Any]] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return {
            'type': self.type,
            'count': self.count,
            'summary': self.summary,
            'details': self.details,
            'metadata': self.metadata
        }

@dataclass
class ReportPayloadDTO:
    """Strongly-typed DTO for generated report result context."""
    report_id: str
    report_name: str
    report_type: str
    data: Dict[str, Any] = field(default_factory=dict)
    metrics: Dict[str, Any] = field(default_factory=dict)
    charts: List[Dict[str, Any]] = field(default_factory=list)
    tables: List[Dict[str, Any]] = field(default_factory=list)
    executive_summary: str = ""
    row_count: int = 0
    generated_at: Optional[str] = None
    status: str = "completed"
    execution_id: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            'status': self.status,
            'report_id': self.report_id,
            'report_name': self.report_name,
            'report_type': self.report_type,
            'data': self.data,
            'metrics': self.metrics,
            'charts': self.charts,
            'tables': self.tables,
            'executive_summary': self.executive_summary,
            'row_count': self.row_count,
            'execution_id': self.execution_id,
            'generated_at': self.generated_at or datetime.now().isoformat()
        }

@dataclass
class ExportResultDTO:
    """DTO representing the artifact and status of a document export."""
    status: str
    export_path: str
    format: str
    file_size_bytes: int = 0
    mime_type: str = "application/octet-stream"
    checksum_sha256: Optional[str] = None
    error: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        result = {
            'status': self.status,
            'export_path': self.export_path,
            'format': self.format,
            'file_size_bytes': self.file_size_bytes,
            'mime_type': self.mime_type
        }
        if self.checksum_sha256:
            result['checksum_sha256'] = self.checksum_sha256
        if self.error:
            result['error'] = self.error
        return result

@dataclass
class FilterDefinitionDTO:
    """DTO for filter specifications."""
    name: str
    type: str
    field: str
    label: str = ""
    required: bool = False
    options: List[Any] = field(default_factory=list)
    default_values: Any = None
    validation: Dict[str, Any] = field(default_factory=dict)

@dataclass
class ScheduleConfigDTO:
    """DTO for schedule creation and update payloads."""
    name: str
    frequency: str
    recipients: List[str] = field(default_factory=list)
    cc_recipients: List[str] = field(default_factory=list)
    bcc_recipients: List[str] = field(default_factory=list)
    delivery_methods: List[str] = field(default_factory=lambda: ['email'])
    cron_expression: Optional[str] = None
    timezone: str = "UTC"
    include_attachments: bool = True
    custom_params: Dict[str, Any] = field(default_factory=dict)

@dataclass
class WidgetPayloadDTO:
    """DTO for dashboard widget representation."""
    widget_id: str
    widget_type: str
    title: str
    data: Dict[str, Any] = field(default_factory=dict)
    size: Dict[str, int] = field(default_factory=lambda: {'w': 6, 'h': 4})
    position: Dict[str, int] = field(default_factory=lambda: {'x': 0, 'y': 0})
