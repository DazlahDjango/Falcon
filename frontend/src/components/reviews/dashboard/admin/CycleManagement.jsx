// src/components/reviews/dashboard/admin/CycleManagement.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Eye, Edit, Trash2 } from 'lucide-react';
import { ReviewStatusBadge } from '../../common';

const CycleManagement = ({ cycles = [] }) => {
  const navigate = useNavigate();

  if (!cycles || cycles.length === 0) {
    return (
      <div className="cycle-management">
        <h3 className="cycle-management-title">Recent Cycles</h3>
        <div className="cycle-management-empty">
          <p>No cycles found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cycle-management">
      <h3 className="cycle-management-title">
        <Calendar size={18} />
        Recent Cycles
      </h3>
      <div className="cycle-management-list">
        {cycles.map((cycle, index) => (
          <div key={index} className="cycle-management-item" onClick={() => navigate(`/reviews/cycles/${cycle.id}`)}>
            <div className="cycle-management-item-info">
              <span className="cycle-management-item-name">{cycle.name}</span>
              <ReviewStatusBadge status={cycle.status} size="sm" />
            </div>
            <div className="cycle-management-item-meta">
              <span className="cycle-management-item-dates">
                <Clock size={12} />
                {new Date(cycle.start_date).toLocaleDateString()} - {new Date(cycle.end_date).toLocaleDateString()}
              </span>
              <button
                className="cycle-management-item-btn"
                onClick={(e) => { e.stopPropagation(); navigate(`/reviews/cycles/${cycle.id}`); }}
              >
                <Eye size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CycleManagement;