import React, { useState } from 'react';
import { FiSearch, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const ReferenceDataTable = ({ data, type, columns }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 20;
    
    const getColumnLabel = (col) => {
        const labels = {
            full_name: 'Name',
            email: 'Email',
            role: 'Role',
            department: 'Department',
            name: 'Department Name',
            code: 'Code',
            parent_name: 'Parent Department'
        };
        return labels[col] || col;
    };
    
    const getValue = (item, col) => {
        if (col === 'full_name') {
            return `${item.first_name || ''} ${item.last_name || ''}`.trim() || item.email;
        }
        if (col === 'department') {
            return item.department_name || item.department || '-';
        }
        if (col === 'parent_name') {
            return item.parent_name || '-';
        }
        return item[col] || '-';
    };
    
    const filteredData = data.filter(item => {
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();
        return columns.some(col => {
            const value = getValue(item, col);
            return String(value).toLowerCase().includes(searchLower);
        });
    });
    
    const totalPages = Math.ceil(filteredData.length / pageSize);
    const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    
    return (
        <div className="reference-table-container">
            <div className="reference-search">
                <FiSearch size={14} />
                <input 
                    type="text"
                    placeholder={`Search ${type}...`}
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                    }}
                />
                <span className="record-count">{filteredData.length} records</span>
            </div>
            
            <div className="table-wrapper">
                <table className="reference-table">
                    <thead>
                        <tr>
                            {columns.map(col => (
                                <th key={col}>{getColumnLabel(col)}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.map((item, idx) => (
                            <tr key={idx}>
                                {columns.map(col => (
                                    <td key={col}>{getValue(item, col)}</td>
                                ))}
                            </tr>
                        ))}
                        {paginatedData.length === 0 && (
                            <tr>
                                <td colSpan={columns.length} className="no-data">
                                    No {type} found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            
            {totalPages > 1 && (
                <div className="reference-pagination">
                    <button 
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => p - 1)}
                    >
                        <FiChevronLeft size={14} />
                    </button>
                    <span>Page {currentPage} of {totalPages}</span>
                    <button 
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(p => p + 1)}
                    >
                        <FiChevronRight size={14} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default ReferenceDataTable;