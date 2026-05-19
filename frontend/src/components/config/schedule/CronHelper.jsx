import { useState } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

const PRESETS = [
  { label: 'Every hour', value: '0 * * * *' },
  { label: 'Every 6 hours', value: '0 */6 * * *' },
  { label: 'Daily at 2 AM', value: '0 2 * * *' },
  { label: 'Daily at 2 AM (weekdays)', value: '0 2 * * 1-5' },
  { label: 'Weekly on Sunday', value: '0 2 * * 0' },
  { label: 'Monthly on 1st', value: '0 2 1 * *' },
  { label: 'Every 30 minutes', value: '*/30 * * * *' },
  { label: 'Every 15 minutes', value: '*/15 * * * *' }
];

export const CronHelper = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (cronValue) => {
    onChange(cronValue);
    setIsOpen(false);
  };

  return (
    <div className="relative mt-1">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
      >
        {isOpen ? <FiChevronUp /> : <FiChevronDown />}
        Common Cron Patterns
      </button>
      {isOpen && (
        <div className="absolute z-10 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg">
          {PRESETS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelect(preset.value)}
              className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
            >
              <div className="font-medium">{preset.label}</div>
              <div className="text-xs text-gray-500 font-mono">{preset.value}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};