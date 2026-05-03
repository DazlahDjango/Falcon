// frontend/src/pages/tenant/TenantCreatePage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { TenantCreateForm } from '../../components/tenant/tenant';
import { createTenant, selectTenantLoading, selectTenantError } from '../../store/tenant';

export const TenantCreatePage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const loading = useSelector(selectTenantLoading);
    const error = useSelector(selectTenantError);

    const handleSubmit = async (data) => {
        const result = await dispatch(createTenant(data));
        if (result.meta.requestStatus === 'fulfilled') {
            navigate(`/tenants/${result.payload.id}`);
        }
    };

    const handleCancel = () => {
        navigate('/tenants');
    };

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Create New Tenant</h1>
                <p className="text-sm text-gray-500 mt-1">Add a new organization to the platform</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
                <TenantCreateForm
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    isLoading={loading}
                    error={error}
                />
            </div>
        </div>
    );
};