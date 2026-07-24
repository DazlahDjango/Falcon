import React, { useState } from 'react';
import {
  useReportTemplates,
  useGeneratedReports,
  useReportSchedules,
  useReportAuditLogs
} from '../../hooks/reporting';
import {
  ReportTemplateGrid,
  GeneratedReportTable,
  ReportGeneratorModal,
  ReportProgressModal,
  UnifiedPerformance360Widget,
  SystemAuditSummaryWidget
} from '../../components/reporting';

export const ReportingOverviewPage = () => {
  const { templates, loading: templatesLoading } = useReportTemplates(true);
  const { reports, downloadReport, generateReport, generationProgress, deleteReport } = useGeneratedReports(true);
  const { schedules } = useReportSchedules(true);
  const { logs } = useReportAuditLogs(true);

  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [isProgressOpen, setIsProgressOpen] = useState(false);

  const handleOpenGenerator = (template) => {
    setSelectedTemplate(template);
    setIsGeneratorOpen(true);
  };

  const handleGenerateSubmit = async (params) => {
    const res = await generateReport(params.reportType, params.format, params.filters, params.title, params.asyncMode);
    if (params.asyncMode) {
      setIsProgressOpen(true);
    }
  };

  return (
    <div className="reporting-app">
      <div className="reporting-header">
        <div>
          <h1 className="reporting-title">Organization Reporting Platform</h1>
          <p className="reporting-subtitle">
            Enterprise Production & System Reports, KPI Performance, Appraisals, and Infrastructure Health
          </p>
        </div>
      </div>

      <div className="reporting-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 24 }}>
        <div className="reporting-stat-widget">
          <div className="reporting-stat-icon">📄</div>
          <div>
            <div className="reporting-stat-value">{templates.length}</div>
            <div className="reporting-stat-label">Report Templates</div>
          </div>
        </div>
        <div className="reporting-stat-widget">
          <div className="reporting-stat-icon">📊</div>
          <div>
            <div className="reporting-stat-value">{reports.length}</div>
            <div className="reporting-stat-label">Generated Reports</div>
          </div>
        </div>
        <div className="reporting-stat-widget">
          <div className="reporting-stat-icon">⏰</div>
          <div>
            <div className="reporting-stat-value">{schedules.length}</div>
            <div className="reporting-stat-label">Active Schedules</div>
          </div>
        </div>
        <div className="reporting-stat-widget">
          <div className="reporting-stat-icon">🛡️</div>
          <div>
            <div className="reporting-stat-value">{logs.length}</div>
            <div className="reporting-stat-label">Audit Log Records</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 18, marginBottom: 16, color: '#f8fafc' }}>Popular Report Templates</h2>
          <ReportTemplateGrid
            templates={templates.slice(0, 4)}
            onGenerate={handleOpenGenerator}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <UnifiedPerformance360Widget
            onFullExport={() => generateReport('unified_performance_360', 'pdf', {}, 'Unified 360 Full Export', true)}
          />
          <SystemAuditSummaryWidget />
        </div>
      </div>

      <div>
        <h2 style={{ fontSize: 18, marginBottom: 16, color: '#f8fafc' }}>Recent Generated Reports</h2>
        <GeneratedReportTable
          reports={reports.slice(0, 5)}
          onDownload={downloadReport}
          onDelete={deleteReport}
        />
      </div>

      <ReportGeneratorModal
        isOpen={isGeneratorOpen}
        onClose={() => setIsGeneratorOpen(false)}
        template={selectedTemplate}
        onSubmit={handleGenerateSubmit}
      />

      <ReportProgressModal
        isOpen={isProgressOpen}
        onClose={() => setIsProgressOpen(false)}
        progress={generationProgress}
      />
    </div>
  );
};

export default ReportingOverviewPage;
