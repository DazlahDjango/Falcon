apps/dashboard/
├── __init__.py
├── admin.py
├── apps.py
├── constants.py
├── exceptions.py
├── signals.py
├── tasks.py
├── urls.py
├── validators.py
├── utils.py
│
├── models/
│   ├── __init__.py
│   ├── base.py
│   ├── dashboard_config.py
│   ├── widget.py
│   ├── favorite.py
│   ├── alert.py
│   ├── export_schedule.py
│   ├── comparison.py
│   ├── audit_log.py
│   ├── executive_view.py
│   ├── manager_view.py
│   ├── staff_view.py
│   ├── champion_view.py
│   └── tenant_overview.py
│
├── managers/
│   ├── __init__.py
│   ├── base.py
│   ├── dashboard_config_manager.py
│   ├── favorite_manager.py
│   ├── alert_manager.py
│   ├── export_manager.py
│   ├── comparison_manager.py
│   ├── audit_manager.py
│   ├── executive_manager.py
│   ├── manager_manager.py
│   ├── staff_manager.py
│   ├── champion_manager.py
│   └── tenant_overview_manager.py
│
├── services/
│   ├── __init__.py
│   ├── base_service.py
│   ├── hierarchy_service.py
│   ├── cache_service.py
│   ├── executive_service.py
│   ├── client_admin_service.py
│   ├── super_admin_service.py
│   ├── manager_service.py
│   ├── staff_service.py
│   ├── champion_service.py
│   └── read_only_service.py
│
├── api/
│   ├── __init__.py
│   └── v1/
│       ├── __init__.py
│       ├── urls.py
│       ├── serializers.py
│       ├── permissions.py
│       ├── throttles.py
│       ├── filters.py
│       └── views.py
│
├── consumers.py
├── routing.py
├── middleware.py
│
├── management/
│   └── commands/
│       ├── __init__.py
│       ├── warm_dashboard_caches.py
│       ├── clear_dashboard_cache.py
│       ├── rebuild_org_tree.py
│       ├── run_scheduled_exports.py
│       ├── send_digest_alerts.py
│       └── sync_dashboard_permissions.py
│
├── migrations/
│   ├── __init__.py
│   └── (auto-generated migration files)
│
├── fixtures/
│   ├── __init__.py
│   ├── default_widgets.yaml
│   ├── default_dashboards.yaml
│   ├── default_alerts.yaml
│   └── default_filters.yaml
│
└── tests/
    ├── __init__.py
    ├── conftest.py
    ├── factories/
    │   ├── __init__.py
    │   ├── dashboard_factory.py
    │   ├── widget_factory.py
    │   └── alert_factory.py
    ├── unit/
    │   ├── __init__.py
    │   ├── test_models/
    │   │   ├── __init__.py
    │   │   ├── test_dashboard_config.py
    │   │   └── test_widget.py
    │   ├── test_services/
    │   │   ├── __init__.py
    │   │   ├── test_hierarchy_service.py
    │   │   ├── test_executive_service.py
    │   │   ├── test_client_admin_service.py
    │   │   ├── test_super_admin_service.py
    │   │   ├── test_manager_service.py
    │   │   ├── test_staff_service.py
    │   │   └── test_champion_service.py
    │   └── test_utils/
    ├── integration/
    │   ├── __init__.py
    │   ├── test_api/
    │   │   ├── __init__.py
    │   │   ├── test_executive_endpoints.py
    │   │   ├── test_client_admin_endpoints.py
    │   │   ├── test_super_admin_endpoints.py
    │   │   ├── test_manager_endpoints.py
    │   │   ├── test_staff_endpoints.py
    │   │   └── test_champion_endpoints.py
    │   └── test_workflows/
    │       ├── __init__.py
    │       ├── test_dashboard_flow.py
    │       └── test_export_flow.py
    ├── security/
    │   ├── __init__.py
    │   ├── test_tenant_isolation.py
    │   ├── test_permissions.py
    │   └── test_audit_log.py
    └── performance/
        ├── __init__.py
        ├── test_query_count.py
        └── test_cache.py