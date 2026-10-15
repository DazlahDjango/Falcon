// frontend/src/components/reports/distributions/DistributionStatusBadge.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { FiCheckCircle, FiXCircle } from 'react-icons/fi';
import './distributions.css';

export const DistributionStatusBadge = ({ isActive = true, showLabel = true }) => {
    return (
        <span className={`distribution-status-badge ${isActive ? 'active' : 'inactive'}`}>
            {isActive ? <FiCheckCircle size={12} /> : <FiXCircle size={12} />}
            {showLabel && <span>{isActive ? 'Active' : 'Inactive'}</span>}
        </span>
    );
};

DistributionStatusBadge.propTypes = {
    isActive: PropTypes.bool,
    showLabel: PropTypes.bool,
};

export default DistributionStatusBadge;
