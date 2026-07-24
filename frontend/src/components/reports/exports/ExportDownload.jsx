// frontend/src/components/reports/exports/ExportDownload.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FiDownload, FiLoader, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { useExports } from '../../../hooks/reports';
import './exports.css';

export const ExportDownload = ({
    exportId,
    filePath,
    fileName,
    variant = 'button',
    size = 'medium',
    onDownloadStart,
    onDownloadComplete,
    className = '',
}) => {
    const [downloading, setDownloading] = useState(false);
    const [downloadComplete, setDownloadComplete] = useState(false);
    const [error, setError] = useState(null);

    const { downloadExport } = useExports({ autoFetch: false });

    const handleDownload = async (e) => {
        e?.stopPropagation();

        if (downloading) return;

        if (!exportId) {
            setError('Export ID is required');
            return;
        }

        setDownloading(true);
        setError(null);
        onDownloadStart?.();

        try {
            const response = await downloadExport(exportId);

            if (response.data) {
                const blob = new Blob([response.data], {
                    type: response.headers?.['content-type'] || 'application/octet-stream',
                });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                const filename = fileName || `export_${exportId}.${response.headers?.['content-type']?.split('/')[1] || 'bin'}`;
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);

                setDownloadComplete(true);
                onDownloadComplete?.();
                setTimeout(() => setDownloadComplete(false), 3000);
            }
        } catch (err) {
            setError(err.message || 'Download failed');
        } finally {
            setDownloading(false);
        }
    };

    const getVariantClasses = () => {
        if (variant === 'button') {
            return 'download-btn download-btn-primary';
        }
        if (variant === 'icon') {
            return 'download-btn-icon';
        }
        if (variant === 'full') {
            return 'download-btn download-btn-full';
        }
        return 'download-btn download-btn-secondary';
    };

    const getSizeClasses = () => {
        const sizes = {
            small: 'btn-sm',
            medium: '',
            large: 'btn-lg',
        };
        return sizes[size] || '';
    };

    if (variant === 'icon') {
        return (
            <button
                className={`download-btn-icon ${className}`}
                onClick={handleDownload}
                disabled={downloading}
                title="Download Export"
            >
                {downloading ? (
                    <FiLoader size={16} className="spinning" />
                ) : downloadComplete ? (
                    <FiCheckCircle size={16} color="#10b981" />
                ) : error ? (
                    <FiXCircle size={16} color="#ef4444" />
                ) : (
                    <FiDownload size={16} />
                )}
            </button>
        );
    }

    return (
        <button
            className={`${getVariantClasses()} ${getSizeClasses()} ${className}`}
            onClick={handleDownload}
            disabled={downloading}
        >
            {downloading ? (
                <>
                    <FiLoader size={16} className="spinning" />
                    Downloading...
                </>
            ) : downloadComplete ? (
                <>
                    <FiCheckCircle size={16} />
                    Downloaded!
                </>
            ) : error ? (
                <>
                    <FiXCircle size={16} />
                    Retry
                </>
            ) : (
                <>
                    <FiDownload size={16} />
                    Download
                </>
            )}
        </button>
    );
};

ExportDownload.propTypes = {
    exportId: PropTypes.string.isRequired,
    filePath: PropTypes.string,
    fileName: PropTypes.string,
    variant: PropTypes.oneOf(['button', 'icon', 'full']),
    size: PropTypes.oneOf(['small', 'medium', 'large']),
    onDownloadStart: PropTypes.func,
    onDownloadComplete: PropTypes.func,
    className: PropTypes.string,
};