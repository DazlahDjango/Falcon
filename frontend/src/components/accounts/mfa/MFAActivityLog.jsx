import React, { useState, useEffect } from 'react';
import { useMFA } from '../../../hooks/accounts/useMfa';
import { formatDistanceToNow, format } from 'date-fns';
import { FiCheckCircle, FiXCircle, FiLogIn, FiSettings, FiAlertCircle, FiClock } from 'react-icons/fi';
import Spinner from '../../common/UI/Spinner';

const getEventIcon = (eventType, success) => {
    if (!success) return <FiXCircle className="icon-error" />;

    switch (eventType) {
        case 'success':
            return <FiCheckCircle className="icon-success" />;
        case 'enroll':
            return <FiSettings className="icon-info" />;
        case 'attempt':
            return <FiLogIn className="icon-info" />;
        default:
            return <FiAlertCircle className="icon-warning" />;
    }
};

const MFAActivityLog = () => {
    const { activity, loadActivity, activityLoading } = useMFA();
    const [hours, setHours] = useState(24);

    useEffect(() => {
        loadActivity(hours);
    }, [loadActivity, hours]);

    const getEventText = (log) => {
        if (log.event_type === 'success') return 'MFA verification successful';
        if (log.event_type === 'failure') return 'Failed MFA attempt';
        if (log.event_type === 'enroll') return 'MFA device enrolled';
        if (log.event_type === 'disable') return 'MFA disabled';
        return log.message || log.event_type;
    };

    if (activityLoading) {
        return (
            <div className="mfa-activity-loading">
                <Spinner size="md" />
                <p>Loading activity...</p>
            </div>
        );
    }

    return (
        <div className="mfa-activity-log">
            <div className="activity-header">
                <h3>Recent Activity</h3>
                <select value={hours} onChange={(e) => setHours(Number(e.target.value))}>
                    <option value={24}>Last 24 hours</option>
                    <option value={168}>Last 7 days</option>
                    <option value={720}>Last 30 days</option>
                </select>
            </div>

            {!activity?.activity || activity.activity.length === 0 ? (
                <div className="activity-empty">
                    <p>No MFA activity found</p>
                </div>
            ) : (
                <div className="activity-list">
                    {activity.activity.map((log, index) => (
                        <div key={index} className="activity-item">
                            <div className="activity-icon">
                                {getEventIcon(log.event_type, log.success)}
                            </div>
                            <div className="activity-details">
                                <div className="activity-message">
                                    {getEventText(log)}
                                </div>
                                <div className="activity-meta">
                                    <span className="activity-ip">{log.ip_address || 'Unknown'}</span>
                                    <span className="activity-time">
                                        {format(new Date(log.created_at), 'MMM d, h:mm a')}
                                        {' • '}
                                        {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                                    </span>
                                </div>
                                {log.device_name && (
                                    <div className="activity-device">
                                        Device: {log.device_name}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MFAActivityLog;