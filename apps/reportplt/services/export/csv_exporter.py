# apps/reportplt/services/export/csv_exporter.py
import csv
import io
import uuid
from typing import Dict, Any, List, Optional
from datetime import datetime
from django.utils import timezone
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from apps.reportplt.exceptions import ReportExportError

class CSVExporter:
    def __init__(self, config: Optional[Dict] = None):
        self.config = config or {}
        self.delimiter = self.config.get('delimiter', ',')
        self.quotechar = self.config.get('quotechar', '"')
        self.encoding = self.config.get('encoding', 'utf-8')

    def export(self, data: Dict[str, Any], report_name: str, output_path: Optional[str] = None) -> str:
        try:
            content = self._generate_csv(data)
            if output_path:
                with default_storage.open(output_path, 'wb') as f:
                    f.write(content)
                return output_path
            file_name = f"reports/{uuid.uuid4()}.csv"
            path = default_storage.save(file_name, ContentFile(content))
            return path
        except Exception as e:
            raise ReportExportError(f"CSV export failed: {str(e)}")

    def _generate_csv(self, data: Dict) -> bytes:
        output = io.StringIO()
        writer = csv.writer(output, delimiter=self.delimiter, quotechar=self.quotechar, quoting=csv.QUOTE_MINIMAL)
        
        title = data.get('report_name') or data.get('title') or 'System Report'
        writer.writerow(['FALCON PMS - ' + str(title).upper()])
        if 'generated_at' in data:
            gen_val = data['generated_at']
            try:
                dt = datetime.fromisoformat(str(gen_val).replace('Z', '+00:00'))
                dt_str = timezone.localtime(dt).strftime('%d %b %Y %H:%M') if timezone.is_aware(dt) else dt.strftime('%d %b %Y %H:%M')
                writer.writerow(['Generated At', dt_str])
            except Exception:
                writer.writerow(['Generated At', gen_val])
        if 'executive_summary' in data:
            writer.writerow(['Executive Summary', data['executive_summary']])
        writer.writerow([])
            
        summary = data.get('metrics') or data.get('summary')
        if isinstance(summary, dict) and summary:
            writer.writerow(['=== KEY METRICS SUMMARY ==='])
            writer.writerow(['Metric Name', 'Value'])
            for k, v in summary.items():
                lbl = k.replace('_', ' ').replace('-', ' ').title()
                val = f"{v}%" if ('rate' in k or 'percent' in k) and not str(v).endswith('%') else v
                writer.writerow([lbl, val])
            writer.writerow([])

        kpis = data.get('kpis', [])
        if kpis:
            writer.writerow(['=== KEY PERFORMANCE INDICATORS ==='])
            headers = ['KPI', 'Target', 'Actual', 'Progress', 'Status']
            writer.writerow(headers)
            for kpi in kpis:
                writer.writerow([
                    kpi.get('name', ''),
                    kpi.get('target', ''),
                    kpi.get('actual', ''),
                    kpi.get('progress', ''),
                    kpi.get('status', '')
                ])
            writer.writerow([])

        tables = data.get('tables', [])
        if tables:
            for t_idx, table_data in enumerate(tables, 1):
                writer.writerow([f'=== TABLE {t_idx} ==='])
                columns = table_data.get('columns', [])
                rows = table_data.get('rows', [])
                if columns:
                    writer.writerow(columns)
                for row in rows:
                    writer.writerow(row if isinstance(row, list) else [row])
                writer.writerow([])

        raw_data = data.get('raw_data', {}) if isinstance(data.get('raw_data'), dict) else {}
        combined_sources = {**data, **raw_data}
        
        for k, v in combined_sources.items():
            if k in ['metrics', 'summary', 'charts', 'tables', 'kpis', 'details', 'raw_data']:
                continue
            if isinstance(v, list) and len(v) > 0 and isinstance(v[0], dict):
                section_title = k.replace('_', ' ').replace('-', ' ').upper()
                writer.writerow([f'=== {section_title} ==='])
                headers = list(v[0].keys())
                writer.writerow([h.replace('_', ' ').title() for h in headers])
                for item in v:
                    writer.writerow([item.get(h, '') for h in headers])
                writer.writerow([])
            elif isinstance(v, dict):
                for sub_k, sub_v in v.items():
                    if isinstance(sub_v, list) and len(sub_v) > 0 and isinstance(sub_v[0], dict):
                        section_title = f"{k} - {sub_k}".replace('_', ' ').replace('-', ' ').upper()
                        writer.writerow([f'=== {section_title} ==='])
                        headers = list(sub_v[0].keys())
                        writer.writerow([h.replace('_', ' ').title() for h in headers])
                        for item in sub_v:
                            writer.writerow([item.get(h, '') for h in headers])
                        writer.writerow([])

        return output.getvalue().encode(self.encoding)


    def export_kpis_only(self, kpis: List[Dict]) -> bytes:
        output = io.StringIO()
        writer = csv.writer(output, delimiter=self.delimiter, quotechar=self.quotechar)
        writer.writerow(['KPI', 'Target', 'Actual', 'Progress', 'Status'])
        for kpi in kpis:
            writer.writerow([
                kpi.get('name', ''),
                kpi.get('target', ''),
                kpi.get('actual', ''),
                kpi.get('progress', ''),
                kpi.get('status', '')
            ])
        return output.getvalue().encode(self.encoding)

    def export_table(self, columns: List[str], rows: List[List]) -> bytes:
        output = io.StringIO()
        writer = csv.writer(output, delimiter=self.delimiter, quotechar=self.quotechar)
        writer.writerow(columns)
        for row in rows:
            writer.writerow(row)
        return output.getvalue().encode(self.encoding)

    def export_to_bytes(self, data: Dict[str, Any], report_name: str = "Report", config: Optional[Dict] = None) -> bytes:
        if config:
            self.config.update(config)
        return self._generate_csv(data)