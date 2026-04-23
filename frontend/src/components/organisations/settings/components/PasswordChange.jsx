import React, { useState } from 'react';
import toast from 'react-hot-toast';

const PasswordChange = ({ onChangePassword }) => {
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error for this field
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.current_password) {
      newErrors.current_password = 'Current password is required';
    }
    if (!formData.new_password) {
      newErrors.new_password = 'New password is required';
    } else if (formData.new_password.length < 8) {
      newErrors.new_password = 'Password must be at least 8 characters';
    }
    if (formData.new_password !== formData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await onChangePassword(formData);
      toast.success('Password changed successfully');
      setFormData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Current Password
        </label>
        <input
          type="password"
          name="current_password"
          value={formData.current_password}
          onChange={handleChange}
          className={`mt-1 block w-full border ${errors.current_password ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
        />
        {errors.current_password && (
          <p className="mt-1 text-xs text-red-500">{errors.current_password}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          New Password
        </label>
        <input
          type="password"
          name="new_password"
          value={formData.new_password}
          onChange={handleChange}
          className={`mt-1 block w-full border ${errors.new_password ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
        />
        {errors.new_password && (
          <p className="mt-1 text-xs text-red-500">{errors.new_password}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Password must be at least 8 characters
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Confirm New Password
        </label>
        <input
          type="password"
          name="confirm_password"
          value={formData.confirm_password}
          onChange={handleChange}
          className={`mt-1 block w-full border ${errors.confirm_password ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
        />
        {errors.confirm_password && (
          <p className="mt-1 text-xs text-red-500">{errors.confirm_password}</p>
        )}
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Changing...' : 'Change Password'}
        </button>
      </div>
    </form>
  );
};

export default PasswordChange;