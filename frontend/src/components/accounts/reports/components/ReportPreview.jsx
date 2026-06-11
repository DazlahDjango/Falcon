import React from 'react';
import { FiCheckCircle, FiAlertCircle, FiShield, FiUsers, FiActivity } from 'react-icons/fi';

const ReportPreview = ({ report, reportType }) => {
    if (!report) return null;

    const renderCompliancePreview = () => {
        return (
            <div className="report-preview">
                <div className="preview-header">
                    <h3>Compliance Report Preview</h3>
                    <p>Generated: {new Date(report.generated_at).toLocaleString()}</p>
                </div>
                <div className="preview-stats">
                    <div className="stat-item">
                        <span className="stat-label">Total Actions</span>
                        <span className="stat-value">{report.summary?.total_actions || 0}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Unique Users</span>
                        <span className="stat-value">{report.summary?.unique_users || 0}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Critical Events</span>
                        <span className="stat-value">{report.summary?.critical_events || 0}</span>
                    </div>
                </div>
                <div className="preview-section">
                    <strong>Action Breakdown:</strong>
                    <ul>
                        {report.action_breakdown?.slice(0, 5).map((item, i) => (
                            <li key={i}>{item.action_type}: {item.count}</li>
                        ))}
                    </ul>
                </div>
            </div>
        );
    };

    const renderUserActivityPreview = () => {
        return (
            <div className="report-preview">
                <div className="preview-header">
                    <h3>User Activity Report Preview</h3>
                    <p>Generated: {new Date(report.generated_at).toLocaleString()}</p>
                </div>
                <div className="preview-stats">
                    <div className="stat-item">
                        <FiUsers size={16} />
                        <div>
                            <span className="stat-label">Total Users</span>
                            <span className="stat-value">{report.summary?.total_users || 0}</span>
                        </div>
                    </div>
                    <div className="stat-item">
                        <FiActivity size={16} />
                        <div>
                            <span className="stat-label">Active Users</span>
                            <span className="stat-value">{report.summary?.active_users || 0}</span>
                        </div>
                    </div>
                    <div className="stat-item">
                        <FiShield size={16} />
                        <div>
                            <span className="stat-label">MFA Enabled</span>
                            <span className="stat-value">{report.summary?.mfa_enabled_users || 0}</span>
                        </div>
                    </div>
                </div>
                <div className="preview-section">
                    <strong>User Roles Distribution:</strong>
                    <ul>
                        {Object.entries(report.user_roles || {}).slice(0, 5).map(([role, count]) => (
                            <li key={role}>{role}: {count}</li>
                        ))}
                    </ul>
                </div>
            </div>
        );
    };

    const renderMFAPreview = () => {
        return (
            <div className="report-preview">
                <div className="preview-header">
                    <h3>MFA Adoption Report Preview</h3>
                    <p>Generated: {new Date(report.generated_at).toLocaleString()}</p>
                </div>
                <div className="preview-stats">
                    <div className="stat-item">
                        <span className="stat-label">MFA Adoption Rate</span>
                        <span className="stat-value highlight">{report.summary?.mfa_adoption_rate || 0}%</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Total Users</span>
                        <span className="stat-value">{report.summary?.total_users || 0}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">MFA Enabled</span>
                        <span className="stat-value">{report.summary?.mfa_enabled || 0}</span>
                    </div>
                </div>
                <div className="preview-section">
                    <strong>MFA by Role:</strong>
                    <ul>
                        {Object.entries(report.by_role || {}).slice(0, 5).map(([role, data]) => (
                            <li key={role}>
                                {role}: {data.mfa_enabled}/{data.total} ({data.total ? Math.round((data.mfa_enabled / data.total) * 100) : 0}%)
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        );
    };

    switch (reportType) {
        case 'compliance':
            return renderCompliancePreview();
        case 'user_activity':
            return renderUserActivityPreview();
        case 'mfa':
            return renderMFAPreview();
        default:
            return (
                <div className="report-preview">
                    <div className="preview-header">
                        <h3>Report Preview</h3>
                        <p>Generated: {new Date(report.generated_at).toLocaleString()}</p>
                    </div>
                    <pre className="preview-json">
                        {JSON.stringify(report, null, 2).slice(0, 500)}
                        {JSON.stringify(report, null, 2).length > 500 && '...'}
                    </pre>
                </div>
            );
    }
};

export default ReportPreview;