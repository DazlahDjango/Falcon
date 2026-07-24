// frontend/src/components/reports/common/ReportPagination.jsx
import React from 'react';
import PropTypes from 'prop-types';
import './common.css';

export const ReportPagination = ({
    currentPage = 1,
    totalPages = 1,
    pageSize = 20,
    totalItems = 0,
    onPageChange,
    onPageSizeChange,
    showPageSize = true,
    className = '',
}) => {
    const pageSizeOptions = [10, 20, 50, 100];

    const getVisiblePages = () => {
        const pages = [];
        const maxVisible = 7;
        const halfVisible = Math.floor(maxVisible / 2);

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            let start = Math.max(2, currentPage - halfVisible);
            let end = Math.min(totalPages - 1, currentPage + halfVisible);

            if (start > 2) pages.push('...');
            for (let i = start; i <= end; i++) pages.push(i);
            if (end < totalPages - 1) pages.push('...');
            pages.push(totalPages);
        }
        return pages;
    };

    const handlePageChange = (page) => {
        if (page !== currentPage && page >= 1 && page <= totalPages) {
            onPageChange?.(page);
        }
    };

    const handlePageSizeChange = (e) => {
        onPageSizeChange?.(parseInt(e.target.value, 10));
    };

    if (totalPages <= 1 && totalItems <= pageSize) return null;

    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems);

    return (
        <div className={`report-pagination ${className}`}>
            <div className="pagination-info">
                <span>
                    Showing {startItem} - {endItem} of {totalItems} items
                </span>
            </div>
            <div className="pagination-controls">
                {showPageSize && (
                    <div className="page-size-selector">
                        <label htmlFor="page-size">Rows per page:</label>
                        <select
                            id="page-size"
                            value={pageSize}
                            onChange={handlePageSizeChange}
                        >
                            {pageSizeOptions.map((size) => (
                                <option key={size} value={size}>
                                    {size}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
                <div className="pagination-buttons">
                    <button
                        className="pagination-btn"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage <= 1}
                        aria-label="Previous page"
                    >
                        ‹
                    </button>
                    {getVisiblePages().map((page, index) => (
                        <button
                            key={index}
                            className={`pagination-btn ${page === currentPage ? 'active' : ''}`}
                            onClick={() => typeof page === 'number' && handlePageChange(page)}
                            disabled={page === '...'}
                        >
                            {page}
                        </button>
                    ))}
                    <button
                        className="pagination-btn"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages}
                        aria-label="Next page"
                    >
                        ›
                    </button>
                </div>
            </div>
        </div>
    );
};

ReportPagination.propTypes = {
    currentPage: PropTypes.number,
    totalPages: PropTypes.number,
    pageSize: PropTypes.number,
    totalItems: PropTypes.number,
    onPageChange: PropTypes.func,
    onPageSizeChange: PropTypes.func,
    showPageSize: PropTypes.bool,
    className: PropTypes.string,
};