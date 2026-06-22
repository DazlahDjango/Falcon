// src/components/reviews/common/ReviewFilterBar.jsx
import React from 'react';
import PropTypes from 'prop-types';

const ReviewFilterBar = ({
  filters = [],
  onFilterChange,
  onClearAll,
  className = '',
}) => {
  const renderFilterInput = (filter) => {
    const { type, key, label, options, value, placeholder } = filter;

    const handleChange = (newValue) => {
      onFilterChange(key, newValue);
    };

    switch (type) {
      case 'select':
        return (
          <select
            className="review-filter-select"
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
          >
            <option value="">All {label}</option>
            {options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );
      case 'date':
        return (
          <input
            type="date"
            className="review-filter-input"
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={placeholder}
          />
        );
      case 'text':
        return (
          <input
            type="text"
            className="review-filter-input"
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={placeholder || label}
          />
        );
      case 'number':
        return (
          <input
            type="number"
            className="review-filter-input"
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={placeholder || label}
            min={0}
          />
        );
      default:
        return null;
    }
  };

  const hasActiveFilters = filters.some((f) => f.value && f.value !== '');

  return (
    <div className={`review-filter-bar ${className}`}>
      <div className="review-filter-list">
        {filters.map((filter) => (
          <div key={filter.key} className="review-filter-item">
            <label className="review-filter-label">{filter.label}</label>
            {renderFilterInput(filter)}
          </div>
        ))}
      </div>
      {hasActiveFilters && (
        <button className="review-filter-clear" onClick={onClearAll}>
          Clear All
        </button>
      )}
    </div>
  );
};

ReviewFilterBar.propTypes = {
  filters: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      type: PropTypes.oneOf(['select', 'date', 'text', 'number']).isRequired,
      value: PropTypes.any,
      options: PropTypes.arrayOf(
        PropTypes.shape({
          value: PropTypes.any.isRequired,
          label: PropTypes.string.isRequired,
        })
      ),
      placeholder: PropTypes.string,
    })
  ),
  onFilterChange: PropTypes.func.isRequired,
  onClearAll: PropTypes.func.isRequired,
  className: PropTypes.string,
};

export default ReviewFilterBar;