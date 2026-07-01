import React, { useState, useEffect, useRef } from 'react';
import { FiChevronDown, FiCheck, FiBuilding, FiPlus } from 'react-icons/fi';
import { useAuth } from '../../../hooks/accounts/useAuth';
import { useTenant } from '../../../hooks/tenant/useTenant';

export const TenantSelector = ({ className = '' }) => {
  const { user, tenantId } = useAuth();
  const { tenants, currentTenant, setCurrentTenant, isLoading } = useTenant();
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

  const handleSelect = (tenant) => {
    setCurrentTenant(tenant);
    setIsOpen(false);
  };

  if (!user || !tenantId) return null;

  const displayName = currentTenant?.name || user?.tenant_name || 'Select Tenant';

  return (
    <div className={`tenant-selector ${className}`} ref={dropdownRef}>
      <button className="tenant-selector-trigger" onClick={() => setIsOpen(!isOpen)}>
        <FiBuilding className="tenant-icon" />
        <span className="tenant-name">{displayName}</span>
        <FiChevronDown className={`tenant-chevron ${isOpen ? 'rotated' : ''}`} />
      </button>

      {isOpen && (
        <div className="tenant-selector-dropdown">
          <div className="tenant-dropdown-header">
            <span>Switch Organization</span>
          </div>
          <div className="tenant-dropdown-list">
            {tenants.length === 0 ? (
              <div className="tenant-empty">No organizations available</div>
            ) : (
              tenants.map((tenant) => (
                <button
                  key={tenant.id}
                  className={`tenant-option ${currentTenant?.id === tenant.id ? 'active' : ''}`}
                  onClick={() => handleSelect(tenant)}
                >
                  <FiBuilding className="tenant-option-icon" />
                  <span className="tenant-option-name">{tenant.name}</span>
                  {currentTenant?.id === tenant.id && <FiCheck className="tenant-option-check" />}
                </button>
              ))
            )}
          </div>
          {user?.role === 'super_admin' && (
            <div className="tenant-dropdown-footer">
              <button className="tenant-add-btn">
                <FiPlus /> Create Organization
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default TenantSelector;