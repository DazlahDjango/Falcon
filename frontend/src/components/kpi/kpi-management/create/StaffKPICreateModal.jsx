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

  const [referenceData, setReferenceData] = useState({ users: [], departments: [] });
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
    departmentId: '',
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
        const res = await dispatch(fetchReferenceData(['users', 'departments'])).unwrap();
        setReferenceData(res || { users: [], departments: [] });
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
      .catch((err) => {
        // Fall back gracefully if employment endpoint is not queried yet
      });
  }, [dispatch, categories.length]);

  // Dynamically resolve the staff user's exact organizational level and entity name from structure Employment
  const getUserOrgDetails = () => {
    // 1. Primary source: inspect structure app Employment record
    const emp = userEmployment?.current_employment || userEmployment;
    const pos = emp?.position || {};

    const unitObj = pos.unit || emp?.unit;
    const unitName = emp?.unit_name || pos.unit_name || unitObj?.name || (typeof unitObj === 'string' ? unitObj : null);
    if (unitName) {
      return {
        label: 'Unit',
        name: unitName,
        id: emp?.unit_id || pos.unit_id || unitObj?.id || null,
        type: 'unit'
      };
    }

    const sectionObj = pos.section || emp?.section;
    const sectionName = emp?.section_name || pos.section_name || sectionObj?.name || (typeof sectionObj === 'string' ? sectionObj : null);
    if (sectionName) {
      return {
        label: 'Section',
        name: sectionName,
        id: emp?.section_id || pos.section_id || sectionObj?.id || null,
        type: 'section'
      };
    }

    const deptObj = pos.department || emp?.department;
    const deptName = emp?.department_name || pos.department_name || deptObj?.name || (typeof deptObj === 'string' ? deptObj : null);
    if (deptName) {
      return {
        label: 'Department',
        name: deptName,
        id: emp?.department_id || pos.department_id || deptObj?.id || null,
        type: 'department'
      };
    }

    const divObj = pos.division || emp?.division;
    const divName = emp?.division_name || pos.division_name || divObj?.name || (typeof divObj === 'string' ? divObj : null);
    if (divName) {
      return {
        label: 'Division',
        name: divName,
        id: emp?.division_id || pos.division_id || divObj?.id || null,
        type: 'division'
      };
    }

    // 2. Secondary source: fallback to currentUser profile properties
    if (!currentUser) {
      return { label: 'Department / Unit', name: 'Not Assigned', id: null, type: 'department' };
    }

    const fallbackUnit = currentUser.unit_name || (typeof currentUser.unit === 'object' ? currentUser.unit?.name : currentUser.unit);
    if (fallbackUnit) return { label: 'Unit', name: fallbackUnit, id: currentUser.unit_id || null, type: 'unit' };

    const fallbackSection = currentUser.section_name || (typeof currentUser.section === 'object' ? currentUser.section?.name : currentUser.section);
    if (fallbackSection) return { label: 'Section', name: fallbackSection, id: currentUser.section_id || null, type: 'section' };

    const fallbackDept = currentUser.department_name || (typeof currentUser.department === 'object' ? currentUser.department?.name : currentUser.department);
    if (fallbackDept) return { label: 'Department', name: fallbackDept, id: currentUser.department_id || null, type: 'department' };

    const fallbackDiv = currentUser.division_name || (typeof currentUser.division === 'object' ? currentUser.division?.name : currentUser.division);
    if (fallbackDiv) return { label: 'Division', name: fallbackDiv, id: currentUser.division_id || null, type: 'division' };

    if (currentUser.department_id && referenceData?.departments?.length) {
      const matchedDept = referenceData.departments.find(d => String(d.id) === String(currentUser.department_id));
      if (matchedDept) {
        return { label: matchedDept.type || 'Department', name: matchedDept.name, id: matchedDept.id, type: 'department' };
      }
    }

    if (currentUser.organizational_unit_name) {
      return {
        label: currentUser.level_name || 'Organizational Unit',
        name: currentUser.organizational_unit_name,
        id: currentUser.organizational_unit_id || null,
        type: 'unit'
      };
    }

    return {
      label: currentUser.level_name || 'Department',
      name: currentUser.department_name || currentUser.department || 'My Organizational Unit',
      id: currentUser.department_id || null,
      type: 'department'
    };
  };

  const userOrg = getUserOrgDetails();

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
      departmentId: userOrg.type === 'department' ? (userOrg.id || formData.departmentId || null) : (formData.departmentId || null),
      unitId: userOrg.type === 'unit' ? userOrg.id : null,
      sectionId: userOrg.type === 'section' ? userOrg.id : null,
      divisionId: userOrg.type === 'division' ? userOrg.id : null,
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

            {/* 8. Rest of fields: Baseline, Owner, Department */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
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

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                  {userOrg.label}
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
                  <FiFolder size={15} style={{ color: '#6366f1' }} />
                  <span>{userOrg.name}</span>
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
