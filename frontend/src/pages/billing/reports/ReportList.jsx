import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BILLING_ROUTES } from '../../../config/constants/billingRoutesConstants';
import { PlusIcon, DocumentTextIcon, ClockIcon, TrashIcon, PencilIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import ConfirmDialog from '../../../components/common/ConfirmDialog';

const mockSavedReports = [
    { id: '1', name: 'Monthly Invoice Summary', type: 'invoices', schedule: 'Monthly', last_run: '2024-06-01', format: 'PDF' },
    { id: '2', name: 'Payment Reconciliation', type: 'payments', schedule: 'Weekly', last_run: '2024-06-09', format: 'Excel' },
    { id: '3', name: 'Usage Analytics Q2', type: 'usage', schedule: 'Quarterly', last_run: '2024-04-01', format: 'CSV' },
];
const ReportList = () => {
    const navigate = useNavigate();
    const [reports, setReports] = useState(mockSavedReports);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const handleDelete = () => {
        if (deleteTarget) {
            setReports(reports.filter(r => r.id !== deleteTarget));
            setShowDeleteConfirm(false);
            setDeleteTarget(null);
        }
    };
    const handleRunReport = (reportId) => {
        console.log('Running report:', reportId);
    };
    const formatDate = (dateString) => {
        if (!dateString) return 'Never';
        return new Date(dateString).toLocaleDateString();
    };
    const getReportTypeLabel = (type) => {
        const labels = { invoices: 'Invoice Report', payments: 'Payment Report', usage: 'Usage Report' };
        return labels[type] || type;
    };
    
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
                    <p className="text-gray-500 mt-1">View and manage saved reports</p>
                </div>
                <button
                    onClick={() => navigate(BILLING_ROUTES.INVOICE_REPORT)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                    <PlusIcon className="w-5 h-5" />
                    New Report
                </button>
            </div>
            <div className="flex gap-4 border-b border-gray-200">
                <button className="pb-3 px-1 text-sm font-medium text-primary-600 border-b-2 border-primary-600">
                    Saved Reports
                </button>
                <button className="pb-3 px-1 text-sm font-medium text-gray-500 hover:text-gray-700">
                    Scheduled Reports
                </button>
                <button className="pb-3 px-1 text-sm font-medium text-gray-500 hover:text-gray-700">
                    Export History
                </button>
            </div>
            {reports.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                    <DocumentTextIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Saved Reports</h3>
                    <p className="text-gray-500 mb-4">Create your first report to get started.</p>
                    <button
                        onClick={() => navigate(BILLING_ROUTES.INVOICE_REPORT)}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                    >
                        Create Report
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    {reports.map((report) => (
                        <div key={report.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                        <DocumentTextIcon className="w-5 h-5 text-primary-600" />
                                        <h3 className="font-semibold text-gray-900">{report.name}</h3>
                                        <span className="px-2 py-0.5 bg-gray-100 text-xs text-gray-600 rounded-full">
                                            {getReportTypeLabel(report.type)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <ClockIcon className="w-4 h-4" />
                                            {report.schedule}
                                        </span>
                                        <span>Last run: {formatDate(report.last_run)}</span>
                                        <span>Format: {report.format}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleRunReport(report.id)}
                                        className="p-2 text-gray-400 hover:text-primary-600"
                                        title="Run Now"
                                    >
                                        <ArrowPathIcon className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => navigate(`/app/billing/reports/${report.id}/edit`)}
                                        className="p-2 text-gray-400 hover:text-gray-600"
                                        title="Edit"
                                    >
                                        <PencilIcon className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => {
                                            setDeleteTarget(report.id);
                                            setShowDeleteConfirm(true);
                                        }}
                                        className="p-2 text-gray-400 hover:text-red-600"
                                        title="Delete"
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            <ConfirmDialog
                isOpen={showDeleteConfirm}
                onClose={() => {
                    setShowDeleteConfirm(false);
                    setDeleteTarget(null);
                }}
                onConfirm={handleDelete}
                title="Delete Report"
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
            >
                <p className="text-gray-600">
                    Are you sure you want to delete this report? This action cannot be undone.
                </p>
            </ConfirmDialog>
        </div>
    );
};
export default ReportList;