import React from 'react';
import { Link } from 'react-router-dom';

const OrganisationCard = ({ organisation, onApprove, onSuspend, onActivate, onView }) => {
  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      suspended: 'bg-red-100 text-red-800',
      archived: 'bg-gray-100 text-gray-800',
      trial: 'bg-blue-100 text-blue-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getSectorIcon = (sector) => {
    const icons = {
      commercial: '🏢',
      ngo: '🌍',
      public: '🏛️',
      consulting: '💼',
      education: '📚',
      healthcare: '🏥',
      technology: '💻',
      manufacturing: '🏭',
      retail: '🛍️',
    };
    return icons[sector] || '🏢';
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center text-xl">
              {getSectorIcon(organisation.sector)}
            </div>
          </div>
          <div>
            <h3 className="text-md font-semibold text-gray-900">{organisation.name}</h3>
            <p className="text-sm text-gray-500">{organisation.slug}</p>
            <div className="mt-1 flex items-center space-x-2">
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(organisation.status)}`}>
                {organisation.status}
              </span>
              <span className="text-xs text-gray-400">
                Created: {new Date(organisation.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
        <div className="flex space-x-1">
          <button
            onClick={() => onView(organisation)}
            className="p-1 text-gray-400 hover:text-indigo-600"
            title="View Details"
          >
            👁️
          </button>
          {organisation.status === 'pending' && (
            <button
              onClick={() => onApprove(organisation)}
              className="p-1 text-green-600 hover:text-green-800"
              title="Approve"
            >
              ✅
            </button>
          )}
          {organisation.status === 'active' && (
            <button
              onClick={() => onSuspend(organisation)}
              className="p-1 text-yellow-600 hover:text-yellow-800"
              title="Suspend"
            >
              ⏸️
            </button>
          )}
          {organisation.status === 'suspended' && (
            <button
              onClick={() => onActivate(organisation)}
              className="p-1 text-green-600 hover:text-green-800"
              title="Activate"
            >
              ▶️
            </button>
          )}
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-500">Contact:</span>
            <p className="text-gray-900 truncate">{organisation.contact_email || 'N/A'}</p>
          </div>
          <div>
            <span className="text-gray-500">Phone:</span>
            <p className="text-gray-900">{organisation.contact_phone || 'N/A'}</p>
          </div>
          <div>
            <span className="text-gray-500">Industry:</span>
            <p className="text-gray-900">{organisation.industry || 'N/A'}</p>
          </div>
          <div>
            <span className="text-gray-500">Size:</span>
            <p className="text-gray-900">{organisation.company_size || 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganisationCard;
