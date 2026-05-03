import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { Briefcase, Calendar, User, Building2, Users, Edit2, ArrowLeft, Trash2, ChevronRight, Home, RefreshCw } from 'lucide-react';
import { PositionBadge, DepartmentBadge, TeamBadge } from '../../components/structure/common';
import { EmploymentStatusBadge, EmploymentHistory } from '../../components/structure/employment';
import { ConfirmDeleteModal } from '../../components/structure/modals';
import { useEmployment, useEmploymentsByUser, useEmploymentMutations } from '../../hooks/structure';
import { deleteEmployment, fetchEmploymentById } from '../../store/structure';
import { showToast } from '../../store/ui/slices/uiSlice';
import { STRUCTURE_ROUTES } from '../../routes/structure.routes';

const EmploymentDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { data: employment, isLoading, refetch } = useEmployment(id);
  const { data: employmentHistory } = useEmploymentsByUser(employment?.user_id, true);
  const handleBack = () => {
    navigate(STRUCTURE_ROUTES.EMPLOYMENTS);
  };
  const handleEdit = () => {
    navigate(STRUCTURE_ROUTES.EMPLOYMENT_EDIT(id));
  };
  const handleTransfer = () => {
    navigate(STRUCTURE_ROUTES.EMPLOYMENT_TRANSFER(employment?.user_id));
  };
  const handleDelete = async () => {
    await dispatch(deleteEmployment(id)).unwrap();
    navigate(STRUCTURE_ROUTES.EMPLOYMENTS);
  };
  const handleViewUser = () => {
    navigate(`/app/users/${employment?.user_id}`);
  };
  const handleViewPosition = () => {
    navigate(STRUCTURE_ROUTES.POSITION_DETAIL(employment?.position_id));
  };
  const handleViewDepartment = () => {
    navigate(STRUCTURE_ROUTES.DEPARTMENT_DETAIL(employment?.department_id));
  };
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }
  if (!employment) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Employment record not found</p>
        <button onClick={handleBack} className="mt-3 text-blue-600 hover:text-blue-700">
          Back to Employments
        </button>
      </div>
    );
  }
  const isCurrent = employment.is_current && employment.is_active;

  return (
    <div className="p-6">
      <div className="mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <button onClick={() => navigate('/app/structure')} className="hover:text-blue-600">
            <Home size={14} />
          </button>
          <ChevronRight size={12} />
          <button onClick={() => navigate(STRUCTURE_ROUTES.EMPLOYMENTS)} className="hover:text-blue-600">
            Employments
          </button>
          <ChevronRight size={12} />
          <span className="text-gray-900 font-medium">Employment #{employment.id?.slice(0, 8)}</span>
        </div>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-lg ${isCurrent ? 'bg-green-100' : 'bg-gray-100'}`}>
              <Briefcase size={24} className={isCurrent ? 'text-green-600' : 'text-gray-600'} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900">
                  {employment.user_id}
                </h1>
                <EmploymentStatusBadge employment={employment} />
              </div>
              <div className="flex items-center gap-3 mt-2 text-sm">
                <button
                  onClick={handleViewPosition}
                  className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <PositionBadge position={employment.position} size="sm" />
                </button>
                <button
                  onClick={handleViewDepartment}
                  className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <DepartmentBadge department={employment.department} size="sm" />
                </button>
                {employment.team && (
                  <span className="flex items-center gap-1 text-gray-500">
                    <TeamBadge team={employment.team} size="sm" />
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <button
              onClick={handleTransfer}
              className="px-3 py-1.5 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 flex items-center gap-1"
            >
              <RefreshCw size={14} /> Transfer
            </button>
            <button
              onClick={handleEdit}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-1"
            >
              <Edit2 size={14} /> Edit
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-3 py-1.5 border border-red-300 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-1"
            >
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
          <div>
            <div className="text-sm text-gray-500 flex items-center gap-1">
              <User size={14} /> User
            </div>
            <button
              onClick={handleViewUser}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              {employment.user_id}
            </button>
          </div>
          <div>
            <div className="text-sm text-gray-500 flex items-center gap-1">
              <Calendar size={14} /> Effective Period
            </div>
            <div className="font-medium">
              {employment.effective_from ? new Date(employment.effective_from).toLocaleDateString() : 'N/A'}
              {employment.effective_to && ` → ${new Date(employment.effective_to).toLocaleDateString()}`}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Employment Type</div>
            <div className="font-medium capitalize">{employment.employment_type}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Role</div>
            <div className="flex gap-2 mt-1">
              {employment.is_manager && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Manager</span>
              )}
              {employment.is_executive && (
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Executive</span>
              )}
              {employment.is_board_member && (
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Board Member</span>
              )}
            </div>
          </div>
        </div>
        {employment.change_reason && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm">
            <span className="font-medium text-gray-700">Change Reason:</span>
            <span className="text-gray-600 ml-2">{employment.change_reason}</span>
          </div>
        )}
      </div>
      {employmentHistory && employmentHistory.length > 1 && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Calendar size={16} />
              Employment History
            </h2>
          </div>
          <div className="p-4">
            <EmploymentHistory
              employments={employmentHistory}
              onSelectEmployment={(emp) => navigate(STRUCTURE_ROUTES.EMPLOYMENT_DETAIL(emp.id))}
            />
          </div>
        </div>
      )}
      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Employment Record"
        message={`Are you sure you want to delete this employment record for user ${employment.user_id}?`}
        itemName={`Employment - ${employment.user_id}`}
      />
    </div>
  );
};
export default EmploymentDetail;