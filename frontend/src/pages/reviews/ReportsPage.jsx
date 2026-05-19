// src/pages/reviews/ReportsPage.jsx
import React, { useState, useEffect } from 'react';
import { useReports, useCycles } from '../../hooks/reviews';
import { ReviewSummaryReport, TeamSummaryReport, CycleSummaryReport, PIPReport, CalibrationReport } from '../../components/reviews/reports';

const ReportsPage = () => {
    const { getEmployeeSummary, getTeamSummary, getCycleSummary, getPIPSummary, getCalibrationSummary, exportReport, loading } = useReports();
    const { cycles, fetchCycles } = useCycles();
    
    const [reportType, setReportType] = useState('employee');
    const [selectedCycleId, setSelectedCycleId] = useState('');
    const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
    const [reportData, setReportData] = useState(null);
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        fetchCycles();
    }, []);

    const handleGenerateReport = async () => {
        setGenerating(true);
        try {
            let data;
            switch (reportType) {
                case 'employee':
                    if (!selectedEmployeeId || !selectedCycleId) {
                        alert('Please select employee and cycle');
                        return;
                    }
                    data = await getEmployeeSummary(selectedEmployeeId, selectedCycleId);
                    break;
                case 'team':
                    if (!selectedCycleId) {
                        alert('Please select cycle');
                        return;
                    }
                    data = await getTeamSummary(null, selectedCycleId);
                    break;
                case 'cycle':
                    if (!selectedCycleId) {
                        alert('Please select cycle');
                        return;
                    }
                    data = await getCycleSummary(selectedCycleId);
                    break;
                case 'pip':
                    data = await getPIPSummary();
                    break;
                case 'calibration':
                    if (!selectedCycleId) {
                        alert('Please select cycle');
                        return;
                    }
                    data = await getCalibrationSummary(selectedCycleId);
                    break;
            }
            setReportData(data);
        } catch (error) {
            console.error('Failed to generate report:', error);
        } finally {
            setGenerating(false);
        }
    };

    const handleExport = async (format) => {
        if (reportData && selectedCycleId) {
            await exportReport(reportType, selectedCycleId, format);
        }
    };

    return (
        <div style={{ padding: '1.5rem', maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1f2937', margin: 0 }}>Reports</h1>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>Generate and export performance reports</p>
            </div>

            <div style={{ background: 'white', borderRadius: '0.75rem', border: '1px solid #e5e7eb', padding: '1.5rem', marginBottom: '1.5rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>Report Configuration</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Report Type</label>
                        <select className="form-select" value={reportType} onChange={(e) => setReportType(e.target.value)}>
                            <option value="employee">Employee Summary</option>
                            <option value="team">Team Summary</option>
                            <option value="cycle">Cycle Summary</option>
                            <option value="pip">PIP Summary</option>
                            <option value="calibration">Calibration Summary</option>
                        </select>
                    </div>
                    {reportType !== 'pip' && (
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Review Cycle</label>
                            <select className="form-select" value={selectedCycleId} onChange={(e) => setSelectedCycleId(e.target.value)}>
                                <option value="">Select Cycle</option>
                                {cycles.map(cycle => (
                                    <option key={cycle.id} value={cycle.id}>{cycle.name}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    {reportType === 'employee' && (
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Employee ID</label>
                            <input type="text" className="form-input" placeholder="Enter Employee ID" value={selectedEmployeeId} onChange={(e) => setSelectedEmployeeId(e.target.value)} />
                        </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                        <button className="btn-primary" onClick={handleGenerateReport} disabled={generating}>
                            {generating ? 'Generating...' : 'Generate Report'}
                        </button>
                    </div>
                </div>
            </div>

            {reportData && (
                <>
                    {reportType === 'employee' && <ReviewSummaryReport summary={reportData} onExport={handleExport} />}
                    {reportType === 'team' && <TeamSummaryReport summary={reportData} onExport={handleExport} />}
                    {reportType === 'cycle' && <CycleSummaryReport summary={reportData} onExport={handleExport} />}
                    {reportType === 'pip' && <PIPReport report={reportData} onExport={handleExport} />}
                    {reportType === 'calibration' && <CalibrationReport report={reportData} onExport={handleExport} />}
                </>
            )}
        </div>
    );
};

export default ReportsPage;