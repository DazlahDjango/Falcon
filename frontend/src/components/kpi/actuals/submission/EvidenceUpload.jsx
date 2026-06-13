import React, { useCallback } from 'react';
import { FiUpload, FiFile, FiImage, FiLink, FiX, FiCheckCircle } from 'react-icons/fi';
import { useDropzone } from 'react-dropzone';

const EvidenceUpload = ({ files, onChange, maxFiles = 5 }) => {
    const onDrop = useCallback((acceptedFiles) => {
        const newFiles = acceptedFiles.map(file => ({
            id: Math.random().toString(36).substr(2, 9),
            file,
            name: file.name,
            size: file.size,
            type: file.type,
            progress: 0,
            status: 'pending'
        }));
        onChange([...files, ...newFiles].slice(0, maxFiles));
    }, [files, onChange, maxFiles]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
            'application/pdf': ['.pdf'],
            'application/msword': ['.doc', '.docx'],
            'application/vnd.ms-excel': ['.xls', '.xlsx'],
            'text/plain': ['.txt']
        },
        maxFiles: maxFiles - files.length
    });

    const removeFile = (id) => {
        onChange(files.filter(f => f.id !== id));
    };

    const getFileIcon = (type) => {
        if (type?.startsWith('image/')) return <FiImage size={20} />;
        return <FiFile size={20} />;
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="kpi-evidence-upload">
            <div className="kpi-evidence-upload-header">
                <h3>Upload Supporting Evidence</h3>
                <p>Upload documents, images, or files that support your actual value submission</p>
            </div>
            
            <div 
                {...getRootProps()} 
                className={`kpi-evidence-dropzone ${isDragActive ? 'drag-active' : ''}`}
            >
                <input {...getInputProps()} />
                <FiUpload size={32} />
                <p>{isDragActive ? 'Drop files here...' : 'Drag & drop files here or click to browse'}</p>
                <span className="kpi-evidence-hint">
                    Supports: Images, PDF, DOC, XLS, TXT (Max {maxFiles} files)
                </span>
            </div>
            
            {files.length > 0 && (
                <div className="kpi-evidence-list">
                    <div className="kpi-evidence-list-header">
                        <span>Attached Files ({files.length}/{maxFiles})</span>
                    </div>
                    {files.map(file => (
                        <div key={file.id} className="kpi-evidence-item">
                            <div className="kpi-evidence-item-icon">
                                {getFileIcon(file.type)}
                            </div>
                            <div className="kpi-evidence-item-info">
                                <div className="kpi-evidence-item-name">{file.name}</div>
                                <div className="kpi-evidence-item-meta">
                                    {formatFileSize(file.size)}
                                </div>
                            </div>
                            <button 
                                className="kpi-evidence-item-remove"
                                onClick={() => removeFile(file.id)}
                            >
                                <FiX size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default EvidenceUpload;