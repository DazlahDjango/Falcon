import React from 'react';

const LanguageSelector = ({ value, onChange, error }) => {
  const languages = [
    { value: 'en', label: 'English', flag: '🇺🇸' },
    { value: 'fr', label: 'French', flag: '🇫🇷' },
    { value: 'es', label: 'Spanish', flag: '🇪🇸' },
    { value: 'de', label: 'German', flag: '🇩🇪' },
    { value: 'it', label: 'Italian', flag: '🇮🇹' },
    { value: 'pt', label: 'Portuguese', flag: '🇵🇹' },
    { value: 'nl', label: 'Dutch', flag: '🇳🇱' },
    { value: 'sw', label: 'Swahili', flag: '🇰🇪' },
    { value: 'ar', label: 'Arabic', flag: '🇸🇦' },
    { value: 'zh', label: 'Chinese', flag: '🇨🇳' },
    { value: 'ja', label: 'Japanese', flag: '🇯🇵' },
    { value: 'ko', label: 'Korean', flag: '🇰🇷' },
  ];

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Default Language
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
      >
        {languages.map(lang => (
          <option key={lang.value} value={lang.value}>
            {lang.flag} {lang.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default LanguageSelector;