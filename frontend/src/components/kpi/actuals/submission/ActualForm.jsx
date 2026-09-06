import React from 'react';
import { FiTarget, FiCalendar, FiFileText } from 'react-icons/fi';

const ActualForm = ({ data, kpis = [], onChange }) => {
    const kpiList = Array.isArray(kpis) ? kpis : (kpis?.results || []);
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 3 }, (_, i) => currentYear - i);
    const months = [
                        { value: 1, label: 'January' }, { value: 2, label: 'February' },
                        { value: 3, label: 'March' }, { value: 4, label: 'April' },
                        { value: 5, label: 'May' }, { value: 6, label: 'June' },
                        { value: 7, label: 'July' }, { value: 8, label: 'August' },
                        { value: 9, label: 'September' }, { value: 10, label: 'October' },
                        { value: 11, label: 'November' }, { value: 12, label: 'December' }
                    ];

    const selectedKpi = kpiList.find(k => k.id === data.kpi_id);

    return (
        <div className="kpi-actual-form">
            <div className="kpi-actual-form-group">
                <label className="kpi-actual-form-label">
                    <FiTarget size={14} />
                    Select Performance Indicator <span className="kpi-required">*</span>
                </label>
                <select 
                    className="kpi-actual-form-select"
                    value={data.kpi_id}
                    onChange={(e) => onChange({ kpi_id: e.target.value })}
                >
                    <option value="">Select a Performance Indicator...</option>
                    {kpiList.map(kpi => (
                        <option key={kpi.id} value={kpi.id}>
                            {kpi.name} ({kpi.unit || 'value'})
                        </option>
                    ))}
                </select>
                {selectedKpi && (
                    <div className="kpi-actual-form-hint">
                        Target: {selectedKpi.target_min} - {selectedKpi.target_max} {selectedKpi.unit}
                    </div>
                )}
            </div>
            
            <div className="kpi-actual-form-row">
                <div className="kpi-actual-form-group">
                    <label className="kpi-actual-form-label">
                        <FiCalendar size={14} />
                        Year <span className="kpi-required">*</span>
                    </label>
                    <select 
                        className="kpi-actual-form-select"
                        value={data.year}
                        onChange={(e) => onChange({ year: parseInt(e.target.value) })}
                    >
                        {years.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>
                
                <div className="kpi-actual-form-group">
                    <label className="kpi-actual-form-label">
                        <FiCalendar size={14} />
                        Month <span className="kpi-required">*</span>
                    </label>
                    <select 
                        className="kpi-actual-form-select"
                        value={data.month}
                        onChange={(e) => onChange({ month: parseInt(e.target.value) })}
                    >
                        {months.map(month => (
                            <option key={month.value} value={month.value}>{month.label}</option>
                        ))}
                    </select>
                </div>
            </div>
            
            <div className="kpi-actual-form-group">
                <label className="kpi-actual-form-label">
                    Actual Value <span className="kpi-required">*</span>
                </label>
                <input 
                    type="number"
                    className="kpi-actual-form-input"
                    value={data.actual_value}
                    onChange={(e) => onChange({ actual_value: parseFloat(e.target.value) })}
                    placeholder="Enter the actual value achieved"
                    step={selectedKpi?.decimal_places === 0 ? 1 : 0.01}
                />
                {selectedKpi && (
                    <div className="kpi-actual-form-hint">
                        Expected range: {selectedKpi.target_min} - {selectedKpi.target_max}
                    </div>
                )}
            </div>
            
            <div className="kpi-actual-form-group">
                <label className="kpi-actual-form-label">
                    <FiFileText size={14} />
                    Remarks (Optional)
                </label>
                <textarea 
                    className="kpi-actual-form-textarea"
                    value={data.notes}
                    onChange={(e) => onChange({ notes: e.target.value })}
                    rows="3"
                    placeholder="Add any additional remarks or context..."
                />
            </div>
        </div>
    );
};

export default ActualForm;