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
} from '../../store/tenant';

export const TenantDetailPage = () => {
    const { id } = useParams();
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
        if (id) {
            dispatch(fetchTenantById(id));
        }
    }, [dispatch, id]);

    const handleEdit = () => {
        navigate(`/tenants/${id}/edit`);
    };

    const handleDelete = () => {
        dispatch(openModal({ modalName: 'deleteTenant', data: { id } }));
    };

    const handleConfirmDelete = async () => {
        await dispatch(deleteTenant(id));
        navigate('/tenants');
        dispatch(closeModal('deleteTenant'));
    };

    const handleSuspend = () => {
        dispatch(openModal({ modalName: 'suspendTenant', data: { id } }));
    };

    const handleConfirmSuspend = async () => {
        await dispatch(suspendTenant({ id, reason: '' }));
        dispatch(closeModal('suspendTenant'));
    };

    const handleActivate = () => {
        dispatch(openModal({ modalName: 'activateTenant', data: { id } }));
    };

    const handleConfirmActivate = async () => {
        await dispatch(activateTenant(id));
        dispatch(closeModal('activateTenant'));
    };

    const handleUpgrade = () => {
        dispatch(openModal({ modalName: 'upgradeTenant', data: { id } }));
    };

    if (loading) {
        return <div className="p-6 text-center">Loading tenant...</div>;
    }

    if (error) {
        return <div className="p-6 text-center text-red-600">Error: {error}</div>;
    }

    if (!tenant) {
        return <div className="p-6 text-center">Tenant not found</div>;
    }

    return (
        <div className="p-6">
            <TenantDetailHeader
                tenant={tenant}
                onEdit={handleEdit}
                onSuspend={handleSuspend}
                onActivate={handleActivate}
                onDelete={handleDelete}
                onUpgrade={handleUpgrade}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
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