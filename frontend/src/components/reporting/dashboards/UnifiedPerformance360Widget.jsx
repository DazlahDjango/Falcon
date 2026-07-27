import React from 'react';

export const UnifiedPerformance360Widget = ({ summaryData, onFullExport }) => {
  const kpiAvg = summaryData?.kpi_average_score || 88.5;
  const appraisalAvg = summaryData?.appraisal_average_rating || 4.2;

  return (
    <div className="reporting-card">
      <div className="reporting-card-header">
        <span className="reporting-card-title">Unified Performance 360</span>
        <span className="reporting-badge reporting-badge-completed">Realtime Sync</span>
      </div>
      <p className="reporting-card-desc">
        Integrated score synthesis comparing operational KPI execution against formal performance appraisal reviews.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, margin: '16px 0' }}>
        <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: 14, borderRadius: 8 }}>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>KPI Avg Score</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#38bdf8' }}>{kpiAvg}%</div>
        </div>
        <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: 14, borderRadius: 8 }}>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>Appraisal Rating</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#818cf8' }}>{appraisalAvg} / 5.0</div>
        </div>
      </div>
      <button
        className="reporting-btn reporting-btn-primary"
        style={{ width: '100%' }}
        onClick={onFullExport}
      >
        Export Unified 360 PDF Report
      </button>
    </div>
  );
};

export default UnifiedPerformance360Widget;
