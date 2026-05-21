// frontend/src/pages/dashboard/StaffDashboard/MissionStatusPanel.jsx

import React, { useState } from 'react';
import { DashboardCard } from '../../../components/dashboard/common';

export const MissionStatusPanel = ({ data, loading, onRefresh, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    performance_analysis: data?.performance_analysis || '',
    key_challenges: data?.key_challenges || '',
    actions_planned: data?.actions_planned || '',
    overall_reflection: data?.overall_reflection || '',
    commitments: data?.commitments || ''
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    onUpdate?.(formData);
    setIsEditing(false);
  };

  const status = data?.status || 'draft';
  const submittedAt = data?.submitted_at;

  return (
    <DashboardCard 
      title="Mission Status Report" 
      loading={loading}
      onRefresh={onRefresh}
      action={
        !isEditing && status !== 'approved' && (
          <button className="edit-btn" onClick={() => setIsEditing(true)}>
            ✏️ Edit
          </button>
        )
      }
    >
      <div className="mission-status-header">
        <div className="status-badge">
          Status: <span className={`status-${status}`}>{status}</span>
        </div>
        {submittedAt && (
          <div className="submitted-date">
            Last updated: {new Date(submittedAt).toLocaleDateString()}
          </div>
        )}
      </div>
      
      {isEditing ? (
        <div className="mission-form">
          <div className="form-section">
            <label>Performance Analysis</label>
            <textarea
              value={formData.performance_analysis}
              onChange={(e) => handleChange('performance_analysis', e.target.value)}
              placeholder="Analyze your performance this period..."
              rows={4}
            />
          </div>
          
          <div className="form-section">
            <label>Key Challenges</label>
            <textarea
              value={formData.key_challenges}
              onChange={(e) => handleChange('key_challenges', e.target.value)}
              placeholder="What challenges did you face?"
              rows={3}
            />
          </div>
          
          <div className="form-section">
            <label>Actions Planned</label>
            <textarea
              value={formData.actions_planned}
              onChange={(e) => handleChange('actions_planned', e.target.value)}
              placeholder="What actions will you take?"
              rows={3}
            />
          </div>
          
          <div className="form-section">
            <label>Overall Reflection</label>
            <textarea
              value={formData.overall_reflection}
              onChange={(e) => handleChange('overall_reflection', e.target.value)}
              placeholder="Overall reflection on the period..."
              rows={3}
            />
          </div>
          
          <div className="form-section">
            <label>Commitments for Next Period</label>
            <textarea
              value={formData.commitments}
              onChange={(e) => handleChange('commitments', e.target.value)}
              placeholder="What do you commit to for the next period?"
              rows={3}
            />
          </div>
          
          <div className="form-actions">
            <button onClick={() => setIsEditing(false)}>Cancel</button>
            <button onClick={handleSubmit}>Save Report</button>
          </div>
        </div>
      ) : (
        <div className="mission-view">
          <div className="mission-section">
            <h4>Performance Analysis</h4>
            <p>{data?.performance_analysis || 'Not provided'}</p>
          </div>
          
          <div className="mission-section">
            <h4>Key Challenges</h4>
            <p>{data?.key_challenges || 'Not provided'}</p>
          </div>
          
          <div className="mission-section">
            <h4>Actions Planned</h4>
            <p>{data?.actions_planned || 'Not provided'}</p>
          </div>
          
          <div className="mission-section">
            <h4>Overall Reflection</h4>
            <p>{data?.overall_reflection || 'Not provided'}</p>
          </div>
          
          <div className="mission-section">
            <h4>Commitments for Next Period</h4>
            <p>{data?.commitments || 'Not provided'}</p>
          </div>
        </div>
      )}
    </DashboardCard>
  );
};

export default MissionStatusPanel;