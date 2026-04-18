import React, { useState, useRef, useEffect } from 'react';
import { FiChevronDown, FiMoreVertical } from 'react-icons/fi';

const Dropdown = ({ 
    trigger, 
    children, 
    align = 'left', 
    className = '' 
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleDropdown = (e) => {
        e.stopPropagation();
        setIsOpen(!isOpen);
    };

    return (
        <div className={`dropdown ${className}`} ref={dropdownRef}>
            <div onClick={toggleDropdown} className="dropdown-trigger">
                {trigger}
            </div>
            {isOpen && (
                <div className={`dropdown-menu ${align === 'right' ? 'align-right' : ''}`}>
                    {children}
                </div>
            )}
        </div>
    );
};

const DropdownItem = ({ 
    children, 
    onClick, 
    icon, 
    danger = false, 
    disabled = false 
}) => {
    const handleClick = () => {
        if (!disabled && onClick) {
            onClick();
        }
    };

    return (
        <button 
            className={`dropdown-item ${danger ? 'danger' : ''} ${disabled ? 'disabled' : ''}`}
            onClick={handleClick}
            disabled={disabled}
        >
            {icon && <span className="dropdown-item-icon">{icon}</span>}
            <span className="dropdown-item-text">{children}</span>
        </button>
    );
};

export { Dropdown, DropdownItem };
export default Dropdown;