// src/components/reviews/rating-scales/detail/RatingScaleInfo.jsx
import React from 'react';
import { Calendar, Hash, Users, Scale } from 'lucide-react';

const RatingScaleInfo = ({ scale }) => {
  const infoItems = [
    {
      icon: <Hash size={18} />,
      label: 'Min Value',
      value: scale.min_value,
    },
    {
      icon: <Hash size={18} />,
      label: 'Max Value',
      value: scale.max_value,
    },
    {
      icon: <Scale size={18} />,
      label: 'Levels',
      value: scale.levels?.length || 0,
    },
    {
      icon: <Users size={18} />,
      label: 'Usage Count',
      value: scale.usage_count || 0,
    },
    {
      icon: <Calendar size={18} />,
      label: 'Created',
      value: new Date(scale.created_at).toLocaleDateString(),
    },
    {
      icon: <Calendar size={18} />,
      label: 'Last Updated',
      value: new Date(scale.updated_at).toLocaleDateString(),
    },
  ];

  return (
    <div className="rating-scale-info">
      <h3 className="rating-scale-info-title">Scale Information</h3>
      <div className="rating-scale-info-grid">
        {infoItems.map((item, index) => (
          <div key={index} className="rating-scale-info-item">
            <div className="rating-scale-info-icon">{item.icon}</div>
            <div className="rating-scale-info-content">
              <span className="rating-scale-info-label">{item.label}</span>
              <span className="rating-scale-info-value">{item.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RatingScaleInfo;