import React, { useState } from 'react';
import { ExportScheduleList, ExportHistory } from '../../../components/dashboard/exports';
import { useDashboardExports } from '../../../hooks/dashboard/useDashboardExports';

export const ExecutiveReports = () => {
  const {
    exports,
    history,
    loading,
    createExport,
    updateExport,
    deleteExport,
    triggerExport,
    downloadExport,
    fetchExports,
    fetchHistory
  } = useDashboardExports();

  return (
    <div className="executive-reports-page">
      <div className="page-header">
        <h1>Reports & Exports</h1>
        <p>Schedule and manage dashboard exports</p>
      </div>

      <div className="reports-grid">
        <ExportScheduleList
          exports={exports}
          loading={loading}
          onRefresh={fetchExports}
          onAdd={() => { }}
          onEdit={updateExport}
          onDelete={deleteExport}
          onTrigger={triggerExport}
          onDownload={downloadExport}
        />

        <ExportHistory
          history={history}
          loading={loading}
          onRefresh={fetchHistory}
          onDownload={downloadExport}
        />
      </div>
    </div>
  );
};

export default ExecutiveReports;
