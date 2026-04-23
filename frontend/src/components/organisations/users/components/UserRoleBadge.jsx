import React from 'react';

const UserRoleBadge = ({ role, size = 'sm', showLabel = true }) => {
  const roleConfig = {
    admin: {
      label: 'Admin',
      icon: '👑',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-800',
      description: 'Full access to all features and settings'
    },
    manager: {
      label: 'Manager',
      icon: '📊',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-800',
      description: 'Can manage teams, view reports, and approve KPIs'
    },
    staff: {
      label: 'Staff',
      icon: '👤',
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-800',
      description: 'Can view and update own KPIs'
    },
    viewer: {
      label: 'Viewer',
      icon: '👁️',
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
      description: 'Read-only access to dashboards and reports'
    },
    dashboard_champion: {
      label: 'Dashboard Champion',
      icon: '🏆',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800',
      description: 'Can manage organisation-wide KPIs and targets'
    },
  };

  const config = roleConfig[role] || roleConfig.staff;
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  return (
    <div className="inline-flex items-center space-x-1">
      <span className={`inline-flex items-center space-x-1 rounded-full font-medium ${sizeClasses[size]} ${config.bgColor} ${config.textColor}`}>
        <span>{config.icon}</span>
        {showLabel && <span>{config.label}</span>}
      </span>
    </div>
  );
};

export default UserRoleBadge;