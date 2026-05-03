// frontend/src/components/tenant/schema/SchemaTablesList.jsx
import React, { useState } from 'react';
import './schema.css';

export const SchemaTablesList = ({ tables, loading = false }) => {
    const [searchTerm, setSearchTerm] = useState('');

    if (loading) {
        return (
            <div className="schema-tables-container">
                <div className="schema-tables-header">
                    <h4 className="schema-tables-title">Tables</h4>
                </div>
                <div className="text-center p-8 text-gray-500">Loading tables...</div>
            </div>
        );
    }

    if (!tables || tables.length === 0) {
        return (
            <div className="schema-tables-container">
                <div className="schema-tables-header">
                    <h4 className="schema-tables-title">Tables</h4>
                </div>
                <div className="text-center p-8 text-gray-500">No tables found</div>
            </div>
        );
    }

    const filteredTables = tables.filter(table =>
        table.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="schema-tables-container">
            <div className="schema-tables-header">
                <div className="flex justify-between items-center flex-wrap gap-2">
                    <h4 className="schema-tables-title">Tables ({tables.length})</h4>
                    <input
                        type="text"
                        placeholder="Search tables..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="px-2 py-1 text-sm border border-gray-300 rounded-md w-48"
                    />
                </div>
            </div>
            <div className="schema-tables-list">
                {filteredTables.map((table, index) => (
                    <div key={index} className="schema-table-item">
                        <span className="schema-table-name">{table.name}</span>
                        {table.row_count !== undefined && (
                            <span className="schema-table-rows">{table.row_count.toLocaleString()} rows</span>
                        )}
                    </div>
                ))}
                {filteredTables.length === 0 && (
                    <div className="text-center p-4 text-gray-500">No matching tables</div>
                )}
            </div>
        </div>
    );
};