import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { FiX, FiFile, FiFileText, FiFilePlus, FiDownload } from 'react-icons/fi';
import { exportKPIs, exportScores, exportReport } from '../../../store/kpi';
import ExportOptions from './ExportOptions';
import ExportProgress from './ExportProgress';

const ExportModal = ({ type, data, filters, onClose }) => {
    const dispatch = useDispatch();
    const [format, setFormat] = useState('csv');
    const [exporting, setExporting] = useState(false);
    const [progress, setProgress] = useState(0);
    
    const getTitle = () => {
        switch (type) {
            case 'kpi': return 'Export KPIs';
            case 'score': return 'Export Scores';
            case 'report': return 'Export Report';
            default: return 'Export Data';
        }
    };
    
    const handleExport = async () => {
        setExporting(true);
        setProgress(0);
        
        try {
            let result;
            if (type === 'kpi') {
                result = await dispatch(exportKPIs({ ...filters, format })).unwrap();
            } else if (type === 'score') {
                result = await dispatch(exportScores({ ...filters, format })).unwrap();
            } else {
                result = await dispatch(exportReport({ ...filters, format })).unwrap();
            }
            
            setProgress(100);
            
            // Download file
            const url = URL.createObjectURL(result);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${type}_export.${format === 'excel' ? 'xlsx' : format}`;
            a.click();
            URL.revokeObjectURL(url);
            
            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (error) {
            console.error('Export failed:', error);
        } finally {
            setExporting(false);
        }
    };
    
    const formats = [
        { value: 'csv', label: 'CSV', icon: <FiFile size={16} />, desc: 'Compatible with Excel, Google Sheets' },
        { value: 'excel', label: 'Excel', icon: <FiFilePlus size={16} />, desc: 'XLSX format with formatting' },
        { value: 'pdf', label: 'PDF', icon: <FiFileText size={16} />, desc: 'Print-ready document' }
    ];
    
    return (
        <div className="export-modal-overlay" onClick={onClose}>
            <div className="export-modal" onClick={(e) => e.stopPropagation()}>
                <div className="export-modal-header">
                    <h3>{getTitle()}</h3>
                    <button className="close-btn" onClick={onClose}>
                        <FiX size={20} />
                    </button>
                </div>
                
                <div className="export-modal-body">
                    {!exporting ? (
                        <>
                            <div className="export-format-section">
                                <h4>Select Export Format</h4>
                                <div className="export-formats">
                                    {formats.map(f => (
                                        <div 
                                            key={f.value}
                                            className={`export-format-option ${format === f.value ? 'selected' : ''}`}
                                            onClick={() => setFormat(f.value)}
                                        >
                                            <div className="format-icon">{f.icon}</div>
                                            <div className="format-info">
                                                <div className="format-label">{f.label}</div>
                                                <div className="format-desc">{f.desc}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <ExportOptions type={type} filters={filters} data={data} />
                        </>
                    ) : (
                        <ExportProgress progress={progress} />
                    )}
                </div>
                
                <div className="export-modal-footer">
                    <button className="cancel-btn" onClick={onClose}>
                        Cancel
                    </button>
                    <button 
                        className="export-btn"
                        onClick={handleExport}
                        disabled={exporting}
                    >
                        <FiDownload size={14} />
                        {exporting ? 'Exporting...' : 'Export'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExportModal;