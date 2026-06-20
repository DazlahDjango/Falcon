// src/components/reviews/reviewAnalytics/ReviewHighRiskList.jsx
import React from 'react';
import './analytics.css';

const ReviewHighRiskList = ({ employees, onEmployeeClick, loading }) => {
    if (loading) {
        return <div className="analytics-loading">Loading risk predictions...</div>;
    }

    if (!employees || employees.length === 0) {
        return (
            <div className="chart-card">
                <div className="chart-title">High Risk Employees</div>
                <div className="analytics-empty">No high risk employees detected</div>
            </div>
        );
    }

    const getRiskClass = (riskLevel) => {
        switch (riskLevel) {
            case 'critical': return 'risk-critical';
            case 'high': return 'risk-high';
            case 'medium': return 'risk-medium';
            default: return 'risk-low';
        }
    };

    const getRiskLabel = (riskLevel) => {
        switch (riskLevel) {
            case 'critical': return 'Critical';
            case 'high': return 'High';
            case 'medium': return 'Medium';
            default: return 'Low';
        }
    };

    return (
        <div className="chart-card">
            <div className="chart-title">High Risk Employees</div>
            <div className="analytics-list">
                <div className="list-header">
                    <span>Employee</span>
                    <span>Department</span>
                    <span>Risk Level</span>
                    <span>Probability</span>
                </div>
                {employees.map(emp => (
                    <div
                        key={emp.id}
                        className="list-row"
                        onClick={() => onEmployeeClick?.(emp.id)}
                    >
                        <span className="list-row-name">{emp.name}</span>
                        <span>{emp.department_name || 'N/A'}</span>
                        <span>
                            <span className={`rating-badge ${getRiskClass(emp.risk_level)}`}>
                                {getRiskLabel(emp.risk_level)}
                            </span>
                        </span>
                        <span>{emp.risk_probability ? `${(emp.risk_probability * 100).toFixed(0)}%` : 'N/A'}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ReviewHighRiskList;