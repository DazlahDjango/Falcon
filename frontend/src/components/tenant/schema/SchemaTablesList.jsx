import React, { useState } from 'react';
import { FiSearch, FiTable, FiHash, FiActivity } from 'react-icons/fi';


export const SchemaTablesList = ({ tables, loading = false }) => {
    const [searchTerm, setSearchTerm] = useState('');

    if (loading) {
        return (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 p-12 text-center space-y-4">
                <div className="relative inline-block">
                    <div className="h-16 w-16 rounded-2xl bg-blue-50 flex items-center justify-center animate-pulse">
                        <FiTable className="h-8 w-8 text-blue-200" />
                    </div>
                </div>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Cataloging entities...</p>
            </div>
        );
    }

    const filteredTables = tables.filter(table =>
        table.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden flex flex-col h-[600px]">
            {/* List Header */}
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-sm">
                        <FiTable className="h-5 w-5 text-slate-600" />
                    </div>
                    <div>
                        <h4 className="text-lg font-bold text-slate-900">Schema Catalog</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Total discovered: {tables.length}</p>
                    </div>
                </div>
                
                <div className="relative w-full sm:w-64">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Filter entities..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                    />
                </div>
            </div>

            {/* Tables List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 grid grid-cols-1 md:grid-cols-2 gap-4 content-start">
                {filteredTables.map((table, index) => (
                    <div 
                        key={index} 
                        className="group p-4 bg-white border border-slate-100 rounded-2xl hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-200 flex items-center justify-between"
                    >
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                                <FiTable className="h-5 w-5 text-slate-400 group-hover:text-blue-600" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-slate-700 font-mono group-hover:text-slate-900">{table.name}</span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Relation entity</span>
                            </div>
                        </div>
                        
                        {table.row_count !== undefined && (
                            <div className="flex flex-col items-end">
                                <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded-lg group-hover:bg-blue-50 transition-colors">
                                    <FiHash className="h-3 w-3 text-slate-400 group-hover:text-blue-500" />
                                    <span className="text-xs font-black text-slate-600 group-hover:text-blue-700">
                                        {table.row_count.toLocaleString()}
                                    </span>
                                </div>
                                <span className="text-[9px] font-black text-slate-300 uppercase mt-1">Rows</span>
                            </div>
                        )}
                    </div>
                ))}
                
                {filteredTables.length === 0 && (
                    <div className="col-span-full py-20 text-center">
                        <FiActivity className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-400 font-medium">No entities match your search criteria</p>
                    </div>
                )}
            </div>
        </div>
    );
};