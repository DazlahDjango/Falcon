import React from 'react';

const DomainCard = ({ domain, onVerify, onSetPrimary, onDelete }) => {
  const getVerificationStatusColor = (status) => {
    const colors = {
      verified: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getSSLStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      expired: 'bg-red-100 text-red-800',
      failed: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h3 className="text-md font-semibold text-gray-900">{domain.domain_name}</h3>
            {domain.is_primary && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                ⭐ Primary
              </span>
            )}
          </div>
          
          <div className="mt-2 flex items-center space-x-3">
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getVerificationStatusColor(domain.verification_status)}`}>
              {domain.verification_status === 'verified' ? '✅ Verified' : 
               domain.verification_status === 'pending' ? '⏳ Pending' : '❌ Failed'}
            </span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getSSLStatusColor(domain.ssl_status)}`}>
              🔒 SSL: {domain.ssl_status}
            </span>
          </div>
        </div>
        
        <div className="flex space-x-2">
          {domain.verification_status !== 'verified' && (
            <button
              onClick={() => onVerify(domain)}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Verify
            </button>
          )}
          {!domain.is_primary && domain.verification_status === 'verified' && (
            <button
              onClick={() => onSetPrimary(domain)}
              className="px-3 py-1 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              Set Primary
            </button>
          )}
          <button
            onClick={() => onDelete(domain)}
            className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>

      {domain.verification_status === 'pending' && (
        <div className="mt-3 p-3 bg-yellow-50 rounded-md">
          <p className="text-sm text-yellow-800 mb-2">
            To verify this domain, add the following TXT record to your DNS:
          </p>
          <div className="bg-white p-2 rounded border border-yellow-200 font-mono text-xs break-all">
            Name: _falcon-verify.{domain.domain_name}<br />
            Value: {domain.verification_token}<br />
            Type: TXT
          </div>
        </div>
      )}

      {domain.ssl_status === 'expired' && (
        <div className="mt-3 p-3 bg-red-50 rounded-md">
          <p className="text-sm text-red-800">
            ⚠️ SSL certificate has expired. Please renew to ensure secure connection.
          </p>
        </div>
      )}
    </div>
  );
};

export default DomainCard;