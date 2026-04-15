import React, { useState, useEffect } from 'react';
import DepartmentCard from './components/DepartmentCard';
import DepartmentForm from './components/DepartmentForm';
import { departmentApi } from '../../../services/organisation';
import toast from 'react-hot-toast';

const DepartmentManager = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'tree'

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await departmentApi.getAll();
      setDepartments(response.data.results || response.data || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
      toast.error('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingDepartment(null);
    setShowForm(true);
  };

  const handleEdit = (department) => {
    setEditingDepartment(department);
    setShowForm(true);
  };

  const handleDelete = async (department) => {
    if (!confirm(`Are you sure you want to delete ${department.name}?`)) return;
    try {
      await departmentApi.delete(department.id);
      toast.success('Department deleted successfully');
      fetchDepartments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Delete failed');
    }
  };

  const handleSubmit = async (formData) => {
    setFormLoading(true);
    try {
      if (editingDepartment) {
        await departmentApi.update(editingDepartment.id, formData);
        toast.success('Department updated successfully');
      } else {
        await departmentApi.create(formData);
        toast.success('Department created successfully');
      }
      setShowForm(false);
      setEditingDepartment(null);
      fetchDepartments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Save failed');
    } finally {
      setFormLoading(false);
    }
  };

  const handleViewSubDepartments = (department) => {
    const subDepts = departments.filter(d => d.parent === department.id);
    if (subDepts.length === 0) {
      toast.info(`${department.name} has no sub-departments`);
    } else {
      toast.success(`${department.name} has ${subDepts.length} sub-department(s)`);
    }
  };

  const rootDepartments = departments.filter(d => !d.parent);
  const getSubDepartments = (parentId) => departments.filter(d => d.parent === parentId);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Departments</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your organisation's departments and hierarchy
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setViewMode(viewMode === 'list' ? 'tree' : 'list')}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
          >
            {viewMode === 'list' ? '🌳 Tree View' : '📋 List View'}
          </button>
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            + Add Department
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{departments.length}</p>
          <p className="text-xs text-gray-500">Total Departments</p>
        </div>
        <div className="bg-green-50 rounded-lg shadow p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{rootDepartments.length}</p>
          <p className="text-xs text-green-600">Top Level</p>
        </div>
        <div className="bg-blue-50 rounded-lg shadow p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">
            {departments.filter(d => d.manager).length}
          </p>
          <p className="text-xs text-blue-600">With Managers</p>
        </div>
      </div>

      {/* Department List */}
      {departments.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No departments</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating your first department.</p>
        </div>
      ) : viewMode === 'list' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {departments.map((dept) => (
            <DepartmentCard
              key={dept.id}
              department={dept}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onViewSubDepartments={handleViewSubDepartments}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {rootDepartments.map((dept) => (
            <DepartmentTree
              key={dept.id}
              department={dept}
              departments={departments}
              getSubDepartments={getSubDepartments}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {editingDepartment ? 'Edit Department' : 'Add New Department'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingDepartment(null);
                }}
                className="text-gray-400 hover:text-gray-500 text-2xl"
              >
                ×
              </button>
            </div>
            <DepartmentForm
              department={editingDepartment}
              departments={departments}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingDepartment(null);
              }}
              loading={formLoading}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentManager;

// Department Tree Component for Tree View
const DepartmentTree = ({ department, departments, getSubDepartments, onEdit, onDelete, level = 0 }) => {
  const [expanded, setExpanded] = useState(true);
  const subDepartments = getSubDepartments(department.id);

  return (
    <div className="ml-4" style={{ marginLeft: level * 20 }}>
      <div className="border border-gray-200 rounded-lg p-3 mb-2 hover:bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {subDepartments.length > 0 && (
              <button onClick={() => setExpanded(!expanded)} className="text-gray-500">
                {expanded ? '▼' : '▶'}
              </button>
            )}
            <span className="font-medium">{department.name}</span>
            {department.code && <span className="text-xs text-gray-400">({department.code})</span>}
          </div>
          <div className="flex space-x-1">
            <button onClick={() => onEdit(department)} className="text-indigo-600 hover:text-indigo-800 text-sm">
              Edit
            </button>
            <button onClick={() => onDelete(department)} className="text-red-600 hover:text-red-800 text-sm">
              Delete
            </button>
          </div>
        </div>
      </div>
      {expanded && subDepartments.length > 0 && (
        <div className="ml-4">
          {subDepartments.map((subDept) => (
            <DepartmentTree
              key={subDept.id}
              department={subDept}
              departments={departments}
              getSubDepartments={getSubDepartments}
              onEdit={onEdit}
              onDelete={onDelete}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};