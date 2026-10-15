// frontend/src/pages/reports/DistributionsPage.jsx
import React, { useState, useCallback } from 'react';
import { FiPlus, FiRefreshCw } from 'react-icons/fi';
import { MdOutlineMail } from 'react-icons/md';
import { useDistributions } from '../../hooks/reports';
import {
    DistributionTable,
    DistributionListModal,
} from '../../components/reports/distributions';
import {
    ReportSearchBar,
    ReportPagination,
    ReportEmptyState,
    ReportLoading,
    ReportError,
    ReportConfirmDialog,
} from '../../components/reports/common';
import './reports.css';

export const DistributionsPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDist, setEditingDist] = useState(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [distToDelete, setDistToDelete] = useState(null);

    const {
        distributions,
        loading,
        error,
        pageNum,
        pageSizeNum,
        total,
        totalPages,
        fetchDistributions,
        deleteDistribution,
        setPage,
        setPageSize,
        clearErrors,
    } = useDistributions({ autoFetch: true });

    const handleSearch = useCallback((val) => {
        setSearchTerm(val);
    }, []);

    const filteredDistributions = distributions.filter((d) => {
        if (!searchTerm) return true;
        const q = searchTerm.toLowerCase();
        return (
            d.name?.toLowerCase().includes(q) ||
            d.description?.toLowerCase().includes(q) ||
            d.recipients?.some((r) => r.toLowerCase().includes(q))
        );
    });

    const handleCreateNew = () => {
        setEditingDist(null);
        setIsModalOpen(true);
    };

    const handleEdit = (dist) => {
        setEditingDist(dist);
        setIsModalOpen(true);
    };

    const handleDelete = (dist) => {
        setDistToDelete(dist);
        setDeleteConfirmOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (distToDelete?.id) {
            await deleteDistribution(distToDelete.id);
            setDeleteConfirmOpen(false);
            setDistToDelete(null);
            fetchDistributions();
        }
    };

    if (loading && !distributions.length) {
        return <ReportLoading variant="skeleton" text="Loading distribution lists..." />;
    }

    if (error) {
        return (
            <ReportError
                error={error}
                onRetry={() => {
                    clearErrors();
                    fetchDistributions();
                }}
                title="Failed to load distribution lists"
            />
        );
    }

    return (
        <div className="distributions-page" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="page-title" style={{ margin: 0 }}>Distribution Lists</h1>
                    <p style={{ color: '#64748b', margin: '4px 0 0' }}>
                        Manage saved groups of stakeholders and email targets for automated reporting.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button className="btn btn-outline" onClick={() => fetchDistributions()} title="Refresh">
                        <FiRefreshCw size={16} />
                    </button>
                    <button className="btn btn-primary" onClick={handleCreateNew}>
                        <FiPlus size={18} />
                        New Distribution List
                    </button>
                </div>
            </div>

            <div style={{ maxWidth: 400 }}>
                <ReportSearchBar
                    value={searchTerm}
                    onChange={handleSearch}
                    placeholder="Search by name, email, or notes..."
                />
            </div>

            {filteredDistributions.length === 0 ? (
                <ReportEmptyState
                    title="No Distribution Lists"
                    description="Create distribution lists to group recipients for report deliveries and schedules."
                    icon={<MdOutlineMail size={48} />}
                    actionText="Create Distribution List"
                    onAction={handleCreateNew}
                />
            ) : (
                <DistributionTable
                    distributions={filteredDistributions}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            )}

            {totalPages > 1 && (
                <ReportPagination
                    currentPage={pageNum}
                    totalPages={totalPages}
                    pageSize={pageSizeNum}
                    totalItems={total}
                    onPageChange={(p) => setPage(p)}
                    onPageSizeChange={(s) => setPageSize(s)}
                />
            )}

            <DistributionListModal
                isOpen={isModalOpen}
                initialData={editingDist}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingDist(null);
                }}
                onSuccess={() => fetchDistributions()}
            />

            <ReportConfirmDialog
                isOpen={deleteConfirmOpen}
                title="Delete Distribution List"
                message={`Are you sure you want to delete the distribution list "${distToDelete?.name}"?`}
                confirmText="Delete"
                confirmVariant="danger"
                onConfirm={handleConfirmDelete}
                onCancel={() => {
                    setDeleteConfirmOpen(false);
                    setDistToDelete(null);
                }}
            />
        </div>
    );
};

export default DistributionsPage;
