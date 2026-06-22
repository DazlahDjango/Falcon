// src/components/reviews/cycles/detail/CycleInfo.jsx
import React from 'react';
import { Calendar, Clock, Users, FileText, Scale, Star } from 'lucide-react';

const CycleInfo = ({ cycle }) => {
  const infoItems = [
    {
      icon: <Calendar size={18} />,
      label: 'Start Date',
      value: new Date(cycle.start_date).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
    },
    {
      icon: <Calendar size={18} />,
      label: 'End Date',
      value: new Date(cycle.end_date).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
    },
    {
      icon: <Clock size={18} />,
      label: 'Self Assessment Deadline',
      value: new Date(cycle.self_assessment_deadline).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
    },
    {
      icon: <Clock size={18} />,
      label: 'Supervisor Review Deadline',
      value: new Date(cycle.supervisor_review_deadline).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
    },
    {
      icon: <Scale size={18} />,
      label: 'KPI Weight',
      value: `${cycle.kpi_weight || 0}%`,
    },
    {
      icon: <Scale size={18} />,
      label: 'Competency Weight',
      value: `${cycle.competency_weight || 0}%`,
    },
    {
      icon: <Users size={18} />,
      label: 'Participants',
      value: cycle.participants_count || 0,
    },
    {
      icon: <FileText size={18} />,
      label: 'Type',
      value: cycle.cycle_type?.replace('_', ' ').toUpperCase() || 'Custom',
    },
  ];

  return (
    <div className="cycle-info">
      <h3 className="cycle-info-title">Cycle Information</h3>
      <div className="cycle-info-grid">
        {infoItems.map((item, index) => (
          <div key={index} className="cycle-info-item">
            <div className="cycle-info-icon">{item.icon}</div>
            <div className="cycle-info-content">
              <span className="cycle-info-label">{item.label}</span>
              <span className="cycle-info-value">{item.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CycleInfo;