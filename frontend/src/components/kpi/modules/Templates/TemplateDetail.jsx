import React from 'react';
import { FiArrowLeft, FiEdit2, FiTrash2, FiCopy, FiCheckCircle, FiPackage, FiTarget, FiCalendar, FiBarChart2 } from 'react-icons/fi';

const DIFFICULTY_CONFIG = {
    BEGINNER: { label: 'Beginner', color: '#10b981', icon: '🌱' },
    INTERMEDIATE: { label: 'Intermediate', color: '#f59e0b', icon: '📈' },
    ADVANCED: { label: 'Advanced', color: '#ef4444', icon: '🚀' },
};

const KPI_TYPE_LABELS = {
    COUNT: 'Count / Number',
    PERCENTAGE: 'Percentage (%)',
    FINANCIAL: 'Financial Amount',
    MILESTONE: 'Yes / No Milestone',
    TIME: 'Time / Turnaround',
    IMPACT: 'Impact Score',
};

const TemplateDetail = ({ template, onEdit, onDelete, onPublish, onUse, onBack }) => {
    const difficultyInfo = DIFFICULTY_CONFIG[template.difficulty] || DIFFICULTY_CONFIG.INTERMEDIATE;
    const kpiDef = template.kpi_definition || {};

    return (
        <div className="template-detail">
            <div className="detail-header">
                <button className="back-btn" onClick={onBack}>
                    <FiArrowLeft size={16} />
                    Back to Templates
                </button>
                <div className="detail-actions">
                    {!template.is_published && (
                        <button className="btn-success" onClick={() => onPublish(template.id)}>
                            <FiCheckCircle size={14} />
                            Publish
                        </button>
                    )}
                    <button className="btn-secondary" onClick={() => onEdit(template)}>
                        <FiEdit2 size={14} />
                        Edit
                    </button>
                    <button className="btn-primary" onClick={() => onUse(template)}>
                        <FiCopy size={14} />
                        Use Template
                    </button>
                    <button className="btn-danger" onClick={() => onDelete(template.id)}>
                        <FiTrash2 size={14} />
                        Delete
                    </button>
                </div>
            </div>

            <div className="detail-content">
                <div className="detail-main">
                    <div className="detail-icon" style={{ backgroundColor: difficultyInfo.color + '20' }}>
                        <span className="template-icon-large">{difficultyInfo.icon}</span>
                    </div>
                    <div className="detail-info">
                        <h1 className="detail-title">{template.name}</h1>
                        <div className="detail-meta">
                            <span className="detail-code">{template.code}</span>
                            <span className="detail-badge" style={{ backgroundColor: difficultyInfo.color + '20', color: difficultyInfo.color }}>
                                {difficultyInfo.label}
                            </span>
                            {template.is_published && (
                                <span className="detail-badge published">Published</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="detail-stats">
                    <div className="stat-card">
                        <div className="stat-value">{template.usage_count || 0}</div>
                        <div className="stat-label">Times Used</div>
                        <FiPackage size={16} className="stat-icon" />
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{template.sector_name}</div>
                        <div className="stat-label">Sector</div>
                        <FiTarget size={16} className="stat-icon" />
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{KPI_TYPE_LABELS[kpiDef.kpi_type]?.split(' ')[0] || 'KPI'}</div>
                        <div className="stat-label">Type</div>
                        <FiBarChart2 size={16} className="stat-icon" />
                    </div>
                </div>

                {template.description && (
                    <div className="detail-section">
                        <h3 className="section-title">Description</h3>
                        <p className="section-content">{template.description}</p>
                    </div>
                )}

                <div className="detail-section">
                    <h3 className="section-title">KPI Definition Template</h3>
                    <div className="definition-preview">
                        <div className="preview-grid">
                            <div className="preview-item">
                                <span className="preview-label">KPI Type:</span>
                                <span className="preview-value">{KPI_TYPE_LABELS[kpiDef.kpi_type]}</span>
                            </div>
                            <div className="preview-item">
                                <span className="preview-label">Calculation Logic:</span>
                                <span className="preview-value">
                                    {kpiDef.calculation_logic === 'HIGHER_IS_BETTER' ? 'Higher is Better' : 'Lower is Better'}
                                </span>
                            </div>
                            <div className="preview-item">
                                <span className="preview-label">Measure Type:</span>
                                <span className="preview-value">
                                    {kpiDef.measure_type === 'CUMULATIVE' ? 'Cumulative (YTD)' : 'Non-Cumulative (Period Only)'}
                                </span>
                            </div>
                            <div className="preview-item">
                                <span className="preview-label">Unit:</span>
                                <span className="preview-value">{kpiDef.unit || 'Not specified'}</span>
                            </div>
                            <div className="preview-item">
                                <span className="preview-label">Decimal Places:</span>
                                <span className="preview-value">{kpiDef.decimal_places || 2}</span>
                            </div>
                            <div className="preview-item">
                                <span className="preview-label">Target Range:</span>
                                <span className="preview-value">
                                    {kpiDef.target_min !== null && kpiDef.target_max !== null
                                        ? `${kpiDef.target_min} - ${kpiDef.target_max}`
                                        : kpiDef.target_min !== null
                                            ? `Min: ${kpiDef.target_min}`
                                            : kpiDef.target_max !== null
                                                ? `Max: ${kpiDef.target_max}`
                                                : 'Not specified'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="detail-section">
                    <h3 className="section-title">Target Phasing Pattern</h3>
                    <div className="phasing-preview">
                        <div className="phasing-strategy">
                            <strong>Strategy:</strong> {
                                template.target_phasing_pattern?.strategy === 'equal_split' ? 'Equal Split' :
                                    template.target_phasing_pattern?.strategy === 'seasonal' ? 'Seasonal Distribution' :
                                        'Custom Pattern'
                            }
                        </div>
                        {template.target_phasing_pattern?.strategy === 'custom_pattern' &&
                            template.target_phasing_pattern?.custom_pattern && (
                                <div className="custom-pattern-preview">
                                    <div className="pattern-bars">
                                        {Object.entries(template.target_phasing_pattern.custom_pattern).map(([month, percentage]) => (
                                            <div key={month} className="pattern-bar-item">
                                                <div
                                                    className="pattern-bar"
                                                    style={{ height: `${percentage}%`, width: '30px' }}
                                                />
                                                <span className="pattern-month">
                                                    {new Date(2000, parseInt(month) - 1).toLocaleString('default', { month: 'short' })}
                                                </span>
                                                <span className="pattern-value">{percentage}%</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                    </div>
                </div>

                <div className="detail-section">
                    <h3 className="section-title">Metadata</h3>
                    <div className="metadata-grid">
                        <div className="metadata-item">
                            <span className="metadata-label">Created At:</span>
                            <span className="metadata-value">{new Date(template.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="metadata-item">
                            <span className="metadata-label">Last Updated:</span>
                            <span className="metadata-value">{new Date(template.updated_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TemplateDetail;