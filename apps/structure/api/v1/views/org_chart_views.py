from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.http import HttpResponse
from django.utils import timezone
from ..throttles.structure_limits import OrgChartExportThrottle, HierarchyReadThrottle
from ..permissions.structure_permissions import CanExportOrgChart, CanViewHierarchy
from .base import BaseStructureReadOnlyViewSet


class OrgChartViewSet(BaseStructureReadOnlyViewSet):
    permission_classes = [CanViewHierarchy]
    def get_throttles(self):
        if self.action in ['export_json', 'export_csv', 'export_text', 'export_visio']:
            self.throttle_classes = [OrgChartExportThrottle]
        else:
            self.throttle_classes = [HierarchyReadThrottle]
        return super().get_throttles()
    
    @action(detail=False, methods=['get'], url_path='json')
    def export_json(self, request):
        from ....services.export.org_chart_generator import OrgChartGeneratorService
        from ....services.export.json_exporter import JSONExporterService
        tenant_id = request.user.tenant_id
        format_type = request.query_params.get('format', 'full')
        root_dept_id = request.query_params.get('root_department_id')
        if format_type == 'flat':
            data = OrgChartGeneratorService().generate_flat_org_chart(tenant_id)
        elif format_type == 'full':
            from uuid import UUID
            root_id = UUID(root_dept_id) if root_dept_id else None
            data = OrgChartGeneratorService().generate_json_org_chart(tenant_id, root_id)
        else:
            data = JSONExporterService.export_full_org(tenant_id)
            if isinstance(data, str):
                return HttpResponse(data, content_type='application/json')
        return Response({
            'tenant_id': str(tenant_id),
            'exported_at': timezone.now().isoformat(),
            'format': format_type,
            'data': data
        })
    
    @action(detail=False, methods=['get'], url_path='csv')
    def export_csv(self, request):
        from ....services.export.csv_exporter import CSVExporterService
        entity = request.query_params.get('entity', 'departments')
        include_inactive = request.query_params.get('include_inactive', 'false').lower() == 'true'
        tenant_id = request.user.tenant_id
        if entity == 'departments':
            csv_data = CSVExporterService.export_departments(tenant_id, include_inactive)
            filename = f"departments_{tenant_id}_{timezone.now().date()}.csv"
        elif entity == 'teams':
            csv_data = CSVExporterService.export_teams(tenant_id, include_inactive)
            filename = f"teams_{tenant_id}_{timezone.now().date()}.csv"
        elif entity == 'employments':
            current_only = request.query_params.get('current_only', 'true').lower() == 'true'
            csv_data = CSVExporterService.export_employments(tenant_id, current_only)
            filename = f"employments_{tenant_id}_{timezone.now().date()}.csv"
        elif entity == 'positions':
            csv_data = CSVExporterService.export_positions(tenant_id)
            filename = f"positions_{tenant_id}_{timezone.now().date()}.csv"
        elif entity == 'reporting':
            active_only = request.query_params.get('active_only', 'true').lower() == 'true'
            csv_data = CSVExporterService.export_reporting_lines(tenant_id, active_only)
            filename = f"reporting_lines_{tenant_id}_{timezone.now().date()}.csv"
        else:
            return Response({'error': f'Invalid entity: {entity}'}, status=status.HTTP_400_BAD_REQUEST)
        response = HttpResponse(csv_data, content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response
    
    @action(detail=False, methods=['get'], url_path='text')
    def export_text(self, request):
        """Export organization chart as text (ASCII tree)"""
        from ....services.export.org_chart_generator import OrgChartGeneratorService
        tenant_id = request.user.tenant_id
        root_dept_id = request.query_params.get('root_department_id')
        max_depth = int(request.query_params.get('max_depth', 10))
        from uuid import UUID
        root_id = UUID(root_dept_id) if root_dept_id else None
        text_chart = OrgChartGeneratorService().generate_text_org_chart(tenant_id, root_id, max_depth)
        response = HttpResponse(text_chart, content_type='text/plain')
        response['Content-Disposition'] = f'attachment; filename="org_chart_{tenant_id}_{timezone.now().date()}.txt"'
        return response
    
    @action(detail=False, methods=['get'], url_path='visio')
    def export_visio(self, request):
        from ....services.export.visio_exporter import VisioExporterService
        tenant_id = request.user.tenant_id
        root_dept_id = request.query_params.get('root_department_id')
        from uuid import UUID
        root_id = UUID(root_dept_id) if root_dept_id else None
        visio_xml = VisioExporterService.generate_visio_xml(tenant_id, root_id)
        response = HttpResponse(visio_xml, content_type='application/xml')
        response['Content-Disposition'] = f'attachment; filename="org_chart_{tenant_id}_{timezone.now().date()}.vdx"'
        return response
    
    @action(detail=False, methods=['get'], url_path='tree')
    def get_tree_view(self, request):
        from ....services.hierarchy.tree_builder import TreeBuilder
        tenant_id = request.user.tenant_id
        include_inactive = request.query_params.get('include_inactive', 'false').lower() == 'true'
        tree_builder = TreeBuilder()
        tree = tree_builder.build_department_tree(tenant_id, include_inactive)
        return Response({
            'tenant_id': str(tenant_id),
            'tree': tree,
            'metadata': {
                'generated_at': timezone.now().isoformat(),
                'include_inactive': include_inactive,
                'total_departments': self._count_nodes(tree)
            }
        })
    
    def _count_nodes(self, tree):
        """Count total nodes in tree"""
        count = len(tree)
        for node in tree:
            if node.get('children'):
                count += self._count_nodes(node['children'])
        return count
    
    @action(detail=False, methods=['get'], url_path='preview')
    def get_preview(self, request):
        from ....services.hierarchy.tree_builder import TreeBuilder
        tenant_id = request.user.tenant_id
        tree_builder = TreeBuilder()
        tree = tree_builder.build_department_tree(tenant_id, include_inactive=False)
        preview = []
        for dept in tree:
            preview_dept = {
                'id': dept['id'],
                'name': dept['name'],
                'code': dept['code'],
                'children': [
                    {
                        'id': child['id'],
                        'name': child['name'],
                        'code': child['code'],
                        'has_children': len(child.get('children', [])) > 0
                    }
                    for child in dept.get('children', [])[:5]
                ],
                'has_more_children': len(dept.get('children', [])) > 5
            }
            preview.append(preview_dept)
        return Response({
            'tenant_id': str(tenant_id),
            'preview': preview,
            'total_departments': len(tree)
        })