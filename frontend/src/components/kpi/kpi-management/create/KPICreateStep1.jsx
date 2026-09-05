import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
    fetchCategories,
    selectCategories
} from '../../../../store/kpi';
import { fetchReferenceData } from '../../../../store/kpi';
import KPILoading from '../../common/KPILoading';
import UnitSelector from '../../common/UnitSelector';

const KPICreateStep1 = ({ data, onNext, onCancel }) => {
    const dispatch = useDispatch();
    
    const categories = useSelector(selectCategories);
    
    const [referenceData, setReferenceData] = useState({ users: [], departments: [] });
    const [refLoading, setRefLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        name: data.name || '',
        description: data.description || '',
        kpi_type: data.kpi_type || 'PERCENTAGE',
        calculation_logic: data.calculation_logic || 'HIGHER_IS_BETTER',
        measure_type: data.measure_type || 'CUMULATIVE',
        unit: data.unit || '',
        category_id: data.category_id || '',
        owner_id: data.owner_id || '',
        department_id: data.department_id || '',
    });
    
    const [errors, setErrors] = useState({});
    
    useEffect(() => {
        dispatch(fetchCategories({ is_active: true }));
        
        const loadRefData = async () => {
            setRefLoading(true);
            try {
                const result = await dispatch(fetchReferenceData(['users', 'departments'])).unwrap();
                setReferenceData(result);
            } catch (err) {
                console.error('Failed to load reference data:', err);
            } finally {
                setRefLoading(false);
            }
        };
        loadRefData();
    }, [dispatch]);
    
    const kpiTypes = [
        { value: 'COUNT', label: 'Count / Number' },
        { value: 'PERCENTAGE', label: 'Percentage (%)' },
        { value: 'FINANCIAL', label: 'Financial Amount' },
        { value: 'MILESTONE', label: 'Yes / No Milestone' },
        { value: 'TIME', label: 'Time / Turnaround' },
        { value: 'IMPACT', label: 'Impact Score' }
    ];
    
    const calculationLogics = [
        { value: 'HIGHER_IS_BETTER', label: 'Higher is Better', formula: '(Actual ÷ Target) × 100' },
        { value: 'LOWER_IS_BETTER', label: 'Lower is Better', formula: '(Target ÷ Actual) × 100' }
    ];
    
    const measureTypes = [
        { value: 'CUMULATIVE', label: 'Cumulative (YTD)', desc: 'Values add up over time' },
        { value: 'NON_CUMULATIVE', label: 'Non-Cumulative', desc: 'Period-only values' }
    ];
    
    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };
    
    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Performance Indicator name is required';
        if (!formData.owner_id) newErrors.owner_id = 'Owner is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    const handleSubmit = () => {
        if (validate()) {
            onNext(formData);
        }
    };
    
    if (refLoading) {
        return <KPILoading size="sm" text="Loading form data..." />;
    }
    
    return (
        <div className="kpi-create-step">
            <div className="step-header">
                <h3>Basic Information</h3>
                <p>Define the core identity and logic of your Performance Indicator</p>
            </div>
            
            <div className="step-form">
                <div className="form-group full-width">
                    <label>Performance Indicator Name <span className="required">*</span></label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        placeholder="e.g., Revenue Growth"
                        className={errors.name ? 'error' : ''}
                    />
                    {errors.name && <span className="error-text">{errors.name}</span>}
                </div>
                
                <div className="form-group full-width">
                    <label>Description</label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                        rows={3}
                        placeholder="Describe what this Performance Indicator measures, how it's calculated, and its business impact..."
                    />
                </div>
                
                <div className="form-row">
                    <div className="form-group">
                        <label>Performance Indicator Type <span className="required">*</span></label>
                        <select
                            value={formData.kpi_type}
                            onChange={(e) => handleChange('kpi_type', e.target.value)}
                        >
                            {kpiTypes.map(type => (
                                <option key={type.value} value={type.value}>{type.label}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="form-group">
                        <label>Calculation Logic <span className="required">*</span></label>
                        <select
                            value={formData.calculation_logic}
                            onChange={(e) => handleChange('calculation_logic', e.target.value)}
                        >
                            {calculationLogics.map(logic => (
                                <option key={logic.value} value={logic.value}>{logic.label}</option>
                            ))}
                        </select>
                        <small>
                            {calculationLogics.find(l => l.value === formData.calculation_logic)?.formula}
                        </small>
                    </div>
                    
                    <div className="form-group">
                        <label>Measure Type</label>
                        <select
                            value={formData.measure_type}
                            onChange={(e) => handleChange('measure_type', e.target.value)}
                        >
                            {measureTypes.map(type => (
                                <option key={type.value} value={type.value}>{type.label}</option>
                            ))}
                        </select>
                        <small>{measureTypes.find(t => t.value === formData.measure_type)?.desc}</small>
                    </div>
                </div>
                
                <div className="form-row">
                    <div className="form-group">
                        <label>Unit of Measure</label>
                        <UnitSelector
                            kpiType={formData.kpi_type}
                            value={formData.unit}
                            onChange={(newUnit) => handleChange('unit', newUnit)}
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Key Result Area</label>
                        <select
                            value={formData.category_id}
                            onChange={(e) => handleChange('category_id', e.target.value)}
                        >
                            <option value="">Select Key Result Area</option>
                            {categories.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
                
                <div className="form-row">
                    <div className="form-group">
                        <label>Owner <span className="required">*</span></label>
                        <select
                            value={formData.owner_id}
                            onChange={(e) => handleChange('owner_id', e.target.value)}
                            className={errors.owner_id ? 'error' : ''}
                        >
                            <option value="">Select Owner</option>
                            {referenceData.users?.map(u => (
                                <option key={u.id} value={u.id}>
                                    {u.full_name} ({u.email})
                                </option>
                            ))}
                        </select>
                        {errors.owner_id && <span className="error-text">{errors.owner_id}</span>}
                    </div>
                    
                    <div className="form-group">
                        <label>Department (Optional)</label>
                        <select
                            value={formData.department_id}
                            onChange={(e) => handleChange('department_id', e.target.value)}
                        >
                            <option value="">Select Department</option>
                            {referenceData.departments?.map(d => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
            
            <div className="step-actions">
                <button className="cancel-btn" onClick={onCancel}>Cancel</button>
                <button className="next-btn" onClick={handleSubmit}>
                    Next Step →
                </button>
            </div>
        </div>
    );
};

export default KPICreateStep1;