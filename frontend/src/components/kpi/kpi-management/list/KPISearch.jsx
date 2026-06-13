import React, { useState, useCallback } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import { debounce } from 'lodash';

const KPISearch = ({ value, onSearch, placeholder = "Search by name, code, or owner..." }) => {
    const [searchValue, setSearchValue] = useState(value);
    
    const debouncedSearch = useCallback(
        debounce((val) => {
            onSearch(val);
        }, 300),
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
        <div className="kpi-search">
            <FiSearch className="kpi-search-icon" size={16} />
            <input 
                type="text"
                className="kpi-search-input"
                placeholder={placeholder}
                value={searchValue}
                onChange={handleChange}
            />
            {searchValue && (
                <button className="kpi-search-clear" onClick={handleClear}>
                    <FiX size={14} />
                </button>
            )}
        </div>
    );
};

export default KPISearch;