import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

const QuotaGauge = ({ 
    used, 
    total, 
    label, 
    unit = '', 
    showPercentage = true,
    size = 'md',
    color = '#3B82F6'
}) => {
    const [animatedPercentage, setAnimatedPercentage] = useState(0);
    
    const percentage = total > 0 ? Math.min(100, (used / total) * 100) : 0;
    
    // Determine color based on percentage if not custom color provided
    const getColor = () => {
        if (color !== '#3B82F6') return color;
        if (percentage >= 95) return '#EF4444';      // Danger - Red
        if (percentage >= 90) return '#F59E0B';      // Critical - Orange
        if (percentage >= 80) return '#EAB308';      // Warning - Yellow
        if (percentage >= 60) return '#10B981';      // Good - Green
        return '#3B82F6';                            // Normal - Blue
    };
    
    const gaugeColor = getColor();
    const sizes = {
        sm: { 
            width: 100, 
            height: 100, 
            radius: 40, 
            strokeWidth: 8, 
            fontSize: 'text-xl',
            centerY: 'center'
        },
        md: { 
            width: 140, 
            height: 140, 
            radius: 55, 
            strokeWidth: 10, 
            fontSize: 'text-2xl',
            centerY: 'center'
        },
        lg: { 
            width: 180, 
            height: 180, 
            radius: 75, 
            strokeWidth: 12, 
            fontSize: 'text-3xl',
            centerY: 'center'
        },
    };
    const config = sizes[size] || sizes.md;
    const circumference = 2 * Math.PI * config.radius;
    const strokeDashoffset = circumference - (animatedPercentage / 100) * circumference;
    useEffect(() => {
        const timer = setTimeout(() => {
            setAnimatedPercentage(percentage);
        }, 100);
        return () => clearTimeout(timer);
    }, [percentage]);
    
    return (
        <div className="flex flex-col items-center">
            <div className="relative" style={{ width: config.width, height: config.height }}>
                <svg 
                    width={config.width} 
                    height={config.height} 
                    viewBox={`0 0 ${config.width} ${config.height}`}
                    className="quota-gauge"
                >
                    {/* Background circle */}
                    <circle
                        cx={config.width / 2}
                        cy={config.height / 2}
                        r={config.radius}
                        fill="none"
                        stroke="#E5E7EB"
                        strokeWidth={config.strokeWidth}
                        strokeLinecap="round"
                    />
                    {/* Foreground circle (progress) - animated */}
                    <circle
                        cx={config.width / 2}
                        cy={config.height / 2}
                        r={config.radius}
                        fill="none"
                        stroke={gaugeColor}
                        strokeWidth={config.strokeWidth}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        transform={`rotate(-90 ${config.width / 2} ${config.height / 2})`}
                        className="quota-gauge-circle"
                        style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
                    />
                </svg>
                
                {/* Center text */}
                <div className={`absolute inset-0 flex flex-col items-center justify-center ${config.fontSize} font-bold quota-gauge-text`} style={{ color: gaugeColor }}>
                    {showPercentage ? (
                        <>
                            <span>{Math.round(animatedPercentage)}%</span>
                            {unit && <span className="text-xs text-gray-400 font-normal">{unit}</span>}
                        </>
                    ) : (
                        <>
                            <span>{used.toLocaleString()}</span>
                            <span className="text-xs text-gray-400 font-normal">/{total.toLocaleString()}</span>
                        </>
                    )}
                </div>
            </div>
            
            {/* Label */}
            {label && (
                <p className="mt-2 text-xs font-medium text-gray-600">{label}</p>
            )}
            
            {/* Optional usage text for small screens */}
            <p className="text-xs text-gray-400 mt-1 md:hidden">
                {used.toLocaleString()} / {total.toLocaleString()}
            </p>
        </div>
    );
};
QuotaGauge.propTypes = {
    used: PropTypes.number.isRequired,
    total: PropTypes.number.isRequired,
    label: PropTypes.string,
    unit: PropTypes.string,
    showPercentage: PropTypes.bool,
    size: PropTypes.oneOf(['sm', 'md', 'lg']),
    color: PropTypes.string,
};
QuotaGauge.defaultProps = {
    label: '',
    unit: '',
    showPercentage: true,
    size: 'md',
    color: '#3B82F6',
};
export default QuotaGauge;