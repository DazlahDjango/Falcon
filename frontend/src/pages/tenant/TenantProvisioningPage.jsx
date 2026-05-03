// frontend/src/pages/tenant/TenantProvisioningPage.jsx
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ProvisioningProgress, ProvisioningSteps, ProvisioningStatusBadge, ProvisioningRetryButton } from '../../components/tenant/provisioning';
import { fetchProvisioningStatus, fetchProvisioningProgress, retryProvisioning, selectProvisioningStatus, selectProvisioningProgress, selectProvisioningProgressPercentage, selectIsProvisioning, selectIsProvisioned, selectIsProvisioningFailed, selectTenantLoading } from '../../store/tenant';

export const TenantProvisioningPage = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const status = useSelector(selectProvisioningStatus);
    const progress = useSelector(selectProvisioningProgress);
    const progressPercentage = useSelector(selectProvisioningProgressPercentage);
    const isProvisioning = useSelector(selectIsProvisioning);
    const isProvisioned = useSelector(selectIsProvisioned);
    const isFailed = useSelector(selectIsProvisioningFailed);
    const loading = useSelector(selectTenantLoading);

    useEffect(() => {
        if (id) {
            dispatch(fetchProvisioningStatus(id));
            dispatch(fetchProvisioningProgress(id));
        }
    }, [dispatch, id]);

    const handleRetry = async () => {
        await dispatch(retryProvisioning(id));
    };

    if (isProvisioned) {
        return (
            <div className="p-6 text-center">
                <div className="bg-green-50 border border-green-200 rounded-lg p-8">
                    <span className="text-5xl">✅</span>
                    <h2 className="text-xl font-semibold text-green-800 mt-4">Provisioning Complete</h2>
                    <p className="text-green-600 mt-2">Your tenant has been successfully provisioned.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Tenant Provisioning</h1>
                <p className="text-sm text-gray-500 mt-1">Setting up your tenant environment</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                    <ProvisioningStatusBadge status={status?.status} />
                    {isFailed && <ProvisioningRetryButton onRetry={handleRetry} />}
                </div>

                <ProvisioningProgress
                    progress={progressPercentage}
                    status={status?.status}
                    message={progress?.message}
                />

                <div className="mt-8">
                    <ProvisioningSteps
                        currentStep={progress?.current_step}
                        steps={progress?.steps}
                        status={status?.status}
                    />
                </div>
            </div>
        </div>
    );
};