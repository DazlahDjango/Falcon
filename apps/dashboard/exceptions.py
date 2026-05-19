class DashboardError(Exception):
    pass

class DashboardAccessError(DashboardError):
    def __init__(self, user_id=None, dashboard_type=None, required_role=None, message=None):
        self.user_id = user_id
        self.dashboard_type = dashboard_type
        self.required_role = required_role
        self.message = message or f"User {user_id} does not have access to {dashboard_type} dashboard"
        super().__init__(self.message)

class HierarchyLoopError(DashboardError):
    def __init__(self, user_id=None, path=None, message=None):
        self.user_id = user_id
        self.path = path or []
        self.message = message or f"Hierarchy loop detected for user {user_id}: {' -> '.join(str(p) for p in path)}"
        super().__init__(self.message)

class DashboardConfigError(DashboardError):
    def __init__(self, config_id=None, field=None, message=None):
        self.config_id = config_id
        self.field = field
        self.message = message or f"Configuration error for dashboard {config_id}: {field}"
        super().__init__(self.message)

class WidgetError(DashboardError):
    def __init__(self, widget_id=None, widget_type=None, message=None):
        self.widget_id = widget_id
        self.widget_type = widget_type
        self.message = message or f"Widget error: {widget_type} ({widget_id})"
        super().__init__(self.message)

class ExportError(DashboardError):
    def __init__(self, export_id=None, format=None, message=None):
        self.export_id = export_id
        self.format = format
        self.message = message or f"Export failed for {export_id} in {format} format"
        super().__init__(self.message)

class DashboardCacheError(DashboardError):
    def __init__(self, cache_key=None, operation=None, message=None):
        self.cache_key = cache_key
        self.operation = operation
        self.message = message or f"Cache {operation} failed for key {cache_key}"
        super().__init__(self.message)

class InvalidFilterError(DashboardError):
    def __init__(self, filter_name=None, filter_value=None, message=None):
        self.filter_name = filter_name
        self.filter_value = filter_value
        self.message = message or f"Invalid filter value for {filter_name}: {filter_value}"
        super().__init__(self.message)

class RateLimitExceededError(DashboardError):
    def __init__(self, user_id=None, dashboard_type=None, limit=100, message=None):
        self.user_id = user_id
        self.dashboard_type = dashboard_type
        self.limit = limit
        self.message = message or f"Rate limit exceeded for user {user_id} on {dashboard_type} dashboard"
        super().__init__(self.message)