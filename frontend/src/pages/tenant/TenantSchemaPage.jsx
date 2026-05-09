import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { SchemaInfoCard, SchemaTablesList } from '../../components/tenant/schema';
import { fetchSchema, fetchSchemaTables, refreshSchemaStats, selectSchema, selectSchemaTables, selectSchemaRefreshing, selectTenantLoading } from '../../store/tenant/slice';
import { FiDatabase, FiRefreshCw, FiLayers, FiActivity, FiServer } from 'react-icons/fi';


export const TenantSchemaPage = () => {
    const { tenantId } = useParams();
    const dispatch = useDispatch();
    const schema = useSelector(selectSchema);
    const tables = useSelector(selectSchemaTables);
    const refreshing = useSelector(selectSchemaRefreshing);
    const loading = useSelector(selectTenantLoading);

    useEffect(() => {
        if (tenantId) {
            dispatch(fetchSchema(tenantId));
            dispatch(fetchSchemaTables(tenantId));
        }
    }, [dispatch, tenantId]);

    const handleRefresh = () => {
        dispatch(refreshSchemaStats(tenantId));
    };

    if (loading && !schema) {
        return (
            <div className="flex flex-col items-center justify-center h-screen space-y-4">
                <FiDatabase className="h-12 w-12 text-blue-200 animate-pulse" />
                <p className="text-slate-400 font-medium">Analyzing database schema...</p>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200">
                        <FiLayers className="h-8 w-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Database Architecture</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="flex items-center gap-1 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                <FiServer className="text-blue-500" />
                                {schema?.schema_name || 'Calculating...'}
                            </span>
                            <span className="h-1 w-1 bg-slate-300 rounded-full" />
                            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">v1.0.4-stable</span>
                        </div>
                    </div>
                </div>
                
                <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="group px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all duration-200 flex items-center gap-3 shadow-xl shadow-slate-200 active:scale-95 disabled:opacity-50"
                >
                    <FiRefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                    <span className="font-bold text-sm">Sync Meta-Stats</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Stats and Info Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                    <SchemaInfoCard schema={schema} onRefresh={handleRefresh} isLoading={refreshing} />
                    
                    <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-6 rounded-3xl text-white shadow-xl shadow-blue-200 relative overflow-hidden group">
                        <FiActivity className="absolute -right-4 -bottom-4 h-32 w-32 text-white/10 group-hover:scale-110 transition-transform duration-500" />
                        <h4 className="text-lg font-bold mb-2">System Insight</h4>
                        <p className="text-blue-100 text-sm leading-relaxed mb-4">
                            All tenant tables are automatically indexed and optimized for multi-tenant isolation.
                        </p>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg text-xs font-bold">
                            <span className="h-2 w-2 bg-green-400 rounded-full animate-ping" />
                            Optimization Active
                        </div>
                    </div>
                </div>

                {/* Tables Content Area */}
                <div className="lg:col-span-8">
                    <SchemaTablesList tables={tables} loading={loading} />
                </div>
            </div>
        </div>
    );
};

export default TenantSchemaPage;
