// frontend/src/pages/tenant/TenantEditPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { TenantEditForm } from '../../components/tenant/tenant';
import { fetchTenantById, updateTenant, selectCurrentTenant, selectTenantLoading, selectTenantError } from '../../store/tenant/slice';
import '../../components/tenant/tenant/tenant.css';

export const TenantEditPage = () => {
    const { tenantId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const tenant = useSelector(selectCurrentTenant);
    const loading = useSelector(selectTenantLoading);
    const error = useSelector(selectTenantError);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (tenantId) {
            dispatch(fetchTenantById(tenantId));
        }
    }, [dispatch, tenantId]);

    const handleSubmit = async (data) => {
        setSubmitting(true);
        const result = await dispatch(updateTenant({ id: tenantId, data }));
        setSubmitting(false);

        if (result.meta.requestStatus === 'fulfilled') {
            navigate(`/tenants/${tenantId}`);
        }
    };

    const handleCancel = () => {
        navigate(`/tenants/${tenantId}`);
    };

    if (loading && !tenant) {
        return <div className="tenant-loading">Loading tenant...</div>;
    }

    if (!tenant) {
        return <div className="tenant-not-found">Tenant not found</div>;
    }

    return (
        <div className="tenant-page-container">
            <div className="tenant-page-header">
                <h1 className="tenant-page-title">Edit Tenant</h1>
                <p className="tenant-page-subtitle">Update organization information</p>
            </div>

            <div className="tenant-page-card">
                <TenantEditForm
                    tenant={tenant}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    loading={submitting}
                    error={error}
                />
            </div>
        </div>
    );
};

export default TenantEditPage;