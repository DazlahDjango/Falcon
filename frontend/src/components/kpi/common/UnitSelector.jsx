import React, { useState, useEffect } from 'react';
import { FiEdit3 } from 'react-icons/fi';

const UNIT_PRESETS = {
    FINANCIAL: [
        { value: 'KES', label: 'KES (KSh - Kenyan Shilling)' },
        { value: 'USD', label: 'USD ($ - US Dollar)' },
        { value: 'EUR', label: 'EUR (€ - Euro)' },
        { value: 'GBP', label: 'GBP (£ - British Pound)' },
        { value: 'ZAR', label: 'ZAR (R - South African Rand)' },
        { value: 'UGX', label: 'UGX (Ugandan Shilling)' },
        { value: 'TZS', label: 'TZS (Tanzanian Shilling)' },
        { value: 'RWF', label: 'RWF (Rwandan Franc)' }
    ],
    PERCENTAGE: [
        { value: '%', label: '% (Percentage)' }
    ],
    COUNT: [
        { value: 'Units', label: 'Units' },
        { value: 'Count', label: 'Count / Quantity' },
        { value: 'Items', label: 'Items' },
        { value: 'People', label: 'People / Staff / Clients' },
        { value: 'Requests', label: 'Requests / Tickets' },
        { value: 'Transactions', label: 'Transactions' },
        { value: 'Shifts', label: 'Shifts / Sessions' }
    ],
    TIME: [
        { value: 'Hours', label: 'Hours (hrs)' },
        { value: 'Days', label: 'Days' },
        { value: 'Minutes', label: 'Minutes (mins)' },
        { value: 'Weeks', label: 'Weeks' },
        { value: 'Seconds', label: 'Seconds (secs)' }
    ],
    MILESTONE: [
        { value: 'Yes/No', label: 'Yes / No Status' },
        { value: 'Milestone', label: 'Milestone Stage' },
        { value: '%', label: '% Progress' }
    ],
    IMPACT: [
        { value: 'Score (1-5)', label: 'Score (1-5)' },
        { value: 'Score (1-10)', label: 'Score (1-10)' },
        { value: 'Rating', label: 'Rating (Stars / Points)' }
    ]
};

const DEFAULT_PRESETS = [
    { value: 'Units', label: 'Units' },
    { value: '%', label: '% (Percentage)' },
    { value: 'KES', label: 'KES (Kenyan Shilling)' },
    { value: 'USD', label: 'USD (US Dollar)' },
    { value: 'Hours', label: 'Hours' },
    { value: 'Days', label: 'Days' },
    { value: 'People', label: 'People' }
];

const UnitSelector = ({ kpiType, value = '', onChange, required = false, className = '' }) => {
    const currentOptions = UNIT_PRESETS[kpiType] || DEFAULT_PRESETS;
    
    // Check if current value exists in presets
    const isValueInPreset = currentOptions.some(opt => opt.value === value);
    const [isCustom, setIsCustom] = useState(!isValueInPreset && value !== '');
    const [customValue, setCustomValue] = useState(!isValueInPreset ? value : '');

    useEffect(() => {
        const inPreset = currentOptions.some(opt => opt.value === value);
        if (!inPreset && value !== '' && value !== 'OTHER') {
            setIsCustom(true);
            setCustomValue(value);
        } else if (inPreset) {
            setIsCustom(false);
        }
    }, [kpiType, value, currentOptions]);

    const handleSelectChange = (e) => {
        const selectedVal = e.target.value;
        if (selectedVal === 'OTHER') {
            setIsCustom(true);
            onChange?.(customValue || '');
        } else {
            setIsCustom(false);
            onChange?.(selectedVal);
        }
    };

    const handleCustomInputChange = (e) => {
        const customText = e.target.value;
        setCustomValue(customText);
        onChange?.(customText);
    };

    return (
        <div className={`unit-selector-container ${className}`}>
            <select
                className="kpi-form-select"
                value={isCustom ? 'OTHER' : (value || (currentOptions[0]?.value || ''))}
                onChange={handleSelectChange}
                style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    backgroundColor: '#ffffff'
                }}
            >
                {currentOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
                <option value="OTHER">Others... (Custom Unit)</option>
            </select>

            {isCustom && (
                <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ position: 'relative', width: '100%' }}>
                        <input
                            type="text"
                            className="kpi-form-input"
                            value={customValue}
                            onChange={handleCustomInputChange}
                            placeholder="Enter custom unit of measure (e.g. M³, Kg, Litres)..."
                            style={{
                                width: '100%',
                                padding: '0.55rem 0.85rem 0.55rem 2.2rem',
                                borderRadius: '8px',
                                border: '1px solid #3b82f6',
                                fontSize: '0.875rem',
                                backgroundColor: '#eff6ff'
                            }}
                        />
                        <FiEdit3 
                            size={14} 
                            style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#3b82f6' }} 
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default UnitSelector;
