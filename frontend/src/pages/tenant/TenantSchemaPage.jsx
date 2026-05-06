import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { SchemaInfoCard, SchemaTablesList } from '../../components/tenant/schema';
import { fetchSchema, fetchSchemaTables, refreshSchemaStats, selectSchema, selectSchemaTables, selectSchemaRefreshing } from '../../store/tenant/slice/tenantSchemaSlice';
import { selectTenantLoading } from '../../store/tenant/slice/tenantSlice';

export const TenantSchemaPage = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const schema = useSelector(selectSchema);
    const tables = useSelector(selectSchemaTables);
    const refreshing = useSelector(selectSchemaRefreshing);
    const loading = useSelector(selectTenantLoading);

    useEffect(() => {
        if (id) {
            dispatch(fetchSchema(id));
            dispatch(fetchSchemaTables(id));
        }
    }, [dispatch, id]);

    const handleRefresh = () => {
        dispatch(refreshSchemaStats(id));
    };

    if (loading && !schema) {
        return <div className="p-6 text-center">Loading schema information...</div>;
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Database Schema</h1>
                    <p className="text-gray-500 mt-1">View and manage tenant database schema</p>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                    {refreshing ? 'Refreshing...' : 'Refresh Stats'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <SchemaInfoCard schema={schema} />
            </div>

            <SchemaTablesList tables={tables} loading={loading} />
        </div>
    );
};

export default TenantSchemaPage;
