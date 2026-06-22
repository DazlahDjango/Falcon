// src/components/reviews/dashboard/admin/PromotionOverview.jsx
import React from 'react';
import { TrendingUp, Users, CheckCircle, Clock } from 'lucide-react';

const PromotionOverview = ({ overview }) => {
  if (!overview) return null;

  return (
    <div className="promotion-overview">
      <h3 className="promotion-overview-title">
        <TrendingUp size={18} />
        Promotion Oversight
      </h3>
      <div className="promotion-overview-stats">
        <div className="promotion-overview-stat">
          <span className="promotion-overview-value" style={{ color: '#f59e0b' }}>
            {overview.pending || 0}
          </span>
          <span className="promotion-overview-label">Pending</span>
        </div>
        <div className="promotion-overview-stat">
          <span className="promotion-overview-value" style={{ color: '#22c55e' }}>
            {overview.approved_this_quarter || 0}
          </span>
          <span className="promotion-overview-label">Approved (QTD)</span>
        </div>
        <div className="promotion-overview-stat">
          <span className="promotion-overview-value" style={{ color: '#8b5cf6' }}>
            {overview.completed_this_quarter || 0}
          </span>
          <span className="promotion-overview-label">Completed (QTD)</span>
        </div>
      </div>
    </div>
  );
};

export default PromotionOverview;