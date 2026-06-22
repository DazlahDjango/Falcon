import React from 'react';

const KPIScoreGauge = ({ score, size = 80, label = 'Score', showLabel = true }) => {
    const radius = (size - 10) / 2;
    const circumference = 2 * Math.PI * radius;
    const percentage = Math.min(Math.max(score, 0), 100);
    const strokeDashoffset = circumference - (percentage / 100) * circumference;
    
    const getColor = () => {
        if (percentage >= 90) return 'green';
        if (percentage >= 75) return 'blue';
        if (percentage >= 50) return 'yellow';
        return 'red';
    };

    const color = getColor();

    return (
        <div className="kpi-score-gauge" style={{ width: size, height: size }}>
            <svg className="kpi-score-gauge-svg" width={size} height={size}>
                <circle
                    className="kpi-score-gauge-circle-bg"
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    strokeWidth="8"
                />
                <circle
                    className={`kpi-score-gauge-circle-fill kpi-score-gauge-circle-fill-${color}`}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                />
            </svg>
            <div className="kpi-score-gauge-value">
                {Math.round(percentage)}%
            </div>
            {showLabel && (
                <div className="kpi-score-gauge-label">
                    {label}
                </div>
            )}
        </div>
    );
};

export default KPIScoreGauge;