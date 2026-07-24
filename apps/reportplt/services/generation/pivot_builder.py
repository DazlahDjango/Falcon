# apps/reportplt/services/generation/pivot_builder.py
from typing import Dict, Any, List, Optional
from collections import defaultdict
from datetime import datetime

class PivotBuilder:
    def __init__(self, config: Optional[Dict] = None):
        self.config = config or {}

    def build_pivots(self, data: Dict, pivot_config: Optional[Dict] = None) -> List[Dict]:
        pivots = []
        config = pivot_config or self.config
        kpis = data.get('kpis', [])
        if not kpis:
            return pivots
        pivots.append(self._build_status_pivot(kpis))
        pivots.append(self._build_department_pivot(kpis))
        if data.get('aggregations', {}).get('by_department'):
            pivots.append(self._build_performance_pivot(data['aggregations']['by_department']))
        return pivots

    def _build_status_pivot(self, kpis: List[Dict]) -> Dict:
        pivot_data = defaultdict(lambda: defaultdict(lambda: {'count': 0, 'progress': 0}))
        for kpi in kpis:
            dept = kpi.get('department', 'Unknown')
            status = kpi.get('status', 'Pending')
            pivot_data[dept][status]['count'] += 1
            pivot_data[dept][status]['progress'] += kpi.get('progress', 0)
        rows = []
        for dept, statuses in pivot_data.items():
            row = {'department': dept}
            for status in ['On Track', 'At Risk', 'Off Track', 'Pending']:
                stats = statuses.get(status, {'count': 0, 'progress': 0})
                row[f'{status}_count'] = stats['count']
                row[f'{status}_progress'] = round(stats['progress'] / stats['count'] if stats['count'] > 0 else 0, 2)
            row['total'] = sum(row.get(f'{s}_count', 0) for s in ['On Track', 'At Risk', 'Off Track', 'Pending'])
            rows.append(row)
        columns = ['Department'] + [f'{s}_count' for s in ['On Track', 'At Risk', 'Off Track', 'Pending']]
        columns += ['total']
        return {
            'title': 'Status Pivot by Department',
            'type': 'pivot',
            'columns': columns,
            'rows': [[row.get(col, 0) for col in columns] for row in rows],
            'data': rows
        }

    def _build_department_pivot(self, kpis: List[Dict]) -> Dict:
        pivot_data = defaultdict(lambda: defaultdict(lambda: {'count': 0, 'progress': 0}))
        for kpi in kpis:
            dept = kpi.get('department', 'Unknown')
            category = kpi.get('category', 'Uncategorized')
            pivot_data[dept][category]['count'] += 1
            pivot_data[dept][category]['progress'] += kpi.get('progress', 0)
        rows = []
        categories = sorted(set(c for v in pivot_data.values() for c in v.keys()))
        for dept, categories_data in pivot_data.items():
            row = {'department': dept}
            for cat in categories:
                stats = categories_data.get(cat, {'count': 0, 'progress': 0})
                row[f'{cat}_count'] = stats['count']
                row[f'{cat}_avg_progress'] = round(stats['progress'] / stats['count'] if stats['count'] > 0 else 0, 2)
            rows.append(row)
        columns = ['Department'] + [f'{cat}_count' for cat in categories] + [f'{cat}_avg_progress' for cat in categories]
        return {
            'title': 'Department-Category Pivot',
            'type': 'pivot',
            'columns': columns,
            'rows': [[row.get(col, 0) for col in columns] for row in rows],
            'data': rows
        }

    def _build_performance_pivot(self, dept_data: Dict) -> Dict:
        rows = []
        for dept, stats in dept_data.items():
            rows.append({
                'department': dept,
                'total_kpis': stats.get('count', 0),
                'avg_progress': round(stats.get('avg_progress', 0), 2),
                'on_track': stats.get('on_track', 0),
                'at_risk': stats.get('at_risk', 0),
                'off_track': stats.get('off_track', 0),
                'completion_rate': round(
                    (stats.get('on_track', 0) + stats.get('at_risk', 0)) / stats.get('count', 1) * 100, 2
                ) if stats.get('count', 0) > 0 else 0
            })
        rows.sort(key=lambda x: x['avg_progress'], reverse=True)
        columns = ['Department', 'Total KPIs', 'Avg Progress', 'On Track', 'At Risk', 'Off Track', 'Completion Rate']
        return {
            'title': 'Department Performance Summary',
            'type': 'table',
            'columns': columns,
            'rows': [[row.get(col.lower().replace(' ', '_'), 0) for col in columns] for row in rows],
            'data': rows
        }

    def build_cross_tab(self, data: List[Dict], row_field: str, col_field: str, value_field: str, agg_type: str = 'sum') -> Dict:
        pivot = defaultdict(lambda: defaultdict(float))
        row_labels = set()
        col_labels = set()
        for item in data:
            row = item.get(row_field, 'Unknown')
            col = item.get(col_field, 'Unknown')
            value = item.get(value_field, 0)
            row_labels.add(row)
            col_labels.add(col)
            if agg_type == 'sum':
                pivot[row][col] += value
            elif agg_type == 'count':
                pivot[row][col] += 1
            elif agg_type == 'avg':
                pivot[row][col] = (pivot[row][col] + value) / 2
        sorted_rows = sorted(row_labels)
        sorted_cols = sorted(col_labels)
        result = {
            'row_labels': sorted_rows,
            'col_labels': sorted_cols,
            'data': [[pivot[row].get(col, 0) for col in sorted_cols] for row in sorted_rows],
            'totals': {
                'rows': [sum(pivot[row].values()) for row in sorted_rows],
                'cols': [sum(pivot[row].get(col, 0) for row in sorted_rows) for col in sorted_cols]
            }
        }
        return result

    def build_summary_table(self, data: List[Dict], group_by: str, value_fields: List[str], aggs: Optional[List[str]] = None) -> Dict:
        aggs = aggs or ['sum', 'avg', 'count']
        grouped = defaultdict(lambda: {field: [] for field in value_fields})
        for item in data:
            key = item.get(group_by, 'Unknown')
            for field in value_fields:
                grouped[key][field].append(item.get(field, 0))
        rows = []
        for key, values in grouped.items():
            row = {'group': key}
            for field in value_fields:
                vals = values[field]
                if 'sum' in aggs:
                    row[f'{field}_sum'] = sum(vals)
                if 'avg' in aggs:
                    row[f'{field}_avg'] = sum(vals) / len(vals) if vals else 0
                if 'count' in aggs:
                    row[f'{field}_count'] = len(vals)
                if 'min' in aggs:
                    row[f'{field}_min'] = min(vals) if vals else 0
                if 'max' in aggs:
                    row[f'{field}_max'] = max(vals) if vals else 0
            rows.append(row)
        return {
            'group_by': group_by,
            'value_fields': value_fields,
            'aggregations': aggs,
            'data': rows
        }

    def pivot_to_table_data(self, pivot_data: Dict) -> Dict:
        row_labels = pivot_data.get('row_labels', [])
        col_labels = pivot_data.get('col_labels', [])
        data = pivot_data.get('data', [])
        if not row_labels or not col_labels:
            return {'columns': [], 'rows': []}
        columns = ['Row Label'] + col_labels
        rows = []
        for i, row in enumerate(row_labels):
            row_data = [row]
            row_data.extend(data[i] if i < len(data) else [0] * len(col_labels))
            rows.append(row_data)
        return {
            'columns': columns,
            'rows': rows,
            'totals': pivot_data.get('totals', {})
        }