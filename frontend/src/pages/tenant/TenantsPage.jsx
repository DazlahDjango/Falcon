// frontend/src/pages/tenant/TenantsPage.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    TenantListTable,
    TenantCard,
    TenantSearchBar,
    TenantPagination,
    TenantFilterDrawer,
    TenantSortDropdown,
    TenantExportButton,
    TenantEmptyState,
    TenantErrorAlert,
    TenantLoadingSkeleton,
    ConfirmationModal,
} from '../../components/tenant/common';
import { TenantCreateButton } from '../../components/tenant/tenant';
import {
    fetchTenants,
    deleteTenant,
    suspendTenant,
    activateTenant,
    setPage,
    setPageSize,
    setFilters,
    clearFilters,
    selectTenants,
    selectTenantLoading,
    selectTenantError,
    selectTenantTotal,
    selectTenantPage,
    selectTenantPageSize,
    selectTenantFilters,
    openModal,
    closeModal,
    selectModalState,
    selectActionLoading,
} from '../../store/tenant';

export const TenantsPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const tenants = useSelector(selectTenants);
    const loading = useSelector(selectTenantLoading);
    const error = useSelector(selectTenantError);
    const total = useSelector(selectTenantTotal);
    const page = useSelector(selectTenantPage);
    const pageSize = useSelector(selectTenantPageSize);
    const filters = useSelector(selectTenantFilters);

    const deleteModalOpen = useSelector((state) => selectModalState(state, 'deleteTenant'));
    const suspendModalOpen = useSelector((state) => selectModalState(state, 'suspendTenant'));
    const activateModalOpen = useSelector((state) => selectModalState(state, 'activateTenant'));
    const actionLoading = useSelector((state) => selectActionLoading(state, 'delete'));

    const [selectedTenant, setSelectedTenant] = useState(null);
    const [viewMode, setViewMode] = useState('table'); // table or card
    const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

    useEffect(() => {
        dispatch(fetchTenants({ page, page_size: pageSize, ...filters }));
    }, [dispatch, page, pageSize, filters]);

    const handleViewTenant = (id) => {
        navigate(`/tenants/${id}`);
    };

    const handleEditTenant = (id) => {
        navigate(`/tenants/${id}/edit`);
    };

    const handleDeleteClick = (tenant) => {
        setSelectedTenant(tenant);
        dispatch(openModal({ modalName: 'deleteTenant', data: { id: tenant.id } }));
    };

    const handleConfirmDelete = async () => {
        if (selectedTenant) {
            await dispatch(deleteTenant(selectedTenant.id));
            dispatch(closeModal('deleteTenant'));
            setSelectedTenant(null);
        }
    };

    const handleSuspendClick = (tenant) => {
        setSelectedTenant(tenant);
        dispatch(openModal({ modalName: 'suspendTenant', data: { id: tenant.id } }));
    };

    const handleConfirmSuspend = async () => {
        if (selectedTenant) {
            await dispatch(suspendTenant({ id: selectedTenant.id, reason: '' }));
            dispatch(closeModal('suspendTenant'));
            setSelectedTenant(null);
        }
    };

    const handleActivateClick = (tenant) => {
        setSelectedTenant(tenant);
        dispatch(openModal({ modalName: 'activateTenant', data: { id: tenant.id } }));
    };

    const handleConfirmActivate = async () => {
        if (selectedTenant) {
            await dispatch(activateTenant(selectedTenant.id));
            dispatch(closeModal('activateTenant'));
            setSelectedTenant(null);
        }
    };

    const handleSearch = (searchTerm) => {
        dispatch(setFilters({ search: searchTerm }));
    };

    const handlePageChange = (newPage) => {
        dispatch(setPage(newPage));
    };

    const handlePageSizeChange = (newSize) => {
        dispatch(setPageSize(newSize));
    };

    const handleSortChange = (sortValue) => {
        dispatch(setFilters({ ordering: sortValue }));
    };

    const handleExport = async (format) => {
        // Implement export
        console.log('Exporting to', format);
    };

    const handleCreateClick = () => {
        navigate('/tenants/create');
    };

    if (loading && tenants.length === 0) {
        return <TenantLoadingSkeleton type="table" count={5} />;
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Tenants</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage all tenant organizations</p>
                </div>
                <TenantCreateButton onClick={handleCreateClick} />
            </div>

            <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                <div className="flex-1 max-w-md">
                    <TenantSearchBar onSearch={handleSearch} />
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setViewMode('table')}
                        className={`p-2 rounded ${viewMode === 'table' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'}`}
                    >
                        📋
                    </button>
                    <button
                        onClick={() => setViewMode('card')}
                        className={`p-2 rounded ${viewMode === 'card' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'}`}
                    >
                        🃏
                    </button>
                    <TenantSortDropdown currentSort={filters.ordering} onSortChange={handleSortChange} />
                    <button
                        onClick={() => setFilterDrawerOpen(true)}
                        className="px-3 py-2 border rounded-lg bg-white hover:bg-gray-50"
                    >
                        🔍 Filters
                    </button>
                    <TenantExportButton onExport={handleExport} />
                </div>
            </div>

            {error && <TenantErrorAlert error={error} onRetry={() => dispatch(fetchTenants({ page, page_size: pageSize, ...filters }))} />}

            {viewMode === 'table' ? (
                <TenantListTable
                    tenants={tenants}
                    onView={handleViewTenant}
                    onEdit={handleEditTenant}
                    onDelete={handleDeleteClick}
                    onSuspend={handleSuspendClick}
                    onActivate={handleActivateClick}
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tenants.map((tenant) => (
                        <TenantCard
                            key={tenant.id}
                            tenant={tenant}
                            onClick={handleViewTenant}
                            onEdit={handleEditTenant}
                            onDelete={handleDeleteClick}
                        />
                    ))}
                </div>
            )}

            {tenants.length === 0 && !loading && (
                <TenantEmptyState
                    title="No tenants found"
                    message="Get started by creating your first tenant."
                    actionText="Create Tenant"
                    onAction={handleCreateClick}
                />
            )}

            {tenants.length > 0 && (
                <TenantPagination
                    page={page}
                    totalPages={Math.ceil(total / pageSize)}
                    onPageChange={handlePageChange}
                    pageSize={pageSize}
                    onPageSizeChange={handlePageSizeChange}
                    total={total}
                />
            )}

            <TenantFilterDrawer
                isOpen={filterDrawerOpen}
                onClose={() => setFilterDrawerOpen(false)}
                filters={filters}
                onApply={(newFilters) => {
                    dispatch(setFilters(newFilters));
                    setFilterDrawerOpen(false);
                }}
                onReset={() => {
                    dispatch(clearFilters());
                    setFilterDrawerOpen(false);
                }}
            />

            <ConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => dispatch(closeModal('deleteTenant'))}
                onConfirm={handleConfirmDelete}
                title="Delete Tenant"
                message={`Are you sure you want to delete ${selectedTenant?.name}? This action cannot be undone.`}
                confirmText="Delete"
                type="danger"
                isLoading={actionLoading}
            />

            <ConfirmationModal
                isOpen={suspendModalOpen}
                onClose={() => dispatch(closeModal('suspendTenant'))}
                onConfirm={handleConfirmSuspend}
                title="Suspend Tenant"
                message={`Are you sure you want to suspend ${selectedTenant?.name}?`}
                confirmText="Suspend"
                type="warning"
            />

            <ConfirmationModal
                isOpen={activateModalOpen}
                onClose={() => dispatch(closeModal('activateTenant'))}
                onConfirm={handleConfirmActivate}
                title="Activate Tenant"
                message={`Are you sure you want to activate ${selectedTenant?.name}?`}
                confirmText="Activate"
                type="success"
            />
        </div>
    );
};