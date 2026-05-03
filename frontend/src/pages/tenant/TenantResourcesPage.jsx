// frontend/src/pages/tenant/TenantResourcesPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ResourceUsageDashboard, ResourceLimitTable, ResourceLimitForm } from '../../components/tenant/resources';
import { fetchTenantResources, updateResourceLimit, selectResources, selectTenantLoading } from '../../store/tenant';

export const TenantResourcesPage = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const resources = useSelector(selectResources);
    const loading = useSelector(selectTenantLoading);
    const [editingResource, setEditingResource] = useState(null);

    useEffect(() => {
        if (id) {
            dispatch(fetchTenantResources(id));
        }
    }, [dispatch, id]);

    const handleEditResource = (resource) => {
        setEditingResource(resource);
    };

    const handleSaveResource = async (data) => {
        await dispatch(updateResourceLimit({
            tenantId: id,
            resourceType: editingResource.resource_type,
            limitValue: data.limit_value
        }));
        setEditingResource(null);
    };

    const usageData = resources.map(r => ({
        resource_type: r.resource_type,
        current_value: r.current_value,
        limit_value: r.limit_value,
        percentage: (r.current_value / r.limit_value) * 100,
    }));

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Resource Management</h1>
                <p className="text-sm text-gray-500 mt-1">Monitor and manage tenant resource limits</p>
            </div>

            <ResourceUsageDashboard resources={usageData} loading={loading} />

            <div className="mt-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Resource Limits</h2>
                <ResourceLimitTable
                    resources={resources}
                    onEdit={handleEditResource}
                    loading={loading}
                />
            </div>

            {editingResource && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4">Edit Resource Limit</h3>
                        <ResourceLimitForm
                            resource={editingResource}
                            onSubmit={handleSaveResource}
                            onCancel={() => setEditingResource(null)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};