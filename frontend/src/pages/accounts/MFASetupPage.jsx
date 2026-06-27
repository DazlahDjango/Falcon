import React from 'react';
import { MFASetupWizard } from '../../components/accounts/auth';

export const MFASetupPage = () => {
  return (
    <div className="accounts-page mfa-setup-page">
      <MFASetupWizard />
    </div>
  );
};
export default MFASetupPage;