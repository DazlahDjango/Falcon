class DiffCalculatorService:
    @staticmethod
    def diff_departments(old_dept: dict, new_dept: dict) -> dict:
        changes = {}
        all_keys = set(old_dept.keys()) | set(new_dept.keys())
        for key in all_keys:
            old_val = old_dept.get(key)
            new_val = new_dept.get(key)
            if old_val != new_val:
                changes[key] = {'old': old_val, 'new': new_val}
        return changes
    
    @staticmethod
    def diff_team_members(old_members: list, new_members: list) -> dict:
        old_set = set(old_members)
        new_set = set(new_members)
        return {
            'added': list(new_set - old_set),
            'removed': list(old_set - new_set),
            'unchanged': list(old_set & new_set)
        }
    
    @staticmethod
    def diff_reporting_structure(old_reports: dict, new_reports: dict) -> dict:
        changes = {
            'added_managers': [],
            'removed_managers': [],
            'weight_changes': []
        }
        old_manager_ids = set(old_reports.keys())
        new_manager_ids = set(new_reports.keys())
        changes['added_managers'] = list(new_manager_ids - old_manager_ids)
        changes['removed_managers'] = list(old_manager_ids - new_manager_ids)
        for manager_id in (old_manager_ids & new_manager_ids):
            if old_reports[manager_id] != new_reports[manager_id]:
                changes['weight_changes'].append({
                    'manager_id': manager_id,
                    'old_weight': old_reports[manager_id],
                    'new_weight': new_reports[manager_id]
                })
        return changes
    
    @staticmethod
    def summarize_changes(changes: dict) -> str:
        summary_parts = []
        for key, value in changes.items():
            if key == 'added':
                summary_parts.append(f"Added: {len(value)} items")
            elif key == 'removed':
                summary_parts.append(f"Removed: {len(value)} items")
            elif key == 'changed':
                summary_parts.append(f"Changed: {len(value)} fields")
            elif isinstance(value, dict):
                if 'old' in value and 'new' in value:
                    summary_parts.append(f"{key}: {value['old']} → {value['new']}")
        return ', '.join(summary_parts) if summary_parts else 'No changes detected'