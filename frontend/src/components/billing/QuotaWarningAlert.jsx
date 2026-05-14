import React from 'react';
import PropTypes from 'prop-types';
import { FiAlertTriangle, FiRefreshCw, FiX } from 'react-icons/fi';

const QuotaWarningAlert = ({ 
    quotaStatus, 
    onDismiss,
    onUpgrade,
    onRefresh,
    className = '',
}) => {
    const [dismissedWarnings, setDismissedWarnings] = useState([]);
    const getWarnings = () => {
        const warnings = [];
        const thresholds = { warning: 80, critical: 90, danger: 95 };
        if (!quotaStatus) return warnings;
        const checkQuota = (resource, current, max, label) => {
            if (!max || max === 0) return null;
            const percentage = (current / max) * 100;  
            if (percentage >= thresholds.danger) {
                return { level: 'danger', resource, current, max, percentage, label };
            }
            if (percentage >= thresholds.critical) {
                return { level: 'critical', resource, current, max, percentage, label };
            }
            if (percentage >= thresholds.warning) {
                return { level: 'warning', resource, current, max, percentage, label };
            }
            return null;
        };
        const userWarning = checkQuota('users', quotaStatus.users?.current, quotaStatus.users?.max, 'Users');
        if (userWarning) warnings.push(userWarning);
        const kpiWarning = checkQuota('kpis', quotaStatus.kpis?.current, quotaStatus.kpis?.max, 'KPIs');
        if (kpiWarning) warnings.push(kpiWarning);
        const storageWarning = checkQuota('storage', quotaStatus.storage?.current_mb, quotaStatus.storage?.max_mb, 'Storage');
        if (storageWarning) warnings.push(storageWarning);
        const apiWarning = checkQuota('api', quotaStatus.api_calls_today?.current, quotaStatus.api_calls_today?.max, 'API Calls');
        if (apiWarning) warnings.push(apiWarning);  
        return warnings;
    };
    const warnings = getWarnings();
    const activeWarnings = warnings.filter(w => !dismissedWarnings.includes(`${w.resource}_${Math.floor(w.percentage)}`));
    if (activeWarnings.length === 0) return null;
    const getLevelConfig = (level) => {
        switch (level) {
            case 'danger':
                return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', icon: 'text-red-500', button: 'bg-red-800 hover:bg-red-900' };
            case 'critical':
                return { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-800', icon: 'text-orange-500', button: 'bg-orange-800 hover:bg-orange-900' };
            default:
                return { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800', icon: 'text-yellow-500', button: 'bg-yellow-800 hover:bg-yellow-900' };
        }
    };
    
    return (
        <div className={`space-y-3 ${className}`}>
            {activeWarnings.map((warning, idx) => {
                const config = getLevelConfig(warning.level);              
                return (
                    <div 
                        key={`${warning.resource}_${idx}`}
                        className={`rounded-lg border p-4 ${config.bg} ${config.border}`}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                                <FiAlertTriangle className={`w-5 h-5 mt-0.5 ${config.icon}`} />
                                <div>
                                    <p className={`text-sm font-medium ${config.text}`}>
                                        {warning.label} Limit Alert
                                    </p>
                                    <p className="text-sm opacity-90 mt-1">
                                        You have used {Math.round(warning.percentage)}% of your {warning.label.toLowerCase()} limit 
                                        ({warning.current.toLocaleString()} / {warning.max.toLocaleString()}).
                                    </p>
                                    {warning.level === 'danger' && (
                                        <p className="text-sm font-medium mt-1">
                                            ⚠️ Action required: Please upgrade your plan to avoid service interruption.
                                        </p>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setDismissedWarnings([...dismissedWarnings, `${warning.resource}_${Math.floor(warning.percentage)}`]);
                                    onDismiss?.(warning.resource);
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <FiX className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={onRefresh}
                                className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
                            >
                                <FiRefreshCw className="w-4 h-4" />
                                Refresh
                            </button>
                            {warning.level !== 'warning' && (
                                <button
                                    onClick={onUpgrade}
                                    className={`text-sm text-white px-3 py-1 rounded-md ${config.button}`}
                                >
                                    Upgrade Plan
                                </button>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

QuotaWarningAlert.propTypes = {
    quotaStatus: PropTypes.shape({
        users: PropTypes.shape({ current: PropTypes.number, max: PropTypes.number }),
        kpis: PropTypes.shape({ current: PropTypes.number, max: PropTypes.number }),
        storage: PropTypes.shape({ current_mb: PropTypes.number, max_mb: PropTypes.number }),
        api_calls_today: PropTypes.shape({ current: PropTypes.number, max: PropTypes.number }),
    }),
    onDismiss: PropTypes.func,
    onUpgrade: PropTypes.func,
    onRefresh: PropTypes.func,
    className: PropTypes.string,
};
export default QuotaWarningAlert;