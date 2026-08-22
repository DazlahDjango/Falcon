# apps/reportplt/services/__init__.py
"""
Falcon Reporting Platform Subsystem Services Facade.
Provides centralized access to report orchestrators, generators, extractors,
analytics engines, schedule managers, template managers, export factories,
security enforcers, and strongly-typed DTO contracts.
"""

from .orchestrator import ReportEngineService
from .dtos import (
    ExtractionResultDTO,
    ReportPayloadDTO,
    ExportResultDTO,
    FilterDefinitionDTO,
    ScheduleConfigDTO,
    WidgetPayloadDTO,
)
from .generation import (
    ReportGenerator,
    QueryBuilder,
    DataAggregator,
    ChartRenderer,
    PivotBuilder,
)
from .export import (
    ExportFactory,
    PDFExporter,
    ExcelExporter,
    CSVExporter,
    JSONExporter,
    PowerPointExporter,
)
from .rendering import (
    BaseDocumentRenderer,
    PDFDocumentRenderer,
    ExcelDocumentRenderer,
    CSVDocumentRenderer,
    JSONDocumentRenderer,
)
from .filters import (
    FilterEngine,
    DateFilter,
    DateRangeType,
    HierarchicalFilter,
    SavedFilterManager,
)
from .scheduler import (
    ScheduleManager,
    SchedulerRunner,
    DeliveryService,
    RetryHandler,
)
from .security import (
    ReportRBAC,
    DataMasking,
    MaskingRule,
    RowLevelSecurity,
    RLSEnforcer,
    ExportSecurity,
    EncryptionService,
)
from .templates import (
    TemplateManager,
    PrebuiltTemplates,
)
from .dashboard import (
    DashboardBuilder,
    LayoutManager,
    RealtimeDashboard,
    WidgetDataFetcher,
    WidgetEngine,
)

__all__ = [
    # Core Orchestrations & DTOs
    'ReportEngineService',
    'ExtractionResultDTO',
    'ReportPayloadDTO',
    'ExportResultDTO',
    'FilterDefinitionDTO',
    'ScheduleConfigDTO',
    'WidgetPayloadDTO',

    # Generation Engine
    'ReportGenerator',
    'QueryBuilder',
    'DataAggregator',
    'ChartRenderer',
    'PivotBuilder',

    # Export & Rendering
    'ExportFactory',
    'PDFExporter',
    'ExcelExporter',
    'CSVExporter',
    'JSONExporter',
    'PowerPointExporter',
    'BaseDocumentRenderer',
    'PDFDocumentRenderer',
    'ExcelDocumentRenderer',
    'CSVDocumentRenderer',
    'JSONDocumentRenderer',

    # Filters
    'FilterEngine',
    'DateFilter',
    'DateRangeType',
    'HierarchicalFilter',
    'SavedFilterManager',

    # Scheduling
    'ScheduleManager',
    'SchedulerRunner',
    'DeliveryService',
    'RetryHandler',

    # Security & Access Control
    'ReportRBAC',
    'DataMasking',
    'MaskingRule',
    'RowLevelSecurity',
    'RLSEnforcer',
    'ExportSecurity',
    'EncryptionService',

    # Templates
    'TemplateManager',
    'PrebuiltTemplates',

    # Dashboards
    'DashboardBuilder',
    'LayoutManager',
    'RealtimeDashboard',
    'WidgetDataFetcher',
    'WidgetEngine',
]
