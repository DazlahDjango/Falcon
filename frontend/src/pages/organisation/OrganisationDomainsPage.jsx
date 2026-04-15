/**
 * Organisation Domains Page
 * Manage custom domains and SSL certificates
 */

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDomains } from '../../store/organisation/slice/domainSlice';
import { DomainList } from '../../components/Organisation/domains';

const OrganisationDomainsPage = () => {
  const dispatch = useDispatch();
  const { domains, loading } = useSelector((state) => state.domains);

  useEffect(() => {
    dispatch(fetchDomains());
  }, [dispatch]);

  if (loading && !domains.length) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return <DomainList domains={domains} loading={loading} />;
};

export default OrganisationDomainsPage;