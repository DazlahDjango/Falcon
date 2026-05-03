// frontend/src/hooks/tenant/useTenantSchema.js
import { useState, useEffect, useCallback } from 'react';
import { SchemaService } from '../../services/tenant';

export const useTenantSchema = (tenantId) => {
    const [schema, setSchema] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tables, setTables] = useState([]);

    const fetchSchema = useCallback(async () => {
        if (!tenantId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await SchemaService.getSchemaForTenant(tenantId);
            if (response.success) {
                setSchema(response.data);
            } else {
                setError(response.message);
            }
        } catch (err) {
            setError(err.message || 'Failed to load schema');
        } finally {
            setLoading(false);
        }
    }, [tenantId]);

    const fetchTables = useCallback(async () => {
        if (!tenantId) return;

        try {
            const response = await SchemaService.getSchemaTables(tenantId);
            if (response.success) {
                setTables(response.data);
            }
        } catch (err) {
            console.error('Failed to load tables:', err);
        }
    }, [tenantId]);

    const refreshStats = useCallback(async () => {
        if (!tenantId) return;

        try {
            const response = await SchemaService.refreshSchemaStats(tenantId);
            if (response.success) {
                await fetchSchema();
                return { success: true, data: response.data };
            }
            return { success: false, error: response.message };
        } catch (err) {
            return { success: false, error: err.message };
        }
    }, [tenantId, fetchSchema]);

    const getSchemaStatus = useCallback(() => {
        if (!schema) return null;
        return {
            status: schema.status,
            isReady: schema.is_ready,
            isActive: schema.status === 'active' && schema.is_ready,
        };
    }, [schema]);

    const getSchemaSize = useCallback(() => {
        if (!schema) return null;
        return {
            sizeMb: schema.size_mb,
            sizeDisplay: schema.size_display,
        };
    }, [schema]);

    useEffect(() => {
        fetchSchema();
        fetchTables();
    }, [fetchSchema, fetchTables]);

    return {
        schema,
        tables,
        loading,
        error,
        refresh: fetchSchema,
        refreshTables: fetchTables,
        refreshStats,
        getSchemaStatus,
        getSchemaSize,
        isReady: schema?.is_ready || false,
        isActive: schema?.status === 'active' && schema?.is_ready,
    };
};