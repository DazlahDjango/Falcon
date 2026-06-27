import React from 'react';
import { MFAChallenge } from '../../components/accounts/auth';

export const MFAChallengePage = () => {
  return (
    <div className="accounts-page mfa-challenge-page">
      <MFAChallenge />
    </div>
  );
};
export default MFAChallengePage;