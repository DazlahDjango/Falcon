import React, { useState, useEffect } from 'react';
import PositionCard from './components/PositionCard';
import PositionForm from './components/PositionForm';
import PositionHierarchyModal from './components/PositionHierarchyModal';
import { positionApi, departmentApi } from '../../../services/organisation';
import toast from 'react-hot-toast';

const PositionManager = () => {
  const [positions, setPositions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPosition, setEditingPosition] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [showHierarchyModal, setShowHierarchyModal] = useState(false);
  const [filter, setFilter] = useState('all'); // all, management, non-management
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [positionsRes, deptsRes] = await Promise.all([
        positionApi.getAll(),
        departmentApi.getAll(),
      ]);
      setPositions(positionsRes.data.results || positionsRes.data || []);
      setDepartments(deptsRes.data.results || deptsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load positions');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingPosition(null);
    setShowForm(true);
  };

  const handleEdit = (position) => {
    setEditingPosition(position);
    setShowForm(true);
  };

  const handleDelete = async (position) => {
    if (!confirm(`Are you sure you want to delete ${position.title}?`)) return;
    try {
      await positionApi.delete(position.id);
      toast.success('Position deleted successfully');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Delete failed');
    }
  };

  const handleViewHierarchy = (position) => {
    setSelectedPosition(position);
    setShowHierarchyModal(true);
  };

  const handleSubmit = async (formData) => {
    setFormLoading(true);
    try {
      if (editingPosition) {
        await positionApi.update(editingPosition.id, formData);
        toast.success('Position updated successfully');
      } else {
        await positionApi.create(formData);
        toast.success('Position created successfully');
      }
      setShowForm(false);
      setEditingPosition(null);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Save failed');
    } finally {
      setFormLoading(false);
    }
  };

  const filteredPositions = positions.filter(pos => {
    if (filter === 'management') return pos.is_management;
    if (filter === 'non-management') return !pos.is_management;
    return true;
  }).filter(pos => {
    if (selectedDepartment === 'all') return true;
    return pos.department === selectedDepartment;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Positions</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage job positions and reporting hierarchy
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          + Add Position
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{positions.length}</p>
          <p className="text-xs text-gray-500">Total Positions</p>
        </div>
        <div className="bg-purple-50 rounded-lg shadow p-4 text-center">
          <p className="text-2xl font-bold text-purple-600">
            {positions.filter(p => p.is_management).length}
          </p>
          <p className="text-xs text-purple-600">Management</p>
        </div>
        <div className="bg-gray-50 rounded-lg shadow p-4 text-center">
          <p className="text-2xl font-bold text-gray-600">
            {positions.filter(p => !p.is_management).length}
          </p>
          <p className="text-xs text-gray-600">Non-Management</p>
        </div>
        <div className="bg-blue-50 rounded-lg shadow p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{departments.length}</p>
          <p className="text-xs text-blue-600">Departments</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-md text-sm ${
              filter === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('management')}
            className={`px-3 py-1 rounded-md text-sm ${
              filter === 'management'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Management
          </button>
          <button
            onClick={() => setFilter('non-management')}
            className={`px-3 py-1 rounded-md text-sm ${
              filter === 'non-management'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Non-Management
          </button>
        </div>

        <select
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
          className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="all">All Departments</option>
          {departments.map(dept => (
            <option key={dept.id} value={dept.id}>{dept.name}</option>
          ))}
        </select>
      </div>

      {/* Position List */}
      {filteredPositions.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No positions found</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating your first position.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPositions.map((position) => (
            <PositionCard
              key={position.id}
              position={position}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onViewHierarchy={handleViewHierarchy}
            />
          ))}
        </div>
      )}

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {editingPosition ? 'Edit Position' : 'Add New Position'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingPosition(null);
                }}
                className="text-gray-400 hover:text-gray-500 text-2xl"
              >
                ×
              </button>
            </div>
            <PositionForm
              position={editingPosition}
              departments={departments}
              positions={positions}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingPosition(null);
              }}
              loading={formLoading}
            />
          </div>
        </div>
      )}

      {/* Hierarchy Modal */}
      {showHierarchyModal && (
        <PositionHierarchyModal
          position={selectedPosition}
          positions={positions}
          onClose={() => {
            setShowHierarchyModal(false);
            setSelectedPosition(null);
          }}
        />
      )}
    </div>
  );
};

export default PositionManager;