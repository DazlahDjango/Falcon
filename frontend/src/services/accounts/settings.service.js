import { request } from './api/client';

export const getSystemSettings = () => request.get('/system-settings/');

export const updateSystemSettings = (settings) =>
    request.patch('/system-settings/', { settings });

export const resetSystemSettings = () => request.post('/system-settings/reset/');
