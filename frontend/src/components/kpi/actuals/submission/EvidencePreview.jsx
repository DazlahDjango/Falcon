import React, { useState } from 'react';
import { FiX, FiDownload, FiEye, FiFile, FiImage, FiLink } from 'react-icons/fi';

const EvidencePreview = ({ file, onClose, onDownload }) => {
    const [isOpen, setIsOpen] = useState(true);

    const handleClose = () => {
        setIsOpen(false);
        onClose?.();
    };

    if (!isOpen) return null;

    const isImage = file?.type?.startsWith('image/');
    const isPDF = file?.type === 'application/pdf';
    const fileUrl = URL.createObjectURL(file);

    return (
        <div className="kpi-evidence-preview-overlay" onClick={handleClose}>
            <div className="kpi-evidence-preview-modal" onClick={(e) => e.stopPropagation()}>
                <div className="kpi-evidence-preview-header">
                    <h3>Preview Evidence</h3>
                    <button className="kpi-evidence-preview-close" onClick={handleClose}>
                        <FiX size={20} />
                    </button>
                </div>
                
                <div className="kpi-evidence-preview-content">
                    {isImage && (
                        <img src={fileUrl} alt={file.name} className="kpi-evidence-preview-image" />
                    )}
                    
                    {isPDF && (
                        <iframe 
                            src={`${fileUrl}#toolbar=0`} 
                            className="kpi-evidence-preview-pdf"
                            title={file.name}
                        />
                    )}
                    
                    {!isImage && !isPDF && (
                        <div className="kpi-evidence-preview-placeholder">
                            {file.type?.startsWith('image/') ? <FiImage size={48} /> : <FiFile size={48} />}
                            <p>Preview not available for this file type</p>
                            <div className="kpi-evidence-preview-info">
                                <strong>{file.name}</strong>
                                <span>{file.size} bytes</span>
                            </div>
                        </div>
                    )}
                </div>
                
                <div className="kpi-evidence-preview-footer">
                    <button 
                        className="kpi-evidence-preview-download"
                        onClick={() => onDownload?.(file)}
                    >
                        <FiDownload size={14} />
                        Download
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EvidencePreview;