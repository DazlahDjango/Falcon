// frontend/src/components/reports/filters/FilterTable.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { FiEye, FiEdit2, FiTrash2, FiCopy, FiStar, FiCheck } from 'react-icons/fi';
import { HiOutlineGlobeAlt, HiOutlineUser } from 'react-icons/hi';
import { FilterStatusBadge } from './FilterStatusBadge';
import './filters.css';

export const FilterTable = ({
    filters = [],
    onView,
    onEdit,
    onDelete,
    onSetDefault,
    onDuplicate,
    onApply,
}) => {
    const getFilterTypeLabel = (type) => {
        const labels = {
            date_range: 'Date Range',
            dropdown: 'Dropdown',
            multi_select: 'Multi-Select',
            text: 'Text',
            number: 'Number',
            boolean: 'Boolean',
            hierarchy: 'Hierarchical',
            custom: 'Custom',
        };
        return labels[type] || type;
    };

    const getFilterTypeIcon = (type) => {
        const icons = {
            date_range: '📅',
            dropdown: '▼',
            multi_select: '☑',
            text: '📝',
            number: '#',
            boolean: '◯',
            hierarchy: '🏛',
            custom: '⚙',
        };
        return icons[type] || '📄';
    };

    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <div className="filter-table-container">
            <table className="filter-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Scope</th>
                        <th>Default</th>
                        <th>Created</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filters.map((filter) => (
                        <tr key={filter.id}>
                            <td>
                                <div className="filter-name-cell">
                                    <span className="filter-type-icon">{getFilterTypeIcon(filter.filter_type)}</span>
                                    <span className="filter-name">{filter.name}</span>
                                    {filter.display_label && (
                                        <span className="filter-label">({filter.display_label})</span>
                                    )}
                                </div>
                            </td>
                            <td>{getFilterTypeLabel(filter.filter_type)}</td>
                            <td>
                                {filter.is_global ? (
                                    <span className="scope-badge global">
                                        <HiOutlineGlobeAlt size={14} />
                                        Global
                                    </span>
                                ) : (
                                    <span className="scope-badge personal">
                                        <HiOutlineUser size={14} />
                                        Personal
                                    </span>
                                )}
                            </td>
                            <td>
                                {filter.is_default ? (
                                    <span className="default-badge">
                                        <FiStar size={14} />
                                        Default
                                    </span>
                                ) : (
                                    <span className="default-badge not-default">-</span>
                                )}
                            </td>
                            <td>{formatDate(filter.created_at)}</td>
                            <td>
                                <div className="action-buttons">
                                    <button
                                        className="action-btn view"
                                        onClick={() => onView?.(filter.id)}
                                        title="View Filter"
                                    >
                                        <FiEye size={16} />
                                    </button>
                                    <button
                                        className="action-btn edit"
                                        onClick={() => onEdit?.(filter.id)}
                                        title="Edit Filter"
                                    >
                                        <FiEdit2 size={16} />
                                    </button>
                                    <button
                                        className="action-btn apply"
                                        onClick={() => onApply?.(filter.id)}
                                        title="Apply Filter"
                                    >
                                        <FiCheck size={16} />
                                    </button>
                                    <button
                                        className="action-btn duplicate"
                                        onClick={() => onDuplicate?.(filter.id)}
                                        title="Duplicate Filter"
                                    >
                                        <FiCopy size={16} />
                                    </button>
                                    {!filter.is_default && (
                                        <button
                                            className="action-btn set-default"
                                            onClick={() => onSetDefault?.(filter.id)}
                                            title="Set as Default"
                                        >
                                            <FiStar size={16} />
                                        </button>
                                    )}
                                    <button
                                        className="action-btn delete"
                                        onClick={() => onDelete?.(filter)}
                                        title="Delete Filter"
                                    >
                                        <FiTrash2 size={16} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

FilterTable.propTypes = {
    filters: PropTypes.array,
    onView: PropTypes.func,
    onEdit: PropTypes.func,
    onDelete: PropTypes.func,
    onSetDefault: PropTypes.func,
    onDuplicate: PropTypes.func,
    onApply: PropTypes.func,
};