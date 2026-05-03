// frontend/src/pages/tenant/TenantEditPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { TenantEditForm } from '../../components/tenant/tenant';
import { fetchTenantById, updateTenant, selectCurrentTenant, selectTenantLoading, selectTenantError } from '../../store/tenant';

export const TenantEditPage = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const tenant = useSelector(selectCurrentTenant);
    const loading = useSelector(selectTenantLoading);
    const error = useSelector(selectTenantError);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (id) {
            dispatch(fetchTenantById(id));
        }
    }, [dispatch, id]);

    const handleSubmit = async (data) => {
        setSubmitting(true);
        const result = await dispatch(updateTenant({ id, data }));
        setSubmitting(false);

        if (result.meta.requestStatus === 'fulfilled') {
            navigate(`/tenants/${id}`);
        }
    };

    const handleCancel = () => {
        navigate(`/tenants/${id}`);
    };

    if (loading && !tenant) {
        return <div className="p-6 text-center">Loading tenant...</div>;
    }

    if (!tenant) {
        return <div className="p-6 text-center">Tenant not found</div>;
    }

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Edit Tenant</h1>
                <p className="text-sm text-gray-500 mt-1">Update organization information</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
                <TenantEditForm
                    initialData={tenant}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    isLoading={submitting}
                    error={error}
                />
            </div>
        </div>
    );
};