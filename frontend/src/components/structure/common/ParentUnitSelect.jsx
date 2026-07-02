import React, { useEffect } from 'react';
import { useOrganizationalUnits } from '../../../hooks/structure';

const ParentUnitSelect = ({ value, onChange, placeholder = 'Select parent unit...', parentLevel = '', disabled = false, className = '' }) => {
  const { items, isLoading, fetchAll, fetchByLevel } = useOrganizationalUnits({ autoFetch: false });

  useEffect(() => {
    if (parentLevel) {
      fetchByLevel(parentLevel);
    } else if (items.length === 0 && !isLoading) {
      fetchAll({ page_size: 1000 });
    }
  }, [parentLevel, fetchAll, fetchByLevel, items.length, isLoading]);

  return (
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value || '')}
      disabled={disabled || isLoading}
      className={`parent-unit-select ${className}`}
    >
      <option value="">{isLoading ? 'Loading units...' : placeholder}</option>
      {items.map((it) => (
        <option key={it.id} value={it.id}>
          {it.path ? `${it.path} / ${it.name}` : it.name}
        </option>
      ))}
    </select>
  );
};

export default ParentUnitSelect;
