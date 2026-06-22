// src/components/reviews/common/ReviewDateRangePicker.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';

const ReviewDateRangePicker = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onApply,
  onClear,
  label = 'Date Range',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleApply = () => {
    onApply?.();
    setIsOpen(false);
  };

  const handleClear = () => {
    onClear?.();
    setIsOpen(false);
  };

  return (
    <div className={`review-date-range-picker ${className}`}>
      <button
        className="review-date-range-toggle"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="review-date-range-label">{label}</span>
        <span className="review-date-range-value">
          {startDate && endDate
            ? `${startDate} - ${endDate}`
            : 'Select range'}
        </span>
        <span className="review-date-range-icon">📅</span>
      </button>
      {isOpen && (
        <div className="review-date-range-popover">
          <div className="review-date-range-inputs">
            <div className="review-date-range-input-group">
              <label>From</label>
              <input
                type="date"
                value={startDate || ''}
                onChange={(e) => onStartDateChange(e.target.value)}
              />
            </div>
            <div className="review-date-range-input-group">
              <label>To</label>
              <input
                type="date"
                value={endDate || ''}
                onChange={(e) => onEndDateChange(e.target.value)}
              />
            </div>
          </div>
          <div className="review-date-range-actions">
            <button className="btn btn-outline btn-sm" onClick={handleClear}>
              Clear
            </button>
            <button className="btn btn-primary btn-sm" onClick={handleApply}>
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

ReviewDateRangePicker.propTypes = {
  startDate: PropTypes.string,
  endDate: PropTypes.string,
  onStartDateChange: PropTypes.func.isRequired,
  onEndDateChange: PropTypes.func.isRequired,
  onApply: PropTypes.func,
  onClear: PropTypes.func,
  label: PropTypes.string,
  className: PropTypes.string,
};

export default ReviewDateRangePicker;