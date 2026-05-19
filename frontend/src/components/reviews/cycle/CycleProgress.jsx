// src/components/reviews/cycle/CycleProgress.jsx
import React from 'react';
import './cycle.css';

const CycleProgress = ({ progress, cycleName }) => {
    if (!progress) {
        return <div className="cycle-progress-empty">No progress data available</div>;
    }

    const {
        total_employees = 0,
        self_assessment = {},
        supervisor_review = {},
        final_rating = {},
        overall_completion_percentage = 0
    } = progress;

    const stages = [
        {
            title: 'Self Assessment',
            completed: self_assessment.submitted || 0,
            total: total_employees,
            percentage: self_assessment.percentage || 0,
            status: self_assessment.percentage === 100 ? 'completed' : 'in-progress',
        },
        {
            title: 'Supervisor Review',
            completed: supervisor_review.completed || 0,
            total: total_employees,
            percentage: supervisor_review.percentage || 0,
            status: supervisor_review.percentage === 100 ? 'completed' : 'in-progress',
        },
        {
            title: 'Final Rating',
            completed: final_rating.locked || 0,
            total: total_employees,
            percentage: final_rating.percentage || 0,
            status: final_rating.percentage === 100 ? 'completed' : 'pending',
        },
    ];

    return (
        <div className="cycle-progress">
            <h3 className="cycle-section-title">
                {cycleName} - Progress Report
            </h3>

            <div className="progress-stats">
                <div className="progress-stat-card">
                    <div className="progress-stat-value">{total_employees}</div>
                    <div className="progress-stat-label">Total Employees</div>
                </div>
                <div className="progress-stat-card">
                    <div className="progress-stat-value">{overall_completion_percentage}%</div>
                    <div className="progress-stat-label">Overall Complete</div>
                </div>
            </div>

            {stages.map((stage, index) => (
                <div key={index} className="progress-bar-container">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: 500 }}>{stage.title}</span>
                        <span>{stage.completed} / {stage.total} ({stage.percentage}%)</span>
                    </div>
                    <div className="progress-bar">
                        <div 
                            className={`progress-bar-fill ${stage.status}`}
                            style={{ width: `${stage.percentage}%` }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default CycleProgress;