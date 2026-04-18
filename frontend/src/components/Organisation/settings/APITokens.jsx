import React, { useState, useEffect } from 'react';
import { apiTokenApi } from '../../../services/organisation';
import toast from 'react-hot-toast';

const APITokens = () => {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newToken, setNewToken] = useState({ name: '', expires_in_days: 30, permissions: ['read'] });
  const [generatedToken, setGeneratedToken] = useState(null);

  useEffect(() => {
    fetchTokens();
  }, []);

  const fetchTokens = async () => {
    try {
      setLoading(true);
      const response = await apiTokenApi.getAll();
      setTokens(response.data.results || response.data || []);
    } catch (error) {
      console.error('Error fetching API tokens:', error);
      toast.error('Failed to load API tokens');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateToken = async () => {
    if (!newToken.name) {
      toast.error('Please enter a token name');
      return;
    }
    
    setCreating(true);
    try {
      const response = await apiTokenApi.create(newToken);
      setGeneratedToken(response.data);
      setShowCreateModal(false);
      setNewToken({ name: '', expires_in_days: 30, permissions: ['read'] });
      fetchTokens();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create token');
    } finally {
      setCreating(false);
    }
  };

  const handleRevokeToken = async (tokenId) => {
    if (!confirm('Are you sure you want to revoke this token? This action cannot be undone.')) return;
    
    try {
      await apiTokenApi.revoke(tokenId);
      toast.success('Token revoked successfully');
      fetchTokens();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to revoke token');
    }
  };

  const permissionOptions = [
    { value: 'read', label: 'Read Only' },
    { value: 'write', label: 'Read & Write' },
    { value: 'admin', label: 'Admin' },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">API Tokens</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage API tokens for programmatic access to Falcon PMS
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          + Create Token
        </button>
      </div>

      {generatedToken && (
        <div className="mb-8 bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center space-x-2 text-green-800 mb-2">
            <span className="text-xl">🔑</span>
            <h3 className="font-bold">Token Created Successfully</h3>
          </div>
          <p className="text-sm text-green-700 mb-4">
            Please copy your token now. You won't be able to see it again!
          </p>
          <div className="flex items-center space-x-2 bg-white border rounded p-3 font-mono text-sm overflow-x-auto">
            <span className="flex-1">{generatedToken.token}</span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(generatedToken.token);
                toast.success('Token copied to clipboard');
              }}
              className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
            >
              Copy
            </button>
          </div>
          <button
            onClick={() => setGeneratedToken(null)}
            className="mt-4 text-sm text-green-800 font-medium hover:underline"
          >
            I've saved my token, thanks!
          </button>
        </div>
      )}

      {/* Tokens List */}
      {tokens.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No API tokens</h3>
          <p className="mt-1 text-sm text-gray-500">You haven't created any API tokens yet.</p>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Used</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expires</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tokens.map((token) => (
                <tr key={token.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{token.name}</div>
                    <div className="text-xs text-gray-500">{token.permissions.join(', ')}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {token.last_used_at ? new Date(token.last_used_at).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {token.expires_at ? new Date(token.expires_at).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleRevokeToken(token.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Revoke
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Create API Token</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Token Name</label>
                <input
                  type="text"
                  value={newToken.name}
                  onChange={(e) => setNewToken({ ...newToken, name: e.target.value })}
                  placeholder="e.g. Production Mobile App"
                  className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expires In (Days)</label>
                <select
                  value={newToken.expires_in_days}
                  onChange={(e) => setNewToken({ ...newToken, expires_in_days: parseInt(e.target.value) })}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value={30}>30 Days</option>
                  <option value={90}>90 Days</option>
                  <option value={365}>1 Year</option>
                  <option value={0}>Never Expires</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Permissions</label>
                <div className="flex flex-wrap gap-2">
                  {permissionOptions.map((opt) => (
                    <label key={opt.value} className="flex items-center space-x-2 bg-gray-50 px-3 py-1 rounded border cursor-pointer hover:bg-gray-100">
                      <input
                        type="checkbox"
                        checked={newToken.permissions.includes(opt.value)}
                        onChange={(e) => {
                          const perms = e.target.checked 
                            ? [...newToken.permissions, opt.value]
                            : newToken.permissions.filter(p => p !== opt.value);
                          setNewToken({ ...newToken, permissions: perms });
                        }}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <span className="text-xs text-gray-700">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateToken}
                disabled={creating || !newToken.name}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {creating ? 'Creating...' : 'Create Token'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default APITokens;