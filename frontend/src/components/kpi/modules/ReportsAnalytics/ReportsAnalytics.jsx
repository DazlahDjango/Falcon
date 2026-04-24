import React, { useState } from 'react';
import PropTypes from 'prop-types';
import KPIReports from './KPIReports';
import ScoreReports from './ScoreReports';
import DepartmentReports from './DepartmentReports';
import ExportModal from './Export';
import styles from './ReportsAnalytics.module.css';

const ReportsAnalytics = ({ onError }) => {
    const [activeTab, setActiveTab] = useState('kpi');
    const [showExportModal, setShowExportModal] = useState(false);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const tabs = [
        { id: 'kpi', label: 'KPI Reports', icon: '📊' },
        { id: 'score', label: 'Score Reports', icon: '📈' },
        { id: 'department', label: 'Department Reports', icon: '🏢' }
    ];
    const handleExport = (exportType, format) => {
        // Handle export logic
        console.log('Exporting:', exportType, format, { year: selectedYear, month: selectedMonth });
        setShowExportModal(false);
    };
    return (
        <div className={styles.reportsAnalytics}>
            <div className={styles.header}>
                <h2>Reports & Analytics</h2>
                <div className={styles.headerActions}>
                    <div className={styles.periodSelector}>
                        <select 
                            value={selectedYear} 
                            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                            className={styles.yearSelect}
                        >
                            {[2023, 2024, 2025, 2026].map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                        <select 
                            value={selectedMonth} 
                            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                            className={styles.monthSelect}
                        >
                            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, idx) => (
                                <option key={idx + 1} value={idx + 1}>{month}</option>
                            ))}
                        </select>
                    </div>
                    <button onClick={() => setShowExportModal(true)} className={styles.exportButton}>
                        📥 Export Report
                    </button>
                </div>
            </div>

            <div className={styles.tabs}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`${styles.tab} ${activeTab === tab.id ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        <span className={styles.tabIcon}>{tab.icon}</span>
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            <div className={styles.tabContent}>
                {activeTab === 'kpi' && (
                    <KPIReports 
                        year={selectedYear} 
                        month={selectedMonth}
                        onError={onError}
                    />
                )}
                {activeTab === 'score' && (
                    <ScoreReports 
                        year={selectedYear} 
                        month={selectedMonth}
                        onError={onError}
                    />
                )}
                {activeTab === 'department' && (
                    <DepartmentReports 
                        year={selectedYear} 
                        month={selectedMonth}
                        onError={onError}
                    />
                )}
            </div>

            {showExportModal && (
                <ExportModal
                    isOpen={showExportModal}
                    onClose={() => setShowExportModal(false)}
                    onExport={handleExport}
                />
            )}
        </div>
    );
};
ReportsAnalytics.propTypes = {
    onError: PropTypes.func,
};
export default ReportsAnalytics;