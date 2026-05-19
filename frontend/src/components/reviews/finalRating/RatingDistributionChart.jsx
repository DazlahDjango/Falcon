// src/components/reviews/finalRating/RatingDistributionChart.jsx
import React from 'react';
import './finalRating.css';

const RatingDistributionChart = ({ distribution, totalRatings, cycleName }) => {
    if (!distribution || distribution.length === 0) {
        return <div className="finalrating-empty">No rating distribution data available</div>;
    }

    // Sort by percentage descending
    const sortedDistribution = [...distribution].sort((a, b) => b.percentage - a.percentage);

    return (
        <div className="distribution-chart">
            <h3 className="finalrating-section-title">
                Rating Distribution - {cycleName}
            </h3>
            <div className="finalrating-stats" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                <div className="finalrating-stat-card">
                    <div className="finalrating-stat-value">{totalRatings}</div>
                    <div className="finalrating-stat-label">Total Ratings</div>
                </div>
            </div>
            <div className="distribution-chart">
                {sortedDistribution.map((item, index) => (
                    <div key={index} className="distribution-bar-item">
                        <div className="distribution-label">{item.rating_label}</div>
                        <div className="distribution-bar-container">
                            <div 
                                className="distribution-bar"
                                style={{ 
                                    width: `${item.percentage}%`,
                                    backgroundColor: item.color || '#3b82f6'
                                }}
                            >
                                {item.percentage >= 15 && `${item.percentage}%`}
                            </div>
                        </div>
                        <div className="distribution-percentage">
                            {item.percentage}% ({item.count})
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RatingDistributionChart;