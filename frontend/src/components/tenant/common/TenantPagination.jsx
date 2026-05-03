// frontend/src/components/tenant/common/TenantPagination.jsx
import React from 'react';
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from '../../../config/constants/tenantConstants';

export const TenantPagination = ({ page, totalPages, onPageChange, pageSize, onPageSizeChange, total }) => {
    const renderPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;

        let startPage = Math.max(1, page - Math.floor(maxVisible / 2));
        let endPage = Math.min(totalPages, startPage + maxVisible - 1);

        if (endPage - startPage + 1 < maxVisible) {
            startPage = Math.max(1, endPage - maxVisible + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => onPageChange(i)}
                    className={`px-3 py-1 mx-1 rounded ${page === i
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                >
                    {i}
                </button>
            );
        }

        return pages;
    };

    if (totalPages <= 1 && total <= pageSize) return null;

    return (
        <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Show</span>
                <select
                    value={pageSize}
                    onChange={(e) => onPageSizeChange(Number(e.target.value))}
                    className="px-2 py-1 border border-gray-300 rounded"
                >
                    {PAGE_SIZE_OPTIONS.map(option => (
                        <option key={option} value={option}>{option}</option>
                    ))}
                </select>
                <span>per page</span>
                {total > 0 && (
                    <span className="ml-2">
                        Showing {((page - 1) * pageSize) + 1} - {Math.min(page * pageSize, total)} of {total}
                    </span>
                )}
            </div>

            <div className="flex items-center gap-1">
                <button
                    onClick={() => onPageChange(page - 1)}
                    disabled={page === 1}
                    className="px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Previous
                </button>

                {renderPageNumbers()}

                <button
                    onClick={() => onPageChange(page + 1)}
                    disabled={page === totalPages}
                    className="px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Next
                </button>
            </div>
        </div>
    );
};