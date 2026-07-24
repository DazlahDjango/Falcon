// frontend/src/components/reports/shares/SharePermissions.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { FiEye, FiMessageSquare, FiEdit2, FiDownload, FiCheck } from 'react-icons/fi';
import './shares.css';

export const SharePermissions = ({
    selected = 'view',
    onSelect,
    permission,
    showLabel = true,
    size = 'medium',
    className = '',
}) => {
    const permissions = [
        { value: 'view', label: 'View Only', icon: FiEye, description: 'Can view the report' },
        { value: 'comment', label: 'View & Comment', icon: FiMessageSquare, description: 'Can view and add comments' },
        { value: 'edit', label: 'View, Comment & Edit', icon: FiEdit2, description: 'Can view, comment and edit' },
        { value: 'export', label: 'Full Access', icon: FiDownload, description: 'Can view, comment, edit and export' },
    ];

    const currentPermission = permission || selected;

    const getSizeClass = () => {
        const sizes = {
            small: 'perm-small',
            medium: 'perm-medium',
            large: 'perm-large',
        };
        return sizes[size] || 'perm-medium';
    };

    if (onSelect) {
        return (
            <div className={`share-permissions-select ${getSizeClass()} ${className}`}>
                {permissions.map((perm) => {
                    const Icon = perm.icon;
                    const isSelected = currentPermission === perm.value;
                    return (
                        <button
                            key={perm.value}
                            className={`perm-option ${isSelected ? 'selected' : ''}`}
                            onClick={() => onSelect(perm.value)}
                            title={perm.description}
                        >
                            <Icon size={size === 'small' ? 14 : 18} />
                            {showLabel && <span className="perm-label">{perm.label}</span>}
                            {isSelected && <FiCheck size={14} className="perm-check" />}
                        </button>
                    );
                })}
            </div>
        );
    }

    const perm = permissions.find((p) => p.value === currentPermission);
    const Icon = perm?.icon;

    return (
        <div className={`share-permissions-display ${getSizeClass()} ${className}`}>
            {Icon && <Icon size={size === 'small' ? 14 : 18} />}
            {showLabel && <span className="perm-label">{perm?.label || currentPermission}</span>}
        </div>
    );
};

SharePermissions.propTypes = {
    selected: PropTypes.string,
    onSelect: PropTypes.func,
    permission: PropTypes.string,
    showLabel: PropTypes.bool,
    size: PropTypes.oneOf(['small', 'medium', 'large']),
    className: PropTypes.string,
};