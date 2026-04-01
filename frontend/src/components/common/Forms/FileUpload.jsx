import React, { useState, useRef, useCallback } from 'react';
import { FiUpload, FiX, FiFile, FiImage, FiCheck, FiAlertCircle } from 'react-icons/fi';

const FileUpload = ({
    name,
    label,
    value,
    onChange,
    onBlur,
    error,
    touched,
    required = false,
    disabled = false,
    multiple = false,
    accept = '*/*',
    maxSize = 5 * 1024 * 1024, // 5MB
    maxFiles = 10,
    showPreview = true,
    showProgress = true,
    className = '',
    ...props
}) => {
    const [files, setFiles] = useState(value || (multiple ? [] : null));
    const [previews, setPreviews] = useState([]);
    const [uploadProgress, setUploadProgress] = useState({});
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);
    const hasError = error && touched;
    // Generate file preview URL
    const createPreview = useCallback((file) => {
        if (file.type.startsWith('image/')) {
            return URL.createObjectURL(file);
        }
        return null;
    }, []);
    // Validate file
    const validateFile = useCallback((file) => {
        const errors = [];
        // Check file size
        if (file.size > maxSize) {
            errors.push(`File size exceeds ${maxSize / 1024 / 1024}MB limit`);
        }
        // Check file type
        if (accept !== '*/*') {
            const acceptedTypes = accept.split(',').map(t => t.trim());
            const fileType = file.type;
            const fileExt = '.' + file.name.split('.').pop();
            const isAccepted = acceptedTypes.some(type => {
                if (type === fileType) return true;
                if (type === fileExt) return true;
                if (type === 'image/*' && fileType.startsWith('image/')) return true;
                return false;
            });
            if (!isAccepted) {
                errors.push(`File type not accepted. Allowed: ${accept}`);
            }
        }
        return errors;
    }, [maxSize, accept]);
    // Handle file selection
    const handleFileSelect = useCallback((selectedFiles) => {
        const fileList = Array.from(selectedFiles);
        const validFiles = [];
        const errors = []; 
        // Check max files limit
        if (multiple && files && files.length + fileList.length > maxFiles) {
            errors.push(`Cannot upload more than ${maxFiles} files`);
            return;
        }
        fileList.forEach(file => {
            const fileErrors = validateFile(file);
            if (fileErrors.length > 0) {
                errors.push(`${file.name}: ${fileErrors.join(', ')}`);
            } else {
                validFiles.push(file);
            }
        });
        if (errors.length > 0) {
            // Show errors via callback
            console.error('File upload errors:', errors);
            return;
        }
        let newFiles;
        if (multiple) {
            newFiles = [...(files || []), ...validFiles];
        } else {
            newFiles = validFiles[0] || null;
        }
        setFiles(newFiles);
        // Generate previews
        const newPreviews = validFiles.map(file => ({
            id: Date.now() + Math.random(),
            file,
            preview: createPreview(file),
            progress: 0
        }));
        if (multiple) {
            setPreviews(prev => [...prev, ...newPreviews]);
        } else {
            // Clean up old preview URL
            if (previews[0]?.preview) {
                URL.revokeObjectURL(previews[0].preview);
            }
            setPreviews(newPreviews);
        }
        // Simulate upload progress
        if (showProgress) {
            newPreviews.forEach((preview, index) => {
                let progress = 0;
                const interval = setInterval(() => {
                    progress += 10;
                    setUploadProgress(prev => ({
                        ...prev,
                        [preview.id]: progress
                    }));
                    
                    if (progress >= 100) {
                        clearInterval(interval);
                    }
                }, 100);
            });
        }
        // Call onChange with files
        if (onChange) {
            onChange({ target: { name, value: newFiles, files: newFiles } });
        }
    }, [files, multiple, maxFiles, validateFile, createPreview, showProgress, name, onChange]);
    // Handle file removal
    const handleRemoveFile = useCallback((fileId) => {
        if (multiple) {
            const index = previews.findIndex(p => p.id === fileId);
            if (index !== -1) {
                // Revoke preview URL
                if (previews[index].preview) {
                    URL.revokeObjectURL(previews[index].preview);
                }
                const newFiles = [...files];
                newFiles.splice(index, 1);
                setFiles(newFiles);
                const newPreviews = [...previews];
                newPreviews.splice(index, 1);
                setPreviews(newPreviews);
                
                if (onChange) {
                    onChange({ target: { name, value: newFiles, files: newFiles } });
                }
            }
        } else {
            // Revoke preview URL
            if (previews[0]?.preview) {
                URL.revokeObjectURL(previews[0].preview);
            }
            setFiles(null);
            setPreviews([]);
            if (onChange) {
                onChange({ target: { name, value: null, files: null } });
            }
        }
    }, [files, previews, multiple, name, onChange]);
    // Handle drag events
    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }, []);
    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        const droppedFiles = e.dataTransfer.files;
        if (droppedFiles && droppedFiles.length > 0) {
            handleFileSelect(droppedFiles);
        }
    }, [handleFileSelect]);
    const handleClick = () => {
        if (!disabled && fileInputRef.current) {
            fileInputRef.current.click();
        }
    };
    // Get file icon based on type
    const getFileIcon = (file) => {
        if (file.type.startsWith('image/')) {
            return <FiImage size={20} />;
        }
        return <FiFile size={20} />;
    };
    // Format file size
    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };
    return (
        <div className={`file-upload ${className}`}>
            {label && (
                <label className="form-label">
                    {label}
                    {required && <span className="required-mark">*</span>}
                </label>
            )}
            <div
                className={`dropzone ${dragActive ? 'drag-active' : ''} ${disabled ? 'disabled' : ''} ${hasError ? 'is-invalid' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={handleClick}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    name={name}
                    accept={accept}
                    multiple={multiple}
                    disabled={disabled}
                    onChange={(e) => handleFileSelect(e.target.files)}
                    style={{ display: 'none' }}
                    {...props}
                />   
                <div className="dropzone-content">
                    <FiUpload size={32} />
                    <p className="dropzone-text">
                        Drag and drop files here, or click to select
                    </p>
                    <p className="dropzone-hint">
                        Maximum file size: {maxSize / 1024 / 1024}MB
                        {accept !== '*/*' && ` · Allowed: ${accept}`}
                        {multiple && ` · Max files: ${maxFiles}`}
                    </p>
                </div>
            </div>
            {hasError && (
                <div className="input-feedback error">
                    <FiAlertCircle size={14} />
                    <span>{error}</span>
                </div>
            )}
            {/* File Previews */}
            {showPreview && previews.length > 0 && (
                <div className="file-previews">
                    {previews.map((preview) => (
                        <div key={preview.id} className="file-preview">
                            <div className="file-preview-icon">
                                {preview.preview ? (
                                    <img 
                                        src={preview.preview} 
                                        alt={preview.file.name}
                                        className="preview-image"
                                    />
                                ) : (
                                    getFileIcon(preview.file)
                                )}
                            </div> 
                            <div className="file-preview-info">
                                <div className="file-name">{preview.file.name}</div>
                                <div className="file-size">{formatFileSize(preview.file.size)}</div>
                                {showProgress && uploadProgress[preview.id] !== undefined && (
                                    <div className="file-progress">
                                        <div 
                                            className="file-progress-bar"
                                            style={{ width: `${uploadProgress[preview.id]}%` }}
                                        />
                                        <span className="file-progress-text">
                                            {uploadProgress[preview.id]}%
                                        </span>
                                    </div>
                                )}
                            </div>
                            
                            <button
                                type="button"
                                className="file-remove"
                                onClick={() => handleRemoveFile(preview.id)}
                                disabled={disabled}
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

export { FileUpload };