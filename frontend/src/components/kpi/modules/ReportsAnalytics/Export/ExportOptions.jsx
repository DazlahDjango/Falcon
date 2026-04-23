import React from 'react';
import PropTypes from 'prop-types';
import styles from './ExportModal.module.css';

const ExportOptions = ({ exportType, onExportTypeChange, format, onFormatChange, includeCharts, onIncludeChartsChange, includeData, onIncludeDataChnage }) => {
    const exportTypes = [
        { value: 'kpi', label: 'KPI Report', icon: '📊' },
        { value: 'score', label: 'Score Report', icon: '📈' },
        { value: 'department', label: 'Department Report', icon: '🏢' },
        { value: 'full', label: 'Full Report', icon: '📑' }
    ];
    const formats = [
        { value: 'csv', label: 'CSV', extension: '.csv' },
        { value: 'excel', label: 'Excel', extension: '.xlsx' },
        { value: 'pdf', label: 'PDF', extension: '.pdf' }
    ];
    return (
        <div className={styles.options}>
            <div className={styles.optionGroup}>
                <label className={styles.optionLabel}>Report Type</label>
                <div className={styles.exportTypeGrid}>
                    {exportTypes.map(type => (
                        <button
                            key={type.value}
                            className={`${styles.exportTypeButton} ${exportType === type.value ? styles.selected : ''}`}
                            onClick={() => onExportTypeChange(type.value)}
                        >
                            <span className={styles.exportTypeIcon}>{type.icon}</span>
                            <span>{type.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className={styles.optionGroup}>
                <label className={styles.optionLabel}>Format</label>
                <div className={styles.formatButtons}>
                    {formats.map(f => (
                        <button
                            key={f.value}
                            className={`${styles.formatButton} ${format === f.value ? styles.selected : ''}`}
                            onClick={() => onFormatChange(f.value)}
                        >
                            {f.label} {f.extension}
                        </button>
                    ))}
                </div>
            </div>

            <div className={styles.optionGroup}>
                <label className={styles.checkboxLabel}>
                    <input
                        type="checkbox"
                        checked={includeCharts}
                        onChange={(e) => onIncludeChartsChange(e.target.checked)}
                    />
                    Include Charts
                </label>
                <label className={styles.checkboxLabel}>
                    <input
                        type="checkbox"
                        checked={includeData}
                        onChange={(e) => onIncludeDataChange(e.target.checked)}
                    />
                    Include Data Tables
                </label>
            </div>

            <div className={styles.infoBox}>
                <span className={styles.infoIcon}>ℹ️</span>
                <span className={styles.infoText}>
                    Export will be processed in the background. You will receive a download link when ready.
                </span>
            </div>
        </div>
    );
};
ExportOptions.propTypes = {
    exportType: PropTypes.string.isRequired,
    onExportTypeChange: PropTypes.func.isRequired,
    format: PropTypes.string.isRequired,
    onFormatChange: PropTypes.func.isRequired,
    includeCharts: PropTypes.bool.isRequired,
    onIncludeChartsChange: PropTypes.func.isRequired,
    includeData: PropTypes.bool.isRequired,
    onIncludeDataChange: PropTypes.func.isRequired,
};
export default ExportOptions;