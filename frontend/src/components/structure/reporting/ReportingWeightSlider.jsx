import React from 'react';

const ReportingWeightSlider = ({ value, onChange, size = 'md', disabled = false, className = '' }) => {
  const percentage = Math.round(value * 100);
  const sizeClasses = {
    sm: 'w-24',
    md: 'w-32',
    lg: 'w-48',
  };
  const handleChange = (e) => {
    const newValue = parseFloat(e.target.value);
    onChange(newValue);
  };

  return (
    <div className={`weight-slider-container ${className}`}>
      <div className="flex items-center gap-2">
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={value}
          onChange={handleChange}
          disabled={disabled}
          className={`weight-slider ${sizeClasses[size]}`}
        />
        <span className={`weight-value text-${size === 'sm' ? 'xs' : 'sm'}`}>
          {percentage}%
        </span>
      </div>
    </div>
  );
};
export default ReportingWeightSlider;