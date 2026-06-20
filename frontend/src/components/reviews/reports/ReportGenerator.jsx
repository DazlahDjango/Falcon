// src/components/reviews/reports/ReportGenerator.jsx
import React, { useState } from 'react';
import './reports.css';
import { REPORT_TYPES, REPORT_TYPE_LABELS, REPORT_FORMATS, REPORT_FORMAT_LABELS } from '@/config/constants/reviewConstants';

const ReportGenerator = ({
    cycles = [],
    departments = [],
    employees = [],
    onGenerate,
    generating = false,
}) => {
    const [reportType, setReportType] = useState(REPORT_TYPES.CYCLE);
    const [format, setFormat] = useState(REPORT_FORMATS.PDF);
    const [cycleId, setCycleId] = useState('');
    const [departmentId, setDepartmentId] = useState('');
    const [employeeId, setEmployeeId] = useState('');
    const [includeCharts, setIncludeCharts] = useState(true);
    const [includeTables, setIncludeTables] = useState(true);

    const reportTypeOptions = [
        { value: REPORT_TYPES.COMPANY, label: REPORT_TYPE_LABELS[REPORT_TYPES.COMPANY] },
        { value: REPORT_TYPES.CYCLE, label: REPORT_TYPE_LABELS[REPORT_TYPES.CYCLE] },
        { value: REPORT_TYPES.DEPARTMENT, label: REPORT_TYPE_LABELS[REPORT_TYPES.DEPARTMENT] },
        { value: REPORT_TYPES.TEAM, label: REPORT_TYPE_LABELS[REPORT_TYPES.TEAM] },
        { value: REPORT_TYPES.EMPLOYEE, label: REPORT_TYPE_LABELS[REPORT_TYPES.EMPLOYEE] },
        { value: REPORT_TYPES.PIP, label: REPORT_TYPE_LABELS[REPORT_TYPES.PIP] },
        { value: REPORT_TYPES.CALIBRATION, label: REPORT_TYPE_LABELS[REPORT_TYPES.CALIBRATION] },
    ];

    const formatOptions = [
        { value: REPORT_FORMATS.PDF, label: REPORT_FORMAT_LABELS[REPORT_FORMATS.PDF] },
        { value: REPORT_FORMATS.EXCEL, label: REPORT_FORMAT_LABELS[REPORT_FORMATS.EXCEL] },
        { value: REPORT_FORMATS.CSV, label: REPORT_FORMAT_LABELS[REPORT_FORMATS.CSV] },
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const params = {
            report_type: reportType,
            format: format,
            include_charts: includeCharts,
            include_tables: includeTables,
        };

        if (cycleId) params.cycle_id = cycleId;
        if (departmentId) params.department_id = departmentId;
        if (employeeId) params.employee_id = employeeId;

        onGenerate(params);
    };

    return (
        <div className="report-card">
            <div className="report-card-header">
                <h3 className="report-card-title">Generate New Report</h3>
            </div>
            <div className="report-card-body">
                <form onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Report Type</label>
                            <select
                                className="form-select"
                                value={reportType}
                                onChange={(e) => setReportType(e.target.value)}
                            >
                                {reportTypeOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Format</label>
                            <div className="format-buttons">
                                {formatOptions.map(opt => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        className={`format-button ${format === opt.value ? 'active' : ''}`}
                                        onClick={() => setFormat(opt.value)}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {(reportType === REPORT_TYPES.CYCLE || reportType === REPORT_TYPES.COMPANY) && cycles.length > 0 && (
                        <div className="form-group">
                            <label className="form-label">Review Cycle</label>
                            <select
                                className="form-select"
                                value={cycleId}
                                onChange={(e) => setCycleId(e.target.value)}
                            >
                                <option value="">All Cycles</option>
                                {cycles.map(cycle => (
                                    <option key={cycle.id} value={cycle.id}>{cycle.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {reportType === REPORT_TYPES.DEPARTMENT && departments.length > 0 && (
                        <div className="form-group">
                            <label className="form-label">Department</label>
                            <select
                                className="form-select"
                                value={departmentId}
                                onChange={(e) => setDepartmentId(e.target.value)}
                            >
                                <option value="">Select Department</option>
                                {departments.map(dept => (
                                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {reportType === REPORT_TYPES.EMPLOYEE && employees.length > 0 && (
                        <div className="form-group">
                            <label className="form-label">Employee</label>
                            <select
                                className="form-select"
                                value={employeeId}
                                onChange={(e) => setEmployeeId(e.target.value)}
                            >
                                <option value="">Select Employee</option>
                                {employees.map(emp => (
                                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">
                                <input
                                    type="checkbox"
                                    checked={includeCharts}
                                    onChange={(e) => setIncludeCharts(e.target.checked)}
                                    style={{ marginRight: '8px' }}
                                />
                                Include Charts
                            </label>
                        </div>
                        <div className="form-group">
                            <label className="form-label">
                                <input
                                    type="checkbox"
                                    checked={includeTables}
                                    onChange={(e) => setIncludeTables(e.target.checked)}
                                    style={{ marginRight: '8px' }}
                                />
                                Include Tables
                            </label>
                        </div>
                    </div>

                    <button type="submit" className="btn-primary" disabled={generating} style={{ width: '100%' }}>
                        {generating ? 'Generating...' : 'Generate Report'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ReportGenerator;