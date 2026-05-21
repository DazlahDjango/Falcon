// frontend/src/pages/dashboard/ChampionDashboard/TemplateLibrary.jsx

import React, { useState } from 'react';
import { DashboardCard } from '../../../components/dashboard/common';

export const TemplateLibrary = ({ templates, loading, onRefresh, onCreateTemplate, onApplyTemplate }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    category: 'custom'
  });

  const handleCreateTemplate = () => {
    if (newTemplate.name) {
      onCreateTemplate?.(newTemplate);
      setShowCreateModal(false);
      setNewTemplate({ name: '', description: '', category: 'custom' });
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'sales': return '📈';
      case 'finance': return '💰';
      case 'hr': return '👥';
      case 'operations': return '⚙️';
      case 'marketing': return '📢';
      default: return '📋';
    }
  };

  return (
    <>
      <DashboardCard 
        title={`Template Library (${templates?.length || 0})`}
        loading={loading}
        onRefresh={onRefresh}
        action={
          <button className="create-template-btn" onClick={() => setShowCreateModal(true)}>
            + Create Template
          </button>
        }
      >
        <div className="templates-grid">
          {templates?.map(template => (
            <div key={template.id} className="template-card">
              <div className="template-icon">
                {getCategoryIcon(template.category)}
              </div>
              <div className="template-info">
                <div className="template-name">{template.name}</div>
                <div className="template-description">{template.description}</div>
                <div className="template-meta">
                  <span className="template-category">{template.category}</span>
                  <span className="template-usage">Used {template.usage_count || 0} times</span>
                </div>
              </div>
              <button 
                className="apply-template-btn"
                onClick={() => onApplyTemplate?.(template.id)}
              >
                Apply
              </button>
            </div>
          ))}
          
          {(!templates || templates.length === 0) && (
            <div className="empty-state">
              <p>No templates saved yet</p>
              <button onClick={() => setShowCreateModal(true)}>Create your first template</button>
            </div>
          )}
        </div>
      </DashboardCard>

      {/* Create Template Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Create New Template</h3>
            
            <div className="form-group">
              <label>Template Name:</label>
              <input
                type="text"
                value={newTemplate.name}
                onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                placeholder="e.g., Sales Dashboard Template"
              />
            </div>
            
            <div className="form-group">
              <label>Description:</label>
              <textarea
                value={newTemplate.description}
                onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                placeholder="Describe this template..."
                rows={3}
              />
            </div>
            
            <div className="form-group">
              <label>Category:</label>
              <select
                value={newTemplate.category}
                onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value })}
              >
                <option value="sales">Sales</option>
                <option value="finance">Finance</option>
                <option value="hr">Human Resources</option>
                <option value="operations">Operations</option>
                <option value="marketing">Marketing</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            
            <div className="modal-actions">
              <button onClick={() => setShowCreateModal(false)}>Cancel</button>
              <button onClick={handleCreateTemplate} disabled={!newTemplate.name}>
                Create Template
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TemplateLibrary;