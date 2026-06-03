// frontend/src/components/accounts/reports/ReportGenerator.jsx
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
    FiFileText, FiCalendar, FiFilter, FiDownload,
    FiPieChart, FiBarChart2, FiTrendingUp, FiUsers,
    FiShield, FiActivity, FiCheckCircle, FiXCircle
} from 'react-icons/fi';
import { useAudit } from '../../../store/accounts/hooks/useAudit';
import { useUsers } from '../../../store/accounts/hooks/useUsers';
import { showAlert } from '../../../store/accounts/slice/uiSlice';
import Spinner from '../../common/UI/Spinner';
import Modal from '../../common/UI/Modal';

const ReportGenerator = ({ isOpen, onClose }) => {
    const dispatch = useDispatch();
    const { loadComplianceReport } = useAudit();
    const { users } = useUsers();

    const [reportType, setReportType] = useState('compliance');
    const [dateRange, setDateRange] = useState({
        start_date: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0]
    });
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedReport, setGeneratedReport] = useState(null);

    const reportTypes = [
        { id: 'compliance', name: 'Compliance Report', icon: <FiShield size={20} />, description: 'Security and compliance summary for auditors' },
        { id: 'user_activity', name: 'User Activity Report', icon: <FiActivity size={20} />, description: 'Detailed user activity across the platform' },
        { id: 'security', name: 'Security Events Report', icon: <FiAlertCircle size={20} />, description: 'All security-related events and incidents' },
        { id: 'mfa', name: 'MFA Adoption Report', icon: <FiShield size={20} />, description: 'MFA enrollment and compliance statistics' },
    ];

    const handleGenerateReport = async () => {
        setIsGenerating(true);

        try {
            let reportData;

            switch (reportType) {
                case 'compliance':
                    reportData = await loadComplianceReport(dateRange.start_date, dateRange.end_date);
                    break;
                case 'user_activity':
                    // Generate user activity report
                    reportData = await generateUserActivityReport();
                    break;
                case 'security':
                    // Generate security events report
                    reportData = await generateSecurityReport();
                    break;
                case 'mfa':
                    reportData = await generateMFAReport();
                    break;
                default:
                    reportData = {};
            }

            setGeneratedReport(reportData);
            dispatch(showAlert({ type: 'success', message: 'Report generated successfully' }));
        } catch (error) {
            dispatch(showAlert({ type: 'error', message: 'Failed to generate report' }));
        } finally {
            setIsGenerating(false);
        }
    };

    const generateUserActivityReport = async () => {
        // Simulate report generation
        return {
            total_users: users.length,
            active_users: users.filter(u => u.is_active).length,
            new_users: users.filter(u => new Date(u.created_at) > new Date(dateRange.start_date)).length,
            user_roles: users.reduce((acc, u) => {
                acc[u.role] = (acc[u.role] || 0) + 1;
                return acc;
            }, {}),
        };
    };

    const generateSecurityReport = async () => {
        return {
            total_security_events: 0,
            critical_events: 0,
            failed_logins: 0,
            mfa_failures: 0,
        };
    };

    const generateMFAReport = async () => {
        const totalUsers = users.length;
        const mfaEnabled = users.filter(u => u.mfa_enabled).length;

        return {
            total_users: totalUsers,
            mfa_enabled: mfaEnabled,
            mfa_adoption_rate: totalUsers ? ((mfaEnabled / totalUsers) * 100).toFixed(1) : 0,
            by_role: users.reduce((acc, u) => {
                if (!acc[u.role]) acc[u.role] = { total: 0, mfa_enabled: 0 };
                acc[u.role].total++;
                if (u.mfa_enabled) acc[u.role].mfa_enabled++;
                return acc;
            }, {}),
        };
    };

    const downloadReport = () => {
        if (!generatedReport) return;

        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        const reportData = JSON.stringify(generatedReport, null, 2);
        const blob = new Blob([reportData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${reportType}_report_${timestamp}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Report Generator" size="lg">
            <div className="report-generator">
                {/* Report Type Selection */}
                <div className="report-section">
                    <label className="section-label">Report Type</label>
                    <div className="report-types-grid">
                        {reportTypes.map(type => (
                            <div
                                key={type.id}
                                className={`report-type-card ${reportType === type.id ? 'selected' : ''}`}
                                onClick={() => setReportType(type.id)}
                            >
                                <div className="report-type-icon">{type.icon}</div>
                                <div className="report-type-info">
                                    <strong>{type.name}</strong>
                                    <span>{type.description}</span>
                                </div>
                                {reportType === type.id && <FiCheckCircle className="selected-icon" />}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Date Range */}
                <div className="report-section">
                    <label className="section-label">Date Range</label>
                    <div className="date-range-inputs">
                        <div className="date-input">
                            <FiCalendar size={14} />
                            <input
                                type="date"
                                value={dateRange.start_date}
                                onChange={(e) => setDateRange(prev => ({ ...prev, start_date: e.target.value }))}
                            />
                        </div>
                        <span className="date-separator">to</span>
                        <div className="date-input">
                            <FiCalendar size={14} />
                            <input
                                type="date"
                                value={dateRange.end_date}
                                onChange={(e) => setDateRange(prev => ({ ...prev, end_date: e.target.value }))}
                            />
                        </div>
                    </div>
                </div>

                {/* Report Preview (if generated) */}
                {generatedReport && (
                    <div className="report-preview">
                        <div className="preview-header">
                            <h3>Report Preview</h3>
                            <button className="btn-download" onClick={downloadReport}>
                                <FiDownload size={14} /> Download JSON
                            </button>
                        </div>
                        <div className="preview-content">
                            <pre>{JSON.stringify(generatedReport, null, 2)}</pre>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="report-actions">
                    <button className="btn btn-secondary" onClick={onClose}>
                        Cancel
                    </button>
                    <button className="btn btn-primary" onClick={handleGenerateReport} disabled={isGenerating}>
                        {isGenerating ? <Spinner size="sm" /> : <FiFileText size={16} />}
                        {isGenerating ? 'Generating...' : 'Generate Report'}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ReportGenerator;