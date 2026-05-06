import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';

const DomainVerifyPage = () => {
    const { tenantId, domainId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [verifying, setVerifying] = useState(false);
    const [verified, setVerified] = useState(false);
    const [error, setError] = useState(null);

    const handleVerify = async () => {
        setVerifying(true);
        setError(null);
        try {
            await dispatch({ type: 'tenantDomain/verifyDomain', payload: { tenantId, domainId } }).unwrap();
            setVerified(true);
            setTimeout(() => navigate(`/tenants/${tenantId}/domains`), 2000);
        } catch (err) {
            setError(err.message || 'Verification failed');
        } finally {
            setVerifying(false);
        }
    };

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Verify Domain</h1>
            <div className="bg-white rounded-lg shadow p-6">
                <div className="mb-6"><p className="text-gray-600 mb-2">Add this TXT record to your DNS provider:</p><code className="block bg-gray-100 p-3 rounded font-mono text-sm break-all">_verification.{domainId}.yourdomain.com</code></div>
                {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
                {verified ? <div className="bg-green-100 text-green-700 p-3 rounded">Verified! Redirecting...</div> : <button onClick={handleVerify} disabled={verifying} className="w-full bg-blue-600 text-white py-2 rounded-lg">{verifying ? 'Verifying...' : 'Verify Domain'}</button>}
            </div>
        </div>
    );
};

export default DomainVerifyPage;
