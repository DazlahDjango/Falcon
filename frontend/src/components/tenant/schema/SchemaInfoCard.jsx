// frontend/src/components/tenant/schema/SchemaInfoCard.jsx
import React from 'react';
import { SchemaStatusBadge } from './SchemaStatusBadge';
import { SchemaSizeDisplay } from './SchemaSizeDisplay';
import { SchemaRefreshButton } from './SchemaRefreshButton';
import './schema.css';

export const SchemaInfoCard = ({ schema, onRefresh, isLoading = false }) => {
    if (!schema) return null;

    return (
        <div className="schema-info-card">
            <div className="schema-info-card-header">
                <h3 className="schema-info-card-title">Database Schema Information</h3>
                <SchemaRefreshButton onRefresh={onRefresh} isLoading={isLoading} />
            </div>
            <div className="schema-info-card-content">
                <div className="schema-stats-grid">
                    <div className="schema-stat-card">
                        <div className="schema-stat-value">{schema.schema_name || '-'}</div>
                        <div className="schema-stat-label">Schema Name</div>
                    </div>
                    <div className="schema-stat-card">
                        <div className="schema-stat-value">
                            <SchemaStatusBadge status={schema.status} isReady={schema.is_ready} />
                        </div>
                        <div className="schema-stat-label">Status</div>
                    </div>
                    <div className="schema-stat-card">
                        <div className="schema-stat-value">
                            {schema.table_count !== undefined ? schema.table_count.toLocaleString() : '-'}
                        </div>
                        <div className="schema-stat-label">Tables</div>
                    </div>
                    <div className="schema-stat-card">
                        <div className="schema-stat-value">
                            <SchemaSizeDisplay sizeMb={schema.size_mb} />
                        </div>
                        <div className="schema-stat-label">Size</div>
                    </div>
                </div>

                {schema.created_at_schema && (
                    <div className="text-sm text-gray-600 mt-2 pt-2 border-t border-gray-100">
                        <span className="font-medium">Created:</span> {new Date(schema.created_at_schema).toLocaleString()}
                    </div>
                )}
                {schema.last_migration_at && (
                    <div className="text-sm text-gray-600 mt-1">
                        <span className="font-medium">Last Migration:</span> {new Date(schema.last_migration_at).toLocaleString()}
                    </div>
                )}
                {schema.last_migration_name && (
                    <div className="text-sm text-gray-600 mt-1">
                        <span className="font-medium">Last Migration Name:</span>
                        <code className="ml-1 px-1 bg-gray-100 rounded text-xs">{schema.last_migration_name}</code>
                    </div>
                )}
            </div>
        </div>
    );
};