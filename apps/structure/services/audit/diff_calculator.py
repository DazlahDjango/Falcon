from typing import Dict, Any, List
from apps.structure.models.organizational_unit import OrganizationalUnit

class DiffCalculatorService:
    @staticmethod
    def diff_org_units(old_unit: Dict[str, Any], new_unit: Dict[str, Any]) -> Dict[str, Any]:
        changes = {}
        all_keys = set(old_unit.keys()) | set(new_unit.keys())
        for key in all_keys:
            old_val = old_unit.get(key)
            new_val = new_unit.get(key)
            if old_val != new_val:
                changes[key] = {'old': old_val, 'new': new_val}
        return changes
    
    @staticmethod
    def diff_org_hierarchy(old_tree: Dict[str, Any], new_tree: Dict[str, Any]) -> Dict[str, Any]:
        changes = {
            'added': [],
            'removed': [],
            'modified': [],
            'moved': []
        }
        def compare_nodes(old_node: Dict[str, Any], new_node: Dict[str, Any], path: str = '') -> None:
            if not old_node and new_node:
                changes['added'].append({'path': path, 'node': new_node})
                return
            if old_node and not new_node:
                changes['removed'].append({'path': path, 'node': old_node})
                return
            if old_node.get('id') != new_node.get('id'):
                changes['modified'].append({'path': path, 'old': old_node, 'new': new_node})
                return
            old_children = old_node.get('children', [])
            new_children = new_node.get('children', [])
            old_ids = {c.get('id'): c for c in old_children}
            new_ids = {c.get('id'): c for c in new_children}
            for node_id in old_ids:
                if node_id not in new_ids:
                    changes['removed'].append({'path': f"{path}/{node_id}", 'node': old_ids[node_id]})
            for node_id in new_ids:
                if node_id not in old_ids:
                    changes['added'].append({'path': f"{path}/{node_id}", 'node': new_ids[node_id]})
            for node_id in old_ids:
                if node_id in new_ids:
                    compare_nodes(old_ids[node_id], new_ids[node_id], f"{path}/{node_id}")
        compare_nodes(old_tree, new_tree)
        return changes
    
    @staticmethod
    def diff_employments(old_emp: Dict[str, Any], new_emp: Dict[str, Any]) -> Dict[str, Any]:
        changes = {}
        all_keys = set(old_emp.keys()) | set(new_emp.keys())
        for key in all_keys:
            old_val = old_emp.get(key)
            new_val = new_emp.get(key)
            if old_val != new_val:
                changes[key] = {'old': old_val, 'new': new_val}
        return changes
    
    @staticmethod
    def summarize_changes(changes: Dict[str, Any]) -> str:
        summary_parts = []
        for key, value in changes.items():
            if key == 'added':
                summary_parts.append(f"Added: {len(value)} items")
            elif key == 'removed':
                summary_parts.append(f"Removed: {len(value)} items")
            elif key == 'modified':
                summary_parts.append(f"Modified: {len(value)} items")
            elif key == 'moved':
                summary_parts.append(f"Moved: {len(value)} items")
            elif isinstance(value, dict) and 'old' in value and 'new' in value:
                summary_parts.append(f"{key}: {value['old']} → {value['new']}")
        return ', '.join(summary_parts) if summary_parts else 'No changes detected'
    
    @staticmethod
    def get_change_summary_stats(changes: Dict[str, Any]) -> Dict[str, int]:
        return {
            'added': len(changes.get('added', [])),
            'removed': len(changes.get('removed', [])),
            'modified': len(changes.get('modified', [])),
            'moved': len(changes.get('moved', []))
        }