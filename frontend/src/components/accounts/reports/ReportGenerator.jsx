import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
    FiFileText, FiCalendar, FiFilter, FiDownload,
    FiPieChart, FiBarChart2, FiTrendingUp, FiUsers,
    FiShield, FiActivity, FiCheckCircle, FiXCircle,
    FiAlertCircle, FiLoader, FiMail, FiClock, FiPlus
} from 'react-icons/fi';
import { useAudit } from '../../../hooks/accounts/useAudit';
import { useUsers } from '../../../hooks/accounts/useUsers';
import { useMFA } from '../../../hooks/accounts/useMfa';
import { showAlert } from '../../../store/accounts/slice/uiSlice';
import Spinner from '../../common/UI/Spinner';
import Modal from '../../common/UI/Modal';
import ReportFilters from './components/ReportFilters';
import ReportFormatSelector from './components/ReportFormatSelector';
import ReportPreview from './components/ReportPreview';

const ReportGenerator = ({ isOpen, onClose, initialType = 'compliance' }) => {
    const dispatch = useDispatch();
    const { loadComplianceReport, exportAuditLogs } = useAudit();
    const { users, loadUsers } = useUsers();
    const { loadMfaStatus, getMfaStatus } = useMFA();

    const [reportType, setReportType] = useState(initialType);
    const [dateRange, setDateRange] = useState({
        start_date: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0]
    });
    const [format, setFormat] = useState('csv');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedReport, setGeneratedReport] = useState(null);
    const [includeMetadata, setIncludeMetadata] = useState(true);
    const [includeChanges, setIncludeChanges] = useState(true);
    const [selectedColumns, setSelectedColumns] = useState({
        timestamp: true,
        user: true,
        action: true,
        action_type: true,
        severity: true,
        ip_address: true,
    });
    const [scheduleReport, setScheduleReport] = useState(false);
    const [scheduleConfig, setScheduleConfig] = useState({
        frequency: 'weekly',
        dayOfWeek: 'monday',
        time: '09:00',
        recipients: [],
    });
    const [step, setStep] = useState(1); // 1: type & filters, 2: format & columns, 3: preview & generate

    useEffect(() => {
        loadUsers({ page_size: 1000 });
        loadMfaStatus();
    }, [loadUsers, loadMfaStatus]);

    const reportTypes = [
        { 
            id: 'compliance', 
            name: 'Compliance Report', 
            icon: <FiShield size={20} />, 
            description: 'Security and compliance summary for auditors',
            category: 'security'
        },
        { 
            id: 'user_activity', 
            name: 'User Activity Report', 
            icon: <FiActivity size={20} />, 
            description: 'Detailed user activity across the platform',
            category: 'audit'
        },
        { 
            id: 'security', 
            name: 'Security Events Report', 
            icon: <FiAlertCircle size={20} />, 
            description: 'All security-related events and incidents',
            category: 'security'
        },
        { 
            id: 'mfa', 
            name: 'MFA Adoption Report', 
            icon: <FiShield size={20} />, 
            description: 'MFA enrollment and compliance statistics',
            category: 'security'
        },
        { 
            id: 'kpi_performance', 
            name: 'KPI Performance Report', 
            icon: <FiBarChart2 size={20} />, 
            description: 'KPI achievement and performance metrics',
            category: 'kpi'
        },
        { 
            id: 'user_onboarding', 
            name: 'User Onboarding Report', 
            icon: <FiUsers size={20} />, 
            description: 'New user registration and verification status',
            category: 'users'
        },
    ];

    const generateComplianceReport = async () => {
        return await loadComplianceReport(dateRange.start_date, dateRange.end_date);
    };

    const generateUserActivityReport = async () => {
        // Simulate report generation
        const filteredUsers = users.filter(u => 
            new Date(u.created_at) >= new Date(dateRange.start_date) &&
            new Date(u.created_at) <= new Date(dateRange.end_date)
        );
        
        return {
            report_type: 'user_activity',
            generated_at: new Date().toISOString(),
            date_range: dateRange,
            summary: {
                total_users: users.length,
                active_users: users.filter(u => u.is_active).length,
                new_users: filteredUsers.length,
                verified_users: users.filter(u => u.is_verified).length,
                mfa_enabled_users: users.filter(u => u.mfa_enabled).length,
            },
            user_roles: users.reduce((acc, u) => {
                acc[u.role] = (acc[u.role] || 0) + 1;
                return acc;
            }, {}),
            new_users_list: filteredUsers.slice(0, 20).map(u => ({
                email: u.email,
                role: u.role,
                created_at: u.created_at,
                is_verified: u.is_verified,
            })),
        };
    };

    const generateSecurityReport = async () => {
        return {
            report_type: 'security',
            generated_at: new Date().toISOString(),
            date_range: dateRange,
            summary: {
                total_security_events: 0,
                critical_events: 0,
                failed_logins: 0,
                mfa_failures: 0,
                account_lockouts: 0,
            },
            events_by_severity: {
                critical: 0,
                high: 0,
                medium: 0,
                low: 0,
            },
        };
    };

    const generateMFAReport = async () => {
        const totalUsers = users.length;
        const mfaEnabled = users.filter(u => u.mfa_enabled).length;
        
        return {
            report_type: 'mfa',
            generated_at: new Date().toISOString(),
            date_range: dateRange,
            summary: {
                total_users: totalUsers,
                mfa_enabled: mfaEnabled,
                mfa_adoption_rate: totalUsers ? ((mfaEnabled / totalUsers) * 100).toFixed(1) : 0,
                users_requiring_mfa: 0,
                compliant_users: 0,
            },
            by_role: users.reduce((acc, u) => {
                if (!acc[u.role]) acc[u.role] = { total: 0, mfa_enabled: 0 };
                acc[u.role].total++;
                if (u.mfa_enabled) acc[u.role].mfa_enabled++;
                return acc;
            }, {}),
        };
    };

    const handleGenerateReport = async () => {
        setIsGenerating(true);

        try {
            let reportData;

            switch (reportType) {
                case 'compliance':
                    reportData = await generateComplianceReport();
                    break;
                case 'user_activity':
                    reportData = await generateUserActivityReport();
                    break;
                case 'security':
                    reportData = await generateSecurityReport();
                    break;
                case 'mfa':
                    reportData = await generateMFAReport();
                    break;
                default:
                    reportData = {};
            }

            setGeneratedReport(reportData);
            setStep(3);
            dispatch(showAlert({ type: 'success', message: 'Report generated successfully' }));
        } catch (error) {
            dispatch(showAlert({ type: 'error', message: error || 'Failed to generate report' }));
        } finally {
            setIsGenerating(false);
        }
    };

    const downloadReport = () => {
        if (!generatedReport) return;

        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        let blob;
        let filename;

        if (format === 'csv') {
            const csvData = convertToCSV(generatedReport);
            blob = new Blob(["\uFEFF" + csvData], { type: 'text/csv;charset=utf-8;' });
            filename = `${reportType}_report_${timestamp}.csv`;
        } else if (format === 'json') {
            const jsonData = JSON.stringify(generatedReport, null, 2);
            blob = new Blob([jsonData], { type: 'application/json' });
            filename = `${reportType}_report_${timestamp}.json`;
        } else {
            // Excel format - use CSV as fallback
            const csvData = convertToCSV(generatedReport);
            blob = new Blob(["\uFEFF" + csvData], { type: 'application/vnd.ms-excel' });
            filename = `${reportType}_report_${timestamp}.xls`;
        }

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        dispatch(showAlert({ type: 'success', message: 'Report downloaded successfully' }));
    };

    const convertToCSV = (data) => {
        if (!data) return '';
        // Simple CSV conversion - you can enhance this based on report structure
        return JSON.stringify(data, null, 2);
    };

    const handleSchedule = async () => {
        setIsGenerating(true);
        try {
            // API call to schedule report
            await new Promise(resolve => setTimeout(resolve, 1000));
            dispatch(showAlert({ type: 'success', message: 'Report scheduled successfully' }));
            onClose();
        } catch (error) {
            dispatch(showAlert({ type: 'error', message: 'Failed to schedule report' }));
        } finally {
            setIsGenerating(false);
        }
    };

    const handleNext = () => {
        if (step < 3) setStep(step + 1);
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const canProceed = () => {
        if (step === 1 && !reportType) return false;
        if (step === 2 && !format) return false;
        return true;
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Report Generator" size="lg">
            <div className="report-generator">
                {/* Step Progress */}
                <div className="report-steps">
                    <div className={`step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
                        <div className="step-number">1</div>
                        <div className="step-label">Type & Filters</div>
                    </div>
                    <div className={`step-line ${step >= 2 ? 'active' : ''}`} />
                    <div className={`step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
                        <div className="step-number">2</div>
                        <div className="step-label">Format & Columns</div>
                    </div>
                    <div className={`step-line ${step >= 3 ? 'active' : ''}`} />
                    <div className={`step ${step >= 3 ? 'active' : ''}`}>
                        <div className="step-number">3</div>
                        <div className="step-label">Preview & Generate</div>
                    </div>
                </div>

                {/* Step 1: Report Type and Filters */}
                {step === 1 && (
                    <div className="report-step">
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

                        <ReportFilters
                            dateRange={dateRange}
                            onDateRangeChange={setDateRange}
                            reportType={reportType}
                        />
                    </div>
                )}

                {/* Step 2: Format and Columns */}
                {step === 2 && (
                    <div className="report-step">
                        <ReportFormatSelector
                            format={format}
                            onFormatChange={setFormat}
                            selectedColumns={selectedColumns}
                            onColumnToggle={(columnId) => setSelectedColumns(prev => ({ ...prev, [columnId]: !prev[columnId] }))}
                            includeMetadata={includeMetadata}
                            onIncludeMetadataChange={setIncludeMetadata}
                            includeChanges={includeChanges}
                            onIncludeChangesChange={setIncludeChanges}
                        />

                        <div className="report-section">
                            <label className="section-label schedule-label">
                                <FiClock size={14} />
                                Schedule Report
                            </label>
                            <div className="schedule-option">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={scheduleReport}
                                        onChange={(e) => setScheduleReport(e.target.checked)}
                                    />
                                    <span>Schedule this report to run automatically</span>
                                </label>
                            </div>

                            {scheduleReport && (
                                <div className="schedule-config">
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Frequency</label>
                                            <select
                                                value={scheduleConfig.frequency}
                                                onChange={(e) => setScheduleConfig(prev => ({ ...prev, frequency: e.target.value }))}
                                                className="form-input"
                                            >
                                                <option value="daily">Daily</option>
                                                <option value="weekly">Weekly</option>
                                                <option value="monthly">Monthly</option>
                                            </select>
                                        </div>
                                        {scheduleConfig.frequency === 'weekly' && (
                                            <div className="form-group">
                                                <label>Day of Week</label>
                                                <select
                                                    value={scheduleConfig.dayOfWeek}
                                                    onChange={(e) => setScheduleConfig(prev => ({ ...prev, dayOfWeek: e.target.value }))}
                                                    className="form-input"
                                                >
                                                    <option value="monday">Monday</option>
                                                    <option value="tuesday">Tuesday</option>
                                                    <option value="wednesday">Wednesday</option>
                                                    <option value="thursday">Thursday</option>
                                                    <option value="friday">Friday</option>
                                                </select>
                                            </div>
                                        )}
                                        <div className="form-group">
                                            <label>Time</label>
                                            <input
                                                type="time"
                                                value={scheduleConfig.time}
                                                onChange={(e) => setScheduleConfig(prev => ({ ...prev, time: e.target.value }))}
                                                className="form-input"
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Email Recipients</label>
                                        <div className="recipients-input">
                                            <FiMail className="input-icon" />
                                            <input
                                                type="text"
                                                placeholder="Enter email addresses separated by commas"
                                                value={scheduleConfig.recipients.join(', ')}
                                                onChange={(e) => setScheduleConfig(prev => ({ ...prev, recipients: e.target.value.split(',').map(r => r.trim()) }))}
                                                className="form-input"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Step 3: Preview and Generate */}
                {step === 3 && generatedReport && (
                    <div className="report-step">
                        <ReportPreview report={generatedReport} reportType={reportType} />

                        <div className="report-actions">
                            <button className="btn btn-secondary" onClick={downloadReport}>
                                <FiDownload size={16} />
                                Download {format.toUpperCase()}
                            </button>
                            {scheduleReport && (
                                <button className="btn btn-primary" onClick={handleSchedule} disabled={isGenerating}>
                                    {isGenerating ? <Spinner size="sm" /> : <FiClock size={16} />}
                                    {isGenerating ? 'Scheduling...' : 'Schedule Report'}
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Navigation Buttons */}
                <div className="form-actions">
                    {step > 1 && (
                        <button className="btn btn-secondary" onClick={handleBack}>
                            Back
                        </button>
                    )}
                    {step < 3 && (
                        <button 
                            className="btn btn-primary" 
                            onClick={handleNext}
                            disabled={!canProceed()}
                        >
                            Next
                        </button>
                    )}
                    {step === 3 && !generatedReport && (
                        <button 
                            className="btn btn-primary" 
                            onClick={handleGenerateReport}
                            disabled={isGenerating}
                        >
                            {isGenerating ? <Spinner size="sm" /> : <FiFileText size={16} />}
                            {isGenerating ? 'Generating...' : 'Generate Report'}
                        </button>
                    )}
                    <button className="btn btn-secondary" onClick={onClose}>
                        Cancel
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ReportGenerator;