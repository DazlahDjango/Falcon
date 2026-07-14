import React, { useMemo } from 'react';
import {
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
} from 'react-icons/fi';

export const StructurePagination = ({
  currentPage = 1,
  totalPages = 1,
  pageSize = 20,
  totalItems = 0,
  pageSizeOptions = [10, 20, 50, 100],
  onPageChange,
  onPageSizeChange,
  className = '',
}) => {
  const startIndex = useMemo(() => (currentPage - 1) * pageSize + 1, [currentPage, pageSize]);
  const endIndex = useMemo(() => Math.min(currentPage * pageSize, totalItems), [currentPage, pageSize, totalItems]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  const handlePageSizeChange = (e) => {
    const newSize = parseInt(e.target.value, 10);
    if (onPageSizeChange) {
      onPageSizeChange(newSize);
    }
  };

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push('...');
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages) {
      if (end < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  };

  if (totalItems === 0) return null;

  return (
    <div className={`structure-pagination ${className}`}>
      <div className="pagination-info">
        <span>
          Showing {startIndex} - {endIndex} of {totalItems} items
        </span>
        <select
          value={pageSize}
          onChange={handlePageSizeChange}
          className="page-size-select"
        >
          {pageSizeOptions.map(size => (
            <option key={size} value={size}>
              {size} per page
            </option>
          ))}
        </select>
      </div>
      <div className="pagination-controls">
        <button
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
          className="page-nav-btn"
        >
          <FiChevronsLeft size={16} />
        </button>
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="page-nav-btn"
        >
          <FiChevronLeft size={16} />
        </button>
        <div className="page-numbers">
          {renderPageNumbers().map((page, index) => (
            typeof page === 'number' ? (
              <button
                key={index}
                onClick={() => handlePageChange(page)}
                className={`page-number ${page === currentPage ? 'active' : ''}`}
              >
                {page}
              </button>
            ) : (
              <span key={index} className="page-ellipsis">{page}</span>
            )
          ))}
        </div>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="page-nav-btn"
        >
          <FiChevronRight size={16} />
        </button>
        <button
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="page-nav-btn"
        >
          <FiChevronsRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default StructurePagination;
