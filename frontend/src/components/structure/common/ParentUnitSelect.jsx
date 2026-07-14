import React, { useEffect } from 'react';
import { useOrganizationalUnits, useDivisions, useDepartments, useSections, useUnits } from '../../../hooks/structure';

const ParentUnitSelect = ({ value, onChange, placeholder = 'Select parent unit...', parentLevel = '', disabled = false, className = '' }) => {
  const orgUnits = useOrganizationalUnits({ autoFetch: false });
  const divisions = useDivisions({ autoFetch: false });
  const departments = useDepartments({ autoFetch: false });
  const sections = useSections({ autoFetch: false });
  const unitsHook = useUnits({ autoFetch: false });

  useEffect(() => {
    if (parentLevel === 'division') {
      divisions.fetchAll();
    } else if (parentLevel === 'department') {
      departments.fetchAll();
    } else if (parentLevel === 'section') {
      sections.fetchAll();
    } else if (parentLevel === 'unit') {
      unitsHook.fetchAll();
    } else if (parentLevel) {
      orgUnits.fetchByLevel(parentLevel);
    } else if (orgUnits.items.length === 0 && !orgUnits.isLoading) {
      orgUnits.fetchAll();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parentLevel]);

  let activeHook = orgUnits;
  if (parentLevel === 'division') activeHook = divisions;
  else if (parentLevel === 'department') activeHook = departments;
  else if (parentLevel === 'section') activeHook = sections;
  else if (parentLevel === 'unit') activeHook = unitsHook;

  const { items, isLoading } = activeHook;

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
