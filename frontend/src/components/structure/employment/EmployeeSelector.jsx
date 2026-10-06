import React, { useState, useRef, useEffect, useMemo } from 'react';
import { FiUser, FiSearch, FiChevronDown, FiX, FiCheck } from 'react-icons/fi';

export const EmployeeSelector = ({
  value,
  onChange,
  employments = [],
  placeholder = 'Select an employee by name...',
  disabled = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const selectedEmployment = useMemo(() => {
    return employments.find((emp) => String(emp.user_id) === String(value) || String(emp.id) === String(value));
  }, [employments, value]);

  const filteredEmployments = useMemo(() => {
    if (!search.trim()) return employments;
    const q = search.toLowerCase();
    return employments.filter((emp) => {
      const name = (emp.user_name || `${emp.user_first_name || ''} ${emp.user_last_name || ''}`).toLowerCase();
      const email = (emp.user_email || '').toLowerCase();
      const position = (emp.position_title || '').toLowerCase();
      const dept = (emp.department_name || '').toLowerCase();
      return name.includes(q) || email.includes(q) || position.includes(q) || dept.includes(q);
    });
  }, [employments, search]);

  const getInitials = (emp) => {
    const name = emp.user_name || `${emp.user_first_name || ''} ${emp.user_last_name || ''}`.trim();
    if (!name) return 'U';
    const parts = name.split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const handleSelect = (emp) => {
    onChange(emp.user_id, emp);
    setIsOpen(false);
    setSearch('');
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('', null);
    setSearch('');
  };

  return (
    <div className={`employee-selector-wrapper ${className}`} ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      {/* Selector Trigger Button */}
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`employee-selector-trigger ${disabled ? 'disabled' : ''} ${isOpen ? 'active' : ''}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          background: disabled ? '#f8fafc' : '#ffffff',
          border: isOpen ? '1.5px solid #2563eb' : '1px solid #cbd5e1',
          borderRadius: '10px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          minHeight: '46px',
          boxShadow: isOpen ? '0 0 0 3px rgba(37, 99, 235, 0.12)' : 'none',
          transition: 'all 0.15s ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
          {selectedEmployment ? (
            <>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: '700',
                  flexShrink: 0,
                }}
              >
                {getInitials(selectedEmployment)}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', lineHeight: 1.2 }}>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>
                  {selectedEmployment.user_name || `${selectedEmployment.user_first_name || ''} ${selectedEmployment.user_last_name || ''}`}
                </span>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  {selectedEmployment.position_title || 'Position'} {selectedEmployment.department_name ? `• ${selectedEmployment.department_name}` : ''}
                </span>
              </div>
            </>
          ) : (
            <>
              <FiUser size={18} style={{ color: '#94a3b8', flexShrink: 0 }} />
              <span style={{ color: '#94a3b8', fontSize: '14px' }}>{placeholder}</span>
            </>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {selectedEmployment && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              style={{
                background: 'transparent',
                border: 'none',
                padding: '4px',
                color: '#94a3b8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '4px',
              }}
              title="Clear selection"
            >
              <FiX size={16} />
            </button>
          )}
          <FiChevronDown
            size={18}
            style={{
              color: '#64748b',
              transform: isOpen ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.2s ease',
            }}
          />
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && !disabled && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            zIndex: 100,
            overflow: 'hidden',
          }}
        >
          {/* Search Header */}
          <div style={{ padding: '10px 12px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '6px 10px',
              }}
            >
              <FiSearch size={15} style={{ color: '#94a3b8' }} />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by employee name, email, or department..."
                style={{
                  border: 'none',
                  outline: 'none',
                  fontSize: '13px',
                  width: '100%',
                  background: 'transparent',
                  color: '#0f172a',
                }}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  <FiX size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Results List */}
          <div style={{ maxHeight: '280px', overflowY: 'auto', padding: '6px' }}>
            {filteredEmployments.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                No employees found matching "{search}"
              </div>
            ) : (
              filteredEmployments.map((emp) => {
                const isSelected = String(emp.user_id) === String(value) || String(emp.id) === String(value);
                const fullName = emp.user_name || `${emp.user_first_name || ''} ${emp.user_last_name || ''}`.trim() || 'Unnamed Employee';
                return (
                  <div
                    key={emp.id || emp.user_id}
                    onClick={() => handleSelect(emp)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      background: isSelected ? '#eff6ff' : 'transparent',
                      transition: 'background 0.15s ease',
                      marginBottom: '2px',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.background = '#f8fafc';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: isSelected
                            ? 'linear-gradient(135deg, #2563eb, #1d4ed8)'
                            : 'linear-gradient(135deg, #e0e7ff, #c7d2fe)',
                          color: isSelected ? '#ffffff' : '#3730a3',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '13px',
                          fontWeight: '700',
                          flexShrink: 0,
                        }}
                      >
                        {getInitials(emp)}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                        <span style={{ fontSize: '14px', fontWeight: isSelected ? '600' : '500', color: isSelected ? '#1d4ed8' : '#0f172a' }}>
                          {fullName}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '2px' }}>
                          {emp.user_email && (
                            <span style={{ fontSize: '12px', color: '#64748b' }}>
                              {emp.user_email}
                            </span>
                          )}
                          {emp.position_title && (
                            <span
                              style={{
                                fontSize: '11px',
                                background: '#f1f5f9',
                                color: '#475569',
                                padding: '1px 6px',
                                borderRadius: '4px',
                                fontWeight: '500',
                              }}
                            >
                              {emp.position_title}
                            </span>
                          )}
                          {emp.department_name && (
                            <span
                              style={{
                                fontSize: '11px',
                                background: '#e0f2fe',
                                color: '#0369a1',
                                padding: '1px 6px',
                                borderRadius: '4px',
                                fontWeight: '500',
                              }}
                            >
                              {emp.department_name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {isSelected && <FiCheck size={18} style={{ color: '#2563eb', flexShrink: 0 }} />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeSelector;
