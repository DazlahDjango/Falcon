import React from 'react';
import MFADeviceCard from './MFADeviceCard';
import { FiPlus } from 'react-icons/fi';

const MFADeviceList = ({ devices, onRemove, onSetPrimary, onAddDevice }) => {
    const activeDevices = devices.filter(d => d.is_active);
    const inactiveDevices = devices.filter(d => !d.is_active);

    return (
        <div className="mfa-device-list">
            {activeDevices.length > 0 && (
                <>
                    <h3>Active Devices</h3>
                    <div className="devices-grid">
                        {activeDevices.map(device => (
                            <MFADeviceCard
                                key={device.id}
                                device={device}
                                onRemove={onRemove}
                                onSetPrimary={onSetPrimary}
                            />
                        ))}
                    </div>
                </>
            )}

            {inactiveDevices.length > 0 && (
                <>
                    <h3>Inactive Devices</h3>
                    <div className="devices-grid">
                        {inactiveDevices.map(device => (
                            <MFADeviceCard
                                key={device.id}
                                device={device}
                                onRemove={onRemove}
                                onSetPrimary={onSetPrimary}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default MFADeviceList;