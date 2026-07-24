// frontend/src/components/reports/schedules/ScheduleUpcomingRuns.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FiClock } from 'react-icons/fi';
import { useSchedule } from '../../../hooks/reports';
import { ReportLoading } from '../common';
import './schedules.css';

export const ScheduleUpcomingRuns = ({ scheduleId }) => {
    const [runs, setRuns] = useState([]);
    const [loading, setLoading] = useState(false);

    const { fetchUpcomingRuns } = useSchedule(scheduleId, { autoFetch: false });

    useEffect(() => {
        if (scheduleId) {
            loadUpcomingRuns();
        }
    }, [scheduleId]);

    const loadUpcomingRuns = async () => {
        setLoading(true);
        try {
            const result = await fetchUpcomingRuns(scheduleId);
            setRuns(result || []);
        } catch (err) {
            console.error('Failed to load upcoming runs:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getRelativeTime = (date) => {
        if (!date) return '';
        const now = new Date();
        const target = new Date(date);
        const diff = target - now;
        if (diff < 0) return 'Overdue';
        if (diff < 60000) return 'In less than a minute';
        if (diff < 3600000) return `In ${Math.floor(diff / 60000)} minutes`;
        if (diff < 86400000) return `In ${Math.floor(diff / 3600000)} hours`;
        return `In ${Math.floor(diff / 86400000)} days`;
    };

    if (loading && !runs.length) {
        return <ReportLoading variant="spinner" text="Loading upcoming runs..." />;
    }

    if (!runs.length) {
        return (
            <div className="upcoming-runs-empty">
                <span className="empty-icon">📅</span>
                <p>No upcoming runs</p>
            </div>
        );
    }

    return (
        <div className="upcoming-runs-container">
            <h4>
                <FiClock size={14} />
                Upcoming Runs
            </h4>
            <div className="upcoming-runs-list">
                {runs.map((run, index) => (
                    <div key={index} className="upcoming-run-item">
                        <span className="run-date">{formatDate(run)}</span>
                        <span className="run-relative">{getRelativeTime(run)}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

ScheduleUpcomingRuns.propTypes = {
    scheduleId: PropTypes.string.isRequired,
};