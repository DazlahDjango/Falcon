import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit, FiUsers, FiFileText, FiSettings, FiBell } from 'react-icons/fi';

const QuickActions = ({ userRole = 'staff' }) => {
    const navigate = useNavigate();
    
    const getActions = () => {
        const baseActions = [
            { icon: <FiPlus />, label: 'Update KPIs', path: '/kpi/update', roles: ['staff', 'supervisor'] },
            { icon: <FiFileText />, label: 'Mission Report', path: '/missions/create', roles: ['staff'] },
            { icon: <FiEdit />, label: 'Submit Review', path: '/reviews/submit', roles: ['staff'] },
        ];
        
        const supervisorActions = [
            { icon: <FiUsers />, label: 'View Team', path: '/team', roles: ['supervisor', 'executive', 'client_admin'] },
            { icon: <FiCheckCircle />, label: 'Pending Approvals', path: '/approvals', roles: ['supervisor', 'executive', 'client_admin'] },
        ];
        
        const adminActions = [
            { icon: <FiSettings />, label: 'Settings', path: '/settings', roles: ['client_admin', 'super_admin'] },
            { icon: <FiUsers />, label: 'Invite Users', path: '/users/invite', roles: ['client_admin', 'super_admin'] },
        ];
        
        let actions = [...baseActions];
        
        if (userRole === 'supervisor' || userRole === 'executive' || userRole === 'client_admin') {
            actions = [...actions, ...supervisorActions];
        }
        
        if (userRole === 'client_admin' || userRole === 'super_admin') {
            actions = [...actions, ...adminActions];
        }
        
        return actions;
    };
    
    const actions = getActions();
    
    return (
        <div className="quick-actions">
            <h3 className="actions-title">Quick Actions</h3>
            <div className="actions-grid">
                {actions.map((action, index) => (
                    <button
                        key={index}
                        className="action-btn"
                        onClick={() => navigate(action.path)}
                    >
                        <span className="action-icon">{action.icon}</span>
                        <span className="action-label">{action.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default QuickActions;