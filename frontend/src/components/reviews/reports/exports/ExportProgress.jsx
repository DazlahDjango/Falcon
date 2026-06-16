// src/components/reviews/reports/exports/ExportProgress.jsx
import React from 'react';
import { Download, CheckCircle, Clock } from 'lucide-react';

const ExportProgress = ({ progress = 0 }) => {
  const isComplete = progress >= 100;

  return (
    <div className="export-progress">
      <div className="export-progress-header">
        <span className="export-progress-title">
          {isComplete ? (
            <>
              <CheckCircle size={18} color="#22c55e" />
              Export Complete
            </>
          ) : (
            <>
              <Download size={18} />
              Exporting...
            </>
          )}
        </span>
        <span className="export-progress-percentage">{Math.round(progress)}%</span>
      </div>
      <div className="export-progress-bar">
        <div
          className="export-progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="export-progress-status">
        {isComplete ? 'Your report is ready for download' : 'Preparing your report...'}
      </p>
    </div>
  );
};

export default ExportProgress;