// frontend/src/pages/tenant/TenantSchemaPage.jsx
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { SchemaInfoCard, SchemaTablesList } from '../../components/tenant/schema';
import { fetchSchema, fetchSchemaTables, refreshSchemaStats, selectSchema, selectSchemaTables, selectSchemaRefreshing, selectTenantLoading } from '../../store/tenant';

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

    const handleRefresh = async () => {
        await dispatch(refreshSchemaStats(id));
    };

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Database Schema</h1>
                <p className="text-sm text-gray-500 mt-1">View tenant database schema information</p>
            </div>

            <SchemaInfoCard
                schema={schema}
                onRefresh={handleRefresh}
                isLoading={refreshing}
            />

            <div className="mt-6">
                <SchemaTablesList tables={tables} loading={loading} />
            </div>
        </div>
    );
};