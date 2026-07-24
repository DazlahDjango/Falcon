// frontend/src/components/reports/common/ReportDateRangePicker.jsx
import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import './common.css';

export const ReportDateRangePicker = ({
    startDate = null,
    endDate = null,
    onApply,
    onClear,
    className = '',
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [localStart, setLocalStart] = useState(startDate || '');
    const [localEnd, setLocalEnd] = useState(endDate || '');
    const [preset, setPreset] = useState('');
    const pickerRef = useRef(null);

    useEffect(() => {
        setLocalStart(startDate || '');
        setLocalEnd(endDate || '');
    }, [startDate, endDate]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (pickerRef.current && !pickerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const presets = [
        { label: 'Today', days: 0 },
        { label: 'Last 7 Days', days: 7 },
        { label: 'Last 30 Days', days: 30 },
        { label: 'Last 90 Days', days: 90 },
        { label: 'This Month', days: 'month' },
        { label: 'This Year', days: 'year' },
    ];

    const handlePresetClick = (presetItem) => {
        setPreset(presetItem.label);
        const end = new Date();
        let start = new Date();
        if (presetItem.days === 'month') {
            start = new Date(end.getFullYear(), end.getMonth(), 1);
        } else if (presetItem.days === 'year') {
            start = new Date(end.getFullYear(), 0, 1);
        } else if (typeof presetItem.days === 'number') {
            start.setDate(start.getDate() - presetItem.days);
        }
        const formatDate = (date) => date.toISOString().split('T')[0];
        setLocalStart(formatDate(start));
        setLocalEnd(formatDate(end));
    };

    const handleApply = () => {
        if (localStart && localEnd) {
            onApply?.({ startDate: localStart, endDate: localEnd });
            setIsOpen(false);
        }
    };

    const handleClear = () => {
        setLocalStart('');
        setLocalEnd('');
        setPreset('');
        onClear?.();
        setIsOpen(false);
    };

    const displayValue = () => {
        if (startDate && endDate) {
            return `${startDate} - ${endDate}`;
        }
        return 'Select date range';
    };

    return (
        <div className={`report-date-range-picker ${className}`} ref={pickerRef}>
            <div className="date-range-display" onClick={() => setIsOpen(!isOpen)}>
                <span className="date-range-icon">📅</span>
                <span className="date-range-text">{displayValue()}</span>
                <span className="date-range-arrow">{isOpen ? '▲' : '▼'}</span>
            </div>
            {isOpen && (
                <div className="date-range-popover">
                    <div className="date-presets">
                        {presets.map((p) => (
                            <button
                                key={p.label}
                                className={`preset-btn ${preset === p.label ? 'active' : ''}`}
                                onClick={() => handlePresetClick(p)}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                    <div className="date-inputs">
                        <div className="date-input-group">
                            <label>Start</label>
                            <input
                                type="date"
                                value={localStart}
                                onChange={(e) => setLocalStart(e.target.value)}
                            />
                        </div>
                        <div className="date-input-group">
                            <label>End</label>
                            <input
                                type="date"
                                value={localEnd}
                                onChange={(e) => setLocalEnd(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="date-range-actions">
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

ReportDateRangePicker.propTypes = {
    startDate: PropTypes.string,
    endDate: PropTypes.string,
    onApply: PropTypes.func,
    onClear: PropTypes.func,
    className: PropTypes.string,
};