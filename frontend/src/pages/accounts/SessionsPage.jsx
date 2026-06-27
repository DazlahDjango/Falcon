import React from 'react';
import { SessionList } from '../../components/accounts/sessions';

export const SessionsPage = () => {
  return (
    <div className="accounts-page sessions-page">
      <SessionList />
    </div>
  );
};
export default SessionsPage;