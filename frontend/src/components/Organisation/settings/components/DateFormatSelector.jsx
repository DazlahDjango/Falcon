import React from 'react';

const DateFormatSelector = ({ value, onChange, error }) => {
  const dateFormats = [
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY', example: '31/12/2024' },
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY', example: '12/31/2024' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD', example: '2024-12-31' },
    { value: 'DD-MM-YYYY', label: 'DD-MM-YYYY', example: '31-12-2024' },
    { value: 'MM-DD-YYYY', label: 'MM-DD-YYYY', example: '12-31-2024' },
  ];

  const getCurrentExample = () => {
    const format = dateFormats.find(f => f.value === value);
    return format ? format.example : 'DD/MM/YYYY';
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Date Format
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
      >
        {dateFormats.map(format => (
          <option key={format.value} value={format.value}>
            {format.label} (example: {format.example})
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      <p className="mt-1 text-xs text-gray-500">
        Example: {getCurrentExample()}
      </p>
    </div>
  );
};

export default DateFormatSelector;