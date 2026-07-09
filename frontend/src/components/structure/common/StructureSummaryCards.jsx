import React from 'react';
import { FiTrendingUp, FiActivity, FiUsers, FiUserCheck, FiUserX, FiCheckCircle } from 'react-icons/fi';
import './common.css';

export const StructureSummaryCards = ({ items = [], loading = false }) => {
  if (loading) {
    return (
      <div className="structure-summary-cards loading">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="summary-card skeleton"></div>
        ))}
      </div>
    );
  }

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="structure-summary-cards">
      {items.map((item, index) => {
        let Icon = FiActivity;
        
        // Map common icons based on title or explicit icon prop
        if (item.icon) Icon = item.icon;
        else if (item.title.toLowerCase().includes('total')) Icon = FiActivity;
        else if (item.title.toLowerCase().includes('vacant')) Icon = FiUserX;
        else if (item.title.toLowerCase().includes('occupied')) Icon = FiUserCheck;
        else if (item.title.toLowerCase().includes('rate')) Icon = FiTrendingUp;

        return (
          <div key={index} className={`summary-card ${item.variant || 'default'}`}>
            <div className="summary-card-icon">
              <Icon size={24} />
            </div>
            <div className="summary-card-content">
              <h3 className="summary-card-title">{item.title}</h3>
              <div className="summary-card-value">
                {item.value !== undefined ? item.value : '-'}
                {item.suffix && <span className="summary-card-suffix">{item.suffix}</span>}
              </div>
              {item.description && (
                <p className="summary-card-description">{item.description}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StructureSummaryCards;
