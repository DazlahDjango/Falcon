// src/components/reviews/reviewDashboard/ReviewWidgetConfigModal.jsx
import React, { useState } from 'react';
import './dashboard.css';
import { WIDGET_TYPES, WIDGET_TYPE_LABELS, WIDGET_SIZES } from '../../../config/constants/reviewConstants';

const ReviewWidgetConfigModal = ({ isOpen, onClose, onSave, initialData = null }) => {
    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        widget_type: initialData?.widget_type || WIDGET_TYPES.SCORE_TREND,
        size: initialData?.size || 'medium',
        config: initialData?.config || {},
    });

    if (!isOpen) return null;

    const widgetTypeOptions = [
        { value: WIDGET_TYPES.SCORE_TREND, label: WIDGET_TYPE_LABELS[WIDGET_TYPES.SCORE_TREND] },
        { value: WIDGET_TYPES.RATING_DISTRIBUTION, label: WIDGET_TYPE_LABELS[WIDGET_TYPES.RATING_DISTRIBUTION] },
        { value: WIDGET_TYPES.DEPARTMENT_RANKING, label: WIDGET_TYPE_LABELS[WIDGET_TYPES.DEPARTMENT_RANKING] },
        { value: WIDGET_TYPES.HIGH_RISK_EMPLOYEES, label: WIDGET_TYPE_LABELS[WIDGET_TYPES.HIGH_RISK_EMPLOYEES] },
        { value: WIDGET_TYPES.INSIGHTS, label: WIDGET_TYPE_LABELS[WIDGET_TYPES.INSIGHTS] },
        { value: WIDGET_TYPES.COMPLETION_RATE, label: WIDGET_TYPE_LABELS[WIDGET_TYPES.COMPLETION_RATE] },
    ];

    const sizeOptions = [
        { value: WIDGET_SIZES.SMALL, label: 'Small' },
        { value: WIDGET_SIZES.MEDIUM, label: 'Medium' },
        { value: WIDGET_SIZES.LARGE, label: 'Large' },
        { value: WIDGET_SIZES.FULL, label: 'Full Width' },
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 className="modal-title">
                        {initialData ? 'Edit Widget' : 'Add New Widget'}
                    </h3>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="widget-settings-group">
                            <label className="widget-settings-label">Widget Title</label>
                            <input
                                type="text"
                                className="widget-settings-input"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                        </div>

                        <div className="widget-settings-group">
                            <label className="widget-settings-label">Widget Type</label>
                            <select
                                className="widget-settings-select"
                                value={formData.widget_type}
                                onChange={(e) => setFormData({ ...formData, widget_type: e.target.value })}
                            >
                                {widgetTypeOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="widget-settings-group">
                            <label className="widget-settings-label">Widget Size</label>
                            <select
                                className="widget-settings-select"
                                value={formData.size}
                                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                            >
                                {sizeOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="filter-button" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="filter-button active">
                            {initialData ? 'Update' : 'Add'} Widget
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReviewWidgetConfigModal;