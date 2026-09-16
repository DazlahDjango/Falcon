import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiX, FiCheck, FiInfo, FiTarget, FiClock, FiActivity, FiUser, FiFolder } from 'react-icons/fi';
import { createKPI, fetchCategories, selectCategories, fetchReferenceData, selectKPISubmitting, selectKPIError } from '../../../../store/kpi';
import { selectUser } from '../../../../store/accounts/selectors/authSelectors';
import { fetchMyEmployment } from '../../../../store/structure/slice/employmentSlice';
import UnitSelector from '../../common/UnitSelector';
import './create.css';

const StaffKPICreateModal = ({ onComplete, onCancel }) => {
  const dispatch = useDispatch();
  const categories = useSelector(selectCategories) || [];
  const submitting = useSelector(selectKPISubmitting);
  const serverError = useSelector(selectKPIError);
  const currentUser = useSelector(selectUser);

  const [referenceData, setReferenceData] = useState({
    users: [],
    departments: [],
    divisions: [],
    sections: [],
    units: [],
  });
  const [userEmployment, setUserEmployment] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: '',
    kpiType: 'PERCENTAGE',
    measureType: 'CUMULATIVE',
    calculationLogic: 'HIGHER_IS_BETTER',
    unit: '%',
    targetValue: '',
    baseline: '',
    ownerId: '',
    divisionId: '',
    departmentId: '',
    sectionId: '',
    unitId: '',
    decimalPlaces: 2,
    parentKpiId: '',
  });

  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (!categories.length) {
      dispatch(fetchCategories({ is_active: true }));
    }
    const loadRef = async () => {
      try {
        const res = await dispatch(fetchReferenceData(['users', 'departments', 'divisions', 'sections', 'units'])).unwrap();
        setReferenceData(res || { users: [], departments: [], divisions: [], sections: [], units: [] });
      } catch (err) {
        console.error('Failed to load ref data for staff modal:', err);
      }
    };
    loadRef();

    // Fetch real active employment mapping from the structure app
    dispatch(fetchMyEmployment())
      .unwrap()
      .then((empData) => {
        if (empData) setUserEmployment(empData);
      })
      .catch(() => {
        // Fall back gracefully if employment endpoint is not queried yet
      });
  }, [dispatch, categories.length]);

  // Pre-populate Division, Department, Section, Unit when employment/user data loads
  useEffect(() => {
    const emp = userEmployment?.current_employment || userEmployment;
    const pos = emp?.position || {};

    const divId = emp?.division_id || pos.division_id || (pos.division && pos.division.id) || currentUser?.division_id || '';
    const deptId = emp?.department_id || pos.department_id || (pos.department && pos.department.id) || currentUser?.department_id || '';
    const secId = emp?.section_id || pos.section_id || (pos.section && pos.section.id) || currentUser?.section_id || '';
    const unitId = emp?.unit_id || pos.unit_id || (pos.unit && pos.unit.id) || currentUser?.unit_id || '';

    setFormData((prev) => ({
      ...prev,
      divisionId: prev.divisionId || (divId ? String(divId) : ''),
      departmentId: prev.departmentId || (deptId ? String(deptId) : ''),
      sectionId: prev.sectionId || (secId ? String(secId) : ''),
      unitId: prev.unitId || (unitId ? String(unitId) : ''),
    }));
  }, [userEmployment, currentUser]);

  // Filtered dropdown lists based on cascading selections
  const availableDepartments = formData.divisionId
    ? (referenceData.departments || []).filter((d) => !d.division_id || String(d.division_id) === String(formData.divisionId))
    : (referenceData.departments || []);

  const availableSections = formData.departmentId
    ? (referenceData.sections || []).filter((s) => !s.department_id || String(s.department_id) === String(formData.departmentId))
    : (referenceData.sections || []);

  const availableUnits = formData.sectionId
    ? (referenceData.units || []).filter((u) => !u.section_id || String(u.section_id) === String(formData.sectionId))
    : (referenceData.units || []);

  const handleDivisionChange = (e) => {
    const newDivId = e.target.value;
    setFormData((prev) => {
      const updated = { ...prev, divisionId: newDivId };
      // If current department is not in new division, clear department, section, and unit
      if (newDivId && prev.departmentId) {
        const dept = (referenceData.departments || []).find((d) => String(d.id) === String(prev.departmentId));
        if (dept && dept.division_id && String(dept.division_id) !== String(newDivId)) {
          updated.departmentId = '';
          updated.sectionId = '';
          updated.unitId = '';
        }
      }
      return updated;
    });
  };

  const handleDepartmentChange = (e) => {
    const newDeptId = e.target.value;
    setFormData((prev) => {
      const updated = { ...prev, departmentId: newDeptId };
      // Auto-set division if not set
      if (newDeptId) {
        const dept = (referenceData.departments || []).find((d) => String(d.id) === String(newDeptId));
        if (dept?.division_id && !prev.divisionId) {
          updated.divisionId = String(dept.division_id);
        }
        // If current section is not in new department, clear section and unit
        if (prev.sectionId) {
          const sec = (referenceData.sections || []).find((s) => String(s.id) === String(prev.sectionId));
          if (sec && sec.department_id && String(sec.department_id) !== String(newDeptId)) {
            updated.sectionId = '';
            updated.unitId = '';
          }
        }
      }
      return updated;
    });
  };

  const handleSectionChange = (e) => {
    const newSecId = e.target.value;
    setFormData((prev) => {
      const updated = { ...prev, sectionId: newSecId };
      if (newSecId) {
        const sec = (referenceData.sections || []).find((s) => String(s.id) === String(newSecId));
        if (sec?.department_id) {
          updated.departmentId = String(sec.department_id);
          const dept = (referenceData.departments || []).find((d) => String(d.id) === String(sec.department_id));
          if (dept?.division_id && !prev.divisionId) {
            updated.divisionId = String(dept.division_id);
          }
        }
        if (prev.unitId) {
          const unit = (referenceData.units || []).find((u) => String(u.id) === String(prev.unitId));
          if (unit && unit.section_id && String(unit.section_id) !== String(newSecId)) {
            updated.unitId = '';
          }
        }
      }
      return updated;
    });
  };

  const handleUnitChange = (e) => {
    const newUnitId = e.target.value;
    setFormData((prev) => {
      const updated = { ...prev, unitId: newUnitId };
      if (newUnitId) {
        const unit = (referenceData.units || []).find((u) => String(u.id) === String(newUnitId));
        if (unit?.section_id) {
          updated.sectionId = String(unit.section_id);
          const sec = (referenceData.sections || []).find((s) => String(s.id) === String(unit.section_id));
          if (sec?.department_id) {
            updated.departmentId = String(sec.department_id);
            const dept = (referenceData.departments || []).find((d) => String(d.id) === String(sec.department_id));
            if (dept?.division_id && !prev.divisionId) {
              updated.divisionId = String(dept.division_id);
            }
          }
        }
      }
      return updated;
    });
  };

  const staffOwnerName = currentUser
    ? (currentUser.full_name || `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim() || currentUser.email)
    : 'Logged-in Staff Member';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === 'kpiType') {
        if (value === 'FINANCIAL') updated.unit = 'KES';
        else if (value === 'PERCENTAGE') updated.unit = '%';
        else if (value === 'COUNT') updated.unit = 'Units';
        else if (value === 'TIME') updated.unit = 'Hours';
        else if (value === 'MILESTONE') updated.unit = 'Yes/No';
        else if (value === 'IMPACT') updated.unit = 'Score (1-5)';
      }
      return updated;
    });
    if (validationError) setValidationError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setValidationError('Performance Indicator is required');
      return;
    }

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      categoryId: formData.categoryId || null,
      kpiType: formData.kpiType,
      measureType: formData.measureType,
      calculationLogic: formData.calculationLogic,
      unit: formData.unit.trim() || '%',
      baseline: formData.baseline !== '' ? formData.baseline : null,
      targetValue: formData.targetValue !== '' ? formData.targetValue : null,
      ownerId: currentUser?.id || formData.ownerId || null,
      divisionId: formData.divisionId || null,
      departmentId: formData.departmentId || null,
      sectionId: formData.sectionId || null,
      unitId: formData.unitId || null,
      decimalPlaces: parseInt(formData.decimalPlaces) || 2,
      parentKpiId: formData.parentKpiId || null,
      isStaffCreated: true,
    };

    try {
      const result = await dispatch(createKPI(payload)).unwrap();
      if (onComplete) {
        onComplete(result);
      }
    } catch (err) {
      console.error('Failed to create staff KPI:', err);
    }
  };

  const isTimeMetric = formData.kpiType === 'TIME' || formData.unit.toLowerCase().includes('hour') || formData.unit.toLowerCase().includes('min');

  return (
    <div className="kpi-modal-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '1rem'
    }}>
      <div className="kpi-modal-container" style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '680px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '1px solid #e2e8f0'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid #f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          color: '#ffffff',
          borderTopLeftRadius: '15px',
          borderTopRightRadius: '15px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#38bdf8'
            }}>
              <FiTarget size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 600, color: '#ffffff' }}>
                Propose Operational Performance Indicator
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>
                Set your personal work measure and target for supervisor approval
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          {(validationError || serverError) && (
            <div style={{
              padding: '0.75rem 1rem',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              color: '#dc2626',
              fontSize: '0.875rem',
              marginBottom: '1.25rem'
            }}>
              {validationError || (typeof serverError === 'string' ? serverError : JSON.stringify(serverError))}
            </div>
          )}

          <div style={{ display: 'grid', gap: '1.1rem' }}>

            {/* 1. Key Result Area (KRA) */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                Key Result Area (KRA)
              </label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.9rem',
                  backgroundColor: '#ffffff'
                }}
              >
                <option value="">Select Key Result Area (KRA)...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* 2. Performance Indicator */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                Performance Indicator <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Daily Guard Shift On-Time Start / Ticket Resolution Time"
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
                required
              />
            </div>

            {/* 3. Description */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={2}
                placeholder="Briefly describe what this operational measure tracks day-to-day..."
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.9rem',
                  outline: 'none',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* 4. Performance Type, 5. Measure Type, 6. Calculation Logic */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                  Performance Type <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  name="kpiType"
                  value={formData.kpiType}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    backgroundColor: '#ffffff'
                  }}
                >
                  <option value="COUNT">Count / Quantity</option>
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FINANCIAL">Financial Amount</option>
                  <option value="TIME">Time / Turnaround Hours</option>
                  <option value="MILESTONE">Yes/No Milestone</option>
                  <option value="IMPACT">Impact Rating Score</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                  Measure Type
                </label>
                <select
                  name="measureType"
                  value={formData.measureType}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    backgroundColor: '#ffffff'
                  }}
                >
                  <option value="CUMULATIVE">Cumulative (YTD)</option>
                  <option value="NON_CUMULATIVE">Non-Cumulative</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                  Calculation Logic
                </label>
                <select
                  name="calculationLogic"
                  value={formData.calculationLogic}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    backgroundColor: '#ffffff'
                  }}
                >
                  <option value="HIGHER_IS_BETTER">Higher is Better</option>
                  <option value="LOWER_IS_BETTER">Lower is Better</option>
                </select>
              </div>
            </div>

            {/* 7. Target & Unit Selection Tab */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                  Unit of Measure Tab
                </label>
                <UnitSelector
                  kpiType={formData.kpiType}
                  value={formData.unit}
                  onChange={(newUnit) => setFormData(prev => ({ ...prev, unit: newUnit }))}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                  Real-Data Target Goal
                </label>
                <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <input
                    type="number"
                    step="any"
                    name="targetValue"
                    value={formData.targetValue}
                    onChange={handleChange}
                    placeholder="e.g. 100"
                    style={{
                      flex: 1,
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px 0 0 8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      color: '#0f172a',
                      outline: 'none'
                    }}
                  />
                  <div style={{
                    padding: '0.65rem 1rem',
                    backgroundColor: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    borderLeft: 'none',
                    borderRadius: '0 8px 8px 0',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    color: '#334155',
                    minWidth: '65px',
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                    boxSizing: 'border-box'
                  }}>
                    {formData.unit || '%'}
                  </div>
                </div>
              </div>
            </div>

            {/* 8. Organizational Structure Placement & Ownership */}
            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: '6px', height: '14px', backgroundColor: '#6366f1', borderRadius: '3px' }}></span>
                  Organizational Placement & Structure
                </h4>
                <span style={{ fontSize: '0.75rem', color: '#6366f1', backgroundColor: '#eef2ff', padding: '3px 8px', borderRadius: '6px', fontWeight: 600 }}>
                  🏢 Auto-mapped to your profile
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                {/* Division Selector */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    Division
                  </label>
                  <select
                    name="divisionId"
                    value={formData.divisionId}
                    onChange={handleDivisionChange}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem',
                      backgroundColor: '#ffffff'
                    }}
                  >
                    <option value="">Select Division...</option>
                    {(referenceData.divisions || []).map((div) => (
                      <option key={div.id} value={div.id}>
                        {div.name} {div.code ? `(${div.code})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Department Selector */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    Department
                  </label>
                  <select
                    name="departmentId"
                    value={formData.departmentId}
                    onChange={handleDepartmentChange}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem',
                      backgroundColor: '#ffffff'
                    }}
                  >
                    <option value="">Select Department...</option>
                    {availableDepartments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name} {dept.code ? `(${dept.code})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Section Selector */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    Section (Optional)
                  </label>
                  <select
                    name="sectionId"
                    value={formData.sectionId}
                    onChange={handleSectionChange}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem',
                      backgroundColor: '#ffffff'
                    }}
                  >
                    <option value="">Select Section (optional)...</option>
                    {availableSections.map((sec) => (
                      <option key={sec.id} value={sec.id}>
                        {sec.name} {sec.code ? `(${sec.code})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Unit Selector */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    Unit (Optional)
                  </label>
                  <select
                    name="unitId"
                    value={formData.unitId}
                    onChange={handleUnitChange}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem',
                      backgroundColor: '#ffffff'
                    }}
                  >
                    <option value="">Select Unit (optional)...</option>
                    {availableUnits.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.name} {unit.code ? `(${unit.code})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Baseline & KPI Owner */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    Baseline (Previous Benchmark)
                  </label>
                  <input
                    type="number"
                    step="any"
                    name="baseline"
                    value={formData.baseline}
                    onChange={handleChange}
                    placeholder="e.g. 50.00"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    KPI Owner
                  </label>
                  <div style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#f8fafc',
                    color: '#0f172a',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    boxSizing: 'border-box'
                  }}>
                    <FiUser size={15} style={{ color: '#0284c7' }} />
                    <span>{staffOwnerName}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div style={{
            marginTop: '1.75rem',
            paddingTop: '1rem',
            borderTop: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '0.75rem'
          }}>
            <button
              type="button"
              onClick={onCancel}
              disabled={submitting}
              style={{
                padding: '0.65rem 1.25rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#475569',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '0.65rem 1.4rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#0284c7',
                color: '#ffffff',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 2px 4px rgba(2, 132, 199, 0.2)'
              }}
            >
              {submitting ? (
                <span>Submitting...</span>
              ) : (
                <>
                  <FiCheck size={16} />
                  <span>Submit for Approval</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StaffKPICreateModal;
