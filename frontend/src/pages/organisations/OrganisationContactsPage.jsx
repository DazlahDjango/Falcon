/**
 * Organisation Contacts Page
 * Manage billing, technical, and primary contacts
 */

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchContacts } from '../../services/organisations/api';
import { ContactList } from '../../components/organisations/contacts';

const OrganisationContactsPage = () => {
  const [contacts, setContacts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    fetchContactsData();
  }, []);

  const fetchContactsData = async () => {
    try {
      setLoading(true);
      const response = await fetchContacts();
      setContacts(response.data.results || response.data || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return <ContactList contacts={contacts} onRefresh={fetchContactsData} />;
};

export default OrganisationContactsPage;