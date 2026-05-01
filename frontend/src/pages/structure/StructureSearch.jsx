import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Building2, Users, Briefcase, User, MapPin, DollarSign, GitBranch } from 'lucide-react';
import { useStructureSearch, useSearchSuggestions } from '../../hooks/structure';
import { STRUCTURE_ROUTES } from '../../routes/structure.routes';

const StructureSearch = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [selectedType, setSelectedType] = useState('all');
  const { results, isLoading } = useStructureSearch(query);
  const { suggestions } = useSearchSuggestions(query);
  const getIcon = (type) => {
    switch (type) {
      case 'department':
        return <Building2 size={16} className="text-blue-500" />;
      case 'team':
        return <Users size={16} className="text-green-500" />;
      case 'position':
        return <Briefcase size={16} className="text-purple-500" />;
      case 'employment':
        return <User size={16} className="text-amber-500" />;
      case 'location':
        return <MapPin size={16} className="text-teal-500" />;
      case 'cost_center':
        return <DollarSign size={16} className="text-pink-500" />;
      default:
        return <GitBranch size={16} className="text-gray-500" />;
    }
  };
  const getRoute = (result) => {
    switch (result.type) {
      case 'department':
        return STRUCTURE_ROUTES.DEPARTMENT_DETAIL(result.id);
      case 'team':
        return STRUCTURE_ROUTES.TEAM_DETAIL(result.id);
      case 'position':
        return STRUCTURE_ROUTES.POSITION_DETAIL(result.id);
      case 'employment':
        return STRUCTURE_ROUTES.EMPLOYMENT_DETAIL(result.id);
      case 'location':
        return `${STRUCTURE_ROUTES.LOCATIONS}/${result.id}`;
      case 'cost_center':
        return `${STRUCTURE_ROUTES.COST_CENTERS}/${result.id}`;
      default:
        return '#';
    }
  };
  const handleSelect = (result) => {
    const route = getRoute(result);
    if (route !== '#') {
      navigate(route);
    }
    setQuery('');
    setIsFocused(false);
  };
  const filteredResults = selectedType === 'all' 
    ? results 
    : results?.filter(r => r.type === selectedType);

  return (
    <div className="relative">
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          placeholder="Search departments, teams, positions, employees..."
          className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          autoComplete="off"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        )}
      </div>
      {isFocused && query.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {/* Type Filters */}
          <div className="flex gap-1 p-2 border-b border-gray-100 bg-gray-50 sticky top-0">
            {['all', 'department', 'team', 'position', 'employment', 'location'].map(type => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-2.5 py-1 text-xs rounded-full capitalize transition-colors ${
                  selectedType === type
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {type === 'all' ? 'All' : type}
              </button>
            ))}
          </div>
          {isLoading && (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mx-auto mb-2" />
              Searching...
            </div>
          )}
          {!isLoading && filteredResults?.length === 0 && suggestions.length > 0 && (
            <div>
              <div className="px-3 py-2 text-xs font-medium text-gray-400 uppercase tracking-wider bg-gray-50">
                Suggestions
              </div>
              {suggestions.map((suggestion, idx) => (
                <div
                  key={idx}
                  onClick={() => setQuery(suggestion.label)}
                  className="px-3 py-2 hover:bg-gray-50 cursor-pointer flex items-center gap-2"
                >
                  <Search size={12} className="text-gray-400" />
                  <span className="text-sm">{suggestion.label}</span>
                </div>
              ))}
            </div>
          )}
          {!isLoading && filteredResults && filteredResults.length > 0 && (
            <div>
              <div className="px-3 py-2 text-xs font-medium text-gray-400 uppercase tracking-wider bg-gray-50">
                Results ({filteredResults.length})
              </div>
              {filteredResults.map((result, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelect(result)}
                  className="px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center gap-2">
                    {getIcon(result.type)}
                    <div className="flex-1">
                      <div className="font-medium text-sm text-gray-900">
                        {result.name || result.title || result.user_id}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-400 capitalize">{result.type}</span>
                        <span className="text-xs text-gray-300">•</span>
                        <span className="text-xs text-gray-500">{result.code || result.job_code}</span>
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          )}
          {!isLoading && filteredResults?.length === 0 && suggestions.length === 0 && query.length >= 2 && (
            <div className="p-4 text-center text-gray-500">
              <p>No results found for "{query}"</p>
              <p className="text-xs mt-1">Try different keywords or check spelling</p>
            </div>
          )}
          {query.length < 2 && (
            <div className="p-4 text-center text-gray-400 text-sm">
              Type at least 2 characters to search
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default StructureSearch;