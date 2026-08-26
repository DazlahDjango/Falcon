import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const KPIPagination = ({ 
    currentPage = 1, 
    pageSize = 20,
    total = 0,
    totalPages = 1, 
    onPageChange,
    onPageSizeChange,
    pageSizeOptions = [10, 20, 50, 100],
    itemCount = null,
    isLoading = false,
    siblingsCount = 1
}) => {
    const calculatedTotalPages = totalPages || Math.max(1, Math.ceil(total / (pageSize || 1)));
    const displayedCount = itemCount != null ? itemCount : Math.min(pageSize, total);

    const range = (start, end) => {
        const length = end - start + 1;
        return Array.from({ length }, (_, i) => start + i);
    };

    const getPageNumbers = () => {
        const totalNumbers = siblingsCount * 2 + 3;
        const totalBlocks = totalNumbers + 2;

        if (calculatedTotalPages <= totalBlocks) {
            return range(1, calculatedTotalPages);
        }

        const leftSiblingIndex = Math.max(currentPage - siblingsCount, 1);
        const rightSiblingIndex = Math.min(currentPage + siblingsCount, calculatedTotalPages);

        const showLeftDots = leftSiblingIndex > 2;
        const showRightDots = rightSiblingIndex < calculatedTotalPages - 1;

        if (!showLeftDots && showRightDots) {
            const leftItems = range(1, totalNumbers);
            return [...leftItems, '...', calculatedTotalPages];
        }

        if (showLeftDots && !showRightDots) {
            const rightItems = range(calculatedTotalPages - totalNumbers + 1, calculatedTotalPages);
            return [1, '...', ...rightItems];
        }

        if (showLeftDots && showRightDots) {
            const middleItems = range(leftSiblingIndex, rightSiblingIndex);
            return [1, '...', ...middleItems, '...', calculatedTotalPages];
        }

        return range(1, calculatedTotalPages);
    };

    return (
        <div className="kpi-pagination">
            <div className="kpi-pagination-info">
                Showing {displayedCount} of {total} KPIs
            </div>
            
            <div className="kpi-pagination-controls">
                {onPageSizeChange && (
                    <select
                        value={pageSize}
                        onChange={(e) => onPageSizeChange(Number(e.target.value))}
                        className="kpi-pagination-select"
                        disabled={isLoading}
                    >
                        {pageSizeOptions.map(size => (
                            <option key={size} value={size}>{size}</option>
                        ))}
                    </select>
                )}

                <button
                    className="kpi-pagination-btn"
                    onClick={() => onPageChange && onPageChange(currentPage - 1)}
                    disabled={currentPage <= 1 || isLoading}
                    aria-label="Previous Page"
                >
                    <FiChevronLeft />
                </button>
                
                {getPageNumbers().map((page, index) => (
                    <React.Fragment key={index}>
                        {page === '...' ? (
                            <span className="kpi-pagination-ellipsis">...</span>
                        ) : (
                            <button
                                className={`kpi-pagination-btn ${currentPage === page ? 'active' : ''}`}
                                onClick={() => onPageChange && onPageChange(page)}
                                disabled={isLoading}
                            >
                                {page}
                            </button>
                        )}
                    </React.Fragment>
                ))}
                
                <button
                    className="kpi-pagination-btn"
                    onClick={() => onPageChange && onPageChange(currentPage + 1)}
                    disabled={currentPage >= calculatedTotalPages || isLoading}
                    aria-label="Next Page"
                >
                    <FiChevronRight />
                </button>
            </div>
        </div>
    );
};

export default KPIPagination;