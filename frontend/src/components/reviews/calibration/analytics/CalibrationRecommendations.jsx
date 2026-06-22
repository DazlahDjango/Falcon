// src/components/reviews/calibration/analytics/CalibrationRecommendations.jsx
import React from 'react';
import { TrendingUp, AlertTriangle, FileText, CheckCircle } from 'lucide-react';

const CalibrationRecommendations = ({ recommendations }) => {
  if (!recommendations) return null;

  const sections = [
    { key: 'high_priority', label: 'High Priority', icon: <AlertTriangle size={16} color="#ef4444" /> },
    { key: 'medium_priority', label: 'Medium Priority', icon: <AlertTriangle size={16} color="#f59e0b" /> },
    { key: 'low_priority', label: 'Low Priority', icon: <AlertTriangle size={16} color="#6b7280" /> },
  ];

  const hasRecommendations = sections.some(section => 
    recommendations[section.key] && recommendations[section.key].length > 0
  );

  if (!hasRecommendations) {
    return (
      <div className="calibration-recommendations-empty">
        <CheckCircle size={24} color="#22c55e" />
        <p>No calibration recommendations needed.</p>
      </div>
    );
  }

  return (
    <div className="calibration-recommendations">
      <h3 className="calibration-recommendations-title">
        <FileText size={18} />
        Recommendations
      </h3>
      {sections.map((section) => {
        const items = recommendations[section.key] || [];
        if (items.length === 0) return null;
        return (
          <div key={section.key} className="calibration-recommendations-section">
            <div className="calibration-recommendations-section-header">
              {section.icon}
              <span className="calibration-recommendations-section-label">{section.label}</span>
              <span className="calibration-recommendations-section-count">{items.length}</span>
            </div>
            <div className="calibration-recommendations-section-items">
              {items.map((item, index) => (
                <div key={index} className="calibration-recommendation-item">
                  {item.type === 'manager_bias' ? (
                    <div className="calibration-recommendation-manager">
                      <span className="calibration-recommendation-manager-name">{item.manager}</span>
                      <span className="calibration-recommendation-manager-deviation">
                        {item.deviation > 0 ? '+' : ''}{item.deviation}% from average
                      </span>
                      <p className="calibration-recommendation-manager-recommendation">
                        {item.recommendation}
                      </p>
                    </div>
                  ) : (
                    <div className="calibration-recommendation-outlier">
                      <span className="calibration-recommendation-outlier-employee">{item.employee}</span>
                      <span className="calibration-recommendation-outlier-score">{item.score}%</span>
                      <p className="calibration-recommendation-outlier-recommendation">
                        {item.reasons?.join(', ')}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CalibrationRecommendations;