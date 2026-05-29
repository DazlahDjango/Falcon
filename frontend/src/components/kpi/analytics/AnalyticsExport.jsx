import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { downloadKpiReport } from '../../../services/kpi/export.service';
import styles from './AnalyticsExport.module.css';

const AnalyticsExport = ({ year, month }) => {
    const [reportType, setReportType] = useState('performance');
    const [format, setFormat] = useState('pdf');
    const [isExporting, setIsExporting] = useState(false);

    const reportOptions = [
        { value: 'performance', label: 'Performance Report', icon: '📊', desc: 'Complete performance overview with KPIs and scores' },
        { value: 'department', label: 'Department Summary', icon: '🏢', desc: 'Department-wise performance comparison' },
        { value: 'validation', label: 'Validation Compliance', icon: '✓', desc: 'Data validation and submission status' },
        { value: 'red_alerts', label: 'Red Alerts Report', icon: '🔴', desc: 'KPIs requiring immediate attention' },
    ];

    const formatOptions = [
        { value: 'pdf', label: 'PDF', icon: '📄', desc: 'Professional print-ready format' },
        { value: 'excel', label: 'Excel', icon: '📊', desc: 'Editable spreadsheet with charts' },
        { value: 'csv', label: 'CSV', icon: '📋', desc: 'Raw data for analysis' },
    ];

    const handleExport = async () => {
        setIsExporting(true);
        try {
            await downloadKpiReport({
                format,
                report: reportType,
                year,
                month,
            });
        } catch (error) {
            console.error('Export failed:', error);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className={styles.export}>
            <div className={styles.header}>
                <h3>Export Analytics</h3>
                <p>Generate and download reports in your preferred format</p>
            </div>

            <div className={styles.section}>
                <label className={styles.sectionLabel}>Report Type</label>
                <div className={styles.optionsGrid}>
                    {reportOptions.map(option => (
                        <div
                            key={option.value}
                            className={`${styles.optionCard} ${reportType === option.value ? styles.selected : ''}`}
                            onClick={() => setReportType(option.value)}
                        >
                            <div className={styles.optionIcon}>{option.icon}</div>
                            <div className={styles.optionLabel}>{option.label}</div>
                            <div className={styles.optionDesc}>{option.desc}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div className={styles.section}>
                <label className={styles.sectionLabel}>Format</label>
                <div className={styles.formatButtons}>
                    {formatOptions.map(option => (
                        <button
                            key={option.value}
                            className={`${styles.formatButton} ${format === option.value ? styles.active : ''}`}
                            onClick={() => setFormat(option.value)}
                        >
                            <span className={styles.formatIcon}>{option.icon}</span>
                            <span>{option.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className={styles.periodInfo}>
                <div className={styles.periodItem}>
                    <span>Period:</span>
                    <strong>{year} - {String(month).padStart(2, '0')}</strong>
                </div>
            </div>

            <button
                className={styles.exportButton}
                onClick={handleExport}
                disabled={isExporting}
            >
                {isExporting ? (
                    <>
                        <div className={styles.spinnerSmall} />
                        Generating Report...
                    </>
                ) : (
                    <>
                        📥 Export {reportOptions.find(r => r.value === reportType)?.label}
                    </>
                )}
            </button>

            <div className={styles.info}>
                <div className={styles.infoIcon}>ℹ️</div>
                <div className={styles.infoText}>
                    Reports are generated in the background. Large reports may take a few moments.
                    You will be notified when your download is ready.
                </div>
            </div>
        </div>
    );
};

AnalyticsExport.propTypes = {
    year: PropTypes.number.isRequired,
    month: PropTypes.number.isRequired,
};

export default AnalyticsExport;