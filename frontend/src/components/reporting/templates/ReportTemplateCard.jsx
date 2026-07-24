import React from 'react';

export const ReportTemplateCard = ({ template, onGenerate, onDuplicate }) => {
  const formats = template.supported_formats || ['pdf', 'excel', 'csv'];

  return (
    <div className="reporting-card">
      <div className="reporting-card-header">
        <span className="reporting-card-title">{template.name}</span>
        <span className="reporting-badge reporting-badge-format">{template.category}</span>
      </div>
      <p className="reporting-card-desc">{template.description}</p>
      <div style={{ marginBottom: 16 }}>
        {formats.map((fmt) => (
          <span key={fmt} className="reporting-badge reporting-badge-format">
            {fmt.toUpperCase()}
          </span>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button
          className="reporting-btn reporting-btn-primary"
          style={{ flex: 1 }}
          onClick={() => onGenerate(template)}
        >
          Generate Report
        </button>
        {onDuplicate && (
          <button
            className="reporting-btn reporting-btn-secondary"
            onClick={() => onDuplicate(template)}
          >
            Duplicate
          </button>
        )}
      </div>
    </div>
  );
};

export default ReportTemplateCard;
