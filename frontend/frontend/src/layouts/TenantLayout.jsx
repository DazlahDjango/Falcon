import React from 'react';
import { Outlet, NavLink, useParams } from 'react-router-dom';

const TenantLayout = () => {
    const { tenantId } = useParams();

    const navItems = [
        { path: '', label: 'Overview', end: true },
        { path: 'dashboard', label: 'Dashboard' },
        { path: 'resources', label: 'Resources' },
        { path: 'usage', label: 'Usage' },
        { path: 'domains', label: 'Domains' },
        { path: 'backups', label: 'Backups' },
        { path: 'migrations', label: 'Migrations' },
        { path: 'schema', label: 'Schema' },
        { path: 'audit', label: 'Audit Logs' },
        { path: 'settings', label: 'Settings' },
    ];

    return (
        <div className="flex h-screen bg-gray-100">
            <aside className="w-64 bg-white shadow-md">
                <div className="p-4 border-b">
                    <h2 className="text-lg font-semibold">Tenant Management</h2>
                    {tenantId && <p className="text-sm text-gray-500 mt-1">ID: {tenantId.substring(0, 8)}...</p>}
                </div>
                <nav className="p-4">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path || 'overview'}
                            to={item.path || '.'}
                            end={item.end}
                            className={({ isActive }) =>
                                `block px-4 py-2 mb-1 rounded transition-colors ${
                                    isActive ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                                }`
                            }
                        >
                            {item.label}
                        </NavLink>
                    ))}
                </nav>
            </aside>
            <main className="flex-1 overflow-auto">
                <div className="p-6">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default TenantLayout;
