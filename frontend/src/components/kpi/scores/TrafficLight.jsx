import React from 'react';
import { FiAlertCircle, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';
import TrafficLightIcon from './TrafficLightIcon';

const TrafficLight = ({ status, score, message, size = 'md' }) => {
    const getStatusConfig = () => {
        const configs = {
            GREEN: {
                icon: <FiCheckCircle size={size === 'lg' ? 24 : 16} />,
                title: 'On Track',
                description: 'Performance meets or exceeds expectations',
                bgColor: 'var(--kpi-success-bg)',
                borderColor: 'var(--kpi-success)'
            },
            YELLOW: {
                icon: <FiAlertTriangle size={size === 'lg' ? 24 : 16} />,
                title: 'At Risk',
                description: 'Performance requires attention',
                bgColor: 'var(--kpi-warning-bg)',
                borderColor: 'var(--kpi-warning)'
            },
            RED: {
                icon: <FiAlertCircle size={size === 'lg' ? 24 : 16} />,
                title: 'Off Track',
                description: 'Performance needs immediate action',
                bgColor: 'var(--kpi-danger-bg)',
                borderColor: 'var(--kpi-danger)'
            }
        };
        return configs[status] || configs.GREEN;
    };

    const config = getStatusConfig();

    return (
        <div 
            className={`kpi-traffic-light kpi-traffic-light-${size}`}
            style={{ background: config.bgColor, borderColor: config.borderColor }}
        >
            <div className="kpi-traffic-light-icon">
                <TrafficLightIcon status={status} size={size} />
            </div>
            <div className="kpi-traffic-light-content">
                <div className="kpi-traffic-light-title">{config.title}</div>
                {score !== undefined && (
                    <div className="kpi-traffic-light-score">{score}%</div>
                )}
                {message && (
                    <div className="kpi-traffic-light-message">{message}</div>
                )}
                {config.description && (
                    <div className="kpi-traffic-light-description">{config.description}</div>
                )}
            </div>
        </div>
    );
};

export default TrafficLight;