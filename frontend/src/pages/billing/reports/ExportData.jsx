import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BILLING_ROUTES } from '../../../config/constants/billingRoutesConstants';
import { ArrowLeftIcon, DocumentArrowDownIcon, DocumentTextIcon, TableCellsIcon, DocumentChartBarIcon } from '@heroicons/react/24/outline';

const ExportData = () => {
    const navigate = useNavigate();
    const [exportType, setExportType] = useState('invoices');
    const [dateRange, setDateRange] = useState({
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
    });
    const [format, setFormat] = useState('csv');
    const [isExporting, setIsExporting] = useState(false);
    const exportOptions = [
        { id: 'invoices', label: 'Invoices', icon: DocumentTextIcon, description: 'Export invoice data including amounts, dates, and status' },
        { id: 'payments', label: 'Payments', icon: TableCellsIcon, description: 'Export payment transactions and history' },
        { id: 'usage', label: 'Usage Analytics', icon: DocumentChartBarIcon, description: 'Export resource usage and consumption data' },
        { id: 'subscriptions', label: 'Subscriptions', icon: DocumentChartBarIcon, description: 'Export subscription details and history' },
    ];
    const formatOptions = [
        { id: 'csv', label: 'CSV', description: 'Comma-separated values for spreadsheet applications' },
        { id: 'excel', label: 'Excel', description: 'Microsoft Excel format with formatting' },
        { id: 'json', label: 'JSON', description: 'Structured data format for developers' },
        { id: 'pdf', label: 'PDF', description: 'Printable report format' },
    ];
    const handleExport = async () => {
        setIsExporting(true);
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsExporting(false);
        alert(`Exporting ${exportType} as ${format} for date range ${dateRange.startDate} to ${dateRange.endDate}`);
    };
    
    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => navigate(BILLING_ROUTES.REPORTS)}
                    className="text-gray-500 hover:text-gray-700"
                >
                    <ArrowLeftIcon className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Export Data</h1>
                    <p className="text-gray-500 mt-1">Export your billing data in various formats</p>
                </div>
            </div>
            <div className="space-y-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Data to Export</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {exportOptions.map((option) => {
                            const Icon = option.icon;
                            return (
                                <button
                                    key={option.id}
                                    onClick={() => setExportType(option.id)}
                                    className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                                        exportType === option.id
                                            ? 'border-primary-500 bg-primary-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <div className={`p-2 rounded-lg ${
                                        exportType === option.id ? 'bg-primary-100' : 'bg-gray-100'
                                    }`}>
                                        <Icon className={`w-5 h-5 ${
                                            exportType === option.id ? 'text-primary-600' : 'text-gray-500'
                                        }`} />
                                    </div>
                                    <div>
                                        <p className={`font-medium ${
                                            exportType === option.id ? 'text-primary-700' : 'text-gray-900'
                                        }`}>
                                            {option.label}
                                        </p>
                                        <p className="text-sm text-gray-500 mt-1">{option.description}</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Date Range</h2>
                    <div className="flex flex-wrap gap-4 items-center">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">From:</span>
                            <input
                                type="date"
                                value={dateRange.startDate}
                                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">To:</span>
                            <input
                                type="date"
                                value={dateRange.endDate}
                                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                            />
                        </div>
                        <button
                            onClick={() => {
                                const firstDay = new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];
                                const lastDay = new Date().toISOString().split('T')[0];
                                setDateRange({ startDate: firstDay, endDate: lastDay });
                            }}
                            className="text-sm text-primary-600 hover:text-primary-700"
                        >
                            This Year
                        </button>
                        <button
                            onClick={() => {
                                const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
                                const lastDay = new Date().toISOString().split('T')[0];
                                setDateRange({ startDate: firstDay, endDate: lastDay });
                            }}
                            className="text-sm text-primary-600 hover:text-primary-700"
                        >
                            This Month
                        </button>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Export Format</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {formatOptions.map((option) => (
                            <button
                                key={option.id}
                                onClick={() => setFormat(option.id)}
                                className={`p-3 rounded-xl border-2 text-center transition-all ${
                                    format === option.id
                                        ? 'border-primary-500 bg-primary-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                }`}
                            >
                                <p className={`font-medium ${
                                    format === option.id ? 'text-primary-700' : 'text-gray-900'
                                }`}>
                                    {option.label}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">{option.description}</p>
                            </button>
                        ))}
                    </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <p className="text-sm text-gray-600">
                        Estimated export size: ~2.5 MB
                    </p>
                </div>
                <div className="flex justify-end">
                    <button
                        onClick={handleExport}
                        disabled={isExporting}
                        className="px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
                    >
                        {isExporting ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Exporting...
                            </>
                        ) : (
                            <>
                                <DocumentArrowDownIcon className="w-5 h-5" />
                                Export Data
                            </>
                        )}
                    </button>
                </div>
                <div className="bg-blue-50 rounded-xl p-4">
                    <p className="text-sm text-blue-800">
                        📋 Exports are processed in the background. Large exports may take a few minutes to complete.
                        You will receive an email with a download link when your export is ready.
                    </p>
                </div>
            </div>
        </div>
    );
};
export default ExportData;