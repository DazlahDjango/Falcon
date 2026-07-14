import React, { useState, useCallback, useRef, useEffect } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';

export const StructureSearchBar = ({
  value = '',
  onChange,
  onSearch,
  placeholder = 'Search...',
  debounce = 300,
  className = '',
  autoFocus = false,
}) => {
  const [searchValue, setSearchValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);
  const debounceTimer = useRef(null);

  useEffect(() => {
    setSearchValue(value);
  }, [value]);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleChange = useCallback((e) => {
    const newValue = e.target.value;
    setSearchValue(newValue);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      if (onChange) {
        onChange(newValue);
      }
      if (onSearch) {
        onSearch(newValue);
      }
    }, debounce);
  }, [onChange, onSearch, debounce]);

  const handleClear = useCallback(() => {
    setSearchValue('');
    if (onChange) onChange('');
    if (onSearch) onSearch('');
    if (inputRef.current) inputRef.current.focus();
  }, [onChange, onSearch]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      if (onSearch) {
        onSearch(searchValue);
      }
    }
  }, [searchValue, onSearch]);

  return (
    <div className={`structure-search-bar ${className} ${isFocused ? 'focused' : ''}`}>
      <FiSearch className="search-icon" size={18} />
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={searchValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="search-input"
      />
      {searchValue && (
        <button onClick={handleClear} className="clear-btn">
          <FiX size={16} />
        </button>
      )}
    </div>
  );
};

export default StructureSearchBar;
