import React from 'react';

const KPIPagination = ({ 
    currentPage, 
    totalPages, 
    onPageChange,
    siblingsCount = 1
}) => {
    const range = (start, end) => {
        const length = end - start + 1;
        return Array.from({ length }, (_, i) => start + i);
    };

    const getPageNumbers = () => {
        const totalNumbers = siblingsCount * 2 + 3;
        const totalBlocks = totalNumbers + 2;

        if (totalPages <= totalBlocks) {
            return range(1, totalPages);
        }

        const leftSiblingIndex = Math.max(currentPage - siblingsCount, 1);
        const rightSiblingIndex = Math.min(currentPage + siblingsCount, totalPages);

        const showLeftDots = leftSiblingIndex > 2;
        const showRightDots = rightSiblingIndex < totalPages - 1;

        if (!showLeftDots && showRightDots) {
            const leftItems = range(1, totalNumbers);
            return [...leftItems, '...', totalPages];
        }

        if (showLeftDots && !showRightDots) {
            const rightItems = range(totalPages - totalNumbers + 1, totalPages);
            return [1, '...', ...rightItems];
        }

        if (showLeftDots && showRightDots) {
            const middleItems = range(leftSiblingIndex, rightSiblingIndex);
            return [1, '...', ...middleItems, '...', totalPages];
        }

        return range(1, totalPages);
    };

    if (totalPages <= 1) return null;

    return (
        <div className="kpi-pagination">
            <button
                className="kpi-pagination-btn"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
            >
                ←
            </button>
            
            {getPageNumbers().map((page, index) => (
                <React.Fragment key={index}>
                    {page === '...' ? (
                        <span className="kpi-pagination-ellipsis">...</span>
                    ) : (
                        <button
                            className={`kpi-pagination-btn ${currentPage === page ? 'active' : ''}`}
                            onClick={() => onPageChange(page)}
                        >
                            {page}
                        </button>
                    )}
                </React.Fragment>
            ))}
            
            <button
                className="kpi-pagination-btn"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
            >
                →
            </button>
        </div>
    );
};

export default KPIPagination;