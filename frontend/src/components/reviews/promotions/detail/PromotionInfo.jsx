// src/components/reviews/promotions/detail/PromotionInfo.jsx
import React from 'react';
import { User, TrendingUp, Calendar, DollarSign, Award, FileText, Users, Clock } from 'lucide-react';

const PromotionInfo = ({ promotion }) => {
  const infoItems = [
    {
      icon: <User size={18} />,
      label: 'Employee',
      value: promotion.employee_name,
      sub: promotion.employee_email,
    },
    {
      icon: <User size={18} />,
      label: 'Recommended By',
      value: promotion.recommended_by_name || 'Unknown',
    },
    {
      icon: <TrendingUp size={18} />,
      label: 'Role Change',
      value: `${promotion.current_role} → ${promotion.recommended_role}`,
      highlight: true,
    },
    {
      icon: <Calendar size={18} />,
      label: 'Recommended Date',
      value: new Date(promotion.recommended_date).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
    },
    {
      icon: <DollarSign size={18} />,
      label: 'Salary',
      value: promotion.proposed_salary 
        ? `$${promotion.proposed_salary.toLocaleString()}`
        : '—',
      sub: promotion.current_salary 
        ? `Current: $${promotion.current_salary.toLocaleString()}`
        : '',
    },
    {
      icon: <Award size={18} />,
      label: 'Level Change',
      value: promotion.current_level && promotion.recommended_level
        ? `${promotion.current_level} → ${promotion.recommended_level}`
        : '—',
    },
  ];

  if (promotion.target_promotion_date) {
    infoItems.push({
      icon: <Calendar size={18} />,
      label: 'Target Date',
      value: new Date(promotion.target_promotion_date).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
    });
  }

  if (promotion.actual_promotion_date) {
    infoItems.push({
      icon: <CheckCircle size={18} />,
      label: 'Actual Date',
      value: new Date(promotion.actual_promotion_date).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
    });
  }

  if (promotion.days_pending !== null) {
    infoItems.push({
      icon: <Clock size={18} />,
      label: 'Days Pending',
      value: `${promotion.days_pending} days`,
    });
  }

  return (
    <div className="promotion-info">
      <h3 className="promotion-info-title">Promotion Information</h3>
      <div className="promotion-info-grid">
        {infoItems.map((item, index) => (
          <div key={index} className={`promotion-info-item ${item.highlight ? 'highlight' : ''}`}>
            <div className="promotion-info-icon">{item.icon}</div>
            <div className="promotion-info-content">
              <span className="promotion-info-label">{item.label}</span>
              <span className="promotion-info-value">{item.value}</span>
              {item.sub && <span className="promotion-info-sub">{item.sub}</span>}
            </div>
          </div>
        ))}
      </div>

      {promotion.justification && (
        <div className="promotion-info-section">
          <h4 className="promotion-info-section-title">Justification</h4>
          <p className="promotion-info-section-content">{promotion.justification}</p>
        </div>
      )}

      {promotion.supporting_evidence && (
        <div className="promotion-info-section">
          <h4 className="promotion-info-section-title">Supporting Evidence</h4>
          <p className="promotion-info-section-content">{promotion.supporting_evidence}</p>
        </div>
      )}

      {promotion.status_notes && (
        <div className="promotion-info-section">
          <h4 className="promotion-info-section-title">Status Notes</h4>
          <p className="promotion-info-section-content">{promotion.status_notes}</p>
        </div>
      )}

      {promotion.rejection_reason && (
        <div className="promotion-info-section rejection">
          <h4 className="promotion-info-section-title">Rejection Reason</h4>
          <p className="promotion-info-section-content">{promotion.rejection_reason}</p>
        </div>
      )}
    </div>
  );
};

export default PromotionInfo;