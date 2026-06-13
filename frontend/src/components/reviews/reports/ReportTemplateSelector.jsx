// src/components/reviews/reports/ReportTemplateSelector.jsx
import React, { useState } from 'react';
import './reports.css';

const ReportTemplateSelector = ({ templates = [], onSelect, selectedId = null }) => {
    const [selected, setSelected] = useState(selectedId);

    const handleSelect = (template) => {
        setSelected(template.id);
        onSelect?.(template);
    };

    if (!templates || templates.length === 0) {
        return (
            <div className="report-card">
                <div className="report-card-header">
                    <h3 className="report-card-title">Report Templates</h3>
                </div>
                <div className="report-card-body">
                    <div className="report-empty">
                        <p>No report templates available.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="report-card">
            <div className="report-card-header">
                <h3 className="report-card-title">Report Templates</h3>
            </div>
            <div className="report-card-body">
                <div className="template-grid">
                    {templates.map(template => (
                        <div
                            key={template.id}
                            className={`template-card ${selected === template.id ? 'selected' : ''}`}
                            onClick={() => handleSelect(template)}
                        >
                            <div className="template-name">{template.name}</div>
                            <div className="template-description">{template.description}</div>
                            <div className="template-meta">
                                <span>📄 {template.report_type}</span>
                                <span>📊 Used {template.generation_count || 0} times</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ReportTemplateSelector;