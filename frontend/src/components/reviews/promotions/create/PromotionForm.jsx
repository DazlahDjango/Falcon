// src/components/reviews/promotions/create/PromotionForm.jsx
import React, { useEffect, useMemo, useRef } from 'react';
import { useEmployees, useTeam } from '../../../../hooks/accounts';
import { useCycles, useFinalRating, useReviewsPermissions } from '../../../../hooks/reviews';
import { useAuthContext } from '../../../../contexts/accounts/AuthContext';

const PromotionForm = ({ data = {}, onChange }) => {
  const { user } = useAuthContext();
  const { isAdmin, isHrAdmin, isExecutive, isSupervisor } = useReviewsPermissions();
  const { data: employees, loading: employeesLoading } = useEmployees();
  const { teamMembers, isLoading: teamLoading } = useTeam();
  const { data: cycles, loading: cyclesLoading } = useCycles({ autoFetch: true });
  const { data: ratings, fetchForCycle } = useFinalRating();
  const autoSelectedRef = useRef(false);

  const isLeadOnly = isSupervisor && !isAdmin && !isHrAdmin && !isExecutive;

  // Normalized employees list
  const empList = useMemo(() => {
    const raw = Array.isArray(employees) ? employees : (employees?.results || employees?.data || employees?.team || []);
    return raw.map((emp) => ({
      ...emp,
      id: emp.id,
      full_name: emp.full_name || `${emp.first_name || ''} ${emp.last_name || ''}`.trim() || emp.email,
      email: emp.email,
    }));
  }, [employees]);

  // Normalized direct team list
  const directTeam = useMemo(() => {
    const raw = Array.isArray(teamMembers) ? teamMembers : (teamMembers?.team || teamMembers?.results || teamMembers?.data || []);
    return raw.map((emp) => ({
      ...emp,
      id: emp.id,
      full_name: emp.full_name || `${emp.first_name || ''} ${emp.last_name || ''}`.trim() || emp.email,
      email: emp.email,
    }));
  }, [teamMembers]);

  // Filter employees for Leads to only show direct reports
  const displayEmployees = useMemo(() => {
    if (isLeadOnly && user) {
      const uid = String(user.id || user.pk || '').toLowerCase();
      const uemail = String(user.email || '').toLowerCase();

      const matchedEmployees = empList.filter((emp) => {
        const mgr = emp.manager;
        const mgrId = String(emp.manager_id || emp.supervisor_id || (typeof mgr === 'object' ? mgr?.id : mgr) || '').toLowerCase();
        const mgrEmail = String((typeof mgr === 'object' ? mgr?.email : (typeof mgr === 'string' && mgr.includes('@') ? mgr : '')) || '').toLowerCase();
        const reportsTo = String(emp.position?.reports_to_user_id || '').toLowerCase();

        return (uid && (mgrId === uid || reportsTo === uid)) || (uemail && mgrEmail === uemail);
      });

      const map = new Map();
      directTeam.forEach((u) => map.set(String(u.id), u));
      matchedEmployees.forEach((u) => map.set(String(u.id), u));
      const res = Array.from(map.values());
      return res.length > 0 ? res : empList;
    }

    return empList;
  }, [empList, directTeam, isLeadOnly, user]);

  // Identify active cycle and sort active to the top
  const { sortedCycles, defaultActiveCycle } = useMemo(() => {
    const rawList = Array.isArray(cycles) ? cycles : (cycles?.results || cycles?.data || []);
    if (!rawList || rawList.length === 0) return { sortedCycles: [], defaultActiveCycle: null };

    const active = rawList.find(
      (c) => c.status === 'active' || c.status === 'ACTIVE' || c.status === 'submitted' || c.is_active
    ) || rawList[0];

    const sorted = [...rawList].sort((a, b) => {
      const aIsActive = (a.id === active?.id || a.status === 'active' || a.status === 'submitted') ? 1 : 0;
      const bIsActive = (b.id === active?.id || b.status === 'active' || b.status === 'submitted') ? 1 : 0;
      return bIsActive - aIsActive;
    });

    return { sortedCycles: sorted, defaultActiveCycle: active };
  }, [cycles]);

  // Auto-select active review cycle once
  useEffect(() => {
    if (!autoSelectedRef.current && defaultActiveCycle?.id && !data.review_cycle) {
      autoSelectedRef.current = true;
      onChange?.({
        ...data,
        review_cycle: defaultActiveCycle.id,
        recommended_by: data.recommended_by || user?.id || '',
      });
    }
  }, [defaultActiveCycle?.id, data.review_cycle, data.recommended_by, user?.id, onChange]);

  const handleChange = (field, value) => {
    onChange?.({ ...data, [field]: value });
  };

  const handleEmployeeChange = (employeeId) => {
    const employee = displayEmployees?.find((e) => String(e.id) === String(employeeId));
    const updated = {
      ...data,
      employee: employeeId,
    };
    if (employee) {
      updated.current_role = employee.position?.title || employee.title || '';
      updated.current_level = employee.position?.level || '';
      updated.current_salary = employee.salary || '';
    }
    onChange?.(updated);
  };

  const priorities = [
    { value: 'high', label: 'High Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'low', label: 'Low Priority' },
    { value: 'urgent', label: 'Urgent' },
  ];

  useEffect(() => {
    if (data.review_cycle && fetchForCycle) {
      fetchForCycle(data.review_cycle);
    }
  }, [data.review_cycle, fetchForCycle]);

  return (
    <div className="promotion-form">
      <div className="promotion-form-group">
        <label className="promotion-form-label">Employee *</label>
        <select
          className="promotion-form-select"
          value={data.employee || ''}
          onChange={(e) => handleEmployeeChange(e.target.value)}
          required
        >
          <option value="">{isLeadOnly ? "Select team member (direct report)..." : "Select employee..."}</option>
          {displayEmployees?.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.full_name} ({emp.email})
            </option>
          ))}
        </select>
      </div>

      <div className="promotion-form-row">
        <div className="promotion-form-group">
          <label className="promotion-form-label">Review Cycle</label>
          <select
            className="promotion-form-select"
            value={data.review_cycle || defaultActiveCycle?.id || ''}
            onChange={(e) => handleChange('review_cycle', e.target.value)}
          >
            <option value="">Select review cycle...</option>
            {sortedCycles?.map((cycle) => {
              const isCurrent = cycle.id === defaultActiveCycle?.id || cycle.status === 'active' || cycle.status === 'submitted';
              return (
                <option key={cycle.id} value={cycle.id}>
                  {cycle.name} {isCurrent ? ' ★ (Active Cycle)' : ''}
                </option>
              );
            })}
          </select>
        </div>
        <div className="promotion-form-group">
          <label className="promotion-form-label">Final Rating</label>
          <select
            className="promotion-form-select"
            value={data.final_rating || ''}
            onChange={(e) => handleChange('final_rating', e.target.value)}
            disabled={!data.review_cycle}
          >
            <option value="">Select final rating...</option>
            {ratings?.map((rating) => (
              <option key={rating.id} value={rating.id}>
                {rating.employee_name || rating.employee?.full_name || rating.employee?.email} - {rating.final_score}%
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="promotion-form-row">
        <div className="promotion-form-group">
          <label className="promotion-form-label">Current Role</label>
          <input
            type="text"
            className="promotion-form-input"
            value={data.current_role || ''}
            onChange={(e) => handleChange('current_role', e.target.value)}
            placeholder="Current role"
          />
        </div>
        <div className="promotion-form-group">
          <label className="promotion-form-label">Current Level</label>
          <input
            type="text"
            className="promotion-form-input"
            value={data.current_level || ''}
            onChange={(e) => handleChange('current_level', e.target.value)}
            placeholder="Current level"
          />
        </div>
      </div>

      <div className="promotion-form-row">
        <div className="promotion-form-group">
          <label className="promotion-form-label">Recommended Role *</label>
          <input
            type="text"
            className="promotion-form-input"
            value={data.recommended_role || ''}
            onChange={(e) => handleChange('recommended_role', e.target.value)}
            placeholder="Recommended role"
            required
          />
        </div>
        <div className="promotion-form-group">
          <label className="promotion-form-label">Recommended Level</label>
          <input
            type="text"
            className="promotion-form-input"
            value={data.recommended_level || ''}
            onChange={(e) => handleChange('recommended_level', e.target.value)}
            placeholder="Recommended level"
          />
        </div>
      </div>

      <div className="promotion-form-group">
        <label className="promotion-form-label">Priority</label>
        <select
          className="promotion-form-select"
          value={data.priority || 'medium'}
          onChange={(e) => handleChange('priority', e.target.value)}
        >
          {priorities.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      <div className="promotion-form-row">
        <div className="promotion-form-group">
          <label className="promotion-form-label">Current Salary</label>
          <input
            type="number"
            className="promotion-form-input"
            value={data.current_salary || ''}
            onChange={(e) => handleChange('current_salary', e.target.value)}
            placeholder="Current salary"
            min={0}
            step={1000}
          />
        </div>
        <div className="promotion-form-group">
          <label className="promotion-form-label">Proposed Salary</label>
          <input
            type="number"
            className="promotion-form-input"
            value={data.proposed_salary || ''}
            onChange={(e) => handleChange('proposed_salary', e.target.value)}
            placeholder="Proposed salary"
            min={0}
            step={1000}
          />
        </div>
      </div>

      <div className="promotion-form-group">
        <label className="promotion-form-label">Target Promotion Date</label>
        <input
          type="date"
          className="promotion-form-input"
          value={data.target_promotion_date || ''}
          onChange={(e) => handleChange('target_promotion_date', e.target.value)}
          min={new Date().toISOString().split('T')[0]}
        />
      </div>

      <div className="promotion-form-group">
        <label className="promotion-form-label">Justification *</label>
        <textarea
          className="promotion-form-textarea"
          value={data.justification || ''}
          onChange={(e) => handleChange('justification', e.target.value)}
          placeholder="Explain why this promotion is recommended..."
          rows={4}
        />
      </div>

      <div className="promotion-form-group">
        <label className="promotion-form-label">Supporting Evidence</label>
        <textarea
          className="promotion-form-textarea"
          value={data.supporting_evidence || ''}
          onChange={(e) => handleChange('supporting_evidence', e.target.value)}
          placeholder="Provide supporting evidence..."
          rows={3}
        />
      </div>
    </div>
  );
};

export default PromotionForm;