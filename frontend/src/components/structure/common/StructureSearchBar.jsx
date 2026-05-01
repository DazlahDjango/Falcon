import React, { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';

const StructureSearchBar = ({ onSearch, onSelect, placeholder = 'Search departments, teams, positions...', className = '' }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const handleSearch = async (value) => {
    setQuery(value);
    if (value.length >= 2 && onSearch) {
      setIsLoading(true);
      try {
        const searchResults = await onSearch(value);
        setResults(searchResults || []);
        setShowResults(true);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsLoading(false);
      }
    } else {
      setResults([]);
      setShowResults(false);
    }
  };
  const handleSelect = (item) => {
    setQuery('');
    setResults([]);
    setShowResults(false);
    if (onSelect) {
      onSelect(item);
    }
  };
  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setShowResults(false);
  };

  return (
    <div ref={searchRef} className={`structure-search-bar ${className}`}>
      <Search size={16} className="structure-search-icon" />
      <input
        type="text"
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder={placeholder}
        className="structure-search-input"
      />
      {query && (
        <button onClick={clearSearch} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
          <X size={14} />
        </button>
      )}
      {showResults && (
        <div className="structure-search-results">
          {isLoading && (
            <div className="p-3 text-center text-gray-500">Searching...</div>
          )}
          {!isLoading && results.length === 0 && query.length >= 2 && (
            <div className="p-3 text-center text-gray-500">No results found</div>
          )}
          {results.map((result, index) => (
            <div
              key={result.id || index}
              className="p-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
              onClick={() => handleSelect(result)}
            >
              <div className="font-medium text-sm">{result.name || result.title}</div>
              <div className="text-xs text-gray-500">
                {result.type} • {result.code || result.job_code}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StructureSearchBar;