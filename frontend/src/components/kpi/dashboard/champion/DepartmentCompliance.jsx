import React from 'react';
import { FiCheckCircle, FiAlertCircle, FiClock } from 'react-icons/fi';

const DepartmentCompliance = ({ departments }) => {
    if (!departments || departments.length === 0) {
        return (
            <div className="dashboard-card">
                <div className="card-header">
                    <h3>Department Compliance</h3>
                </div>
                <div className="card-empty">No department data available</div>
            </div>
        );
    }
    
    const getComplianceIcon = (rate) => {
        if (rate >= 90) return <FiCheckCircle size={14} color="var(--kpi-success)" />;
        if (rate >= 70) return <FiClock size={14} color="var(--kpi-warning)" />;
        return <FiAlertCircle size={14} color="var(--kpi-danger)" />;
    };
    
    const getComplianceClass = (rate) => {
        if (rate >= 90) return 'high';
        if (rate >= 70) return 'medium';
        return 'low';
    };
    
    return (
        <div className="dashboard-card">
            <div className="card-header">
                <h3>Department Compliance</h3>
                <span className="card-count">{departments.length} departments</span>
            </div>
            <div className="compliance-list">
                {departments.map((dept, index) => (
                    <div key={index} className="compliance-item">
                        <div className="compliance-info">
                            <div className="compliance-name">{dept.department}</div>
                            <div className="compliance-stats">
                                <span>{dept.submitted} / {dept.total_members} submitted</span>
                            </div>
                        </div>
                        <div className="compliance-rate">
                            <div className={`rate-value ${getComplianceClass(dept.compliance_rate)}`}>
                                {dept.compliance_rate}%
                            </div>
                            {getComplianceIcon(dept.compliance_rate)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DepartmentCompliance;