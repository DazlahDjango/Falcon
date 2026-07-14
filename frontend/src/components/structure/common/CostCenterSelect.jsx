import React, { useEffect } from 'react';
import { useCostCenters } from '../../../hooks/structure';

const CostCenterSelect = ({ value, onChange, placeholder = 'Select cost center...', disabled = false, className = '' }) => {
    const { items, isLoading, fetchAll } = useCostCenters({ autoFetch: false });

    useEffect(() => {
        if ((items?.length || 0) === 0 && !isLoading) {
            fetchAll({ page_size: 1000 });
        }
    }, [items, isLoading, fetchAll]);

    return (
        <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value || '')}
            disabled={disabled || isLoading}
            className={`costcenter-select ${className}`}
        >
            <option value="">{isLoading ? 'Loading cost centers...' : placeholder}</option>
            {items && items.map((cc) => (
                <option key={cc.id} value={cc.id}>
                    {cc.code ? `${cc.code} — ${cc.name}` : cc.name}
                </option>
            ))}
        </select>
    );
};

export default CostCenterSelect;
