import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiPlus, FiEdit, FiTrash2, FiCheckCircle, FiXCircle, FiUsers } from 'react-icons/fi';
import { fetchTenants, deleteTenant, suspendTenant, activateTenant } from '../../../store/accounts/slice/adminSlice';
import TenantForm from './components/TenantForm';
import { SkeletonLoader } from '../../common/Feedback/LoadingScreen';
import ConfirmationDialog from '../../common/Feedback/ConfirmationDialog';
import Modal from '../../common/UI/Modal';

const AdminTenants = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { tenants, isLoading } = useSelector((state) => state.admin);
    const [selectedTenant, setSelectedTenant] = useState(null);
    const [actionType, setActionType] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    useEffect(() => {
        dispatch(fetchTenants());
    }, [dispatch]);
    const handleDelete = async () => {
        if (selectedTenant) {
            await dispatch(deleteTenant(selectedTenant.id));
            setSelectedTenant(null);
            setActionType(null);
        }
    };
    const handleSuspend = async () => {
        if (selectedTenant) {
            await dispatch(suspendTenant(selectedTenant.id));
            setSelectedTenant(null);
            setActionType(null);
        }
    };
    const handleActivate = async () => {
        if (selectedTenant) {
            await dispatch(activateTenant(selectedTenant.id));
            setSelectedTenant(null);
            setActionType(null);
        }
    };
    if (isLoading && !tenants.length) {
        return <SkeletonLoader type="list" count={5} />;
    }
    return (
        <div className="admin-tenants">
            <div className="page-header">
                <h1>Manage Tenants</h1>
                <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                    <FiPlus size={16} />
                    Create Tenant
                </button>
            </div>
            <div className="tenants-grid">
                {tenants.map(tenant => (
                    <div key={tenant.id} className="tenant-card">
                        <div className="tenant-header">
                            <div className="tenant-icon">
                                <FiUsers size={24} />
                            </div>
                            <div className="tenant-info">
                                <h3>{tenant.name}</h3>
                                <p className="tenant-slug">{tenant.slug}</p>
                            </div>
                            <div className={`tenant-status ${tenant.is_active ? 'active' : 'suspended'}`}>
                                {tenant.is_active ? 'Active' : 'Suspended'}
                            </div>
                        </div>
                        <div className="tenant-details">
                            <div className="detail-row">
                                <span className="label">Domain:</span>
                                <span>{tenant.domain || '—'}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Plan:</span>
                                <span className="plan-badge">{tenant.subscription_plan || 'trial'}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Users:</span>
                                <span>{tenant.user_count || 0}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Created:</span>
                                <span>{new Date(tenant.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                        <div className="tenant-actions">
                            <button className="action-btn edit" onClick={() => { setSelectedTenant(tenant); setShowEditModal(true); }}>
                                <FiEdit size={16} />
                                Edit
                            </button>
                            {tenant.is_active ? (
                                <button className="action-btn suspend" onClick={() => { setSelectedTenant(tenant); setActionType('suspend'); }}>
                                    <FiXCircle size={16} />
                                    Suspend
                                </button>
                            ) : (
                                <button className="action-btn activate" onClick={() => { setSelectedTenant(tenant); setActionType('activate'); }}>
                                    <FiCheckCircle size={16} />
                                    Activate
                                </button>
                            )}
                            <button className="action-btn delete" onClick={() => { setSelectedTenant(tenant); setActionType('delete'); }}>
                                <FiTrash2 size={16} />
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Tenant" size="md">
                <TenantForm 
                    onSubmit={() => {
                        setShowCreateModal(false);
                        dispatch(fetchTenants());
                    }}
                    onCancel={() => setShowCreateModal(false)}
                />
            </Modal>
            <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Tenant" size="md">
                <TenantForm 
                    initialData={selectedTenant}
                    isEdit
                    onSubmit={() => {
                        setShowEditModal(false);
                        dispatch(fetchTenants());
                    }}
                    onCancel={() => setShowEditModal(false)}
                />
            </Modal>
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