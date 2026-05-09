import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

const TenantUsagePage = () => {
    const { id, tenantId } = useParams();
    const tenantIdParam = id || tenantId;
    const dispatch = useDispatch();
    const { usage, loading } = useSelector((state) => state.tenantResource || { usage: null, loading: false });

    useEffect(() => {
        if (tenantIdParam) dispatch({ type: 'tenantResource/fetchUsage', payload: tenantIdParam });
    }, [dispatch, tenantIdParam]);

    if (loading) return <div className="flex justify-center items-center h-64">Loading usage data...</div>;

    return (
        <div className="p-6"><h1 className="text-2xl font-bold mb-6">Usage Statistics</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{usage && Object.entries(usage).map(([key, value]) => (<div key={key} className="bg-white rounded-lg shadow p-4"><h3 className="font-semibold text-gray-600 mb-2">{key.replace(/_/g, ' ').toUpperCase()}</h3><p className="text-2xl font-bold">{value?.current || 0} / {value?.limit || '-'}</p></div>))}</div></div>
    );
};

export default TenantUsagePage;
