// frontend/src/pages/tenant/TenantDetailPage.jsx
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    TenantDetailHeader,
    TenantInfoPanel,
    TenantContactPanel,
    TenantDeleteModal,
    TenantSuspendModal,
    TenantActivateModal,
    TenantUpgradeModal,
} from '../../components/tenant/tenant';
import {
    fetchTenantById,
    deleteTenant,
    suspendTenant,
    activateTenant,
    selectCurrentTenant,
    selectTenantLoading,
    selectTenantError,
    openModal,
    closeModal,
    selectModalState,
} from '../../store/tenant/slice';
import '../../components/tenant/tenant/tenant.css';

export const TenantDetailPage = () => {
    const { tenantId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const tenant = useSelector(selectCurrentTenant);
    const loading = useSelector(selectTenantLoading);
    const error = useSelector(selectTenantError);

    const deleteModalOpen = useSelector((state) => selectModalState(state, 'deleteTenant'));
    const suspendModalOpen = useSelector((state) => selectModalState(state, 'suspendTenant'));
    const activateModalOpen = useSelector((state) => selectModalState(state, 'activateTenant'));
    const upgradeModalOpen = useSelector((state) => selectModalState(state, 'upgradeTenant'));

    useEffect(() => {
        if (tenantId) {
            dispatch(fetchTenantById(tenantId));
        }
    }, [dispatch, tenantId]);

    const handleEdit = () => {
        navigate(`/tenants/${tenantId}/edit`);
    };

    const handleDelete = () => {
        dispatch(openModal({ modalName: 'deleteTenant', data: { id: tenantId } }));
    };

    const handleConfirmDelete = async () => {
        await dispatch(deleteTenant(tenantId));
        navigate('/tenants');
        dispatch(closeModal('deleteTenant'));
    };

    const handleSuspend = () => {
        dispatch(openModal({ modalName: 'suspendTenant', data: { id: tenantId } }));
    };

    const handleConfirmSuspend = async (reason) => {
        await dispatch(suspendTenant({ id: tenantId, reason }));
        dispatch(closeModal('suspendTenant'));
    };

    const handleActivate = () => {
        dispatch(openModal({ modalName: 'activateTenant', data: { id: tenantId } }));
    };

    const handleConfirmActivate = async () => {
        await dispatch(activateTenant(tenantId));
        dispatch(closeModal('activateTenant'));
    };

    const handleUpgrade = (plan) => {
        // Handle upgrade logic
        console.log('Upgrade to:', plan);
        dispatch(closeModal('upgradeTenant'));
    };

    if (loading && !tenant) {
        return <div className="tenant-loading">Loading tenant...</div>;
    }

    if (error) {
        return <div className="tenant-error">Error: {error}</div>;
    }

    if (!tenant) {
        return <div className="tenant-not-found">Tenant not found</div>;
    }

    return (
        <div className="tenant-detail-page">
            <TenantDetailHeader
                tenant={tenant}
                onEdit={handleEdit}
                onSuspend={handleSuspend}
                onActivate={handleActivate}
                onDelete={handleDelete}
            />

            <div className="tenant-detail-grid">
                <TenantInfoPanel tenant={tenant} />
                <TenantContactPanel tenant={tenant} />
            </div>

            <TenantDeleteModal
                isOpen={deleteModalOpen}
                onClose={() => dispatch(closeModal('deleteTenant'))}
                onConfirm={handleConfirmDelete}
                tenantName={tenant.name}
            />

            <TenantSuspendModal
                isOpen={suspendModalOpen}
                onClose={() => dispatch(closeModal('suspendTenant'))}
                onConfirm={handleConfirmSuspend}
                tenantName={tenant.name}
            />

            <TenantActivateModal
                isOpen={activateModalOpen}
                onClose={() => dispatch(closeModal('activateTenant'))}
                onConfirm={handleConfirmActivate}
                tenantName={tenant.name}
            />

            <TenantUpgradeModal
                isOpen={upgradeModalOpen}
                onClose={() => dispatch(closeModal('upgradeTenant'))}
                onConfirm={handleUpgrade}
                tenantName={tenant.name}
                currentPlan={tenant.subscription_plan}
            />
        </div>
    );
};

export default TenantDetailPage;