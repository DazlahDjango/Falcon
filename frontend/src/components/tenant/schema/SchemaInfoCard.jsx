// frontend/src/components/tenant/schema/SchemaInfoCard.jsx
import React from 'react';
import { SchemaStatusBadge } from './SchemaStatusBadge';
import { SchemaSizeDisplay } from './SchemaSizeDisplay';
import { SchemaRefreshButton } from './SchemaRefreshButton';
import './schema.css';

export const SchemaInfoCard = ({ schema }) => {
    if (!schema) return null;

    return (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden group">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Schema Metadata</h3>
                <SchemaStatusBadge status={schema.status} isReady={schema.is_ready} />
            </div>
            
            <div className="p-8 space-y-8">
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Object Count</p>
                        <p className="text-2xl font-black text-slate-900">
                            {schema.table_count !== undefined ? schema.table_count.toLocaleString() : '-'}
                        </p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total Volume</p>
                        <SchemaSizeDisplay sizeMb={schema.size_mb} />
                    </div>
                </div>

                <div className="space-y-4 pt-6 border-t border-slate-50">
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-500">Initialization</span>
                        <span className="text-xs font-mono text-slate-700">
                            {schema.created_at_schema ? new Date(schema.created_at_schema).toLocaleDateString() : '—'}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-500">Last Sync</span>
                        <span className="text-xs font-mono text-slate-700">
                            {schema.last_migration_at ? new Date(schema.last_migration_at).toLocaleDateString() : '—'}
                        </span>
                    </div>
                    {schema.last_migration_name && (
                        <div className="flex flex-col gap-2 mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <span className="text-[10px] font-black text-slate-400 uppercase">Head Migration</span>
                            <code className="text-[10px] text-blue-600 font-bold truncate break-all">
                                {schema.last_migration_name}
                            </code>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};