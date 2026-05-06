// frontend/src/pages/tenant/TenantListPage.jsx

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const TenantListPage = () => {
    const dispatch = useDispatch();
    const { tenants, loading } = useSelector((state) => state.appTenant);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        // Dispatch action to fetch tenants
        dispatch({ type: 'tenant/fetchTenants' });
    }, [dispatch]);

    const filteredTenants = (tenants || []).filter(tenant =>
        tenant.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tenant.slug?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-gray-500">Loading tenants...</div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-6 flex justify-between items-center">
                <h1 className="text-2xl font-bold">Tenants</h1>
                <Link
                    to="/tenants/create"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                    Create Tenant
                </Link>
            </div>

            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Search tenants..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredTenants.map((tenant) => (
                    <Link
                        key={tenant.id}
                        to={`/tenants/${tenant.id}`}
                        className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
                    >
                        <h3 className="font-semibold text-lg text-gray-800">{tenant.name}</h3>
                        <p className="text-gray-600 text-sm mt-1">Slug: {tenant.slug}</p>
                        <p className="text-gray-600 text-sm">Plan: {tenant.subscription_plan}</p>
                        <div className="mt-2">
                            <span className={`inline-block px-2 py-1 text-xs rounded ${tenant.is_active
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                {tenant.is_active ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                    </Link>
                ))}
            </div>

            {filteredTenants.length === 0 && !loading && (
                <div className="text-center text-gray-500 mt-8">
                    {searchTerm ? 'No tenants match your search.' : 'No tenants found. Create your first tenant!'}
                </div>
            )}
        </div>
    );
};

export default TenantListPage;