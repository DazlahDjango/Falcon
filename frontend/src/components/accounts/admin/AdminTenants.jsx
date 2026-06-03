// frontend/src/components/accounts/admin/AdminTenants.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FiPlus, FiSearch, FiEdit, FiTrash2, FiLock, FiUnlock,
    FiUsers, FiDatabase, FiRefreshCw, FiFilter, FiGlobe
} from 'react-icons/fi';
import { useAdmin } from '../../../store/accounts/hooks/useAdmin';
import ConfirmationDialog from '../../common/Feedback/ConfirmationDialog';
import Spinner from '../../common/UI/Spinner';

const AdminTenants = () => {
    const navigate = useNavigate();
    const {
        tenants,
        isLoading,
        error,
        loadTenants,
        removeTenant,
        suspendTenantAction,
        activateTenantAction,
        clearAdminError,
    } = useAdmin();

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTenant, setSelectedTenant] = useState(null);
    const [actionType, setActionType] = useState(null);

    const loadTenantsList = useCallback(() => {
        loadTenants({ search: searchTerm });
    }, [loadTenants, searchTerm]);

    useEffect(() => {
        loadTenantsList();
    }, [loadTenantsList]);

    const handleSearch = (e) => {
        e.preventDefault();
        loadTenantsList();
    };

    const handleDelete = async () => {
        if (selectedTenant) {
            await removeTenant(selectedTenant.id);
            setSelectedTenant(null);
            setActionType(null);
            loadTenantsList();
        }
    };

    const handleSuspend = async () => {
        if (selectedTenant) {
            await suspendTenantAction(selectedTenant.id);
            setSelectedTenant(null);
            setActionType(null);
            loadTenantsList();
        }
    };

    const handleActivate = async () => {
        if (selectedTenant) {
            await activateTenantAction(selectedTenant.id);
            setSelectedTenant(null);
            setActionType(null);
            loadTenantsList();
        }
    };

    if (isLoading && !tenants.length) {
        return (
            <div className="admin-loading">
                <Spinner size="lg" />
                <p>Loading tenants...</p>
            </div>
        );
    }

    return (
        <div className="admin-tenants-page">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1>Tenant Management</h1>
                    <p>Manage all organizations on the platform</p>
                </div>
                <button className="btn btn-primary" onClick={() => navigate('/admin/tenants/create')}>
                    <FiPlus size={16} />
                    Create Tenant
                </button>
            </div>

            {/* Stats Summary */}
            <div className="admin-stats-grid">
                <div className="stat-card">
                    <div className="stat-icon"><FiDatabase size={24} /></div>
                    <div className="stat-info">
                        <div className="stat-value">{tenants.length}</div>
                        <div className="stat-label">Total Tenants</div>
                    </div>
                </div>
                <div className="stat-card success">
                    <div className="stat-icon"><FiGlobe size={24} /></div>
                    <div className="stat-info">
                        <div className="stat-value">{tenants.filter(t => t.is_active).length}</div>
                        <div className="stat-label">Active Tenants</div>
                    </div>
                </div>
                <div className="stat-card warning">
                    <div className="stat-icon"><FiUsers size={24} /></div>
                    <div className="stat-info">
                        <div className="stat-value">{tenants.reduce((sum, t) => sum + (t.user_count || 0), 0)}</div>
                        <div className="stat-label">Total Users</div>
                    </div>
                </div>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="admin-error-banner">
                    <FiAlertCircle size={18} />
                    <span>{error}</span>
                    <button onClick={() => { clearAdminError(); loadTenantsList(); }}>Retry</button>
                </div>
            )}

            {/* Search Bar */}
            <div className="admin-search-bar">
                <form onSubmit={handleSearch} className="search-form">
                    <FiSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search by tenant name or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                    <button type="submit" className="search-btn">Search</button>
                </form>
                <button className="refresh-btn" onClick={() => loadTenantsList()}>
                    <FiRefreshCw size={16} />
                </button>
            </div>

            {/* Tenants Table */}
            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Tenant Name</th>
                            <th>ID</th>
                            <th>Status</th>
                            <th>Users</th>
                            <th>Created</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tenants.map(tenant => (
                            <tr key={tenant.id}>
                                <td>
                                    <div className="tenant-info">
                                        <strong>{tenant.name}</strong>
                                        {tenant.domain && <span className="tenant-domain">{tenant.domain}</span>}
                                    </div>
                                </td>
                                <td><code>{tenant.id?.slice(0, 8)}...</code></td>
                                <td>
                                    <span className={`status-badge ${tenant.is_active ? 'active' : 'suspended'}`}>
                                        {tenant.is_active ? 'Active' : 'Suspended'}
                                    </span>
                                </td>
                                <td>{tenant.user_count || 0}</td>
                                <td>{new Date(tenant.created_at).toLocaleDateString()}</td>
                                <td className="actions-cell">
                                    <button
                                        className="action-icon edit"
                                        onClick={() => navigate(`/admin/tenants/${tenant.id}/edit`)}
                                        title="Edit Tenant"
                                    >
                                        <FiEdit size={16} />
                                    </button>
                                    {tenant.is_active ? (
                                        <button
                                            className="action-icon suspend"
                                            onClick={() => { setSelectedTenant(tenant); setActionType('suspend'); }}
                                            title="Suspend Tenant"
                                        >
                                            <FiLock size={16} />
                                        </button>
                                    ) : (
                                        <button
                                            className="action-icon activate"
                                            onClick={() => { setSelectedTenant(tenant); setActionType('activate'); }}
                                            title="Activate Tenant"
                                        >
                                            <FiUnlock size={16} />
                                        </button>
                                    )}
                                    <button
                                        className="action-icon delete"
                                        onClick={() => { setSelectedTenant(tenant); setActionType('delete'); }}
                                        title="Delete Tenant"
                                    >
                                        <FiTrash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Confirmation Dialogs */}
            <ConfirmationDialog
                isOpen={!!selectedTenant && actionType === 'delete'}
                onClose={() => { setSelectedTenant(null); setActionType(null); }}
                onConfirm={handleDelete}
                type="danger"
                title="Delete Tenant"
                message={`Are you sure you want to delete ${selectedTenant?.name}? This will delete all associated data.`}
                confirmText="Delete"
            />

            <ConfirmationDialog
                isOpen={!!selectedTenant && actionType === 'suspend'}
                onClose={() => { setSelectedTenant(null); setActionType(null); }}
                onConfirm={handleSuspend}
                type="warning"
                title="Suspend Tenant"
                message={`Are you sure you want to suspend ${selectedTenant?.name}? Users will not be able to access the system.`}
                confirmText="Suspend"
            />

            <ConfirmationDialog
                isOpen={!!selectedTenant && actionType === 'activate'}
                onClose={() => { setSelectedTenant(null); setActionType(null); }}
                onConfirm={handleActivate}
                type="success"
                title="Activate Tenant"
                message={`Are you sure you want to activate ${selectedTenant?.name}?`}
                confirmText="Activate"
            />
        </div>
    );
};

export default AdminTenants;