import React, { useState, useEffect } from 'react';

const TeamForm = ({ team, departments, onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    description: '',
    team_lead: '',
  });

  useEffect(() => {
    if (team) {
      setFormData({
        name: team.name || '',
        department: team.department || '',
        description: team.description || '',
        team_lead: team.team_lead || '',
      });
    }
  }, [team]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Team Name *
        </label>
        <input
          type="text"
          name="name"
          required
          value={formData.name}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="e.g., Frontend Team, Sales Team"
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
          Team Lead
        </label>
        <select
          name="team_lead"
          value={formData.team_lead}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">Select Team Lead</option>
          {/* Users will be populated from API */}
        </select>
        <p className="mt-1 text-xs text-gray-500">Optional. Team leads can manage team members.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          name="description"
          rows="3"
          value={formData.description}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="What does this team do?"
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
          {loading ? 'Saving...' : team ? 'Update Team' : 'Create Team'}
        </button>
      </div>
    </form>
  );
};

export default TeamForm;