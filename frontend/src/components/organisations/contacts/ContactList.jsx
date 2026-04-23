import React, { useState, useEffect } from 'react';
import ContactCard from './components/ContactCard';
import ContactForm from './components/ContactForm';
import { contactApi } from '../../../services/organisations';
import toast from 'react-hot-toast';

const ContactList = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const response = await contactApi.getAll();
      setContacts(response.data.results || response.data || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast.error('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingContact(null);
    setShowForm(true);
  };

  const handleEdit = (contact) => {
    setEditingContact(contact);
    setShowForm(true);
  };

  const handleDelete = async (contact) => {
    if (!confirm(`Are you sure you want to delete ${contact.name}?`)) return;
    
    try {
      await contactApi.delete(contact.id);
      toast.success('Contact deleted successfully');
      fetchContacts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Delete failed');
    }
  };

  const handleSetPrimary = async (contact) => {
    try {
      await contactApi.setPrimary(contact.id);
      toast.success(`${contact.name} is now the primary contact`);
      fetchContacts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to set primary contact');
    }
  };

  const handleSubmit = async (formData) => {
    setFormLoading(true);
    try {
      if (editingContact) {
        await contactApi.update(editingContact.id, formData);
        toast.success('Contact updated successfully');
      } else {
        await contactApi.create(formData);
        toast.success('Contact added successfully');
      }
      setShowForm(false);
      setEditingContact(null);
      fetchContacts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Save failed');
    } finally {
      setFormLoading(false);
    }
  };

  const filteredContacts = contacts.filter(contact => {
    if (filter === 'all') return true;
    if (filter === 'primary') return contact.is_primary;
    return contact.contact_type === filter;
  });

  const primaryContact = contacts.find(c => c.is_primary);
  const otherContacts = filteredContacts.filter(c => !c.is_primary);

  const getTypeCount = (type) => {
    return contacts.filter(c => c.contact_type === type).length;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Organisation Contacts</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage billing, technical, and primary contacts for your organisation
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          + Add Contact
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{contacts.length}</p>
          <p className="text-xs text-gray-500">Total Contacts</p>
        </div>
        <div className="bg-purple-50 rounded-lg shadow p-4 text-center">
          <p className="text-2xl font-bold text-purple-600">{getTypeCount('primary')}</p>
          <p className="text-xs text-purple-600">Primary</p>
        </div>
        <div className="bg-green-50 rounded-lg shadow p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{getTypeCount('billing')}</p>
          <p className="text-xs text-green-600">Billing</p>
        </div>
        <div className="bg-blue-50 rounded-lg shadow p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{getTypeCount('technical')}</p>
          <p className="text-xs text-blue-600">Technical</p>
        </div>
        <div className="bg-indigo-50 rounded-lg shadow p-4 text-center">
          <p className="text-2xl font-bold text-indigo-600">{getTypeCount('admin')}</p>
          <p className="text-xs text-indigo-600">Admin</p>
        </div>
        <div className="bg-red-50 rounded-lg shadow p-4 text-center">
          <p className="text-2xl font-bold text-red-600">{getTypeCount('legal')}</p>
          <p className="text-xs text-red-600">Legal</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setFilter('all')}
            className={`pb-3 px-1 border-b-2 font-medium text-sm ${
              filter === 'all'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            All Contacts ({contacts.length})
          </button>
          <button
            onClick={() => setFilter('primary')}
            className={`pb-3 px-1 border-b-2 font-medium text-sm ${
              filter === 'primary'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Primary ({contacts.filter(c => c.is_primary).length})
          </button>
          <button
            onClick={() => setFilter('billing')}
            className={`pb-3 px-1 border-b-2 font-medium text-sm ${
              filter === 'billing'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Billing ({getTypeCount('billing')})
          </button>
          <button
            onClick={() => setFilter('technical')}
            className={`pb-3 px-1 border-b-2 font-medium text-sm ${
              filter === 'technical'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Technical ({getTypeCount('technical')})
          </button>
        </nav>
      </div>

      {/* Primary Contact Section */}
      {primaryContact && filter === 'all' && (
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">⭐ Primary Contact</h2>
          <ContactCard
            contact={primaryContact}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onSetPrimary={handleSetPrimary}
          />
        </div>
      )}

      {/* Other Contacts Section */}
      {otherContacts.length > 0 && (
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            {filter === 'all' ? 'Other Contacts' : 'Contacts'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {otherContacts.map((contact) => (
              <ContactCard
                key={contact.id}
                contact={contact}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onSetPrimary={handleSetPrimary}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {contacts.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No contacts</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by adding your first contact.</p>
          <div className="mt-6">
            <button
              onClick={handleAdd}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              + Add Contact
            </button>
          </div>
        </div>
      )}

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {editingContact ? 'Edit Contact' : 'Add New Contact'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingContact(null);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                ×
              </button>
            </div>
            <ContactForm
              contact={editingContact}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingContact(null);
              }}
              loading={formLoading}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactList;