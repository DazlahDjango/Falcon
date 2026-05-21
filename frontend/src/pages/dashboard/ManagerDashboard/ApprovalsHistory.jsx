// frontend/src/pages/dashboard/ManagerDashboard/ApprovalsHistory.jsx

import React, { useState } from 'react';
import { DashboardCard } from '../../../components/dashboard/common';

export const ApprovalsHistory = ({ data, loading, onRefresh }) => {
  const [filter, setFilter] = useState('all');
  const history = data || [];

  const filteredHistory = history.filter(item => {
    if (filter === 'approved') return item.status === 'approved';
    if (filter === 'rejected') return item.status === 'rejected';
    return true;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <span className="badge approved">Approved</span>;
      case 'rejected':
        return <span className="badge rejected">Rejected</span>;
      default:
        return <span className="badge pending">Pending</span>;
    }
  };

  return (
    <DashboardCard 
      title="Approvals History" 
      loading={loading}
      onRefresh={onRefresh}
    >
      <div className="history-filters">
        <button 
          className={filter === 'all' ? 'active' : ''}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button 
          className={filter === 'approved' ? 'active' : ''}
          onClick={() => setFilter('approved')}
        >
          Approved
        </button>
        <button 
          className={filter === 'rejected' ? 'active' : ''}
          onClick={() => setFilter('rejected')}
        >
          Rejected
        </button>
      </div>
      
      <div className="history-list">
        {filteredHistory.length === 0 ? (
          <div className="empty-state">
            <p>No approval history found</p>
          </div>
        ) : (
          filteredHistory.map((item) => (
            <div key={item.id} className="history-item">
              <div className="history-icon">
                {item.status === 'approved' ? '✓' : '✗'}
              </div>
              <div className="history-details">
                <div className="history-title">{item.kpi_name}</div>
                <div className="history-meta">
                  <span>👤 {item.staff_name}</span>
                  <span>📊 {item.actual_value}</span>
                  <span>🕐 {new Date(item.approved_at || item.rejected_at).toLocaleDateString()}</span>
                </div>
                {item.comments && (
                  <div className="history-comments">💬 {item.comments}</div>
                )}
              </div>
              <div className="history-status">
                {getStatusBadge(item.status)}
              </div>
            </div>
          ))
        )}
      </div>
    </DashboardCard>
  );
};

export default ApprovalsHistory;