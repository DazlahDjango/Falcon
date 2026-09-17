import React from 'react';

export const PermissionBadge = ({ type, value, label, size = 'sm' }) => {
  const getColors = () => {
    const colors = {
      category: {
        kpi: { bg: '#dbeafe', text: '#2563eb' },
        review: { bg: '#fef3c7', text: '#d97706' },
        user: { bg: '#dcfce7', text: '#16a34a' },
        role: { bg: '#ede9fe', text: '#7c3aed' },
        tenant: { bg: '#fce4ec', text: '#db2777' },
        structure: { bg: '#e0e7ff', text: '#4f46e5' },
        report: { bg: '#e0f2fe', text: '#0284c7' },
        config: { bg: '#f3e8ff', text: '#9333ea' },
        billing: { bg: '#ccfbf1', text: '#0d9488' },
        workflow: { bg: '#ffedd5', text: '#ea580c' },
        admin: { bg: '#fee2e2', text: '#dc2626' },
        audit: { bg: '#fef3c7', text: '#d97706' },
        security: { bg: '#fce4ec', text: '#dc2626' },
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
