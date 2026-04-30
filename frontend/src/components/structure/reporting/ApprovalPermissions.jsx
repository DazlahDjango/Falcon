import React from 'react';
import { CheckCircle, XCircle, Save } from 'lucide-react';

const ApprovalPermissions = ({ reportingLine, onSave, className = '' }) => {
  const [permissions, setPermissions] = React.useState({
    can_approve_kpi: reportingLine?.can_approve_kpi || false,
    can_conduct_review: reportingLine?.can_conduct_review || false,
    can_approve_leave: reportingLine?.can_approve_leave || false,
    can_approve_expenses: reportingLine?.can_approve_expenses || false,
  });
  const [isSaving, setIsSaving] = React.useState(false);
  const hasChanges = () => {
    return (
      permissions.can_approve_kpi !== (reportingLine?.can_approve_kpi || false) ||
      permissions.can_conduct_review !== (reportingLine?.can_conduct_review || false) ||
      permissions.can_approve_leave !== (reportingLine?.can_approve_leave || false) ||
      permissions.can_approve_expenses !== (reportingLine?.can_approve_expenses || false)
    );
  };
  const handleSave = async () => {
    setIsSaving(true);
    await onSave(permissions);
    setIsSaving(false);
  };
  const PermissionToggle = ({ label, field, description }) => (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
      <div>
        <div className="text-sm font-medium text-gray-700">{label}</div>
        {description && <div className="text-xs text-gray-400">{description}</div>}
      </div>
      <button
        onClick={() => setPermissions(prev => ({ ...prev, [field]: !prev[field] }))}
        className={`p-1 rounded-full transition-colors ${
          permissions[field] ? 'text-green-500 hover:text-green-600' : 'text-gray-300 hover:text-gray-400'
        }`}
      >
        {permissions[field] ? <CheckCircle size={20} /> : <XCircle size={20} />}
      </button>
    </div>
  );
  if (!reportingLine) return null;

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      <div className="px-4 py-3 border-b border-gray-200">
        <h4 className="font-medium text-gray-900">Approval Permissions</h4>
        <p className="text-xs text-gray-500 mt-0.5">Configure what this manager can approve</p>
      </div>
      <div className="p-4 space-y-1">
        <PermissionToggle
          label="KPI Entry Approval"
          field="can_approve_kpi"
          description="Can approve/validate KPI entries"
        />
        <PermissionToggle
          label="Performance Review"
          field="can_conduct_review"
          description="Can conduct performance reviews"
        />
        <PermissionToggle
          label="Leave Requests"
          field="can_approve_leave"
          description="Can approve employee leave requests"
        />
        <PermissionToggle
          label="Expense Claims"
          field="can_approve_expenses"
          description="Can approve employee expense claims"
        />
      </div>
      {hasChanges() && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Save size={14} />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}
    </div>
  );
};
export default ApprovalPermissions;