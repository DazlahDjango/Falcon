// src/components/reviews/calibration/CalibrationRatingAdjustment.jsx
import React, { useState } from 'react';
import './calibration.css';

const CalibrationRatingAdjustment = ({ ratings = [], onAdjust, onRefresh, isFacilitator = false }) => {
    const [selectedRating, setSelectedRating] = useState(null);
    const [adjustmentData, setAdjustmentData] = useState({
        after_score: '',
        reason: '',
    });
    const [submitting, setSubmitting] = useState(false);

    const handleAdjustClick = (rating) => {
        setSelectedRating(rating);
        setAdjustmentData({
            after_score: rating.current_score,
            reason: '',
        });
    };

    const handleAdjustmentChange = (field, value) => {
        setAdjustmentData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmitAdjustment = async () => {
        if (!adjustmentData.reason.trim()) {
            alert('Please provide a reason for the adjustment');
            return;
        }
        
        setSubmitting(true);
        try {
            await onAdjust(selectedRating.id, selectedRating.current_score, adjustmentData.after_score, adjustmentData.reason);
            setSelectedRating(null);
            onRefresh();
        } catch (error) {
            console.error('Failed to adjust rating:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const getAdjustmentClass = (beforeScore, afterScore) => {
        if (!afterScore) return 'adjustment-neutral';
        if (afterScore > beforeScore) return 'adjustment-increase';
        if (afterScore < beforeScore) return 'adjustment-decrease';
        return 'adjustment-neutral';
    };

    const getAdjustmentSymbol = (beforeScore, afterScore) => {
        if (!afterScore) return '';
        const diff = afterScore - beforeScore;
        if (diff > 0) return `+${diff.toFixed(1)}`;
        if (diff < 0) return diff.toFixed(1);
        return '';
    };

    return (
        <div>
            <div className="adjustment-table-container">
                <table className="adjustment-table">
                    <thead>
                        <tr>
                            <th>Employee</th>
                            <th>Department</th>
                            <th>Current Score</th>
                            <th>Current Rating</th>
                            <th>Manager</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ratings.map(rating => (
                            <tr key={rating.id}>
                                <td>{rating.employee_name}</td>
                                <td>{rating.department || '-'}</td>
                                <td>
                                    <span className="rating-value">{rating.current_score}%</span>
                                    {rating.adjustment && (
                                        <span className={`adjustment-badge ${getAdjustmentClass(rating.current_score, rating.adjusted_score)}`} style={{ marginLeft: '0.5rem' }}>
                                            {getAdjustmentSymbol(rating.current_score, rating.adjusted_score)}
                                        </span>
                                    )}
                                </td>
                                <td>{rating.current_label || 'Not Rated'}</td>
                                <td>{rating.manager || '-'}</td>
                                <td>
                                    {isFacilitator && (
                                        <button 
                                            className="btn-outline" 
                                            onClick={() => handleAdjustClick(rating)}
                                            style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}
                                        >
                                            Adjust
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedRating && (
                <div className="adjustment-form">
                    <h4 style={{ marginBottom: '1rem' }}>Adjust Rating for {selectedRating.employee_name}</h4>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Current Score</label>
                            <div className="rating-value">{selectedRating.current_score}%</div>
                        </div>
                        <div className="form-group">
                            <label className="form-label required">Adjusted Score</label>
                            <div className="rating-selector">
                                <input
                                    type="range"
                                    className="score-slider"
                                    min="0"
                                    max="100"
                                    step="1"
                                    value={adjustmentData.after_score}
                                    onChange={(e) => handleAdjustmentChange('after_score', parseFloat(e.target.value))}
                                />
                                <input
                                    type="number"
                                    className="form-input"
                                    style={{ width: '80px' }}
                                    value={adjustmentData.after_score}
                                    onChange={(e) => handleAdjustmentChange('after_score', parseFloat(e.target.value))}
                                    min="0"
                                    max="100"
                                />
                                <span>%</span>
                            </div>
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label required">Reason for Adjustment</label>
                        <textarea
                            className="form-textarea"
                            value={adjustmentData.reason}
                            onChange={(e) => handleAdjustmentChange('reason', e.target.value)}
                            rows="3"
                            placeholder="Why is this adjustment needed? (e.g., department difficulty, manager bias, etc.)"
                        />
                    </div>
                    <div className="form-actions" style={{ marginTop: '1rem' }}>
                        <button className="btn-secondary" onClick={() => setSelectedRating(null)}>
                            Cancel
                        </button>
                        <button className="btn-primary" onClick={handleSubmitAdjustment} disabled={submitting}>
                            {submitting ? 'Saving...' : 'Save Adjustment'}
                        </button>
                    </div>
                </div>
            )}

            {ratings.length === 0 && (
                <div className="calibration-empty">
                    <p>No ratings ready for calibration.</p>
                </div>
            )}
        </div>
    );
};

export default CalibrationRatingAdjustment;