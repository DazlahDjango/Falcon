import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FiX, FiAlertCircle, FiCheckCircle, FiInfo, FiAlertTriangle } from 'react-icons/fi';
import { removeAlert } from '../../../store/slices/uiSlice';

const Alert = () => {
    const dispatch = useDispatch();
    const alerts = useSelector((state) => state.ui.alerts);
    useEffect(() => {
        alerts.forEach((alert) => {
            if (alert.timeout) {
                const timer = setTimeout(() => {
                    dispatch(removeAlert(alert.id));
                }, alert.timeout);
                return () => clearTimeout(timer);
            }
        });
    }, [alerts, dispatch]);
    const getIcon = (type) => {
        switch (type) {
            case 'success':
                return <FiCheckCircle size={20} />;
            case 'error':
                return <FiAlertCircle size={20} />;
            case 'warning':
                return <FiAlertTriangle size={20} />;
            case 'info':
            default:
                return <FiInfo size={20} />;
        }
    };
    const getClassName = (type) => {
        switch (type) {
            case 'success': return 'alert-success';
            case 'error': return 'alert-error';
            case 'warning': return 'alert-warning';
            case 'info':
            default: return 'alert-info';
        }
    };
    if (alerts.length === 0) return null;
    return (
        <div className="alert-container">
            {alerts.map((alert) => (
                <div
                    key={alert.id}
                    className={`alert ${getClassName(alert.type)}`}
                    role="alert"
                >
                    <div className="alert-icon">{getIcon(alert.type)}</div>
                    <div className="alert-content">
                        <div className="alert-message">{alert.message}</div>
                        {alert.description && (
                            <div className="alert-description">{alert.description}</div>
                        )}
                    </div>
                    <button
                        className="alert-close"
                        onClick={() => dispatch(removeAlert(alert.id))}
                        aria-label="Close"
                    >
                        <FiX size={16} />
                    </button>
                </div>
            ))}
        </div>
    );
};
export { Alert };