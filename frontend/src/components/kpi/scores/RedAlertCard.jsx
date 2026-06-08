import React from 'react';
import { FiAlertCircle, FiUser, FiCalendar, FiTrendingDown } from 'react-icons/fi';
import TrafficLightIcon from './TrafficLightIcon';

const RedAlertCard = ({ alert, onClick }) => {
    return (
        <div className="kpi-red-alert-card" onClick={() => onClick?.(alert)}>
            <div className="kpi-red-alert-card-header">
                <div className="kpi-red-alert-card-icon">
                    <FiAlertCircle size={24} color="var(--kpi-danger)" />
                </div>
                <TrafficLightIcon status="RED" size="md" />
            </div>
            
            <div className="kpi-red-alert-card-content">
                <div className="kpi-red-alert-card-title">{alert.kpi || alert.kpi_name}</div>
                <div className="kpi-red-alert-card-details">
                    <div className="kpi-red-alert-detail">
                        <FiUser size={12} />
                        <span>{alert.user || alert.user_email?.split('@')[0]}</span>
                    </div>
                    <div className="kpi-red-alert-detail">
                        <FiCalendar size={12} />
                        <span>{alert.period || `${alert.year}-${String(alert.month).padStart(2, '0')}`}</span>
                    </div>
                    <div className="kpi-red-alert-detail">
                        <FiTrendingDown size={12} />
                        <span>{alert.consecutive_months || alert.consecutive_red_count} months</span>
                    </div>
                </div>
                <div className="kpi-red-alert-card-score">
                    Score: {alert.score || alert.score_value}%
                </div>
            </div>
        </div>
    );
};

export default RedAlertCard;