apps/structure/
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
│   ├── department.py
│   ├── team.py
│   ├── position.py
│   ├── employment.py
│   ├── reporting_line.py
│   ├── cost_center.py
│   ├── location.py
│   └── hierarchy_version.py
│
├── managers/
│   ├── __init__.py
│   ├── base.py
│   ├── department.py
│   ├── team.py
│   ├── position.py
│   ├── employment.py
│   ├── reporting_line.py
│   └── hierarchy.py
│
├── services/
│   ├── __init__.py
│   ├── hierarchy/
│   │   ├── __init__.py
│   │   ├── tree_builder.py
│   │   ├── path_resolver.py
│   │   ├── cycle_detector.py
│   │   ├── subtree_extractor.py
│   │   └── lca_finder.py
│   ├── reporting/
│   │   ├── __init__.py
│   │   ├── chain_service.py
│   │   ├── span_of_control.py
│   │   ├── matrix_support.py
│   │   └── interim_manager.py
│   ├── security/
│   │   ├── __init__.py
│   │   ├── hierarchy_access.py
│   │   ├── scope_enforcer.py
│   │   ├── data_firewall.py
│   │   └── sensitivity_classifier.py
│   ├── validation/
│   │   ├── __init__.py
│   │   ├── org_validator.py
│   │   ├── max_depth_validator.py
│   │   ├── budget_validator.py
│   │   └── headcount_validator.py
│   ├── sync/
│   │   ├── __init__.py
│   │   ├── cache_warmer.py
│   │   ├── index_rebuilder.py
│   │   ├── event_publisher.py
│   │   └── view_refresher.py
│   ├── export/
│   │   ├── __init__.py
│   │   ├── org_chart_generator.py
│   │   ├── csv_exporter.py
│   │   ├── json_exporter.py
│   │   └── visio_exporter.py
│   └── audit/
│       ├── __init__.py
│       ├── change_logger.py
│       ├── diff_calculator.py
│       └── compliance_reporter.py
│
├── api/
│   ├── __init__.py
│   └── v1/
│       ├── __init__.py
│       ├── urls.py
│       ├── serializers/
│       │   ├── __init__.py
│       │   ├── department.py
│       │   ├── team.py
│       │   ├── position.py
│       │   ├── employment.py
│       │   ├── reporting.py
│       │   └── cost_center.py
│       ├── views/
│       │   ├── __init__.py
│       │   ├── department_views.py
│       │   ├── team_views.py
│       │   ├── position_views.py
│       │   ├── employment_views.py
│       │   ├── reporting_views.py
│       │   ├── hierarchy_views.py
│       │   ├── org_chart_views.py
│       │   └── bulk_views.py
│       ├── permissions/
│       │   ├── __init__.py
│       │   ├── org_permissions.py
│       │   └── ownership.py
│       ├── filters/
│       │   ├── __init__.py
│       │   ├── department_filter.py
│       │   ├── employment_filter.py
│       │   └── hierarchy_filter.py
│       └── throttles/
│           ├── __init__.py
│           └── structure_limits.py
│
├── middleware/
│   ├── __init__.py
│   ├── hierarchy_context.py
│   ├── structure_cache.py
│   └── access_enforcer.py
│
├── consumers/
│   ├── __init__.py
│   ├── org_events.py
│   ├── reporting_chain.py
│   └── permissions_sync.py
│
├── management/
│   ├── __init__.py
│   └── commands/
│       ├── __init__.py
│       ├── rebuild_hierarchy_index.py
│       ├── validate_org_integrity.py
│       ├── detect_orphaned_nodes.py
│       ├── export_org_chart.py
│       ├── sync_cost_centers.py
│       └── warm_hierarchy_cache.py
│
├── migrations/
│   ├── __init__.py
│   └── (auto-generated)
