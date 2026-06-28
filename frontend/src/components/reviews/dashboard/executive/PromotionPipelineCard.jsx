// src/components/reviews/dashboard/executive/PromotionPipelineCard.jsx
import React from 'react';
import { TrendingUp, Clock, Users, Award } from 'lucide-react';

const PromotionPipelineCard = ({ pipeline }) => {
  if (!pipeline) return null;

  return (
    <div className="promotion-pipeline-card">
      <h3 className="promotion-pipeline-card-title">
        <TrendingUp size={18} />
        Promotion Pipeline
      </h3>
      <div className="promotion-pipeline-card-stats">
        <div className="promotion-pipeline-card-stat">
          <span className="promotion-pipeline-card-value">{pipeline.pending_promotions || 0}</span>
          <span className="promotion-pipeline-card-label">Pending</span>
        </div>
        <div className="promotion-pipeline-card-stat">
          <span className="promotion-pipeline-card-value">{pipeline.recent_approved || 0}</span>
          <span className="promotion-pipeline-card-label">Approved (30d)</span>
        </div>
      </div>
      {pipeline.by_priority && Object.keys(pipeline.by_priority).length > 0 && (
        <div className="promotion-pipeline-card-priorities">
          <span className="promotion-pipeline-card-priorities-label">By Priority</span>
          {Object.entries(pipeline.by_priority).map(([priority, count]) => (
            <div key={priority} className="promotion-pipeline-card-priority">
              <span className="promotion-pipeline-card-priority-label">{priority}</span>
              <span className="promotion-pipeline-card-priority-count">{count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PromotionPipelineCard;