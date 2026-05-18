from collections import defaultdict, deque
from apps.configs.models import AppDependency
from apps.configs.exceptions import DependencyCycleError

class DependencyResolver:
    _instance = None
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    def get_dependencies(self, app_id, dep_type=None):
        qs = AppDependency.objects.filter(source_app_id=app_id)
        if dep_type:
            qs = qs.filter(dependency_type=dep_type)
        return list(qs.select_related('target_app'))
    def get_dependents(self, app_id, dep_type=None):
        qs = AppDependency.objects.filter(target_app_id=app_id)
        if dep_type:
            qs = qs.filter(dependency_type=dep_type)
        return list(qs.select_related('source_app'))
    def build_dependency_graph(self, app_ids=None):
        qs = AppDependency.objects.all().select_related('source_app', 'target_app')
        if app_ids:
            qs = qs.filter(source_app_id__in=app_ids, target_app_id__in=app_ids)
        graph = defaultdict(list)
        for dep in qs:
            graph[dep.source_app_id].append(dep.target_app_id)
        return graph
    def detect_cycles(self):
        graph = self.build_dependency_graph()
        visited = set()
        rec_stack = set()
        cycles = []
        def dfs(node):
            visited.add(node)
            rec_stack.add(node)
            for neighbor in graph.get(node, []):
                if neighbor not in visited:
                    if dfs(neighbor):
                        return True
                elif neighbor in rec_stack:
                    cycles.append((node, neighbor))
                    return True
            rec_stack.remove(node)
            return False
        for node in graph:
            if node not in visited:
                if dfs(node):
                    pass
        if cycles:
            raise DependencyCycleError(f"Dependency cycles detected: {cycles}")
        return True
    def validate_dependencies(self):
        return self.detect_cycles()