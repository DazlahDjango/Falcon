// src/components/reviews/dashboard/staff/StaffOverview.jsx
import React from 'react';
import { User, CheckCircle, Clock, AlertCircle, FileText, Star } from 'lucide-react';
import { ReviewStatusBadge, ReviewScoreGauge } from '../../common';

const StaffOverview = ({ employee }) => {
  if (!employee) return null;

  const statusItems = [
    {
      icon: <FileText size={18} />,
      label: 'Self Assessment',
      status: employee.self_assessment?.status || 'not_started',
      submitted: employee.self_assessment?.submitted || false,
    },
    {
      icon: <User size={18} />,
      label: 'Supervisor Review',
      status: employee.supervisor_review?.status || 'pending',
      submitted: employee.supervisor_review?.submitted || false,
    },
    {
      icon: <Star size={18} />,
      label: 'Final Rating',
      status: employee.final_rating?.status || 'pending',
      score: employee.final_rating?.score || null,
    },
  ];

  return (
    <div className="staff-overview">
      <h3 className="staff-overview-title">Your Progress</h3>
      <div className="staff-overview-items">
        {statusItems.map((item, index) => (
          <div key={index} className="staff-overview-item">
            <div className="staff-overview-item-icon">{item.icon}</div>
            <div className="staff-overview-item-content">
              <span className="staff-overview-item-label">{item.label}</span>
              <div className="staff-overview-item-status">
                <ReviewStatusBadge status={item.status} size="sm" />
                {item.score && (
                  <span className="staff-overview-item-score">{item.score}%</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StaffOverview;