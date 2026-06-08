import React, { useState } from 'react';
import { FiFile, FiImage, FiLink, FiDownload, FiEye } from 'react-icons/fi';
import EvidencePreview from '../submission/EvidencePreview';

const ActualEvidence = ({ evidence }) => {
    const [previewFile, setPreviewFile] = useState(null);

    if (!evidence || evidence.length === 0) {
        return (
            <div className="kpi-actual-evidence-card">
                <h3>Supporting Evidence</h3>
                <p className="kpi-actual-evidence-empty">No evidence attached</p>
            </div>
        );
    }

    const getFileIcon = (type) => {
        if (type?.startsWith('image/')) return <FiImage size={20} />;
        if (type === 'application/pdf') return <FiFile size={20} />;
        return <FiLink size={20} />;
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return '';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleDownload = (file) => {
        if (file.file_url) {
            window.open(file.file_url, '_blank');
        }
    };

    return (
        <div className="kpi-actual-evidence-card">
            <h3>Supporting Evidence ({evidence.length})</h3>
            <div className="kpi-actual-evidence-list">
                {evidence.map((item, index) => (
                    <div key={index} className="kpi-actual-evidence-item">
                        <div className="kpi-actual-evidence-icon">
                            {getFileIcon(item.evidence_type || item.file?.type)}
                        </div>
                        <div className="kpi-actual-evidence-info">
                            <div className="kpi-actual-evidence-name">
                                {item.description || item.file?.name || `Evidence ${index + 1}`}
                            </div>
                            <div className="kpi-actual-evidence-meta">
                                {item.evidence_type_display || item.evidence_type}
                                {item.file?.size && ` • ${formatFileSize(item.file.size)}`}
                            </div>
                        </div>
                        <div className="kpi-actual-evidence-actions">
                            <button 
                                className="kpi-actual-evidence-view"
                                onClick={() => setPreviewFile(item)}
                            >
                                <FiEye size={14} />
                            </button>
                            <button 
                                className="kpi-actual-evidence-download"
                                onClick={() => handleDownload(item)}
                            >
                                <FiDownload size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            
            {previewFile && (
                <EvidencePreview 
                    file={previewFile.file || previewFile}
                    onClose={() => setPreviewFile(null)}
                    onDownload={() => handleDownload(previewFile)}
                />
            )}
        </div>
    );
};

export default ActualEvidence;