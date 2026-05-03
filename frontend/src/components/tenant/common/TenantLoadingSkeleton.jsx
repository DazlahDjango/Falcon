// frontend/src/components/tenant/common/TenantLoadingSkeleton.jsx
import React from 'react';

export const TenantLoadingSkeleton = ({ type = 'card', count = 3 }) => {
    if (type === 'card') {
        return (
            <div className="space-y-4">
                {[...Array(count)].map((_, i) => (
                    <div key={i} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-200" />
                            <div className="flex-1">
                                <div className="h-5 bg-gray-200 rounded w-1/3 mb-2" />
                                <div className="h-4 bg-gray-200 rounded w-1/2 mb-1" />
                                <div className="h-4 bg-gray-200 rounded w-1/4" />
                            </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-100">
                            <div className="h-3 bg-gray-200 rounded w-1/4" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (type === 'table') {
        return (
            <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {[...Array(5)].map((_, i) => (
                                    <th key={i} className="px-6 py-3">
                                        <div className="h-4 bg-gray-200 rounded w-20" />
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {[...Array(count)].map((_, i) => (
                                <tr key={i}>
                                    {[...Array(5)].map((_, j) => (
                                        <td key={j} className="px-6 py-4">
                                            <div className="h-4 bg-gray-200 rounded w-full" />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    if (type === 'detail') {
        return (
            <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-gray-200" />
                    <div className="flex-1">
                        <div className="h-6 bg-gray-200 rounded w-1/3 mb-2" />
                        <div className="h-4 bg-gray-200 rounded w-1/4" />
                    </div>
                </div>
                <div className="space-y-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i}>
                            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
                            <div className="h-10 bg-gray-200 rounded w-full" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return null;
};