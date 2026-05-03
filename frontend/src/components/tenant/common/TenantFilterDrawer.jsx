// frontend/src/components/tenant/common/TenantFilterDrawer.jsx
import React, { useState } from 'react';
import { SUBSCRIPTION_PLAN, TENANT_STATUS } from '../../../config/constants/tenantConstants';

export const TenantFilterDrawer = ({ isOpen, onClose, filters, onApply, onReset }) => {
    const [localFilters, setLocalFilters] = useState(filters);

    const handleStatusChange = (status) => {
        setLocalFilters(prev => ({
            ...prev,
            status: prev.status === status ? undefined : status
        }));
    };

    const handlePlanChange = (plan) => {
        setLocalFilters(prev => ({
            ...prev,
            subscription_plan: prev.subscription_plan === plan ? undefined : plan
        }));
    };

    const handleSearchChange = (e) => {
        setLocalFilters(prev => ({
            ...prev,
            search: e.target.value
        }));
    };

    const handleApply = () => {
        onApply(localFilters);
        onClose();
    };

    const handleReset = () => {
        setLocalFilters({});
        onReset();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />

            {/* Drawer */}
            <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl z-50 transform transition-transform duration-300">
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex justify-between items-center p-4 border-b">
                        <h2 className="text-lg font-semibold">Filters</h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                            ✕
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-6">
                        {/* Search */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Search
                            </label>
                            <input
                                type="text"
                                value={localFilters.search || ''}
                                onChange={handleSearchChange}
                                placeholder="Name, slug, or email..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        {/* Status Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Status
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {Object.values(TENANT_STATUS).map(status => (
                                    <button
                                        key={status}
                                        onClick={() => handleStatusChange(status)}
                                        className={`px-3 py-1 rounded-full text-sm ${localFilters.status === status
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Subscription Plan Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Subscription Plan
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {Object.values(SUBSCRIPTION_PLAN).map(plan => (
                                    <button
                                        key={plan}
                                        onClick={() => handlePlanChange(plan)}
                                        className={`px-3 py-1 rounded-full text-sm ${localFilters.subscription_plan === plan
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        {plan}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t p-4 flex gap-3">
                        <button
                            onClick={handleApply}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Apply Filters
                        </button>
                        <button
                            onClick={handleReset}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                        >
                            Reset
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};