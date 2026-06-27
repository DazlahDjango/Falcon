import React from 'react';
import { MFADeviceList } from '../../components/accounts/mfa';

export const MFADevicesPage = () => {
  return (
    <div className="accounts-page mfa-devices-page">
      <MFADeviceList />
    </div>
  );
};
export default MFADevicesPage;