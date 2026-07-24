apps/reportplt/
├── __init__.py
├── apps.py                                    # AppConfig
├── admin.py                                   # Django admin registration
├── constants.py                               # Report types, formats, export types, chart types, scheduling constants
├── exceptions.py                              # Custom report exceptions (RenderError, ExportError, ScheduleError, etc.)
├── signals.py                                 # Signal handlers (auto-generate reports on KPI updates, etc.)
├── tasks.py                                   # Celery tasks (report generation, export, scheduled reports)
├── urls.py                                    # App-level URL routing
├── validators.py                              # Report config validators, query validators
│
├── models/                                    # Models directory
│   ├── __init__.py
│   ├── base.py                                # Base abstract models (inherits from apps.core)
│   ├── report.py                              # Report model (core report definition)
│   ├── report_template.py                     # Report templates (predefined report structures)
│   ├── report_schedule.py                     # Scheduled report definitions
│   ├── report_execution.py                    # Report execution logs/instances
│   ├── report_export.py                       # Exported report files (PDF, Excel, CSV, etc.)
│   ├── report_dashboard.py                    # Dashboard definitions (custom dashboards per user/role)
│   ├── report_widget.py                       # Dashboard widgets (charts, KPIs, tables, etc.)
│   ├── report_filter.py                       # Saved filters per user
│   ├── report_share.py                        # Report sharing permissions (internal/external)
│   ├── report_audit.py                        # Audit logs for report access/generation
│   └── report_cache.py                        # Cached report data (performance optimization)
│
├── managers/                                  # Custom managers
│   ├── __init__.py
│   ├── base.py                                # Base manager with tenant filtering
│   ├── report.py                              # Report querysets (by type, status, etc.)
│   ├── template.py                            # Template querysets
│   ├── schedule.py                            # Schedule querysets (active/pending)
│   └── export.py                              # Export querysets
│
├── services/                                  # Business logic layer
│   ├── __init__.py
│   ├── generation/
│   │   ├── __init__.py
│   │   ├── report_generator.py                # Core report generation engine
│   │   ├── query_builder.py                   # Dynamic query builder for report data
│   │   ├── data_aggregator.py                 # Data aggregation service (grouping, summing, averaging)
│   │   ├── chart_renderer.py                  # Chart data preparation (Highcharts, Chart.js, etc.)
│   │   └── pivot_builder.py                   # Pivot table data generation
│   ├── export/
│   │   ├── __init__.py
│   │   ├── pdf_exporter.py                    # PDF generation (ReportLab/WeasyPrint)
│   │   ├── excel_exporter.py                  # Excel export (openpyxl/xlsxwriter)
│   │   ├── csv_exporter.py                    # CSV export
│   │   ├── json_exporter.py                   # JSON export for API consumption
│   │   ├── powerpoint_exporter.py             # PowerPoint export (python-pptx) - Mission Plans
│   │   └── export_factory.py                  # Factory pattern for export format selection
│   ├── scheduler/
│   │   ├── __init__.py
│   │   ├── schedule_manager.py                # Schedule CRUD and management
│   │   ├── scheduler_runner.py                # Run scheduled reports (Celery/APScheduler)
│   │   ├── delivery_service.py                # Deliver reports (email, webhook, S3)
│   │   └── retry_handler.py                   # Retry logic for failed scheduled reports
│   ├── dashboard/
│   │   ├── __init__.py
│   │   ├── dashboard_builder.py               # Dashboard layout builder
│   │   ├── widget_engine.py                   # Widget rendering engine
│   │   ├── widget_data_fetcher.py             # Fetch data for specific widgets (KPIs, charts, tables)
│   │   ├── realtime_dashboard.py              # WebSocket-powered live dashboard updates
│   │   └── layout_manager.py                  # Dashboard layout management (grid, drag-drop)
│   ├── filters/
│   │   ├── __init__.py
│   │   ├── filter_engine.py                   # Dynamic filter application
│   │   ├── date_filter.py                     # Date range filtering (YTD, MTD, custom)
│   │   ├── hierarchical_filter.py             # Org hierarchy filtering (department, team)
│   │   └── saved_filter.py                    # Saved filter management
│   ├── templates/
│   │   ├── __init__.py
│   │   ├── template_manager.py                # Report template CRUD
│   │   ├── prebuilt_templates.py              # Predefined templates (Executive, Departmental, KPI, Compliance)
│   │   └── custom_template_builder.py         # Custom report builder logic
│   ├── analytics/
│   │   ├── __init__.py
│   │   ├── trend_analyzer.py                  # Trend analysis (MoM, YoY, growth rates)
│   │   ├── performance_analyzer.py            # KPI performance analysis (above/below target)
│   │   ├── comparative_analyzer.py            # Department/team/person comparisons
│   │   ├── predictive_analyzer.py             # (Future) Predictive analytics / forecasting
│   │   └── anomaly_detector.py                # (Future) Anomaly detection in KPI data
│   └── security/
│       ├── __init__.py
│       ├── report_rbac.py                     # Role-based access for reports
│       ├── data_masking.py                    # Data masking for sensitive reports
│       ├── row_level_security.py              # PostgreSQL RLS enforcement
│       └── export_security.py                 # Secure export handling (encryption, signing)
│
├── api/                                       # REST API (DRF)
│   ├── __init__.py
│   ├── v1/
│   │   ├── __init__.py
│   │   ├── urls.py                            # v1 API routing
│   │   ├── serializers/
│   │   │   ├── __init__.py
│   │   │   ├── report.py                      # Report CRUD serializers
│   │   │   ├── template.py                    # Template serializers
│   │   │   ├── schedule.py                    # Schedule serializers
│   │   │   ├── dashboard.py                   # Dashboard serializers
│   │   │   ├── widget.py                      # Widget serializers
│   │   │   ├── export.py                      # Export serializers
│   │   │   ├── filter.py                      # Filter serializers
│   │   │   ├── analytics.py                   # Analytics data serializers
│   │   │   └── audit.py                       # Report audit serializers
│   │   ├── views/
│   │   │   ├── __init__.py
│   │   │   ├── reports.py                     # Report CRUD endpoints
│   │   │   ├── report_data.py                 # Generate/render report data
│   │   │   ├── report_export.py               # Export endpoints (PDF, Excel, CSV, PPT)
│   │   │   ├── report_schedule.py             # Scheduled report endpoints
│   │   │   ├── dashboards.py                  # Dashboard CRUD endpoints
│   │   │   ├── widgets.py                     # Widget CRUD and data endpoints
│   │   │   ├── templates.py                   # Template management endpoints
│   │   │   ├── analytics.py                   # Analytics endpoints (trends, comparisons)
│   │   │   └── filters.py                     # Saved filter endpoints
│   │   ├── permissions/
│   │   │   ├── __init__.py
│   │   │   ├── report.py                      # Report-level permissions
│   │   │   ├── dashboard.py                   # Dashboard permissions
│   │   │   ├── export.py                      # Export permissions
│   │   │   └── tenant.py                      # Tenant isolation permissions
│   │   ├── throttles/
│   │   │   ├── __init__.py
│   │   │   ├── generation.py                  # Rate limiting for report generation
│   │   │   └── export.py                      # Rate limiting for exports
│   │   └── filters/
│   │       ├── __init__.py
│   │       ├── report.py                      # Report filtering (date, type, status)
│   │       ├── dashboard.py                   # Dashboard filtering
│   │       └── audit.py                       # Audit log filtering
│   └── v2/                                     # Reserved for future
│       └── __init__.py
│
├── consumers/                                 # WebSocket consumers (real-time)
│   ├── __init__.py
│   ├── dashboard.py                           # Real-time dashboard updates
│   ├── report_status.py                       # Report generation progress tracking
│   └── notification.py                        # Report-ready notifications
│
├── middleware/                                # Custom middleware
│   ├── __init__.py
│   ├── report_context.py                      # Set report context per request
│   ├── rls_enforcer.py                        # PostgreSQL RLS enforcement
│   └── cache_headers.py                       # Cache control for report responses
│
├── management/                                # Django management commands
│   ├── __init__.py
│   ├── commands/
│   │   ├── __init__.py
│   │   ├── clean_report_cache.py              # Clean stale report cache
│   │   ├── seed_report_templates.py           # Seed prebuilt report templates
│   │   ├── generate_prebuilt_reports.py       # Generate prebuilt reports for demo
│   │   └── prune_old_exports.py               # Delete old exported files
│
├── migrations/                                # Database migrations
│   ├── __init__.py
│   └── ... (auto-generated)
│
├── templates/                                 # Server-side templates (email, admin)
│   └── reportplt/
│       ├── email/
│       │   ├── report_ready.html              # Report ready notification email
│       │   ├── scheduled_report_failed.html   # Scheduled report failure email
│       │   └── share_report.html              # Report sharing invitation email
│       └── admin/
│           ├── report_list.html
│           ├── report_detail.html
│           └── dashboard_preview.html
│
├── static/                                    # Static assets (if needed)
│   └── reportplt/
│       ├── css/
│       │   ├── reports.css
│       │   └── dashboard.css
│       └── js/
│           ├── report_builder.js
│           └── dashboard.js
│
├── frontend/                                  # React frontend components (future)
│   ├── components/
│   │   ├── reports/
│   │   │   ├── ReportList.jsx
│   │   │   ├── ReportBuilder.jsx
│   │   │   ├── ReportViewer.jsx
│   │   │   ├── ReportScheduler.jsx
│   │   │   └── ReportShare.jsx
│   │   ├── dashboards/
│   │   │   ├── DashboardView.jsx
│   │   │   ├── DashboardBuilder.jsx
│   │   │   └── WidgetRenderer.jsx
│   │   ├── widgets/
│   │   │   ├── KPIWidget.jsx
│   │   │   ├── ChartWidget.jsx
│   │   │   ├── TableWidget.jsx
│   │   │   ├── HeatmapWidget.jsx
│   │   │   └── TrendWidget.jsx
│   │   └── common/
│   │       ├── ExportButton.jsx
│   │       ├── FilterBar.jsx
│   │       └── DateRangePicker.jsx
│   ├── hooks/
│   │   ├── useReport.js
│   │   ├── useDashboard.js
│   │   └── useRealtimeDashboard.js
│   ├── services/
│   │   ├── report.js
│   │   ├── dashboard.js
│   │   └── export.js
│   └── utils/
│       ├── chartConfig.js
│       └── exportUtils.js
│
├── tests/                                     # Unit and integration tests
│   ├── __init__.py
│   ├── test_models.py
│   ├── test_services/
│   │   ├── test_generator.py
│   │   ├── test_exporter.py
│   │   └── test_scheduler.py
│   ├── test_api/
│   │   ├── test_reports.py
│   │   ├── test_dashboards.py
│   │   └── test_exports.py
│   └── factories.py
│
└── docs/                                      # Documentation
    ├── report_types.md
    ├── export_formats.md
    ├── dashboard_widgets.md
    └── security_considerations.md