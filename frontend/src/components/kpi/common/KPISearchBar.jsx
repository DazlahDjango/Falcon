import React, { useState, useCallback } from 'react';
import { debounce } from 'lodash';

const KPISearchBar = ({ value = '', onSearch, placeholder = 'Search...', debounceMs = 300 }) => {
    const [searchValue, setSearchValue] = useState(value);

    const debouncedSearch = useCallback(
        debounce((val) => {
            onSearch(val);
        }, debounceMs),
        [onSearch]
    );

    const handleChange = (e) => {
        const newValue = e.target.value;
        setSearchValue(newValue);
        debouncedSearch(newValue);
    };

    const handleClear = () => {
        setSearchValue('');
        onSearch('');
    };

    return (
        <div className="kpi-search-bar">
            <span className="kpi-search-icon">🔍</span>
            <input
                type="text"
                className="kpi-search-input"
                placeholder={placeholder}
                value={searchValue}
                onChange={handleChange}
            />
            {searchValue && (
                <button className="kpi-search-clear" onClick={handleClear}>
                    ✕
                </button>
            )}
        </div>
    );
};

export default KPISearchBar;