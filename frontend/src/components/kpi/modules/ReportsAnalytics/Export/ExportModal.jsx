import React, { useState } from 'react';
import PropTypes from 'prop-types';
import ExportOptions from './ExportOptions';
import styles from './ExportModal.module.css';

const ExportModal = ({ isOpen, onClose, onExport }) => {
    const [exportType, setExportType] = useState('kpi');
    const [format, setFormat] = useState('csv');
    const [includeCharts, setIncludeCharts] = useState(true);
    const [includeData, setIncludeData] = useState(true);
    if (!isOpen) return null;
    const handleExport = () => {
        onExport(exportType, format, { includeCharts, includeData });
    };
    return (
        <div className={styles.modal} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h3>Export Report</h3>
                    <button onClick={onClose} className={styles.closeButton}>×</button>
                </div>
                
                <ExportOptions
                    exportType={exportType}
                    onExportTypeChange={setExportType}
                    format={format}
                    onFormatChange={setFormat}
                    includeCharts={includeCharts}
                    onIncludeChartsChange={setIncludeCharts}
                    includeData={includeData}
                    onIncludeDataChange={setIncludeData}
                />
                
                <div className={styles.modalActions}>
                    <button onClick={onClose} className={styles.cancelButton}>
                        Cancel
                    </button>
                    <button onClick={handleExport} className={styles.exportButton}>
                        Export
                    </button>
                </div>
            </div>
        </div>
    );
};
ExportModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onExport: PropTypes.func.isRequired,
};
export default ExportModal;