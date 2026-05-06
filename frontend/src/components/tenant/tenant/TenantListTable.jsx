import React from 'react';
import TenantStatusBadge from '../common/TenantStatusBadge';
import './tenant.css';

const TenantListTable = ({ tenants, onView, onEdit, loading }) => {
    if (loading) return <div className="text-center py-8">Loading tenants...</div>;

    return (
        <div className="overflow-x-auto">
            <table className="tenant-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Slug</th>
                        <th>Plan</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {tenants?.map((tenant) => (
                        <tr key={tenant.id}>
                            <td>{tenant.name}</td>
                            <td><code>{tenant.slug}</code></td>
                            <td className="capitalize">{tenant.subscription_plan}</td>
                            <td><TenantStatusBadge status={tenant.is_active ? 'active' : 'inactive'} size="sm" /></td>
                            <td>
                                <button onClick={() => onView?.(tenant.id)} className="tenant-btn-link mr-2">View</button>
                                <button onClick={() => onEdit?.(tenant.id)} className="tenant-btn-link">Edit</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TenantListTable;
