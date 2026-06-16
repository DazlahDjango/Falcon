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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createSession(formData);
      navigate('/reviews/calibration/sessions');
    } catch (error) {
      console.error('Failed to create calibration session:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (data) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  if (sessionLoading) return <ReviewLoading size="lg" text="Creating calibration session..." />;

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