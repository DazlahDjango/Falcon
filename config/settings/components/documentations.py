"""
Documentation Configuration Component

OpenAPI and Swagger UI schema configurations (drf-spectacular and drf-yasg).
"""

# API DOCUMENTATION (Swagger/OpenAPI)
SPECTACULAR_SETTINGS = {
    'TITLE': 'Falcon PMS API',
    'DESCRIPTION': 'Performance Management System',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
    'COMPONENT_SPLIT_REQUEST': True,
    'SCHEMA_PATH_PREFIX': '/api/v[0-9]',
    'SECURITY': [{'BearerAuth': []}],
    'TAGS': [
        {'name': 'auth', 'description': 'Authentication endpoints'},
    ],
}

SWAGGER_SETTINGS = {
    'SECURITY_DEFINITIONS': {
        'Bearer': {
            'type': 'apiKey',
            'name': 'Authorization',
            'in': 'header'
        }
    },
    'USE_SESSION_AUTH': False,
    'JSON_EDITOR': True,
    'SUPPORTED_SUBMIT_METHODS': [
        'get',
        'post',
        'put',
        'delete',
        'patch'
    ],
}
