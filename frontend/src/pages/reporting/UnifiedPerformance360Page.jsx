import React from 'react';
import { useUnifiedPerformance360 } from '../../hooks/reporting';
import { UnifiedPerformance360Widget } from '../../components/reporting';

export const UnifiedPerformance360Page = () => {
  const { data, loading, generateUnifiedReport, downloadReport } = useUnifiedPerformance360();

  const handleExport = () => {
    generateUnifiedReport({}, 'pdf');
  };

  return (
    <div className="reporting-app">
      <div className="reporting-header">
        <div>
          <h1 className="reporting-title">Unified Performance 360</h1>
          <p className="reporting-subtitle">
            Holistic cross-analysis synthesizing KPI operational execution and employee appraisals
          </p>
        </div>
        <button
          className="reporting-btn reporting-btn-primary"
          onClick={handleExport}
          disabled={loading}
        >
          {loading ? 'Generating...' : 'Export PDF Report'}
        </button>
      </div>

      <div style={{ maxWidth: 600, margin: '0 auto 24px auto' }}>
        <UnifiedPerformance360Widget
          summaryData={data}
          onFullExport={handleExport}
        />
      </div>
    </div>
  );
};

export default UnifiedPerformance360Page;
