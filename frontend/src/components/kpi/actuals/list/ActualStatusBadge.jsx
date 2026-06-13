import React from 'react';
import { FiClock, FiCheckCircle, FiXCircle, FiEdit } from 'react-icons/fi';

const ActualStatusBadge = ({ status }) => {
    const getStatusConfig = () => {
        switch (status?.toUpperCase()) {
            case 'PENDING':
                return { 
                    icon: <FiClock size={12} />, 
                    text: 'Pending', 
                    className: 'pending',
                    color: 'var(--kpi-warning)'
                };
            case 'APPROVED':
                return { 
                    icon: <FiCheckCircle size={12} />, 
                    text: 'Approved', 
                    className: 'approved',
                    color: 'var(--kpi-success)'
                };
            case 'REJECTED':
                return { 
                    icon: <FiXCircle size={12} />, 
                    text: 'Rejected', 
                    className: 'rejected',
                    color: 'var(--kpi-danger)'
                };
            case 'ADJUSTED':
                return { 
                    icon: <FiEdit size={12} />, 
                    text: 'Adjusted', 
                    className: 'adjusted',
                    color: 'var(--kpi-info)'
                };
            default:
                return { 
                    icon: null, 
                    text: status || 'Unknown', 
                    className: 'unknown',
                    color: 'var(--kpi-gray-500)'
                };
        }
    };

    const config = getStatusConfig();

    return (
        <span className={`kpi-actual-status-badge ${config.className}`}>
            {config.icon}
            {config.text}
        </span>
    );
};

export default ActualStatusBadge;