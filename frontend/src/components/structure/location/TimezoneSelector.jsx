import React, { useState } from 'react';
import { Clock, ChevronDown } from 'lucide-react';

const timezones = [
  { value: 'Africa/Nairobi', label: 'East Africa Time (EAT)', offset: '+3' },
  { value: 'Africa/Johannesburg', label: 'South Africa Standard Time', offset: '+2' },
  { value: 'Africa/Lagos', label: 'West Africa Time', offset: '+1' },
  { value: 'Africa/Cairo', label: 'Eastern European Time', offset: '+2' },
  { value: 'America/New_York', label: 'Eastern Time', offset: '-5' },
  { value: 'America/Chicago', label: 'Central Time', offset: '-6' },
  { value: 'America/Denver', label: 'Mountain Time', offset: '-7' },
  { value: 'America/Los_Angeles', label: 'Pacific Time', offset: '-8' },
  { value: 'Europe/London', label: 'Greenwich Mean Time', offset: '+0' },
  { value: 'Europe/Paris', label: 'Central European Time', offset: '+1' },
  { value: 'Europe/Moscow', label: 'Moscow Time', offset: '+3' },
  { value: 'Asia/Dubai', label: 'Gulf Standard Time', offset: '+4' },
  { value: 'Asia/Kolkata', label: 'India Standard Time', offset: '+5.5' },
  { value: 'Asia/Shanghai', label: 'China Standard Time', offset: '+8' },
  { value: 'Asia/Tokyo', label: 'Japan Standard Time', offset: '+9' },
  { value: 'Australia/Sydney', label: 'Australian Eastern Time', offset: '+10' },
  { value: 'Pacific/Auckland', label: 'New Zealand Time', offset: '+12' },
];

const TimezoneSelector = ({ value, onChange, placeholder = 'Select timezone', className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const selectedTimezone = timezones.find(tz => tz.value === value);
  const filteredTimezones = timezones.filter(tz =>
    tz.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tz.value.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const handleSelect = (timezone) => {
    onChange(timezone.value);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-gray-400" />
          <span className={selectedTimezone ? 'text-gray-900' : 'text-gray-500'}>
            {selectedTimezone ? `${selectedTimezone.label} (UTC${selectedTimezone.offset})` : placeholder}
          </span>
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
              placeholder="Search timezone..."
              className="w-full px-2 py-1 border border-gray-200 rounded text-sm"
              autoFocus
            />
          </div>
          <div className="max-h-60 overflow-y-auto">
            {filteredTimezones.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500 text-center">No timezones found</div>
            ) : (
              filteredTimezones.map(tz => (
                <div
                  key={tz.value}
                  onClick={() => handleSelect(tz)}
                  className="px-3 py-2 hover:bg-gray-50 cursor-pointer flex items-center justify-between border-b last:border-b-0"
                >
                  <div>
                    <div className="text-sm font-medium">{tz.label}</div>
                    <div className="text-xs text-gray-400 font-mono">{tz.value}</div>
                  </div>
                  <div className="text-xs text-gray-500">UTC{tz.offset}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default TimezoneSelector;