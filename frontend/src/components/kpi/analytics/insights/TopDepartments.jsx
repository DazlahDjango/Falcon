import React from 'react';

const TopDepartments = ({ insights }) => {
    const topDepts = insights?.top_departments || [];
    
    return (
        <div className="analytics-card">
            <div className="analytics-card-header">
                <h3>Top Performing Departments</h3>
                <span className="count">{topDepts.length}</span>
            </div>
            
            <div className="ranking-list">
                {topDepts.map((dept, index) => (
                    <div key={dept.name} className="ranking-item">
                        <div className={`ranking-position ${index === 0 ? 'top-1' : index === 1 ? 'top-2' : index === 2 ? 'top-3' : ''}`}>
                            #{index + 1}
                        </div>
                        <div className="ranking-name">{dept.name}</div>
                        <div className="ranking-score">{dept.score}%</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TopDepartments;