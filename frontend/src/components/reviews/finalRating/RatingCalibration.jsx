// src/components/reviews/finalRating/RatingCalibration.jsx
import React, { useState } from 'react';
import './finalRating.css';

const RatingCalibration = ({ ratings = [], onCalibrate, onRefresh, isFacilitator = false }) => {
    const [selectedRating, setSelectedRating] = useState(null);
    const [calibrationData, setCalibrationData] = useState({
        adjusted_score: '',
        reason: '',
    });
    const [submitting, setSubmitting] = useState(false);

    const handleCalibrateClick = (rating) => {
        setSelectedRating(rating);
        setCalibrationData({
            adjusted_score: rating.final_score,
            reason: '',
        });
    };

    const handleCalibrationChange = (field, value) => {
        setCalibrationData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmitCalibration = async () => {
        if (!calibrationData.reason.trim()) {
            alert('Please provide a reason for the calibration');
            return;
        }
        
        setSubmitting(true);
        try {
            await onCalibrate(selectedRating.id, calibrationData.adjusted_score, calibrationData.reason);
            setSelectedRating(null);
            onRefresh();
        } catch (error) {
            console.error('Failed to calibrate rating:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const getAdjustmentClass = (originalScore, newScore) => {
        if (!newScore) return 'adjustment-neutral';
        if (newScore > originalScore) return 'adjustment-increase';
        if (newScore < originalScore) return 'adjustment-decrease';
        return 'adjustment-neutral';
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
                                    <span className="rating-value">{rating.final_score}%</span>
                                    {rating.calibration_adjustment !== 0 && (
                                        <span className={`adjustment-badge ${getAdjustmentClass(rating.final_score - rating.calibration_adjustment, rating.final_score)}`} style={{ marginLeft: '0.5rem' }}>
                                            {rating.calibration_adjustment > 0 ? '+' : ''}{rating.calibration_adjustment}
                                        </span>
                                    )}
                                </td>
                                <td>{rating.final_rating_label || 'Not Rated'}</td>
                                <td>{rating.manager || '-'}</td>
                                <td>
                                    {isFacilitator && rating.status === 'pending' && (
                                        <button 
                                            className="btn-outline" 
                                            onClick={() => handleCalibrateClick(rating)}
                                            style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}
                                        >
                                            Calibrate
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
                    <h4 style={{ marginBottom: '1rem' }}>Calibrate Rating for {selectedRating.employee_name}</h4>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Current Score</label>
                            <div className="rating-value">{selectedRating.final_score}%</div>
                        </div>
                        <div className="form-group">
                            <label className="form-label required">Calibrated Score</label>
                            <div className="rating-selector">
                                <input
                                    type="range"
                                    className="score-slider"
                                    min="0"
                                    max="100"
                                    step="1"
                                    value={calibrationData.adjusted_score}
                                    onChange={(e) => handleCalibrationChange('adjusted_score', parseFloat(e.target.value))}
                                />
                                <input
                                    type="number"
                                    className="form-input"
                                    style={{ width: '80px' }}
                                    value={calibrationData.adjusted_score}
                                    onChange={(e) => handleCalibrationChange('adjusted_score', parseFloat(e.target.value))}
                                    min="0"
                                    max="100"
                                />
                                <span>%</span>
                            </div>
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label required">Reason for Calibration</label>
                        <textarea
                            className="form-textarea"
                            value={calibrationData.reason}
                            onChange={(e) => handleCalibrationChange('reason', e.target.value)}
                            rows="3"
                            placeholder="Why does this rating need calibration? (e.g., department difficulty, manager bias, etc.)"
                        />
                    </div>
                    <div className="form-actions" style={{ marginTop: '1rem' }}>
                        <button className="btn-secondary" onClick={() => setSelectedRating(null)}>
                            Cancel
                        </button>
                        <button className="btn-primary" onClick={handleSubmitCalibration} disabled={submitting}>
                            {submitting ? 'Saving...' : 'Save Calibration'}
                        </button>
                    </div>
                </div>
            )}

            {ratings.length === 0 && (
                <div className="finalrating-empty">
                    <p>No ratings ready for calibration.</p>
                </div>
            )}
        </div>
    );
};

export default RatingCalibration;