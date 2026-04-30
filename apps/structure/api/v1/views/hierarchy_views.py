from rest_framework import status, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from django.db import transaction
from django.utils import timezone
from ....models.hierarchy_version import HierarchyVersion
from ..serializers.hierarchy import HierarchyVersionSerializer, HierarchyVersionDetailSerializer, HierarchySnapshotSerializer
from ..throttles.structure_limits import HierarchyReadThrottle, HierarchyWriteThrottle
from ..permissions.structure_permissions import CanViewHierarchy, CanEditHierarchy
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
            self.permission_classes = [CanEditHierarchy]
        else:
            self.permission_classes = [CanViewHierarchy]
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
        from ....services.hierarchy.tree_builder import TreeBuilder
        import hashlib
        import json
        tree_builder = TreeBuilder()
        snapshot = tree_builder.build_full_org_tree(tenant_id)
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
        old_departments = previous_version.snapshot.get('departments', [])
        new_departments = new_snapshot.get('departments', [])
        old_dept_ids = {d.get('id') for d in old_departments}
        new_dept_ids = {d.get('id') for d in new_departments}
        return {
            'departments_added': len(new_dept_ids - old_dept_ids),
            'departments_removed': len(old_dept_ids - new_dept_ids),
            'summary': f"Department changes: +{len(new_dept_ids - old_dept_ids)} / -{len(old_dept_ids - new_dept_ids)}",
            'change_count': len(new_dept_ids ^ old_dept_ids),
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
        departments = snapshot.get('departments', [])
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
        from ....services.audit.diff_calculator import DiffCalculatorService
        old_snapshot = version_a.snapshot if version_a.version_number < version_b.version_number else version_b.snapshot
        new_snapshot = version_b.snapshot if version_a.version_number < version_b.version_number else version_a.snapshot
        old_departments = {d.get('code'): d for d in old_snapshot.get('departments', []) if old_snapshot}
        new_departments = {d.get('code'): d for d in new_snapshot.get('departments', []) if new_snapshot}
        added = [code for code in new_departments.keys() if code not in old_departments]
        removed = [code for code in old_departments.keys() if code not in new_departments]
        modified = []
        for code in set(old_departments.keys()) & set(new_departments.keys()):
            if old_departments[code] != new_departments[code]:
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
                'departments_added': added,
                'departments_removed': removed,
                'departments_modified': modified,
                'add_count': len(added),
                'remove_count': len(removed),
                'modify_count': len(modified)
            }
        })
    
    @action(detail=False, methods=['get'], url_path='current')
    def get_current_version(self, request):
        tenant_id = request.user.tenant_id
        current = HierarchyVersion.objects.filter(tenant_id=tenant_id, is_current=True, is_deleted=False).first()
        if not current:
            return Response({'message': 'No current hierarchy version found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = HierarchyVersionDetailSerializer(current, context={'request': request})
        return Response(serializer.data)
    
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
        from ....services.hierarchy.tree_builder import TreeBuilder
        import hashlib
        import json
        tree_builder = TreeBuilder()
        snapshot = tree_builder.build_full_org_tree(tenant_id)
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
        from ....services.validation.org_validator import OrgValidatorService
        from ....services.hierarchy.cycle_detector import CycleDetector
        validator = OrgValidatorService()
        integrity_check = validator.validate_org_integrity(tenant_id)
        dept_cycles = CycleDetector.find_all_cycles(tenant_id, 'department')
        team_cycles = CycleDetector.find_all_cycles(tenant_id, 'team')
        return Response({
            'is_valid': integrity_check['is_valid'] and len(dept_cycles) == 0 and len(team_cycles) == 0,
            'integrity_issues': integrity_check['issues'],
            'integrity_issue_count': integrity_check['issue_count'],
            'department_cycles': len(dept_cycles),
            'team_cycles': len(team_cycles),
            'cycle_details': {
                'departments': [str(cycle[0]) for cycle in dept_cycles],
                'teams': [str(cycle[0]) for cycle in team_cycles]
            }
        })