import React from 'react';
import { FiPlus, FiUpload, FiFileText, FiSettings, FiBarChart2, FiTrendingUp } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const QuickActions = () => {
    const navigate = useNavigate();

    const actions = [
        {
            label: 'Create Framework',
            icon: FiPlus,
            color: '#667eea',
            onClick: () => navigate('/kpi/management', { state: { tab: 'frameworks', action: 'create' } }),
        },
        {
            label: 'Create Category',
            icon: FiPlus,
            color: '#10b981',
            onClick: () => navigate('/kpi/management', { state: { tab: 'categories', action: 'create' } }),
        },
        {
            label: 'Create Template',
            icon: FiFileText,
            color: '#f59e0b',
            onClick: () => navigate('/kpi/management', { state: { tab: 'templates', action: 'create' } }),
        },
        {
            label: 'Bulk Import',
            icon: FiUpload,
            color: '#8b5cf6',
            onClick: () => navigate('/kpi/management/import'),
        },
        {
            label: 'Generate Report',
            icon: FiBarChart2,
            color: '#ef4444',
            onClick: () => navigate('/kpi/reports'),
        },
        {
            label: 'System Settings',
            icon: FiSettings,
            color: '#6b7280',
            onClick: () => navigate('/settings/kpi'),
        },
    ];

    return (
        <div className="stat-section">
            <div className="section-header">
                <h3 className="section-title">
                    <FiTrendingUp size={18} />
                    Quick Actions
                </h3>
            </div>

            <div className="quick-actions-grid">
                {actions.map((action, index) => (
                    <button
                        key={index}
                        className="quick-action-btn"
                        onClick={action.onClick}
                        style={{ borderColor: `${action.color}30`, color: action.color }}
                    >
                        <action.icon size={18} />
                        <span>{action.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default QuickActions;