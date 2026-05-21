// frontend/src/pages/dashboard/ReadOnlyDashboard/ViewSelector.jsx

import React from 'react';

export const ViewSelector = ({ currentView, onViewChange, loading }) => {
  const views = [
    {
      id: 'executive',
      name: 'Executive View',
      icon: '👔',
      description: 'Organization-wide performance metrics',
      color: '#3b82f6'
    },
    {
      id: 'manager',
      name: 'Manager View',
      icon: '👥',
      description: 'Team performance and member details',
      color: '#10b981'
    },
    {
      id: 'staff',
      name: 'Staff View',
      icon: '👤',
      description: 'Personal KPIs and mission status',
      color: '#f59e0b'
    }
  ];

  return (
    <div className="view-selector">
      <h3>Select Dashboard View</h3>
      <div className="view-cards">
        {views.map(view => (
          <div 
            key={view.id}
            className={`view-card ${currentView === view.id ? 'active' : ''}`}
            onClick={() => !loading && onViewChange(view.id)}
          >
            <div className="view-icon" style={{ backgroundColor: `${view.color}20`, color: view.color }}>
              {view.icon}
            </div>
            <div className="view-info">
              <div className="view-name">{view.name}</div>
              <div className="view-description">{view.description}</div>
            </div>
            {currentView === view.id && (
              <div className="view-check">✓</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ViewSelector;