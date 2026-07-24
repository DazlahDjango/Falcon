// frontend/src/components/reports/schedules/ScheduleActions.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { FiPlay, FiPause, FiEdit2, FiTrash2, FiPlayCircle } from 'react-icons/fi';
import './schedules.css';

export const ScheduleActions = ({
    schedule,
    onAction,
    onEdit,
    onDelete,
}) => {
    const { id, is_active, is_paused, status } = schedule || {};

    const handleAction = (action) => {
        onAction?.(action);
    };

    const isRunning = status === 'running';

    return (
        <div className="schedule-actions">
            {is_active && !is_paused && (
                <button
                    className="btn btn-secondary"
                    onClick={() => handleAction('pause')}
                    disabled={isRunning}
                    title={isRunning ? 'Cannot pause while running' : 'Pause Schedule'}
                >
                    <FiPause size={16} />
                    Pause
                </button>
            )}
            {is_active && is_paused && (
                <button
                    className="btn btn-secondary"
                    onClick={() => handleAction('resume')}
                    title="Resume Schedule"
                >
                    <FiPlay size={16} />
                    Resume
                </button>
            )}
            <button
                className="btn btn-secondary"
                onClick={() => handleAction('run_now')}
                disabled={!is_active || is_paused || isRunning}
                title={!is_active ? 'Schedule is inactive' : is_paused ? 'Schedule is paused' : 'Run Now'}
            >
                <FiPlayCircle size={16} />
                Run Now
            </button>
            <button
                className="btn btn-secondary"
                onClick={onEdit}
                title="Edit Schedule"
            >
                <FiEdit2 size={16} />
                Edit
            </button>
            <button
                className="btn btn-danger"
                onClick={onDelete}
                title="Delete Schedule"
            >
                <FiTrash2 size={16} />
                Delete
            </button>
        </div>
    );
};

ScheduleActions.propTypes = {
    schedule: PropTypes.shape({
        id: PropTypes.string,
        is_active: PropTypes.bool,
        is_paused: PropTypes.bool,
        status: PropTypes.string,
    }).isRequired,
    onAction: PropTypes.func,
    onEdit: PropTypes.func,
    onDelete: PropTypes.func,
};