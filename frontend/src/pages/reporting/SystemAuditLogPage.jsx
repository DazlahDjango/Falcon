import React, { useState } from 'react';
import { useReportAuditLogs } from '../../hooks/reporting';
import { ReportAuditLogTable, ReportAuditDetailModal } from '../../components/reporting';

export const SystemAuditLogPage = () => {
  const { logs, loadLogs } = useReportAuditLogs(true);
  const [selectedLog, setSelectedLog] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const handleViewDetail = (log) => {
    setSelectedLog(log);
    setIsDetailOpen(true);
  };

  return (
    <div className="reporting-app">
      <div className="reporting-header">
        <div>
          <h1 className="reporting-title">System & Security Audit Logs</h1>
          <p className="reporting-subtitle">
            Immutable tracking of report generation, file downloads, and tenant security events
          </p>
        </div>
        <button className="reporting-btn reporting-btn-secondary" onClick={() => loadLogs()}>
          Refresh Audit Logs
        </button>
      </div>

      <ReportAuditLogTable
        logs={logs}
        onViewDetail={handleViewDetail}
      />

      <ReportAuditDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        auditLog={selectedLog}
      />
    </div>
  );
};

export default SystemAuditLogPage;
