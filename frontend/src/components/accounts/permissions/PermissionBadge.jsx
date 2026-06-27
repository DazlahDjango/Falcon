import React from 'react';

export const PermissionBadge = ({ type, value, label, size = 'sm' }) => {
  const getColors = () => {
    const colors = {
      category: {
        kpi: { bg: '#dbeafe', text: '#2563eb' },
        user: { bg: '#dcfce7', text: '#16a34a' },
        role: { bg: '#ede9fe', text: '#7c3aed' },
        audit: { bg: '#fef3c7', text: '#d97706' },
        security: { bg: '#fce4ec', text: '#dc2626' },
        billing: { bg: '#e0f7fa', text: '#0891b2' },
        settings: { bg: '#f3e8ff', text: '#9333ea' },
        default: { bg: '#f1f5f9', text: '#475569' },
      },
      level: {
        global: { bg: '#ede9fe', text: '#7c3aed' },
        tenant: { bg: '#dbeafe', text: '#2563eb' },
        department: { bg: '#dcfce7', text: '#16a34a' },
        team: { bg: '#fef3c7', text: '#d97706' },
        self: { bg: '#fce4ec', text: '#dc2626' },
        default: { bg: '#f1f5f9', text: '#475569' },
      },
    };

    if (type === 'category') {
      return colors.category[value] || colors.category.default;
    }
    if (type === 'level') {
      return colors.level[value] || colors.level.default;
    }
    return colors.category.default;
  };

  const colors = getColors();

  return (
    <span
      className={`permission-badge ${type} ${size}`}
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
      }}
    >
      {label || value}
    </span>
  );
};

export default PermissionBadge;
