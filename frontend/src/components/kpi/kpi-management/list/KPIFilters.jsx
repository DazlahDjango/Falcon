import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiX } from 'react-icons/fi';
import { fetchCategories, selectCategories } from '../../../../store/kpi';

const KPIFilters = ({ filters, onFilterChange, onClearFilters }) => {
    const dispatch = useDispatch();
    
    const categories = useSelector(selectCategories);
    
    const [categoryOptions, setCategoryOptions] = useState([]);
    
    useEffect(() => {
        dispatch(fetchCategories({ is_active: true }));
    }, [dispatch]);
    
    useEffect(() => {
        setCategoryOptions(Array.isArray(categories) ? categories : []);
    }, [categories]);
    
    const kpiTypes = [
        { value: '', label: 'All Types' },
        { value: 'COUNT', label: 'Count / Number' },
        { value: 'PERCENTAGE', label: 'Percentage' },
        { value: 'FINANCIAL', label: 'Financial' },
        { value: 'MILESTONE', label: 'Milestone' },
        { value: 'TIME', label: 'Time' },
        { value: 'IMPACT', label: 'Impact' }
    ];
    
    const statusOptions = [
        { value: '', label: 'All Statuses' },
        { value: 'true', label: 'Active' },
        { value: 'false', label: 'Inactive' }
    ];
    
    const hasActiveFilters = filters.category || filters.kpi_type || filters.is_active;
    
    return (
        <div className="kpi-filters">
            <div className="kpi-filters-row">
                <div className="kpi-filter-group">
                    <label>Category</label>
                    <select 
                        value={filters.category || ''}
                        onChange={(e) => onFilterChange('category', e.target.value)}
                    >
                        <option value="">All Categories</option>
                        {categoryOptions.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>
                
                <div className="kpi-filter-group">
                    <label>KPI Type</label>
                    <select 
                        value={filters.kpi_type || ''}
                        onChange={(e) => onFilterChange('kpi_type', e.target.value)}
                    >
                        {kpiTypes.map(type => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                    </select>
                </div>
                
                <div className="kpi-filter-group">
                    <label>Status</label>
                    <select 
                        value={filters.is_active || ''}
                        onChange={(e) => onFilterChange('is_active', e.target.value)}
                    >
                        {statusOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
                
                {hasActiveFilters && (
                    <button className="kpi-clear-filters" onClick={onClearFilters}>
                        <FiX size={14} />
                        Clear
                    </button>
                )}
            </div>
        </div>
    );
};

export default KPIFilters;