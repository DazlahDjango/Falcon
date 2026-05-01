from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from ....models.hierarchy_version import HierarchyVersion
from .base import BaseStructureSerializer, BaseStructureDetailSerializer

class HierarchyVersionSerializer(BaseStructureSerializer):
    class Meta:
        model = HierarchyVersion
        fields = [
            'id', 'tenant_id', 'version_number', 'name', 'description',
            'version_type', 'effective_from', 'effective_to', 'is_current',
            'created_at', 'created_by'
        ]
        read_only_fields = ['id', 'tenant_id', 'version_number', 'snapshot_hash', 'created_at', 'updated_at']


class HierarchyVersionDetailSerializer(BaseStructureDetailSerializer):
    snapshot_preview = serializers.SerializerMethodField()
    changes_summary_preview = serializers.SerializerMethodField()
    
    class Meta:
        model = HierarchyVersion
        fields = [
            'id', 'tenant_id', 'version_number', 'name', 'description',
            'version_type', 'snapshot_hash', 'effective_from', 'effective_to',
            'is_current', 'changes_summary', 'approved_by_id', 'approved_at',
            'approved_notes', 'is_deleted', 'snapshot_preview',
            'changes_summary_preview', 'created_at', 'updated_at', 'created_by',
            'updated_by', 'deleted_at', 'deleted_by'
        ]
        read_only_fields = ['id', 'tenant_id', 'snapshot_hash', 'created_at', 'updated_at', 'deleted_at']
    
    def get_snapshot_preview(self, obj):
        if obj.snapshot:
            return {
                'departments_count': len(obj.snapshot.get('departments', [])) if isinstance(obj.snapshot, dict) else 0,
                'version_preview': 'Snapshot available'
            }
        return None

    def get_changes_summary_preview(self, obj):
        if obj.changes_summary:
            return {
                'summary': obj.changes_summary.get('summary', 'No summary'),
                'change_count': obj.changes_summary.get('change_count', 0)
            }
        return None

class HierarchySnapshotSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255, required=False, allow_blank=True)
    description = serializers.CharField(required=False, allow_blank=True)
    version_type = serializers.ChoiceField(choices=HierarchyVersion.VERSION_TYPE_CHOICES, default='manual')
    notes = serializers.CharField(required=False, allow_blank=True)