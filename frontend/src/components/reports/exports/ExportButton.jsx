// frontend/src/components/reports/exports/ExportButton.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FiDownload, FiLoader } from 'react-icons/fi';
import { useExports } from '../../../hooks/reports';
import './exports.css';

export const ExportButton = ({
    reportId,
    format = 'pdf',
    label = 'Export',
    onSuccess,
    onError,
    className = '',
}) => {
    const [exporting, setExporting] = useState(false);
    const { create } = useExports({ autoFetch: false });

    const handleExport = async () => {
        if (!reportId || exporting) return;

        setExporting(true);
        try {
            const result = await create({
                report_id: reportId,
                format,
                params: {},
                password: '',
                encrypt: false,
            });

            if (result?.export_id) {
                onSuccess?.(result);
            } else {
                onError?.(new Error('Export failed: No export ID returned'));
            }
        } catch (err) {
            onError?.(err);
        } finally {
            setExporting(false);
        }
    };

    return (
        <button
            className={`export-button ${className}`}
            onClick={handleExport}
            disabled={exporting}
        >
            {exporting ? (
                <>
                    <FiLoader size={16} className="spinning" />
                    Exporting...
                </>
            ) : (
                <>
                    <FiDownload size={16} />
                    {label}
                </>
            )}
        </button>
    );
};

ExportButton.propTypes = {
    reportId: PropTypes.string.isRequired,
    format: PropTypes.oneOf(['pdf', 'excel', 'csv', 'json', 'pptx', 'html', 'xml']),
    label: PropTypes.string,
    onSuccess: PropTypes.func,
    onError: PropTypes.func,
    className: PropTypes.string,
};