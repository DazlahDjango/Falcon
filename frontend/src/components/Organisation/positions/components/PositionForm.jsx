import React, { useState, useEffect } from 'react';

const PositionForm = ({ position, departments, positions, onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    title: '',
    code: '',
    department: '',
    level: 7,
    is_management: false,
    job_description: '',
    reports_to: '',
  });

  useEffect(() => {
    if (position) {
      setFormData({
        title: position.title || '',
        code: position.code || '',
        department: position.department || '',
        level: position.level || 7,
        is_management: position.is_management || false,
        job_description: position.job_description || '',
        reports_to: position.reports_to || '',
      });
    }
  }, [position]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const levelOptions = [
    { value: 1, label: 'CEO / Executive Director' },
    { value: 2, label: 'Executive / C-Suite' },
    { value: 3, label: 'Director' },
    { value: 4, label: 'Head of Department' },
    { value: 5, label: 'Manager' },
    { value: 6, label: 'Supervisor' },
    { value: 7, label: 'Staff' },
    { value: 8, label: 'Intern / Trainee' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Position Title *
        </label>
        <input
          type="text"
          name="title"
          required
          value={formData.title}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="e.g., Senior Software Engineer, HR Manager"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Position Code
        </label>
        <input
          type="text"
          name="code"
          value={formData.code}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="e.g., SSE, HRM"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Department *
        </label>
        <select
          name="department"
          required
          value={formData.department}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">Select Department</option>
          {departments?.map(dept => (
            <option key={dept.id} value={dept.id}>
              {dept.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Hierarchy Level *
        </label>
        <select
          name="level"
          value={formData.level}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          {levelOptions.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Reports To
        </label>
        <select
          name="reports_to"
          value={formData.reports_to}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">None</option>
          {positions?.filter(p => p.id !== position?.id).map(pos => (
            <option key={pos.id} value={pos.id}>
              {pos.title} ({pos.department_name})
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-gray-500">
          The position this role reports to in the hierarchy
        </p>
      </div>

      <label className="flex items-center">
        <input
          type="checkbox"
          name="is_management"
          checked={formData.is_management}
          onChange={handleChange}
          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
        />
        <span className="ml-2 text-sm text-gray-700">Management Position</span>
      </label>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Job Description
        </label>
        <textarea
          name="job_description"
          rows="4"
          value={formData.job_description}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Describe the responsibilities and requirements for this position"
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : position ? 'Update Position' : 'Create Position'}
        </button>
      </div>
    </form>
  );
};

export default PositionForm;