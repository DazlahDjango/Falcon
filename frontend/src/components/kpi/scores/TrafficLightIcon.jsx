import React from 'react';
import { FiCheckCircle, FiAlertTriangle, FiAlertCircle } from 'react-icons/fi';

const TrafficLightIcon = ({ status, size = 'md', showLabel = false }) => {
    const getIcon = () => {
        const sizeMap = { sm: 12, md: 16, lg: 24, xl: 32 };
        const iconSize = sizeMap[size] || 16;
        
        switch (status?.toUpperCase()) {
            case 'GREEN':
                return <FiCheckCircle size={iconSize} style={{ color: 'var(--kpi-success)' }} />;
            case 'YELLOW':
                return <FiAlertTriangle size={iconSize} style={{ color: 'var(--kpi-warning)' }} />;
            case 'RED':
                return <FiAlertCircle size={iconSize} style={{ color: 'var(--kpi-danger)' }} />;
            default:
                return <FiCheckCircle size={iconSize} style={{ color: 'var(--kpi-gray-400)' }} />;
        }
    };

    const getLabel = () => {
        switch (status?.toUpperCase()) {
            case 'GREEN': return 'On Track';
            case 'YELLOW': return 'At Risk';
            case 'RED': return 'Off Track';
            default: return 'Unknown';
        }
    };

    if (showLabel) {
        return (
            <div className="kpi-traffic-light-icon-with-label">
                {getIcon()}
                <span className="kpi-traffic-light-label">{getLabel()}</span>
            </div>
        );
    }

    return getIcon();
};

export default TrafficLightIcon;