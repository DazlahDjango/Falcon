import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { Building2, Users, Layers, Edit2, ArrowLeft, Trash2, ChevronRight, Home } from 'lucide-react';
import { DepartmentBadge, HierarchyPath } from '../../components/structure/common';
import { DepartmentTreeView, DepartmentMoveModal, DepartmentStats } from '../../components/structure/department';
import { ConfirmDeleteModal } from '../../components/structure/modals';
import TeamList from './TeamList'; 
import { useDepartment, useDepartmentMutations, useDepartmentRelations } from '../../hooks/structure';
import { fetchDepartmentById, deleteDepartment, moveDepartment } from '../../store/structure';
import { STRUCTURE_ROUTES } from '../../routes/structure.routes';

const DepartmentDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { data: department, isLoading, refetch } = useDepartment(id);
  const { data: ancestors } = useDepartmentRelations(id);
  const { children, branch } = useDepartmentRelations(id);
  const handleBack = () => {
    navigate(STRUCTURE_ROUTES.DEPARTMENTS);
  };
  const handleEdit = () => {
    navigate(STRUCTURE_ROUTES.DEPARTMENT_EDIT(id));
  };
  const handleMove = () => {
    setShowMoveModal(true);
  };
  const handleMoveConfirm = async (departmentId, newParentId) => {
    await dispatch(moveDepartment({ id: departmentId, parentId: newParentId })).unwrap();
    setShowMoveModal(false);
    refetch();
  };
  const handleDelete = async () => {
    await dispatch(deleteDepartment(id)).unwrap();
    navigate(STRUCTURE_ROUTES.DEPARTMENTS);
  };
  const handleTeamClick = (teamId) => {
    navigate(STRUCTURE_ROUTES.TEAM_DETAIL(teamId));
  };
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }
  if (!department) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Department not found</p>
        <button onClick={handleBack} className="mt-3 text-blue-600 hover:text-blue-700">
          Back to Departments
        </button>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      <div className="mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <button onClick={() => navigate('/app/structure')} className="hover:text-blue-600">
            <Home size={14} />
          </button>
          <ChevronRight size={12} />
          <button onClick={() => navigate(STRUCTURE_ROUTES.DEPARTMENTS)} className="hover:text-blue-600">
            Departments
          </button>
          <ChevronRight size={12} />
          <span className="text-gray-900 font-medium">{department.name}</span>
        </div>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Building2 size={24} className="text-blue-600" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900">{department.name}</h1>
                <DepartmentBadge department={department} size="lg" />
              </div>
              <p className="text-gray-500 mt-1">{department.description || 'No description'}</p>
              {ancestors?.data && ancestors.data.length > 0 && (
                <div className="mt-2">
                  <HierarchyPath
                    path={[...ancestors.data, department]}
                    onNavigate={(item) => navigate(STRUCTURE_ROUTES.DEPARTMENT_DETAIL(item.id))}
                  />
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <button
              onClick={handleEdit}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-1"
            >
              <Edit2 size={14} /> Edit
            </button>
            <button
              onClick={handleMove}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-1"
            >
              <Layers size={14} /> Move
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-3 py-1.5 border border-red-300 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-1"
            >
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </div>
        <DepartmentStats 
          department={department}
          showDetails={true}
        />
      </div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Sub-departments</h2>
        {children.data && children.data.length > 0 ? (
          <DepartmentTreeView
            departments={children.data}
            onSelectDepartment={(dept) => navigate(STRUCTURE_ROUTES.DEPARTMENT_DETAIL(dept.id))}
          />
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-500">No sub-departments</p>
            <button
              onClick={() => navigate(STRUCTURE_ROUTES.DEPARTMENT_CREATE, { state: { parentId: id } })}
              className="mt-2 text-sm text-blue-600 hover:text-blue-700"
            >
              Create sub-department →
            </button>
          </div>
        )}
      </div>
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Teams</h2>
        <TeamList
          departmentId={id}
          onTeamClick={handleTeamClick}
          limit={10}
        />
      </div>
      <DepartmentMoveModal
        isOpen={showMoveModal}
        onClose={() => setShowMoveModal(false)}
        department={department}
        departments={branch.data}
        onConfirm={handleMoveConfirm}
      />
      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Department"
        message={`Are you sure you want to delete "${department.name}"?`}
        itemName={department.name}
      />
    </div>
  );
};
export default DepartmentDetail;