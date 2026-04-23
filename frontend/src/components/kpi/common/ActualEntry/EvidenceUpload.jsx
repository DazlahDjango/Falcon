import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import styles from './ActualEntry.module.css';

const EvidenceUpload = ({ evidence, onChange, disabled }) => {
    const fileInputRef = useRef(null);
    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files);
        const newEvidence = files.map(file => ({
            id: Date.now() + Math.random(),
            file,
            name: file.name,
            size: file.size,
            type: file.type,
            uploadedAt: new Date().toISOString()
        }));
        onChange([...evidence, ...newEvidence]);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };
    const removeEvidence = (id) => {
        onChange(evidence.filter(e => e.id !== id));
    };
    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };
    const getFileIcon = (type) => {
        if (type?.startsWith('image/')) return '🖼️';
        if (type === 'application/pdf') return '📄';
        if (type?.includes('spreadsheet')) return '📊';
        if (type?.includes('document')) return '📝';
        return '📎';
    };
    return (
        <div className={styles.evidenceSection}>
            <label className={styles.label}>Supporting Evidence</label>
            <div className={styles.uploadArea}>
                <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileUpload}
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                    disabled={disabled}
                    className={styles.fileInput}
                    id="evidence-upload"
                />
                <label htmlFor="evidence-upload" className={styles.uploadLabel}>
                    <span className={styles.uploadIcon}>📎</span>
                    Click to upload or drag and drop
                    <span className={styles.uploadHint}>
                        PDF, Images, Excel, Word (Max 10MB)
                    </span>
                </label>
            </div>

            {evidence.length > 0 && (
                <div className={styles.evidenceList}>
                    <h5>Uploaded Files ({evidence.length})</h5>
                    {evidence.map(item => (
                        <div key={item.id} className={styles.evidenceItem}>
                            <div className={styles.evidenceInfo}>
                                <span className={styles.fileIcon}>{getFileIcon(item.type)}</span>
                                <div className={styles.fileDetails}>
                                    <span className={styles.fileName}>{item.name}</span>
                                    <span className={styles.fileSize}>{formatFileSize(item.size)}</span>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => removeEvidence(item.id)}
                                className={styles.removeButton}
                                disabled={disabled}
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
EvidenceUpload.propTypes = {
    evidence: PropTypes.array,
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
};
EvidenceUpload.defaultProps = {
    evidence: [],
    disabled: false,
};
export default EvidenceUpload;