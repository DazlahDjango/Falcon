import React, { useState, useEffect } from 'react';

const ContactForm = ({ contact, onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    contact_type: 'billing',
    is_primary: false,
    receives_notifications: true,
  });

  useEffect(() => {
    if (contact) {
      setFormData({
        name: contact.name || '',
        email: contact.email || '',
        phone: contact.phone || '',
        position: contact.position || '',
        contact_type: contact.contact_type || 'billing',
        is_primary: contact.is_primary || false,
        receives_notifications: contact.receives_notifications !== false,
      });
    }
  }, [contact]);

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

  const contactTypes = [
    { value: 'primary', label: 'Primary Contact', icon: '⭐', description: 'Main point of contact for all communications' },
    { value: 'billing', label: 'Billing Contact', icon: '💰', description: 'Receives invoices and payment notifications' },
    { value: 'technical', label: 'Technical Contact', icon: '🔧', description: 'Technical support and system updates' },
    { value: 'admin', label: 'Administrative', icon: '👑', description: 'Administrative communications' },
    { value: 'legal', label: 'Legal Contact', icon: '⚖️', description: 'Legal and compliance communications' },
    { value: 'support', label: 'Support Contact', icon: '🆘', description: 'Customer support inquiries' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Contact Type *
        </label>
        <select
          name="contact_type"
          value={formData.contact_type}
          onChange={handleChange}
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          {contactTypes.map(type => (
            <option key={type.value} value={type.value}>
              {type.icon} {type.label} - {type.description}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Full Name *
        </label>
        <input
          type="text"
          name="name"
          required
          value={formData.name}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="John Doe"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Email Address *
        </label>
        <input
          type="email"
          name="email"
          required
          value={formData.email}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="john@example.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Phone Number
        </label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="+1 (555) 000-0000"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Job Position / Title
        </label>
        <input
          type="text"
          name="position"
          value={formData.position}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="CTO, Finance Manager, etc."
        />
      </div>

      <div className="flex items-center space-x-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            name="is_primary"
            checked={formData.is_primary}
            onChange={handleChange}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <span className="ml-2 text-sm text-gray-700">Set as Primary Contact</span>
        </label>

        <label className="flex items-center">
          <input
            type="checkbox"
            name="receives_notifications"
            checked={formData.receives_notifications}
            onChange={handleChange}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <span className="ml-2 text-sm text-gray-700">Receives Email Notifications</span>
        </label>
      </div>

      {formData.is_primary && (
        <div className="bg-purple-50 p-3 rounded-md">
          <p className="text-sm text-purple-800">
            ⭐ This contact will be the primary point of contact for your organisation.
            Only one contact can be primary at a time.
          </p>
        </div>
      )}

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
          {loading ? 'Saving...' : contact ? 'Update Contact' : 'Add Contact'}
        </button>
      </div>
    </form>
  );
};

export default ContactForm;