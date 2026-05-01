import React, { useState } from 'react';
import { ChevronDown, Globe } from 'lucide-react';

const countries = [
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪' },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦' },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬' },
  { code: 'GH', name: 'Ghana', flag: '🇬🇭' },
  { code: 'AE', name: 'UAE', flag: '🇦🇪' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'CN', name: 'China', flag: '🇨🇳' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
];

const CountrySelector = ({ value, onChange, placeholder = 'Select country', className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const selectedCountry = countries.find(c => c.code === value || c.name === value);
  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.code.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const handleSelect = (country) => {
    onChange(country.code);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className={`country-selector relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <div className="flex items-center gap-2">
          <Globe size={14} className="text-gray-400" />
          {selectedCountry ? (
            <>
              <span className="text-lg">{selectedCountry.flag}</span>
              <span className="text-gray-900">{selectedCountry.name}</span>
            </>
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          )}
        </div>
        <ChevronDown size={16} className="text-gray-400" />
      </button>
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
          <div className="p-2 border-b">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search country..."
              className="w-full px-2 py-1 border border-gray-200 rounded text-sm"
              autoFocus
            />
          </div>
          <div className="max-h-60 overflow-y-auto">
            {filteredCountries.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500 text-center">No countries found</div>
            ) : (
              filteredCountries.map(country => (
                <div
                  key={country.code}
                  onClick={() => handleSelect(country)}
                  className="px-3 py-2 hover:bg-gray-50 cursor-pointer flex items-center gap-3 border-b last:border-b-0"
                >
                  <span className="text-xl">{country.flag}</span>
                  <div>
                    <div className="text-sm font-medium">{country.name}</div>
                    <div className="text-xs text-gray-400">{country.code}</div>
                  </div>
                  {selectedCountry?.code === country.code && (
                    <span className="ml-auto text-green-500 text-xs">✓</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default CountrySelector;