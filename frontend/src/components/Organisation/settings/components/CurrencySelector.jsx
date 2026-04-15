import React from 'react';

const CurrencySelector = ({ value, onChange, error }) => {
  const currencies = [
    { value: 'USD', label: 'USD - US Dollar', symbol: '$' },
    { value: 'EUR', label: 'EUR - Euro', symbol: '€' },
    { value: 'GBP', label: 'GBP - British Pound', symbol: '£' },
    { value: 'KES', label: 'KES - Kenyan Shilling', symbol: 'KSh' },
    { value: 'NGN', label: 'NGN - Nigerian Naira', symbol: '₦' },
    { value: 'ZAR', label: 'ZAR - South African Rand', symbol: 'R' },
    { value: 'AED', label: 'AED - UAE Dirham', symbol: 'د.إ' },
    { value: 'SAR', label: 'SAR - Saudi Riyal', symbol: '﷼' },
    { value: 'INR', label: 'INR - Indian Rupee', symbol: '₹' },
    { value: 'CNY', label: 'CNY - Chinese Yuan', symbol: '¥' },
    { value: 'JPY', label: 'JPY - Japanese Yen', symbol: '¥' },
    { value: 'AUD', label: 'AUD - Australian Dollar', symbol: 'A$' },
    { value: 'CAD', label: 'CAD - Canadian Dollar', symbol: 'C$' },
  ];

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Default Currency
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
      >
        {currencies.map(curr => (
          <option key={curr.value} value={curr.value}>{curr.label}</option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default CurrencySelector;