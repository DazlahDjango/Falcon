// frontend/src/components/reports/filters/FilterTypes.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { FiCalendar, FiList, FiCheckSquare, FiType, FiHash, FiToggleLeft, FiGitBranch, FiSettings } from 'react-icons/fi';
import './filters.css';

export const FilterTypes = ({ selected, onSelect, className = '' }) => {
    const types = [
        { value: 'date_range', label: 'Date Range', icon: <FiCalendar size={18} /> },
        { value: 'dropdown', label: 'Dropdown', icon: <FiList size={18} /> },
        { value: 'multi_select', label: 'Multi-Select', icon: <FiCheckSquare size={18} /> },
        { value: 'text', label: 'Text', icon: <FiType size={18} /> },
        { value: 'number', label: 'Number', icon: <FiHash size={18} /> },
        { value: 'boolean', label: 'Boolean', icon: <FiToggleLeft size={18} /> },
        { value: 'hierarchy', label: 'Hierarchical', icon: <FiGitBranch size={18} /> },
        { value: 'custom', label: 'Custom', icon: <FiSettings size={18} /> },
    ];

    return (
        <div className={`filter-types ${className}`}>
            {types.map((type) => (
                <button
                    key={type.value}
                    className={`filter-type-item ${selected === type.value ? 'active' : ''}`}
                    onClick={() => onSelect?.(type.value)}
                >
                    <span className="type-icon">{type.icon}</span>
                    <span className="type-label">{type.label}</span>
                </button>
            ))}
        </div>
    );
};

FilterTypes.propTypes = {
    selected: PropTypes.string,
    onSelect: PropTypes.func,
    className: PropTypes.string,
};