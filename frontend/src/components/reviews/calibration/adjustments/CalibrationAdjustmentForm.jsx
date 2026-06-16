// src/components/reviews/calibration/adjustments/CalibrationAdjustmentForm.jsx
import React, { useState } from 'react';
import { Save, X } from 'lucide-react';
import { useCalibration } from '../../../../hooks/reviews';


const CalibrationAdjustmentForm = ({ sessionId, finalRating, onComplete }) => {
  const { addRating, canManage } = useCalibration();
  const [formData, setFormData] = useState({
    before_score: finalRating?.final_score || 0,
    after_score: finalRating?.final_score || 0,
    reason: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.reason) {
      alert('Please provide a reason for the adjustment');
      return;
    }
    setIsSubmitting(true);
    try {
      await addRating(
        sessionId,
        finalRating.id,
        formData.before_score,
        formData.after_score,
        formData.reason
      );
      onComplete();
    } catch (error) {
      console.error('Failed to add adjustment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!canManage) return null;

  return (
    <div className="calibration-adjustment-form">
      <h4 className="calibration-adjustment-form-title">Calibrate Rating</h4>
      <form onSubmit={handleSubmit}>
        <div className="calibration-adjustment-form-row">
          <div className="calibration-adjustment-form-group">
            <label className="calibration-adjustment-form-label">Before Score</label>
            <input
              type="number"
              className="calibration-adjustment-form-input"
              value={formData.before_score}
              onChange={(e) => setFormData({ ...formData, before_score: Number(e.target.value) })}
              min={0}
              max={100}
              step={0.5}
            />
          </div>
          <div className="calibration-adjustment-form-group">
            <label className="calibration-adjustment-form-label">After Score</label>
            <input
              type="number"
              className="calibration-adjustment-form-input"
              value={formData.after_score}
              onChange={(e) => setFormData({ ...formData, after_score: Number(e.target.value) })}
              min={0}
              max={100}
              step={0.5}
            />
          </div>
        </div>

        <div className="calibration-adjustment-form-group">
          <label className="calibration-adjustment-form-label">Reason *</label>
          <textarea
            className="calibration-adjustment-form-textarea"
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            placeholder="Explain the reason for this adjustment..."
            rows={3}
            required
          />
        </div>

        <div className="calibration-adjustment-form-actions">
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={onComplete}
          >
            <X size={16} />
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary btn-sm"
            disabled={isSubmitting}
          >
            <Save size={16} />
            {isSubmitting ? 'Saving...' : 'Save Adjustment'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CalibrationAdjustmentForm;