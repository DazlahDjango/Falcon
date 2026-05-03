// frontend/src/components/tenant/common/TenantSearchBar.jsx
import React, { useState, useCallback, useEffect } from 'react';

export const TenantSearchBar = ({ onSearch, placeholder = "Search tenants...", initialValue = "", debounceMs = 300 }) => {
    const [value, setValue] = useState(initialValue);
    const [isLoading, setIsLoading] = useState(false);
    const [debounceTimer, setDebounceTimer] = useState(null);

    const performSearch = useCallback(async (searchValue) => {
        if (onSearch) {
            setIsLoading(true);
            await onSearch(searchValue);
            setIsLoading(false);
        }
    }, [onSearch]);

    // Debounced search
    useEffect(() => {
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }

        const timer = setTimeout(() => {
            performSearch(value);
        }, debounceMs);

        setDebounceTimer(timer);

        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [value, debounceMs, performSearch]);

    const handleClear = () => {
        setValue('');
        if (onSearch) onSearch('');
    };

    return (
        <div className="flex items-center gap-2 w-full">
            <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <input
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white"
                    placeholder={placeholder}
                />
                {value && (
                    <button
                        onClick={handleClear}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        aria-label="Clear search"
                    >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
                {isLoading && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <svg className="h-4 w-4 animate-spin text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                    </div>
                )}
            </div>
        </div>
    );
};