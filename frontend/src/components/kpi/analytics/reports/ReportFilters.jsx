import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchKPIs, selectKPIs } from '../../../../store/kpi';
import { fetchReferenceData } from '../../../../store/kpi';

const ReportFilters = ({ filters, reportType, onChange }) => {
    const dispatch = useDispatch();
    const kpis = useSelector(selectKPIs);
    const [departments, setDepartments] = useState([]);
    
    useEffect(() => {
        dispatch(fetchKPIs({ is_active: true, page_size: 500 }));
        const loadDepartments = async () => {
            const result = await dispatch(fetchReferenceData(['departments'])).unwrap();
            setDepartments(result.departments || []);
        };
        loadDepartments();
    }, [dispatch]);
    
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
    const months = [
                        { value: 1, label: 'January' }, { value: 2, label: 'February' },
                        { value: 3, label: 'March' }, { value: 4, label: 'April' },
                        { value: 5, label: 'May' }, { value: 6, label: 'June' },
                        { value: 7, label: 'July' }, { value: 8, label: 'August' },
                        { value: 9, label: 'September' }, { value: 10, label: 'October' },
                        { value: 11, label: 'November' }, { value: 12, label: 'December' }
                    ];
    
    const handleKpiSelect = (e) => {
        const selected = Array.from(e.target.selectedOptions, option => option.value);
        onChange({ kpi_ids: selected });
    };
    
    const handleDeptSelect = (e) => {
        const selected = Array.from(e.target.selectedOptions, option => option.value);
        onChange({ department_ids: selected });
    };
    
    return (
        <div style={{ marginBottom: 'var(--kpi-space-6)' }}>
            <h4 style={{ marginBottom: 'var(--kpi-space-4)', fontSize: '0.875rem' }}>Filter Options</h4>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--kpi-space-4)' }}>
                <div className="analytics-filter-group" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                    <label>Year</label>
                    <select 
                        value={filters.year || ''}
                        onChange={(e) => onChange({ year: parseInt(e.target.value) })}
                    >
                        <option value="">Select Year</option>
                        {years.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>
                
                <div className="analytics-filter-group" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                    <label>Month</label>
                    <select 
                        value={filters.month || ''}
                        onChange={(e) => onChange({ month: parseInt(e.target.value) })}
                    >
                        <option value="">Select Month</option>
                        {months.map(month => (
                            <option key={month.value} value={month.value}>{month.label}</option>
                        ))}
                    </select>
                </div>
                
                {reportType !== 'department_comparison' && (
                    <div className="analytics-filter-group" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                        <label>KPIs (Multi-select)</label>
                        <select 
                            multiple
                            value={filters.kpi_ids || []}
                            onChange={handleKpiSelect}
                            style={{ minHeight: 100 }}
                        >
                            {kpis.map(kpi => (
                                <option key={kpi.id} value={kpi.id}>{kpi.name}</option>
                            ))}
                        </select>
                        <small>Hold Ctrl/Cmd to select multiple</small>
                    </div>
                )}
                
                {reportType !== 'kpi_performance' && (
                    <div className="analytics-filter-group" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                        <label>Departments (Multi-select)</label>
                        <select 
                            multiple
                            value={filters.department_ids || []}
                            onChange={handleDeptSelect}
                            style={{ minHeight: 100 }}
                        >
                            {departments.map(dept => (
                                <option key={dept.id} value={dept.id}>{dept.name}</option>
                            ))}
                        </select>
                        <small>Hold Ctrl/Cmd to select multiple</small>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReportFilters;