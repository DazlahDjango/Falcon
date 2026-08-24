// src/components/reviews/calibration/sessions/CalibrationSessionCreate.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useCalibration } from '../../../../hooks/reviews';
import { ReviewLoading } from '../../common';
import CalibrationSessionForm from './CalibrationSessionForm';

const CalibrationSessionCreate = () => {
  const navigate = useNavigate();
  const { createSession, sessionLoading } = useCalibration();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    review_cycle: '',
    session_type: 'final',
    scheduled_date: '',
    facilitator: '',
    participants: [],
    departments_included: [],
    agenda: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');
    try {
      const payload = {
        ...formData,
        facilitator: formData.facilitator || null,
        departments_included: (formData.departments_included || []).filter(Boolean),
        participants: (formData.participants || []).filter(Boolean),
      };
      await createSession(payload).unwrap?.() || await createSession(payload);
      navigate('/reviews/calibration/sessions');
    } catch (error) {
      console.error('Failed to create calibration session:', error);
      setSubmitError(error?.message || error?.detail || 'Failed to create calibration session. Please check form values.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (data) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  if (sessionLoading && isSubmitting) return <ReviewLoading size="lg" text="Creating calibration session..." />;

  return (
    <div className="calibration-session-create">
      <div className="calibration-session-create-header">
        <button className="calibration-session-create-back" onClick={() => navigate('/reviews/calibration/sessions')}>
          <ArrowLeft size={20} />
          Back to Sessions
        </button>
        <h1 className="calibration-session-create-title">Create Calibration Session</h1>
      </div>

      <form onSubmit={handleSubmit} className="calibration-session-create-form">
        {submitError && (
          <div style={{ padding: '0.75rem 1rem', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '6px', color: '#b91c1c', marginBottom: '1rem' }}>
            {submitError}
          </div>
        )}
        <CalibrationSessionForm
          data={formData}
          onChange={handleChange}
        />

        <div className="calibration-session-create-actions">
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => navigate('/reviews/calibration/sessions')}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting || !formData.name || !formData.review_cycle || !formData.scheduled_date}
          >
            <Save size={18} />
            {isSubmitting ? 'Creating...' : 'Create Session'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CalibrationSessionCreate;