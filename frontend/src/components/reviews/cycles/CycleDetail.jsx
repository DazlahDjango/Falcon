// src/components/reviews/cycle/CycleDetail.jsx
import React from 'react';
import './cycle.css';
import CycleStatusBadge from './CycleStatusBadge';
import CycleProgress from './CycleProgress';

const CycleDetail = ({ cycle, progress, onEdit, onActivate, onClose, onArchive, canManage = false }) => {
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    const getCycleTypeLabel = (type) => {
        const types = {
            mid_year: 'Mid-Year Review',
            end_year: 'End-Year Review',
            quarterly: 'Quarterly Review',
            probation: 'Probation Review',
            special: 'Special Review',
            pip: 'PIP Review',
        };
        return types[type] || type;
    };

    const canActivate = cycle.status === 'draft';
    const canClose = cycle.status === 'active';
    const canArchive = cycle.status === 'completed';

    if (!cycle) {
        return <div className="cycle-loading">Loading cycle details...</div>;
    }

    return (
        <div className="cycle-detail">
            <div className="cycle-detail-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h2 className="cycle-title">{cycle.name}</h2>
                        <div style={{ marginTop: '0.5rem' }}>
                            <CycleStatusBadge status={cycle.status} />
                        </div>
                    </div>
                    {canManage && (
                        <div className="cycle-actions">
                            {canActivate && (
                                <button className="btn-success" onClick={() => onActivate(cycle.id)}>
                                    Activate Cycle
                                </button>
                            )}
                            {canClose && (
                                <button className="btn-warning" onClick={() => onClose(cycle.id)}>
                                    Close Cycle
                                </button>
                            )}
                            {canArchive && (
                                <button className="btn-secondary" onClick={() => onArchive(cycle.id)}>
                                    Archive
                                </button>
                            )}
                            <button className="btn-primary" onClick={() => onEdit(cycle.id)}>
                                Edit Cycle
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="cycle-detail-section">
                <h3 className="cycle-section-title">Cycle Information</h3>
                <div className="cycle-info-grid">
                    <div className="cycle-info-item">
                        <span className="cycle-info-label">Type</span>
                        <span className="cycle-info-value">{getCycleTypeLabel(cycle.cycle_type)}</span>
                    </div>
                    <div className="cycle-info-item">
                        <span className="cycle-info-label">Period</span>
                        <span className="cycle-info-value">{formatDate(cycle.start_date)} - {formatDate(cycle.end_date)}</span>
                    </div>
                    <div className="cycle-info-item">
                        <span className="cycle-info-label">Self Assessment Due</span>
                        <span className="cycle-info-value">{formatDate(cycle.self_assessment_deadline)}</span>
                    </div>
                    <div className="cycle-info-item">
                        <span className="cycle-info-label">Supervisor Review Due</span>
                        <span className="cycle-info-value">{formatDate(cycle.supervisor_review_deadline)}</span>
                    </div>
                    <div className="cycle-info-item">
                        <span className="cycle-info-label">Final Approval Due</span>
                        <span className="cycle-info-value">{formatDate(cycle.final_approval_deadline)}</span>
                    </div>
                    <div className="cycle-info-item">
                        <span className="cycle-info-label">Rating Scale</span>
                        <span className="cycle-info-value">{cycle.rating_scale_name || 'Default'}</span>
                    </div>
                </div>
            </div>

            {cycle.description && (
                <div className="cycle-detail-section">
                    <h3 className="cycle-section-title">Description</h3>
                    <p style={{ margin: 0 }}>{cycle.description}</p>
                </div>
            )}

            <div className="cycle-detail-section">
                <h3 className="cycle-section-title">Score Weights</h3>
                <div className="cycle-info-grid">
                    <div className="cycle-info-item">
                        <span className="cycle-info-label">KPI Score</span>
                        <span className="cycle-info-value">{cycle.kpi_weight}%</span>
                    </div>
                    <div className="cycle-info-item">
                        <span className="cycle-info-label">Competency Score</span>
                        <span className="cycle-info-value">{cycle.competency_weight}%</span>
                    </div>
                    <div className="cycle-info-item">
                        <span className="cycle-info-label">Mission Report</span>
                        <span className="cycle-info-value">{cycle.mission_weight || 0}%</span>
                    </div>
                    <div className="cycle-info-item">
                        <span className="cycle-info-label">Task Completion</span>
                        <span className="cycle-info-value">{cycle.task_weight || 0}%</span>
                    </div>
                </div>
            </div>

            {progress && (
                <div className="cycle-detail-section">
                    <CycleProgress progress={progress} cycleName={cycle.name} />
                </div>
            )}
        </div>
    );
};

export default CycleDetail;