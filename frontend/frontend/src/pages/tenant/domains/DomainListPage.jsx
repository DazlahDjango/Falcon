import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

const DomainListPage = () => {
    const { tenantId } = useParams();
    const dispatch = useDispatch();
    const { domains, loading } = useSelector((state) => state.tenantDomain || { domains: [], loading: false });
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (tenantId) {
            dispatch({ type: 'tenantDomain/fetchDomains', payload: tenantId });
        }
    }, [dispatch, tenantId]);

    const filteredDomains = (domains || []).filter(domain =>
        domain.domain?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <div className="flex justify-center items-center h-64">Loading domains...</div>;
    }

    return (
        <div className="p-6">
            <div className="mb-6 flex justify-between items-center">
                <h1 className="text-2xl font-bold">Custom Domains</h1>
                <Link to={`/tenants/${tenantId}/domains/create`} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                    Add Domain
                </Link>
            </div>
            <div className="mb-4">
                <input type="text" placeholder="Search domains..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full md:w-96 px-4 py-2 border rounded-lg" />
            </div>
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr><th className="px-6 py-3 text-left">Domain</th><th className="px-6 py-3 text-left">Status</th><th className="px-6 py-3 text-left">Primary</th><th className="px-6 py-3 text-left">Actions</th></tr>
                    </thead>
                    <tbody>
                        {filteredDomains.map((domain) => (
                            <tr key={domain.id} className="border-t">
                                <td className="px-6 py-4">{domain.domain}</td>
                                <td className="px-6 py-4"><span className={`px-2 py-1 text-xs rounded ${domain.status === 'verified' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{domain.status || 'pending'}</span></td>
                                <td className="px-6 py-4">{domain.is_primary ? '✓' : ''}</td>
                                <td className="px-6 py-4">{domain.status !== 'verified' && (<Link to={`/tenants/${tenantId}/domains/${domain.id}/verify`} className="text-blue-600">Verify</Link>)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DomainListPage;
