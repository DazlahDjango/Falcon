import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { Briefcase, Users, TrendingUp, Edit2, ArrowLeft, Trash2, ChevronRight, Home, UserPlus } from 'lucide-react';
import { PositionBadge } from '../../components/structure/common';
import { PositionIncumbents, PositionReportingChain, PositionLevelTag } from '../../components/structure/position';
import { ConfirmDeleteModal } from '../../components/structure/modals';
import { usePosition, usePositionIncumbents, usePositionReportingChain, usePositionMutations } from '../../hooks/structure';
import { deletePosition } from '../../store/structure';
import { showToast } from '../../store/ui/slices/uiSlice';
import { STRUCTURE_ROUTES } from '../../routes/structure.routes';

const PositionDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { data: position, isLoading, refetch } = usePosition(id);
  const { data: incumbents, isLoading: isLoadingIncumbents } = usePositionIncumbents(id);
  const { data: reportingChain, isLoading: isLoadingChain } = usePositionReportingChain(id);
  const handleBack = () => {
    navigate(STRUCTURE_ROUTES.POSITIONS);
  };
  const handleEdit = () => {
    navigate(STRUCTURE_ROUTES.POSITION_EDIT(id));
  };
  const handleDelete = async () => {
    await dispatch(deletePosition(id)).unwrap();
    navigate(STRUCTURE_ROUTES.POSITIONS);
  };
  const handleViewIncumbent = (userId) => {
    navigate(`/app/employees/${userId}`);
  };
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
      </div>
    );
  }
  if (!position) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Position not found</p>
        <button onClick={handleBack} className="mt-3 text-purple-600 hover:text-purple-700">
          Back to Positions
        </button>
      </div>
    );
  }
  const isVacant = position.current_incumbents_count === 0;
  const isOverOccupied = position.max_incumbents && position.current_incumbents_count > position.max_incumbents;

  return (
    <div className="p-6">
      <div className="mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <button onClick={() => navigate('/app/structure')} className="hover:text-purple-600">
            <Home size={14} />
          </button>
          <ChevronRight size={12} />
          <button onClick={() => navigate(STRUCTURE_ROUTES.POSITIONS)} className="hover:text-purple-600">
            Positions
          </button>
          <ChevronRight size={12} />
          <span className="text-gray-900 font-medium">{position.title}</span>
        </div>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-lg ${isVacant ? 'bg-amber-100' : 'bg-purple-100'}`}>
              <Briefcase size={24} className={isVacant ? 'text-amber-600' : 'text-purple-600'} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900">{position.title}</h1>
                <PositionBadge position={position} size="lg" />
                <PositionLevelTag level={position.level} grade={position.grade} />
              </div>
              <p className="text-gray-500 mt-1">{position.job_code}</p>
              <div className="flex items-center gap-3 mt-2 text-sm">
                {isVacant ? (
                  <span className="text-amber-600 flex items-center gap-1">
                    <span className="inline-block w-2 h-2 rounded-full bg-amber-500" />
                    Vacant Position
                  </span>
                ) : (
                  <span className="text-green-600 flex items-center gap-1">
                    <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
                    {position.current_incumbents_count} Incumbent{position.current_incumbents_count !== 1 ? 's' : ''}
                  </span>
                )}
                {isOverOccupied && (
                  <span className="text-red-600 flex items-center gap-1">
                    <span className="inline-block w-2 h-2 rounded-full bg-red-500" />
                    Over Capacity
                  </span>
                )}
                {position.reports_to && (
                  <span className="text-gray-500 flex items-center gap-1">
                    <TrendingUp size={14} />
                    Reports to: {position.reports_to.title}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            {isVacant && (
              <button
                onClick={() => navigate(STRUCTURE_ROUTES.EMPLOYMENT_CREATE, { state: { positionId: id } })}
                className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 flex items-center gap-1"
              >
                <UserPlus size={14} /> Fill Position
              </button>
            )}
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
          <div>
            <div className="text-sm text-gray-500">Level</div>
            <div className="text-2xl font-semibold">{position.level}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Grade</div>
            <div className="text-2xl font-semibold">{position.grade || 'N/A'}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Incumbents</div>
            <div className="text-2xl font-semibold">
              {position.current_incumbents_count}
              {position.max_incumbents && ` / ${position.max_incumbents}`}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Single Incumbent</div>
            <div className="text-2xl font-semibold">{position.is_single_incumbent ? 'Yes' : 'No'}</div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Users size={16} />
              Current Incumbents
            </h2>
          </div>
          <div className="p-4">
            {isLoadingIncumbents ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600" />
              </div>
            ) : (
              <PositionIncumbents
                incumbents={incumbents}
                onSelectUser={handleViewIncumbent}
              />
            )}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp size={16} />
              Reporting Chain
            </h2>
          </div>
          <div className="p-4">
            {isLoadingChain ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600" />
              </div>
            ) : (
              <PositionReportingChain
                managers={reportingChain?.managers_above || []}
                subordinates={reportingChain?.subordinates_below || []}
                onSelectPosition={(posId) => navigate(STRUCTURE_ROUTES.POSITION_DETAIL(posId))}
              />
            )}
          </div>
        </div>
      </div>
      {position.required_competencies?.length > 0 && (
        <div className="mt-6 bg-white rounded-lg border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Required Competencies</h2>
          </div>
          <div className="p-4">
            <div className="flex flex-wrap gap-2">
              {position.required_competencies.map((comp, idx) => (
                <div key={idx} className="bg-gray-100 rounded-lg px-3 py-1.5 text-sm">
                  <span className="font-medium">{comp.name}</span>
                  <span className="text-gray-500 ml-2">Level {comp.level}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Position"
        message={`Are you sure you want to delete "${position.title}"?`}
        itemName={position.title}
      />
    </div>
  );
};
export default PositionDetail;