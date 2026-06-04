import React from 'react';

const UserRoleBadge = ({ role }) => {
    const getRoleConfig = () => {
        const configs = {
            super_admin: { class: 'role-super-admin', label: 'Super Admin', icon: '👑' },
            client_admin: { class: 'role-client-admin', label: 'Organization Admin', icon: '🏢' },
            executive: { class: 'role-executive', label: 'Executive', icon: '⭐' },
            supervisor: { class: 'role-supervisor', label: 'Supervisor', icon: '👥' },
            dashboard_champion: { class: 'role-dashboard-champion', label: 'Dashboard Champion', icon: '📊' },
            staff: { class: 'role-staff', label: 'Staff', icon: '👤' },
            read_only: { class: 'role-read-only', label: 'Read Only', icon: '👁️' },
        };
        return configs[role] || { class: 'role-staff', label: role, icon: '👤' };
    };

    const config = getRoleConfig();

    return (
        <span className={`role-badge ${config.class}`}>
            <span className="role-icon">{config.icon}</span>
            <span className="role-label">{config.label}</span>
        </span>
    );
};

export default UserRoleBadge;