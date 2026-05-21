// frontend/src/pages/dashboard/StaffDashboard/MyKPIsPanel.jsx

import React, { useState } from 'react';
import { DashboardCard, KPICard, TrafficLight } from '../../../components/dashboard/common';

export const MyKPIsPanel = ({ data, loading, onRefresh, onSubmit }) => {
  const [editingKpi, setEditingKpi] = useState(null);
  const [formValue, setFormValue] = useState('');
  const [formComments, setFormComments] = useState('');

  const kpis = data || [];

  const handleSubmit = (kpi) => {
    if (formValue) {
      onSubmit?.(kpi.id, parseFloat(formValue), formComments);
      setEditingKpi(null);
      setFormValue('');
      setFormComments('');
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return '#10b981';
    if (score >= 50) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <DashboardCard 
      title="My KPIs" 
      loading={loading}
      onRefresh={onRefresh}
    >
      <div className="kpis-grid">
        {kpis.map((kpi) => (
          <div key={kpi.id} className="kpi-card-wrapper">
            <div className="kpi-header">
              <h4 className="kpi-name">{kpi.name}</h4>
              <TrafficLight status={kpi.traffic_light} size="small" />
            </div>
            
            <div className="kpi-target">
              Target: {kpi.target} {kpi.unit}
            </div>
            
            {kpi.actual ? (
              <div className="kpi-actual">
                <div className="actual-value">
                  Actual: {kpi.actual} {kpi.unit}
                </div>
                <div 
                  className="score-badge"
                  style={{ backgroundColor: getScoreColor(kpi.score) }}
                >
                  Score: {kpi.score}%
                </div>
              </div>
            ) : (
              <div className="kpi-no-data">No data submitted yet</div>
            )}
            
            <div className="kpi-status-badge">
              Status: 
              <span className={`status-${kpi.status}`}>
                {kpi.status?.replace('_', ' ')}
              </span>
            </div>
            
            {kpi.status !== 'approved' && kpi.status !== 'pending' && (
              <button 
                className="submit-btn"
                onClick={() => setEditingKpi(kpi)}
              >
                {kpi.actual ? 'Update' : 'Submit'} Data
              </button>
            )}
            
            {kpi.status === 'pending' && (
              <div className="pending-message">
                ⏳ Awaiting approval...
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Submission Modal */}
      {editingKpi && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Submit KPI Data</h3>
            <p><strong>{editingKpi.name}</strong></p>
            <p>Target: {editingKpi.target} {editingKpi.unit}</p>
            
            <div className="form-group">
              <label>Actual Value:</label>
              <input
                type="number"
                value={formValue}
                onChange={(e) => setFormValue(e.target.value)}
                placeholder={`Enter actual value (max ${editingKpi.target})`}
                step="0.01"
              />
            </div>
            
            <div className="form-group">
              <label>Comments (optional):</label>
              <textarea
                value={formComments}
                onChange={(e) => setFormComments(e.target.value)}
                placeholder="Add any comments or notes..."
                rows={3}
              />
            </div>
            
            <div className="modal-actions">
              <button onClick={() => setEditingKpi(null)}>Cancel</button>
              <button onClick={() => handleSubmit(editingKpi)} disabled={!formValue}>
                Submit for Approval
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardCard>
  );
};

export default MyKPIsPanel;