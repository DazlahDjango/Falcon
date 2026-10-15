// frontend/src/pages/reports/PresetsPage.jsx
import React, { useState, useCallback } from 'react';
import { FiPlus, FiRefreshCw } from 'react-icons/fi';
import { MdOutlineBookmarkBorder } from 'react-icons/md';
import { usePresets } from '../../hooks/reports';
import {
    PresetTable,
    PresetSaveModal,
} from '../../components/reports/presets';
import {
    ReportSearchBar,
    ReportPagination,
    ReportEmptyState,
    ReportLoading,
    ReportError,
    ReportConfirmDialog,
} from '../../components/reports/common';
import './reports.css';

export const PresetsPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPreset, setEditingPreset] = useState(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [presetToDelete, setPresetToDelete] = useState(null);

    const {
        presets,
        loading,
        error,
        pageNum,
        pageSizeNum,
        total,
        totalPages,
        fetchPresets,
        deletePreset,
        setPage,
        setPageSize,
        clearErrors,
    } = usePresets({ autoFetch: true });

    const handleSearch = useCallback((val) => {
        setSearchTerm(val);
    }, []);

    const filteredPresets = presets.filter((p) => {
        if (!searchTerm) return true;
        const q = searchTerm.toLowerCase();
        return (
            p.name?.toLowerCase().includes(q) ||
            p.description?.toLowerCase().includes(q)
        );
    });

    const handleCreateNew = () => {
        setEditingPreset(null);
        setIsModalOpen(true);
    };

    const handleEdit = (preset) => {
        setEditingPreset(preset);
        setIsModalOpen(true);
    };

    const handleDelete = (preset) => {
        setPresetToDelete(preset);
        setDeleteConfirmOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (presetToDelete?.id) {
            await deletePreset(presetToDelete.id);
            setDeleteConfirmOpen(false);
            setPresetToDelete(null);
            fetchPresets();
        }
    };

    if (loading && !presets.length) {
        return <ReportLoading variant="skeleton" text="Loading filter presets..." />;
    }

    if (error) {
        return (
            <ReportError
                error={error}
                onRetry={() => {
                    clearErrors();
                    fetchPresets();
                }}
                title="Failed to load filter presets"
            />
        );
    }

    return (
        <div className="presets-page" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="page-title" style={{ margin: 0 }}>Report Presets</h1>
                    <p style={{ color: '#64748b', margin: '4px 0 0' }}>
                        Manage saved filter views and parameter configurations across reports.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button className="btn btn-outline" onClick={() => fetchPresets()} title="Refresh">
                        <FiRefreshCw size={16} />
                    </button>
                    <button className="btn btn-primary" onClick={handleCreateNew}>
                        <FiPlus size={18} />
                        New Preset
                    </button>
                </div>
            </div>

            <div style={{ maxWidth: 400 }}>
                <ReportSearchBar
                    value={searchTerm}
                    onChange={handleSearch}
                    placeholder="Search preset by name or description..."
                />
            </div>

            {filteredPresets.length === 0 ? (
                <ReportEmptyState
                    title="No Presets Found"
                    description="Save filter presets directly from any report view or create one here."
                    icon={<MdOutlineBookmarkBorder size={48} />}
                    actionText="Create Filter Preset"
                    onAction={handleCreateNew}
                />
            ) : (
                <PresetTable
                    presets={filteredPresets}
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

            <PresetSaveModal
                isOpen={isModalOpen}
                initialData={editingPreset}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingPreset(null);
                }}
                onSuccess={() => fetchPresets()}
            />

            <ReportConfirmDialog
                isOpen={deleteConfirmOpen}
                title="Delete Preset"
                message={`Are you sure you want to delete the filter preset "${presetToDelete?.name}"?`}
                confirmText="Delete"
                confirmVariant="danger"
                onConfirm={handleConfirmDelete}
                onCancel={() => {
                    setDeleteConfirmOpen(false);
                    setPresetToDelete(null);
                }}
            />
        </div>
    );
};

export default PresetsPage;
