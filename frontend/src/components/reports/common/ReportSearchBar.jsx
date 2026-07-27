// frontend/src/components/reports/common/ReportSearchBar.jsx
import React, { useState, useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import './common.css';

export const ReportSearchBar = ({
    value = '',
    onChange,
    onSearch,
    placeholder = 'Search reports...',
    debounceDelay = 300,
    className = '',
}) => {
    const [localValue, setLocalValue] = useState(value);
    const debounceTimer = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    const handleChange = useCallback(
        (e) => {
            const newValue = e.target.value;
            setLocalValue(newValue);
            onChange?.(newValue);

            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }

            debounceTimer.current = setTimeout(() => {
                onSearch?.(newValue);
            }, debounceDelay);
        },
        [onChange, onSearch, debounceDelay]
    );

    const handleKeyDown = useCallback(
        (e) => {
            if (e.key === 'Enter') {
                if (debounceTimer.current) {
                    clearTimeout(debounceTimer.current);
                }
                onSearch?.(localValue);
            }
            if (e.key === 'Escape') {
                setLocalValue('');
                onChange?.('');
                onSearch?.('');
                inputRef.current?.blur();
            }
        },
        [localValue, onSearch, onChange]
    );

    const handleClear = useCallback(() => {
        setLocalValue('');
        onChange?.('');
        onSearch?.('');
        inputRef.current?.focus();
    }, [onChange, onSearch]);

    return (
        <div className={`report-search-bar ${className}`}>
            <div className="search-icon">🔍</div>
            <input
                ref={inputRef}
                type="text"
                className="search-input"
                placeholder={placeholder}
                value={localValue}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                aria-label="Search reports"
            />
            {localValue && (
                <button className="search-clear" onClick={handleClear} aria-label="Clear search">
                    ✕
                </button>
            )}
        </div>
    );
};

ReportSearchBar.propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func,
    onSearch: PropTypes.func,
    placeholder: PropTypes.string,
    debounceDelay: PropTypes.number,
    className: PropTypes.string,
};