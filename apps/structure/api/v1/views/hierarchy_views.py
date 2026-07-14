from rest_framework import status, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from django.db import transaction
from django.utils import timezone
from apps.structure.models.hierarchy_version import HierarchyVersion
from apps.structure.api.v1.serializers.hierarchy import HierarchyVersionSerializer, HierarchyVersionDetailSerializer, HierarchySnapshotSerializer
from apps.structure.api.v1.throttles.structure_limits import HierarchyReadThrottle, HierarchyWriteThrottle
from apps.structure.api.v1.permissions.org_permissions import IsTenantMember, CanManageDepartment, CanViewOrgChart
from .base import BaseStructureViewSet, BaseStructureReadOnlyViewSet

class HierarchyViewSet(BaseStructureViewSet):
    queryset = HierarchyVersion.objects.all()
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return HierarchyVersionDetailSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return HierarchySnapshotSerializer
        return HierarchyVersionSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'capture_snapshot', 'restore_version']:
            self.permission_classes = [IsTenantMember, CanManageDepartment]
        else:
            self.permission_classes = [IsTenantMember, CanViewOrgChart]
        return super().get_permissions()
    
    def get_throttles(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'capture_snapshot']:
            self.throttle_classes = [HierarchyWriteThrottle]
        else:
            self.throttle_classes = [HierarchyReadThrottle]
        return super().get_throttles()
    
    def get_queryset(self):
        queryset = super().get_queryset()
        if hasattr(self.request, 'user') and hasattr(self.request.user, 'tenant_id'):
            queryset = queryset.filter(tenant_id=self.request.user.tenant_id)
        return queryset.order_by('-version_number')
    
    @action(detail=False, methods=['post'], url_path='capture')
    @transaction.atomic
    def capture_snapshot(self, request):
        tenant_id = request.user.tenant_id
        serializer = HierarchySnapshotSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        from apps.structure.services.hierarchy.tree_builder import TreeBuilder
        import hashlib
        import json
        tree_builder = TreeBuilder()
        snapshot = tree_builder.build_full_tree(tenant_id)
        snapshot_hash = hashlib.sha256(json.dumps(snapshot, sort_keys=True, default=str).encode()).hexdigest()
        latest_version = HierarchyVersion.objects.filter(tenant_id=tenant_id).order_by('-version_number').first()
        version_number = (latest_version.version_number + 1) if latest_version else 1
        if latest_version:
            latest_version.is_current = False
            latest_version.save(update_fields=['is_current'])
        version = HierarchyVersion.objects.create(
            tenant_id=tenant_id,
            version_number=version_number,
            name=serializer.validated_data.get('name', f"Version {version_number}"),
            description=serializer.validated_data.get('description', ''),
            version_type=serializer.validated_data.get('version_type', 'manual'),
            snapshot=snapshot,
            snapshot_hash=snapshot_hash,
            effective_from=timezone.now(),
            is_current=True,
            created_by=request.user.id,
            changes_summary=self._calculate_changes_summary(latest_version, snapshot) if latest_version else {}
        )
        result_serializer = HierarchyVersionDetailSerializer(version, context={'request': request})
        return Response({
            'message': f'Hierarchy snapshot captured as version {version_number}',
            'version': result_serializer.data
        }, status=status.HTTP_201_CREATED)
    
    def _calculate_changes_summary(self, previous_version: HierarchyVersion, new_snapshot: dict) -> dict:
        if not previous_version or not previous_version.snapshot:
            return {}
        old_divisions = previous_version.snapshot.get('divisions', [])
        new_divisions = new_snapshot.get('divisions', [])
        old_div_ids = {d.get('id') for d in old_divisions}
        new_div_ids = {d.get('id') for d in new_divisions}
        return {
            'divisions_added': len(new_div_ids - old_div_ids),
            'divisions_removed': len(old_div_ids - new_div_ids),
            'summary': f"Division changes: +{len(new_div_ids - old_div_ids)} / -{len(old_div_ids - new_div_ids)}",
            'change_count': len(new_div_ids ^ old_div_ids),
            'captured_at': timezone.now().isoformat()
        }
    
    @action(detail=True, methods=['post'], url_path='restore')
    @transaction.atomic
    def restore_version(self, request, pk=None):
        version = self.get_object()
        if not version.snapshot:
            return Response({'error': 'Version has no snapshot data'}, status=status.HTTP_400_BAD_REQUEST)
        tenant_id = request.user.tenant_id
        snapshot = version.snapshot
        current_version = HierarchyVersion.objects.filter(tenant_id=tenant_id, is_current=True).first()
        if current_version:
            current_version.is_current = False
            current_version.save(update_fields=['is_current'])
        new_version_number = HierarchyVersion.objects.filter(tenant_id=tenant_id).count() + 1
        new_version = HierarchyVersion.objects.create(
            tenant_id=tenant_id,
            version_number=new_version_number,
            name=f"Restored from v{version.version_number} - {version.name}",
            description=f"Restored from version {version.version_number} on {timezone.now().date()}",
            version_type='restructure',
            snapshot=snapshot,
            snapshot_hash=version.snapshot_hash,
            effective_from=timezone.now(),
            is_current=True,
            created_by=request.user.id,
            changes_summary={
                'restored_from_version': version.version_number,
                'restored_at': timezone.now().isoformat(),
                'restored_by': str(request.user.id)
            }
        )
        self._invalidate_cache()
        result_serializer = HierarchyVersionDetailSerializer(new_version, context={'request': request})
        return Response({
            'message': f'Organization restored from version {version.version_number}',
            'new_version': result_serializer.data
        })
    
    @action(detail=True, methods=['get'], url_path='diff/(?P<compare_to_id>[0-9a-f-]+)')
    def compare_versions(self, request, pk=None, compare_to_id=None):
        version_a = self.get_object()
        version_b = HierarchyVersion.objects.filter(id=compare_to_id, tenant_id=request.user.tenant_id).first()
        if not version_b:
            return Response({'error': 'Version to compare not found'}, status=status.HTTP_404_NOT_FOUND)
        old_snapshot = version_a.snapshot if version_a.version_number < version_b.version_number else version_b.snapshot
        new_snapshot = version_b.snapshot if version_a.version_number < version_b.version_number else version_a.snapshot
        old_divisions = {d.get('code'): d for d in old_snapshot.get('divisions', []) if old_snapshot}
        new_divisions = {d.get('code'): d for d in new_snapshot.get('divisions', []) if new_snapshot}
        added = [code for code in new_divisions.keys() if code not in old_divisions]
        removed = [code for code in old_divisions.keys() if code not in new_divisions]
        modified = []
        for code in set(old_divisions.keys()) & set(new_divisions.keys()):
            if old_divisions[code] != new_divisions[code]:
                modified.append(code)
        return Response({
            'version_a': {
                'id': str(version_a.id),
                'version_number': version_a.version_number,
                'name': version_a.name,
                'captured_at': version_a.effective_from
            },
            'version_b': {
                'id': str(version_b.id),
                'version_number': version_b.version_number,
                'name': version_b.name,
                'captured_at': version_b.effective_from
            },
            'differences': {
                'divisions_added': added,
                'divisions_removed': removed,
                'divisions_modified': modified,
                'add_count': len(added),
                'remove_count': len(removed),
                'modify_count': len(modified)
            }
        })
    
    @action(detail=False, methods=['get'], url_path='current')
    def get_current_version(self, request):
        tenant_id = request.user.tenant_id
        from apps.structure.services.hierarchy.tree_builder import TreeBuilder
        import hashlib
        import json
        
        tree_builder = TreeBuilder()
        snapshot = tree_builder.build_full_tree(tenant_id, use_cache=False)
        
        return Response({
            'id': 'live',
            'version_number': 'Live',
            'name': 'Current Live Structure',
            'description': 'Real-time organizational structure',
            'version_type': 'auto',
            'is_current': True,
            'snapshot': snapshot,
            'effective_from': timezone.now()
        })
    
    @action(detail=False, methods=['get'], url_path='history')
    def get_history(self, request):
        tenant_id = request.user.tenant_id
        versions = HierarchyVersion.objects.filter(tenant_id=tenant_id, is_deleted=False).order_by('-version_number')
        limit = int(request.query_params.get('limit', 20))
        versions = versions[:limit]
        serializer = HierarchyVersionSerializer(versions, many=True, context={'request': request})
        return Response({
            'versions': serializer.data,
            'count': versions.count(),
            'total_versions': HierarchyVersion.objects.filter(tenant_id=tenant_id, is_deleted=False).count()
        })
    
    @action(detail=False, methods=['post'], url_path='auto-capture')
    def auto_capture(self, request):
        tenant_id = request.user.tenant_id
        from apps.structure.services.hierarchy.tree_builder import TreeBuilder
        import hashlib
        import json
        tree_builder = TreeBuilder()
        snapshot = tree_builder.build_full_tree(tenant_id)
        snapshot_hash = hashlib.sha256(json.dumps(snapshot, sort_keys=True, default=str).encode()).hexdigest()
        latest_version = HierarchyVersion.objects.filter(tenant_id=tenant_id).order_by('-version_number').first()
        if latest_version and latest_version.snapshot_hash == snapshot_hash:
            return Response({'message': 'No changes detected, snapshot not captured'})
        version_number = (latest_version.version_number + 1) if latest_version else 1
        if latest_version:
            latest_version.is_current = False
            latest_version.save(update_fields=['is_current'])
        version = HierarchyVersion.objects.create(
            tenant_id=tenant_id,
            version_number=version_number,
            name=f"Auto-capture {timezone.now().strftime('%Y-%m-%d %H:%M')}",
            description="Automatically captured hierarchy snapshot",
            version_type='auto',
            snapshot=snapshot,
            snapshot_hash=snapshot_hash,
            effective_from=timezone.now(),
            is_current=True,
            created_by=request.user.id
        )
        return Response({
            'message': f'Auto-captured hierarchy version {version_number}',
            'version_id': str(version.id)
        })
    
    @action(detail=False, methods=['get'], url_path='validate')
    def validate_hierarchy(self, request):
        tenant_id = request.user.tenant_id
        from apps.structure.services.hierarchy.org_validator import OrgValidator
        from apps.structure.services.hierarchy.cycle_detector import CycleDetector
        from apps.structure.models.organizational_unit import OrganizationalUnit
        
        validator = OrgValidator()
        issues = validator.validate_org_integrity(tenant_id)
        cycles = CycleDetector().find_all_cycles(tenant_id)
        
        cycle_details = []
        for node_id, path in cycles:
            unit = OrganizationalUnit.objects.filter(id=node_id).first()
            cycle_details.append({
                'node_id': str(node_id),
                'code': unit.code if unit else '',
                'level': unit.level if unit else 'department',
                'description': CycleDetector.get_cycle_description(path)
            })
            
        return Response({
            'is_valid': len(issues) == 0 and len(cycles) == 0,
            'integrity_issues': issues,
            'integrity_issue_count': len(issues),
            'cycles': len(cycles),
            'cycle_details': cycle_details
        })