// frontend/src/components/reports/presets/PresetStatusBadge.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { FiStar, FiBookmark } from 'react-icons/fi';
import './presets.css';

export const PresetStatusBadge = ({ isDefault = false, showLabel = true }) => {
    return (
        <span className={`preset-status-badge ${isDefault ? 'default' : 'custom'}`}>
            {isDefault ? <FiStar size={11} /> : <FiBookmark size={11} />}
            {showLabel && <span>{isDefault ? 'Default' : 'Preset'}</span>}
        </span>
    );
};

PresetStatusBadge.propTypes = {
    isDefault: PropTypes.bool,
    showLabel: PropTypes.bool,
};

export default PresetStatusBadge;
