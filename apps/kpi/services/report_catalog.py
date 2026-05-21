"""
Maps training-doc report names to implemented export/analytics endpoints (Phase D audit).
"""
PHASE_D_REPORT_REGISTRY = {
    'performance': {
        'endpoint': '/api/v1/kpis/export/reports/',
        'formats': ['pdf', 'excel'],
        'training_aliases': [
            'Executive Summary',
            'KPI Performance Report',
            'Organization Health Report',
        ],
    },
    'scores_csv': {
        'endpoint': '/api/v1/kpis/export/scores/',
        'formats': ['csv'],
        'training_aliases': ['Score Reports', 'Individual Score Report'],
    },
    'kpis_csv': {
        'endpoint': '/api/v1/kpis/export/kpis/',
        'formats': ['csv'],
        'training_aliases': ['KPI List Export'],
    },
    'validation_compliance': {
        'endpoint': '/api/v1/kpis/export/reports/',
        'formats': ['csv'],
        'query': {'report': 'validation_compliance'},
        'training_aliases': ['Validation Compliance Report'],
    },
    'red_alerts': {
        'endpoint': '/api/v1/kpis/export/reports/',
        'formats': ['csv'],
        'query': {'report': 'red_alerts'},
        'training_aliases': ['Red KPI Alert Report'],
    },
    'department_summary': {
        'endpoint': '/api/v1/kpis/export/reports/',
        'formats': ['csv'],
        'query': {'report': 'department_summary'},
        'training_aliases': ['Department Performance', 'Department Reports'],
    },
    'kpi_summaries': {
        'endpoint': '/api/v1/kpis/kpi-summaries/',
        'formats': ['json'],
        'training_aliases': ['KPI Summary Analytics'],
    },
    'department_rollups': {
        'endpoint': '/api/v1/kpis/department-rollups/',
        'formats': ['json'],
        'training_aliases': ['Department Rollup', 'Department Comparison'],
    },
    'organization_health': {
        'endpoint': '/api/v1/kpis/organization-health/current/',
        'formats': ['json'],
        'training_aliases': ['Organization Health', 'Executive Dashboard health'],
    },
}
