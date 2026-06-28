// src/components/reviews/competencies/detail/CompetencyInfo.jsx
import React from 'react';
import { Tag, Layers, Scale, Star, Calendar, User } from 'lucide-react';

const CompetencyInfo = ({ competency }) => {
  const infoItems = [
    {
      icon: <Tag size={18} />,
      label: 'Name',
      value: competency.name,
    },
    {
      icon: <Layers size={18} />,
      label: 'Type',
      value: competency.competency_type?.replace('_', ' ').toUpperCase() || '—',
    },
    {
      icon: <Layers size={18} />,
      label: 'Category',
      value: competency.category_name || 'Uncategorized',
    },
    {
      icon: <Scale size={18} />,
      label: 'Default Weight',
      value: `${competency.default_weight}%`,
    },
    {
      icon: <Star size={18} />,
      label: 'Required',
      value: competency.is_required ? 'Yes' : 'No',
    },
    {
      icon: <User size={18} />,
      label: 'Created By',
      value: competency.created_by_name || 'Unknown',
    },
    {
      icon: <Calendar size={18} />,
      label: 'Created',
      value: new Date(competency.created_at).toLocaleDateString(),
    },
    {
      icon: <Calendar size={18} />,
      label: 'Last Updated',
      value: new Date(competency.updated_at).toLocaleDateString(),
    },
  ];

  return (
    <div className="competency-info">
      <h3 className="competency-info-title">Competency Information</h3>
      <div className="competency-info-grid">
        {infoItems.map((item, index) => (
          <div key={index} className="competency-info-item">
            <div className="competency-info-icon">{item.icon}</div>
            <div className="competency-info-content">
              <span className="competency-info-label">{item.label}</span>
              <span className="competency-info-value">{item.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompetencyInfo;