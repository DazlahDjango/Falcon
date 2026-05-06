import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';

const DomainCreatePage = () => {
    const { tenantId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [domain, setDomain] = useState('');
    const [isPrimary, setIsPrimary] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await dispatch({ type: 'tenantDomain/createDomain', payload: { tenantId, domain, is_primary: isPrimary } }).unwrap();
            navigate(`/tenants/${tenantId}/domains`);
        } catch (error) {
            console.error('Failed to create domain:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Add Custom Domain</h1>
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
                <div className="mb-4"><label className="block font-semibold mb-1">Domain Name</label><input type="text" value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="example.com" required className="w-full px-4 py-2 border rounded-lg" /></div>
                <div className="mb-4"><label className="flex items-center"><input type="checkbox" checked={isPrimary} onChange={(e) => setIsPrimary(e.target.checked)} className="mr-2" /> Set as primary domain</label></div>
                <div className="flex gap-3"><button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded-lg">{loading ? 'Adding...' : 'Add Domain'}</button><button type="button" onClick={() => navigate(`/tenants/${tenantId}/domains`)} className="bg-gray-300 px-4 py-2 rounded-lg">Cancel</button></div>
            </form>
        </div>
    );
};

export default DomainCreatePage;
