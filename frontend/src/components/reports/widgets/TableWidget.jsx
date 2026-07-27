// frontend/src/components/reports/widgets/TableWidget.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FiChevronUp, FiChevronDown } from 'react-icons/fi';
import './widgets.css';

export const TableWidget = ({ widget, data }) => {
    const [sortField, setSortField] = useState(null);
    const [sortDirection, setSortDirection] = useState('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = widget?.config?.pageSize || 10;

    const columns = data?.columns || [];
    const rows = data?.rows || [];
    const totalRows = data?.total_rows || rows.length;

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const getSortedRows = () => {
        if (!sortField) return rows;
        const sorted = [...rows];
        const index = columns.indexOf(sortField);
        if (index === -1) return rows;
        sorted.sort((a, b) => {
            const aVal = a[index] || '';
            const bVal = b[index] || '';
            if (typeof aVal === 'number' && typeof bVal === 'number') {
                return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
            }
            return sortDirection === 'asc'
                ? String(aVal).localeCompare(String(bVal))
                : String(bVal).localeCompare(String(aVal));
        });
        return sorted;
    };

    const getPaginatedRows = () => {
        const sorted = getSortedRows();
        const start = (currentPage - 1) * pageSize;
        const end = start + pageSize;
        return sorted.slice(start, end);
    };

    const totalPages = Math.ceil(totalRows / pageSize);

    const paginatedRows = getPaginatedRows();

    if (!data || columns.length === 0) {
        return (
            <div className="table-placeholder">
                <p>No table data available</p>
            </div>
        );
    }

    return (
        <div className="table-widget">
            <div className="table-widget-wrapper">
                <table className="table-widget-table">
                    <thead>
                        <tr>
                            {columns.map((col, idx) => (
                                <th
                                    key={idx}
                                    onClick={() => data?.sortable !== false && handleSort(col)}
                                    className={data?.sortable !== false ? 'sortable' : ''}
                                >
                                    <span>{col}</span>
                                    {data?.sortable !== false && sortField === col && (
                                        <span className="sort-icon">
                                            {sortDirection === 'asc' ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                                        </span>
                                    )}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedRows.length > 0 ? (
                            paginatedRows.map((row, idx) => (
                                <tr key={idx}>
                                    {row.map((cell, cellIdx) => (
                                        <td key={cellIdx}>
                                            {cell !== undefined && cell !== null ? String(cell) : '-'}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length} className="empty-row">
                                    No data to display
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="table-pagination">
                    <button
                        className="page-btn"
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage <= 1}
                    >
                        Previous
                    </button>
                    <span className="page-info">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        className="page-btn"
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage >= totalPages}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

TableWidget.propTypes = {
    widget: PropTypes.object.isRequired,
    data: PropTypes.object,
};