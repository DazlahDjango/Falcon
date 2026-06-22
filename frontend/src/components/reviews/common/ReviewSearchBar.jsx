// src/components/reviews/common/ReviewSearchBar.jsx
import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { debounce } from 'lodash';

const ReviewSearchBar = ({
  value = '',
  onChange,
  placeholder = 'Search...',
  onSearch,
  debounceDelay = 300,
  className = '',
  size = 'md',
}) => {
  const [searchValue, setSearchValue] = useState(value);

  const debouncedSearch = useCallback(
    debounce((val) => {
      if (onSearch) {
        onSearch(val);
      }
      if (onChange) {
        onChange(val);
      }
    }, debounceDelay),
    [onSearch, onChange]
  );

  const handleChange = (e) => {
    const val = e.target.value;
    setSearchValue(val);
    debouncedSearch(val);
  };

  const handleClear = () => {
    setSearchValue('');
    if (onSearch) {
      onSearch('');
    }
    if (onChange) {
      onChange('');
    }
  };

  return (
    <div className={`review-search-bar ${className}`}>
      <span className="review-search-icon">🔍</span>
      <input
        type="text"
        className={`review-search-input review-search-${size}`}
        placeholder={placeholder}
        value={searchValue}
        onChange={handleChange}
      />
      {searchValue && (
        <button className="review-search-clear" onClick={handleClear}>
          ✕
        </button>
      )}
    </div>
  );
};

ReviewSearchBar.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  onSearch: PropTypes.func,
  debounceDelay: PropTypes.number,
  className: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
};

export default ReviewSearchBar;