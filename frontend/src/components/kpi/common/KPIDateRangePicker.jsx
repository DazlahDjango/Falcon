import React, { useState, useRef, useEffect } from 'react';

const KPIDateRangePicker = ({ startDate, endDate, onRangeChange, placeholder = 'Select date range' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const pickerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const formatDate = (date) => {
        if (!date) return '';
        return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const getDisplayText = () => {
        if (startDate && endDate) {
            return `${formatDate(startDate)} - ${formatDate(endDate)}`;
        }
        return placeholder;
    };

    return (
        <div className="kpi-date-range" ref={pickerRef} onClick={() => setIsOpen(!isOpen)}>
            <span className="kpi-date-range-icon">📅</span>
            <span className="kpi-date-range-text">{getDisplayText()}</span>
            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    marginTop: '8px',
                    background: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    padding: '16px',
                    zIndex: 1000
                }}>
                    {/* Add your date picker library here (e.g., react-datepicker) */}
                    <div>Date picker coming soon</div>
                </div>
            )}
        </div>
    );
};

export default KPIDateRangePicker;