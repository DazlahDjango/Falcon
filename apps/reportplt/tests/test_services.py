# apps/reportplt/tests/test_services.py
from django.test import TestCase, SimpleTestCase
from datetime import datetime
from apps.reportplt.services import (
    ReportEngineService,
    ReportGenerator,
    ExtractionResultDTO,
    ReportPayloadDTO,
    ExportResultDTO,
    ScheduleConfigDTO,
    PDFDocumentRenderer,
    ExcelDocumentRenderer,
    CSVDocumentRenderer,
    JSONDocumentRenderer,
    DateFilter,
    DateRangeType,
    RowLevelSecurity,
)

class DTOTestCase(SimpleTestCase):
    def test_extraction_result_dto(self):
        dto = ExtractionResultDTO(
            type="kpi",
            count=5,
            summary={"total": 5, "on_track": 4},
            details=[{"name": "KPI 1", "progress": 85.0}]
        )
        d = dto.to_dict()
        self.assertEqual(d["type"], "kpi")
        self.assertEqual(d["count"], 5)
        self.assertEqual(d["summary"]["total"], 5)
        self.assertEqual(len(d["details"]), 1)

    def test_report_payload_dto(self):
        dto = ReportPayloadDTO(
            report_id="rep-123",
            report_name="Executive Summary",
            report_type="executive",
            metrics={"score": 92.5},
            executive_summary="All targets met."
        )
        d = dto.to_dict()
        self.assertEqual(d["report_id"], "rep-123")
        self.assertEqual(d["status"], "completed")
        self.assertEqual(d["metrics"]["score"], 92.5)

    def test_export_result_dto(self):
        dto = ExportResultDTO(
            status="success",
            export_path="/tmp/report.pdf",
            format="pdf",
            file_size_bytes=1024,
            mime_type="application/pdf",
            checksum_sha256="abc123hash"
        )
        d = dto.to_dict()
        self.assertEqual(d["status"], "success")
        self.assertEqual(d["format"], "pdf")
        self.assertEqual(d["checksum_sha256"], "abc123hash")

class UnifiedRenderersTestCase(SimpleTestCase):
    def setUp(self):
        self.sample_data = {
            "title": "Monthly Performance Report",
            "summary": {"total_kpis": 10, "avg_progress": 88.5},
            "details": [
                {"department": "Engineering", "progress": 92.0},
                {"department": "Operations", "progress": 85.0}
            ]
        }

    def test_pdf_renderer(self):
        renderer = PDFDocumentRenderer("Monthly Performance Report", self.sample_data)
        content = renderer.render()
        self.assertIsInstance(content, bytes)
        self.assertGreater(len(content), 0)

    def test_excel_renderer(self):
        renderer = ExcelDocumentRenderer("Monthly Performance Report", self.sample_data)
        content = renderer.render()
        self.assertIsInstance(content, bytes)
        self.assertGreater(len(content), 0)

    def test_csv_renderer(self):
        renderer = CSVDocumentRenderer("Monthly Performance Report", self.sample_data)
        content = renderer.render()
        self.assertIsInstance(content, bytes)
        self.assertGreater(len(content), 0)

    def test_json_renderer(self):
        renderer = JSONDocumentRenderer("Monthly Performance Report", self.sample_data)
        content = renderer.render()
        self.assertIsInstance(content, bytes)
        self.assertIn(b"Monthly Performance Report", content)

class DateFilterTestCase(SimpleTestCase):
    def test_date_filter_range(self):
        df = DateFilter()
        start, end = df.get_date_range(DateRangeType.TODAY)
        self.assertIsNotNone(start)
        self.assertIsNotNone(end)
        self.assertEqual(start, end)
