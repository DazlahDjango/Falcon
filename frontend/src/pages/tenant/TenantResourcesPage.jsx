// frontend/src/pages/tenant/TenantResourcesPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ResourceUsageDashboard, ResourceLimitTable, ResourceLimitForm } from '../../components/tenant/resources';
import { fetchTenantResources, updateResourceLimit, syncTenantResources, selectResources, selectTenantLoading } from '../../store/tenant/slice';

export const TenantResourcesPage = () => {
    const { tenantId } = useParams();
    const dispatch = useDispatch();
    const resources = useSelector(selectResources) || [];
    const loading = useSelector(selectTenantLoading);
    const [editingResource, setEditingResource] = useState(null);

    useEffect(() => {
        if (tenantId) {
            dispatch(fetchTenantResources({ tenantId }));
        }
    }, [dispatch, tenantId]);

    const handleEditResource = (resource) => {
        setEditingResource(resource);
    };

    const handleSaveResource = async (data) => {
        await dispatch(updateResourceLimit({
            tenantId: tenantId,
            resourceType: editingResource.resource_type,
            limitValue: data.limit_value
        }));
        setEditingResource(null);
    };

    const usageData = resources.map(r => ({
        resource_type: r.resource_type,
        current_value: r.current_value,
        limit_value: r.limit_value,
        percentage: r.limit_value > 0 ? (r.current_value / r.limit_value) * 100 : 0,
    }));

    return (
        <div className="p-6">
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Resource Management</h1>
                    <p className="text-sm text-gray-500 mt-1">Monitor and manage tenant resource limits</p>
                </div>
                <button
                    onClick={() => dispatch(syncTenantResources(tenantId))}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-bold text-sm transition-colors flex items-center gap-2"
                >
                    Sync Live Data
                </button>
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