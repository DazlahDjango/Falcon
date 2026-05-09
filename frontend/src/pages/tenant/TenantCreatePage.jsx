// frontend/src/pages/tenant/TenantCreatePage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { TenantCreateForm } from '../../components/tenant/tenant';
import { createTenant, selectTenantLoading, selectTenantError } from '../../store/tenant/slice';
import '../../components/tenant/tenant/tenant.css';

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
        <div className="tenant-page-container">
            <div className="tenant-page-header">
                <h1 className="tenant-page-title">Create New Tenant</h1>
                <p className="tenant-page-subtitle">Add a new organization to the platform</p>
            </div>

            <div className="tenant-page-card">
                <TenantCreateForm
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    loading={loading}
                    error={error}
                />
            </div>
        </div>
    );
};

export default TenantCreatePage;