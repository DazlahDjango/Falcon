import React from 'react';
import PropTypes from 'prop-types';

const QuotaUsageBar = ({ 
    used, 
    total, 
    label, 
    unit = '',
    showDetails = true,
    warningThreshold = 80,
    criticalThreshold = 90,
    dangerThreshold = 95,
}) => {
    const percentage = total > 0 ? Math.min(100, (used / total) * 100) : 0;
    const remaining = total - used;
    const getBarColor = () => {
        if (percentage >= dangerThreshold) return 'bg-red-500';
        if (percentage >= criticalThreshold) return 'bg-orange-500';
        if (percentage >= warningThreshold) return 'bg-yellow-500';
        return 'bg-green-500';
    };
    const getWarningText = () => {
        if (percentage >= dangerThreshold) return 'Critical - Action required';
        if (percentage >= criticalThreshold) return 'Very high usage';
        if (percentage >= warningThreshold) return 'High usage';
        return 'Normal usage';
    };

    return (
        <div className="w-full">
            {label && (
                <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">{label}</span>
                    {showDetails && (
                        <span className="text-sm text-gray-500">
                            {used.toLocaleString()} / {total.toLocaleString()} {unit}
                        </span>
                    )}
                </div>
            )}
            <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                    className={`absolute left-0 top-0 h-full rounded-full transition-all duration-300 ${getBarColor()}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>          
            {showDetails && (
                <div className="flex justify-between items-center mt-1">
                    <span className={`text-xs ${percentage >= warningThreshold ? 'text-yellow-600' : 'text-gray-500'}`}>
                        {getWarningText()}
                    </span>
                    <span className="text-xs text-gray-500">
                        {remaining.toLocaleString()} {unit} remaining
                    </span>
                </div>
            )}
        </div>
    );
};
QuotaUsageBar.propTypes = {
    used: PropTypes.number.isRequired,
    total: PropTypes.number.isRequired,
    label: PropTypes.string,
    unit: PropTypes.string,
    showDetails: PropTypes.bool,
    warningThreshold: PropTypes.number,
    criticalThreshold: PropTypes.number,
    dangerThreshold: PropTypes.number,
};
export default QuotaUsageBar;