// src/store/accounts/hooks/useMFA.js
import { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    // Device Actions
    fetchMfaDevices,
    fetchMfaDevice,
    createMfaDevice,
    updateMfaDevice,
    deleteMfaDevice,
    setPrimaryDevice,

    // TOTP Setup
    setupTotp,
    verifyTotpSetup,

    // Backup Codes
    generateBackupCodes,
    fetchBackupCodesStatus,

    // Status & Analytics
    fetchMfaStatus,
    fetchMfaActivity,
    fetchMfaFailureRate,

    // Disable
    disableMfa,

    // Audit
    fetchMfaAuditLogs,
    fetchMfaAuditLogSummary,

    // Admin
    fetchUserMfaDevices,
    setupUserTotp,
    disableUserMfa,

    // Selectors
    selectMfa,
    clearMfaErrors,
    clearTotpSetup,
    clearBackupCodes,
    resetMfaState,
} from '../../store/accounts/slice/mfaSlice';

export const useMFA = () => {
    const dispatch = useDispatch();

    // SAFE: Provide default state if mfa reducer isn't mounted yet
    const mfaState = useSelector(selectMfa) || {
        devices: [],
        currentDevice: null,
        devicesLoading: false,
        devicesError: null,
        totpSetup: null,
        totpSetupLoading: false,
        totpSetupError: null,
        backupCodes: [],
        backupCodesRemaining: 0,
        backupCodesLoading: false,
        backupCodesError: null,
        status: null,
        statusLoading: false,
        statusError: null,
        activity: [],
        failureRate: null,
        auditLogs: [],
        auditLogSummary: null,
        auditLogsLoading: false,
        auditLogsError: null,
        userDevices: [],
        userDevicesLoading: false,
        isMfaEnabled: false,
    };

    // Local UI state
    const [otpInput, setOtpInput] = useState('');
    const [verifying, setVerifying] = useState(false);
    const [verificationError, setVerificationError] = useState(null);

    // ========== Device Management ==========

    const loadDevices = useCallback(async () => {
        const result = await dispatch(fetchMfaDevices()).unwrap();
        return result;
    }, [dispatch]);

    const loadDevice = useCallback(async (deviceId) => {
        return await dispatch(fetchMfaDevice(deviceId)).unwrap();
    }, [dispatch]);

    const addDevice = useCallback(async (deviceData) => {
        return await dispatch(createMfaDevice(deviceData)).unwrap();
    }, [dispatch]);

    const editDevice = useCallback(async (deviceId, deviceData) => {
        return await dispatch(updateMfaDevice({ deviceId, data: deviceData })).unwrap();
    }, [dispatch]);

    const removeDevice = useCallback(async (deviceId) => {
        return await dispatch(deleteMfaDevice(deviceId)).unwrap();
    }, [dispatch]);

    const setAsPrimary = useCallback(async (deviceId) => {
        return await dispatch(setPrimaryDevice(deviceId)).unwrap();
    }, [dispatch]);

    // ========== TOTP Setup Flow ==========

    const initTotpSetup = useCallback(async (deviceName = 'Authenticator') => {
        dispatch(clearTotpSetup());
        setVerificationError(null);
        return await dispatch(setupTotp(deviceName)).unwrap();
    }, [dispatch]);

    const completeTotpSetup = useCallback(async (otp, deviceId) => {
        setVerifying(true);
        setVerificationError(null);
        try {
            const result = await dispatch(verifyTotpSetup({ otp, deviceId })).unwrap();
            // Refresh after successful setup
            await dispatch(fetchMfaDevices());
            await dispatch(fetchMfaStatus());
            return result;
        } catch (error) {
            setVerificationError(error);
            throw error;
        } finally {
            setVerifying(false);
        }
    }, [dispatch]);

    // ========== Backup Codes ==========

    const generateNewBackupCodes = useCallback(async (count = 10) => {
        const result = await dispatch(generateBackupCodes(count)).unwrap();
        await dispatch(fetchMfaStatus());
        return result;
    }, [dispatch]);

    const getBackupCodesRemaining = useCallback(async () => {
        const result = await dispatch(fetchBackupCodesStatus()).unwrap();
        return result.remaining;
    }, [dispatch]);

    const clearGeneratedBackupCodes = useCallback(() => {
        dispatch(clearBackupCodes());
    }, [dispatch]);

    // ========== MFA Status ==========

    const loadMfaStatus = useCallback(async () => {
        return await dispatch(fetchMfaStatus()).unwrap();
    }, [dispatch]);

    // ========== Activity & Analytics ==========

    const loadActivity = useCallback(async (hours = 24) => {
        return await dispatch(fetchMfaActivity(hours)).unwrap();
    }, [dispatch]);

    const loadFailureRate = useCallback(async (hours = 24) => {
        return await dispatch(fetchMfaFailureRate(hours)).unwrap();
    }, [dispatch]);

    // ========== Disable MFA ==========

    const disableAllMfa = useCallback(async () => {
        const result = await dispatch(disableMfa(null)).unwrap();
        await dispatch(fetchMfaStatus());
        return result;
    }, [dispatch]);

    const disableDeviceMfa = useCallback(async (deviceId) => {
        const result = await dispatch(disableMfa(deviceId)).unwrap();
        await dispatch(fetchMfaDevices());
        await dispatch(fetchMfaStatus());
        return result;
    }, [dispatch]);

    // ========== Audit Logs ==========

    const loadAuditLogs = useCallback(async (params = {}) => {
        return await dispatch(fetchMfaAuditLogs(params)).unwrap();
    }, [dispatch]);

    const loadAuditLogSummary = useCallback(async () => {
        return await dispatch(fetchMfaAuditLogSummary()).unwrap();
    }, [dispatch]);

    // ========== Admin Functions ==========

    const loadUserDevices = useCallback(async (userId) => {
        return await dispatch(fetchUserMfaDevices(userId)).unwrap();
    }, [dispatch]);

    const setupUserTotpMfa = useCallback(async (userId, deviceName = 'Authenticator') => {
        return await dispatch(setupUserTotp({ userId, deviceName })).unwrap();
    }, [dispatch]);

    const disableUserMfaDevice = useCallback(async (userId, deviceId = null) => {
        const result = await dispatch(disableUserMfa({ userId, deviceId })).unwrap();
        await dispatch(fetchUserMfaDevices(userId));
        return result;
    }, [dispatch]);

    // ========== Utility ==========

    const clearErrors = useCallback(() => {
        dispatch(clearMfaErrors());
        setVerificationError(null);
    }, [dispatch]);

    const resetState = useCallback(() => {
        dispatch(resetMfaState());
    }, [dispatch]);

    // ========== Return with safe state access ==========
    return {
        // State - with safe defaults
        devices: mfaState.devices || [],
        currentDevice: mfaState.currentDevice,
        devicesLoading: mfaState.devicesLoading || false,
        devicesError: mfaState.devicesError,

        totpSetup: mfaState.totpSetup,
        totpSetupLoading: mfaState.totpSetupLoading || false,
        totpSetupError: mfaState.totpSetupError,

        backupCodes: mfaState.backupCodes || [],
        backupCodesRemaining: mfaState.backupCodesRemaining || 0,
        backupCodesLoading: mfaState.backupCodesLoading || false,
        backupCodesError: mfaState.backupCodesError,

        status: mfaState.status,
        statusLoading: mfaState.statusLoading || false,
        isMfaEnabled: mfaState.isMfaEnabled || false,

        activity: mfaState.activity || [],
        failureRate: mfaState.failureRate,

        auditLogs: mfaState.auditLogs || [],
        auditLogSummary: mfaState.auditLogSummary,
        auditLogsLoading: mfaState.auditLogsLoading || false,

        userDevices: mfaState.userDevices || [],
        userDevicesLoading: mfaState.userDevicesLoading || false,

        // UI State
        otpInput,
        setOtpInput,
        verifying,
        verificationError,

        // Actions - Device Management
        loadDevices,
        loadDevice,
        addDevice,
        editDevice,
        removeDevice,
        setAsPrimary,

        // Actions - TOTP Setup
        initTotpSetup,
        completeTotpSetup,

        // Actions - Backup Codes
        generateNewBackupCodes,
        getBackupCodesRemaining,
        clearGeneratedBackupCodes,

        // Actions - Status
        loadMfaStatus,

        // Actions - Activity
        loadActivity,
        loadFailureRate,

        // Actions - Disable
        disableAllMfa,
        disableDeviceMfa,

        // Actions - Audit
        loadAuditLogs,
        loadAuditLogSummary,

        // Actions - Admin
        loadUserDevices,
        setupUserTotpMfa,
        disableUserMfaDevice,

        // Utilities
        clearErrors,
        resetState,
    };
};