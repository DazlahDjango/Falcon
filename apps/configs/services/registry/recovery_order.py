from collections import deque, defaultdict
from apps.configs.models import AppDependency, RegisteredApp
from apps.configs.exceptions import DependencyCycleError

class RecoveryOrder:
    _instance = None
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    def topological_sort(self, app_ids=None):
        if app_ids:
            apps = RegisteredApp.objects.filter(id__in=app_ids, is_registered=True)
        else:
            apps = RegisteredApp.objects.filter(is_registered=True)
        deps = AppDependency.objects.filter(dependency_type='hard').select_related('source_app', 'target_app')
        graph = defaultdict(list)
        in_degree = defaultdict(int)
        app_map = {app.id: app for app in apps}
        for dep in deps:
            if dep.source_app_id in app_map and dep.target_app_id in app_map:
                graph[dep.source_app_id].append(dep.target_app_id)
                in_degree[dep.target_app_id] += 1
        for app_id in app_map:
            if app_id not in in_degree:
                in_degree[app_id] = 0
        queue = deque([app_id for app_id, degree in in_degree.items() if degree == 0])
        result = []
        while queue:
            node = queue.popleft()
            result.append(app_map[node])
            for neighbor in graph.get(node, []):
                in_degree[neighbor] -= 1
                if in_degree[neighbor] == 0:
                    queue.append(neighbor)
        if len(result) != len(app_map):
            raise DependencyCycleError("Circular dependency detected in recovery order")
        return result
    def get_recovery_sequence(self, app_names=None):
        if app_names:
            apps = RegisteredApp.objects.filter(name__in=app_names, is_registered=True)
        else:
            apps = RegisteredApp.objects.filter(is_registered=True)
        return self.topological_sort([app.id for app in apps])
    def get_priority_order(self):
        return RegisteredApp.objects.filter(is_registered=True).order_by('recovery_priority', 'name')