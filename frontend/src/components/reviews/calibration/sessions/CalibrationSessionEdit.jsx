// src/components/reviews/calibration/sessions/CalibrationSessionEdit.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useCalibration } from '../../../../hooks/reviews';
import { ReviewLoading, ReviewError } from '../../common';
import CalibrationSessionForm from './CalibrationSessionForm';

const CalibrationSessionEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedSession, sessionLoading, sessionError, fetchSession, updateSession, canManage } = useCalibration();
  const [formData, setFormData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchSession(id);
    }
  }, [id, fetchSession]);

  useEffect(() => {
    if (selectedSession) {
      setFormData({
        name: selectedSession.name || '',
        description: selectedSession.description || '',
        review_cycle: selectedSession.review_cycle || '',
        session_type: selectedSession.session_type || 'final',
        scheduled_date: selectedSession.scheduled_date || '',
        facilitator: selectedSession.facilitator || '',
        participants: selectedSession.participants || [],
        departments_included: selectedSession.departments_included || [],
        agenda: selectedSession.agenda || '',
        notes: selectedSession.notes || '',
      });
    }
  }, [selectedSession]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData) return;
    setIsSubmitting(true);
    try {
      await updateSession(id, formData);
      navigate(`/reviews/calibration/sessions/${id}`);
    } catch (error) {
      console.error('Failed to update calibration session:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (data) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  if (sessionLoading) return <ReviewLoading size="lg" text="Loading calibration session..." />;
  if (sessionError) return <ReviewError error={sessionError} onRetry={() => fetchSession(id)} />;
  if (!formData) return null;

  return (
    <div className="calibration-session-edit">
      <div className="calibration-session-edit-header">
        <button className="calibration-session-edit-back" onClick={() => navigate(`/reviews/calibration/sessions/${id}`)}>
          <ArrowLeft size={20} />
          Back to Session
        </button>
        <h1 className="calibration-session-edit-title">Edit Calibration Session</h1>
      </div>

      <form onSubmit={handleSubmit} className="calibration-session-edit-form">
        <CalibrationSessionForm data={formData} onChange={handleChange} />

        <div className="calibration-session-edit-actions">
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => navigate(`/reviews/calibration/sessions/${id}`)}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting || !formData.name || !formData.review_cycle || !formData.scheduled_date}
          >
            <Save size={18} />
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CalibrationSessionEdit;