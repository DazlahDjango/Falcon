// src/components/reviews/calibration/detail/CalibrationSessionDetail.jsx
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Printer, Edit, Trash2 } from 'lucide-react';
import { useCalibration } from '../../../../hooks/reviews';
import { ReviewLoading, ReviewError, ReviewStatusBadge } from '../../common';
import CalibrationSessionInfo from './CalibrationSessionInfo';
import CalibrationSessionActions from './CalibrationSessionActions';
import CalibrationSessionParticipants from './CalibrationSessionParticipants';
import CalibrationRatingList from './CalibrationRatingList';
import CalibrationCommentList from './CalibrationCommentList';
import CalibrationCommentForm from './CalibrationCommentForm';

const CalibrationSessionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedSession, sessionLoading, sessionError, fetchSession, getReport, deleteSession, canManage } = useCalibration();

  useEffect(() => {
    if (id) {
      fetchSession(id);
      getReport(id);
    }
  }, [id, fetchSession, getReport]);

  const handleRefresh = () => {
    if (id) {
      fetchSession(id);
      getReport(id);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${selectedSession?.name}"?`)) {
      await deleteSession(id);
      navigate('/reviews/calibration/sessions');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (sessionLoading) return <ReviewLoading size="lg" text="Loading calibration session..." />;
  if (sessionError) return <ReviewError error={sessionError} onRetry={() => fetchSession(id)} />;
  if (!selectedSession) return null;

  return (
    <div className="calibration-session-detail">
      <div className="calibration-session-detail-header">
        <button className="calibration-session-detail-back" onClick={() => navigate('/reviews/calibration/sessions')}>
          <ArrowLeft size={20} />
          Back to Sessions
        </button>
        <div className="calibration-session-detail-actions">
          <button className="calibration-session-detail-refresh" onClick={handleRefresh}>
            <RefreshCw size={18} />
          </button>
          <button className="btn btn-outline" onClick={handlePrint}>
            <Printer size={18} />
            Print
          </button>
          {canManage && (
            <>
              <button
                className="btn btn-primary"
                onClick={() => navigate(`/reviews/calibration/sessions/${id}/edit`)}
              >
                <Edit size={18} />
                Edit
              </button>
              <button
                className="btn btn-danger"
                onClick={handleDelete}
              >
                <Trash2 size={18} />
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      <div className="calibration-session-detail-content">
        <div className="calibration-session-detail-top">
          <div className="calibration-session-detail-title-section">
            <h1 className="calibration-session-detail-title">{selectedSession.name}</h1>
            <div className="calibration-session-detail-badges">
              <ReviewStatusBadge status={selectedSession.status} size="lg" />
              <span className="calibration-session-detail-type">{selectedSession.session_type_display}</span>
            </div>
          </div>
        </div>

        {selectedSession.description && (
          <p className="calibration-session-detail-description">{selectedSession.description}</p>
        )}

        <div className="calibration-session-detail-grid">
          <div className="calibration-session-detail-main">
            <CalibrationSessionInfo session={selectedSession} />
            <CalibrationRatingList sessionId={id} />
            <div className="calibration-session-detail-comments-section">
              <h3 className="calibration-session-detail-section-title">Comments</h3>
              <CalibrationCommentForm sessionId={id} />
              <CalibrationCommentList sessionId={id} />
            </div>
          </div>
          <div className="calibration-session-detail-sidebar">
            <CalibrationSessionActions session={selectedSession} onAction={handleRefresh} />
            <CalibrationSessionParticipants session={selectedSession} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalibrationSessionDetail;