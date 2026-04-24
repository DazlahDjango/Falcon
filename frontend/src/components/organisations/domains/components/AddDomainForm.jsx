import React, { useState } from 'react';

const AddDomainForm = ({ onSubmit, onCancel, loading }) => {
  const [domainName, setDomainName] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ domain_name: domainName, is_primary: isPrimary });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Domain Name *
        </label>
        <input
          type="text"
          value={domainName}
          onChange={(e) => setDomainName(e.target.value)}
          placeholder="pms.yourcompany.com"
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
        <p className="mt-1 text-xs text-gray-500">
          Enter the full domain name you want to use for Falcon PMS
        </p>
      </div>

      <label className="flex items-center">
        <input
          type="checkbox"
          checked={isPrimary}
          onChange={(e) => setIsPrimary(e.target.checked)}
          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
        />
        <span className="ml-2 text-sm text-gray-700">Set as primary domain</span>
      </label>

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
          {loading ? 'Adding...' : 'Add Domain'}
        </button>
      </div>
    </form>
  );
};

export default AddDomainForm;