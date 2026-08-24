// src/components/reviews/templates/detail/TemplateInfo.jsx
import React from 'react';
import { FileText, CheckCircle, XCircle, Clock, User, Users, Calendar, Layers } from 'lucide-react';

const TemplateInfo = ({ template }) => {
  const infoItems = [
    {
      icon: <FileText size={18} />,
      label: 'Name',
      value: template.name,
    },
    {
      icon: <Layers size={18} />,
      label: 'Version',
      value: `v${template.version || 1}`,
    },
    {
      icon: <User size={18} />,
      label: 'Created By',
      value: template.created_by_name || 'Unknown',
    },
    {
      icon: <Calendar size={18} />,
      label: 'Created',
      value: new Date(template.created_at).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
    },
    {
      icon: <Calendar size={18} />,
      label: 'Last Updated',
      value: new Date(template.updated_at).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
    },
    {
      icon: <CheckCircle size={18} />,
      label: 'Status',
      value: template.is_active ? 'Active' : 'Inactive',
      color: template.is_active ? '#22c55e' : '#6b7280',
    },
  ];

  const appliesTo = [
    { key: 'applies_to_self_assessment', label: 'Self Assessment', icon: <User size={14} /> },
    { key: 'applies_to_supervisor_review', label: 'Supervisor Review', icon: <Users size={14} /> },
    { key: 'applies_to_360_feedback', label: '360 Feedback', icon: <Users size={14} /> },
  ];

  return (
    <div className="template-info">
      <h3 className="template-info-title">Template Information</h3>
      <div className="template-info-grid">
        {infoItems.map((item, index) => (
          <div key={index} className="template-info-item">
            <div className="template-info-icon" style={{ color: item.color }}>
              {item.icon}
            </div>
            <div className="template-info-content">
              <span className="template-info-label">{item.label}</span>
              <span className="template-info-value">{item.value}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="template-info-section">
        <h4 className="template-info-section-title">Applies To</h4>
        <div className="template-info-applies">
          {appliesTo.map((item) => (
            <div key={item.key} className="template-info-applies-item">
              <span className="template-info-applies-icon">{item.icon}</span>
              <span className="template-info-applies-label">{item.label}</span>
              <span className="template-info-applies-value">
                {template[item.key] ? (
                  <CheckCircle size={16} color="#22c55e" />
                ) : (
                  <XCircle size={16} color="#9ca3af" />
                )}
              </span>
            </div>
          ))}
        </div>
      </div>

      {template.custom_sections && template.custom_sections.length > 0 && (
        <div className="template-info-section">
          <h4 className="template-info-section-title">Custom Sections</h4>
          <div className="template-info-custom-sections">
            {template.custom_sections.map((section, index) => (
              <span key={index} className="template-info-custom-section">
                {section}
              </span>
            ))}
          </div>
        </div>
      )}

      {template.section_order && template.section_order.length > 0 && (
        <div className="template-info-section">
          <h4 className="template-info-section-title">Section Order</h4>
          <ol className="template-info-section-order">
            {template.section_order.map((section, index) => (
              <li key={index}>{section}</li>
            ))}
          </ol>
        </div>
      )}

      {template.max_strength_chars && (
        <div className="template-info-section">
          <h4 className="template-info-section-title">Character Limits</h4>
          <div className="template-info-limits">
            <span>Strengths: {template.max_strength_chars} chars</span>
            <span>Improvements: {template.max_improvement_chars} chars</span>
            <span>Goals: {template.max_goals_chars} chars</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateInfo;