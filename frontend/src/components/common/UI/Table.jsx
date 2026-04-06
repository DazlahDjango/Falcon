import React, { useState } from 'react';
import { FiChevronUp, FiChevronDown, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const Table = ({
    columns,
    data,
    loading = false,
    selectable = false,
    selectedRows = [],
    onSelectRow,
    onSelectAll,
    sortable = false,
    onSort,
    pagination = false,
    page = 1,
    pageSize = 10,
    totalItems = 0,
    onPageChange,
    emptyMessage = 'No data available',
    className = ''
}) => {
    const [sortField, setSortField] = useState(null);
    const [sortDirection, setSortDirection] = useState('asc');
    const totalPages = Math.ceil(totalItems / pageSize);
    const handleSort = (field) => {
        let direction = 'asc';
        if (sortField === field && sortDirection === 'asc') {
            direction = 'desc';
        }
        setSortField(field);
        setSortDirection(direction);
        if (onSort) {
            onSort(field, direction);
        }
    };
    const renderSortIcon = (field) => {
        if (sortField !== field) return null;
        return sortDirection === 'asc' ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />;
    };
    const handleSelectAll = (e) => {
        if (onSelectAll) {
            onSelectAll(e.target.checked);
        }
    };
    const handleSelectRow = (rowId) => {
        if (onSelectRow) {
            onSelectRow(rowId);
        }
    };
    return (
        <div className={`data-table-container ${className}`}>
            <div className="table-wrapper">
                <table className="data-table">
                    <thead>
                        <tr>
                            {selectable && (
                                <th className="table-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={selectedRows.length === data.length && data.length > 0}
                                        onChange={handleSelectAll}
                                        disabled={loading || data.length === 0}
                                    />
                                </th>
                            )}
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    className={col.className}
                                    style={{ width: col.width }}
                                >
                                    {sortable && col.sortable !== false ? (
                                        <button
                                            className="sortable-header"
                                            onClick={() => handleSort(col.key)}
                                        >
                                            {col.header}
                                            {renderSortIcon(col.key)}
                                        </button>
                                    ) : (
                                        <span>{col.header}</span>
                                    )}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={columns.length + (selectable ? 1 : 0)} className="table-loading">
                                    <div className="loading-spinner">
                                        <div className="spinner"></div>
                                        <span>Loading...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : data.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length + (selectable ? 1 : 0)} className="table-empty">
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            data.map((row, index) => (
                                <tr key={row.id || index} className={row.rowClassName}>
                                    {selectable && (
                                        <td className="table-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={selectedRows.includes(row.id)}
                                                onChange={() => handleSelectRow(row.id)}
                                            />
                                        </td>
                                    )}
                                    {columns.map((col) => (
                                        <td
                                            key={col.key}
                                            className={col.cellClassName}
                                        >
                                            {col.render
                                                ? col.render(row[col.key], row)
                                                : row[col.key]}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            {pagination && totalPages > 1 && (
                <div className="table-pagination">
                    <div className="pagination-info">
                        Showing {(page - 1) * pageSize + 1} to{' '}
                        {Math.min(page * pageSize, totalItems)} of {totalItems} results
                    </div>
                    <div className="pagination-controls">
                        <button
                            className="pagination-btn"
                            onClick={() => onPageChange(page - 1)}
                            disabled={page === 1}
                        >
                            <FiChevronLeft size={16} />
                            Previous
                        </button>
                        <div className="pagination-pages">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum;
                                if (totalPages <= 5) {
                                    pageNum = i + 1;
                                } else if (page <= 3) {
                                    pageNum = i + 1;
                                } else if (page >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i;
                                } else {
                                    pageNum = page - 2 + i;
                                }
                                return (
                                    <button
                                        key={pageNum}
                                        className={`pagination-page ${page === pageNum ? 'active' : ''}`}
                                        onClick={() => onPageChange(pageNum)}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                        </div>
                        <button
                            className="pagination-btn"
                            onClick={() => onPageChange(page + 1)}
                            disabled={page === totalPages}
                        >
                            Next
                            <FiChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
export default Table;