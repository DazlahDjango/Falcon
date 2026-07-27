import React, { useState } from 'react';
import { useGeneratedReports } from '../../hooks/reporting';
import { GeneratedReportTable, ReportProgressModal } from '../../components/reporting';

export const GeneratedReportsPage = () => {
  const { reports, downloadReport, deleteReport, generationProgress, loadReports } = useGeneratedReports(true);
  const [selectedFormat, setSelectedFormat] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const filteredReports = reports.filter((r) => {
    const matchesFormat = selectedFormat === 'all' || r.format === selectedFormat;
    const matchesStatus = selectedStatus === 'all' || r.status === selectedStatus;
    return matchesFormat && matchesStatus;
  });

  return (
    <div className="reporting-app">
      <div className="reporting-header">
        <div>
          <h1 className="reporting-title">Generated Reports History</h1>
          <p className="reporting-subtitle">
            Access and download completed reports or review background generation progress
          </p>
        </div>
        <button className="reporting-btn reporting-btn-secondary" onClick={() => loadReports()}>
          Refresh List
        </button>
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
        <select
          value={selectedFormat}
          onChange={(e) => setSelectedFormat(e.target.value)}
          style={{
            padding: '10px 14px',
            borderRadius: 8,
            background: '#1e293b',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#f8fafc',
            fontSize: 14
          }}
        >
          <option value="all">All Formats</option>
          <option value="pdf">PDF</option>
          <option value="excel">Excel</option>
          <option value="csv">CSV</option>
          <option value="json">JSON</option>
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          style={{
            padding: '10px 14px',
            borderRadius: 8,
            background: '#1e293b',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#f8fafc',
            fontSize: 14
          }}
        >
          <option value="all">All Statuses</option>
          <option value="completed">Completed</option>
          <option value="processing">Processing</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      <GeneratedReportTable
        reports={filteredReports}
        onDownload={downloadReport}
        onDelete={deleteReport}
      />

      <ReportProgressModal
        isOpen={Boolean(generationProgress)}
        onClose={() => {}}
        progress={generationProgress}
      />
    </div>
  );
};

export default GeneratedReportsPage;
