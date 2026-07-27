import React from 'react';
import ReportStatusBadge from './ReportStatusBadge';

export const ReportProgressModal = ({ isOpen, onClose, progress }) => {
  if (!isOpen || !progress) return null;

  const percent = progress.percentage || 0;
  const stage = progress.stage || 'Processing...';

  return (
    <div className="reporting-modal-overlay">
      <div className="reporting-modal-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: 18, color: '#f8fafc' }}>Report Generation Progress</h3>
          <ReportStatusBadge status={progress.status || 'processing'} />
        </div>
        <div className="reporting-progress-bar-bg">
          <div className="reporting-progress-bar-fill" style={{ width: `${percent}%` }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#94a3b8' }}>
          <span>Stage: {stage}</span>
          <span>{percent}%</span>
        </div>
        {progress.error && (
          <div style={{ marginTop: 16, color: '#f87171', fontSize: 13, background: 'rgba(239, 68, 68, 0.1)', padding: 12, borderRadius: 8 }}>
            {progress.error}
          </div>
        )}
        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
          <button className="reporting-btn reporting-btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportProgressModal;
