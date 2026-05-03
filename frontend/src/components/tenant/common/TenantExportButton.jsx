// frontend/src/components/tenant/common/TenantExportButton.jsx
import React, { useState } from 'react';

export const TenantExportButton = ({ onExport, isLoading: externalLoading, formats = ['csv', 'json', 'xlsx'] }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleExport = async (format) => {
        setIsLoading(true);
        setError(null);

        try {
            await onExport(format);
        } catch (err) {
            setError(err.message || 'Export failed');
        } finally {
            setIsLoading(false);
            setIsOpen(false);
        }
    };

    const loading = externalLoading || isLoading;

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={loading}
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50"
            >
                {loading ? (
                    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                ) : (
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                )}
                <span className="text-sm">Export</span>
                <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    {formats.map(format => (
                        <button
                            key={format}
                            onClick={() => handleExport(format)}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                            {format.toUpperCase()}
                        </button>
                    ))}
                </div>
            )}

            {error && (
                <div className="absolute right-0 mt-1 w-48 bg-red-50 border border-red-200 rounded-lg p-2 text-xs text-red-600">
                    {error}
                </div>
            )}
        </div>
    );
};