// frontend/src/pages/tenant/TenantListPage.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { TenantCreateButton } from '../../components/tenant/tenant';
import {
    fetchTenants,
    deleteTenant,
    bulkDeleteTenants,
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
} from '../../store/tenant/slice';
import '../../components/tenant/tenant/tenant.css';

// Simple table component with checkbox selection support
const TenantTable = ({ 
    tenants, 
    onView, 
    onEdit, 
    onDelete, 
    onSuspend, 
    onActivate,
    selectedTenantIds = [],
    onSelectTenant,
    onSelectAllTenants 
}) => {
    const isAllSelected = tenants.length > 0 && selectedTenantIds.length === tenants.length;
    
    return (
        <table className="tenant-table">
            <thead>
                <tr>
                    <th className="tenant-table-checkbox-col">
                        <input
                            type="checkbox"
                            checked={isAllSelected}
                            onChange={(e) => onSelectAllTenants(e.target.checked)}
                            className="tenant-checkbox"
                        />
                    </th>
                    <th>Name</th>
                    <th>Slug</th>
                    <th>Plan</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {tenants.map((tenant) => (
                    <tr key={tenant.id} className={selectedTenantIds.includes(tenant.id) ? 'row-selected' : ''}>
                        <td className="tenant-table-checkbox-col">
                            <input
                                type="checkbox"
                                checked={selectedTenantIds.includes(tenant.id)}
                                onChange={(e) => onSelectTenant(tenant.id, e.target.checked)}
                                className="tenant-checkbox"
                            />
                        </td>
                        <td>{tenant.name}</td>
                        <td><code>{tenant.slug}</code></td>
                        <td className="capitalize">{tenant.subscription_plan}</td>
                        <td>
                            <span className={`tenant-status-badge ${tenant.is_active ? 'active' : 'suspended'}`}>
                                {tenant.is_active ? 'Active' : 'Suspended'}
                            </span>
                        </td>
                        <td>{new Date(tenant.created_at).toLocaleDateString()}</td>
                        <td>
                            <button onClick={() => onView(tenant.id)} className="tenant-action-icon" title="View">👁️</button>
                            <button onClick={() => onEdit(tenant.id)} className="tenant-action-icon" title="Edit">✏️</button>
                            {tenant.is_active ? (
                                <button onClick={() => onSuspend(tenant)} className="tenant-action-icon" title="Suspend">⏸️</button>
                            ) : (
                                <button onClick={() => onActivate(tenant)} className="tenant-action-icon" title="Activate">▶️</button>
                            )}
                            <button onClick={() => onDelete(tenant)} className="tenant-action-icon" title="Delete">🗑️</button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

// Pagination component
const Pagination = ({ page, totalPages, onPageChange, pageSize, onPageSizeChange, total }) => {
    return (
        <div className="tenant-pagination">
            <div className="tenant-pagination-info">
                Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, total)} of {total} tenants
            </div>
            <div className="tenant-pagination-controls">
                <select value={pageSize} onChange={(e) => onPageSizeChange(Number(e.target.value))}>
                    <option value={10}>10 per page</option>
                    <option value={20}>20 per page</option>
                    <option value={50}>50 per page</option>
                    <option value={100}>100 per page</option>
                </select>
                <button onClick={() => onPageChange(page - 1)} disabled={page === 1}>Previous</button>
                <span>Page {page} of {totalPages}</span>
                <button onClick={() => onPageChange(page + 1)} disabled={page === totalPages}>Next</button>
            </div>
        </div>
    );
};

export const TenantListPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const tenants = useSelector(selectTenants);
    const loading = useSelector(selectTenantLoading);
    const error = useSelector(selectTenantError);
    const total = useSelector(selectTenantTotal);
    const page = useSelector(selectTenantPage);
    const pageSize = useSelector(selectTenantPageSize);
    const filters = useSelector(selectTenantFilters);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTenant, setSelectedTenant] = useState(null);
    const [selectedTenantIds, setSelectedTenantIds] = useState([]);

    const deleteModalOpen = useSelector((state) => selectModalState(state, 'deleteTenant'));
    const bulkDeleteModalOpen = useSelector((state) => selectModalState(state, 'bulkDeleteTenants'));
    const suspendModalOpen = useSelector((state) => selectModalState(state, 'suspendTenant'));
    const activateModalOpen = useSelector((state) => selectModalState(state, 'activateTenant'));

    useEffect(() => {
        dispatch(fetchTenants({ page, page_size: pageSize, ...filters }));
    }, [dispatch, page, pageSize, filters]);

    // Clear selection when filters or pagination changes
    useEffect(() => {
        setSelectedTenantIds([]);
    }, [page, pageSize, filters]);

    const handleSearch = () => {
        dispatch(setFilters({ search: searchTerm }));
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

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

    const handleSelectTenant = (id, checked) => {
        setSelectedTenantIds(prev => 
            checked ? [...prev, id] : prev.filter(item => item !== id)
        );
    };

    const handleSelectAllTenants = (checked) => {
        setSelectedTenantIds(checked ? tenants.map(t => t.id) : []);
    };

    const handleConfirmBulkDelete = async () => {
        if (selectedTenantIds.length > 0) {
            await dispatch(bulkDeleteTenants(selectedTenantIds));
            dispatch(closeModal('bulkDeleteTenants'));
            setSelectedTenantIds([]);
        }
    };

    const handleSuspendClick = (tenant) => {
        setSelectedTenant(tenant);
        dispatch(openModal({ modalName: 'suspendTenant', data: { id: tenant.id } }));
    };

    const handleConfirmSuspend = async (reason) => {
        if (selectedTenant) {
            await dispatch(suspendTenant({ id: selectedTenant.id, reason }));
            dispatch(closeModal('suspendTenant'));
            setSelectedTenant(null);
        }
    };

    const handleConfirmActivate = async () => {
        if (selectedTenant) {
            await dispatch(activateTenant(selectedTenant.id));
            dispatch(closeModal('activateTenant'));
            setSelectedTenant(null);
        }
    };

    const handleActivateClick = (tenant) => {
        setSelectedTenant(tenant);
        dispatch(openModal({ modalName: 'activateTenant', data: { id: tenant.id } }));
    };

    const handleCreateClick = () => {
        navigate('/tenants/create');
    };

    if (loading && tenants.length === 0) {
        return <div className="tenant-loading">Loading tenants...</div>;
    }

    return (
        <div className="tenant-page-container">
            <div className="tenant-list-header">
                <div>
                    <h1 className="tenant-page-title">Tenants</h1>
                    <p className="tenant-page-subtitle">Manage all tenant organizations</p>
                </div>
                <TenantCreateButton onClick={handleCreateClick} text="Create Tenant" />
            </div>

            <div className="tenant-search-bar">
                <input
                    type="text"
                    placeholder="Search by name, slug, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={handleKeyPress}
                />
                <button onClick={handleSearch}>Search</button>
                {filters.search && (
                    <button onClick={() => dispatch(clearFilters())}>Clear</button>
                )}
            </div>

            {error && (
                <div className="tenant-error">
                    Error: {error}
                    <button onClick={() => dispatch(fetchTenants({ page, page_size: pageSize, ...filters }))}>Retry</button>
                </div>
            )}

            <TenantTable
                tenants={tenants}
                onView={handleViewTenant}
                onEdit={handleEditTenant}
                onDelete={handleDeleteClick}
                onSuspend={handleSuspendClick}
                onActivate={handleActivateClick}
                selectedTenantIds={selectedTenantIds}
                onSelectTenant={handleSelectTenant}
                onSelectAllTenants={handleSelectAllTenants}
            />

            {tenants.length === 0 && !loading && (
                <div className="tenant-empty-state">
                    <p>No tenants found</p>
                    <TenantCreateButton onClick={handleCreateClick} text="Create your first tenant" />
                </div>
            )}

            {tenants.length > 0 && (
                <Pagination
                    page={page}
                    totalPages={Math.ceil(total / pageSize)}
                    onPageChange={(newPage) => dispatch(setPage(newPage))}
                    pageSize={pageSize}
                    onPageSizeChange={(newSize) => dispatch(setPageSize(newSize))}
                    total={total}
                />
            )}

            {/* Floating Bulk Action Bar */}
            {selectedTenantIds.length > 0 && (
                <div className="tenant-bulk-action-bar">
                    <div className="tenant-bulk-info">
                        <span className="bulk-count-badge">{selectedTenantIds.length}</span>
                        <span>{selectedTenantIds.length === 1 ? 'tenant selected' : 'tenants selected'}</span>
                    </div>
                    <div className="tenant-bulk-actions">
                        <button 
                            onClick={() => dispatch(openModal({ modalName: 'bulkDeleteTenants' }))} 
                            className="tenant-btn tenant-btn-danger"
                        >
                            Delete Selected
                        </button>
                        <button 
                            onClick={() => setSelectedTenantIds([])} 
                            className="tenant-btn tenant-btn-secondary"
                        >
                            Deselect All
                        </button>
                    </div>
                </div>
            )}

            {/* Modals */}
            {deleteModalOpen && (
                <div className="tenant-modal-overlay">
                    <div className="tenant-modal">
                        <div className="tenant-modal-header">
                            <h3>Delete Tenant</h3>
                            <button onClick={() => dispatch(closeModal('deleteTenant'))}>×</button>
                        </div>
                        <div className="tenant-modal-body">
                            <p>Are you sure you want to delete <strong>{selectedTenant?.name}</strong>?</p>
                            <p className="text-red-600">This action cannot be undone.</p>
                        </div>
                        <div className="tenant-modal-footer">
                            <button onClick={() => dispatch(closeModal('deleteTenant'))} className="tenant-btn-secondary">Cancel</button>
                            <button onClick={handleConfirmDelete} className="tenant-btn-danger">Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {bulkDeleteModalOpen && (
                <div className="tenant-modal-overlay">
                    <div className="tenant-modal">
                        <div className="tenant-modal-header">
                            <h3>Bulk Delete Tenants</h3>
                            <button onClick={() => dispatch(closeModal('bulkDeleteTenants'))}>×</button>
                        </div>
                        <div className="tenant-modal-body">
                            <p>Are you sure you want to delete the <strong>{selectedTenantIds.length}</strong> selected tenants?</p>
                            <p className="text-red-600">This action will soft-delete all selected tenants.</p>
                        </div>
                        <div className="tenant-modal-footer">
                            <button onClick={() => dispatch(closeModal('bulkDeleteTenants'))} className="tenant-btn-secondary">Cancel</button>
                            <button onClick={handleConfirmBulkDelete} className="tenant-btn-danger">Delete Selected</button>
                        </div>
                    </div>
                </div>
            )}

            {suspendModalOpen && (
                <div className="tenant-modal-overlay">
                    <div className="tenant-modal">
                        <div className="tenant-modal-header">
                            <h3>Suspend Tenant</h3>
                            <button onClick={() => dispatch(closeModal('suspendTenant'))}>×</button>
                        </div>
                        <div className="tenant-modal-body">
                            <p>Are you sure you want to suspend <strong>{selectedTenant?.name}</strong>?</p>
                            <textarea
                                id="suspend-reason"
                                placeholder="Reason for suspension (optional)"
                                className="tenant-textarea"
                                rows="3"
                            />
                        </div>
                        <div className="tenant-modal-footer">
                            <button onClick={() => dispatch(closeModal('suspendTenant'))} className="tenant-btn-secondary">Cancel</button>
                            <button 
                                onClick={() => {
                                    const reason = document.getElementById('suspend-reason').value;
                                    handleConfirmSuspend(reason);
                                }} 
                                className="tenant-btn-warning"
                            >
                                Suspend
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {activateModalOpen && (
                <div className="tenant-modal-overlay">
                    <div className="tenant-modal">
                        <div className="tenant-modal-header">
                            <h3>Activate Tenant</h3>
                            <button onClick={() => dispatch(closeModal('activateTenant'))}>×</button>
                        </div>
                        <div className="tenant-modal-body">
                            <p>Are you sure you want to activate <strong>{selectedTenant?.name}</strong>?</p>
                        </div>
                        <div className="tenant-modal-footer">
                            <button onClick={() => dispatch(closeModal('activateTenant'))} className="tenant-btn-secondary">Cancel</button>
                            <button onClick={handleConfirmActivate} className="tenant-btn-success">Activate</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TenantListPage;