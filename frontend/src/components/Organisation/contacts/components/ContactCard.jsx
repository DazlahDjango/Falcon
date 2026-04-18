import React from 'react';

const ContactCard = ({ contact, onEdit, onDelete, onSetPrimary }) => {
  const getTypeIcon = (type) => {
    const icons = {
      primary: '⭐',
      billing: '💰',
      technical: '🔧',
      admin: '👑',
      legal: '⚖️',
      support: '🆘',
    };
    return icons[type] || '📧';
  };

  const getTypeColor = (type) => {
    const colors = {
      primary: 'bg-purple-100 text-purple-800',
      billing: 'bg-green-100 text-green-800',
      technical: 'bg-blue-100 text-blue-800',
      admin: 'bg-indigo-100 text-indigo-800',
      legal: 'bg-red-100 text-red-800',
      support: 'bg-yellow-100 text-yellow-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
              <span className="text-indigo-600 font-semibold">
                {contact.name?.charAt(0) || '?'}
              </span>
            </div>
          </div>
          <div>
            <h3 className="text-md font-medium text-gray-900">{contact.name}</h3>
            <p className="text-sm text-gray-500">{contact.position || 'No position'}</p>
            <div className="mt-1 flex items-center space-x-2">
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getTypeColor(contact.contact_type)}`}>
                {getTypeIcon(contact.contact_type)} {contact.contact_type_display || contact.contact_type}
              </span>
              {contact.is_primary && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                  ⭐ Primary
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          {!contact.is_primary && (
            <button
              onClick={() => onSetPrimary(contact)}
              className="text-purple-600 hover:text-purple-900 text-sm"
              title="Set as Primary"
            >
              ⭐
            </button>
          )}
          <button
            onClick={() => onEdit(contact)}
            className="text-indigo-600 hover:text-indigo-900 text-sm"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(contact)}
            className="text-red-600 hover:text-red-900 text-sm"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center text-sm text-gray-500">
          <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <a href={`mailto:${contact.email}`} className="hover:text-indigo-600">
            {contact.email}
          </a>
        </div>
        {contact.phone && (
          <div className="flex items-center text-sm text-gray-500 mt-1">
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <a href={`tel:${contact.phone}`} className="hover:text-indigo-600">
              {contact.phone}
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactCard;