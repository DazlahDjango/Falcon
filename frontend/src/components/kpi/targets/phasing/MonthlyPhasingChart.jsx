import React from 'react';

const MonthlyPhasingChart = ({ phasing }) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const maxValue = Math.max(...(phasing?.map(p => p.target_value) || [0]), 1);

    return (
        <div className="kpi-phasing-chart">
            <div className="kpi-phasing-chart-bars">
                {months.map((month, index) => {
                    const phasingItem = phasing?.find(p => p.month === index + 1);
                    const value = phasingItem?.target_value || 0;
                    const height = (value / maxValue) * 100;
                    
                    return (
                        <div key={month} className="kpi-phasing-chart-bar-wrapper">
                            <div 
                                className="kpi-phasing-chart-bar"
                                style={{ height: `${height}%` }}
                            >
                                <span className="kpi-phasing-chart-value">{value.toFixed(1)}</span>
                            </div>
                            <div className="kpi-phasing-chart-label">{month}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default MonthlyPhasingChart;