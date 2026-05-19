apps/dashboard/
├── __init__.py
├── admin.py                 # Django admin configuration
├── apps.py                  # App configuration
├── constants.py             # Dashboard constants (widget types, cache keys, default layouts)
├── exceptions.py            # Custom exceptions (DashboardAccessError, HierarchyLoopError)
├── signals.py               # Django signals (invalidate cache on KPI updates)
├── tasks.py                 # Celery tasks (cache warming, report generation)
├── urls.py                  # App URL routing
├── validators.py            # Dashboard layout validators, filter validators
├── utils.py                 # Helper functions (performance scoring, color coding)
│
├── models/                  # Database models
│   ├── __init__.py
│   ├── base.py              # Abstract base models with tenant awareness
│   ├── dashboard_config.py  # User dashboard layout configuration
│   ├── widget.py            # Dashboard widgets (KPI list, charts, alerts)
│   ├── filter_preset.py     # Saved filter presets per user
│   ├── favorite.py          # Favorite KPIs/views per user
│   ├── comment.py           # Comments on KPI entries (from dashboard)
│   ├── alert.py             # User-configured alerts (e.g., "alert me when KPI turns red")
│   ├── export_schedule.py   # Scheduled report exports (PDF/Excel)
│   ├── team_view.py         # Saved team groupings (custom views)
│   ├── comparison.py        # Saved comparisons (period over period, department vs department)
│   └── audit_log.py         # Dashboard access and action audit logs
│
├── managers/                # Custom query managers
│   ├── __init__.py
│   ├── base.py              # Tenant-aware base manager
│   ├── dashboard_config_manager.py  # Get user config with defaults
│   ├── widget_manager.py    # Widget queries by type, position
│   ├── favorite_manager.py  # User favorites
│   └── alert_manager.py     # Active alerts querying
│
├── services/                # Business logic layer
│   ├── __init__.py
│   │
│   ├── hierarchy/           # Hierarchy drill-down service (CORE)
│   │   ├── __init__.py
│   │   ├── hierarchy_service.py      # Main hierarchy traversal
│   │   ├── team_aggregator.py        # Aggregate KPIs across team
│   │   ├── drill_down.py             # Drill down to specific user/member
│   │   ├── roll_up.py                # Roll up scores to higher levels
│   │   ├── org_tree_builder.py       # Build organization tree cache
│   │   ├── peer_comparator.py        # Compare user with peers
│   │   └── hierarchy_cache.py        # Redis cache layer for org trees
│   │
│   ├── views/               # Dashboard view generators
│   │   ├── __init__.py
│   │   ├── individual.py    # Individual staff dashboard data
│   │   ├── manager.py       # Supervisor dashboard (own + team cards)
│   │   ├── executive.py     # Executive dashboard (org-wide)
│   │   ├── champion.py      # Dashboard Champion dashboard
│   │   ├── falcon_admin.py  # Super Admin multi-tenant dashboard
│   │   └── read_only.py     # Restricted view for donors/auditors
│   │
│   ├── widgets/             # Widget data providers
│   │   ├── __init__.py
│   │   ├── base.py          # Base widget class
│   │   ├── kpi_list.py      # KPI list widget (traffic lights, scores)
│   │   ├── trend_chart.py   # Trend chart widget data
│   │   ├── heatmap.py       # Department heatmap
│   │   ├── compliance.py    # Submission compliance widget
│   │   ├── alerts.py        # Pending approvals, missing data alerts
│   │   ├── mission_status.py # Latest mission status report summary
│   │   ├── team_performance.py # Team aggregate performance
│   │   ├── red_alert.py     # KPIs that are red for 2+ months
│   │   └── custom.py        # Custom widget data (user configured)
│   │
│   ├── aggregators/         # Data aggregation services
│   │   ├── __init__.py
│   │   ├── score_aggregator.py   # Aggregate scores by department/team/org
│   │   ├── status_aggregator.py  # Aggregate traffic light counts
│   │   ├── submission_aggregator.py # Data submission rates
│   │   ├── time_aggregator.py     # Period over period comparisons
│   │   └── weighted_aggregator.py # Weighted score roll-ups
│   │
│   ├── caching/             # Dashboard caching (CRITICAL for performance)
│   │   ├── __init__.py
│   │   ├── cache_keys.py    # Standardized cache key generation
│   │   ├── cache_warmer.py  # Pre-warm dashboards on login
│   │   ├── cache_invalidator.py # Invalidate on data changes
│   │   ├── user_dashboard_cache.py # Per-user dashboard cache
│   │   └── team_cache.py    # Team aggregate caches
│   │
│   ├── exports/             # Dashboard export services
│   │   ├── __init__.py
│   │   ├── pdf_exporter.py  # Export dashboard to PDF
│   │   ├── excel_exporter.py # Export to Excel
│   │   ├── csv_exporter.py  # Raw data export
│   │   ├── image_exporter.py # Screenshot/PNG export
│   │   └── schedule_exporter.py # Scheduled export runner
│   │
│   ├── realtime/            # Real-time dashboard updates
│   │   ├── __init__.py
│   │   ├── websocket_publisher.py # Push updates to connected clients
│   │   ├── event_listener.py  # Listen to KPI/scores signals
│   │   └── update_batcher.py   # Batch frequent updates
│   │
│   └── permissions/         # Dashboard permission checking
│       ├── __init__.py
│       ├── dashboard_access.py  # Can user view this dashboard?
│       ├── team_access.py       # Can user view this team's data?
│       ├── drill_down_access.py # Can user drill down to this user?
│       └── scope_enforcer.py    # Enforce tenant and hierarchy boundaries
│
├── api/                     # REST API (DRF)
│   ├── __init__.py
│   ├── v1/
│   │   ├── __init__.py
│   │   ├── urls.py          # API URL routing
│   │   │
│   │   ├── serializers/
│   │   │   ├── __init__.py
│   │   │   ├── dashboard.py     # Dashboard config serializers
│   │   │   ├── widget.py        # Widget serializers
│   │   │   ├── team_card.py     # Team member card serializers
│   │   │   ├── performance.py   # Performance data serializers
│   │   │   ├── filter.py        # Filter preset serializers
│   │   │   ├── favorite.py      # Favorite serializers
│   │   │   ├── alert.py         # Alert serializers
│   │   │   ├── comment.py       # Comment serializers
│   │   │   ├── export.py        # Export schedule serializers
│   │   │   └── comparison.py    # Comparison serializers
│   │   │
│   │   ├── views/
│   │   │   ├── __init__.py
│   │   │   ├── individual_dashboard.py   # Staff dashboard endpoints
│   │   │   ├── manager_dashboard.py      # Supervisor dashboard endpoints
│   │   │   ├── executive_dashboard.py    # Executive dashboard endpoints
│   │   │   ├── champion_dashboard.py     # Dashboard Champion endpoints
│   │   │   ├── falcon_admin_dashboard.py # Super Admin endpoints
│   │   │   ├── team_endpoints.py         # Team data, drill-down
│   │   │   ├── widget_endpoints.py       # Widget CRUD
│   │   │   ├── filter_endpoints.py       # Filter presets
│   │   │   ├── favorite_endpoints.py     # Favorites
│   │   │   ├── alert_endpoints.py        # Alert configuration
│   │   │   ├── comment_endpoints.py      # Comments on KPIs
│   │   │   ├── export_endpoints.py       # Export triggers, schedules
│   │   │   ├── comparison_endpoints.py   # Save/load comparisons
│   │   │   └── realtime_endpoints.py     # WebSocket connection metadata
│   │   │
│   │   ├── permissions/
│   │   │   ├── __init__.py
│   │   │   ├── dashboard_permissions.py  # Dashboard-level permissions
│   │   │   ├── team_permissions.py       # Team data access
│   │   │   ├── drill_down_permissions.py # Drill-down authorization
│   │   │   ├── export_permissions.py     # Export access
│   │   │   └── widget_permissions.py     # Widget config permissions
│   │   │
│   │   ├── throttles/
│   │   │   ├── __init__.py
│   │   │   ├── dashboard_throttles.py    # Dashboard view rate limits
│   │   │   ├── export_throttles.py       # Export rate limits
│   │   │   └── realtime_throttles.py     # WebSocket connection limits
│   │   │
│   │   └── filters/
│   │       ├── __init__.py
│   │       ├── dashboard_filter.py       # Period, department, KPI filters
│   │       ├── team_filter.py            # Team member filters
│   │       └── performance_filter.py     # Score range, status filters
│   │
│   └── v2/                   # Reserved for future (AI insights dashboards)
│       └── __init__.py
│
├── consumers.py             # WebSocket consumers (real-time dashboard updates)
├── routing.py               # WebSocket URL routing
│
├── middleware/              # Custom middleware
│   ├── __init__.py
│   ├── dashboard_context.py     # Inject dashboard context into requests
│   ├── hierarchy_enforcer.py    # Enforce hierarchy on dashboard views
│   ├── dashboard_cache.py       # Cache dashboard responses
│   └── audit_middleware.py      # Log dashboard access
│
├── management/              # Django management commands
│   ├── __init__.py
│   └── commands/
│       ├── __init__.py
│       ├── warm_dashboard_caches.py    # Pre-warm all user dashboards
│       ├── clear_dashboard_cache.py    # Clear all dashboard caches
│       ├── rebuild_org_tree.py         # Rebuild organization tree cache
│       ├── run_scheduled_exports.py    # Run pending scheduled exports
│       ├── send_digest_alerts.py       # Send digest alerts to users
│       └── sync_dashboard_permissions.py # Sync dashboard permissions
│
├── migrations/              # Database migrations
│   ├── __init__.py
│   └── (auto-generated)
│
├── fixtures/                # Initial data
│   ├── __init__.py
│   ├── default_widgets.yaml     # Default widget configurations per role
│   ├── default_dashboards.yaml  # Default dashboard layouts per role
│   ├── default_alerts.yaml      # Default alert configurations
│   └── default_filters.yaml     # Default filter presets
│
└── utils/                   # Utility functions
    ├── __init__.py
    ├── color_utils.py       # Traffic light color helpers
    ├── score_utils.py       # Score calculation helpers for display
    ├── layout_utils.py      # Dashboard layout helpers (grid, responsive)
    ├── filter_utils.py      # Filter parsing and validation
    ├── comparison_utils.py  # Period comparison calculations
    └── format_utils.py      # Date, number, percentage formatting for display