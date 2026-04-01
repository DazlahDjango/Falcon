import React, { useState, useRef, useEffect } from 'react';
import { FiChevronDown, FiCheck } from 'react-icons/fi';
const Select = ({
    name,
    value,
    onChange,
    options,
    label,
    placeholder = 'Select an option',
    error,
    required = false,
    disabled = false,
    searchable = false,
    clearable = false,
    className = '',
    ...props
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const wrapperRef = useRef(null);
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    const selectedOption = options.find(opt => opt.value === value);
    const filteredOptions = searchable && searchTerm
        ? options.filter(opt => 
            opt.label.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : options;
    const handleSelect = (option) => {
        onChange({ target: { name, value: option.value } });
        setIsOpen(false);
        setSearchTerm('');
    };
    const handleClear = (e) => {
        e.stopPropagation();
        onChange({ target: { name, value: '' } });
    };
    return (
        <div className="form-group" ref={wrapperRef}>
            {label && (
                <label htmlFor={name} className="form-label">
                    {label}
                    {required && <span className="required-mark">*</span>}
                </label>
            )}
            <div className="select-wrapper">
                <button
                    type="button"
                    className={`select-trigger ${isOpen ? 'open' : ''} ${error ? 'is-invalid' : ''}`}
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    disabled={disabled}
                >
                    <span className="select-value">
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                    <div className="select-actions">
                        {clearable && selectedOption && (
                            <button
                                type="button"
                                className="select-clear"
                                onClick={handleClear}
                                tabIndex="-1"
                            >
                                ✕
                            </button>
                        )}
                        <FiChevronDown className={`select-arrow ${isOpen ? 'rotate' : ''}`} />
                    </div>
                </button>
                {isOpen && (
                    <div className="select-dropdown">
                        {searchable && (
                            <div className="select-search">
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                    className="select-search-input"
                                />
                            </div>
                        )}
                        <div className="select-options">
                            {filteredOptions.length === 0 ? (
                                <div className="select-option-empty">
                                    No options found
                                </div>
                            ) : (
                                filteredOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        className={`select-option ${option.value === value ? 'selected' : ''}`}
                                        onClick={() => handleSelect(option)}
                                    >
                                        <span>{option.label}</span>
                                        {option.value === value && <FiCheck size={16} />}
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
            {error && (
                <div className="input-feedback error">
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
};

export { Select };