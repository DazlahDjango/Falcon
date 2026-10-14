// frontend/src/components/reports/widgets/SummaryWidget.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { FiCheckCircle, FiClock, FiAward, FiTarget, FiTrendingUp } from 'react-icons/fi';
import './widgets.css';

export const SummaryWidget = ({ widget, data }) => {
    const sourceData = (data && Object.keys(data).length > 0)
        ? data
        : (widget?.config || widget?.data || {});

    const {
        cycle_name = sourceData.cycle_name || 'Annual Performance Cycle 2026',
        cycle_status = sourceData.cycle_status || 'In Progress',
        self_assessment = sourceData.self_assessment || { status: 'Submitted', score: 4.2 },
        supervisor_review = sourceData.supervisor_review || { status: 'Reviewed', score: 3.8 },
        final_rating = sourceData.final_rating || { score: 3.9, band: 'Meets Expectations' },
        kpi_summary = sourceData.kpi_summary || { total: 4, on_track: 3, achievement_rate: 92.5 },
        metrics = sourceData.metrics || [],
    } = sourceData;

    const getStatusBadgeClass = (status) => {
        const s = (status || '').toLowerCase();
        if (s.includes('pip') || s.includes('unsatisfactory') || s.includes('risk') || s.includes('failed')) return 'badge-danger';
        if (s.includes('approved') || s.includes('completed') || s.includes('submitted')) return 'badge-success';
        if (s.includes('progress') || s.includes('review')) return 'badge-warning';
        return 'badge-info';
    };

    const isLowRating = (final_rating?.band || '').toLowerCase().includes('unsatisfactory') || (final_rating?.score && Number(final_rating.score) < 2.5);

    return (
        <div className="summary-widget-container">
            <div className="summary-cycle-header">
                <div className="cycle-info">
                    <span className="cycle-title">{cycle_name}</span>
                    <span className={`summary-status-pill ${getStatusBadgeClass(cycle_status)}`}>
                        <FiCheckCircle size={12} /> {cycle_status}
                    </span>
                </div>
            </div>

            <div className="summary-metrics-grid">
                <div className="summary-metric-card">
                    <div className="metric-icon-box blue">
                        <FiTarget size={18} />
                    </div>
                    <div className="metric-details">
                        <span className="metric-title">Self Assessment</span>
                        <div className="metric-val-row">
                            <span className="metric-value">{self_assessment.score ? Number(self_assessment.score).toFixed(1) : '-'}</span>
                            <span className="metric-subtext">/ 5.0</span>
                        </div>
                        <span className="metric-status-tag">{self_assessment.status || 'Pending'}</span>
                    </div>
                </div>

                <div className="summary-metric-card">
                    <div className="metric-icon-box purple">
                        <FiTrendingUp size={18} />
                    </div>
                    <div className="metric-details">
                        <span className="metric-title">Supervisor Review</span>
                        <div className="metric-val-row">
                            <span className="metric-value">{supervisor_review.score ? Number(supervisor_review.score).toFixed(1) : '-'}</span>
                            <span className="metric-subtext">/ 5.0</span>
                        </div>
                        <span className="metric-status-tag">{supervisor_review.status || 'Pending'}</span>
                    </div>
                </div>

                <div className="summary-metric-card">
                    <div className={`metric-icon-box ${isLowRating ? 'red' : 'green'}`}>
                        <FiAward size={18} />
                    </div>
                    <div className="metric-details">
                        <span className="metric-title">Final Rating</span>
                        <div className="metric-val-row">
                            <span className={`metric-value ${isLowRating ? 'danger' : 'highlight'}`}>{final_rating.score ? Number(final_rating.score).toFixed(2) : '-'}</span>
                        </div>
                        <span className={`metric-band-tag ${isLowRating ? 'danger' : ''}`}>{final_rating.band || 'Calibrated'}</span>
                    </div>
                </div>

                <div className="summary-metric-card">
                    <div className="metric-icon-box amber">
                        <FiClock size={18} />
                    </div>
                    <div className="metric-details">
                        <span className="metric-title">KPI Achievement</span>
                        <div className="metric-val-row">
                            <span className="metric-value">{kpi_summary.achievement_rate ? `${kpi_summary.achievement_rate}%` : '88.0%'}</span>
                        </div>
                        <span className="metric-subtext">{kpi_summary.on_track || 3} of {kpi_summary.total || 4} On Track</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

SummaryWidget.propTypes = {
    widget: PropTypes.object.isRequired,
    data: PropTypes.object,
};
